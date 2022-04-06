function authorToString(author) {
	return author.firstName + " " + author.lastName;
}

const getOrdinalSuffix = function getOrdinalSuffix(i) {
	var j = i % 10,
		k = i % 100;
	if (j == 1 && k != 11) {
		return i + "st";
	}
	if (j == 2 && k != 12) {
		return i + "nd";
	}
	if (j == 3 && k != 13) {
		return i + "rd";
	}
	return i + "th";
};

function getAuthors(authors) {
	if (!Array.isArray(authors)) {
		return "";
	}
	const len = authors.length;
	if (len == 0) {
		return "";
	}
	if (len == 1) {
		return authorToString(authors[0]);
	}
	const allButLast = authors.slice(0, -1);
	const start = allButLast.map(authorToString).join(", ");
	const last = authors[len - 1];
	//const end = ', and ' + authorToString(last);
	const end = " and " + authorToString(last);
	return start + end;
}

function getAuthorsEditorsList(work_authors) {
	const data = {
		authors: [],
		editors: [],
	};
	const authorsLog = {
		roleA: "A",
		roleB: "B",
	};
	data.authors = work_authors.filter((authors) => authors.role === authorsLog.roleA);
	data.editors = work_authors.filter((editors) => editors.role === authorsLog.roleB);
	return data;
}

const getLongFormAuthorsEditors = function getLongFormAuthorsEditors(work_authors) {
	if (Array.isArray(work_authors) && work_authors.length > 0) {
		const longFormAuthorsEditors = {
			authors: "",
			editors: "",
		};
		const authorsEditorsData = getAuthorsEditorsList(work_authors);
		if (authorsEditorsData.authors.length > 0) {
			longFormAuthorsEditors.authors = getAuthors(authorsEditorsData.authors);
		}
		if (authorsEditorsData.editors.length > 0) {
			longFormAuthorsEditors.editors = getAuthors(authorsEditorsData.editors);
		}
		longFormAuthorsEditors.raw = authorsEditorsData;
		return longFormAuthorsEditors;
	}
	return null;
};

const getURLEncodeAsset = function getURLEncodeAsset(title, pdf_isbn13) {
	const assetTitle = title.replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase();
	return pdf_isbn13 + "-" + assetTitle;
};

module.exports = {
	getLongFormAuthorsEditors,
	getOrdinalSuffix,
	getURLEncodeAsset,
};
