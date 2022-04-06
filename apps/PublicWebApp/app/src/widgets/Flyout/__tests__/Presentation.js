import React from "react";
import { shallow } from "enzyme";
import Presentation from "../Presentation";

let props, mockFunction;

function resetAll() {
	mockFunction = jest.fn();
	props = {
		width: 320,
		height: 100,
		onClose: mockFunction,
		side: "left",
		isLoaded: true,
		isClosing: false,
		center_horizontal_offset: 160,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<Presentation {...props} />);
	expect(item.find("FlyoutStyle").length).toBe(1);
});

test("Test onClose method of Flyout", async () => {
	const item = shallow(<Presentation {...props} />);
	const button = item.find("CloseButton");
	button.simulate("click");
	expect(mockFunction).toHaveBeenCalled();
});
