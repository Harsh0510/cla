import RegExPatterns from "../RegExPatterns";

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
		copyTitle: /^[^\r\t\n\]\[¬|<>?:@~{}_+!£$%^*;#\[\]|]{1,255}$/,
		floatNumeric: /(^-?\d\d*\.\d\d*$)|(^-?\.\d\d*$)|(^-?\d*$)/,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Return true when 'RegExPatterns' is Object */
test(`Return true when 'RegExPatterns' is Object`, async () => {
	const item = Object.prototype.toString.call(RegExPatterns).slice(8, -1) === "Object" ? true : false;
	expect(item).toBe(true);
});

/** Return false when 'RegExPatterns' is Object */
test(`Return false when 'RegExPatterns' is Object`, async () => {
	const item = Object.prototype.toString.call(RegExPatterns).slice(8, -1) !== "Object" ? true : false;
	expect(item).toBe(false);
});

/** Count 'RegExPatterns' object size */
test(`Count 'RegExPatterns' object size`, async () => {
	var item = Object.keys(RegExPatterns);
	expect(item.length).toBe(5);
});

/** Object 'RegExPatterns' key is not empty */
test(`Object 'RegExPatterns' key is not empty`, async () => {
	const item = checkProperties(RegExPatterns) ? true : false;
	expect(item).toBe(true);
});

/** Object 'RegExPatterns' name key is not empty */
test(`Object 'RegExPatterns' name key is not empty`, async () => {
	const item = RegExPatterns.name ? true : false;
	expect(item).toBe(true);
});

/** Object 'RegExPatterns' alphaNumeric key is not empty */
test(`Object 'RegExPatterns' alphaNumeric key is not empty`, async () => {
	const item = RegExPatterns.alphaNumeric ? true : false;
	expect(item).toBe(true);
});

/** Object 'RegExPatterns' common key is not empty */
test(`Object 'RegExPatterns' common key is not empty`, async () => {
	const item = RegExPatterns.common ? true : false;
	expect(item).toBe(true);
});

/** Object 'RegExPatterns' copyTitle key is not empty */
test(`Object 'RegExPatterns' copyTitle key is not empty`, async () => {
	const item = RegExPatterns.copyTitle ? true : false;
	expect(item).toBe(true);
});

/** Object 'RegExPatterns' floatNumeric key is not empty */
test(`Object 'RegExPatterns' floatNumeric key is not empty`, async () => {
	const item = RegExPatterns.floatNumeric ? true : false;
	expect(item).toBe(true);
});

/** Match all keys value of 'RegExPatterns' object */
test(`Match all keys value of 'RegExPatterns' object`, async () => {
	expect(RegExPatterns.name).toEqual(mockRegExPatterns.name);
	expect(RegExPatterns.common).toEqual(mockRegExPatterns.common);
	expect(RegExPatterns.copyTitle).toEqual(mockRegExPatterns.copyTitle);
	expect(RegExPatterns.floatNumeric).toEqual(mockRegExPatterns.floatNumeric);
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

describe(`Match 'copyTitle' regex pattern`, () => {
	/** Match with valid string */
	test(`Match with valid string`, async () => {
		value = "foo";
		const item = value.match(RegExPatterns.copyTitle) ? true : false;
		expect(item).toBe(true);
	});

	/** Value allowed with space */
	test(`Value allowed with space`, async () => {
		value = "1foo foo";
		const item = value.match(RegExPatterns.copyTitle) ? true : false;
		expect(item).toBe(true);
	});

	/** Value not allowed special character */
	test(`Value not allowed special character`, async () => {
		value = "foo foo .;/";
		const item = value.match(RegExPatterns.copyTitle) ? true : false;
		expect(item).toBe(false);
	});

	/** Value not allowed above 255 character */
	test(`Value not allowed above 255 character`, async () => {
		value = "Hello world";
		value = value.repeat(300);
		const item = value.match(RegExPatterns.copyTitle) ? true : false;
		expect(item).toBe(false);
	});
});

describe(`Match 'floatNumeric' regex pattern`, () => {
	/** Match with valid float */
	test(`Match with valid float`, async () => {
		value = "1.0";
		const item = value.match(RegExPatterns.floatNumeric) ? true : false;
		expect(item).toBe(true);
	});

	/** Match with valid integer */
	test(`Match with valid float`, async () => {
		value = "1";
		const item = value.match(RegExPatterns.floatNumeric) ? true : false;
		expect(item).toBe(true);
	});

	/** Value not allowed with space */
	test(`Value not allowed with space`, async () => {
		value = "1  0";
		const item = value.match(RegExPatterns.floatNumeric) ? true : false;
		expect(item).toBe(false);
	});

	/** Value not allowed with special character */
	test(`Value not allowed with special character`, async () => {
		value = "1&*(";
		const item = value.match(RegExPatterns.floatNumeric) ? true : false;
		expect(item).toBe(false);
	});
});
