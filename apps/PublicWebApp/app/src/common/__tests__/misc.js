import { getAuthors, getLongFormContributors, getShortFormContributors, getOrdinalSuffix } from "./../misc";

let authors, mockReult;

function resetAll() {
	authors = [
		{ role: "A", lastName: "Kaur", firstName: "B." },
		{ role: "A", lastName: "Kaur", firstName: "B." },
		{ role: "B", lastName: "Kaur", firstName: "B." },
		{ role: "B", lastName: "Kaur", firstName: "B." },
		{ role: "B", lastName: "Kaur", firstName: "B." },
	];
	mockReult = null;
}

beforeEach(resetAll);
afterEach(resetAll);

/** fucntion renders correctly */
test("fucntion renders correctly", async () => {
	authors = [{ firstName: "xyz", lastName: "abc" }];
	const item = getAuthors(authors);
	expect(item).toEqual("xyz abc");
});

/** function renders correctly with object */
test("function renders correctly with object", async () => {
	authors = { firstName: "xyz", lastName: "abc" };
	const item = getAuthors(authors);
	const result = typeof item !== "object" ? false : true;
	expect(result).toBe(false);
});

/** function renders correctly with empty array */
test("function renders correctly with empty array", async () => {
	authors = [];
	const item = getAuthors(authors);
	expect(item.length).toBe(0);
});

/** function renders correctly with single object */
test("function renders correctly with single object", async () => {
	authors = [{ firstName: "xyz" }];
	const item = getAuthors(authors);
	expect(item).toEqual("xyz undefined");
});

/** function renders correctly with single object */
test("function renders correctly with single object", async () => {
	authors = [
		{ firstName: "james", lastName: "kali" },
		{ firstName: "johan", lastName: "williames" },
		{ firstName: "kyara", lastName: "de" },
	];
	const item = getAuthors(authors);
	expect(item).toEqual("james kali, johan williames and kyara de");
});

/** fucntion renders correctly */
test("fucntion renders correctly with short author have't value", async () => {
	authors = [];
	const item = getShortFormContributors(authors);
	expect(item).toEqual(null);
});

test("fucntion renders correctly with short author and editor string", async () => {
	mockReult = {
		authors: ["B. Kaur and ", "B. Kaur"],
		editors: "B. Kaur, et al.",
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
			translators: [],
		},
		translators: "",
	};
	const item = getShortFormContributors(authors);
	expect(item).toEqual(mockReult);
});

test("fucntion renders correctly with short author string", async () => {
	authors = [
		{ role: "A", lastName: "Kaur", firstName: "B." },
		{ role: "A", lastName: "Kaur", firstName: "B." },
	];
	mockReult = {
		authors: ["B. Kaur and ", "B. Kaur"],
		editors: "",
		raw: {
			authors: [
				{ role: "A", lastName: "Kaur", firstName: "B." },
				{ role: "A", lastName: "Kaur", firstName: "B." },
			],
			editors: [],
			translators: [],
		},
		translators: "",
	};
	const item = getShortFormContributors(authors);
	expect(item).toEqual(mockReult);
});

test("fucntion renders correctly with short editor string", async () => {
	authors = [{ role: "B", lastName: "Kaur", firstName: "B." }];
	mockReult = {
		authors: "",
		editors: "B. Kaur",
		raw: { authors: [], editors: [{ role: "B", lastName: "Kaur", firstName: "B." }], translators: [] },
		translators: "",
	};
	const item = getShortFormContributors(authors);
	expect(item).toEqual(mockReult);
});

test("fucntion renders correctly when long authors haven't value", async () => {
	authors = [];
	const item = getLongFormContributors(authors);
	expect(item).toEqual(null);
});

test("fucntion renders correctly with long author and editor string", async () => {
	mockReult = {
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
			translators: [],
		},
		translators: "",
	};
	const item = getLongFormContributors(authors);
	expect(item).toEqual(mockReult);
});

test("fucntion renders correctly with long author string", async () => {
	authors = [
		{ role: "A", lastName: "Kaur", firstName: "B." },
		{ role: "A", lastName: "Kaur", firstName: "B." },
	];
	mockReult = {
		authors: "B. Kaur and B. Kaur",
		editors: "",
		raw: {
			authors: [
				{ role: "A", lastName: "Kaur", firstName: "B." },
				{ role: "A", lastName: "Kaur", firstName: "B." },
			],
			editors: [],
			translators: [],
		},
		translators: "",
	};
	const item = getLongFormContributors(authors);
	expect(item).toEqual(mockReult);
});

test("fucntion renders correctly with long editor string", async () => {
	authors = [
		{ role: "B", lastName: "Kaur", firstName: "B." },
		{ role: "B", lastName: "Kaur", firstName: "B." },
		{ role: "B", lastName: "Kaur", firstName: "B." },
	];
	mockReult = {
		authors: "",
		editors: "B. Kaur, B. Kaur and B. Kaur",
		raw: {
			authors: [],
			editors: [
				{ role: "B", lastName: "Kaur", firstName: "B." },
				{ role: "B", lastName: "Kaur", firstName: "B." },
				{ role: "B", lastName: "Kaur", firstName: "B." },
			],
			translators: [],
		},
		translators: "",
	};
	const item = getLongFormContributors(authors);
	expect(item).toEqual(mockReult);
});

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
