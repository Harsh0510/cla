// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import FlyOutModel from "../index";
import theme from "../../../common/theme";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}
// Mock asset imports
jest.mock("../../../common/withWhiteOutConsumer", () => mockPassthruHoc);
jest.mock(`../../../assets/images/OnFlyoutModalTop.png`, () => jest.fn());
jest.mock(`../../../assets/images/OnFlyoutModalBottom.png`, () => jest.fn());

jest.mock("../../../common/customSetTimeout", () => {
	return function (method, time) {
		return setTimeout(method, time);
	};
});

let mockFunction, props;

/**
 * Reset function
 */
function resetAll() {
	mockFunction = jest.fn();
	props = {
		handleShowMe: mockFunction,
		buttonText: "Show me",
		title: "Title",
		whiteOut_updateBoundingBox: mockFunction,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/** Component renders correctly*/
test("Component renders correctly", async () => {
	const item = shallow(<FlyOutModel {...props} />);
	await wait(150);
	expect(item.find("WrapModalOuter").length).toBe(1);
	expect(item.find("WrapModalOuter").props().modalWidth).toBe("760px");
	expect(item.find("WrapModal").length).toBe(1);
	expect(item.state().isLoaded).toBe(true);
	expect(item.find("WrapModal").length).toBe(1);
});

test(`Component renders correctly when '_isActive' not set`, async () => {
	theme.flyOutModal.width = null;
	const item = shallow(<FlyOutModel {...props} />);
	item.instance()._isActive = false;
	await wait(150);
	expect(item.find("WrapModalOuter").length).toBe(1);
	expect(item.find("WrapModalOuter").props().modalWidth).toBe("670px");
	expect(item.find("WrapModal").length).toBe(1);
	expect(item.state().isLoaded).toBe(false);
	expect(item.find("WrapModal").length).toBe(1);
});

test("Component unmount", async () => {
	const item = shallow(<FlyOutModel {...props} />);
	expect(item.find("WrapModal").length).toBe(1);
	expect(item.find("WrapModal").props().isLoaded).toBe(false);
	await wait(150);
	expect(item.find("WrapModal").length).toBe(1);
	expect(item.find("WrapModal").props().isLoaded).toBe(true);
	item.instance().componentWillUnmount();
	expect(item.find("WrapModal").length).toBe(1);
});

/** simulate button event of Show me button */
test("user click on Show me button", async () => {
	const item = shallow(<FlyOutModel {...props} />);
	const button = item.find("ShowMeButton");
	button.simulate("click", {});
	expect(mockFunction).toHaveBeenCalled();
});

/** simulate close-button event of CloseButton of modal */
test(`user click on close button`, async () => {
	const jestMockFunction = jest.fn();
	props = {
		handleShowMe: jestMockFunction,
		buttonText: "Show me",
		title: "Title",
		whiteOut_updateBoundingBox: jestMockFunction,
	};
	const item = shallow(<FlyOutModel {...props} />);
	item.setProps({ closeBackgroundImmediately: true });
	await wait(100);
	const button = item.find("WrapCloseButton");
	button.simulate("click", {});
	expect(item.state("isClosing")).toEqual(true);
	await wait(200);
	expect(jestMockFunction).toHaveBeenCalled();
});

test(`user click on close button when '_isActive' not set`, async () => {
	const jestMockFunction = jest.fn();
	props = {
		handleShowMe: jestMockFunction,
		buttonText: "Show me",
		title: "Title",
		whiteOut_updateBoundingBox: jestMockFunction,
	};
	const item = shallow(<FlyOutModel {...props} />);
	item.instance()._isActive = false;
	item.setProps({ closeBackgroundImmediately: true });
	await wait(100);
	const button = item.find("WrapCloseButton");
	button.simulate("click", {});
	expect(item.state("isClosing")).toEqual(true);
	await wait(200);
	expect(jestMockFunction).toHaveBeenCalled();
});

/** default button text as Show Me */
test("user seen default button text as Show Me", async () => {
	delete props.buttonText;
	const item = shallow(<FlyOutModel {...props} />);
	await wait(100);
	const button = item.find("ShowMeButton");
	expect(button.text()).toEqual("Show me");
});

test("user click on close button and move to another page", async () => {
	const jestMockFunction = jest.fn();
	props = {
		handleShowMe: jestMockFunction,
		buttonText: "Show me",
		title: "Title",
		whiteOut_updateBoundingBox: jestMockFunction,
	};
	const item = shallow(<FlyOutModel {...props} />);
	await wait(100);
	const button = item.find("WrapCloseButton");
	button.simulate("click", {});
	expect(item.state("isClosing")).toEqual(true);
	await wait(200);
	expect(jestMockFunction).toHaveBeenCalled();
	item.instance().componentWillUnmount();
	expect(item.instance()._isActive).toBe(false);
});
