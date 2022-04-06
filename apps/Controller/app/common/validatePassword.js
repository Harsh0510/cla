const validatePassword = (pw) => {
	if (!pw) {
		return "Password not provided";
	}
	if (pw.length < 8) {
		return "Password must be at least 8 characters.";
	}
	if (!pw.match(/[a-z]/)) {
		return "Password must contain at least one lowercase letter.";
	}
	if (!pw.match(/[A-Z]/)) {
		return "Password must contain at least one uppercase letter.";
	}
	if (!pw.match(/[0-9]/)) {
		return "Password must contain at least one number.";
	}
	if (!pw.match(/\W/)) {
		return "Password must contain at least one special character.";
	}
	return null; // no errors
};

module.exports = validatePassword;
