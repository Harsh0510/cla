import validationType from "../validationType";

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

let mockValidationType;

function resetAll() {
	mockValidationType = {
		email: "email",
		string: "input-string",
		name: "name",
		number: "number",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/**  `Return true when 'validationType' is Object` */
test(`Return true when 'validationType' is Object`, async () => {
	const item = Object.prototype.toString.call(validationType).slice(8, -1) === "Object" ? true : false;
	expect(item).toBe(true);
});

/** `Return false when 'validationType' is Object` */
test(`Return false when 'validationType' is Object`, async () => {
	const item = Object.prototype.toString.call(validationType).slice(8, -1) !== "Object" ? true : false;
	expect(item).toBe(false);
});

/** Count 'validationType' object size */
test(`Count 'validationType' object size`, async () => {
	var item = Object.keys(validationType);
	expect(item.length).toBe(4);
});

/** Object 'validationType' key is not empty */
test(`Object 'validationType' key is not empty`, async () => {
	const item = checkProperties(validationType) ? true : false;
	expect(item).toBe(true);
});

/** Object 'validationType' email key is not empty */
test(`Object 'validationType' email key is not empty`, async () => {
	const item = validationType.email ? true : false;
	expect(item).toBe(true);
});

/** Object 'validationType' string key is not empty */
test(`Object 'validationType' string key is not empty`, async () => {
	const item = validationType.string ? true : false;
	expect(item).toBe(true);
});

/** Object 'validationType' name key is not empty */
test(`Object 'validationType' name key is not empty`, async () => {
	const item = validationType.name ? true : false;
	expect(item).toBe(true);
});

/** Object 'validationType' number key is not empty */
test(`Object 'validationType' number key is not empty`, async () => {
	const item = validationType.number ? true : false;
	expect(item).toBe(true);
});

/** Match all keys value of 'validationType' object */
test(`Match all keys value of 'validationType' object`, async () => {
	expect(validationType.email).toEqual(mockValidationType.email);
	expect(validationType.string).toEqual(mockValidationType.string);
	expect(validationType.name).toEqual(mockValidationType.name);
	expect(validationType.number).toEqual(mockValidationType.number);
});
