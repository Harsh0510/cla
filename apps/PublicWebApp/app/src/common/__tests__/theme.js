import theme from "./../theme";

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

/** Component renders correctly */
test("renders correctly", async () => {
	const item = Object.prototype.toString.call(theme).slice(8, -1) === "Object" ? true : false;
	expect(item).toBe(true);
});

/** Component renders correctly without object */
test("renders correctly without object", async () => {
	const item = Object.prototype.toString.call(theme).slice(8, -1) !== "Object" ? true : false;
	expect(item).toBe(false);
});

/** Count Object size */
test("Count Object size", async () => {
	var item = Object.keys(theme);
	expect(item.length).toBe(9);
});

/** Object key is not empty */
test("Object key is not empty", async () => {
	const item = checkProperties(theme) ? true : false;
	expect(item).toBe(true);
});

/** Object inner colors key values are not empty */
test("Object inner colors key values are not empty", async () => {
	const item = checkProperties(theme.colours) ? true : false;
	expect(item).toBe(true);
});

/** Object inner breakpoints key values are not empty */
test("Object inner breakpoints key values are not empty", async () => {
	const item = checkProperties(theme.breakpoints) ? true : false;
	expect(item).toBe(true);
});
