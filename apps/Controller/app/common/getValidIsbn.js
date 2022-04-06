/**getValidIsbn */
const ISBN = require("./isbn").ISBN;

module.exports = (isbnString) => {
	if (isbnString.length >= 6 && isbnString.length <= 20) {
		let code = isbnString.replace(/[a-zA-Z-*]+/g, "");
		if (code.match(/^[0-9]+$/)) {
			let p = ISBN.parse(code);
			if (!p || !p.isValid()) {
				return null;
			}
			return p.asIsbn13();
		} else {
			return null;
		}
	}
	return null;
};
