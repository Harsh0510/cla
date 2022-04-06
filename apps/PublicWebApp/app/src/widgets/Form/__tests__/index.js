/** Required to simulate window.matchMedia */
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import Form from "../index";
let props, mockFunction, mockIssues;

/**
 * Reset function
 */
function resetAll() {
	mockIssues = jest.fn(() => {
		return "Issues";
	});
	mockFunction = jest.fn();
	props = {
		fields: [{ name: "2" }, { name: "3" }],
		values: ["name 1", "name 2"],
		issues: {
			checkbox: "checkbox issue",
		},
		wrap: "Button",
		validators: {
			2: mockIssues,
		},
		disabled: false,
		onSubmit: mockFunction,
		onChange: mockFunction,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/** Component renders Correctly */
test(`Component renders Successfully`, async () => {
	const item = shallow(<Form {...props} />);
	expect(item.find("FormWrap").length).toBe(1);
});

/** Simulate Events */
test(`Simulate onChange Event`, async () => {
	const item = shallow(<Form {...props} />);
	const fields = item.find("Fields");
	fields.simulate("change", "name 3", 0);
	await wait(150);
	expect(item.state("values")).toEqual({ 0: "name 1", 1: "name 2", 2: "name 3" });
});

test(`Simulate onChange Event but validators not present`, async () => {
	delete props.validators;
	const item = shallow(<Form {...props} />);
	const fields = item.find("Fields");
	fields.simulate("change", "name 3", 0);
	await wait(150);
	expect(item.state("values")).toEqual({ 0: "name 1", 1: "name 2", 2: "name 3" });
});

test(`Unable to Simulate onChange Event`, async () => {
	delete props.validators;
	delete props.onChange;
	const item = shallow(<Form {...props} />);
	const fields = item.find("Fields");
	fields.simulate("change", "name 3", 0);
	await wait(150);
	expect(item.state("values")).toEqual({ 0: "name 1", 1: "name 2", 2: "name 3" });
});

test(`Simulate onChange Event when onChange prop set`, async () => {
	const item = shallow(<Form {...props} />);
	item.setProps({ onChange: mockFunction });
	const fields = item.find("Fields");
	fields.simulate("change", "name 3", 0);
	expect(mockIssues).toHaveBeenCalled();
});

test(`Simulate onSubmit Event`, async () => {
	const item = shallow(<Form {...props} />);
	const component = item.find("FormWrap");
	component.simulate("submit", {
		preventDefault: mockFunction,
	});

	await wait(150);
	expect(item.state("issues").length).not.toEqual(null);
});

test(`Simulate onSubmit Event by passing onSubmit prop`, async () => {
	const item = shallow(<Form {...props} />);
	item.setProps({ onSubmit: mockFunction });
	const component = item.find("FormWrap");
	component.simulate("submit", {
		preventDefault: mockFunction,
	});
	expect(mockFunction).toHaveBeenCalled();
});

test(`Simulate onSubmit Event without values`, async () => {
	delete props.validators;
	const item = shallow(<Form {...props} />);
	const component = item.find("FormWrap");
	component.simulate("submit");

	await wait(150);

	expect(item.state("issues").length).not.toEqual(null);
});

test(`Simulate onSubmit Event but it is disabled`, async () => {
	delete props.validators;
	props.disabled = true;
	const item = shallow(<Form {...props} />);
	const component = item.find("FormWrap");
	component.simulate("submit");

	await wait(150);

	expect(item.state("issues").length).not.toEqual(null);
});

test(`Unable to Simulate onSubmit`, async () => {
	delete props.validators;
	delete props.onSubmit;
	const item = shallow(<Form {...props} />);
	const component = item.find("FormWrap");
	component.simulate("submit");

	await wait(150);

	expect(item.state("issues").length).not.toEqual(null);
});
