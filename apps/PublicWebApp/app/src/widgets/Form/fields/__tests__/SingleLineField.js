/** Required to simulate window.matchMedia */
import "../../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import SingleLineField from "../SingleLineField";

let props, mockFunction;

/**
 * Reset function
 */
function resetAll() {
	mockFunction = jest.fn();
	props = {
		title: "Tutorial View",
		placeholder: "Please Enter Value",
		minLength: 150,
		maxLength: 300,
		value: false,
		onChange: mockFunction,
		issue: {
			hasError: mockFunction,
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/** Component renders Correctly */
test(`Component renders Successfully`, async () => {
	const item = shallow(<SingleLineField {...props} />);
	expect(item.find("Label").length).toBe(1);
});

/** Simulate methods */
test(`Simulate Input onChange method`, async () => {
	const item = shallow(<SingleLineField {...props} />);
	const input = item.find("Input");
	const selectedInput = "ref";
	item.instance()[selectedInput] = {
		current: {
			value: false,
		},
	};
	input.simulate("change", {
		preventDefault: mockFunction,
	});
	expect(mockFunction).toHaveBeenCalled();
});
