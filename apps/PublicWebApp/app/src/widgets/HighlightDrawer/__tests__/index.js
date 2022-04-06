import React from "react";
import { shallow } from "enzyme";
import HighlightDrawer from "../index";

let props,
	mockParentRef,
	mockWidth = null,
	mockHeight = null,
	mockFunction,
	mockIsCallAddEventListerMethod = false,
	mockIsCallRemoveEventListerMethod = false;
function resetAll() {
	mockParentRef = {
		top: 100,
		left: 100,
		right: 100,
		bottom: 100,
	};
	mockWidth = 80;
	mockHeight = 100;
	mockIsCallAddEventListerMethod = false;
	mockIsCallRemoveEventListerMethod = false;
	props = {
		parentRef: {
			current: {
				getBoundingClientRect: () => {
					mockIsCallAddEventListerMethod = true;
					return mockParentRef;
				},
			},
		},
		imageBb: {
			right: 100,
			bottom: 100,
			left: 100,
			top: 100,
		},
		onHighlightDraw: mockFunction,
		bgColour: "#ff56a",
	};
	mockFunction = jest.fn();
}
jest.mock("../../OnTop", () => {
	return;
});

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = shallow(<HighlightDrawer {...props} />);
	expect(item.find("OnTop").length).toBe(0);
	expect(item.find("div").length).toBe(1);
	item.instance().componentWillUnmount();
});

test(`When User move pointer down side to draw highlight`, async () => {
	const item = shallow(<HighlightDrawer {...props} />);
	expect(item.find("img").length).toBe(0);
	expect(item.find("div").length).toBe(1);
	const clientX = 21;
	const clientY = 14;
	item.instance()._onMouseDown({ preventDefault: jest.fn(), stopPropagation: jest.fn(), target: { tagName: "IMG" }, clientX, clientY });
	expect(item.instance()._pointerStartPosition).toEqual({ x: 21, y: 14 });
});

test(`User Draw the highlight from left to right`, async () => {
	const item = shallow(<HighlightDrawer {...props} />);
	expect(item.find("img").length).toBe(0);
	expect(item.find("div").length).toBe(1);
	const clientX = 110;
	const clientY = 110;
	mockParentRef = {
		top: 100,
		left: 100,
		right: 120,
		bottom: 120,
	};
	item.instance()._onMouseDown({ preventDefault: jest.fn(), stopPropagation: jest.fn(), target: { tagName: "IMG" }, clientX, clientY });
	expect(item.instance()._pointerStartPosition.x).toBe(clientX);
	expect(item.instance()._pointerStartPosition.y).toBe(clientY);
	item.instance().onTouchMove({ preventDefault: jest.fn(), stopPropagation: jest.fn(), touches: [{ clientX, clientY }] });
	expect(item.state("width")).toBe(0);
	expect(item.state("height")).toBe(0);
	expect(item.state("left")).toBe(100);
	expect(item.state("top")).toBe(100);
	item.setState({ width: 1, height: 1 });
	item.instance()._onPointerUp({ preventDefault: jest.fn(), stopPropagation: jest.fn(), target: { tagName: "IMG" }, clientX, clientY });
	expect(item.state("width")).toBe(0);
});

test(`User Draw the highlight from left to right`, async () => {
	const item = shallow(<HighlightDrawer {...props} />);
	expect(item.find("img").length).toBe(0);
	expect(item.find("div").length).toBe(1);
	const clientX = 110;
	const clientY = 110;
	mockParentRef = {
		top: 100,
		left: 100,
		right: 120,
		bottom: 120,
	};
	item.instance()._onMouseDown({ preventDefault: jest.fn(), stopPropagation: jest.fn(), target: { tagName: "IMG" }, clientX, clientY });
	expect(item.instance()._pointerStartPosition.x).toBe(clientX);
	expect(item.instance()._pointerStartPosition.y).toBe(clientY);
	item.instance().onTouchMove({ preventDefault: jest.fn(), stopPropagation: jest.fn(), touches: [{ clientX, clientY }] });
	expect(item.state("width")).toBe(0);
	expect(item.state("height")).toBe(0);
	expect(item.state("left")).toBe(100);
	expect(item.state("top")).toBe(100);
	item.setState({ width: 1, height: 1 });
	item.instance()._onPointerDown({ preventDefault: jest.fn(), stopPropagation: jest.fn(), touches: [{ clientX, clientY }] });
	expect(item.state("width")).toBe(1);
});

test(`When User move mouse to draw highlight`, async () => {
	const item = shallow(<HighlightDrawer {...props} />);
	expect(item.find("img").length).toBe(0);
	expect(item.find("div").length).toBe(1);
	const clientX = 21;
	const clientY = 14;
	item.instance().onMouseMove({ preventDefault: jest.fn(), stopPropagation: jest.fn(), target: { tagName: "IMG" }, clientX, clientY });
});
