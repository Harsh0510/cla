import path from "path";
import os from "os";
import fs from "fs/promises";

import AzureFile from "@azure/storage-file-share";
import { ContainerClient } from "@azure/storage-blob";
import pg from "pg";

import getPdfPageCount from "./getPdfPageCount";
import generatePdfThumbnail from "./generatePdfThumbnail";
import resizeImage from "./resizeImage";
import getPdfColorScale from "./getPdfColorScale";
import getPdfTextCharCount from "./getPdfTextCharCount";

interface IParams {
	isbn: string;
	pdfPath: string;
	coverImagePath?: string | null | undefined;
	containers: {
		rawCoverPages: ContainerClient;
		coverPages: ContainerClient;
		rawUploads: ContainerClient;
		pageCounts: ContainerClient;
	};
	pool: pg.Pool;
	workbenchRootDirectoryClient: AzureFile.ShareDirectoryClient;
	binaries: {
		ghostscript: string;
		pdftotext: string;
		convert: string;
		pngquant: string;
	};
}

export default async (params: IParams) => {
	let localPdfPath: string | null = null;
	let localTmpCoverImagePath: string | null = null;
	let localCoverImagePath: string | null = null;
	let localRawCoverImagePath: string | null = null;
	const tmpDir = os.tmpdir();
	try {
		localPdfPath = path.join(tmpDir, params.isbn + ".pdf");
		await params.workbenchRootDirectoryClient.getFileClient(params.pdfPath).downloadToFile(localPdfPath);
		localTmpCoverImagePath = await (async () => {
			if (!params.coverImagePath) {
				const ret = path.join(tmpDir, params.isbn + ".tmp.png");
				await generatePdfThumbnail(params.binaries.ghostscript, localPdfPath, ret);
				return ret;
			}
			const ret = path.join(tmpDir, params.isbn + ".tmp" + path.extname(params.coverImagePath));
			await params.workbenchRootDirectoryClient.getFileClient(params.coverImagePath).downloadToFile(ret);
			return ret;
		})();
		localCoverImagePath = path.join(tmpDir, params.isbn + ".png");
		await resizeImage(
			params.binaries.convert,
			params.binaries.pngquant,
			localTmpCoverImagePath,
			{ width: 300, height: 300 },
			localCoverImagePath
		);
		localRawCoverImagePath = path.join(tmpDir, params.isbn + ".raw.png");
		await resizeImage(
			params.binaries.convert,
			params.binaries.pngquant,
			localTmpCoverImagePath,
			{ width: 2000, height: 2000 },
			localRawCoverImagePath
		);
		const pageCount = await getPdfPageCount(params.binaries.ghostscript, localPdfPath);
		const colorScale = await getPdfColorScale(params.binaries.ghostscript, localPdfPath, pageCount);
		const textByteCount = await getPdfTextCharCount(params.binaries.pdftotext, localPdfPath);
		const isOcr = textByteCount > pageCount * 30;

		await params.containers.rawUploads.getBlockBlobClient(params.isbn + ".pdf").uploadFile(localPdfPath, {
			blobHTTPHeaders: {
				blobContentType: "application/pdf",
			},
		});
		await params.containers.rawCoverPages.getBlockBlobClient(params.isbn + ".png").uploadFile(localRawCoverImagePath, {
			blobHTTPHeaders: {
				blobContentType: "image/png",
			},
		});
		await params.containers.coverPages.getBlockBlobClient(params.isbn + ".png").uploadFile(localCoverImagePath, {
			blobHTTPHeaders: {
				blobContentType: "image/png",
			},
		});
		await params.containers.pageCounts
			.getBlockBlobClient(params.isbn + ".txt")
			.uploadData(Buffer.from(pageCount.toString()), {
				blobHTTPHeaders: {
					blobContentType: "text/plain",
				},
			});
		await params.pool.query(
			`
				INSERT INTO
					asset_metadata
					(
						isbn,
						page_count,
						color_scale,
						ocr
					)
				VALUES
					(
						$1,
						$2,
						$3,
						$4
					)
				ON CONFLICT
					(isbn)
				DO UPDATE SET
					date_edited = NOW(),
					page_count = EXCLUDED.page_count,
					color_scale = EXCLUDED.color_scale,
					ocr = EXCLUDED.ocr
			`,
			[params.isbn, pageCount, colorScale, isOcr]
		);
	} finally {
		if (localPdfPath) {
			try {
				await fs.unlink(localPdfPath);
			} catch {}
		}
		if (localTmpCoverImagePath) {
			try {
				await fs.unlink(localTmpCoverImagePath);
			} catch {}
		}
		if (localCoverImagePath) {
			try {
				await fs.unlink(localCoverImagePath);
			} catch {}
		}
		if (localRawCoverImagePath) {
			try {
				await fs.unlink(localRawCoverImagePath);
			} catch {}
		}
	}
};
