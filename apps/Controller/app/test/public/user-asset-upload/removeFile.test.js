const removeFile = require("../../../core/public/user-asset-upload/removeFile");
let path;
jest.mock(`fs`, () => {
	return {
		unlink: (test) => {
			return true;
		},
	};
});

function resetAll() {
	path = "/tmp/dummyImage.png";
}

beforeEach(resetAll);
afterEach(resetAll);

test("remove file is a function", async () => {
	expect(removeFile()).not.toBeNull();
	expect(typeof removeFile === "function").toBe(true);
});

test("When params id passed", async () => {
	expect(removeFile(path)).not.toBeNull();
});
