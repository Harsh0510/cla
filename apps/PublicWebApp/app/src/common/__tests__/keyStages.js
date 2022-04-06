import keyStages from "../keyStages";

let mockKeyStages;

function resetAll() {
	mockKeyStages = {
		faqList: true,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Return true when pass 'keyStages' with array value */
test(`Return true when pass 'keyStages' with array value`, async () => {
	const item = Array.isArray(keyStages) ? true : false;
	expect(item).toBe(true);
});

/** Return false when pass 'keyStages' as object */
test(`Return false when pass 'keyStages' as object`, async () => {
	const item = Array.isArray(mockKeyStages) ? true : false;
	expect(item).toBe(false);
});

/** Count 'keyStages' array length */
test(`Count 'keyStages' array length`, async () => {
	const item = keyStages;
	expect(item.length).toBe(6);
});

/** Match 'keyStages' array value  */
test(`Match 'keyStages' array value`, async () => {
	const item = keyStages;
	expect(item[0]).toBe("Foundation Stage");
	expect(item[1]).toBe("KS1");
	expect(item[2]).toBe("KS2");
	expect(item[3]).toBe("KS3");
	expect(item[4]).toBe("KS4");
	expect(item[5]).toBe("KS5");
});
