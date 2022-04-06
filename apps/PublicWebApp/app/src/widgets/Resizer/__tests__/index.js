import React from "react";
import { shallow } from "enzyme";
import Resizer from "../index";
let props, mockFunction, mockOnEventListenerCalled, mockGetBoundingClientRect;
const Attrs = ["top_left", "top_right", "bottom_right", "bottom_left"];
/**wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return {
			current: {
				addEventListener: (eventName, callback) => {
					mockOnEventListenerCalled(eventName, callback);
				},
				removeEventListener: (eventName, callback) => {
					mockOnEventListenerCalled(eventName, callback);
				},
				getBoundingClientRect: () => {
					return mockGetBoundingClientRect;
				},
			},
		};
	};
});
/**
 * Reset function
 */
function resetAll() {
	mockGetBoundingClientRect = {
		bottom: 186.1300048828125,
		height: 6.1800079345703125,
		left: 990.68798828125,
		right: 996.8679809570312,
		top: 179.9499969482422,
		width: 6.17999267578125,
		x: 990.68798828125,
		y: 179.9499969482422,
	};
	mockFunction = jest.fn();
	mockOnEventListenerCalled = () => {};
	props = {
		notePosition: {
			style: {
				width: 2,
				height: 10,
				left: 21,
				top: 45,
				content: "TestDummy Text",
				subtitle: "DemoTest1",
				colour: "#2341",
				zindex: 23,
				zindex: 23,
				handleNoteSelection: mockFunction,
			},
		},
		oid: "a".repeat(36),
		onMoveOrResize: mockFunction,
		onPointerDown: mockFunction,
		isSelected: true,
		children: "DummyChildren",
		disabled: true,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders Correctly */
test(`Component renders Successfully`, async () => {
	const item = shallow(<Resizer {...props} />);
	expect(item.find("Wrap").length).toBe(1);
});

test("Test onMouseMove method and to move pointer", async () => {
	const item = shallow(<Resizer {...props} />);
	await wait(100);
	item.instance().onMouseMove({ preventDefault: jest.fn() });
	expect(item.find("Wrap").length).toBe(1);
});

test("Test onTouchMove method and to move note", async () => {
	const item = shallow(<Resizer {...props} />);
	await wait(100);
	const e = {
		preventDefault: jest.fn(),
		touches: [
			{ clientX: 10, clientY: 21 },
			{ clientX: 10, clientY: 21 },
		],
	};
	item.instance().onTouchMove(e);
	expect(item.find("Wrap").length).toBe(1);
});

test("User resizing from left", async () => {
	const item = shallow(<Resizer {...props} />);
	await wait(100);
	let e = {
		preventDefault: jest.fn(),
		target: {
			getAttribute: (name) => {
				return Attrs[0];
			},
		},
	};
	item.instance().onMoveOrResizeHandlePointerDown(e);
	item.instance()._onPointerMove(10, 21);
	mockGetBoundingClientRect = {
		bottom: 186.1300048828125,
		height: 6.1800079345703125,
		left: 990.68798828125,
		right: 996.8679809570312,
		top: 179.9499969482422,
		width: 6.17999267578125,
		x: 9.68798828125,
		y: 179.9499969482422,
	};
	item.instance()._onPointerMove(10, 21);

	mockGetBoundingClientRect = {
		bottom: 186.1300048828125,
		height: 6.1800079345703125,
		left: 990.68798828125,
		right: 996.8679809570312,
		top: 179.9499969482422,
		width: 6.17999267578125,
		x: 9.68798828125,
		y: 179.9499969482422,
	};
	item.instance()._onPointerMove(20, 21);
	expect(item.find("Wrap").length).toBe(1);
});

test("User resizing from right", async () => {
	const item = shallow(<Resizer {...props} />);
	await wait(100);
	let e = {
		preventDefault: jest.fn(),
		target: {
			getAttribute: (name) => {
				return Attrs[1];
			},
		},
	};
	item.instance().onMoveOrResizeHandlePointerDown(e);
	item.instance()._onPointerMove(10, 21);
	mockGetBoundingClientRect = {
		bottom: 186.1300048828125,
		height: 6.1800079345703125,
		left: 990.68798828125,
		right: 996.8679809570312,
		top: 179.9499969482422,
		width: 6.17999267578125,
		x: 9.68798828125,
		y: 189.9499969482422,
	};
	item.instance()._onPointerMove(10, 21);

	mockGetBoundingClientRect = {
		bottom: 186.1300048828125,
		height: 6.1800079345703125,
		left: 990.68798828125,
		right: 996.8679809570312,
		top: 179.9499969482422,
		width: 6.17999267578125,
		x: 9.68798828125,
		y: 9.9499969482422,
	};
	item.instance()._onPointerMove(10, 21);

	mockGetBoundingClientRect = {
		bottom: 186.1300048828125,
		height: 16.1800079345703125,
		left: 990.68798828125,
		right: 996.8679809570312,
		top: 179.9499969482422,
		width: 6.17999267578125,
		x: 9.68798828125,
		y: 9.9499969482422,
	};
	item.instance()._onPointerMove(10, 21);
	expect(item.find("Wrap").length).toBe(1);
});

test("User draging from bottom right", async () => {
	const item = shallow(<Resizer {...props} />);
	await wait(100);
	let e = {
		preventDefault: jest.fn(),
		target: {
			getAttribute: (name) => {
				return Attrs[2];
			},
		},
	};
	item.instance().onMoveOrResizeHandlePointerDown(e);
	item.instance()._onPointerMove(10, 21);
	mockGetBoundingClientRect = {
		bottom: 186.1300048828125,
		height: 6.1800079345703125,
		left: 990.68798828125,
		right: 996.8679809570312,
		top: 179.9499969482422,
		width: 6.17999267578125,
		x: 9.68798828125,
		y: 189.9499969482422,
	};
	item.instance()._onPointerMove(10, 21);

	mockGetBoundingClientRect = {
		bottom: 186.1300048828125,
		height: 6.1800079345703125,
		left: 990.68798828125,
		right: 996.8679809570312,
		top: 179.9499969482422,
		width: 6.17999267578125,
		x: 9.68798828125,
		y: 9.9499969482422,
	};
	item.instance()._onPointerMove(10, 21);

	mockGetBoundingClientRect = {
		bottom: 186.1300048828125,
		height: 16.1800079345703125,
		left: 990.68798828125,
		right: 996.8679809570312,
		top: 179.9499969482422,
		width: 6.17999267578125,
		x: 9.68798828125,
		y: 9.9499969482422,
	};
	item.instance()._onPointerMove(10, 21);
	expect(item.find("Wrap").length).toBe(1);
});

test("User draging from bottom left", async () => {
	const item = shallow(<Resizer {...props} />);
	await wait(100);
	let e = {
		preventDefault: jest.fn(),
		target: {
			getAttribute: (name) => {
				return Attrs[3];
			},
		},
	};
	item.instance().onMoveOrResizeHandlePointerDown(e);
	item.instance()._onPointerMove(10, 21);
	mockGetBoundingClientRect = {
		bottom: 186.1300048828125,
		height: 6.1800079345703125,
		left: 990.68798828125,
		right: 996.8679809570312,
		top: 179.9499969482422,
		width: 6.17999267578125,
		x: 9.68798828125,
		y: 189.9499969482422,
	};
	item.instance()._onPointerMove(10, 21);

	mockGetBoundingClientRect = {
		bottom: 186.1300048828125,
		height: 6.1800079345703125,
		left: 990.68798828125,
		right: 996.8679809570312,
		top: 179.9499969482422,
		width: 6.17999267578125,
		x: 9.68798828125,
		y: 9.9499969482422,
	};
	item.instance()._onPointerMove(10, 21);

	mockGetBoundingClientRect = {
		bottom: 186.1300048828125,
		height: 16.1800079345703125,
		left: 990.68798828125,
		right: 996.8679809570312,
		top: 179.9499969482422,
		width: 6.17999267578125,
		x: 9.68798828125,
		y: 9.9499969482422,
	};
	item.instance()._onPointerMove(10, 21);
	expect(item.find("Wrap").length).toBe(1);
});

test("Test onDragPointerDown method ", async () => {
	const item = shallow(<Resizer {...props} />);
	await wait(100);
	const clientX = 23;
	const clientY = 12;
	item.instance().onDragPointerDown(clientX, clientY);
	item.instance()._onPointerMove();
	expect(item.find("Wrap").length).toBe(1);
});

test("Test onDragMouseDown method and to down mouse", async () => {
	const item = shallow(<Resizer {...props} />);
	await wait(100);
	item.instance().onDragMouseDown({ preventDefault: jest.fn() });
	expect(item.find("Wrap").length).toBe(1);
});

test("Test onDragTouchStart method", async () => {
	const item = shallow(<Resizer {...props} />);
	await wait(100);
	const e = {
		preventDefault: jest.fn(),
		touches: [
			{ clientX: 10, clientY: 21 },
			{ clientX: 10, clientY: 21 },
		],
	};
	item.instance().onDragTouchStart(e);
	expect(item.find("Wrap").length).toBe(1);
});

test("Test _onPointerUp method", async () => {
	const item = shallow(<Resizer {...props} />);
	await wait(100);
	const e = { preventDefault: jest.fn() };
	item.instance()._onPointerUp(e);
	item.instance().componentWillUnmount();
	expect(item.find("Wrap").length).toBe(1);
});

test("Render addEventListener method have been called", async () => {
	props.disabled = false;
	mockOnEventListenerCalled = jest.fn();
	const item = shallow(<Resizer {...props} />);
	item.instance().componentWillUnmount();
	expect(item.find("Wrap").length).toBe(1);
	expect(mockOnEventListenerCalled).toBeCalled();
});

test("Use click on only the drag area", async () => {
	const item = shallow(<Resizer {...props} />);
	await wait(100);
	const clientX = 23;
	const clientY = 12;
	item.instance().onDragPointerDown(clientX, clientY);
	item.instance()._onPointerMove();
	expect(item.find("Wrap").length).toBe(1);
	expect(mockFunction).toHaveBeenCalled();
});

test("User roatate page 90 degrees", async () => {
	props.rotateDegree = 90;
	const item = shallow(<Resizer {...props} />);
	expect(item.find("div").at(0).props().style).toEqual({
		width: 10,
		height: 2,
		transformOrigin: "bottom left",
		transform: "translateY(-100%) rotate(90deg)",
	});
});

test("User roatate page 180 degrees", async () => {
	props.rotateDegree = 180;
	const item = shallow(<Resizer {...props} />);
	expect(item.find("div").at(0).props().style).toEqual({ width: "100%", height: "100%", transform: "rotate(180deg)" });
});

test("User roatate page 270 degrees", async () => {
	props.rotateDegree = 270;
	const item = shallow(<Resizer {...props} />);
	expect(item.find("div").at(0).props().style).toEqual({
		width: 10,
		height: 2,
		transformOrigin: "right top",
		transform: "translateX(-100%) rotate(270deg)",
	});
});

test("If onPointerDown is not a function", async () => {
	props.onPointerDown = {};
	const item = shallow(<Resizer {...props} />);
	let e = {
		preventDefault: jest.fn(),
		target: {
			getAttribute: (name) => {
				return Attrs[0];
			},
		},
	};
	item.instance().onMoveOrResizeHandlePointerDown(e);
	await wait(100);
	const clientX = 23;
	const clientY = 12;
	item.instance().onDragPointerDown(clientX, clientY);
	expect(item.find("Wrap").length).toBe(1);
});
