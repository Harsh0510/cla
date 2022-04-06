import { matchRegEx, checkStringLength } from "../inputStringIsValid";
import RegExPatterns from "../RegExPatterns";

let mockResultMatchRegex, value, mockResultcheckString;

function resetAll() {
	value = "email@gmail.com";
	mockResultMatchRegex = {
		isValid: false,
		message: null,
	};
	mockResultcheckString = {
		isValid: true,
		message: null,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

describe("matchRegEx function", () => {
	/** Return when not pass anything to the matchRegEx function  */
	test(`Return when not pass anything to the matchRegEx function`, async () => {
		const item = matchRegEx();
		expect(item).toEqual(mockResultMatchRegex);
	});

	/** Return when not pass pattern to the matchRegEx function  */
	test(`Return when not pass pattern to the matchRegEx function`, async () => {
		mockResultMatchRegex.isValid = true;
		const item = matchRegEx(value, "");
		expect(item).toEqual(mockResultMatchRegex);
	});

	/** Return when not pass value to the matchRegEx function  */
	test(`Return when not pass value to the matchRegEx function`, async () => {
		const item = matchRegEx(null, RegExPatterns.name);
		expect(item).toEqual(mockResultMatchRegex);
	});

	/** Error when pattern not match */
	test(`Error when pattern not match`, async () => {
		mockResultMatchRegex.message = "Special characters are not allowed";
		const item = matchRegEx(value, RegExPatterns.name);
		expect(item).toEqual(mockResultMatchRegex);
	});

	/** Success when pass 'value' and pattern to the matchRegEx function */
	test(`Success when pass 'value' and pattern to the matchRegEx function`, async () => {
		value = "foo";
		mockResultMatchRegex.isValid = true;
		const item = matchRegEx(value, RegExPatterns.name);
		expect(item).toEqual(mockResultMatchRegex);
	});
});

describe("checkStringLength function", () => {
	/** Return when not pass anything to the checkStringLength function  */
	test(`Return when not pass anything to the checkStringLength function`, async () => {
		const item = checkStringLength();
		expect(item).toEqual(mockResultcheckString);
	});

	/** Return when not pass min and max length to the checkStringLength function  */
	test(`Return when not pass min and max length to the checkStringLength function`, async () => {
		value = "abcdefg";
		const item = checkStringLength(value, "");
		expect(item).toEqual(mockResultcheckString);
	});

	/** Return when not pass value to the checkStringLength function  */
	test(`Return when not pass value to the matchRegEx function`, async () => {
		const item = checkStringLength(null, 1, 100);
		expect(item).toEqual(mockResultcheckString);
	});

	/** Error when filed value is less than min value */
	test(`Error when filed value is less than min value`, async () => {
		value = "a";
		mockResultcheckString.isValid = false;
		mockResultcheckString.message = "Minimum 5 characters required";
		const item = checkStringLength(value, 5, null);
		expect(item).toEqual(mockResultcheckString);
	});

	/** Error when filed value is more than max value */
	test(`Error when filed value is more than max value`, async () => {
		value = "abcdabcdj";
		mockResultcheckString.isValid = false;
		mockResultcheckString.message = "Maximum 8 characters required";
		const item = checkStringLength(value, null, 8);
		expect(item).toEqual(mockResultcheckString);
	});

	/** Error when filed value is not between min and max value*/
	test(`Error when filed value is more than max value`, async () => {
		value = "abcdabcdjtret";
		mockResultcheckString.isValid = false;
		mockResultcheckString.message = "please ensure this value must be between 8 to 10";
		const item = checkStringLength(value, 8, 10);
		expect(item).toEqual(mockResultcheckString);
	});

	/** Sucess when the value is between min and max value*/
	test(`Sucess when the value is between min and max value`, async () => {
		value = "abcde";
		const item = checkStringLength(value, 1, 5);
		expect(item).toEqual(mockResultcheckString);
	});
});
