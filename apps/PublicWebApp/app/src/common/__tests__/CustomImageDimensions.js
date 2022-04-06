import CustomImageDimensions from "./../CustomImageDimensions";

let e;

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

function resetAll() {
	e = {
		imgRef: {
			current: {
				naturalWidth: 0,
				naturalHeight: 0,
				complete: true,
				onload: jest.fn(),
			},
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** function renders correctly */
test("function renders correctly", async () => {
	const item = CustomImageDimensions(e);
	const result = typeof item === "object" ? true : false;
	expect(result).toBe(true);
});

/** function renders correctly with array */
test("function renders correctly with array", async () => {
	e.imgRef.current = "";
	const item = CustomImageDimensions(e);
	const result = typeof item === "object" ? true : false;
	expect(result).toBe(false);
});

/** Count Object length */
test("Count Object length", async () => {
	const item = CustomImageDimensions(e);
	var result = Object.keys(item);
	expect(result.length).toBe(4);
});
