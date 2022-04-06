import * as bit from "../bit";

/* Test methods */
test(`getFirstNotSet method runs correctly`, async () => {
	let result = bit.getFirstNotSet(5);
	expect(result).toEqual(1);

	let result1 = bit.getFirstNotSet(-2);
	expect(result1).toEqual(0);

	let result2 = bit.getFirstNotSet();
	expect(result2).toEqual(0);
});

test(`isset method runs correctly`, async () => {
	let result = bit.isset(5, 1);
	expect(result).toEqual(false);

	let result1 = bit.isset(33);
	expect(result1).toEqual(true);
});

test(`set method runs correctly`, async () => {
	let result = bit.set(9, 2);
	expect(result).toEqual(13);

	let result1 = bit.set(7);
	expect(result1).toEqual(7);
});
