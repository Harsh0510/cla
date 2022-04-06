import customDocumentClassList from "../customDocumentClassList";

let pages, e, mockFunction;

/**
 * Reset function
 */
function resetAll() {
	mockFunction = () => {
		return true;
	};
	pages = "page";
	e = {
		target: {
			classList: {
				contains: mockFunction,
			},
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Function renders correctly */
test(`Function renders correctly`, async () => {
	const result = customDocumentClassList(e, pages);
	expect(result).toEqual(true);
});
