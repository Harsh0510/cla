const path = require("path");

const getPdfPageCountRaw = require("../../../../core/admin/lib/getPdfPageCount/explicit");

let exec;
let actualPdfFilePath;
const mockGhostscriptBinaryPath = __dirname;
beforeEach(function () {
	exec = null;
	actualPdfFilePath = path.join(__dirname, "dummy.pdf");
});

async function getPdfPageCount(fp) {
	let error = null;
	let result = null;
	try {
		result = await getPdfPageCountRaw(mockGhostscriptBinaryPath, fp, exec);
	} catch (e) {
		error = e;
	}
	return { error, result };
}

test(`Error if pdf file path contains bad characters`, async () => {
	expect(await getPdfPageCount("/:dsg.dfgu8$$.pdf")).toEqual({
		result: null,
		error: new Error("invalid file path"),
	});
});

test(`Error if file does not exist`, async () => {
	exec = require("child_process").exec;
	const res = await getPdfPageCount("/this file/definitely/doesnotexist.pdf");
	expect(res.result).toBeNull();
	expect(res.error).not.toBeNull();
});

test(`Error if exec function reports an error`, async () => {
	exec = function (mockGhostscriptBinaryPath, cmd, cb) {
		cb(new Error("failed!"), "", "");
	};
	const res = await getPdfPageCount(actualPdfFilePath);
	expect(res.result).toBeNull();
	expect(res.error).toEqual(new Error("failed!"));
});

test(`Error if stderr is not empty`, async () => {
	exec = function (mockGhostscriptBinaryPath, cmd, cb) {
		cb(null, "", Buffer.from("it all failed", "ascii"));
	};
	const res = await getPdfPageCount(actualPdfFilePath);
	expect(res.result).toBeNull();
	expect(res.error).toEqual(new Error("it all failed"));
});

test(`Error if stdout is unexpected`, async () => {
	exec = function (mockGhostscriptBinaryPath, cmd, cb) {
		cb(null, "unexpected");
	};
	const res = await getPdfPageCount(actualPdfFilePath);
	expect(res.result).toBeNull();
	expect(res.error).toEqual(new Error("unexpected output"));
});

test(`Succeed`, async () => {
	exec = function (mockGhostscriptBinaryPath, cmd, cb) {
		cb(null, 2, null);
	};
	const res = await getPdfPageCount(actualPdfFilePath);
	expect(res.result).toBe(2);
	expect(res.error).toBeNull();
});
