const path = require("path");

const childProcess = require("child_process");
const shellQuote = require("shell-quote").quote;

const fontPath = path.join(__dirname, "NotoSans-Regular.ttf");

const exec = (cmd, args) =>
	new Promise((resolve, reject) => {
		childProcess.exec(cmd + " " + shellQuote(args), (err, stdout) => {
			if (err) {
				reject(err);
			} else {
				resolve(stdout);
			}
		});
	});

module.exports = (localImagePath, text, targetImagePath) => {
	return exec("convert", [
		localImagePath,
		"-gravity",
		"SouthEast",
		"-undercolor",
		"white",
		"-pointsize",
		"11",
		"-fill",
		"black",
		"-font",
		fontPath,
		"-annotate",
		"+10+10",
		text,
		targetImagePath,
	]);
};
