const path = require("path");
const fs = require("fs-extra");
const os = require("os");

const download = require("./download");
const watermark = require("./watermark");
const upload = require("./upload");

const processOne = async (text, extractOid, isbn, pageIndex) => {
	const tmpPathBase = path.join(os.tmpdir(), "copiedpage_" + extractOid + "_" + isbn + "_" + pageIndex);
	const tmpPath = tmpPathBase + ".png";
	const targetTmpPath = tmpPathBase + "_tmp.png";
	try {
		await download(isbn, pageIndex, tmpPath);
		await watermark(tmpPath, text, targetTmpPath);
		return await upload(targetTmpPath, extractOid, pageIndex);
	} finally {
		try {
			await fs.unlink(tmpPath);
			await fs.unlink(targetTmpPath);
		} catch (e) {}
	}
};

let processAll;
if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
	processAll = async (text, extractOid, isbn, pages) => {
		const ret = [];
		for (const page of pages) {
			const br = await processOne(text, extractOid, isbn, page - 1);
			ret.push(br);
		}
		return ret;
	};
} else {
	processAll = async () => [];
}
module.exports = processAll;
