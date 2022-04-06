const notificationLimitCounter = require("../../common/notificationLimitCounter");

/** renders correctly with object only */
test("renders correctly with object only", async () => {
	const item = Object.prototype.toString.call(notificationLimitCounter).slice(8, -1) === "Object" ? true : false;
	expect(item).toBe(true);
});

/** Count Object size */
test("Count Object size", async () => {
	var item = Object.keys(notificationLimitCounter);
	expect(item.length).toBe(1);
});

/** Object have limit key */
test("Object find limit key", async () => {
	const item = notificationLimitCounter.hasOwnProperty("limit") ? true : false;
	expect(item).toBe(true);
});
