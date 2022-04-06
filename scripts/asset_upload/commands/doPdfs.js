const fs = require("fs-extra");

const AzureFile = require("@azure/storage-file-share");

const doProcessPdfs = require("../lib/processPdfs");
const createSasToken = require("../lib/createSasToken");
const execFile = require("../lib/execFile");
const genTmpPath = require("../lib/genTmpPath");
const arrayChunk = require("../lib/arrayChunk");
const AZCOPY_PATH = require("../lib/AZCOPY_PATH");

const fetchFilesRecursive = async (shareClient, dir) => {
	const ret = [];
	const fetchInner = async subDir => {
		console.log(subDir);
		const iter = shareClient.getDirectoryClient(subDir).listFilesAndDirectories();
		for await (const entity of iter) {
			if (entity.kind === "directory") {
				await fetchInner(subDir + '/' + entity.name);
			} else {
				ret.push(subDir + '/' + entity.name);
			}
		}
	};
	await fetchInner(dir);
	return ret;
};

const transferPdfs = async (logWriter, sourceStorageAccountDetails, sourceSubDir, destStorageAccountDetails, destContainer) => {
	const dir = genTmpPath();
	await fs.ensureDir(dir);
	const serviceClient = new AzureFile.ShareServiceClient(
		sourceStorageAccountDetails.FileAccountUrl,
		new AzureFile.StorageSharedKeyCredential(sourceStorageAccountDetails.AccountName, sourceStorageAccountDetails.AccountKey)
	);
	const shareClient = serviceClient.getShareClient("workbench");
	const origFiles = (await fetchFilesRecursive(shareClient, sourceSubDir)).map(f => ({
		path: f,
		match: f.match(/((\d{4}-\d{3}[\dX]-20[0-9]{2}-[0-9]{2}-[0-9]+)|[0-9]{13}).*?\.(pdf|epub)$/)
	}));
	const files = [];
	for (const origFile of origFiles) {
		if (origFile.match) {
			files.push(origFile);
		} else {
			await logWriter.write({
				sub_stage: "asset-processing",
				content: "NOT transferring file: " + origFile.path,
			});
		}
	}
	const numFiles = files.length;
	await logWriter.write({
		sub_stage: "asset-processing",
		content: `Found ${numFiles} files that could be transferred (skipped ${origFiles.length - numFiles} files).`,
	});

	let fileIndex = 0;
	for (const file of files) {
		const isbn13 = file.match[1];
		const fileExtension = file.match[3];
		await logWriter.write({
			sub_stage: "asset-processing",
			asset_identifier: isbn13,
			content: `About to transfer file ${fileIndex}/${numFiles} (${file.path}' with ISBN ${isbn13}).`,
		});
		await execFile(
			AZCOPY_PATH,
			[
				`copy`,
				`${sourceStorageAccountDetails.FileAccountUrl}/workbench/${file.path}?${createSasToken(sourceStorageAccountDetails)}`,
				`${destStorageAccountDetails.BlobAccountUrl}/${destContainer}/${isbn13}.${fileExtension}?${createSasToken(destStorageAccountDetails)}`,
				'--overwrite',
				'ifSourceNewer',
			]
		);
		await logWriter.write({
			sub_stage: "asset-processing",
			asset_identifier: isbn13,
			content: `Transferred file ${fileIndex}/${numFiles} (${file.path}' with ISBN ${isbn13}).`,
		});
		fileIndex++;
	}
};

const processPdfs = async (logWriter, settings, storageAccountDetails, apiBase) => {
	return await doProcessPdfs(
		logWriter,
		{
			db_pool: settings.dbPool,
			storage_connection_string: storageAccountDetails.ConnectionString,
			batch_name: settings.BATCH_ACCOUNT_NAME,
			batch_url: settings.BATCH_ACCOUNT_URL,
			batch_key: settings.BATCH_ACCOUNT_KEY,
			azure_batch_db_connection_string: settings.AZURE_BATCH_READONLY_DB_CONNECTION_STRING,
			do_high_quality_pages: true,
			api_base: apiBase,
		}
	);
};

module.exports = async (logWriter, settings, publisherStorageAccountSettings, stageStorageAccountSettings, apiBase) => {
	await logWriter.write({
		sub_stage: "asset-processing",
		content: `Transferring files from ${settings.WORKBENCH_PDF_DIR} to ${stageStorageAccountSettings.BlobAccountUrl}`,
	});
	await transferPdfs(logWriter, publisherStorageAccountSettings, settings.WORKBENCH_PDF_DIR, stageStorageAccountSettings, settings.RAW_UPLOADS_CONTAINER_NAME || 'rawuploads');
	await logWriter.write({
		sub_stage: "asset-processing",
		content: `File transfer completed. Now submitting Azure Batch job(s)...`,
	});
	await processPdfs(logWriter, settings, stageStorageAccountSettings, apiBase);
	await logWriter.write({
		sub_stage: "asset-processing",
		content: `Successfully submitted assets for processing`,
	});
};
