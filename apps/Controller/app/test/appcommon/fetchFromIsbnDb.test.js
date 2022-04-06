const OLD_ENV = process.env;

let mockResult;
let mockQuery;
let axiosParams;

jest.mock("axios", () => {
	return function (params) {
		axiosParams = params;
		if (params.validateStatus && typeof params.validateStatus === "function") {
			params.validateStatus();
		}
		return mockResult;
	};
});

function resetAll() {
	mockQuery = "test query";
	mockResult = {
		data: {
			books: [
				{
					isbn: "8172763654",
					publisher: "Hodde rvvvv",
					pages: 100,
					title: "Some title here: First",
					authors: ["Lake Johnson, Mary", "John Smith"],
					date_published: 2007,
					image: "https://dummyimage.com/600x400/c722c7/43499c&text=test",
				},
				{
					isbn: "9780439139595",
					publisher: "Hodder",
					pages: 150,
					title: "Another title goes here",
					authors: ["Elena Jenson"],
					image: null,
				},
				{
					isbn: "9780307283672",
					publisher: "OUP",
					pages: 200,
					title: "Some third title",
					authors: ["Bob Markson", "Mark Bobson"],
					date_published: 1997,
					description:
						"This is longish description of this book which is fairly long but actually it's not that long because it's just being typed out as we speak, or should I say as we type?",
					dewey_decimal: "567.123/Mon",
					image: "https://dummyimage.com/70x70/cc2121/2b2c36&text=tiny",
				},
				{
					isbn: "9780320037801",
					publisher: "OUP",
					pages: 250,
					synopsis: "This is a shortish synopsis because why not?",
					title: "Title the 4th",
					authors: ["Jamie Jackson", "Jamieson, Jack"],
					image: "https://dummyimage.com/300x700/08801e/9fa1bf&text=long",
				},
				{
					isbn: "9780320039324",
					publisher: "OUP",
					pages: 300,
					title: "This is the fifth",
					authors: ["Rowling, J.K."],
					date_published: 2002,
					dewey_decimal: "123",
				},
				{
					isbn: "9780320048388",
					publisher: "Cambridge University Press",
					pages: 350,
					title: "Some 6th title here",
					authors: ["J.K. Rowling"],
					date_published: 2020,
					image: null,
				},
			],
		},
	};
}

beforeEach(() => {
	jest.resetModules(); // most important - it clears the cache
	process.env = { ...OLD_ENV }; // make a copy
	resetAll();
});

afterEach(() => {
	jest.resetModules(); // most important - it clears the cache
	process.env = OLD_ENV; // restore old env
	resetAll();
});

test("When CLA_ISBNDB_API_KEY is not set", async () => {
	const fetchFromIsbnDb = require("../../common/fetchFromIsbnDb");
	expect(await fetchFromIsbnDb(mockQuery)).toEqual(mockResult.data.books);
});

test("When CLA_ISBNDB_API_KEY is not set and isbn is passed in query", async () => {
	mockQuery = "9780307283672";
	const fetchFromIsbnDb = require("../../common/fetchFromIsbnDb");
	expect(await fetchFromIsbnDb(mockQuery)).toEqual([mockResult.data.books[2]]);
});

test("When CLA_ISBNDB_API_KEY is set and query is not passed", async () => {
	process.env.CLA_ISBNDB_API_KEY = "test cla isbn api key";
	const fetchFromIsbnDb = require("../../common/fetchFromIsbnDb");
	expect(await fetchFromIsbnDb()).toEqual([]);
});

test("When CLA_ISBNDB_API_KEY is set and isbn is passed in query", async () => {
	process.env.CLA_ISBNDB_API_KEY = "test cla isbn api key";
	mockQuery = "9780307283672";
	mockResult = {
		data: {
			book: {
				isbn: "8172763654",
				publisher: "Hodde rvvvv",
				pages: 100,
				title: "Some title here: First",
				authors: ["Lake Johnson, Mary", "John Smith"],
				date_published: 2007,
				image: "https://dummyimage.com/600x400/c722c7/43499c&text=test",
			},
		},
	};
	const fetchFromIsbnDb = require("../../common/fetchFromIsbnDb");
	expect(await fetchFromIsbnDb(mockQuery)).toEqual([mockResult.data.book]);
	expect(axiosParams.method).toEqual("get");
	expect(axiosParams.url).toEqual("https://api.pro.isbndb.com/book/9780307283672");
});

test("When CLA_ISBNDB_API_KEY is set and title is passed in query", async () => {
	process.env.CLA_ISBNDB_API_KEY = "test cla isbn api key";
	const fetchFromIsbnDb = require("../../common/fetchFromIsbnDb");
	expect(await fetchFromIsbnDb(mockQuery)).toEqual(mockResult.data.books);
	expect(axiosParams.method).toEqual("get");
	expect(axiosParams.url).toEqual("https://api.pro.isbndb.com/books/test%20query");
});

test("When CLA_ISBNDB_API_KEY is set and api not returns data", async () => {
	process.env.CLA_ISBNDB_API_KEY = "test cla isbn api key";
	mockResult.data = null;
	const fetchFromIsbnDb = require("../../common/fetchFromIsbnDb");
	expect(await fetchFromIsbnDb(mockQuery)).toEqual([]);
});

test("When CLA_ISBNDB_API_KEY is set and api not returns data in array", async () => {
	process.env.CLA_ISBNDB_API_KEY = "test cla isbn api key";
	mockResult = {
		data: {
			books: {
				isbn: "8172763654",
				publisher: "Hodde rvvvv",
				pages: 100,
				title: "Some title here: First",
				authors: ["Lake Johnson, Mary", "John Smith"],
				date_published: 2007,
				image: "https://dummyimage.com/600x400/c722c7/43499c&text=test",
			},
		},
	};
	const fetchFromIsbnDb = require("../../common/fetchFromIsbnDb");
	expect(await fetchFromIsbnDb(mockQuery)).toEqual([]);
});
