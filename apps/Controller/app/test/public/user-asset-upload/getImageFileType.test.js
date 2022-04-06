const getImageFileType = require("../../../core/public/user-asset-upload/getImageFileType");

let mockResult;

jest.mock("child_process", () => {
	return {
		exec: (cmd, callback) => {
			let error = null;
			let stdout = null;
			if (mockResult) {
				stdout = "/tmp/626262626262626262626";
			} else {
				error = "Unknown error";
			}
			callback(error, stdout);
		},
	};
});

function resetAll() {
	mockResult = true;
}

beforeEach(resetAll);
afterEach(resetAll);

test("Runs successfully", async () => {
	const response = await getImageFileType("/tmp/path");
	expect(response).toEqual("/tmp/626262626262626262626");
});

test("Error", async () => {
	mockResult = false;
	const response = await getImageFileType("/tmp/path");
	expect(response).toEqual(null);
});
