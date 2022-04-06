import constants from "../../../../EventEmitter/events/notificationNeedToBeUpdate/constants";

/** returns Object correctly */
test(`Count Object size`, async () => {
	const item = Object.keys(constants);
	expect(item.length).toBe(2);
});

test(`Object have Notification_Update_From_Header_Tab key`, async () => {
	const item = constants.hasOwnProperty("Notification_Update_From_Header_Tab") ? true : false;
	expect(item).toBe(true);
});

test(`Object have Notification_Update_From_Notification_List key`, async () => {
	const item = constants.hasOwnProperty("Notification_Update_From_Notification_List") ? true : false;
	expect(item).toBe(true);
});
