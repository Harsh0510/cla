const generate_access_code = require("../../common/generate_access_code");

function resetAll() {
	mockDate = "";
	academicYearEndMonth = "";
	academicYearEndDay = "";
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Get random five digit access code`, async () => {
	let result = null;
	result = generate_access_code();
	expect(result).not.toEqual(null);
});
