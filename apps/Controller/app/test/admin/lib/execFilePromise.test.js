const execFilePromise = require("../../../core/admin/lib/execFilePromise");

let cmd;
let args;
let mockExceError;

jest.mock("child_process", () => {
	return {
		execFile: (command, obj, callback) => {
			callback(mockExceError, true);
		},
	};
});

function resetAll() {
	cmd = "file";
	args = ["args"];
	mockExceError = "Command failed:";
}

beforeEach(resetAll);
afterEach(resetAll);

test("Sucessful execute promise command", async () => {
	mockExceError = null;
	const result = await execFilePromise(cmd, args);
	expect(result).toEqual(true);
});

test("When error in execute promise command", async () => {
	cmd = "pngquant";
	try {
		result = await execFilePromise(cmd, args);
	} catch (e) {
		result = e;
	}
	expect(result.toString().indexOf("Command failed:")).not.toBe(-1);
});
