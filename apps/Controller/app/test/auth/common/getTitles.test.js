const getTitles = require("../../../core/auth/common/getTitles");

function checkProperties(obj) {
	let res = false;
	for (key in obj) {
		if (obj[key] === true) {
			res = true;
			break;
		}
	}
	return res;
}

function checkPropertiesWithKey(obj, keyName) {
	let res = false;
	for (key in obj) {
		if (key === keyName) {
			res = obj[keyName];
			break;
		}
	}
	return res;
}

test("function returns object", async () => {
	expect(getTitles()).toEqual({ Dr: true, Miss: true, Mr: true, Mrs: true, Ms: true, Mx: true, Sir: true });
});

/** Count Object size */
test("Count Object size", async () => {
	expect(Object.keys(getTitles()).length).toEqual(7);
});

test("function returns object value with true", async () => {
	const item = getTitles();
	const result = checkProperties(item);
	expect(result).toEqual(true);
});

test("function returns object value 'MR' with true", async () => {
	const item = getTitles();
	const result = checkPropertiesWithKey(item, "Mr");
	expect(result).toEqual(true);
});

test("function returns object value 'Mrs' with true", async () => {
	const item = getTitles();
	const result = checkPropertiesWithKey(item, "Mrs");
	expect(result).toEqual(true);
});

test("function returns object value 'Miss' with true", async () => {
	const item = getTitles();
	const result = checkPropertiesWithKey(item, "Miss");
	expect(result).toEqual(true);
});

test("function returns object value 'Ms' with true", async () => {
	const item = getTitles();
	const result = checkPropertiesWithKey(item, "Ms");
	expect(result).toEqual(true);
});

test("function returns object value 'Dr' with true", async () => {
	const item = getTitles();
	const result = checkPropertiesWithKey(item, "Dr");
	expect(result).toEqual(true);
});

test("function returns object value 'Sir' with true", async () => {
	const item = getTitles();
	const result = checkPropertiesWithKey(item, "Sir");
	expect(result).toEqual(true);
});
