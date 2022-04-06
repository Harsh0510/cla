import React from "react";
import { shallow, mount } from "enzyme";
import SliderWrap from "../SliderWrap";
import MockSliderItems from "../../../mocks/MockSliderItems";
import PagePreviewSlider from "../../../widgets/PagePreviewSlider";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

// Mock import
jest.mock("react-resize-detector/build/withPolyfill", () => {
	return { withResizeDetector: mockPassthruHoc };
});

let props, mockFunction, currentPage;

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	currentPage = 1;
	mockFunction = jest.fn();
	props = {
		items: MockSliderItems,
		highlighted_count: 2,
		highlighted_first_index: 1,
		on_press_page: mockFunction,
		on_press_checkbox: mockFunction,
		on_highlighted_page_change: mockFunction,
		width: "999",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component render correctly */
test(`Component render correctly`, async () => {
	const item = shallow(<SliderWrap {...props} />);
	await wait(50);
	expect(item.find(PagePreviewSlider).length).toBe(1);
});
