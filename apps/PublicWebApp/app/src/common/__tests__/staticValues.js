import staticValues from "../staticValues";

/** return static value object correctly */
test(`Count Object size`, async () => {
	const item = Object.keys(staticValues);
	expect(item.length).toBe(19);
});

test(`Object have debounceTime key`, async () => {
	const item = staticValues.hasOwnProperty("debounceTime") ? true : false;
	expect(item).toBe(true);
});

test(`Object have api key`, async () => {
	const item = staticValues.hasOwnProperty("api") ? true : false;
	expect(item).toBe(true);
});

test(`Object have noFileSelected key`, async () => {
	const item = staticValues.hasOwnProperty("noFileSelected") ? true : false;
	expect(item).toBe(true);
});

test(`Object have noSchoolSelected key`, async () => {
	const item = staticValues.hasOwnProperty("noSchoolSelected") ? true : false;
	expect(item).toBe(true);
});

test(`Object have schoolAsyncDropDown key`, async () => {
	const item = staticValues.hasOwnProperty("schoolAsyncDropDown") ? true : false;
	expect(item).toBe(true);
});

test(`Object have NotificationIntervalTime key`, async () => {
	const item = staticValues.hasOwnProperty("NotificationIntervalTime") ? true : false;
	expect(item).toBe(true);
});

test(`Object have assetContentForm key`, async () => {
	const item = staticValues.hasOwnProperty("assetContentForm") ? true : false;
	expect(item).toBe(true);
});

test(`Object have ajaxSearchableDropDown key`, async () => {
	const item = staticValues.hasOwnProperty("ajaxSearchableDropDown") ? true : false;
	expect(item).toBe(true);
});

test(`Object have hoverTitle key`, async () => {
	const item = staticValues.hasOwnProperty("hoverTitle") ? true : false;
	expect(item).toBe(true);
});

test(`Object have unlockAttemptStatus key`, async () => {
	const item = staticValues.hasOwnProperty("unlockAttemptStatus") ? true : false;
	expect(item).toBe(true);
});

test(`Object have icons key`, async () => {
	const item = staticValues.hasOwnProperty("icons") ? true : false;
	expect(item).toBe(true);
});

test(`Object have extractStatus key`, async () => {
	const item = staticValues.hasOwnProperty("extractStatus") ? true : false;
	expect(item).toBe(true);
});

test(`Object have extractEditableGracePeriodLimit key`, async () => {
	const item = staticValues.hasOwnProperty("extractEditableGracePeriodLimit") ? true : false;
	expect(item).toBe(true);
});

test(`Object have homeScreenBox key`, async () => {
	const item = staticValues.hasOwnProperty("homeScreenBox") ? true : false;
	expect(item).toBe(true);
});

test(`Object have emailNotificationCategories key`, async () => {
	const item = staticValues.hasOwnProperty("emailNotificationCategories") ? true : false;
	expect(item).toBe(true);
});

test(`Object have contentRequestType key`, async () => {
	const item = staticValues.hasOwnProperty("contentRequestType") ? true : false;
	expect(item).toBe(true);
});

test(`Object have messages key`, async () => {
	const item = staticValues.hasOwnProperty("messages") ? true : false;
	expect(item).toBe(true);
});

test(`Object have assetFileFormat key`, async () => {
	const item = staticValues.hasOwnProperty("assetFileFormat") ? true : false;
	expect(item).toBe(true);
});

test(`Object have allowedPercentageForUserUploadedCopy key`, async () => {
	const item = staticValues.hasOwnProperty("allowedPercentageForUserUploadedCopy") ? true : false;
	expect(item).toBe(true);
	expect(staticValues.allowedPercentageForUserUploadedCopy).toEqual(20);
});
