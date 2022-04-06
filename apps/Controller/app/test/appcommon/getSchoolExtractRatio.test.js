const { getSchoolExtractRatio, MIN_HIGHEST_RATIO } = require(`../../common/getSchoolExtractRatio`);

/**
 * Reset function - called before each test.
 */
function resetAll() {}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test(`Check Min Highest Ratio`, async () => {
	expect(MIN_HIGHEST_RATIO).toEqual(10);
});

test(`Ratio is 0 when accessRation < 10%`, async () => {
	for (i = 0; i < 10; i++) {
		let ratio = getSchoolExtractRatio(i, 20, 0.2);
		expect(ratio).toEqual(0);
	}
});

test(`Ratio is 10 when (accessRation >= 10% && accessRation < 15%)`, async () => {
	for (i = 10; i < 15; i++) {
		let ratio = getSchoolExtractRatio(i, 20, 0.2);
		expect(ratio).toEqual(10);
	}
});

test(`Ratio is 15 when (accessRation >= 15% && accessRation < 20%)`, async () => {
	for (i = 15; i < 20; i++) {
		let ratio = getSchoolExtractRatio(i, 20, 0.2);
		expect(ratio).toEqual(15);
	}
});

test(`Ratio is 20 when (accessRation >= 20% && accessRation < 25%)`, async () => {
	for (i = 20; i < 24; i++) {
		let ratio = getSchoolExtractRatio(i, 20, 0.2);
		expect(ratio).toEqual(20);
	}
});
