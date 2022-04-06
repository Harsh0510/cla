const getMaxPagesAllowed = require("../../../core/public/common/getMaxPagesAllowed");

test(``, async () => {
	expect(getMaxPagesAllowed(3, 2.5)).toBe(8);
	expect(getMaxPagesAllowed(3, 0)).toBe(0);
	expect(getMaxPagesAllowed(3, undefined)).toBe(NaN);
});
