const {
	getOrdinalSuffix,
	getLongFormAuthorsEditors,
	getURLEncodeAsset,
} = require("../../../../core/public/async_task/asset_available_email_log/misc");

let authors, mockResult, props;

function resetAll() {
	authors = [
		{ role: "A", lastName: "Kaur", firstName: "B." },
		{ role: "A", lastName: "Kaur", firstName: "B." },
		{ role: "B", lastName: "Kaur", firstName: "B." },
		{ role: "B", lastName: "Kaur", firstName: "B." },
		{ role: "B", lastName: "Kaur", firstName: "B." },
	];
	mockResult = null;
	props = {
		title: "test",
		pdf_isbn13: "9870836489178",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** getOrdinalSuffix*/
test("function render with when pass value 1", async () => {
	const item = getOrdinalSuffix(1);
	expect(item).toEqual("1st");
});

test("function render with when pass value 2", async () => {
	const item = getOrdinalSuffix(2);
	expect(item).toEqual("2nd");
});

test("function render with when pass value 3", async () => {
	const item = getOrdinalSuffix(3);
	expect(item).toEqual("3rd");
});

test("function render with when pass value 4", async () => {
	const item = getOrdinalSuffix(4);
	expect(item).toEqual("4th");
});

test("function render with when pass with any integer value", async () => {
	const item = getOrdinalSuffix(51);
	expect(item).toEqual("51st");
});

test("function render with when pass with negative value", async () => {
	const item = getOrdinalSuffix(-51);
	expect(item).toEqual("-51th");
});

test("function render with when pass with array value", async () => {
	const item = getOrdinalSuffix([-51]);
	expect(item).toEqual("-51th");
});

/** getLongFormAuthorsEditors*/
test("function renders correctly when long authors have no value", async () => {
	authors = [];
	const item = getLongFormAuthorsEditors(authors);
	expect(item).toEqual(null);
});

test("function renders correctly with long author and editor string", async () => {
	mockResult = {
		authors: "B. Kaur and B. Kaur",
		editors: "B. Kaur, B. Kaur and B. Kaur",
		raw: {
			authors: [
				{ role: "A", lastName: "Kaur", firstName: "B." },
				{ role: "A", lastName: "Kaur", firstName: "B." },
			],
			editors: [
				{ role: "B", lastName: "Kaur", firstName: "B." },
				{ role: "B", lastName: "Kaur", firstName: "B." },
				{ role: "B", lastName: "Kaur", firstName: "B." },
			],
		},
	};
	const item = getLongFormAuthorsEditors(authors);
	expect(item).toEqual(mockResult);
});

test("function renders correctly with long author string", async () => {
	authors = [
		{ role: "A", lastName: "Kaur", firstName: "B." },
		{ role: "A", lastName: "Kaur", firstName: "B." },
	];
	mockResult = {
		authors: "B. Kaur and B. Kaur",
		editors: "",
		raw: {
			authors: [
				{ role: "A", lastName: "Kaur", firstName: "B." },
				{ role: "A", lastName: "Kaur", firstName: "B." },
			],
			editors: [],
		},
	};
	const item = getLongFormAuthorsEditors(authors);
	expect(item).toEqual(mockResult);
});

test("function renders correctly with long editor string", async () => {
	authors = [
		{ role: "B", lastName: "Kaur", firstName: "B." },
		{ role: "B", lastName: "Kaur", firstName: "B." },
		{ role: "B", lastName: "Kaur", firstName: "B." },
	];
	mockResult = {
		authors: "",
		editors: "B. Kaur, B. Kaur and B. Kaur",
		raw: {
			authors: [],
			editors: [
				{ role: "B", lastName: "Kaur", firstName: "B." },
				{ role: "B", lastName: "Kaur", firstName: "B." },
				{ role: "B", lastName: "Kaur", firstName: "B." },
			],
		},
	};
	const item = getLongFormAuthorsEditors(authors);
	expect(item).toEqual(mockResult);
});

/** getURLEncodeAsset*/
/** Return the encoded url successfully */
test("Return the encoded url", async () => {
	const result = getURLEncodeAsset(props.title, props.pdf_isbn13);
	expect(result).toBe("9870836489178-test");
});

test('Pass title as "test	"', async () => {
	props.title = "test		";
	const result = getURLEncodeAsset(props.title, props.pdf_isbn13);
	expect(result).toBe("9870836489178-test-");
});

test('Pass title as "	test	"', async () => {
	props.title = "test		";
	const result = getURLEncodeAsset(props.title, props.pdf_isbn13);
	expect(result).toBe("9870836489178-test-");
});

test('Pass title as "AQA GCSE (9-1) Design and Technology"', async () => {
	props.title = "AQA GCSE (9-1) Design and Technology";
	props.pdf_isbn13 = "9781910523100";
	const result = getURLEncodeAsset(props.title, props.pdf_isbn13);
	expect(result).toBe("9781910523100-aqa-gcse-9-1-design-and-technology");
});
