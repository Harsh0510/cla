const path = require("path");

const allHandlers = [
	// ISBN handles intentionally come first so we know on which ISBN errors occurred
	"isbn13",
	"pdfIsbn13",
	"issnId",
	// Title also comes early so we definitely have a title in case errors occur.
	"title",

	"authors",
	"contentForm",
	"copyExcludedPages",
	"coverUris",
	"description",
	"doi",
	"edition",
	"educationalYearGroup",
	"exam",
	"examBoard",
	"extent",
	"imprint",
	"issueNumber",
	"keyStage",
	"language",
	"level",
	"pageOffsetArabic",
	"pageOffsetRoman",
	"parentAsset",
	"publicationDate",
	"publisher",
	"recordReference",
	"scottishLevel",
	"collection",
	"subjects",
	"subtitle",
	"tableOfContents",
	"volumeNumber",
];

module.exports = allHandlers.map((name) => {
	const ret = require(path.join(__dirname, "handlers", name + ".js"));
	ret._NAME_ = name;
	return ret;
});
