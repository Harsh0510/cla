const fs = require("fs");
const path = require("path");
const promisify = require("util").promisify;
const glob = require("glob");

//const defaultConvertOne = require("../../../../core/admin/lib/generatePdfPagePreviews/convertOne");
//const defaultExecPromise = require("../../../../core/admin/lib/execPromise");

const commandExists = require("command-exists");
const unlinkPromise = promisify(fs.unlink);

const mockGhostscriptBinaryPath = __dirname;
const mockMagickBinaryPath = __dirname;
const generatePdfPagePreviewsRaw = require("../../../../core/admin/lib/generatePdfPagePreviews/explicit");

let mockExecFilePromise, defaultConvertOne, defaultExecPromise;
const watermarkPath = path.join(__dirname, "..", "..", "..", "..", "core", "admin", "lib", "generatePdfPagePreviews", "watermark.jpg");
const testAssetDirectory = __dirname;
const outputPath = path.join(testAssetDirectory);

function reset() {
	defaultExecPromise = function () {
		return new Promise((res, rej) => {
			res(true);
		});
	};
	(defaultConvertOne = function () {
		return new Promise((res, rej) => {
			res("isbn13_" + isbn13);
		});
	}),
		(mockExecFilePromise = function () {
			return new Promise((res, rej) => {
				res(true);
			});
		});
	return new Promise((resolve, reject) => {
		glob(path.join(outputPath, "*.png"), (err, matches) => {
			if (err) {
				reject(err);
				return;
			}
			Promise.all(matches.map((png) => unlinkPromise(png)))
				.then(resolve)
				.catch(reject);
		});
	});
}

beforeEach(reset);
afterEach(reset);

async function checkBinaries() {
	try {
		jest.setTimeout(30000);
		return await Promise.all([commandExists("gs"), commandExists("convert"), commandExists("pngquant"), commandExists("identify")]);
	} catch (e) {
		throw new Error(`You do not have all the required binaries!`);
	}
}

async function generatePdfPagePreviews(prom, convertOne, input, watermark, isbn, output) {
	const ret = {
		result: null,
		error: null,
	};
	try {
		ret.result = await generatePdfPagePreviewsRaw(
			prom,
			mockExecFilePromise,
			convertOne,
			mockGhostscriptBinaryPath,
			mockMagickBinaryPath,
			input,
			watermark,
			isbn,
			output
		);
	} catch (e) {
		ret.error = e;
	}
	return ret;
}

test(`Error when file does not exist`, async () => {
	await checkBinaries();
	const result = await generatePdfPagePreviews(
		defaultExecPromise,
		defaultConvertOne,
		"/this/definitely/does/not/existdfgdfgdfgur6y.pdf",
		watermarkPath,
		1234,
		outputPath
	);
	expect(result.error).toBeNull();
});

test(`Error when file is not a PDF`, async () => {
	await checkBinaries();
	const result = await generatePdfPagePreviews(
		defaultExecPromise,
		defaultConvertOne,
		path.join(testAssetDirectory, "dummy.txt"),
		watermarkPath,
		1234,
		outputPath
	);
	expect(result.error).toBeNull();
});

test(`Error when file is not a valid PDF`, async () => {
	await checkBinaries();
	const result = await generatePdfPagePreviews(
		defaultExecPromise,
		defaultConvertOne,
		path.join(testAssetDirectory, "invalid-pdf.pdf"),
		watermarkPath,
		1234,
		outputPath
	);
	expect(result.error).toBeNull();
});

test(`Error when output path is unwritable`, async () => {
	await checkBinaries();
	const result = await generatePdfPagePreviews(
		defaultExecPromise,
		defaultConvertOne,
		path.join(testAssetDirectory, "input.pdf"),
		watermarkPath,
		1234,
		path.join(testAssetDirectory, "does", "not", "exist", "atall")
	);
	expect(result.error).not.toBeNull();
});

test(`Success`, async () => {
	await checkBinaries();
	const result = await generatePdfPagePreviews(
		defaultExecPromise,
		defaultConvertOne,
		path.join(testAssetDirectory, "input.pdf"),
		watermarkPath,
		1234,
		outputPath,
		false
	);

	expect(result.error).toBeNull();
	expect(result.result.length).toBe(0);
	expect(fs.existsSync(outputPath)).toBe(true);
});
