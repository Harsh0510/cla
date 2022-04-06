const execPromise = require("../execPromise");
const execFilePromise = require("../execFilePromise");
const path = require("path");

const consts = require("./consts");

const dpiPercentage = 100 * (consts.IMAGEMAGICK_DPI / consts.GHOSTSCRIPT_DPI);

module.exports = async function (magickBinaryPath, png, outputDirectory, isbn13) {
	const parts = png.match(/_tmpGeneratePdfExtract_([0-9]+)\.png$/);
	const num = parts[1];
	const absSrc = path.join(outputDirectory, png);
	const absDest = path.join(outputDirectory, isbn13 + "_generatePdfExtract_" + num + ".png");

	await execFilePromise(magickBinaryPath, ["convert", absSrc, "-resize", dpiPercentage + "%", absDest]);
	await execPromise(`pngquant --ext '.png' --force '${absDest}'`);

	return absDest;
};
