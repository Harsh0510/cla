/** Required to simulate window.matchMedia */
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import DefaultActionsComponent from "../DefaultActionsComponent";

let props, mockFunction;

/**
 * Reset function
 */
function resetAll() {
	mockFunction = jest.fn();
	props = {
		ButtonComponent: "Button",
		disabled: false,
		submit_text: "",
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
	const item = shallow(<DefaultActionsComponent {...props} />);
	expect(item.find("Button").length).toBe(1);
	expect(item.find("Button").text()).toEqual("Submit");
});
