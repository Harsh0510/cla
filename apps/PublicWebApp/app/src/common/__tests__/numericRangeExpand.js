import numericRangeExpand from "../numericRangeExpand";

test(`When invalid range passed`, () => {
	expect(numericRangeExpand("a")).toEqual(null);
	expect(numericRangeExpand("1-")).toEqual(null);
	expect(numericRangeExpand("1-10,")).toEqual(null);
	expect(numericRangeExpand("-1")).toEqual(null);
	expect(numericRangeExpand("1-5-10")).toEqual(null);
	expect(numericRangeExpand("1-5,6,")).toEqual(null);
	expect(numericRangeExpand("1-1")).toEqual(null);
	expect(numericRangeExpand("10-5")).toEqual(null);
});

test(`When valid range passed`, () => {
	expect(numericRangeExpand("1")).toEqual([1]);
	expect(numericRangeExpand("1-5")).toEqual([1, 2, 3, 4, 5]);
	expect(numericRangeExpand("1-5,9")).toEqual([1, 2, 3, 4, 5, 9]);
	expect(numericRangeExpand("22-25,25-30")).toEqual([22, 23, 24, 25, 26, 27, 28, 29, 30]);
	expect(numericRangeExpand("1-5,9,12-15")).toEqual([1, 2, 3, 4, 5, 9, 12, 13, 14, 15]);
});
