const os = require("os");
const path = require("path");

const downloadImageRaw = require("../../../core/public/user-asset-upload/downloadImage");

let url;
let mockCreateWriteStream;
let mockReturnImageFileType;

jest.mock("axios", () => {
	return function () {
		return new Promise((resolve, reject) => {
			return resolve({
				data: {
					pipe: jest.fn(),
				},
			});
		});
	};
});

jest.mock("util", () => ({
	promisify: () =>
		jest.fn(() => {
			return Promise.resolve(new Buffer.from("a".repeat(32)));
		}),
}));

jest.mock("crypto", () => ({
	randomBytes: jest
		.fn((recordId, callback) => {
			callback(undefined, {
				status: 200,
			});
		})
		.mockReturnValue(new Buffer.from("b".repeat(32))),
}));

jest.mock("fs-extra", () => {
	return {
		createWriteStream: (target) => {
			let result = {
				on: (errorMessage, callback) => {
					callback(mockCreateWriteStream);
				},
			};
			return result;
		},
		remove: () => {
			return true;
		},
	};
});

jest.mock("../../../core/public/user-asset-upload/getImageFileType", () => {
	return () => {
		return mockReturnImageFileType;
	};
});

function resetAll() {
	url = "https://dummyimage.com/600x400/c722c7/43499c&text=test";
	mockCreateWriteStream = null;
	mockReturnImageFileType = "PNG";
}

beforeEach(resetAll);
afterEach(resetAll);

async function downloadImage(url) {
	try {
		return await downloadImageRaw(url);
	} catch (e) {
		return e;
	}
}

test("Image downloads successfully", async () => {
	const tmpPath = await downloadImage(url);
	const expected = path.join(os.tmpdir(), "6262626262626262626262626262626262626262626262626262626262626262");
	expect(tmpPath).toEqual(expected);
});

test("Invalid image", async () => {
	mockReturnImageFileType = null;
	const tmpPath = await downloadImage(url);
	expect(tmpPath).toEqual(new Error("invalid image"));
});
