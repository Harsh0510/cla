function checkStringLength(value, minLength, maxLength) {
	const result = {
		isValid: true,
		message: null,
	};

	if (typeof value !== "string") {
		return result;
	}

	let strLength = parseInt(value.length, "", 10);

	if (minLength && strLength < minLength) {
		result.isValid = false;
	}

	if (maxLength && strLength > maxLength) {
		result.isValid = false;
	}

	if (!result.isValid && minLength && maxLength) {
		result.isValid = false;
		result.message = "please ensure this value must be between " + minLength + " to " + maxLength;
	} else if (!result.isValid && maxLength) {
		result.isValid = false;
		result.message = "Maximum " + maxLength + " characters required";
	} else if (!result.isValid && minLength) {
		result.isValid = false;
		result.message = "Minimum " + minLength + " characters required";
	} else {
		return result;
	}

	return result;
}

function matchRegEx(value, pattern) {
	const result = {
		isValid: false,
		message: null,
	};
	if (typeof value !== "string") {
		return result;
	}

	if (value.match(pattern)) {
		result.isValid = true;
	} else {
		result.message = "Special characters are not allowed";
	}
	return result;
}

export { matchRegEx, checkStringLength };
