const validators = Object.create(null);

validators.notEmpty = (value) => {
	if (value) {
		return null;
	}
	return `a value is required`;
};

validators.minLength = (length) => {
	return (value) => {
		if (!value) {
			return null;
		}
		if (typeof value !== "string") {
			return null;
		}
		if (value.length >= length) {
			return null;
		}
		return `must be at least ${length} characters`;
	};
};

validators.maxLength = (length) => {
	return (value) => {
		if (!value) {
			return null;
		}
		if (typeof value !== "string") {
			return null;
		}
		if (value.length <= length) {
			return null;
		}
		return `must be at most ${length} characters`;
	};
};

validators.integer = (value) => {
	if (value === "" || value === null || value === undefined) {
		return null;
	}
	if (parseInt(value, 10) == value) {
		return null;
	}
	return `must be a whole number`;
};

validators.positiveInteger = (value) => {
	if (value === "" || value === null || value === undefined) {
		return null;
	}
	const v = parseInt(value, 10);
	if (v != value) {
		return `must be a positive number`;
	}
	if (v < 0) {
		return `must be a positive number`;
	}
	return null;
};

validators.string = (value) => {
	if (typeof value === "string") {
		return null;
	}
	return `must be a string`;
};

validators.matchesRegex = (regex) => {
	return (value) => {
		if (!value) {
			return null;
		}
		const err = validators.string(value);
		if (err) {
			return err;
		}
		if (regex.test(value)) {
			return null;
		}
		return `not a valid value`;
	};
};

const emailMatcher = validators.matchesRegex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

validators.email = (value) => {
	const err = emailMatcher(value);
	if (!err) {
		return null;
	}
	return `must be a valid email address`;
};

const strongPasswordMatcher = validators.matchesRegex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/);

validators.strongPassword = (value) => {
	const err = strongPasswordMatcher(value);
	if (!err) {
		return null;
	}
	return `must be a strong password`;
};

export default validators;
