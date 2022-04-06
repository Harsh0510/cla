const sql = require("../../../common/nameDisplayPreference/sql");

/** renders correctly with object only */
test("renders correctly with object only", async () => {
	const item = Object.prototype.toString.call(sql).slice(8, -1) === "Object" ? true : false;
	expect(item).toBe(true);
});

/** Count Object size */
test("Count Object size", async () => {
	var item = Object.keys(sql);
	expect(item.length).toBe(2);
});

/** Object have getDefault key */
test("Object find getDefault", async () => {
	const item = sql.hasOwnProperty("getDefault") ? true : false;
	expect(item).toBe(true);
});

test("test getDefault property of sql", async () => {
	const item = sql.getDefault(undefined);
	expect(item).toEqual("concat_ws('', cla_user.title, '. ', cla_user.last_name)");
});

/** Object have getFinal key */
test("Object find getFinal", async () => {
	const item = sql.hasOwnProperty("getFinal") ? true : false;
	expect(item).toBe(true);
});

test("test getFinal property of obj", async () => {
	const item = sql.getFinal(undefined);
	expect(item).toEqual("COALESCE(cla_user.name_display_preference, concat_ws('', cla_user.title, '. ', cla_user.last_name))");
});
