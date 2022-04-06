import debounce from "../debounce";

let func, mockWait, immediate;

/**
 * Reset function
 */
function resetAll() {
	func = jest.fn();
	mockWait = 200;
	immediate = true;
}

beforeEach(resetAll);
afterEach(resetAll);

/**
 * wait function
 */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/**
 * Timeout mock function
 */
jest.mock("../../common/customSetTimeout", () => {
	return function (method, time) {
		setTimeout(method, 50);
	};
});

/** Function renders correctly */
test(`Function renders correctly`, async () => {
	const item = debounce(func, mockWait, immediate);
	expect(typeof item).toEqual("function");
	item();
	await wait(100);
	item();
});

test(`Function renders correctly`, async () => {
	immediate = false;
	const item = debounce(func, mockWait, immediate);
	expect(typeof item).toEqual("function");
	item();
	await wait(100);
	item();
});
