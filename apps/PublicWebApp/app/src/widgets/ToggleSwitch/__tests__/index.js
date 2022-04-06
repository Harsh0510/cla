// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow } from "enzyme";
import ToggleSwitch from "../index";

let props,
	mockFunction = jest.fn();

function resetAll() {
	mockFunction = jest.fn();
	props = {
		onChange: mockFunction,
		value: true,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<ToggleSwitch {...props} />);
	expect(item.find("Switch").length).toBe(1);
	expect(item.find("Input").length).toBe(1);
	expect(item.find("Slider").length).toBe(1);
});

/** Component renders correctly without props*/
test("Component renders correctly without props", async () => {
	const item = shallow(<ToggleSwitch />);
	const checkBox = item.find("Input");
	checkBox.simulate("change", {
		currentTarget: {
			checked: false,
		},
	});
	expect(mockFunction).not.toBeCalled();
});

/** User toggele the switch */
test("User toggele the switch", async () => {
	const item = shallow(<ToggleSwitch {...props} />);
	const checkBox = item.find("Input");
	checkBox.simulate("change", {
		currentTarget: {
			checked: false,
		},
	});
	expect(mockFunction).toBeCalled();
});
