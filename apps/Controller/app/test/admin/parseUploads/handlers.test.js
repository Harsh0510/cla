const fs = require("fs");
const path = require("path");

const handlers = require("../../../core/admin/parseUploads/handlers");

const baseDir = path.join(__dirname, "..", "..", "..", "core", "admin", "parseUploads", "handlers");

const expectedHandlers = fs
	.readdirSync(baseDir)
	.filter(
		(name) => name.match(/\.js$/) // only js files
	)
	.map((name) => require(path.join(baseDir, name)));

test("all the expected handlers are registered", async () => {
	for (const handler of expectedHandlers) {
		expect(handlers.indexOf(handler)).not.toBe(-1);
	}
});

test("only the expected handlers are registered", async () => {
	for (const handler of handlers) {
		expect(expectedHandlers.indexOf(handler)).not.toBe(-1);
	}
});
