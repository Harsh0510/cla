const fs = require("fs");
const path = require("path");

const copyFile = require("./copyFile");

const DUMMY_THUMBNAIL_PATH = path.join(__dirname, "..", "assets", "dummy-thumbnail.png");

module.exports = function (pdfFilePath, thumbnailSize, thumbnailOutputPath) {
	return new Promise((resolve, reject) => {
		copyFile(DUMMY_THUMBNAIL_PATH, thumbnailOutputPath, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
};
