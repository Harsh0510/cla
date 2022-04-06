import userTitles from "../userTitles";

let mockUserTitles;

function resetAll() {
	mockUserTitles = {
		mr: true,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Return true when pass 'userTitles' with array value */
test(`Return true when pass 'userTitles' with array value`, async () => {
	const item = Array.isArray(userTitles) ? true : false;
	expect(item).toBe(true);
});

/** Return false when pass 'userTitles' as object */
test(`Return false when pass 'userTitles' as object`, async () => {
	const item = Array.isArray(mockUserTitles) ? true : false;
	expect(item).toBe(false);
});

/** Count 'userTitles' array length */
test(`Count 'userTitles' array length`, async () => {
	const item = userTitles;
	expect(item.length).toBe(6);
});

/** Match 'userTitles' array value  */
test(`Match 'userTitles' array value`, async () => {
	const item = userTitles;
	expect(item[0]).toBe("Mr");
	expect(item[1]).toBe("Mrs");
	expect(item[2]).toBe("Ms");
	expect(item[3]).toBe("Miss");
	expect(item[4]).toBe("Mx");
	expect(item[5]).toBe("Dr");
});
