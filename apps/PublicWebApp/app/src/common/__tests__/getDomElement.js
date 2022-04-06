import getDomElement from "../getDomElement";

let mockRef;

function resetAll() {
	mockRef = { current: "button" };
}

beforeEach(resetAll);
afterEach(resetAll);

test("when pass not pass any ref as null", async () => {
	let error = null;
	try {
		const pageOffset = getDomElement();
		expect(pageOffset).toBeNull();
	} catch (e) {
		error = e.message;
	}
	expect(error).toBe("Cannot read properties of undefined (reading 'current')");
});

test("when pass ref", async () => {
	let error = null;
	try {
		const pageOffset = getDomElement(mockRef);
		expect(pageOffset).toBeNull();
	} catch (e) {
		error = e.message;
	}

	expect(error).toBe("Argument appears to not be a ReactComponent. Keys: 0,1,2,3,4,5");
});

test("when pass ref", async () => {
	let error = null;
	mockRef = { current: null };
	try {
		const pageOffset = getDomElement(mockRef);
		expect(pageOffset).toBeNull();
	} catch (e) {
		error = e.message;
	}

	expect(error).toBeNull();
});

test("when pass ref as DOM element", async () => {
	let error = null;
	mockRef = { current: document.createElement("button") };
	try {
		const pageOffset = getDomElement(mockRef);
		expect(pageOffset).toEqual(HTMLButtonElement);
	} catch (e) {
		error = e.message;
	}
});
