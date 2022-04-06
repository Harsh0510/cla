import React from "react";
import { shallow } from "enzyme";
import Manager from "../Manager";
let props,
	mockFunction,
	mockPageIndex = null;

/**
 * Reset function
 */
function resetAll() {
	mockFunction = jest.fn();
	mockPageIndex = 0;
	props = {
		highlights: [
			{
				oid: "0f2f7c0c56ca276585f15bcee807d1cea488",
				width: 21,
				height: 23,
				position_x: 9.0,
				position_y: 0.5,
				colour: "#ff556",
			},
		],
		handleHiglightDelete: mockFunction,
		selectedHighlight: mockFunction,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders Correctly */
test(`Component renders Successfully`, async () => {
	const item = shallow(<Manager {...props} />);
	expect(item.find("Highlight").length).toBe(1);
});

test(`When extract page didnot have any highlight`, async () => {
	props.highlights = [];
	const item = shallow(<Manager {...props} />);
	expect(item.find("Highlight").length).toBe(0);
});
