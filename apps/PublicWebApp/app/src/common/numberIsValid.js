module.exports = function (numberFiled, minValue, maxValue, fieldTitle) {
	let number;
	const result = {
		isValid: false,
		message: null,
	};

	if (numberFiled === null || numberFiled === "") {
		return result;
	}

	if (numberFiled.match(/^[1-9][0-9]*$/g)) {
		number = parseInt(numberFiled, "", 10);
		if (minValue && number < minValue) {
			number = minValue;
		}
		if (maxValue && number > maxValue) {
			number = maxValue;
		}
	} else {
		return result;
	}

	if (numberFiled !== number.toString()) {
		if (minValue && maxValue) {
			if (fieldTitle === null || fieldTitle === "") {
				result.message = "The field must be a number between " + minValue + " and " + maxValue;
			} else {
				result.message = "The " + fieldTitle + " must be a number between " + minValue + " and " + maxValue;
			}
		}
	} else {
		result.isValid = true;
	}

	return result;
};
