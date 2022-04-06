const nameIsValid = require("../../common/nameIsValid");

let passMockValue;

function resetAll() {}

beforeEach(resetAll);
afterEach(resetAll);

test(`Pass invalid string`, async () => {
	const item = nameIsValid(passMockValue);
	expect(item).toBe(false);
});

test(`Pass valid string`, async () => {
	passMockValue = "foo";
	const item = nameIsValid(passMockValue);
	expect(item[0]).toEqual("foo");
});

test(`Pass string with 'special character'`, async () => {
	passMockValue = "foo@#$";
	const item = nameIsValid(passMockValue);
	expect(item).toBe(null);
});

test(`Pass string with 'more than 100'`, async () => {
	passMockValue = "a".repeat(101);
	const item = nameIsValid(passMockValue);
	expect(item).toBe(null);
});
