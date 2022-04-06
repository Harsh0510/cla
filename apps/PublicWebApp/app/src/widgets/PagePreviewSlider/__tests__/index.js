// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import PagePreviewSlider from "../index";
import MockSliderItems from "../../../mocks/MockSliderItems";

let props, mockFunction, mockOnEventListenerCalled, mockPassEvents;

jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return {
			current: mockPassEvents,
		};
	};
});

jest.mock("../Slider", () => {
	return function () {
		return;
	};
});

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/**
 * Reset function
 */
function resetAll() {
	mockOnEventListenerCalled = () => {};
	mockFunction = jest.fn();
	props = {
		items: MockSliderItems,
		highlighted_count: 2,
		highlighted_first_index: 1,
		max_either_side: 4,
		on_press_page: mockFunction,
		on_press_checkbox: mockFunction,
		on_highlighted_page_change: mockFunction,
		doShowFlyout: true,
		onFlyoutClose: mockFunction,
		copyExcludedPagesMap: { 1: true, 2: true, 3: true, 12: true },
	};
	mockPassEvents = {
		addEventListener: (eventName, callback) => {
			mockOnEventListenerCalled(eventName, callback);
		},
		removeEventListener: (eventName, callback) => {
			mockOnEventListenerCalled(eventName, callback);
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = shallow(<PagePreviewSlider {...props} />);
	expect(item.find("Wrap").length).toBe(1);
});

/** getScrollPosition */
test(`Test getScrollPosition method`, async () => {
	mockPassEvents = {
		addEventListener: (eventName, callback) => {
			mockOnEventListenerCalled(eventName, callback);
		},
		removeEventListener: (eventName, callback) => {
			mockOnEventListenerCalled(eventName, callback);
		},
		scrollWidth: 200,
		scrollLeft: 4,
		clientWidth: 194,
	};
	const item = shallow(<PagePreviewSlider {...props} />);
	item.setState({ lastLeftScroll: 200 });
	item.setProps({ highlighted: 8 });
	item.instance().sliderRef.current.scrollLeft = 4;
	item.instance().getScrollPosition();
	await wait(400);
	expect(item.state("lastLeftScroll")).toBe(0);

	item.setState({ lastLeftScroll: 5 });
	item.instance().getScrollPosition();
	await wait(400);
	expect(item.state("lastLeftScroll")).toBe(0);
});

/** User clicks on image */
/** doOnImagePress */
test(`User clicks on image`, async () => {
	const attrs = { "data-index": 10 };
	const item = shallow(<PagePreviewSlider {...props} />);
	const spy = jest.spyOn(item.instance(), "doTransitionOnPage");
	item.instance().doOnImagePress({ preventDefault: jest.fn(), currentTarget: { getAttribute: (name) => attrs[name], ...attrs } });
	expect(spy).toHaveBeenCalled();
});

/** doOnImagePress */
test(`User clicks on image but have no handle for press change`, async () => {
	delete props.on_press_page;
	const attrs = { "data-index": 10 };
	const item = shallow(<PagePreviewSlider {...props} />);
	item.instance().doOnImagePress({ preventDefault: jest.fn() });
	expect(item.state("lastLeftScroll")).toBe(0);
});

/** User clicks on radio button */
/** handleChange */
test(`User clicks on radio button`, async () => {
	props.highlighted_first_index = 15;
	const item = shallow(<PagePreviewSlider {...props} />);
	const spy = jest.spyOn(item.instance(), "doTransitionOnPage");
	item.instance().handleChange({ preventDefault: jest.fn(), target: { value: 10 } });
	expect(spy).toHaveBeenCalled();
});

test(`User clicks on radio button when on_press_checkbox not pass`, async () => {
	delete props.on_press_checkbox;
	const item = shallow(<PagePreviewSlider {...props} />);
	const spy = jest.spyOn(item.instance(), "doTransitionOnPage");
	item.instance().handleChange({ preventDefault: jest.fn(), target: { value: 10 } });
	expect(spy).not.toHaveBeenCalled();
});
/** User clicks on next button */
/** doOnNext */
test(`User clicks on next button`, async () => {
	const item = shallow(<PagePreviewSlider {...props} />);
	item.instance().animateTimeout = 10;
	item.instance().doOnNext({ preventDefault: jest.fn(), target: { value: 10 } });
	expect(item.state().animating).toEqual("next");
	await wait(210);
	expect(item.state().animating).toBe(null);
	expect(mockFunction).toHaveBeenCalled();
});

test(`User clicks on next button without on_highlighted_page_change event`, async () => {
	delete props.on_highlighted_page_change;
	const item = shallow(<PagePreviewSlider {...props} />);
	item.instance().animateTimeout = 10;
	item.instance().doOnNext({ preventDefault: jest.fn(), target: { value: 10 } });
	expect(item.state().animating).toEqual("next");
	await wait(210);
	expect(item.state().animating).toBe(null);
});

test(`User clicks on Forward next button`, async () => {
	const item = shallow(<PagePreviewSlider {...props} />);
	item.instance().animateTimeout = 10;
	item.instance().doForwardNext({ preventDefault: jest.fn(), target: { value: 10 } });
	expect(item.state().animating).toEqual("next");
	await wait(210);
	expect(item.state().animating).toBe(null);
	expect(mockFunction).toHaveBeenCalled();
});

test(`User clicks on Forward next button with highlighted_count 1`, async () => {
	props.highlighted_count = 1;
	const item = shallow(<PagePreviewSlider {...props} />);
	item.instance().animateTimeout = 10;
	item.instance().doForwardNext({ preventDefault: jest.fn(), target: { value: 10 } });
	expect(item.state().animating).toEqual("next");
	await wait(210);
	expect(item.state().animating).toBe(null);
	expect(mockFunction).toHaveBeenCalled();
});

test(`User clicks on Forward next button without on_highlighted_page_change event `, async () => {
	props.highlighted_count = 1;
	delete props.on_highlighted_page_change;
	const item = shallow(<PagePreviewSlider {...props} />);
	item.instance().animateTimeout = 10;
	item.instance().doForwardNext({ preventDefault: jest.fn(), target: { value: 10 } });
	expect(item.state().animating).toEqual("next");
	await wait(210);
	expect(item.state().animating).toBe(null);
});

/** User clicks on prev button */
/** doOnNext */
test(`User clicks on prev button`, async () => {
	props.highlighted_first_index = 4;
	const item = shallow(<PagePreviewSlider {...props} />);
	item.instance().animateTimeout = 10;
	item.instance().doOnPrev({ preventDefault: jest.fn(), target: { value: 2 } });
	expect(item.state().animating).toEqual("prev");
	await wait(210);
	expect(item.state().animating).toBe(null);
	expect(mockFunction).toHaveBeenCalled();
});

test(`User clicks on prev button when on_highlighted_page_change not s `, async () => {
	props.highlighted_first_index = 4;
	delete props.on_highlighted_page_change;
	const item = shallow(<PagePreviewSlider {...props} />);
	item.instance().animateTimeout = 10;
	item.instance().doOnPrev({ preventDefault: jest.fn(), target: { value: 2 } });
	expect(item.state().animating).toEqual("prev");
	await wait(210);
	expect(item.state().animating).toBe(null);
	expect(mockFunction).toHaveBeenCalled();
});

test(`User clicks on Fast Backward button`, async () => {
	props.highlighted_first_index = 4;
	const item = shallow(<PagePreviewSlider {...props} />);
	item.instance().animateTimeout = 10;
	item.instance().doFastPrev({ preventDefault: jest.fn(), target: { value: 2 } });
	expect(item.state().animating).toEqual("prev");
	await wait(210);
	expect(item.state().animating).toBe(null);
	expect(mockFunction).toHaveBeenCalled();
});

test(`User clicks on Fast Backward button highlighted_count 1`, async () => {
	props.highlighted_first_index = 4;
	props.highlighted_count = 1;
	const item = shallow(<PagePreviewSlider {...props} />);
	item.instance().animateTimeout = 10;
	item.instance().doFastPrev({ preventDefault: jest.fn(), target: { value: 2 } });
	expect(item.state().animating).toEqual("prev");
	await wait(210);
	expect(item.state().animating).toBe(null);
	expect(mockFunction).toHaveBeenCalled();
});

test(`User clicks on Fast Backward button when on_highlighted_page_change not pass`, async () => {
	props.highlighted_first_index = 4;
	delete props.on_highlighted_page_change;
	const item = shallow(<PagePreviewSlider {...props} />);
	item.instance().animateTimeout = 10;
	item.instance().doFastPrev({ preventDefault: jest.fn(), target: { value: 2 } });
	expect(item.state().animating).toEqual("prev");
	await wait(210);
	expect(item.state().animating).toBe(null);
	expect(mockFunction).not.toHaveBeenCalled();
});
/** When component render in componentDidUpdate*/
test(`When User select another page from slider section  `, async () => {
	const pageIndex = 2;
	const item = shallow(<PagePreviewSlider {...props} />);
	const loadPageIndex = item.props().highlighted_first_index;
	item.setState({ orig_highlighted_first_index: pageIndex });
	expect(item.state.orig_highlighted_first_index).toBe(loadPageIndex);
});

/** When component render in componentWillUnmount*/
test(`Component redener componentWillUnmount with clearTimeout events`, async () => {
	const item = shallow(<PagePreviewSlider {...props} />);
	item.instance().animateTimeout = 10;
	const spy = jest.spyOn(item.instance(), "componentWillUnmount");
	item.unmount();
	expect(spy).toHaveBeenCalled();
});

/** When user click on highlighted area*/
test(`When user click on highlighted area`, async () => {
	props.highlighted_first_index = 10;
	const item = shallow(<PagePreviewSlider {...props} />);
	item.instance().animateTimeout = 200;
	const spy = jest.spyOn(item.instance(), "doTransitionOnPage");
	item.instance().handleChange({ preventDefault: jest.fn(), target: { value: 10 } });
	expect(spy).toHaveBeenCalled();
});

/** getScrollPosition */
test(`Test getScrollPosition method`, async () => {
	props.highlighted_count = 1;
	mockPassEvents = {
		addEventListener: (eventName, callback) => {
			mockOnEventListenerCalled(eventName, callback);
		},
		removeEventListener: (eventName, callback) => {
			mockOnEventListenerCalled(eventName, callback);
		},
		scrollWidth: 200,
		scrollLeft: 5,
		clientWidth: 191,
	};
	const item = shallow(<PagePreviewSlider {...props} />);
	item.setState({ lastLeftScroll: 200 });
	item.setProps({ highlighted: 8 });
	item.instance().sliderRef.current.scrollLeft = 4;
	item.instance().getScrollPosition();
	await wait(400);
	expect(item.state("lastLeftScroll")).toBe(4);

	item.setState({ lastLeftScroll: 5 });
	item.instance().getScrollPosition();
	await wait(400);
	expect(item.state("lastLeftScroll")).toBe(0);
});

/** When component render in componentWillUnmount*/
test(`Component redener componentWillUnmount without clearTimeout events`, async () => {
	const item = shallow(<PagePreviewSlider {...props} />);
	item.instance().animateTimeout = 0;
	const spy = jest.spyOn(item.instance(), "componentWillUnmount");
	item.unmount();
	expect(spy).toHaveBeenCalled();
});

/** When component render in componentWillUnmount*/
test(`When blank page is available`, async () => {
	props.items = [
		{
			src: "",
			selected: false,
		},
		{
			src: "",
			selected: false,
		},
	];
	const item = shallow(<PagePreviewSlider {...props} />);
	expect(item.find("PageNotAvailable").length).toBe(0);
});
