import notificationLinksRaw from "../notificationLinks";
const itemSizes = 1;

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

/** Count Object size */
test("Count Object size", async () => {
	var item = Object.keys(notificationLinksRaw);
	expect(item.length).toBe(itemSizes);
});

/** Object have cla-admin key */
test("Object find awaiting-approval key", async () => {
	const item = notificationLinksRaw.hasOwnProperty("awaiting-approval") ? true : false;
	expect(item).toBe(true);
});
