/** Required to simulate window.matchMedia */
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import Fields from "../Fields";

let props, mockFunction;

/**
 * Reset function
 */
function resetAll() {
	mockFunction = jest.fn();
	props = {
		fields: ["Component", "name"],
		values: ["name 1", ",name 2"],
		issues: {
			checkbox: "checkbox issue",
		},
		wrap: "Button",
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
	const item = shallow(<Fields {...props} />);
	expect(item.find("Button").length).toBe(2);
});

test(`Component renders Successfully`, async () => {
	delete props.wrap;
	const item = shallow(<Fields {...props} />);
	expect(item.find("Button").length).toBe(0);
});
