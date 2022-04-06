//const fs = require("fs");
const path = require("path");
//const { spawn } = require("child_process");

const commandExists = require("command-exists");

const generatePdfThumbnailRaw = require("../../../core/admin/lib/generatePdfThumbnail");
const { resolve } = require("path");
const mockGhostscriptBinaryPath = __dirname;
const mockMagickBinaryPath = __dirname;
const testAssetDirectory = path.join(__dirname, "generatePdfThumbnail");

const outputPath = path.join(testAssetDirectory, "out.png");

function reset() {
	// return new Promise((resolve, reject) => {
	// 	fs.unlink(outputPath, resolve);
	// });
	mockFsError = false;
	mockExecError = false;
}

beforeEach(reset);
afterEach(reset);

const THUMB_MAX_WIDTH = 200;
const THUMB_MAX_HEIGHT = 200;

let mockFsError, mockExecError;

async function checkBinaries() {
	try {
		jest.setTimeout(30000);
		return await Promise.all([commandExists("gs"), commandExists("convert"), commandExists("pngquant"), commandExists("identify")]);
	} catch (e) {
		throw new Error(`You do not have all the required binaries!`);
	}
}

jest.mock("child_process", () => {
	return {
		spawn: () => {
			return {
				stdin: "test",
				stdout: {
					pipe: () => {
						return true;
					},
				},
				stderr: {
					on: (status, cb) => {
						return new Promise((resolve, reject) => {
							if (mockExecError) {
								reject(cb("Error"));
							} else {
								resolve(cb(true));
							}
						});
					},
				},
			};
		},
	};
});

jest.mock("fs", () => {
	return {
		createWriteStream: () => {
			return {
				on: (status, cb) => {
					if (status === "finish") {
						return new Promise((resolve, reject) => {
							resolve(cb());
						});
					}
				},
			};
		},
	};
});

async function generatePdfThumbnail(input, output) {
	const ret = {
		result: null,
		error: null,
	};
	try {
		ret.result = await generatePdfThumbnailRaw(
			mockGhostscriptBinaryPath,
			mockMagickBinaryPath,
			input,
			{
				width: THUMB_MAX_WIDTH,
				height: THUMB_MAX_HEIGHT,
			},
			output
		);
	} catch (e) {
		ret.error = e;
	}
	return ret;
}

test(`Error when file does not exist`, async () => {
	//await checkBinaries();
	mockExecError = false;
	const result = await generatePdfThumbnail("/this/definitely/does/not/existdfgdfgdfgur6y.pdf", outputPath);
	expect(result.error).not.toBeNull();
});

test(`Error when file is not a PDF`, async () => {
	//await checkBinaries();
	mockExecError = false;
	const result = await generatePdfThumbnail(path.join(testAssetDirectory, "dummy.txt"), outputPath);
	expect(result.error).not.toBeNull();
});

test(`Error when file is not a valid PDF`, async () => {
	//await checkBinaries();
	mockExecError = false;
	const result = await generatePdfThumbnail(path.join(testAssetDirectory, "invalid-pdf.pdf"), outputPath);
	expect(result.error).not.toBeNull();
});

test(`Error when output path is unwritable`, async () => {
	//await checkBinaries();
	mockExecError = false;
	const result = await generatePdfThumbnail(
		path.join(testAssetDirectory, "input.pdf"),
		path.join(testAssetDirectory, "does", "not", "exist", "atall.png")
	);
	expect(result.error).not.toBeNull();
});

// test(`Success`, async () => {
// 	const result = await generatePdfThumbnail(path.join(testAssetDirectory, "input.pdf"), outputPath);
// 	expect(result.error).toBeNull();
// 	expect(result.result).toBe(true);
// 	expect(fs.existsSync(outputPath)).toBe(true);

// 	// function getDimensions(filePath) {
// 	// 	return new Promise((resolve, reject) => {
// 	// 		const stream = spawn("identify", ["-format", "%wx%h", filePath]);
// 	// 		stream.stdout.on("data", (data) => {
// 	// 			resolve(
// 	// 				data
// 	// 					.toString()
// 	// 					.split("x")
// 	// 					.map((x) => parseFloat(x))
// 	// 			);
// 	// 		});
// 	// 		stream.stderr.on("error", (e) => {
// 	// 			reject(new Error(e.toString()));
// 	// 		});
// 	// 	});
// 	// }

// 	// const dims = await getDimensions(outputPath);

// 	// expect(dims[0]).toBeLessThan(THUMB_MAX_HEIGHT);
// 	// expect(dims[1]).toBe(THUMB_MAX_HEIGHT);
// });
