const disallowedApprovedDomains = require("../../common/disallowedApprovedDomains");

let mockResult;

function resetAll() {
	mockResult = ["gmail.com", "hotmail.com", "yahoo.com"];
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Return the domain value in array value`, async () => {
	expect(disallowedApprovedDomains).toEqual(mockResult);
});

test(`Return the length of array`, async () => {
	expect(disallowedApprovedDomains.length).toBe(mockResult.length);
});

test(`Return the first domain value 'gmail.com'`, async () => {
	expect(disallowedApprovedDomains[0]).toEqual(mockResult[0]);
});

test(`Return the second domain value 'hotmail.com'`, async () => {
	expect(disallowedApprovedDomains[1]).toEqual(mockResult[1]);
});

test(`Return the third domain value 'yahoo.com'`, async () => {
	expect(disallowedApprovedDomains[2]).toEqual(mockResult[2]);
});
