module.exports = function (ghostscriptBinaryPath, pdfFilePath, execFile) {
	return new Promise((resolve, reject) => {
		if (!pdfFilePath.match(/^[a-zA-Z0-9_\/ .-]+$/)) {
			reject(new Error("invalid file path"));
		}
		execFile(
			ghostscriptBinaryPath,
			[`-q`, `-dNOSAFER`, `--permit-file-read=/`, `-dNODISPLAY`, `-c`, `(${pdfFilePath}) (r) file runpdfbegin pdfpagecount = quit`],
			(err, stdout, stderr) => {
				if (err || (stderr && stderr.toString().length)) {
					reject(err || new Error(stderr.toString()));
					return;
				}
				stdout = String(stdout).toString().trim();
				if (!stdout.match(/^[0-9]+$/)) {
					reject(new Error("unexpected output"));
					return;
				}
				resolve(parseInt(stdout, 10));
			}
		);
	});
};
