const keyStages = require("../../common/keyStages");

let mockResult;

function resetAll() {
	mockResult = ["Foundation Stage", "KS1", "KS2", "KS3", "KS4", "KS5"];
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Return the keyStages value`, async () => {
	expect(keyStages).toEqual(mockResult);
});

test(`Return the length of keyStages array`, async () => {
	expect(keyStages.length).toBe(mockResult.length);
});

test(`Match the keyStages array`, async () => {
	for (let i = 0; i < keyStages.length; i++) {
		expect(mockResult[i]).toBe(keyStages[i]);
	}
});
