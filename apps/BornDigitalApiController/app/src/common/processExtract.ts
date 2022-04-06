import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

import IExtract from "./IExtract";
import blobService from "./blobService";
import { TQuerier } from "./TQuerier";
import log from "./log";

import exec from "./exec";
import * as storageContainers from "./storageContainers";

const bsRawUploads = blobService.getContainerClient(storageContainers.rawUploads);
const bsExtracts = blobService.getContainerClient(storageContainers.extracts);

export default async (querier: TQuerier, record: IExtract, requestId?: string | null | undefined): Promise<boolean> => {
	const start = Date.now();
	requestId = requestId || crypto.randomBytes(18).toString("base64");
	await log({
		message: "async extract processing - begin",
		request_id: requestId,
		extract_id: record.id,
	});
	// check to make sure extract is still unstarted, and mark it as 'running'
	const res = await querier(
		`
			UPDATE
				born_digital_extract
			SET
				status = 'running'
			WHERE
				id = $1
				AND (
					status = 'unstarted'
					OR (
						status = 'running'
						AND date_began_running + INTERVAL '2 hours' < NOW()
					)
				)
			RETURNING
				id
		`,
		[record.id]
	);
	if (!res.rowCount) {
		// another process got to it before we did!
		await log({
			message: "async extract processing - complete - intercepted",
			request_id: requestId,
			extract_id: record.id,
			time_taken_ms: Date.now() - start,
		});
		return false;
	}

	let error: Error | null = null;
	let pdfPath: string | null = null;
	let outputPath: string | null = null;

	try {
		// download pdf from Azure
		const bb = bsRawUploads.getBlockBlobClient(record.isbn + ".pdf");
		const fragment = crypto.randomBytes(8).toString("hex");
		pdfPath = path.join("/tmp", "bdapi-" + record.isbn + "-" + record.id + "-" + fragment + ".pdf");
		await bb.downloadToFile(pdfPath);

		// generate PDF extract
		const pageList = record.pages.map((p) => p + 1).join(",");
		outputPath = pdfPath + ".tmp.pdf";
		await exec("gs", [
			"-sDEVICE=pdfwrite",
			"-dNOPAUSE",
			"-dBATCH",
			"-dSAFER",
			"-dNumRenderingThreads=1",
			"-sPageList=" + pageList,
			"-sOutputFile=" + outputPath,
			pdfPath,
		]);

		// upload PDF to Azure
		await bsExtracts.getBlockBlobClient(record.name).uploadFile(outputPath);
	} catch (e) {
		error = e as Error;
		throw e;
	} finally {
		// delete local PDFs
		if (pdfPath) {
			try {
				await fs.unlink(pdfPath);
			} catch {}
		}
		if (outputPath) {
			try {
				await fs.unlink(outputPath);
			} catch {}
		}

		// update DB to mark extract as completed
		await querier(
			`
				UPDATE
					born_digital_extract
				SET
					status = 'completed',
					error = $1
				WHERE
					id = $2
					AND status = 'running'
			`,
			[error?.message || null, record.id]
		);
		await log({
			message: "async extract processing - complete - " + (error ? "error" : "success"),
			request_id: requestId,
			extract_id: record.id,
			time_taken_ms: Date.now() - start,
			exception_message: error?.message,
			exception_stack: error?.stack,
		});
	}
	return true;
};
