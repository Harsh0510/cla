const execPromise = require("../../../core/admin/lib/execPromise");

let cmd;

function resetAll() {
	cmd = "command";
}

beforeEach(resetAll);
afterEach(resetAll);

test("Sucessful execute promise command", async () => {
	const result = await execPromise(cmd);
	expect(result).toEqual("");
});

test("When error in execute promise command", async () => {
	cmd = "pngquant";
	try {
		result = await execPromise(cmd);
	} catch (e) {
		result = e;
	}
	expect(result.toString().indexOf("Command failed:")).not.toBe(-1);
});
