const hide = (str) => {
	const len = str.length;
	if (len < 2) {
		return str;
	}
	return str[0] + "*".repeat(len - 2) + str[len - 1];
};

/**
 * @brief Obfuscates an email address - e.g. 'abcde.fghi@foo.co.uk' -> 'a***e.f**i@foo.co.uk'
 * @param {string} email
 */
module.exports = (email) => {
	const [leftPart, rightPart] = email.split("@");
	const bits = leftPart.split(/([^a-zA-Z0-9]+)/g);
	let ret = hide(bits.shift());
	for (let i = 0, len = bits.length; i < len; i += 2) {
		ret += bits[i];
		ret += hide(bits[i + 1]);
	}
	return ret + "@" + rightPart;
};
