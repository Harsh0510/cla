const parseBuyBookRulesRaw = require("../../common/parseBuyBookRules");

let buy_book_rules, dummyAsset, mockResult;

function resetAll() {
	buy_book_rules = ["https://abc.com/{{asset.isbn13}}"];
	dummyAsset = {
		id: 123,
		isbn13: "123456",
		pdf_isbn13: "2345678",
		imprint_id: 5,
		publisher_id: 8,
		parent_asset_group_identifier_log: "XYZ",
		doi: "foobar",
		title: "Some Title Here",
	};
	mockResult = ["https://abc.com/123456"];
}

beforeEach(resetAll);
afterEach(resetAll);

function parseBuyBookRules(buy_book_rules, dummyAsset) {
	let err = null;
	try {
		return parseBuyBookRulesRaw(buy_book_rules, dummyAsset);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error When get not a valid rule`, () => {
	buy_book_rules = [null, 1];
	expect(parseBuyBookRules(buy_book_rules, dummyAsset)).toEqual(new Error(`Rule 1 not a string`));
});

test(`Replace isbn13`, () => {
	mockResult = [`https://abc.com/${dummyAsset.isbn13}`];
	expect(parseBuyBookRules(buy_book_rules, dummyAsset)).toEqual(mockResult);
});

test(`Replace pdf_isbn13`, () => {
	buy_book_rules = ["https://abc.com/{{asset.pdf_isbn13}}"];
	mockResult = [`https://abc.com/${dummyAsset.pdf_isbn13}`];
	expect(parseBuyBookRules(buy_book_rules, dummyAsset)).toEqual(mockResult);
});

test(`Replace publisher_id`, () => {
	buy_book_rules = ["https://abc.com/{{asset.publisher_id}}"];
	mockResult = [`https://abc.com/${dummyAsset.publisher_id}`];
	expect(parseBuyBookRules(buy_book_rules, dummyAsset)).toEqual(mockResult);
});

test(`Replace imprint_id`, () => {
	buy_book_rules = ["https://abc.com/{{asset.imprint_id}}"];
	mockResult = [`https://abc.com/${dummyAsset.imprint_id}`];
	expect(parseBuyBookRules(buy_book_rules, dummyAsset)).toEqual(mockResult);
});

test(`Replace parent_identifier`, () => {
	buy_book_rules = ["https://abc.com/{{asset.parent_identifier}}"];
	mockResult = [`https://abc.com/${dummyAsset.parent_asset_group_identifier_log}`];
	expect(parseBuyBookRules(buy_book_rules, dummyAsset)).toEqual(mockResult);
});

test(`Replace doi`, () => {
	buy_book_rules = ["https://abc.com/{{asset.doi}}"];
	mockResult = [`https://abc.com/${dummyAsset.doi}`];
	expect(parseBuyBookRules(buy_book_rules, dummyAsset)).toEqual(mockResult);
});

test(`Replace title`, () => {
	buy_book_rules = ["https://abc.com/{{asset.title}}"];
	mockResult = [`https://abc.com/Some%20Title%20Here`];
	expect(parseBuyBookRules(buy_book_rules, dummyAsset)).toEqual(mockResult);
});

test(`Error when not matching with object value`, () => {
	buy_book_rules = ["https://abc.com/{{asset.oid}}"];
	mockResult = ["https://abc.com/{{asset.oid}}"];
	expect(parseBuyBookRules(buy_book_rules, dummyAsset)).toEqual(new Error("Rule 1 not a valid template"));
});

test(`Error for unknown template param`, () => {
	buy_book_rules = ["https://abc.com/{{foobar}}"];
	expect(parseBuyBookRules(buy_book_rules, dummyAsset)).toEqual(new Error("Rule 1 not a valid template"));
});

test(`Error when not pass the rules`, () => {
	buy_book_rules = [123];
	expect(parseBuyBookRules(buy_book_rules, dummyAsset)).toEqual(new Error("Rule 1 not a string"));
});

test(`Replace isbn13 with blank when getting the isbn13 as null`, () => {
	dummyAsset.isbn13 = null;
	mockResult = [`https://abc.com/`];
	expect(parseBuyBookRules(buy_book_rules, dummyAsset)).toEqual(mockResult);
});

test(`Replace pdf_isbn13 with blank when getting the pdf_isbn13 as null`, () => {
	buy_book_rules = ["https://abc.com/{{asset.pdf_isbn13}}"];
	mockResult = [`https://abc.com/`];
	dummyAsset.pdf_isbn13 = null;
	expect(parseBuyBookRules(buy_book_rules, dummyAsset)).toEqual(mockResult);
});

test(`Replace publisher_id with blank when getting the publisher_id as null`, () => {
	buy_book_rules = ["https://abc.com/{{asset.publisher_id}}"];
	mockResult = [`https://abc.com/`];
	dummyAsset.publisher_id = null;
	expect(parseBuyBookRules(buy_book_rules, dummyAsset)).toEqual(mockResult);
});

test(`Replace imprint_id with blank when getting the imprint_id as null`, () => {
	buy_book_rules = ["https://abc.com/{{asset.imprint_id}}"];
	mockResult = [`https://abc.com/`];
	dummyAsset.imprint_id = null;
	expect(parseBuyBookRules(buy_book_rules, dummyAsset)).toEqual(mockResult);
});

test(`Replace parent_identifier with blank when getting the parent_identifier as null`, () => {
	buy_book_rules = ["https://abc.com/{{asset.parent_identifier}}"];
	mockResult = [`https://abc.com/`];
	dummyAsset.parent_asset_group_identifier_log = null;
	expect(parseBuyBookRules(buy_book_rules, dummyAsset)).toEqual(mockResult);
});

test(`Replace title with blank when getting the title as null`, () => {
	buy_book_rules = ["https://abc.com/{{asset.title}}"];
	mockResult = [`https://abc.com/`];
	dummyAsset.title = null;
	expect(parseBuyBookRules(buy_book_rules, dummyAsset)).toEqual(mockResult);
});

test(`Replace doi  with blank when getting the doi as null`, () => {
	buy_book_rules = ["https://abc.com/{{asset.doi}}"];
	mockResult = [`https://abc.com/`];
	dummyAsset.doi = null;
	expect(parseBuyBookRules(buy_book_rules, dummyAsset)).toEqual(mockResult);
});

test(`Replace content based on dummy asset`, () => {
	buy_book_rules = ["https://abc.com/{{asset.pdf_isbn13}}"];
	mockResult = [`https://abc.com/${dummyAsset.pdf_isbn13}`];
	expect(parseBuyBookRules(buy_book_rules)).toEqual(mockResult);
});
