const execPromise = require("../execPromise");
const execFilePromise = require("../execFilePromise");
const path = require("path");

module.exports = async function (magickBinaryPath, png, outputDirectory, isbn13, watermarkImagePath, applyBlur = false) {
	const parts = png.match(/_pagepreviews_tmp_([0-9]+)\.png$/);
	const num = parts[1];
	const absSrc = path.join(outputDirectory, png);
	const absDest = path.join(outputDirectory, isbn13 + "_pagepreviews_" + num + ".png");
	const cmdArgs = ["convert", absSrc, "-resize", "500x800"];
	if (applyBlur) {
		cmdArgs.push("-blur", "4x1.8");
	}
	cmdArgs.push("-size", "480x780", "tile:" + watermarkImagePath, "-compose", "multiply", "-gravity", "Center", "-composite", "-append", absDest);
	await execFilePromise(magickBinaryPath, cmdArgs);
	await execPromise(`pngquant --ext '.png' --force '${absDest}'`);
	return absDest;
};
