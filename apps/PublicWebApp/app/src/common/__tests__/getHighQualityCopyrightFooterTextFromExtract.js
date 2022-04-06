import getHighQualityCopyrightFooterTextFromExtract from "../../common/getHighQualityCopyrightFooterTextFromExtract";

let mockExtract, mockPageFooterText;

function resetAll() {
	mockExtract = {
		date_expired: "2019-07-31T23:59:59.999Z",
		teacher: "Peter Crawford",
		school_name: "Greenwich Observatory (CLA) School",
	};
	mockPageFooterText = "Peter Crawford, Greenwich Observatory (CLA) School. Licence expires 31 July 2019.";
}

beforeEach(resetAll);
afterEach(resetAll);

/** Return the extract copy footer text */
test(`Return the extract copy footer text`, async () => {
	const item = getHighQualityCopyrightFooterTextFromExtract(mockExtract);
	expect(item).toBe(mockPageFooterText);
});

/** Return page footer text when user not passed 'teacher' */
test(`Return page footer text when user not passed 'teacher'`, async () => {
	mockExtract.teacher = "";
	mockPageFooterText = ", Greenwich Observatory (CLA) School. Licence expires 31 July 2019.";
	const item = getHighQualityCopyrightFooterTextFromExtract(mockExtract);
	expect(item).toBe(mockPageFooterText);
});

/** Return page footer text when user not passed 'school' */
test(`Return page footer text when user not passed 'school'`, async () => {
	mockExtract.school_name = "";
	mockPageFooterText = "Peter Crawford, . Licence expires 31 July 2019.";
	const item = getHighQualityCopyrightFooterTextFromExtract(mockExtract);
	expect(item).toBe(mockPageFooterText);
});
