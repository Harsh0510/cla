// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow } from "enzyme";
import Presentation from "../Presentation";

let props, mockFunction;

function resetAll() {
	mockFunction = jest.fn();
	props = {
		side: "top",
		onClose: mockFunction,
		children: "Dummy Children",
		center_horizontal_offset: 13,
		isLoaded: false,
		isClosing: mockFunction,
		width: 45,
		height: 21,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<Presentation {...props} />);
	expect(item.find("FlyoutStyle").length).toBe(1);
	expect(item.find("TopSection").length).toBe(1);
	expect(item.find("Arrow").length).toBe(1);
});
