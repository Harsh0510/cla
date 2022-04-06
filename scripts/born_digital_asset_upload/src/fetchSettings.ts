import path from "path";
import fs from "fs/promises";
import assert from "assert/strict";

import dotenv from "dotenv";

export const getEnvFileContents = async (startDir: string) => {
	let curr = startDir;
	while (curr) {
		const p = path.join(curr, ".env");
		try {
			return await fs.readFile(p);
		} catch {}
		if (curr === "/") {
			break;
		}
		curr = path.dirname(curr);
	}
	return null;
};

export interface ISettings {
	stages: {
		metadataUpsert: boolean;
		metadataActivate: boolean;
		pdfs: boolean;
	};
	metadata: {
		url: string;
		revisionOld?: string | undefined | null;
		revisionNew: string;
		filter?: string | undefined;
	};
	binaries: {
		ghostscript: string;
		pdftotext: string;
		convert: string; // imagemagick
		pngquant: string;
	};
	filePrefixFilter?: string | undefined;
	storageAccountConnectionString: string;
	pdfMaxProcessCount: number;
	concurrency: number;
	randomizePdfs: boolean;
	db: {
		connectionString: string;
	};
	workbench: {
		connectionString: string;
		pdfPath: string;
		coverImagePath: string;
	};
}

const isYes = (v?: string | null | undefined): boolean => {
	if (!v) {
		return false;
	}
	return v === "1" || v === "y" || v === "Y" || v === "t" || v === "T" || v === "true" || v === "TRUE";
};

export default async (): Promise<ISettings> => {
	const contents = await getEnvFileContents(__dirname);
	const settings = { ...process.env };
	if (contents) {
		Object.assign(settings, dotenv.parse(contents));
	}

	assert(settings["BD_METADATA_GIT_URL"], "BD_METADATA_GIT_URL not provided");
	assert(settings["BD_METADATA_GIT_REVISION_NEW"], "BD_METADATA_GIT_REVISION_NEW not provided");
	assert(settings["BD_BINARY_PATH_GHOSTSCRIPT"], "BD_BINARY_PATH_GHOSTSCRIPT not provided");
	assert(settings["BD_BINARY_PATH_PDFTOTEXT"], "BD_BINARY_PATH_PDFTOTEXT not provided");
	assert(settings["BD_BINARY_PATH_CONVERT"], "BD_BINARY_PATH_CONVERT not provided");
	assert(settings["BD_BINARY_PATH_PNGQUANT"], "BD_BINARY_PATH_PNGQUANT not provided");
	assert(settings["BD_STORAGE_ACCOUNT_CONNECTION_STRING"], "BD_STORAGE_ACCOUNT_CONNECTION_STRING not provided");
	assert(settings["BD_DB_CONNECTION_STRING"], "BD_DB_CONNECTION_STRING not provided");
	assert(settings["BD_WORKBENCH_CONNECTION_STRING"], "BD_WORKBENCH_CONNECTION_STRING not provided");
	assert(settings["BD_WORKBENCH_PDF_PATH"], "BD_WORKBENCH_PDF_PATH not provided");
	assert(settings["BD_WORKBENCH_COVER_IMAGE_PATH"], "BD_WORKBENCH_COVER_IMAGE_PATH not provided");
	return {
		stages: {
			metadataUpsert: isYes(settings["BD_DO_METADATA_UPSERT"]),
			pdfs: isYes(settings["BD_DO_PDFS"]),
			metadataActivate: isYes(settings["BD_DO_METADATA_ACTIVATE"]),
		},
		metadata: {
			url: settings["BD_METADATA_GIT_URL"],
			revisionOld: settings["BD_METADATA_GIT_REVISION_OLD"],
			revisionNew: settings["BD_METADATA_GIT_REVISION_NEW"],
			filter: settings["BD_METADATA_FILE_FILTER"],
		},
		binaries: {
			ghostscript: settings["BD_BINARY_PATH_GHOSTSCRIPT"],
			pdftotext: settings["BD_BINARY_PATH_PDFTOTEXT"],
			convert: settings["BD_BINARY_PATH_CONVERT"], // imagemagick
			pngquant: settings["BD_BINARY_PATH_PNGQUANT"],
		},
		filePrefixFilter: settings["BD_FILE_PREFIX_FILTER"],
		storageAccountConnectionString: settings["BD_STORAGE_ACCOUNT_CONNECTION_STRING"],
		pdfMaxProcessCount: parseInt(settings["BD_PDF_MAX_PROCESS_COUNT"] || "0", 10) || Number.MAX_SAFE_INTEGER,
		concurrency: settings["BD_CONCURRENCY"] ? parseInt(settings["BD_CONCURRENCY"], 10) : 0,
		randomizePdfs: isYes(settings["BD_RANDOMIZE_PDFS"]),
		db: {
			connectionString: settings["BD_DB_CONNECTION_STRING"],
		},
		workbench: {
			connectionString: settings["BD_WORKBENCH_CONNECTION_STRING"],
			pdfPath: settings["BD_WORKBENCH_PDF_PATH"],
			coverImagePath: settings["BD_WORKBENCH_COVER_IMAGE_PATH"],
		},
	};
};
