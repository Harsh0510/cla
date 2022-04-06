const getAssetCitationText = require(`../../../../core/public/async_task/asset_available_email_log/getAssetCitationText`);
const misc = require(`../../../../core/public/async_task/asset_available_email_log/misc`);

let authorsData, editionString, props;

jest.mock(`../../../../core/public/async_task/asset_available_email_log/misc`, () => jest.fn());

function resetAll() {
	props = {
		title: "maths copy",
		authors: [
			{ role: "A", lastName: "Powell", firstName: "Ray" },
			{ role: "A", lastName: "Powell", firstName: "James" },
			{ role: "B", lastName: "Adam", firstName: "Williams" },
			{ role: "B", lastName: "jam", firstName: "kalam" },
		],
		edition: 2,
		publisher: "OUP Oxford",
		publication_date: "2018-06-07T00:00:00.000Z",
	};
	authorsData = Object.create(null);
	editionString = "";
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Function render correctly`, async () => {
	misc.getLongFormAuthorsEditors = jest.fn(() => {
		return {
			authors: "Ray Powell and James Powell",
			editors: "Williams Adam and kalam jam",
			raw: {
				authors: [
					{ role: "A", lastName: "Powell", firstName: "Ray" },
					{ role: "A", lastName: "Powell", firstName: "James" },
				],
				editors: [
					{ role: "B", lastName: "Adam", firstName: "Williams" },
					{ role: "B", lastName: "jam", firstName: "kalam" },
				],
			},
		};
	});
	misc.getOrdinalSuffix = jest.fn(() => {
		return "2nd";
	});
	expect(getAssetCitationText(...Object.values(props))).toEqual(
		"Ray Powell and James Powell. maths copy. Eds. Williams Adam and kalam jam. 2nd ed. OUP Oxford, 00:0."
	);
});

test(`Function render correctly with authors and only one editor`, async () => {
	props.authors = [
		{ role: "A", lastName: "Powell", firstName: "Ray" },
		{ role: "A", lastName: "Powell", firstName: "James" },
		{ role: "B", lastName: "Adam", firstName: "Williams" },
	];
	misc.getLongFormAuthorsEditors = jest.fn(() => {
		return {
			authors: "Ray Powell and James Powell",
			editors: "Williams Adam",
			raw: {
				authors: [
					{ role: "A", lastName: "Powell", firstName: "Ray" },
					{ role: "A", lastName: "Powell", firstName: "James" },
				],
				editors: [{ role: "B", lastName: "Adam", firstName: "Williams" }],
			},
		};
	});
	misc.getOrdinalSuffix = jest.fn(() => {
		return "2nd";
	});
	expect(getAssetCitationText(...Object.values(props))).toEqual(
		"Ray Powell and James Powell. maths copy. Ed. Williams Adam. 2nd ed. OUP Oxford, 00:0."
	);
});

test(`Function render correctly without editors`, async () => {
	props.authors = [
		{ role: "A", lastName: "Powell", firstName: "Ray" },
		{ role: "A", lastName: "Powell", firstName: "James" },
	];
	misc.getLongFormAuthorsEditors = jest.fn(() => {
		return {
			authors: "Ray Powell and James Powell",
			editors: "",
			raw: {
				authors: [
					{ role: "A", lastName: "Powell", firstName: "Ray" },
					{ role: "A", lastName: "Powell", firstName: "James" },
				],
				editors: [],
			},
		};
	});
	misc.getOrdinalSuffix = jest.fn(() => {
		return "2nd";
	});
	expect(getAssetCitationText(...Object.values(props))).toEqual("Ray Powell and James Powell.maths copy.2nd ed. OUP Oxford, 00:0.");
});

test(`Function render correctly without authors`, async () => {
	props.authors = [
		{ role: "B", lastName: "Adam", firstName: "Williams" },
		{ role: "B", lastName: "jam", firstName: "kalam" },
	];
	misc.getLongFormAuthorsEditors = jest.fn(() => {
		return {
			authors: "",
			editors: "Williams Adam and kalam jam",
			raw: {
				authors: [],
				editors: [
					{ role: "B", lastName: "Adam", firstName: "Williams" },
					{ role: "B", lastName: "jam", firstName: "kalam" },
				],
			},
		};
	});
	misc.getOrdinalSuffix = jest.fn(() => {
		return "2nd";
	});
	expect(getAssetCitationText(...Object.values(props))).toEqual("Williams Adam and kalam jam, eds. maths copy. 2nd ed. OUP Oxford, 00:0.");
});

test(`Function render correctly with only one editor`, async () => {
	props.authors = [{ role: "B", lastName: "Adam", firstName: "Williams" }];
	misc.getLongFormAuthorsEditors = jest.fn(() => {
		return {
			authors: "",
			editors: "Williams Adam",
			raw: {
				authors: [],
				editors: [{ role: "B", lastName: "Adam", firstName: "Williams" }],
			},
		};
	});
	misc.getOrdinalSuffix = jest.fn(() => {
		return "2nd";
	});
	expect(getAssetCitationText(...Object.values(props))).toEqual("Williams Adam, ed. maths copy. 2nd ed. OUP Oxford, 00:0.");
});

test(`Function render correctly when authors are passed without role`, async () => {
	props.authors = [
		{ lastName: "Powell", firstName: "Ray" },
		{ lastName: "Powell", firstName: "James" },
		{ lastName: "Adam", firstName: "Williams" },
		{ lastName: "jam", firstName: "kalam" },
	];
	misc.getLongFormAuthorsEditors = jest.fn(() => {
		return {
			authors: "",
			editors: "",
			raw: {
				authors: [],
				editors: [],
			},
		};
	});
	misc.getOrdinalSuffix = jest.fn(() => {
		return "2nd";
	});
	expect(getAssetCitationText(...Object.values(props))).toEqual("maths copy. 2nd ed. OUP Oxford, 00:0.");
});

test(`Function render correctly with authorsData as null`, async () => {
	props.authors = [];
	misc.getLongFormAuthorsEditors = jest.fn(() => {
		return null;
	});
	misc.getOrdinalSuffix = jest.fn(() => {
		return "2nd";
	});
	expect(getAssetCitationText(...Object.values(props))).toEqual("maths copy. 2nd ed. OUP Oxford, 00:0.");
});

test(`Function render correctly without publication date`, async () => {
	delete props.publication_date;
	misc.getLongFormAuthorsEditors = jest.fn(() => {
		return {
			authors: "Ray Powell and James Powell",
			editors: "Williams Adam and kalam jam",
			raw: {
				authors: [
					{ role: "A", lastName: "Powell", firstName: "Ray" },
					{ role: "A", lastName: "Powell", firstName: "James" },
				],
				editors: [
					{ role: "B", lastName: "Adam", firstName: "Williams" },
					{ role: "B", lastName: "jam", firstName: "kalam" },
				],
			},
		};
	});
	misc.getOrdinalSuffix = jest.fn(() => {
		return "2nd";
	});
	expect(getAssetCitationText(...Object.values(props))).toEqual(
		"Ray Powell and James Powell. maths copy. Eds. Williams Adam and kalam jam. 2nd ed. OUP Oxford. "
	);
});

test(`Function render correctly with edition equal to 1`, async () => {
	props.edition = 1;
	misc.getLongFormAuthorsEditors = jest.fn(() => {
		return {
			authors: "Ray Powell and James Powell",
			editors: "Williams Adam and kalam jam",
			raw: {
				authors: [
					{ role: "A", lastName: "Powell", firstName: "Ray" },
					{ role: "A", lastName: "Powell", firstName: "James" },
				],
				editors: [
					{ role: "B", lastName: "Adam", firstName: "Williams" },
					{ role: "B", lastName: "jam", firstName: "kalam" },
				],
			},
		};
	});
	expect(getAssetCitationText(...Object.values(props))).toEqual(
		"Ray Powell and James Powell. maths copy. Eds. Williams Adam and kalam jam. OUP Oxford, 00:0."
	);
});
