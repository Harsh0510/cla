const ensure = require("#tvf-ensure");

const fetchFromIsbnDb = require("../../common/fetchFromIsbnDb");
const ISBN = require("../../common/isbn").ISBN;

const getPublicationYear = (str) => {
	if (typeof str === "number") {
		return str;
	}
	if (typeof str !== "string") {
		return null;
	}
	return parseInt(str.slice(0, 4), 10);
};

const mapper = (item) => ({
	isbn: ISBN.parse(item.isbn13 || item.isbn).asIsbn13(),
	publisher: item.publisher,
	page_count: item.pages,
	title: item.title || item.title_long,
	authors: item.authors,
	publication_year: getPublicationYear(item.date_published),
	dewey_class: item.dewey_decimal,
	image: item.image || null,
});

module.exports = async function (params, ctx) {
	ensure.nonEmptyStr(ctx, params.query, "query");

	const results = await fetchFromIsbnDb(params.query);

	return {
		results: results.map(mapper),
	};
};
