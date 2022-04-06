const misc = require("./misc");

module.exports = function (title, authors, edition, publisher, publication_date) {
	const authorsData = misc.getLongFormAuthorsEditors(authors);
	const editionString = edition > 1 ? `${misc.getOrdinalSuffix(edition)} ed. ` : "";
	let prefix;
	if (authorsData) {
		if (authorsData.authors && !authorsData.editors) {
			prefix = authorsData.authors + "." + title + ".";
		} else if (!authorsData.authors && authorsData.editors) {
			const suffix = authorsData.raw.editors.length > 1 ? "eds" : "ed";
			prefix = authorsData.editors + ", " + suffix + ". " + title + ". ";
		} else if (authorsData.authors && authorsData.editors) {
			const eds = authorsData.raw.editors.length > 1 ? "Eds" : "Ed";
			prefix = authorsData.authors + ". " + title + ". " + eds + ". " + authorsData.editors + ". ";
		} else {
			prefix = title + ". ";
		}
	} else {
		prefix = title + ". ";
	}
	let publication_date_string = "";
	if (publication_date) {
		publication_date_string = publication_date.toString().slice(11, 15) + ".";
	}
	const suffix = editionString + publisher + (publication_date ? ", " : ". ") + publication_date_string;
	return prefix + suffix;
};
