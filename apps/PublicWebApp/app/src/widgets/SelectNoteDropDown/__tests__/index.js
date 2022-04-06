import React from "react";
import { shallow, mount } from "enzyme";
import NoteDropDownField from "../index";
import MockNoteOption from "../../../mocks/MockNoteOption";

let props, mockFunction, mockHandleOnOpen, onOpen;

jest.mock("../option", () => jest.fn());

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	onOpen = jest.fn();
	mockFunction = jest.fn();
	mockHandleOnOpen = jest.fn();
	props = {
		options: MockNoteOption,
		onSelect: mockFunction,
		selected: { text: "Dummy Text" },
		selectedTitle: "",
		iconClass: "",
	};
	state = {
		isOpen: false,
	};
}

let state;

beforeEach(resetAll);
afterEach(resetAll);

/**Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<NoteDropDownField {...props} />);
	expect(item.find("SelectWrap").length).toBe(1);
	expect(item.find("SectionLeft").length).toBe(1);
});

test("When selected text is not provided", async () => {
	delete props.selected;
	const item = shallow(<NoteDropDownField {...props} />);
	expect(item.find("SelectWrap").length).toBe(1);
	expect(item.find("SectionLeft").length).toBe(1);
});

test("When user click on dropdown", async () => {
	const item = shallow(<NoteDropDownField {...props} />);
	item.setState({ onOpen: true });
	item.instance().onOpen();
	await wait(10);
	expect(item.find("SelectWrap").length).toBe(1);
	expect(item.find("SectionLeft").length).toBe(1);
	expect(item.state("onOpen")).toBe(true);
});

test("Test escFunction method", async () => {
	const item = shallow(<NoteDropDownField {...props} />);
	item.instance().escFunction({ keyCode: 27 });
	expect(item.find("SelectWrap").length).toBe(1);
	expect(item.find("SectionLeft").length).toBe(1);
});

test("When we have title & icon changed in dropdown", async () => {
	props.selectedTitle = "Highlight";
	props.iconClass = "far fa-highlighter";
	const item = shallow(<NoteDropDownField {...props} />);
	expect(item.find("SelectWrap").length).toBe(1);
	expect(item.find("SectionLeft").length).toBe(1);
	expect(item.find("SectionRight").length).toBe(1);
});
