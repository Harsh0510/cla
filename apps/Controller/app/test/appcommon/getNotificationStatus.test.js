const getNotificationStatus = require("../../common/getNotificationStatus");

/** function renders correctly */
test("function renders correctly", async () => {
	let item = getNotificationStatus;
	expect(typeof item).toEqual("function");
});

/** function returns correctly */
test("Count Object size", async () => {
	let item = getNotificationStatus();
	expect(item.length).toBe(2);
});
