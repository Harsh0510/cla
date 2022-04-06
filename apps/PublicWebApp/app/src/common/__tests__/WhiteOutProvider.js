import React from "react";
import { shallow } from "enzyme";
import WhiteOutProvider from "../WhiteOutProvider";

let children, Mockbb;

/**
 * Reset function
 */
function resetAll() {
	Mockbb = {
		bb: {
			left: 284,
			right: 601.5,
			top: -452,
			bottom: 858.15625,
			width: 317.5,
			height: 1310.15625,
			x: 284,
			y: -452,
		},
	};
	children = "";
}

beforeEach(resetAll);
afterEach(resetAll);

/** wait function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = shallow(<WhiteOutProvider />);
	expect(item.find("WhiteOut").length).toBe(4);
});

/** Method executes correctly */
test(`Function updateBoundingBox runs correctly`, async () => {
	let bb = Mockbb;
	let isVisible = true;
	const item = shallow(<WhiteOutProvider />);

	item.setState({ is_visible: false });
	item.find("ContextProvider").props().value.updateBoundingBox(bb, isVisible);
	expect(item.state("current_bounding_box")).toEqual(bb);
	await wait(80);
	expect(item.state("is_visible")).toEqual(true);

	bb = null;
	item.setState({ current_bounding_box: Mockbb });
	item.find("ContextProvider").props().value.updateBoundingBox(bb, isVisible);
	expect(item.state("current_bounding_box")).toEqual(bb);

	bb = Mockbb;
	item.setState({ is_visible: true });
	item.find("ContextProvider").props().value.updateBoundingBox(bb, isVisible);
	expect(item.state("current_bounding_box")).toEqual(bb);
	expect(item.state("highlight_gutter")).toBe(0);
});
