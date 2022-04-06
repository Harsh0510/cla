const fs = require("fs");
const path = require("path");
const sax = require("sax");

const AssetValidator = require("./AssetValidator");

const handlers = require("./handlers");
const XmlParser = require("./XmlParser");
const productErrorCheck = require("./productErrorCheck");
const generalErrorChecker = require("./generalErrorChecker");
const getPdfPageCount = require("../lib/getPdfPageCount/index");

module.exports = (_) => {
	const validator = new AssetValidator();
	let files = null;
	validator.setMetadataFileFetcher(async (files_) => {
		files = files_;
		const ret = [];
		if (!files) {
			return ret;
		}
		for (const file of files) {
			if (file.size === 0) {
				continue;
			}
			const ext = file.name.split(".").pop().toLowerCase() || "bin";
			if (ext === "xml") {
				ret.push(file.path);
			}
		}
		return ret;
	});
	validator.setPdfBinaryFileFetcher(async (product) => {
		if (product && product.pdfIsbn13) {
			for (const f of files) {
				if (f.name.slice(-4) !== ".pdf") {
					continue;
				}
				if (f.name.indexOf(product.pdfIsbn13) !== -1) {
					return f.path;
				}
			}
		}
		return null;
	});
	validator.setReadStreamCreator(fs.createReadStream);
	validator.setHandlers(handlers);
	validator.setGeneralErrorChecker(generalErrorChecker);
	validator.setXmlParser(new XmlParser(sax));
	validator.setProductErrorCheckFunction(productErrorCheck);
	validator.setPdfPageCounter(getPdfPageCount);
	return validator;
};
