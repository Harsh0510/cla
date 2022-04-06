import smoothScroll from "../../common/smoothScroll";
let mockItem, mockFunction;

function resetAll() {
	mockItem = {
		offsetTop: 50,
	};
	mockFunction = jest.fn();
}

beforeEach(resetAll);
afterEach(resetAll);

test("Check Scroll behaviour", () => {
	window.scrollY = 0;
	window.pageYOffset = 0;
	window.innerHeight = 447;
	window.scrollTo = mockFunction;
	smoothScroll(mockItem);
	expect(mockFunction).toHaveBeenCalled();
});

test("Check Scroll behaviour", () => {
	window.scrollY = 0;
	window.pageYOffset = -50;
	window.innerHeight = 0;
	window.scrollTo = mockFunction;
	smoothScroll(mockItem);
	expect(mockFunction).toHaveBeenCalled();
});
