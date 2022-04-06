const fs = require("fs");
const path = require("path");

const noop = () => {};

module.exports = async function (
	execPromise,
	execFilePromise,
	convertOne,
	ghostscriptBinaryPath,
	magickBinaryPath,
	pdfFilePath,
	watermarkImagePath,
	isbn13,
	outputDirectory,
	applyBlur = false,
	progressCallback = noop
) {
	progressCallback("begin");
	const outputFormat = path.join(outputDirectory, isbn13 + "_pagepreviews_tmp_%05d.png");
	await execFilePromise(ghostscriptBinaryPath, [`-o`, outputFormat, `-dNOPAUSE`, `-dNOSAFER`, `-dBATCH`, `-sDEVICE=png16m`, `-r300`, pdfFilePath]);
	progressCallback("batch raw conversion complete");
	const pngOutputs = fs.readdirSync(outputDirectory).filter((item) => item.indexOf(isbn13 + "_pagepreviews_tmp_") === 0);

	const absoluteOutputPaths = [];
	for (const png of pngOutputs) {
		progressCallback("before resize one: " + png);
		absoluteOutputPaths.push(await convertOne(magickBinaryPath, png, outputDirectory, isbn13, watermarkImagePath, applyBlur));
	}
	progressCallback("batch resize complete");
	const delPattern = path.join(outputDirectory, isbn13 + "_pagepreviews_tmp_*");
	await execPromise(`rm -rf '${delPattern}'`);
	progressCallback(`removed temp images`);
	return absoluteOutputPaths;
};
