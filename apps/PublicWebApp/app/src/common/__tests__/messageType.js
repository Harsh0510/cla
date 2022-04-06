import messageType from "../messageType";

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

let mockMessageTypeValue;
function resetAll() {
	mockMessageTypeValue = {
		warning: "warning",
		error: "error",
		success: "success",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/**  Return true when 'messageType' is Object */
test(`Return true when 'messageType' is Object`, async () => {
	const item = Object.prototype.toString.call(messageType).slice(8, -1) === "Object" ? true : false;
	expect(item).toBe(true);
});

/** Return false when 'messageType' is Object */
test(`Return false when 'messageType' is Object`, async () => {
	const item = Object.prototype.toString.call(messageType).slice(8, -1) !== "Object" ? true : false;
	expect(item).toBe(false);
});

/** Count 'messageType' object size */
test(`Count 'messageType' object size`, async () => {
	var item = Object.keys(messageType);
	expect(item.length).toBe(4);
});

/** Object 'messageType' key is not empty */
test(`Object 'messageType' key is not empty`, async () => {
	const item = checkProperties(messageType) ? true : false;
	expect(item).toBe(true);
});

/** Object 'messageType' warning key is not empty */
test(`Object 'messageType' warning key is not empty`, async () => {
	const item = messageType.warning ? true : false;
	expect(item).toBe(true);
});

/** Object 'messageType' error key is not empty */
test(`Object 'messageType' error key is not empty`, async () => {
	const item = messageType.error ? true : false;
	expect(item).toBe(true);
});

/** Object 'messageType' success key is not empty */
test(`Object 'messageType' success key is not empty`, async () => {
	const item = messageType.success ? true : false;
	expect(item).toBe(true);
});

/** Match all keys value of 'messageType' object */
test(`Match all keys value of 'messageType' object`, async () => {
	expect(messageType.warning).toEqual(mockMessageTypeValue.warning);
	expect(messageType.error).toEqual(mockMessageTypeValue.error);
	expect(messageType.success).toEqual(mockMessageTypeValue.success);
});
