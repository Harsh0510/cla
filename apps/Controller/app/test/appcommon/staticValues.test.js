const staticValues = require("../../common/staticValues");

/** renders correctly with object only */
test("renders correctly with object only", async () => {
	const item = Object.prototype.toString.call(staticValues).slice(8, -1) === "Object" ? true : false;
	expect(item).toBe(true);
});

/** Count Object size */
test("Count Object size", async () => {
	var item = Object.keys(staticValues);
	expect(item.length).toBe(14);
});

/** Object have userRoles key */
test("Object find userRoles key", async () => {
	const item = staticValues.hasOwnProperty("userRoles") ? true : false;
	expect(item).toBe(true);
});

/** Object have notificationCategories key */
test("Object find notificationCategories key", async () => {
	const item = staticValues.hasOwnProperty("notificationCategories") ? true : false;
	expect(item).toBe(true);
});

/** Object have notification key */
test("Object find notification key", async () => {
	const item = staticValues.hasOwnProperty("notification") ? true : false;
	expect(item).toBe(true);
});

/** Object have unlockEvents key */
test("Object find unlockEvents key", async () => {
	const item = staticValues.hasOwnProperty("unlockEvents") ? true : false;
	expect(item).toBe(true);
});

/** Object have unlockAttemptStatus key */
test("Object find unlockAttemptStatus key", async () => {
	const item = staticValues.hasOwnProperty("unlockAttemptStatus") ? true : false;
	expect(item).toBe(true);
});

/** Object have homeScreenBox key */
test("Object find homeScreenBox key", async () => {
	const item = staticValues.hasOwnProperty("homeScreenBox") ? true : false;
	expect(item).toBe(true);
});

/** Object have extractStatus key */
test("Object find extractStatus key", async () => {
	const item = staticValues.hasOwnProperty("extractStatus") ? true : false;
	expect(item).toBe(true);
});

/** Object have extractEditableGracePeriodLimit key */
test("Object find extractEditableGracePeriodLimit key", async () => {
	const item = staticValues.hasOwnProperty("extractEditableGracePeriodLimit") ? true : false;
	expect(item).toBe(true);
});

/** Object have emailNotificationCategory key */
test("Object find emailNotificationCategory key", async () => {
	const item = staticValues.hasOwnProperty("emailNotificationCategory") ? true : false;
	expect(item).toBe(true);
});

/** Object have contentRequestType key */
test("Object find contentRequestType key", async () => {
	const item = staticValues.hasOwnProperty("contentRequestType") ? true : false;
	expect(item).toBe(true);
});

/** Object have contentRequestType key */
test("Object find activationTokenExpiryLimitInDays key", async () => {
	const item = staticValues.hasOwnProperty("activationTokenExpiryLimitInDays") ? true : false;
	expect(item).toBe(true);
});

/** Object have userStatus key */
test("Object find userStatus key", async () => {
	const item = staticValues.hasOwnProperty("userStatus") ? true : false;
	expect(item).toBe(true);
});

/** Object have activationReminderEmailCategory key */
test("Object find activationReminderEmailCategory key", async () => {
	const item = staticValues.hasOwnProperty("activationReminderEmailCategory") ? true : false;
	expect(item).toBe(true);
});

/** Object have allowedPercentageForUserUploadedCopy key */
test("Object find allowedPercentageForUserUploadedCopy key", async () => {
	const item = staticValues.hasOwnProperty("allowedPercentageForUserUploadedCopy") ? true : false;
	expect(item).toBe(true);
	expect(staticValues.allowedPercentageForUserUploadedCopy).toEqual(20);
});
