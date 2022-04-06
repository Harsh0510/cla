module.exports = (contentForm) => {
	let formatTitle = null;
	switch (contentForm) {
		case "BO":
			formatTitle = "Book";
			break;
		case "MI":
			formatTitle = "Magazine";
			break;
	}
	return formatTitle;
};
