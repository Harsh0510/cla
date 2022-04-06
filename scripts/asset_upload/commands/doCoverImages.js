const path = require("path");
const fs = require("fs-extra");
const shellQuote = require("shell-quote").quote;

const glob = require("../lib/glob");
const createSasToken = require("../lib/createSasToken");
const removeDir = require("../lib/removeDir");
const exec = require("../lib/exec");
const execFile = require("../lib/execFile");
const genTmpPath = require("../lib/genTmpPath");
const AZCOPY_PATH = require("../lib/AZCOPY_PATH");

const downloadCoverImages = async (storageAccountDetails, subDirectory) => {
	const sasToken = createSasToken(storageAccountDetails);
	const dir = genTmpPath();
	await fs.ensureDir(dir);
	await execFile(
		AZCOPY_PATH,
		[
			"copy",
			`${storageAccountDetails.FileAccountUrl}/workbench/${subDirectory}/*?${sasToken}`,
			dir,
			`--recursive`,
			`--exclude-pattern`,
			`*.pdf`
		]
	);
	return dir;
};

const processCoverImages = async (logWriter, dir, resizeTo) => {
	const generateCover = (input, output) => {
		const args = [
			input,
		];
		if (resizeTo) {
			args.push(
				'-gravity',
				'Center',
				'-resize',
				resizeTo
			);
		}
		args.push(output);
		return exec('convert ' + shellQuote(args));
	};
	const imageFilePaths = (await glob(dir + "/**/*.@(jpg|jpeg|png)")).map(p => ({
		path: p,
		match: path.basename(p).split('.')[0].match(/((\d{4}-\d{3}[\dX]-20[0-9]{2}-[0-9]{2}-[0-9]+)|[0-9]{13})/)
	})).filter(v => !!v.match);
	const numImagesFound = imageFilePaths.length;
	await logWriter.write({
		sub_stage: "cover-images",
		content: `Found ${numImagesFound} cover images to process.`,
	});
	const tmpDir = genTmpPath("cla-cover-images");
	await fs.ensureDir(tmpDir);
	let i = 0;
	for (const fp of imageFilePaths) {
		const assetIdentifier = fp.match[1];
		const targetOutput = path.join(tmpDir, assetIdentifier + '.png');
		await generateCover(fp.path, targetOutput);
		i++;
		await logWriter.write({
			sub_stage: "cover-images",
			asset_identifier: assetIdentifier,
			content: `[${i}/${numImagesFound}] Generated cover for '${fp.path}' to location '${targetOutput}'.`,
		});
	}
	await logWriter.write({
		sub_stage: "cover-images",
		content: `Processed all cover images.`,
	});
	return [tmpDir, numImagesFound];
};

const uploadCoverImages = async (coverImagesDir, storageAccountDetails, containerName) => {
	const sasToken = createSasToken(storageAccountDetails);
	await execFile(
		AZCOPY_PATH,
		[
			`copy`,
			coverImagesDir + '/*',
			`${storageAccountDetails.BlobAccountUrl}/${containerName}?${sasToken}`,
			`--recursive`
		]
	);
};

module.exports = async (logWriter, workbenchCoverImageDir, publisherStorageAccountSettings, stageStorageAccountSettings) => {
	await logWriter.write({
		sub_stage: "cover-images",
		content: `Starting doCoverImages`,
	});
	let tmpDir;
	let outputDirSmallImages;
	let outputDirLargeImages;
	try {
		await logWriter.write({
			sub_stage: "cover-images",
			content: `Downloading cover images from: ` + workbenchCoverImageDir,
		});
		tmpDir = await downloadCoverImages(publisherStorageAccountSettings, workbenchCoverImageDir);
		await logWriter.write({
			sub_stage: "cover-images",
			content: `Downloaded cover images to (${tmpDir}). Processing...`,
		});
		[outputDirSmallImages, numFound] = await processCoverImages(logWriter, tmpDir, "300x300");
		if (!numFound) {
			return;
		}
		[outputDirLargeImages] = await processCoverImages(logWriter, tmpDir, '2000x2000>');
		await logWriter.write({
			sub_stage: "cover-images",
			content: `Uploading cover images...`,
		});
		await uploadCoverImages(outputDirSmallImages, stageStorageAccountSettings, "coverpages");
		await uploadCoverImages(outputDirLargeImages, stageStorageAccountSettings, "rawcoverpages");
		await logWriter.write({
			sub_stage: "cover-images",
			content: `Uploaded the cover images`,
		});
	} catch (e) {
		await logWriter.write({
			sub_stage: "cover-images",
			success: false,
			content: e.name + "\n" + e.message + "\n" + e.stack,
		});
		throw e;
	} finally {
		await removeDir(tmpDir);
		await removeDir(outputDirSmallImages);
	}
	await logWriter.write({
		sub_stage: "cover-images",
		success: true,
		content: `Successfully processed: doCoverImages`,
	});
};
