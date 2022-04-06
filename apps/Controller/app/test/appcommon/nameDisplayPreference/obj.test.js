const obj = require("../../../common/nameDisplayPreference/obj");

/** renders correctly with object only */
test("renders correctly with object only", async () => {
	const item = Object.prototype.toString.call(obj).slice(8, -1) === "Object" ? true : false;
	expect(item).toBe(true);
});

/** Count Object size */
test("Count Object size", async () => {
	var item = Object.keys(obj);
	expect(item.length).toBe(2);
});

/** Object have getDefault key */
test("Object find getDefault", async () => {
	const item = obj.hasOwnProperty("getDefault") ? true : false;
	expect(item).toBe(true);
});

test("test getDefault property of obj", async () => {
	const object = {
		title: "title",
		last_name: "last_name",
	};
	const item = obj.getDefault(object);
	expect(item).toEqual("title. last_name");
});

/** Object have getFinal key */
test("Object find getFinal", async () => {
	const item = obj.hasOwnProperty("getFinal") ? true : false;
	expect(item).toBe(true);
});

test("test getFinal property of obj", async () => {
	let object = {
		title: "title",
		last_name: "last_name",
	};
	const item = obj.getFinal(object);
	expect(item).toEqual("title. last_name");

	object.name_display_preference = "name";
	const itemNew = obj.getFinal(object);
	expect(itemNew).toEqual("name");
});
