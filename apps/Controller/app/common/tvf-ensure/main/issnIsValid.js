const issnPattern = "^(\\d{4})-(\\d{3})([\\dX])$";
const isIssnStrict = new RegExp(issnPattern, "i");

const calculateCheckDigitFor = (digits) => {
	const result =
		digits
			.split("")
			.reverse()
			.reduce((sum, value, index) => sum + value * (index + 2), 0) % 11;

	const checkDigit = result === 0 ? 0 : 11 - result;
	if (checkDigit === 10) {
		checkDigit = "X";
	}
	return checkDigit.toString();
};

const isValid = (str) => {
	if (!str) {
		return false;
	}
	if (typeof str !== "string") {
		return false;
	}
	if (str.length !== 9) {
		return false;
	}
	const matches = str.match(isIssnStrict);
	if (!matches) {
		return false;
	}
	const actualCheckDigit = matches[3];
	const expectedCheckDigit = calculateCheckDigitFor(matches[1] + matches[2]);
	if (actualCheckDigit !== expectedCheckDigit) {
		return false;
	}
	return true;
};

module.exports = isValid;
