import React from "react";
import { shallow, mount } from "enzyme";
import CheckBoxField from "../index";

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(<CheckBoxField />);
	expect(item.find("input").length).toBe(1);
});

/** When user click on checkbox */
test("When user click on checkbox", async () => {
	const mockFn = jest.fn();
	const checked = true;

	const item = mount(<CheckBoxField name={"check"} onChange={mockFn} onBlur={mockFn} checked={checked} value={checked} isRequired={true} />);
	item.find("WrapperAgreeSection").simulate("click");
	item.instance().onChange();

	//check field validation
	item.setProps({ title: "I Agree" });
	item.instance().fieldIsValid(true);

	expect(mockFn).toHaveBeenCalled();
});

/** When user mouse out or goto other section */
test("When user mouse out or goto other section", async () => {
	const mockFn = jest.fn();
	const checked = true;
	const item = mount(<CheckBoxField name={"check"} onChange={mockFn} onBlur={mockFn} checked={checked} value={checked} />);
	item.instance().onBlur();
	expect(item.find("FakeInput").length).toBe(1);
});

/** Check checkbox is valid or not */
test("Check checkbox is valid or not", async () => {
	const mockFn = jest.fn();
	//User not checked the checkbox
	const checked = false;
	const item = mount(<CheckBoxField name={"check"} onChange={mockFn} onBlur={mockFn} checked={checked} value={checked} isRequired={true} />);

	item.find("WrapperAgreeSection").simulate("click");
	let isValid = item.instance().isValid();
	expect(isValid).toEqual(false);

	item.setProps({ isRequired: false });
	//User checked the checkbox
	item.setProps({ checked: true });
	isValid = item.instance().isValid(true);

	expect(isValid).toEqual(true);
});

test("Passes ExtraText in checkbox label", async () => {
	const mockFn = jest.fn();
	const checked = true;
	const item = mount(<CheckBoxField name={"check"} onChange={mockFn} onBlur={mockFn} checked={checked} value={checked} />);
	item.setProps({ extraText: "What will I receive?" });
	expect(item.find("Label").length).toBe(2);
});

/** Check checkbox is not required */
test("Check checkbox is not required", async () => {
	const mockFn = jest.fn();
	//User not checked the checkbox
	const checked = false;
	const item = mount(<CheckBoxField name={"check"} onChange={mockFn} onBlur={mockFn} checked={checked} value={checked} isRequired={false} />);

	item.find("WrapperAgreeSection").simulate("click");
	let isValid = item.instance().isValid();
	expect(isValid).toEqual(true);

	item.setProps({ isValid: true });
	expect(isValid).toEqual(true);
});
