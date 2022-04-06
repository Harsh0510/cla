import React from "react";
import { shallow } from "enzyme";
import Note from "../Note";
import theme from "../../../common/theme";
import { sqlToJsTimestamp, jsDateToNiceFormat, sqlToNiceFormat, rawToNiceDate, rawToNiceDateForExcel } from "../../../common/date";
let props, mockFunction, state;
let mockEvent = {};

jest.mock("../../../widgets/Resizer", () => {
	return "Resizer";
});

jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return {
			current: {
				focus: function () {
					return;
				},
				outerText: function () {
					return;
				},
			},
		};
	};
});
/**
 * Reset function
 */
function resetAll() {
	mockEvent = {
		preventDefault: jest.fn(),
		key: "Delete",
		target: {
			ContentEditable: false,
			id: 11,
		},
	};
	mockFunction = jest.fn();
	props = {
		oid: "ajsnbxjashudy8732878",
		did_create: true,
		wrapWidth: 100,
		wrapHeight: 10,
		width: 2,
		height: 10,
		left: 21,
		top: 45,
		content: "TestDummy Text",
		subtitle: "DemoTest1",
		colour: "#2341",
		zindex: 23,
		isSelected: false,
		isRecentlyAdded: true,
		onContentChange: mockFunction,
		onMoveOrResize: mockFunction,
		handleNoteSelection: mockFunction,
		handleNoteClose: mockFunction,
		disabled: false,
		hideContent: false,
		rotateDegree: 0,
	};
	state = {
		width: null,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders Correctly */
test(`Component renders Successfully`, async () => {
	const item = shallow(<Note {...props} />);
	expect(item.find("Resizer").length).toBe(1);
});

test(`When User enter text`, async () => {
	const item = shallow(<Note {...props} />);
	item.instance().onChange({ target: { value: "TestDummy Text2" } });
	expect(item.find("StyledContentEditable").length).toBe(1);
	// expect(item.state("content")).toEqual("TestDummy Text");
});

test(`When User didnot change content`, async () => {
	const item = shallow(<Note {...props} />);
	item.instance().onChange({ target: { value: "TestDummy Text" } });
	expect(item.find("StyledContentEditable").length).toBe(1);
	// expect(item.state("content")).toEqual("TestDummy Text");
});

test(`When User enter text but field is disabled`, async () => {
	props.did_create = false;
	const item = shallow(<Note {...props} />);
	item.instance().onChange({ target: { value: "TestDummy Text2" } });
	expect(item.props().disabled).toBe(true);
});

test(`When User click on delete button`, async () => {
	props.isSelected = true;
	const item = shallow(<Note {...props} />);
	item.instance().isDisabled();
	expect(item.props().disabled).toBe(false);
});

test(`When User click on delete button but button is disabled`, async () => {
	props.did_create = false;
	props.isSelected = true;
	const item = shallow(<Note {...props} />);
	const e = { preventDefault: jest.fn(), key: "Delete" };
	// item.instance().onDelete(e);
	expect(item.props().disabled).toBe(true);
});

test(`When User click on delete button but key is different`, async () => {
	props.isSelected = true;
	const item = shallow(<Note {...props} />);
	const e = { preventDefault: jest.fn(), key: "Test" };
	// item.instance().onDelete(e);
	expect(item.props().disabled).toBe(false);
});

test(`When User click on delete button but not selected note`, async () => {
	const item = shallow(<Note {...props} />);
	// item.instance().onDelete();
	expect(item.props().disabled).toBe(false);
});

test(`When User click on close button`, async () => {
	const item = shallow(<Note {...props} />);
	item.instance().handleOnClose({ preventDefault: jest.fn() });
	expect(item.props().disabled).toBe(false);
});

test(`When User click on close button but button is disabled`, async () => {
	props.did_create = true;
	const item = shallow(<Note {...props} />);
	item.instance().handleOnClose({ preventDefault: jest.fn() });
	expect(item.props().disabled).toBe(false);
});

test(`When User resize the note`, async () => {
	const item = shallow(<Note {...props} />);
	const width = item.props().width;
	const height = item.props().height;
	const left = item.props().left;
	const top = item.props().top;
	item.instance().onMoveOrResize(width, height, left, top);
	expect(item.state("notePosition").width).toEqual(2);
	expect(item.state("notePosition").height).toEqual(1);
	expect(item.state("notePosition").top).toEqual(4.5);
	expect(item.state("notePosition").left).toEqual(21);
});

test(`When User trying to resize the note but it is disabled`, async () => {
	props.did_create = false;
	props.content = "";
	const item = shallow(<Note {...props} />);
	const width = item.props().width;
	const height = item.props().height;
	const left = item.props().left;
	const top = item.props().top;
	item.instance().onMoveOrResize(width, height, left, top);
	expect(item.state("notePosition").width).toEqual(2);
	expect(item.state("notePosition").height).toEqual(10);
	expect(item.state("notePosition").top).toEqual(45);
	expect(item.state("notePosition").left).toEqual(21);
	// expect(item.state("content")).toEqual("");
});

test(`When user click on the  the note`, async () => {
	const item = shallow(<Note {...props} />);
	const e = { preventDefault: jest.fn(), target: { id: "note_information_" } };
	item.instance().handleOnClick(e);
	expect(item.state("notePosition").width).toEqual(2);
});

test(`Test handleKeyDown method`, async () => {
	props.isSelected = true;
	const item = shallow(<Note {...props} />);
	// item.instance().handleKeyDown(mockEvent);
	expect(item.props().disabled).toEqual(false);
	expect(item.state("notePosition").width).toEqual(2);
});

test(`Test handleKeyDown method but key is changed`, async () => {
	props.did_create = false;
	mockEvent.key = "Unique";
	const item = shallow(<Note {...props} />);
	// item.instance().handleKeyDown(mockEvent);
	expect(item.props().disabled).toEqual(true);
	expect(item.state("notePosition").width).toEqual(2);
});

test(`User Double Click on Note`, async () => {
	props.isRecentlyAdded = false;
	const item = shallow(<Note {...props} />);
	item.instance().handleDoubleClick(mockEvent);
	expect(item.state("notePosition").width).toEqual(2);
	expect(item.props().disabled).toEqual(false);
});

test(`User highlight the Note`, async () => {
	global.document.execCommand = mockFunction;
	props.isSelected = true;
	const item = shallow(<Note {...props} />);
	item.instance().handleDoubleClick(mockEvent);
	expect(item.state("notePosition").width).toEqual(2);
	expect(item.props().disabled).toEqual(false);
	// expect(mockFunction).toHaveBeenCalled();
	item.setProps({ isSelected: false });
	item.update();
	expect(item.props().isSelected).toEqual(false);
});

test(`User see note when rotate 90 degree right`, async () => {
	props.rotateDegree = 90;
	const item = shallow(<Note {...props} />);
	expect(item.find("Resizer").length).toBe(1);
	expect(item.find("Resizer").props().notePosition).toEqual({
		height: 0.2,
		right: 45,
		style: { height: "0.2px", pointerEvents: "auto", position: "absolute", right: "45px", top: "2.1px", width: "10px", zIndex: 23 },
		top: 2.1,
		width: 10,
	});
});

test(`User see note when rotate 180 degree right`, async () => {
	props.rotateDegree = 180;
	const item = shallow(<Note {...props} />);
	expect(item.find("Resizer").length).toBe(1);
	expect(item.find("Resizer").props().notePosition).toEqual({
		bottom: 4.5,
		height: 1,
		right: 21,
		style: { bottom: "4.5px", height: "1px", pointerEvents: "auto", position: "absolute", right: "21px", width: "2px", zIndex: 23 },
		width: 2,
	});
});

test(`User see note when rotate 270 degree right`, async () => {
	props.rotateDegree = 270;
	const item = shallow(<Note {...props} />);
	expect(item.find("Resizer").length).toBe(1);
	expect(item.find("Resizer").props().notePosition).toEqual({
		height: 0.2,
		right: 45,
		style: { bottom: "2.1px", height: "0.2px", left: "45px", pointerEvents: "auto", position: "absolute", width: "10px", zIndex: 23 },
		top: 2.1,
		width: 10,
	});
});

test(`User see note when rotate 270 degree left`, async () => {
	props.rotateDegree = -270;
	const item = shallow(<Note {...props} />);
	expect(item.find("Resizer").length).toBe(1);
	expect(item.find("Resizer").props().notePosition).toEqual({
		height: 0.2,
		right: 45,
		style: { height: "0.2px", pointerEvents: "auto", position: "absolute", right: "45px", top: "2.1px", width: "10px", zIndex: 23 },
		top: 2.1,
		width: 10,
	});
});

test(`User see note when rotate 90 degree left`, async () => {
	props.rotateDegree = -90;
	const item = shallow(<Note {...props} />);
	expect(item.find("Resizer").length).toBe(1);
	expect(item.find("Resizer").props().notePosition).toEqual({
		height: 0.2,
		right: 45,
		style: { bottom: "2.1px", height: "0.2px", left: "45px", pointerEvents: "auto", position: "absolute", width: "10px", zIndex: 23 },
		top: 2.1,
		width: 10,
	});
});

test(`User see note when rotate 180 degree left`, async () => {
	props.rotateDegree = -180;
	const item = shallow(<Note {...props} />);
	expect(item.find("Resizer").length).toBe(1);
	expect(item.find("Resizer").props().notePosition).toEqual({
		bottom: 4.5,
		height: 1,
		right: 21,
		style: { bottom: "4.5px", height: "1px", pointerEvents: "auto", position: "absolute", right: "21px", width: "2px", zIndex: 23 },
		width: 2,
	});
});
