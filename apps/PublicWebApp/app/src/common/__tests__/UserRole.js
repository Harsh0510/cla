import UserRole from "./../UserRole";

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

/** renders correctly with object only */
test("renders correctly with object only", async () => {
	const item = Object.prototype.toString.call(UserRole).slice(8, -1) === "Object" ? true : false;
	expect(item).toBe(true);
});

/** Count Object size */
test("Count Object size", async () => {
	var item = Object.keys(UserRole);
	expect(item.length).toBe(3);
});

/** Object have cla-admin key */
test("Object find cla-admin key", async () => {
	const item = UserRole.hasOwnProperty("claAdmin") ? true : false;
	expect(item).toBe(true);
});

/** Object have school-admin key */
test("Object find shcool-admin key", async () => {
	const item = UserRole.hasOwnProperty("schoolAdmin") ? true : false;
	expect(item).toBe(true);
});

/** Object have teacher key */
test("Object find teacher key", async () => {
	const item = UserRole.hasOwnProperty("teacher") ? true : false;
	expect(item).toBe(true);
});

test("Object key is not empty", async () => {
	const item = checkProperties(UserRole) ? true : false;
	expect(item).toBe(true);
});
