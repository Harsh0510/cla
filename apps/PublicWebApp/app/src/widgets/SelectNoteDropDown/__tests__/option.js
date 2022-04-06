import React from "react";
import { shallow, mount } from "enzyme";
import NoteOptions from "../option";
import MockNoteOption from "../../../mocks/MockNoteOption";

let props, mockFunction, mockSelected;

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	mockFunction = jest.fn();
	mockSelected = {
		value: { key: "6372", text: "Yellow" },
	};
	props = {
		option: MockNoteOption[0],
		onSelect: mockFunction,
		selected: mockSelected,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/**Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<NoteOptions {...props} />);
	expect(item.find("List").length).toBe(1);
	expect(item.find("SectionLeft").length).toBe(1);
	expect(item.find("SectionRight").length).toBe(1);
});

test("When user selected text from Dropdown", async () => {
	props.selected = null;
	const item = shallow(<NoteOptions {...props} />);
	item.instance().onSelect({ preventDefault: jest.fn() });
	expect(item.find("List").length).toBe(1);
	expect(item.find("SectionLeft").length).toBe(1);
	expect(item.find("SectionRight").length).toBe(1);
});

test("When user have highlight delete option in dropdown", async () => {
	props.option = { key: "#option5", text: "Delete", value: "Delete", toolTip: "Remove highlighting", icon: "far fa-eraser" };
	const item = shallow(<NoteOptions {...props} />);
	expect(item.find("List").length).toBe(1);
	expect(item.find("SectionLeft").length).toBe(1);
	expect(item.find("SectionRight").length).toBe(1);
});
