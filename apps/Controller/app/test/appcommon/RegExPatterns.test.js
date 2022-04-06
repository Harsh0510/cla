const RegExPatterns = require("../../common/RegExPatterns");

function checkProperties(obj) {
	let res = false;
	for (var key in obj) {
		if (obj[key] !== null && obj[key] != "") {
			res = true;
		} else {
			res = false;
			break;
		}
	}
	return res;
}

let mockRegExPatterns, value;

function resetAll() {
	mockRegExPatterns = {
		name: /^[^\r\t\n\]\[¬|\<>?:@~{}_+!£$%^&/*,./;#\[\]|]{1,255}$/,
		common: /^[^\r\t\n\]\[¬|<>?:@~{}_+!£$%^&*;#\[\]|]{1,255}$/,
		alphaNumeric: /^[a-zA-Z0-9 ]*$/,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Return true when 'RegExPatterns' is Object`, async () => {
	const item = Object.prototype.toString.call(RegExPatterns).slice(8, -1) === "Object" ? true : false;
	expect(item).toBe(true);
});

test(`Return false when 'RegExPatterns' is Object`, async () => {
	const item = Object.prototype.toString.call(RegExPatterns).slice(8, -1) !== "Object" ? true : false;
	expect(item).toBe(false);
});

test(`Count 'RegExPatterns' object size`, async () => {
	var item = Object.keys(RegExPatterns);
	expect(item.length).toBe(3);
});

test(`Object 'RegExPatterns' key is not empty`, async () => {
	const item = checkProperties(RegExPatterns) ? true : false;
	expect(item).toBe(true);
});

test(`Object 'RegExPatterns' name key is not empty`, async () => {
	const item = RegExPatterns.name ? true : false;
	expect(item).toBe(true);
});

test(`Object 'RegExPatterns' alphaNumeric key is not empty`, async () => {
	const item = RegExPatterns.alphaNumeric ? true : false;
	expect(item).toBe(true);
});

test(`Object 'RegExPatterns' common key is not empty`, async () => {
	const item = RegExPatterns.common ? true : false;
	expect(item).toBe(true);
});

test(`Match all keys value of 'RegExPatterns' object`, async () => {
	expect(RegExPatterns.name).toEqual(mockRegExPatterns.name);
	expect(RegExPatterns.common).toEqual(mockRegExPatterns.common);
	expect(RegExPatterns.alphaNumeric).toEqual(mockRegExPatterns.alphaNumeric);
});

describe(`Match 'name' regex pattern`, () => {
	/** Match with valid string */
	test(`Match with valid string`, async () => {
		value = "foo";
		const item = value.match(RegExPatterns.name) ? true : false;
		expect(item).toBe(true);
	});

	/** Value allowed with space */
	test(`Value allowed with space`, async () => {
		value = "foo foo";
		const item = value.match(RegExPatterns.name) ? true : false;
		expect(item).toBe(true);
	});

	/** Value not allowed special character */
	test(`Value not allowed special character`, async () => {
		value = "foo foo @$%";
		const item = value.match(RegExPatterns.name) ? true : false;
		expect(item).toBe(false);
	});

	/** Value not allowed above 255 character */
	test(`Value not allowed above 255 character`, async () => {
		value = "Hello world";
		value = value.repeat(300);
		const item = value.match(RegExPatterns.name) ? true : false;
		expect(item).toBe(false);
	});
});

describe(`Match 'common' regex pattern`, () => {
	/** Match with valid string */
	test(`Match with valid string`, async () => {
		value = "foo";
		const item = value.match(RegExPatterns.common) ? true : false;
		expect(item).toBe(true);
	});

	/** Value allowed with space */
	test(`Value allowed with space`, async () => {
		value = "1foo foo";
		const item = value.match(RegExPatterns.common) ? true : false;
		expect(item).toBe(true);
	});

	/** Value not allowed special character */
	test(`Value not allowed special character`, async () => {
		value = "foo foo .;/";
		const item = value.match(RegExPatterns.common) ? true : false;
		expect(item).toBe(false);
	});

	/** Value not allowed above 255 character */
	test(`Value not allowed above 255 character`, async () => {
		value = "Hello world";
		value = value.repeat(300);
		const item = value.match(RegExPatterns.common) ? true : false;
		expect(item).toBe(false);
	});
});

describe(`Match 'alphaNumeric' regex pattern`, () => {
	/** Match with valid string */
	test(`Match with valid string`, async () => {
		value = "foo";
		const item = value.match(RegExPatterns.alphaNumeric) ? true : false;
		expect(item).toBe(true);
	});

	/** Value allowed with space */
	test(`Value allowed with space`, async () => {
		value = "1foo foo";
		const item = value.match(RegExPatterns.alphaNumeric) ? true : false;
		expect(item).toBe(true);
	});

	/** Value not allowed with special character */
	test(`Value allowed with space`, async () => {
		value = "1foo foo&*(";
		const item = value.match(RegExPatterns.alphaNumeric) ? true : false;
		expect(item).toBe(false);
	});
});
