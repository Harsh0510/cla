import errorType from "../errorType";

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

let mockTypeValue;

function resetAll() {
	mockTypeValue = {
		validation: "validation",
		length: "length",
		required: "required",
		confirmPasswordNotMatch: "confirmPasswordNotMatch",
		passwordNotProvide: "PASSWORD_NOT_PROVIDED",
		passwordLeast8Character: "PASSWORD_8_CHARACTER",
		passwordLowerCharacter: "PASSWORD_LOWER_CHARACTER",
		passwordUpperCharacter: "PASSWORD_UPPER_CHARACTER",
		passwordNumberCharacter: "PASSWORD_NUMBER_CHARACTER",
		passwordSpecialCharacter: "PASSWORD_SPECIAL_CHARACTER",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/**  `Return true when 'errorType' is Object` */
test(`Return true when 'errorType' is Object`, async () => {
	const item = Object.prototype.toString.call(errorType).slice(8, -1) === "Object" ? true : false;
	expect(item).toBe(true);
});

/** `Return false when 'errorType' is Object` */
test(`Return false when 'errorType' is Object`, async () => {
	const item = Object.prototype.toString.call(errorType).slice(8, -1) !== "Object" ? true : false;
	expect(item).toBe(false);
});

/** Count 'errorType' object size */
test(`Count 'errorType' object size`, async () => {
	var item = Object.keys(errorType);
	expect(item.length).toBe(10);
});

/** Object 'errorType' key is not empty */
test(`Object 'errorType' key is not empty`, async () => {
	const item = checkProperties(errorType) ? true : false;
	expect(item).toBe(true);
});

/** Object 'errorType' validation key is not empty */
test(`Object 'errorType' validation key is not empty`, async () => {
	const item = errorType.validation ? true : false;
	expect(item).toBe(true);
});

/** Object 'errorType' length key is not empty */
test(`Object 'errorType' length key is not empty`, async () => {
	const item = errorType.length ? true : false;
	expect(item).toBe(true);
});

/** Object 'errorType' required key is not empty */
test(`Object 'errorType' required key is not empty`, async () => {
	const item = errorType.required ? true : false;
	expect(item).toBe(true);
});

/** Match all keys value of 'errorType' object */
test(`Match all keys value of 'errorType' object`, async () => {
	expect(errorType.validation).toEqual(mockTypeValue.validation);
	expect(errorType.length).toEqual(mockTypeValue.length);
	expect(errorType.required).toEqual(mockTypeValue.required);
	expect(errorType.confirmPasswordNotMatch).toEqual(mockTypeValue.confirmPasswordNotMatch);
	expect(errorType.passwordNotProvide).toEqual(mockTypeValue.passwordNotProvide);
	expect(errorType.passwordLeast8Character).toEqual(mockTypeValue.passwordLeast8Character);
	expect(errorType.passwordLowerCharacter).toEqual(mockTypeValue.passwordLowerCharacter);
	expect(errorType.passwordUpperCharacter).toEqual(mockTypeValue.passwordUpperCharacter);
	expect(errorType.passwordNumberCharacter).toEqual(mockTypeValue.passwordNumberCharacter);
	expect(errorType.passwordSpecialCharacter).toEqual(mockTypeValue.passwordSpecialCharacter);
});
