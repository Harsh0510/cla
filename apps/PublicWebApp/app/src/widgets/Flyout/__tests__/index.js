import React from "react";
import { shallow } from "enzyme";
import Flyout from "../index";

let props, mockFunction, mockRef;
let mockBB, mockBBLeft, mockBBRight, mockBBTop, mockBBBottom, mockParentNode;

jest.mock(`resize-observer-polyfill`, () => {
	return class {
		constructor() {}
		observe(el) {
			return;
		}
		disconnect() {
			return;
		}
	};
});

jest.mock("../../../common/customSetTimeout", () => {
	return function (method, time) {
		return setTimeout(method, time);
	};
});

jest.mock("../../../common/getDomElement", () => {
	return function () {
		return {
			getBoundingClientRect() {
				return mockBB;
			},
			parentNode: {
				getBoundingClientRect() {
					return mockParentNode;
				},
			},
		};
	};
});

jest.mock("../getBoundingBox", () => {
	return function () {
		return mockBB;
	};
});

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

jest.mock("../../../common/withWhiteOutConsumer", () => mockPassthruHoc);

function resetAll() {
	mockFunction = jest.fn();
	window.addEventListener = jest.fn();
	window.removeEventListener = jest.fn();
	mockRef = { current: "button" };
	mockBB = mockBBLeft;
	mockParentNode = mockBBLeft;
	props = {
		flyOutIndex: 1,
		onClose: mockFunction,
		height: 100,
		width: 200,
		target: mockRef,
		whiteOut_updateBoundingBox: mockFunction,
		style: {
			zIndex: 0,
		},
	};
	mockBBLeft = {
		x: 269,
		y: 56,
		width: 1300,
		height: 127,
		top: 56,
		right: 1569,
		bottom: 183,
		left: 269,
		style: {
			zIndex: 0,
		},
	};
	mockBBRight = {
		x: 1206.90625,
		y: 105.5,
		width: 185.875,
		height: 38,
		top: 105.5,
		right: 1392.78125,
		bottom: 143.5,
		left: 1206.90625,
		style: {
			zIndex: 0,
		},
	};
	mockBBTop = {
		x: 32,
		y: 572.859375,
		width: 138.4375,
		height: 37.375,
		top: 572.859375,
		right: 170.4375,
		bottom: 610.234375,
		left: 32,
		style: {
			zIndex: 0,
		},
	};
	mockBBBottom = {
		x: 32,
		y: 190.46875,
		width: 256,
		height: 34,
		top: 190.46875,
		right: 288,
		bottom: 224.46875,
		left: 32,
		style: {
			zIndex: 0,
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	mockBB = mockBBLeft;
	window.scrollTo = jest.fn();
	const item = shallow(<Flyout {...props} />);
	await wait(500);
	expect(item.find("OnTop").length).toBe(1);
	expect(mockFunction).toHaveBeenCalled();
});

test(`Component renders correctly with updating window.pageYOffset`, async () => {
	window.scrollTo = jest.fn();
	// without making a copy you will have a circular dependency problem during mocking
	const originalWindow = { ...window };
	const windowSpy = jest.spyOn(global, "window", "get");
	windowSpy.mockImplementation(() => ({
		...originalWindow,
		pageYOffset: 4,
	}));
	mockBB = mockBBLeft;
	const item = shallow(<Flyout {...props} />);
	item.instance()._targetScroll = 1;
	item.setProps({ side_preference: "top" });
	await wait(500);
	expect(item.find("OnTop").length).toBe(1);
	expect(mockFunction).toHaveBeenCalled();
});

test(`Component renders correctly with "top" side_preference`, async () => {
	mockBBTop.bottom = 700;
	mockBB = mockBBTop;
	window.scrollTo = jest.fn();
	const item = shallow(<Flyout {...props} />);
	item.setProps({ side_preference: "top" });
	await wait(500);
	expect(item.find("WrapDiv").props().side).toEqual("top");
});

test(`Component renders correctly with "bottom" side_preference`, async () => {
	mockBBBottom.bottom = 700;
	mockBBBottom.top = 101;
	mockBB = mockBBBottom;
	window.scrollTo = jest.fn();
	const item = shallow(<Flyout {...props} />);
	item.setProps({ side_preference: "bottom" });
	await wait(500);
	expect(item.find("WrapDiv").props().side).toEqual("left");
});

test("User seen the flyout with default height and width", async () => {
	mockBB = mockBBLeft;
	window.scrollTo = jest.fn();
	delete props.height;
	delete props.width;
	const item = shallow(<Flyout {...props} />);
	await wait(500);

	expect(item.find("OnTop").length).toBe(1);
	expect(item.find("WrapDiv").length).toBe(1);
	const wrapDiv = item.find("WrapDiv");
	expect(wrapDiv.props().side).toBe("left");
});

test("User seen flyout when not pass any target", async () => {
	mockBB = mockBBLeft;
	window.scrollTo = jest.fn();
	delete props.height;
	delete props.width;
	delete props.target;
	const item = shallow(<Flyout {...props} />);
	await wait(500);

	expect(item.find("OnTop").length).toBe(1);
	expect(item.find("WrapDiv").length).toBe(1);
	const wrapDiv = item.find("WrapDiv");
	expect(wrapDiv.props().side).toBe("left");
});

test("User seen flyout and close it", async () => {
	mockBB = mockBBLeft;
	window.scrollTo = jest.fn();
	delete props.height;
	delete props.width;
	delete props.target;
	const item = shallow(<Flyout {...props} />);
	await wait(500);
	item.instance().componentWillUnmount();
	expect(item.find("OnTop").length).toBe(1);
	expect(item.find("WrapDiv").length).toBe(1);
	const wrapDiv = item.find("WrapDiv");
	expect(wrapDiv.props().side).toBe("left");
});

test("User seen flyout and based on screen changing the height and width", async () => {
	mockBB = mockBBLeft;
	window.scrollTo = jest.fn();
	const item = shallow(<Flyout {...props} />);
	await wait(500);

	item.instance().componentWillUnmount();
	expect(item.find("OnTop").length).toBe(1);
	expect(item.find("WrapDiv").length).toBe(1);
	const wrapDiv = item.find("WrapDiv");
	expect(wrapDiv.props().side).toBe("bottom");
	item.setProps({
		height: 120,
		width: 200,
	});
	await wait(500);
	expect(wrapDiv.props().side).toBe("bottom");
});

test("User seen the flyout at bottom side", async () => {
	const originalWindow = { ...window };
	const windowSpy = jest.spyOn(global, "window", "get");
	windowSpy.mockImplementation(() => ({
		...originalWindow,
		pageYOffset: 1,
	}));
	mockBB = mockBBLeft;
	window.scrollTo = jest.fn();
	const item = shallow(<Flyout {...props} />);
	await wait(500);

	expect(item.find("OnTop").length).toBe(1);
	expect(item.find("WrapDiv").length).toBe(1);
	const wrapDiv = item.find("WrapDiv");
	expect(wrapDiv.props().side).toBe("bottom");
});

test("User seen the flyout at right side", async () => {
	mockBB = mockBBRight;
	window.scrollTo = jest.fn();
	const item = shallow(<Flyout {...props} />);
	await wait(500);

	expect(item.find("OnTop").length).toBe(1);
	expect(item.find("WrapDiv").length).toBe(1);
	item.instance().closeFlyout();

	const wrapDiv = item.find("WrapDiv");
	expect(wrapDiv.props().side).toBe("left");
});

test("User seen the flyout at top side", async () => {
	window.scrollTo = jest.fn();
	mockBB = mockBBTop;
	props.height = 160;
	props.width = 380;
	window.innerWidth = 320;
	window.innerHeight = 760;
	const item = shallow(<Flyout {...props} />);
	await wait(500);

	expect(item.find("OnTop").length).toBe(1);
	expect(item.find("WrapDiv").length).toBe(1);
	const wrapDiv = item.find("WrapDiv");
	expect(wrapDiv.props().side).toBe("top");
});

test("User seen the flyout at bottom side", async () => {
	window.scrollTo = jest.fn();
	mockBB = mockBBBottom;
	props.height = 160;
	props.width = 380;
	window.innerWidth = 320;
	window.innerHeight = 760;
	const item = shallow(<Flyout {...props} />);
	await wait(500);

	expect(item.find("OnTop").length).toBe(1);
	expect(item.find("WrapDiv").length).toBe(1);
	const wrapDiv = item.find("WrapDiv");
	expect(wrapDiv.props().side).toBe("bottom");
});

test("User click on X icon", async () => {
	window.scrollTo = jest.fn();
	mockBB = mockBBBottom;
	props.height = 160;
	props.width = 380;
	window.innerWidth = 320;
	window.innerHeight = 760;
	const item = shallow(<Flyout {...props} />);
	await wait(500);

	expect(item.find("OnTop").length).toBe(1);
	expect(item.find("WrapDiv").length).toBe(1);
	const wrapDiv = item.find("WrapDiv");
	expect(wrapDiv.props().side).toBe("bottom");
	expect(item.state("isClosing")).toBe(false);
	expect(item.state("isLoading")).toBe(true);
	item.instance().closeFlyout();
	expect(item.state("isClosing")).toBe(true);
	expect(item.state("isLoading")).toBe(false);
	await wait(500);
	expect(mockFunction).toHaveBeenCalled();
});

test("User seen the flyout at different position", async () => {
	window.scrollTo = mockFunction;
	mockBB = {
		left: 1133.34375,
		right: 1554,
		top: -20,
		bottom: 14,
		width: 420.65625,
		height: 34,
		x: 1133.34375,
		y: -20,
	};
	props.height = 160;
	props.width = 380;
	window.innerWidth = 320;
	window.innerHeight = 760;
	const item = shallow(<Flyout {...props} />);
	await wait(500);

	expect(item.find("OnTop").length).toBe(1);
	expect(item.find("WrapDiv").length).toBe(1);

	item.setProps({ width: 640, height: 1200 });
	item.update();
	item.instance().forceUpdate();
	await wait(500);
	expect(item.find("OnTop").length).toBe(1);
	expect(item.find("WrapDiv").length).toBe(1);
});

test("User seen the flyout at right side", async () => {
	mockBB = {
		left: 284,
		right: 601.5,
		top: 44,
		bottom: 1683.140625,
		width: 317.5,
		height: 1639.140625,
		x: 284,
		y: 44,
	};
	window.scrollTo = jest.fn();
	const item = shallow(<Flyout {...props} />);
	await wait(500);
	window.innerHeight = 420;
	window.innerWidth = 1400;
	expect(item.find("OnTop").length).toBe(1);
	expect(item.find("WrapDiv").length).toBe(1);
	const wrapDiv = item.find("WrapDiv");
	expect(wrapDiv.props().side).toBe("top");
});

test("When user move to other page", async () => {
	window.scrollTo = jest.fn();
	mockBB = mockBBBottom;
	props.height = 160;
	props.width = 380;
	window.innerWidth = 320;
	window.innerHeight = 760;
	const item = shallow(<Flyout {...props} />);
	await wait(500);
	item.instance().closeFlyout();
	item.instance().componentWillUnmount();
	item.instance().doSlowScroll();
	item.instance()._maybeInstallResizeObserver();
	item.instance().closeFlyout();
	expect(item.find("OnTop").length).toBe(1);
	expect(item.find("WrapDiv").length).toBe(1);
	const wrapDiv = item.find("WrapDiv");
	expect(wrapDiv.props().side).toBe("bottom");
});

test("When right is passed smaller", async () => {
	mockBB = {
		left: 284,
		right: -601.5,
		top: 44,
		bottom: 1683.140625,
		width: 317.5,
		height: 1639.140625,
		x: 284,
		y: 44,
	};
	window.scrollTo = jest.fn();
	props.target = null;
	const item = shallow(<Flyout {...props} />);
	await wait(500);
	window.innerHeight = 420;
	window.innerWidth = 1400;
	expect(item.find("OnTop").length).toBe(1);
	expect(item.find("WrapDiv").length).toBe(1);
	const wrapDiv = item.find("WrapDiv");
	expect(wrapDiv.props().side).toBe("right");
});

test("When side prefrence is passed as top", async () => {
	mockBB = {
		left: 284,
		right: -601.5,
		top: 44,
		bottom: 1683.140625,
		width: 317.5,
		height: 1639.140625,
		x: 284,
		y: 44,
	};
	window.scrollTo = jest.fn();
	props.target = null;
	const item = shallow(<Flyout {...props} />);
	item.setProps({ side_preference: "top" });

	await wait(500);
	window.innerHeight = 420;
	window.innerWidth = 1400;
	expect(item.find("OnTop").length).toBe(1);
	expect(item.find("WrapDiv").length).toBe(1);
	const wrapDiv = item.find("WrapDiv");
	expect(wrapDiv.props().side).toBe("right");
});

test("when side_preference is set as bottom in params", async () => {
	mockBB = {
		left: 284,
		right: -601.5,
		top: 144,
		bottom: 1683.140625,
		width: 317.5,
		height: 1639.140625,
		x: 284,
		y: 44,
	};
	window.scrollTo = jest.fn();
	props.target = null;
	const item = shallow(<Flyout {...props} />);
	item.setProps({ side_preference: "bottom" });

	await wait(500);
	window.innerHeight = 420;
	window.innerWidth = 1400;
	expect(item.find("OnTop").length).toBe(1);
	expect(item.find("WrapDiv").length).toBe(1);
	const wrapDiv = item.find("WrapDiv");
	expect(wrapDiv.props().side).toBe("top");
});

test("when side_preference is set as bottom in params and bottom is passed smaller", async () => {
	mockBB = {
		left: 284,
		right: -601.5,
		top: 144,
		bottom: 168.140625,
		width: 317.5,
		height: 1639.140625,
		x: 284,
		y: 44,
	};
	window.scrollTo = jest.fn();
	props.target = null;
	const item = shallow(<Flyout {...props} />);
	item.setProps({ side_preference: "bottom" });

	await wait(500);
	window.innerHeight = 420;
	window.innerWidth = 1400;
	expect(item.find("OnTop").length).toBe(1);
	expect(item.find("WrapDiv").length).toBe(1);
	const wrapDiv = item.find("WrapDiv");
	expect(wrapDiv.props().side).toBe("bottom");
});
