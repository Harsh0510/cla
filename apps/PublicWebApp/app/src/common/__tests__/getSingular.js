import getSingular from "../getSingular";

let fieldName;
function resetAll() {
	fieldName = "address";
}

beforeEach(resetAll);
afterEach(resetAll);

/** Get the get singular 'an'  */
test(`Get the get singular 'an'`, async () => {
	const item = getSingular(fieldName);
	expect(item).toBe("An");
});

/** Get the get singular 'a'  */
test(`Get the get singular 'a'`, async () => {
	fieldName = "firstname";
	const item = getSingular(fieldName);
	expect(item).toBe("A");
});

/** When no pass fieldName return empty*/
test(`When no pass fieldName return empty`, async () => {
	fieldName = "";
	const item = getSingular(fieldName);
	expect(item).toBe("");
});

/** When pass null fieldName return empty*/
test(`When pass null fieldName return empty`, async () => {
	fieldName = null;
	const item = getSingular(fieldName);
	expect(item).toBe("");
});
