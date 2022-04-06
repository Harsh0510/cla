import notificationNeedToBeUpdate from "../../../../EventEmitter/events/notificationNeedToBeUpdate/index";

/** function renders correctly */
test("function renders correctly", async () => {
	const item = notificationNeedToBeUpdate();
	expect(item).toEqual("Need to be Update");
});
