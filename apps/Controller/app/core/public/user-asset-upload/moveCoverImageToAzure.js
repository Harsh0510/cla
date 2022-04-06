const fs = require("fs-extra");

const BlobResource = require("../../admin/azure/BlobResource");
const bs = require("../../admin/azure/azureBlobService");

const exec = require("./exec");

const makeCoverImage = async (localPath) => {
	const outPath = localPath + ".out.png";
	const args = [localPath, "-gravity", "Center", "-resize", "300x300", outPath];
	await exec("convert", args);
	return outPath;
};

module.exports = async (localImagePath, isbn13) => {
	const coverImagePath = await makeCoverImage(localImagePath);
	const br = new BlobResource("coverpages", isbn13 + ".png");
	await bs.uploadFile(coverImagePath, br);
	await fs.remove(localImagePath);
	await fs.remove(coverImagePath);
};
