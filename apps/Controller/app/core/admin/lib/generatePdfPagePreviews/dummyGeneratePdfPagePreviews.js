const path = require("path");
const async = require("async");

const getPdfPageCount = require("../getPdfPageCount/index");
const copyFile = require("../copyFile");

const DUMMY_PAGE_PREVIEW_PATH = path.join(__dirname, "..", "..", "assets", "dummy-low-quality-page.png");

module.exports = async function (pdfFilePath, watermarkImagePath, isbn13, outputDirectory) {
	return new Promise((resolve, reject) => {
		getPdfPageCount(pdfFilePath)
			.then((count) => {
				const arr = [];
				for (let i = 0; i < count; ++i) {
					arr.push(i + 1);
				}
				async.mapLimit(
					arr,
					3,
					(pageNumber, cb) => {
						const outputPath = path.join(outputDirectory, isbn13 + "_pagepreviews_" + pageNumber.toString().padStart(5, "0") + ".png");
						copyFile(DUMMY_PAGE_PREVIEW_PATH, outputPath, (err) => {
							if (err) {
								cb(err);
							} else {
								cb(null, outputPath);
							}
						});
					},
					(err, results) => {
						if (err) {
							reject(err);
						} else {
							resolve(results);
						}
					}
				);
			})
			.catch(reject);
	});
};
