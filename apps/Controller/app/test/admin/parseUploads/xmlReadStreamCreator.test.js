const xmlReadStreamCreator = require("../../../core/admin/parseUploads/xmlReadStreamCreator");

jest.mock(`path`, () => {
	return {
		join: (dir, entryName) => {
			return true;
		},
	};
});

jest.mock(`fs`, () => {
	return {
		createReadStream: (test) => {
			return true;
		},
	};
});

test("read stream creator is a function", async () => {
	expect(xmlReadStreamCreator).not.toBeNull();
	expect(typeof xmlReadStreamCreator === "function").toBe(true);
});

test("read stream creator pass with params", async () => {
	let mockEntry = {
		entry: {
			name: "1.xml",
		},
	};
	expect(xmlReadStreamCreator).not.toBeNull();
	expect(xmlReadStreamCreator("meta", mockEntry)).toBe(true);
});
