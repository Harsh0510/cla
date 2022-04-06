const fs = require("fs");
const path = require("path");

const consts = require("./consts");

const noop = () => {};

module.exports = async function (
	execPromise,
	execFilePromise,
	convertOne,
	ghostscriptBinaryPath,
	magickBinaryPath,
	pdfFilePath,
	isbn13,
	outputDirectory,
	progressCallback = noop
) {
	progressCallback(`begin`);
	const outputFormat = path.join(outputDirectory, isbn13 + "_tmpGeneratePdfExtract_%05d.png");
	await execFilePromise(ghostscriptBinaryPath, [
		`-o`,
		outputFormat,
		`-dBATCH`,
		`-dNOPAUSE`,
		`-dNOSAFER`,
		`-sDEVICE=png16m`,
		`-r${consts.GHOSTSCRIPT_DPI}`,
		`-dColorConversionStrategy=/LeaveColorUnchanged`,
		`-dEncodeColorImages=false`,
		`-dEncodeGrayImages=false`,
		`-dEncodeMonoImages=false`,
		`-dPDFSETTINGS=/printer`,
		pdfFilePath,
	]);
	progressCallback("batch raw conversion complete");
	const pngOutputs = fs.readdirSync(outputDirectory).filter((item) => item.indexOf(isbn13 + "_tmpGeneratePdfExtract_") === 0);

	const absoluteOutputPaths = [];
	for (const png of pngOutputs) {
		progressCallback("before resize one: " + png);
		absoluteOutputPaths.push(await convertOne(magickBinaryPath, png, outputDirectory, isbn13));
	}
	progressCallback("batch resize complete");
	const delPattern = path.join(outputDirectory, isbn13 + "_tmpGeneratePdfExtract_*");
	await execPromise(`rm -rf '${delPattern}'`);
	progressCallback(`removed temp images`);
	return absoluteOutputPaths;
};
