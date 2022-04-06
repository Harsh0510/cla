/**
 * ISBN utilities.
 * This library is used by the Controller AND PublicWebApp, so it must be ES3-compatible to eliminate core-js weirdness.
 * ES3-compatible means no classes, no arrow functions, no lets, no consts, no object spreads, no async/await, etc.
 */

/**
 * Check whether the provided ISBN 10 string is valid according to the checksum calculation.
 * @param {string} str
 * @returns {boolean} Is it valid?
 */
function isbn10CheckDigitIsValid(str) {
	var i;
	var s = 0;
	var t = 0;

	for (i = 0; i < 10; i++) {
		t += parseInt(str[i], 10);
		s += t;
	}
	return s % 11 == 0;
}

/**
 * Calculate the check digit of an ISBN 12 string.
 * @param {string} str
 * @returns {number}
 */
function check13(str) {
	var sum = 0;
	for (var i = 0; i < 12; i++) {
		var digit = parseInt(str[i], 10);
		if (i % 2 == 1) {
			sum += 3 * digit;
		} else {
			sum += digit;
		}
	}
	return (10 - (sum % 10)) % 10;
}

/**
 * Converts a valid ISBN 10 string to an ISBN 13.
 * @param {string} str The valid ISBN 10 string.
 * @returns {string} The ISBN 13.
 */
function convertIsbn10ToIsbn13(str) {
	var isbn13 = "978" + str;
	return isbn13.slice(0, -1) + check13(isbn13).toString();
}

function ISBN(type, value) {
	this._type = type;
	this._value = value;
}

ISBN.prototype.isIsbn10 = function () {
	return this._type === "isbn10";
};
ISBN.prototype.isIsbn13 = function () {
	return this._type === "isbn13";
};

/**
 * Is this ISBN valid? Currently only here for backwards compatibility.
 */
ISBN.prototype.isValid = function () {
	return true;
};
ISBN.prototype.asIsbn13 = function () {
	if (this._type === "isbn13") {
		return this._value;
	}
	return convertIsbn10ToIsbn13(this._value);
};

/**
 * Parse a possible ISBN string or number.
 * @param {string|number} [str] The possible ISBN.
 * @returns {ISBN|null} An object representing the parsed ISBN if successful, null otherwise.
 */
function parse(str) {
	if (!str) {
		return null;
	}
	if (typeof str !== "string" && typeof str !== "number") {
		return null;
	}
	if (typeof str === "string") {
		str = str.replace(/[^0-9X]/gi, "").toUpperCase();
	} else {
		str = str.toString();
	}
	var len = str.length;
	if (len !== 10 && len !== 13) {
		return null;
	}
	var type;
	var isValid;
	if (len === 10) {
		type = "isbn10";
		isValid = isbn10CheckDigitIsValid(str);
	} else {
		type = "isbn13";
		isValid = str.match(/^97[89]/) && check13(str).toString() === str[12];
	}
	if (!isValid) {
		return null;
	}
	return new ISBN(type, str);
}

module.exports = {
	ISBN: {
		parse: parse,
	},
};
