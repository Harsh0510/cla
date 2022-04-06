import getBoundingBox from "../getBoundingBox";

jest.mock("../../../common/getDocumentBody", () => {
	return "document.body";
});
let mockDomElement;
let mockBB, mockBBParent, mockResult;

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	mockBB = {
		x: 269,
		y: 56,
		width: 1300,
		height: 127,
		top: 56,
		right: 1569,
		bottom: 183,
		left: 269,
		parentNode: "document.body",
	};
	mockBBParent = {
		x: 269,
		y: 56,
		width: 1300,
		height: 127,
		top: 56 + 1,
		right: 1569 - 1,
		bottom: 183 - 1,
		left: 269 + 1,
		parentNode: "document.body",
	};
	mockResult = {
		bottom: 183,
		height: 127,
		left: 269,
		right: 1569,
		top: 56,
		width: 1300,
		x: 269,
		y: 56,
	};
	mockDomElement = {
		getBoundingClientRect() {
			return mockBB;
		},
		parentNode: {
			getBoundingClientRect() {
				return mockBB;
			},
			parentNode: "document.body",
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	mockDomElement = {
		getBoundingClientRect() {
			return mockBB;
		},
		parentNode: {
			getBoundingClientRect() {
				return mockBB;
			},
			parentNode: "document.body",
		},
	};
	const result = getBoundingBox(mockDomElement);
	expect(result).toEqual(mockResult);
});

test("Render only one parent node", async () => {
	mockDomElement = {
		getBoundingClientRect() {
			return mockBB;
		},
		parentNode: "document.body",
	};
	const result = getBoundingBox(mockDomElement);
	expect(result).toEqual(mockResult);
});

test("Intersect parent's bounding box with current bounding box", async () => {
	mockDomElement = {
		getBoundingClientRect() {
			return mockBB;
		},
		parentNode: {
			getBoundingClientRect() {
				return mockBBParent;
			},
			parentNode: "document.body",
		},
	};
	const result = getBoundingBox(mockDomElement);
	expect(result.bottom).toEqual(182);
	expect(result.height).toEqual(125);
	expect(result.left).toEqual(270);
	expect(result.right).toEqual(1568);
	expect(result.top).toEqual(57);
	expect(result.width).toEqual(1298);
	expect(result.x).toEqual(270);
	expect(result.y).toEqual(57);
});
