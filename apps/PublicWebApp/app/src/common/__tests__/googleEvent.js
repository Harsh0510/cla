import googleEvent from "../googleEvent";
let mockResult;
/**
 * Reset function
 */
function resetAll() {
	mockResult = [];
	global.window = Object.create(window);
	global.window.dataLayer = mockResult;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Function renders correctly */
test("Function renders correctly", async () => {
	googleEvent("name", "category", "action", "label", "userId");
	expect(window.dataLayer).toEqual([{ event: "name", eventAction: "action", eventCategory: "category", eventLabel: "label", userId: "userId" }]);
});

/** Function renders correctly */
test("Function renders correctly without prams", async () => {
	googleEvent();
	expect(window.dataLayer).toEqual([{}]);
});
