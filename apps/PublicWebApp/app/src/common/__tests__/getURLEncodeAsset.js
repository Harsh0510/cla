import getURLEncodeAsset from "../getURLEncodeAsset";

let props;

function resetAll() {
	props = {
		pdf_isbn13: "9870836489178",
		title: "test",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Return the encoded url successfully */
test("Return the encoded url", async () => {
	const result = getURLEncodeAsset(props);
	expect(result).toBe("9870836489178-test");
});

/** Pass title as "test		" */
test('Pass title as "test	"', async () => {
	props.title = "test		";
	const result = getURLEncodeAsset(props);
	expect(result).toBe("9870836489178-test-");
});

/** Pass title as "   test		" */
test('Pass title as "	test	"', async () => {
	props.title = "test		";
	const result = getURLEncodeAsset(props);
	expect(result).toBe("9870836489178-test-");
});

/** Pass title as "AQA GCSE (9-1) Design and Technology" */
test('Pass title as "AQA GCSE (9-1) Design and Technology"', async () => {
	props.title = "AQA GCSE (9-1) Design and Technology";
	props.pdf_isbn13 = "9781910523100";
	const result = getURLEncodeAsset(props);
	expect(result).toBe("9781910523100-aqa-gcse-9-1-design-and-technology");
});
