const fs = require("fs-extra");
const download = require("download");

const glob = require("./glob");

const fetchAzCopy = async (azCopyPath) => {
	const tmpPath = azCopyPath + "_tmp";
	await fs.remove(azCopyPath);
	try {
		await download(
			`https://aka.ms/downloadazcopy-v10-linux`,
			tmpPath,
			{
				extract: true,
			}
		);
		const pt = await glob(tmpPath + '/**/azcopy');
		if (pt.length !== 1) {
			throw new Error("Could not find azcopy");
		}
		await fs.move(pt[0], azCopyPath);
		await fs.remove(tmpPath);
	} finally {
		await fs.remove(tmpPath);
	}
};

module.exports = async (azCopyPath) => {
	let exists = false;
	try {
		await fs.access(azCopyPath, fs.constants.X_OK);
		exists = true;
	} catch (e) {
		exists = false;
	}
	if (!exists) {
		await fetchAzCopy(azCopyPath);
	}
};