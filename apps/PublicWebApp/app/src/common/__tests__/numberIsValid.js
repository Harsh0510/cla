const numberIsValid = require("../../common/numberIsValid");

let mockResultNumberIsValid, value, fieldTitle;

function resetAll() {
	value = "150";
	fieldTitle = "number of student";
	mockResultNumberIsValid = {
		isValid: false,
		message: null,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Return when not pass anything to the numberIsValid function  */
test(`Return when not pass anything to the numberIsValid function`, async () => {
	const item = numberIsValid("");
	expect(item).toEqual(mockResultNumberIsValid);
});

/** Success when not pass min and max length to the numberIsValid function  */
test(`Success when not pass min and max length to the numberIsValid function`, async () => {
	mockResultNumberIsValid.isValid = true;
	const item = numberIsValid(value, null, null, fieldTitle);
	expect(item).toEqual(mockResultNumberIsValid);
});

/** Return when not pass value to the numberIsValid function  */
test(`Return when not pass value to the numberIsValid function`, async () => {
	const item = numberIsValid(null, null, null, null);
	expect(item).toEqual(mockResultNumberIsValid);
});

/** Error when filed value pass non digit */
test(`Error when filed value pass non digit`, async () => {
	value = "abc";
	const item = numberIsValid(value, null, null, fieldTitle);
	expect(item).toEqual(mockResultNumberIsValid);
});

/** Error when filed value is less than min value */
test(`Error when filed value is less than min value`, async () => {
	value = "15";
	const item = numberIsValid(value, 20, null, fieldTitle);
	expect(item).toEqual(mockResultNumberIsValid);
});

/** Error when filed value is more than max value */
test(`Error when filed value is more than max value`, async () => {
	value = "50";
	const item = numberIsValid(value, null, 40, fieldTitle);
	expect(item).toEqual(mockResultNumberIsValid);
});

/** Error when filed value is not between min and max value*/
test(`Error when filed value is more than max value`, async () => {
	value = "120";
	mockResultNumberIsValid.isValid = false;
	mockResultNumberIsValid.message = "The number of student must be a number between 1 and 100";
	const item = numberIsValid(value, 1, 100, fieldTitle);
	expect(item).toEqual(mockResultNumberIsValid);
});

/** Error when not pass fieldtitle and number not between min and max value*/
test(`Error when not pass fieldtitle and number not between min and max value`, async () => {
	value = "120";
	mockResultNumberIsValid.isValid = false;
	mockResultNumberIsValid.message = "The field must be a number between 1 and 100";
	const item = numberIsValid(value, 1, 100, null);
	expect(item).toEqual(mockResultNumberIsValid);
});

/** Sucess when the value is between min and max value*/
test(`Sucess when the value is between min and max value`, async () => {
	value = "50";
	mockResultNumberIsValid.isValid = true;
	const item = numberIsValid(value, 1, 100, fieldTitle);
	expect(item).toEqual(mockResultNumberIsValid);
});
