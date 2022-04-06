const execRaw = require("../../../core/public/user-asset-upload/exec");

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

async function exec(cmd, args) {
	try {
		return await execRaw(cmd, args);
	} catch (e) {
		return e;
	}
}

test("Exec runs successfully", async () => {
	const res = await exec("identify", ["-format", "%m", "tmp/path"]);
	expect(res).toEqual("/tmp/626262626262626262626");
});

test("Error", async () => {
	mockResult = false;
	const res = await exec("identify", "-format %m tmp/path");
	expect(res).toEqual("Unknown error");
});
