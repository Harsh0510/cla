// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import NameInputField from "../index";

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

let name, placeholder, defaultValue, handleChange, mockDoNameInputFieldChange;

jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return {
			current: {
				value: "another",
			},
		};
	};
});

/**
 * Reset function
 */
function resetAll() {
	name = "first_name";
	placeholder = "First Name";
	defaultValue = "devid";
	handleChange = jest.fn();
	mockDoNameInputFieldChange = jest.fn();
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(<NameInputField name={name} placeholder={placeholder} defaultValue={defaultValue} onChange={handleChange} />);

	await wait(50);
	expect(item.find("Input").length).toBe(1);
});

/** Component renders correctly with first_name input */
test("Component renders correctly with first_name input", async () => {
	const item = shallow(<NameInputField name={name} placeholder={placeholder} defaultValue={defaultValue} onChange={handleChange} />);
	await wait(50);
	expect(item.find({ name: "last_name" }).length).toBe(0);
	expect(item.find({ name: "first_name" }).length).toBe(1);
});

/** Component renders correctly with last_name input */
test("Component renders correctly with last_name input", async () => {
	name = "last_name";
	const item = shallow(<NameInputField name={name} placeholder={placeholder} defaultValue={defaultValue} onChange={handleChange} />);
	await wait(50);
	expect(item.find({ name: "first_name" }).length).toBe(0);
	expect(item.find({ name: "last_name" }).length).toBe(1);
});

/** User change the input field value */
test("User change the input field value", async () => {
	const item = shallow(
		<NameInputField
			name={name}
			placeholder={placeholder}
			defaultValue={defaultValue}
			onChange={handleChange}
			doNameInputFieldChange={mockDoNameInputFieldChange}
		/>
	);
	await wait(50);
	item.instance().handleChange({ preventDefault: jest.fn(), target: { value: "devid", name: name } });
	expect(item.state().field_error).toBe(null);
	expect(mockDoNameInputFieldChange).toHaveBeenCalled();
});

/** Check the field is valid or not */
test("Check the field is valid or not", async () => {
	const patterns = /^[^\r\t\n\]\[¬|\<>?:@~{}_+!£$%^&/*,./;'#\[\]|]{1,255}$/;
	const item = shallow(
		<NameInputField
			name={name}
			required={true}
			defaultValue={defaultValue}
			onChange={handleChange}
			doNameInputFieldChange={mockDoNameInputFieldChange}
			patterns={patterns}
		/>
	);
	//when field is valid
	item.instance().handleChange({ preventDefault: jest.fn(), target: { value: "david", name: name } });
	item.setProps({ isRequired: true, fieldName: "first_name" });
	item.instance().fieldisValid("david");

	//when field is not valid then return error
	item.instance().fieldisValid("david@2");
	expect(mockDoNameInputFieldChange).toHaveBeenCalled();
});

/** When user not input any value */
test("When user not input any value", async () => {
	const patterns = /^[^\r\t\n\]\[¬|\<>?:@~{}_+!£$%^&/*,./;'#\[\]|]{1,255}$/;
	const item = shallow(
		<NameInputField
			name={name}
			placeholder={placeholder}
			defaultValue={defaultValue}
			onChange={handleChange}
			doNameInputFieldChange={mockDoNameInputFieldChange}
			patterns={patterns}
		/>
	);
	item.instance().handleChange({ preventDefault: jest.fn(), target: { value: "", name: name } });
	item.instance().fieldisValid("");
	expect(mockDoNameInputFieldChange).toHaveBeenCalled();
});

/** When user input character up to maxlength */
test("When user input character up to maxlength", async () => {
	const item = shallow(
		<NameInputField
			name={name}
			placeholder={placeholder}
			defaultValue={defaultValue}
			onChange={handleChange}
			doNameInputFieldChange={mockDoNameInputFieldChange}
			minLength={1}
			maxLength={5}
		/>
	);
	item.instance().handleChange({ preventDefault: jest.fn(), target: { value: "mike waugh", name: name } });
	expect(mockDoNameInputFieldChange).toHaveBeenCalled();
});

/** When isValid function called to test value*/
test("When isValid function called to test value", async () => {
	const item = shallow(
		<NameInputField
			name={name}
			placeholder={placeholder}
			defaultValue={defaultValue}
			onChange={handleChange}
			doNameInputFieldChange={mockDoNameInputFieldChange}
		/>
	);
	item.instance().handleChange({ preventDefault: jest.fn(), target: { value: "mike waugh", name: name } });
	const status = item.instance().isValid();
	expect(status).toBe(true);
});
