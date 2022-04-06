import React from "react";
import { shallow } from "enzyme";
import Highlight from "../Highlight";
let props,
	mockFunction,
	mockPageIndex = null;
global._claMainMouseButtonPressed = true;

/**
 * Reset function
 */
function resetAll() {
	mockFunction = jest.fn();
	mockPageIndex = 0;
	props = {
		oid: "0f2f7c0c56ca276585f15bcee807d1cea488",
		width: 23,
		height: 12,
		left: 0.5,
		top: 0.9,
		colour: "#fff34",
		handleHiglightDelete: mockFunction,
		selectedHighlight: true,
		rotateDegree: 0,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders Correctly */
test(`Component renders Successfully`, async () => {
	const item = shallow(<Highlight {...props} />);
	const evt = {
		preventDefault() {},
		stopPropagation() {},
	};
	item.instance().handleOnClick(evt);
	item.instance().handleOnMouseMove();
	expect(item.find("div").length).toBe(1);
});

test(`Component renders Successfully when select highlight is false`, async () => {
	props.selectedHighlight = false;
	const item = shallow(<Highlight {...props} />);
	const evt = {
		preventDefault() {},
		stopPropagation() {},
	};
	item.instance().handleOnClick(evt);
	global._claMainMouseButtonPressed = false;
	item.instance().handleOnMouseMove();
	expect(item.find("div").length).toBe(1);
});

test(`User see highlight when rotate 90 degree right`, async () => {
	props.rotateDegree = 90;
	const item = shallow(<Highlight {...props} />);
	const evt = {
		preventDefault() {},
		stopPropagation() {},
	};
	item.instance().handleOnClick(evt);
	item.instance().handleOnMouseMove();
	expect(item.find("div").length).toBe(1);
	expect(item.find("div").props().style).toEqual({
		backgroundColor: "#fff34",
		height: "23%",
		opacity: 0.5,
		pointerEvents: "auto",
		position: "absolute",
		right: "0.9%",
		top: "0.5%",
		width: "12%",
	});
});

test(`User see highlight when rotate 180 degree`, async () => {
	props.rotateDegree = 180;
	const item = shallow(<Highlight {...props} />);
	const evt = {
		preventDefault() {},
		stopPropagation() {},
	};
	item.instance().handleOnClick(evt);
	item.instance().handleOnMouseMove();
	expect(item.find("div").length).toBe(1);
	expect(item.find("div").props().style).toEqual({
		backgroundColor: "#fff34",
		bottom: "0.9%",
		height: "12%",
		opacity: 0.5,
		pointerEvents: "auto",
		position: "absolute",
		right: "0.5%",
		width: "23%",
	});
});

test(`User see highlight when rotate 270 degree right`, async () => {
	props.rotateDegree = 270;
	const item = shallow(<Highlight {...props} />);
	const evt = {
		preventDefault() {},
		stopPropagation() {},
	};
	item.instance().handleOnClick(evt);
	item.instance().handleOnMouseMove();
	expect(item.find("div").length).toBe(1);
	expect(item.find("div").props().style).toEqual({
		backgroundColor: "#fff34",
		bottom: "0.5%",
		height: "23%",
		left: "0.9%",
		opacity: 0.5,
		pointerEvents: "auto",
		position: "absolute",
		width: "12%",
	});
});

test(`User see highlight when rotate 90 degree left`, async () => {
	props.rotateDegree = -90;
	const item = shallow(<Highlight {...props} />);
	const evt = {
		preventDefault() {},
		stopPropagation() {},
	};
	item.instance().handleOnClick(evt);
	item.instance().handleOnMouseMove();
	expect(item.find("div").length).toBe(1);
	expect(item.find("div").props().style).toEqual({
		backgroundColor: "#fff34",
		bottom: "0.5%",
		height: "23%",
		left: "0.9%",
		opacity: 0.5,
		pointerEvents: "auto",
		position: "absolute",
		width: "12%",
	});
});

test(`User see highlight when rotate 180 degree left`, async () => {
	props.rotateDegree = -180;
	const item = shallow(<Highlight {...props} />);
	const evt = {
		preventDefault() {},
		stopPropagation() {},
	};
	item.instance().handleOnClick(evt);
	item.instance().handleOnMouseMove();
	expect(item.find("div").length).toBe(1);
	expect(item.find("div").props().style).toEqual({
		backgroundColor: "#fff34",
		bottom: "0.9%",
		height: "12%",
		opacity: 0.5,
		pointerEvents: "auto",
		position: "absolute",
		right: "0.5%",
		width: "23%",
	});
});

test(`User see highlight when rotate 270 degree left`, async () => {
	props.rotateDegree = -270;
	const item = shallow(<Highlight {...props} />);
	const evt = {
		preventDefault() {},
		stopPropagation() {},
	};
	item.instance().handleOnClick(evt);
	item.instance().handleOnMouseMove();
	expect(item.find("div").length).toBe(1);
	expect(item.find("div").props().style).toEqual({
		backgroundColor: "#fff34",
		height: "23%",
		opacity: 0.5,
		pointerEvents: "auto",
		position: "absolute",
		right: "0.9%",
		top: "0.5%",
		width: "12%",
	});
});
