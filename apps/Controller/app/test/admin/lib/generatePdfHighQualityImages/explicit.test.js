const fs = require("fs");
const path = require("path");
const promisify = require("util").promisify;
const glob = require("glob");

//const defaultConvertOne = require("../../../../core/admin/lib/generatePdfHighQualityImages/convertOne");
//const defaultExecPromise = require("../../../../core/admin/lib/execPromise");

const commandExists = require("command-exists");
const unlinkPromise = promisify(fs.unlink);

const generatePdfHighQualityImagesRaw = require("../../../../core/admin/lib/generatePdfHighQualityImages/explicit");

//const watermarkPath = path.join(__dirname, '..', '..', '..', '..','core', 'admin', 'lib', 'generatePdfHighQualityImages', 'watermark.png');
const testAssetDirectory = __dirname;
const outputPath = path.join(testAssetDirectory);
const mockGhostscriptBinaryPath = __dirname;
const mockMagickBinaryPath = __dirname;
let mockExecFilePromise, defaultConvertOne, defaultExecPromise;
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

async function generatePdfHighQualityImages(prom, convertOne, input, isbn, output) {
	const ret = {
		result: null,
		error: null,
	};
	try {
		ret.result = await generatePdfHighQualityImagesRaw(
			prom,
			mockExecFilePromise,
			convertOne,
			mockGhostscriptBinaryPath,
			mockMagickBinaryPath,
			input,
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
	const result = await generatePdfHighQualityImages(
		defaultExecPromise,
		defaultConvertOne,
		"/this/definitely/does/not/existdfgdfgdfgur6y.pdf",
		1234,
		outputPath
	);
	expect(result.error).toBeNull();
});
