const ISBN = require("../../../../Controller/app/common/isbn").ISBN;

const eanIsValid = (ean) => {
	const p = ISBN.parse(ean);
	if (!p) {
		return false;
	}
	if (!p.isIsbn13()) {
		return false;
	}
	return true;
};

export default eanIsValid;
