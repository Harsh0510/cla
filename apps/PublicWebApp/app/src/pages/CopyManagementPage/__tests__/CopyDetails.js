import React from "react";
import { shallow } from "enzyme";
import CopyDetails from "../CopyDetails";

let props, mockFunction;

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	mockFunction = jest.fn();
	props = {
		data: [],
		isCopyTitleEditable: false,
		title: "Test",
		isDisplayCopyTitleEditable: mockFunction,
		submitCopyTitleEditable: mockFunction,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	props.isCopyTitleEditable = false;
	const item = shallow(<CopyDetails {...props} />);
	expect(item.find("HeadTitle").length).toBe(1);
	expect(item.find("CopyNameSection").length).toBe(1);
});

/** User click on edit button beside the copy title name */
test("User click on edit button beside the copy title name", async () => {
	props.isCopyTitleEditable = false;
	const item = shallow(<CopyDetails {...props} />);
	const editTitleButton = item.find("CopyNameEditButton");
	editTitleButton.simulate("click", {});
	expect(mockFunction).toHaveBeenCalled();
});

/** User edit the title and press enter button*/
test("User edit the title and press enter button", async () => {
	props.isCopyTitleEditable = true;
	const item = shallow(<CopyDetails {...props} />);
	// const submitForm = item.find('[name : "formTitleSubmit"]');
	const submitForm = item.find("form");
	submitForm.simulate("submit", {});
	expect(mockFunction).toHaveBeenCalled();
});

/** User click on edit button and edit the title text from input*/
test("User click on edit button and edit the title text from input", async () => {
	props.isCopyTitleEditable = false;
	const item = shallow(<CopyDetails {...props} />);
	//User clicked on edit button
	item.setProps({ isCopyTitleEditable: true });
	item.update();
	const titleInputText = item.find("InputCopyTitleText");
	const title_BeforeUpdate = item.state().title;
	//User updated the title text
	titleInputText.simulate("change", { preventDefault: jest.fn(), target: { value: "Test1" } });
	const title_AfterUpdate = item.state().title;
	expect(title_BeforeUpdate).not.toEqual(title_AfterUpdate);
});

/** User leave the focus from title input text box*/
test("User leave the focus from title input text box", async () => {
	props.isCopyTitleEditable = false;
	const item = shallow(<CopyDetails {...props} />);
	expect(item.find("InputCopyTitleText").length).toEqual(0);
	//User clicked on edit button
	item.setProps({ isCopyTitleEditable: true });
	item.update();
	expect(item.find("InputCopyTitleText").length).toEqual(1);
	const titleInputText = item.find("InputCopyTitleText");
	const title_BeforeUpdate = item.state().title;

	//User updated the title text
	titleInputText.simulate("change", { preventDefault: jest.fn(), target: { value: "Test1" } });
	const title_AfterUpdate = item.state().title;
	expect(title_BeforeUpdate).not.toEqual(title_AfterUpdate);

	//User leave the title input text box
	titleInputText.simulate("blur", { preventDefault: jest.fn(), target: { value: "Test1" } });
	const title_AfterLeave = item.state().title;
	expect(mockFunction).toHaveBeenCalled();

	//Set props isCopyTitleEditable as false
	item.setProps({ isCopyTitleEditable: false });
	item.update();
	expect(title_BeforeUpdate).toEqual(title_AfterLeave);
	expect(item.find("InputCopyTitleText").length).toEqual(0);
});

test("User see epub message for epub when extract created from epub asset", async () => {
	props.data.file_format = "epub";
	const item = shallow(<CopyDetails {...props} />);
	expect(item.find("Ptag").length).toBe(1);
	expect(item.find("Ptag").text()).toEqual(
		"The page numbers in the digital version of this book may not match the ones in your physical copy so please select your pages carefully."
	);
});
