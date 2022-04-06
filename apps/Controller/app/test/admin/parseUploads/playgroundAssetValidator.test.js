const playgroundAssetValidator = require("../../../core/admin/parseUploads/playgroundAssetValidator");

/**
 * mock for AssetValidator
 */
const AssetValidator = jest.mock(`../../../core/admin/parseUploads/AssetValidator`, () => {
	return class AssetValidator {
		setMetadataFileFetcher(callBack) {
			this.metadataFileFetcher = callBack(files);
		}

		setPdfBinaryFileFetcher(pdfBinaryFileFetcher) {
			this.pdfBinaryFileFetcher = pdfBinaryFileFetcher;
		}

		setReadStreamCreator(readStreamCreator) {
			this.readStreamCreator = readStreamCreator;
		}

		setHandlers(handlers) {
			this.handlers = handlers;
		}

		setGeneralErrorChecker(generalErrorChecker) {
			this.generalErrorChecker = generalErrorChecker;
		}

		/**
		 * Specify the XML parser to be used for this validator.
		 * The parser must follow the interface of the nodejs `sax` XML parser module.
		 *
		 * @example
		 * const sax = require('sax');
		 * validator.setXmlParser(sax);
		 *
		 */
		setXmlParser(xmlParser) {
			this.xmlParser = xmlParser;
		}

		/**
		 * Specify the callback invoked when a closing </Product> tag is encountered and it's time to validate the product.
		 * The callback is provided the product object and is expected to return an array of error messages (or an empty array if there are no errors).
		 */
		setProductErrorCheckFunction(productErrorCheck) {
			this.productErrorCheck = productErrorCheck;
		}

		setPdfPageCounter(pdfPageCounter) {
			this.pdfPageCounter = pdfPageCounter;
		}
	};
});

let files_, product;
/**
 * Reset function - called before each test.
 */
function resetAll() {
	files_ = [
		{
			name: "testfile.xml",
			size: 10,
			path: "test/testfile.xml",
		},
		{
			name: "test-9876543210.xml",
			size: 5,
			path: "test/test-9876543210.xml",
		},
		{
			name: "test-9876543210.pdf",
			size: 5,
			path: "test/test-9876543210.pdf",
		},
		{
			name: "testfile1.xml",
			size: 0,
			path: "test/testfile1",
		},
		{
			name: "testfile3.txt",
			size: 5,
			path: "test/testfile1",
		},
	];
	product = {
		pdfIsbn13: "9876543210",
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test("playgroundAssetValidator is a function", async () => {
	expect(typeof playgroundAssetValidator === "function").toBe(true);
});

describe(`Asset Validator setMetadataFileFetcher/this.metadataFileFetcher`, () => {
	test("Get path from valid xml files", async () => {
		let result = null,
			error = null;
		try {
			const pav = playgroundAssetValidator();
			result = await pav.metadataFileFetcher(files_);
		} catch (e) {
			error = e;
		}
		expect(result).toEqual(["test/testfile.xml", "test/test-9876543210.xml"]);
		expect(error).toBeNull();
	});

	test("Get blank list if dont have any valid xml files", async () => {
		let result = null,
			error = null;
		let inputFiles = files_.splice(1, 0);
		try {
			const pav = playgroundAssetValidator();
			result = await pav.metadataFileFetcher(inputFiles);
		} catch (e) {
			error = e;
		}
		expect(result).toEqual([]);
		expect(error).toBeNull();
	});

	test("Get blank list when files as null", async () => {
		let result = null,
			error = null;
		let inputFiles = null;
		try {
			const pav = playgroundAssetValidator();
			result = await pav.metadataFileFetcher(inputFiles);
		} catch (e) {
			error = e;
		}
		expect(result).toEqual([]);
		expect(error).toBeNull();
	});

	test("Get blank list when file dont have extention", async () => {
		let result = null,
			error = null;
		files_ = [
			{
				name: "testfile.",
				size: 10,
				path: "test/testfile1",
			},
		];
		try {
			const pav = playgroundAssetValidator();
			result = await pav.metadataFileFetcher(files_);
		} catch (e) {
			error = e;
		}
		expect(result).toEqual([]);
		expect(error).toBeNull();
	});
});

describe(`Asset Validator setPdfBinaryFileFetcher/this.pdfBinaryFileFetcher`, () => {
	test("Get filename when match with product isbn", async () => {
		let result = null,
			result1 = null,
			error = null;
		try {
			const pav = playgroundAssetValidator();
			result = await pav.metadataFileFetcher(files_);
			result1 = await pav.pdfBinaryFileFetcher(product);
		} catch (e) {
			error = e;
		}
		expect(result).toEqual(["test/testfile.xml", "test/test-9876543210.xml"]);
		expect(error).toBeNull();
		expect(result1).toEqual("test/test-9876543210.pdf");
	});

	test("Get null when product is null", async () => {
		let result = null,
			result1 = null,
			error = null;
		product = null;
		try {
			const pav = playgroundAssetValidator();
			result = await pav.metadataFileFetcher(files_);
			result1 = await pav.pdfBinaryFileFetcher(product);
		} catch (e) {
			error = e;
		}
		expect(result).toEqual(["test/testfile.xml", "test/test-9876543210.xml"]);
		expect(error).toBeNull();
		expect(result1).toEqual(null);
	});

	test("Get null when product.pdfIsbn13 is null", async () => {
		let result = null,
			result1 = null,
			error = null;
		product.pdfIsbn13 = null;
		try {
			const pav = playgroundAssetValidator();
			result = await pav.metadataFileFetcher(files_);
			result1 = await pav.pdfBinaryFileFetcher(product);
		} catch (e) {
			error = e;
		}
		expect(result).toEqual(["test/testfile.xml", "test/test-9876543210.xml"]);
		expect(error).toBeNull();
		expect(result1).toEqual(null);
	});

	test("Get null when product.pdfIsbn13 not match with existing files", async () => {
		let result = null,
			result1 = null,
			error = null;
		product.pdfIsbn13 = "99987765542";
		try {
			const pav = playgroundAssetValidator();
			result = await pav.metadataFileFetcher(files_);
			result1 = await pav.pdfBinaryFileFetcher(product);
		} catch (e) {
			error = e;
		}
		expect(result).toEqual(["test/testfile.xml", "test/test-9876543210.xml"]);
		expect(error).toBeNull();
		expect(result1).toEqual(null);
	});
});
