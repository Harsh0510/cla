import React from "react";
import { shallow } from "enzyme";
import OnTop from "../index";

let props, mockFunction, mockText;

function resetAll() {
	mockText = "Show Flout Section";
	mockFunction = jest.fn();
	props = {
		children: <div>Show Flout Section</div>,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<OnTop {...props} />);
	expect(item.find("div").length).toBe(1);
	expect(item.find("div").text()).toBe(mockText);
});

/** Component renders correctly */
test("Component will mount correctly", async () => {
	const item = shallow(<OnTop {...props} />);
	item.instance().componentWillUnmount();
	expect(item.find("div").length).toBe(1);
	expect(item.find("div").text()).toBe(mockText);
});
