const fs = require("fs");
const { spawn } = require("child_process");

module.exports = function (ghostscriptBinaryPath, magickBinaryPath, pdfFilePath, thumbnailSize, thumbnailOutputPath) {
	return new Promise((resolve, reject) => {
		const gs = spawn(ghostscriptBinaryPath, [
			"-o",
			"-",
			"-sDEVICE=png16m",
			"-r300",
			"-dFirstPage=1",
			"-dLastPage=1",
			"-dNOSAFER",
			"-sstdout=%stderr",
			pdfFilePath,
		]);
		const convert = spawn(magickBinaryPath, ["convert", "-strip", "-resize", `${thumbnailSize.width}x${thumbnailSize.height}`, "png:-", "png:-"]);
		const pngquant = spawn("pngquant", ["--force", "-"]);

		const fileStream = fs.createWriteStream(thumbnailOutputPath);

		fileStream.on("error", reject);

		gs.stdout.pipe(convert.stdin);
		convert.stdout.pipe(pngquant.stdin);
		convert.stderr.on("data", (e) => {
			reject(new Error(e.toString()));
		});

		pngquant.stdout.pipe(fileStream);
		pngquant.stderr.on("data", (e) => {
			reject(new Error(e.toString()));
		});

		fileStream.on("finish", (_) => {
			resolve(true);
		});
	});
};
