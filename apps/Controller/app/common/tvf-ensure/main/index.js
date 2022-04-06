const emailValidator = require("email-validator");
const ISBN = require("./isbn").ISBN;
const issnIsValid = require("./issnIsValid");

const noAssert = {
	validIsbn13(value, name) {
		if (!value) {
			return name + " not provided";
		}
		if (typeof value !== "string") {
			return name + " invalid";
		}
		if (value.length !== 13) {
			return name + " not valid";
		}
		const p = ISBN.parse(value);
		if (!p || !p.isValid() || !p.asIsbn13()) {
			return name + " is not valid";
		}
	},
	validIssn(value, name) {
		if (!issnIsValid(value)) {
			return name + " is not valid";
		}
	},
	validAssetIdentifier(value, name) {
		if (!value) {
			return name + " not provided";
		}
		if (typeof value !== "string") {
			return name + " invalid";
		}
		if (value.length === 13) {
			// ISBN 13
			const p = ISBN.parse(value);
			if (!p || !p.isValid() || !p.asIsbn13()) {
				return name + " is not valid";
			}

			// We have a valid ISBN13!
			return;
		}
		// Maybe it's an ISSN-style identifier (e.g. 1469-8552-2016-01-199) ?
		if (value.length < 14) {
			return name + " isn't valid";
		}
		if (!issnIsValid(value.slice(0, 9))) {
			return name + " is not valid";
		}
		// It is a valid ISSN!
	},
	validIdentifier(value, name) {
		if (!value) {
			return name + " not provided";
		}
		if (typeof value !== "string") {
			return name + " invalid";
		}
		if (value.length !== 36) {
			return name + " not valid";
		}
		if (!value.match(/^[0-9a-f]+$/)) {
			return name + " is invalid";
		}
	},
	nonEmptyStr(value, name) {
		if (!value) {
			return name + " not provided";
		}
		if (typeof value !== "string") {
			return name + " invalid";
		}
	},
	nonNegativeInteger(value, name) {
		if (typeof value !== "number") {
			return name + " invalid";
		}
		if (Math.floor(value) != value) {
			return name + " must be an integer";
		}
		if (value < 0) {
			return name + " must not be negative";
		}
	},
	positiveInteger(value, name) {
		if (typeof value !== "number") {
			return name + " invalid";
		}
		if (Math.floor(value) != value) {
			return name + " must be an integer";
		}
		if (value <= 0) {
			return name + " must be positive";
		}
	},
	isEmail(value, name) {
		if (!value) {
			return name + " not provided";
		}
		if (typeof value !== "string") {
			return name + " invalid";
		}
		if (!emailValidator.validate(value)) {
			return name + " not valid";
		}
	},
};

function wrapTester(func) {
	return function (ctx, ...args) {
		const msg = func(...args);
		if (msg) {
			ctx.throw(400, msg);
		}
	};
}

const withAssert = Object.create(null);
Object.keys(noAssert).forEach((name) => {
	withAssert[name] = wrapTester(noAssert[name]);
});

module.exports = withAssert;
withAssert.noAssert = noAssert;
