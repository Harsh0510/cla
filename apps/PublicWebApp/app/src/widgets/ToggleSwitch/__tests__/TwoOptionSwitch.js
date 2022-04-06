// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow } from "enzyme";
import TwoOptionSwitch from "../TwoOptionSwitch";

let props, mockFunction;

function resetAll() {
	mockFunction = jest.fn();
	props = {
		start_title: "Previous",
		onChange: mockFunction,
		value: 24,
		end_title: "Next",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<TwoOptionSwitch {...props} />);
	expect(item.find("div").length).toBe(1);
	expect(item.find("LabelStart").length).toBe(1);
	expect(item.find("ToggleSwitch").length).toBe(1);
	expect(item.find("LabelEnd").length).toBe(1);
});
