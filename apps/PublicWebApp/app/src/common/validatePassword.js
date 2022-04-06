const passwordIsStrong = (pw) => {
	if (!pw) {
		return "PASSWORD_NOT_PROVIDED";
	}
	if (pw.length < 8) {
		return "PASSWORD_8_CHARACTER";
	}
	if (!pw.match(/[a-z]/)) {
		return "PASSWORD_LOWER_CHARACTER";
	}
	if (!pw.match(/[A-Z]/)) {
		return "PASSWORD_UPPER_CHARACTER";
	}
	if (!pw.match(/[0-9]/)) {
		return "PASSWORD_NUMBER_CHARACTER";
	}
	if (!pw.match(/\W/)) {
		return "PASSWORD_SPECIAL_CHARACTER";
	}
	return null; // no errors
};

export default passwordIsStrong;
