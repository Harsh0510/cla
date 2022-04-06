import RandomShuffle from "../randomShuffle";

let mockArray, defaultArray;

function resetAll() {
	mockArray = [1, 4, 3];
	defaultArray = [1, 4, 3];
}

beforeEach(resetAll);
afterEach(resetAll);

/** Count 'array' length */
test(`Count 'array' length`, async () => {
	const item = RandomShuffle(mockArray);
	expect(item.length).toBe(defaultArray.length);
});

// /** TODO: This test cases success in sometime , sometimes its failed */
// /** Return random shuffle value when function pass with array */
// test(`Return random shuffle value when function pass with array`, async () => {
// 	const item = RandomShuffle(mockArray);
// 	expect(item).not.toEqual(defaultArray);
// });
