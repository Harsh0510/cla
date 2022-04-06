function authorToString(author) {
	return author.firstName + " " + author.lastName;
}

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

function getOrdinalSuffix(i) {
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
}

function getContributorsList(contributors) {
	return {
		authors: contributors.filter((auth) => auth.role === "A"),
		editors: contributors.filter((auth) => auth.role === "B"),
		translators: contributors.filter((auth) => auth.role === "T"),
	};
}

function bindShortString(authorsEditorsList) {
	let lastIndex, item;
	lastIndex = authorsEditorsList.length - 1;
	if (authorsEditorsList.length === 2) {
		return authorsEditorsList.map((item, idx) => item.firstName + " " + item.lastName + (idx !== lastIndex ? " and " : ""));
	} else if (authorsEditorsList.length > 2) {
		item = authorsEditorsList[0];
		return item.firstName + " " + item.lastName + ", et al.";
	} else {
		item = authorsEditorsList[0];
		return item.firstName + " " + item.lastName;
	}
}

function getLongFormContributors(contributors) {
	if (!Array.isArray(contributors) || !contributors.length) {
		return null;
	}
	const longFormAuthorsEditors = {
		authors: "",
		editors: "",
		translators: "",
	};
	const authorsEditorsData = getContributorsList(contributors);
	if (authorsEditorsData.authors.length > 0) {
		longFormAuthorsEditors.authors = getAuthors(authorsEditorsData.authors);
	}
	if (authorsEditorsData.editors.length > 0) {
		longFormAuthorsEditors.editors = getAuthors(authorsEditorsData.editors);
	}
	if (authorsEditorsData.translators.length > 0) {
		longFormAuthorsEditors.translators = getAuthors(authorsEditorsData.translators);
	}
	longFormAuthorsEditors.raw = authorsEditorsData;
	return longFormAuthorsEditors;
}

function getShortFormContributors(work_authors) {
	if (Array.isArray(work_authors) && work_authors.length > 0) {
		const shortFormAuthorsEditors = {
			authors: "",
			editors: "",
			translators: "",
		};
		const data = getContributorsList(work_authors);
		if (data.authors.length > 0) {
			shortFormAuthorsEditors.authors = bindShortString(data.authors);
		}
		if (data.editors.length > 0) {
			shortFormAuthorsEditors.editors = bindShortString(data.editors);
		}
		if (data.translators.length > 0) {
			shortFormAuthorsEditors.translators = bindShortString(data.translators);
		}
		shortFormAuthorsEditors.raw = data;
		return shortFormAuthorsEditors;
	}
	return null;
}

export { getAuthors, getOrdinalSuffix, getShortFormContributors, getLongFormContributors };
