const execFile = require("child_process").execFile;
const explicit = require("./explicit");

module.exports = function (ghostscriptBinaryPath, pdfFilePath) {
	return explicit(ghostscriptBinaryPath, pdfFilePath, execFile);
};
