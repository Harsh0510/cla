const enc = require("../../../core/admin/lib/enc");

let string;
function resetAll() {
	string = "str";
}

beforeEach(resetAll);
afterEach(resetAll);

test("Covert any string to hex", async () => {
	const result = enc(string);
	expect(result).toEqual("737472");
});
