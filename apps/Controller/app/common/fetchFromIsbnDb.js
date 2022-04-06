const axios = require("axios");

const ISBN = require("./isbn").ISBN;

const dummyResults = [
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
];

const dummy = async (query) => {
	const v = ISBN.parse(query);
	let isbn = null;
	if (v && v.isValid()) {
		isbn = v.asIsbn13();
	}
	if (isbn) {
		const result = dummyResults.filter((d) => d.isbn === isbn);
		if (result.length) {
			return result;
		}
	}
	return dummyResults.slice(0, Math.max(0, query.length - 4));
};

const real = async (query) => {
	if (!query) {
		return [];
	}
	const v = ISBN.parse(query);
	let isbn = null;
	if (v && v.isValid()) {
		isbn = v.asIsbn13();
	}
	let segment;
	if (isbn) {
		segment = "/book/" + isbn;
	} else {
		segment = "/books/" + encodeURIComponent(query);
	}

	const result = await axios({
		method: "get",
		url: "https://api.pro.isbndb.com" + segment,
		params: {
			pageSize: 6,
		},
		headers: {
			Authorization: process.env.CLA_ISBNDB_API_KEY,
		},
		validateStatus: () => true,
	});

	if (!result.data) {
		return [];
	}
	if (result.data.books && Array.isArray(result.data.books)) {
		return result.data.books;
	}
	if (result.data.book) {
		return [result.data.book];
	}
	return [];
};

module.exports = process.env.CLA_ISBNDB_API_KEY ? real : dummy;
