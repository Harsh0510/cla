const RegExPatterns = require("./RegExPatterns");

const noAssert = {
	nameIsValid(value, name, pattern) {
		if (!value) {
			return name + " not provided";
		}
		if (typeof value !== "string") {
			return name + " invalid";
		}
		if (!value.match(pattern)) {
			return name + " should not contain special characters";
		}
	},
	isAlphaNumeric(value, name) {
		if (!value) {
			return name + " not provided";
		}
		if (typeof value !== "string") {
			return name + " invalid";
		}
		if (!value.match(RegExPatterns.alphaNumeric)) {
			return name + " should not contain special characters";
		}
	},
	lengthIsValid(value, name, minLength, maxLength) {
		if (!value) {
			return name + " not provided";
		}
		if (typeof value !== "string") {
			return name + " invalid";
		}
		if (minLength && maxLength) {
			if (!(value.toString().length >= minLength && value.toString().length <= maxLength)) {
				return name + " must be between " + minLength + " and " + maxLength + " characters";
			}
		} else if (maxLength) {
			if (value.toString().length > maxLength) {
				return name + " must not exceed " + maxLength + " characters";
			}
		} else if (minLength) {
			if (value.toString().length < minLength) {
				return name + " must be at least " + minLength + " characters";
			}
		}
	},
	nonNegativeIntegerWithMinMax(value, name, minSize, maxSize) {
		if (typeof value !== "number") {
			return name + " invalid";
		}
		if (Math.floor(value) != value) {
			return name + " must be an integer";
		}
		if (value < 0) {
			return name + " must not be negative";
		}
		if (minSize && maxSize) {
			if (!(value >= minSize && value <= maxSize)) {
				return name + " must be between " + minSize + " and " + maxSize;
			}
		} else if (maxSize) {
			if (value > maxSize) {
				return name + " must not exceed " + maxSize;
			}
		} else if (minSize) {
			if (value < minSize) {
				return name + " must be at least " + minSize;
			}
		}
	},
};

function wrapper(func) {
	return function (ctx, ...args) {
		const msg = func(...args);
		if (msg) {
			ctx.throw(400, msg);
		}
	};
}

const withAssert = Object.create(null);
Object.keys(noAssert).forEach((name) => {
	withAssert[name] = wrapper(noAssert[name]);
});
withAssert.noAssert = noAssert;

module.exports = withAssert;
