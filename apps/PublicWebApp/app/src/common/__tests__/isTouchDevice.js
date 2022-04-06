import isTouchDevice from "../isTouchDevice";
import "./../../mocks/matchMedia.mock";
/** Function renders correctly */
test("Function Works correctly for non touch device", async () => {
	const result = isTouchDevice();
	expect(result).toEqual(false);
});

test("Function Works correctly for touch device", async () => {
	window.ontouchstart = true;
	const result = isTouchDevice();
	expect(result).toEqual(true);
});
