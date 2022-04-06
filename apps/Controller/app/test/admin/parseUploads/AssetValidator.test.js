const fs = require("fs");
const path = require("path");
const promisify = require("util").promisify;

const sax = require("sax");

const DefaultXmlParser = require("../../../core/admin/parseUploads/XmlParser");
const defaultHandlers = require("../../../core/admin/parseUploads/handlers");
const defaultGeneralErrorChecker = require("../../../core/admin/parseUploads/generalErrorChecker");
const defaultProductErrorCheck = require("../../../core/admin/parseUploads/productErrorCheck");

const AssetValidator = require("../../../core/admin/parseUploads/AssetValidator");

describe("check with set metods", () => {
	const func = (_) => 5;
	test("setting the meta data file fetcher", async () => {
		const ie = new AssetValidator();
		ie.setMetadataFileFetcher(func);
		expect(ie.metadataFileFetcher).toEqual(func);
	});

	test("setting the pdf binary file fetcher", async () => {
		const ie = new AssetValidator();
		ie.setPdfBinaryFileFetcher(func);
		expect(ie.pdfBinaryFileFetcher).toEqual(func);
	});

	test("setting the read stream creator", async () => {
		const ie = new AssetValidator();
		ie.setReadStreamCreator(func);
		expect(ie.readStreamCreator).toEqual(func);
	});

	test("setting the handlers", async () => {
		const ie = new AssetValidator();
		ie.setHandlers(func);
		expect(ie.handlers).toEqual(func);
	});

	test("setting the general error checker", async () => {
		const ie = new AssetValidator();
		ie.setGeneralErrorChecker(func);
		expect(ie.generalErrorChecker).toEqual(func);
	});

	test("setting the XML parser", async () => {
		const ie = new AssetValidator();
		ie.setXmlParser(func);
		expect(ie.xmlParser).toEqual(func);
	});

	test("setting the product error check function", async () => {
		const ie = new AssetValidator();
		ie.setProductErrorCheckFunction(func);
		expect(ie.productErrorCheck).toEqual(func);
	});

	test("setting the pdf page counter", async () => {
		const ie = new AssetValidator();
		ie.setPdfPageCounter(func);
		expect(ie.pdfPageCounter).toEqual(func);
	});
});

describe("process - with actual data", () => {
	test("executes successfully", async () => {
		const validator = new AssetValidator();
		const readDirPromise = promisify(fs.readdir);
		const dir = path.join(__dirname, "meta");
		const files = await readDirPromise(dir);
		files.sort();

		validator.setMetadataFileFetcher(async (_) => {
			const ret = [];
			for (const f of files) {
				if (f.match(/^[0-9]+\.xml$/) || f.match(/^magazine\.xml$/)) {
					ret.push(f);
				}
			}
			return ret;
		});
		validator.setPdfBinaryFileFetcher(async (product) => {
			if (!product.isbn13) {
				return null;
			}
			for (const f of files) {
				if (f.slice(-4) !== ".pdf") {
					continue;
				}
				if (f.indexOf(product.isbn13) !== -1) {
					return f;
				}
			}
		});
		validator.setReadStreamCreator((fp) => {
			return fs.createReadStream(path.join(dir, fp));
		});
		validator.setHandlers(defaultHandlers);
		validator.setGeneralErrorChecker(defaultGeneralErrorChecker);
		validator.setXmlParser(new DefaultXmlParser(sax));
		validator.setProductErrorCheckFunction(defaultProductErrorCheck);
		validator.setPdfPageCounter(async (_) => {
			return 0;
		});

		const results = await validator.process(dir);
		expect(results).toMatchSnapshot();
	});
	test("handler failure", async () => {
		const validator = new AssetValidator();
		const readDirPromise = promisify(fs.readdir);
		const dir = path.join(__dirname, "meta");
		const files = await readDirPromise(dir);
		files.sort();

		validator.setMetadataFileFetcher(async (_) => {
			const ret = [];
			for (const f of files) {
				if (f.match(/\btiny\.xml$/)) {
					ret.push(f);
				}
			}
			return ret;
		});
		validator.setPdfBinaryFileFetcher(async (product) => {
			if (!product.isbn13) {
				return null;
			}
			for (const f of files) {
				if (f.slice(-4) !== ".pdf") {
					continue;
				}
				if (f.indexOf(product.isbn13) !== -1) {
					return f;
				}
			}
		});
		validator.setReadStreamCreator((fp) => {
			return fs.createReadStream(path.join(dir, fp));
		});
		const handlers = defaultHandlers.slice(0);
		for (let i = 0, len = handlers.length; i < len; ++i) {
			if (handlers[i]._NAME_ === "authors") {
				handlers[i] = () => {
					throw new Error("MASSIVE ERROR");
				};
				handlers[i]._NAME_ = "authors";
				break;
			}
		}
		validator.setHandlers(handlers);
		validator.setGeneralErrorChecker(defaultGeneralErrorChecker);
		validator.setXmlParser(new DefaultXmlParser(sax));
		validator.setProductErrorCheckFunction(defaultProductErrorCheck);
		validator.setPdfPageCounter(async (_) => {
			return 0;
		});

		const results = await validator.process(dir);
		expect(results).toEqual([
			{
				errors: [],
				name: "tiny.xml",
				products: [
					{
						_errors: [expect.stringContaining("Internal handler error with handler 'authors': Error: MASSIVE ERROR")],
						collection: [],
						coverUris: [],
						edition: 1,
						educationalYearGroup: [],
						errors: [
							"PDF ISBN13 not found",
							"ISSN ID not found",
							expect.stringContaining("Internal handler error with handler 'authors': Error: MASSIVE ERROR"),
						],
						exam: [],
						examBoard: [],
						extent: 312,
						isbn13: "9781471892165",
						keyStage: [],
						level: [],
						language: ["eng"],
						pageOffsetArabic: 0,
						pageOffsetRoman: 0,
						publicationDate: 1498780800,
						recordReference: "CLAEP-00000002",
						scottishLevel: [],
						subjects: ["PN"],
						title: "TEST",
						parentAsset: {},
					},
				],
			},
		]);
	});

	test(`processing single XML ONIX file`, async () => {
		const validator = new AssetValidator();
		const readDirPromise = promisify(fs.readdir);
		const dir = path.join(__dirname, "meta");
		const files = await readDirPromise(dir);
		files.sort();

		validator.setMetadataFileFetcher(async (_) => {
			const ret = [];
			for (const f of files) {
				if (f.match(/^[0-9]+\.xml$/)) {
					ret.push(f);
				}
			}
			return ret;
		});
		validator.setPdfBinaryFileFetcher(async (product) => {
			if (!product.isbn13) {
				return null;
			}
			for (const f of files) {
				if (f.slice(-4) !== ".pdf") {
					continue;
				}
				if (f.indexOf(product.isbn13) !== -1) {
					return f;
				}
			}
		});
		validator.setReadStreamCreator((fp) => {
			return fs.createReadStream(path.join(dir, fp));
		});
		validator.setHandlers(defaultHandlers);
		validator.setGeneralErrorChecker(() => {
			throw new Error("Valid XML not found.");
		});
		validator.setXmlParser(new DefaultXmlParser(sax));
		validator.setProductErrorCheckFunction(defaultProductErrorCheck);
		validator.setPdfPageCounter(async (_) => {
			return 0;
		});

		const results = await validator.process(dir);
		expect(results).toEqual([
			{
				errors: [expect.stringContaining("Error: Valid XML not found.")],
				name: "1.xml",
				products: [],
			},
			{
				errors: [expect.stringContaining("Error: Valid XML not found.")],
				name: "10.xml",
				products: [],
			},
			{
				errors: [expect.stringContaining("Error: Valid XML not found.")],
				name: "11.xml",
				products: [],
			},
			{
				errors: [expect.stringContaining("Error: Valid XML not found.")],
				name: "4.xml",
				products: [],
			},
			{
				errors: [expect.stringContaining("Error: Valid XML not found.")],
				name: "5.xml",
				products: [],
			},
			{
				errors: [expect.stringContaining("Error: Valid XML not found.")],
				name: "6.xml",
				products: [],
			},
			{
				errors: [expect.stringContaining("Error: Valid XML not found.")],
				name: "7.xml",
				products: [],
			},
			{
				errors: [expect.stringContaining("Error: Valid XML not found.")],
				name: "8.xml",
				products: [],
			},
			{
				errors: [expect.stringContaining("Error: Valid XML not found.")],
				name: "9.xml",
				products: [],
			},
		]);
	});

	test("handler failure when unknown error", async () => {
		const validator = new AssetValidator();
		const readDirPromise = promisify(fs.readdir);
		const dir = path.join(__dirname, "meta");
		const files = await readDirPromise(dir);
		files.sort();

		validator.setMetadataFileFetcher(async (_) => {
			const ret = [];
			for (const f of files) {
				if (f.match(/\btiny\.xml$/)) {
					ret.push(f);
				}
			}
			return ret;
		});
		validator.setPdfBinaryFileFetcher(async (product) => {
			if (!product.isbn13) {
				return null;
			}
			for (const f of files) {
				if (f.slice(-4) !== ".pdf") {
					continue;
				}
				if (f.indexOf(product.isbn13) !== -1) {
					return f;
				}
			}
		});
		validator.setReadStreamCreator((fp) => {
			return fs.createReadStream(path.join(dir, fp));
		});
		const handlers = defaultHandlers.slice(0);
		handlers.push((product, productNode) => {
			throw new Error("Unknown error 1");
		});
		handlers.push((product, productNode) => {
			throw new Error("Unknown error 2");
		});
		for (let i = 0, len = handlers.length; i < len; ++i) {
			if (handlers[i]._NAME_ === "authors") {
				handlers[i] = () => {
					throw new Error("MASSIVE ERROR");
				};
				handlers[i]._NAME_ = "authors";
				break;
			}
		}

		validator.setHandlers(handlers);
		validator.setGeneralErrorChecker(defaultGeneralErrorChecker);
		validator.setXmlParser(new DefaultXmlParser(sax));
		validator.setProductErrorCheckFunction(defaultProductErrorCheck);
		validator.setPdfPageCounter(async (_) => {
			return 0;
		});

		const results = await validator.process(dir);

		expect(results[0].products[0]._errors.length).toEqual(3);
	});
});
