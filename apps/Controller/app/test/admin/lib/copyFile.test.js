const path = require("path");
const copyFileRaw = require("../../../core/admin/lib/copyFile");
let sourceFile, destinationFile, mockCreateReadStreamError, mockCreateWriteStream;

jest.mock("fs", () => {
	return {
		createReadStream: (source) => {
			let result = {
				on: (errorMessage, callback) => {
					callback(mockCreateReadStreamError);
				},
				pipe: (wr) => {},
			};
			return result;
		},
		createWriteStream: (target) => {
			let result = {
				on: (errorMessage, callback) => {
					callback(mockCreateWriteStream);
				},
			};
			return result;
		},
	};
});

async function copyFile(sourceFile, destinationFile, cb) {
	let error = null;
	let result = null;
	try {
		result = copyFileRaw(sourceFile, destinationFile, cb);
	} catch (e) {
		error = e;
	}
	return { error, result };
}

function resetAll() {
	sourceFile = path.join(__dirname, "..", "lib", "dummyImages", "dummy-thumbnail.png");
	destinationFile = path.join(__dirname, "..", "lib", "dummyImages", "dummy-thumbnail-copy.png");
	mockCreateReadStreamError = null;
	mockCreateWriteStream = null;
}

beforeEach(resetAll);
afterEach(resetAll);

test("Success when file copy from source to destination", async () => {
	const result = await copyFile(sourceFile, destinationFile, (err) => {
		if (err) {
			return err;
		} else {
			return destinationFile;
		}
	});
	expect(destinationFile.indexOf("dummy-thumbnail-copy.png")).not.toBe(-1);
	expect(result).toEqual({ error: null, result: undefined });
});
