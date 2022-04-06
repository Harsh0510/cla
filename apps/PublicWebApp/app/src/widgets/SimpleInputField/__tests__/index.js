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
	const item = mount(<NameInputField name={name} placeholder={placeholder} defaultValue={defaultValue} onChange={handleChange} error={true} />);

	await wait(50);
	expect(item.find("Input").length).toBe(1);
	expect(item.find("Error").length).toBe(1);
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

	const inputItem = item.find("[name='first_name']");
	inputItem.simulate("change", { target: { value: "test" } });
	expect(handleChange).toHaveBeenCalled();
});
