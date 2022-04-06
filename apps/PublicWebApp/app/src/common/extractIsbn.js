const extractIsbn = (str) => {
	if (!str) {
		return null;
	}
	if (typeof str !== "string") {
		return null;
	}
	const isbnMatches = str.match(/^97[0-9]{10}[xX0-9]/);
	if (isbnMatches) {
		return isbnMatches[0];
	}
	const issnMatches = str.match(/^\d{4}-\d{3}[\dX]-20[0-9]{2}-[0-9]{2}-[^-]+/);
	if (issnMatches) {
		return issnMatches[0];
	}
	return null;
};

export default extractIsbn;
