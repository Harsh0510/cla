/** Required to simulate window.matchMedia */
import "../../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import CheckboxField from "../CheckboxField";

let props, mockFunction;

/**
 * Reset function
 */
function resetAll() {
	mockFunction = jest.fn();
	props = {
		content: "Tutorial View",
		value: true,
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
	const item = shallow(<CheckboxField {...props} />);
	expect(item.find("Label").length).toBe(1);
});

test(`Component renders Successfully when issue prop is set`, async () => {
	const item = shallow(<CheckboxField {...props} />);
	item.setProps({
		issue: {
			hasError: mockFunction,
		},
	});
	expect(item.find("Label").length).toBe(1);
});

/** Simulate methods */
test(`Simulate checkbox onChange method`, async () => {
	const item = shallow(<CheckboxField {...props} />);
	const input = item.find("Input");
	const selectedInput = "ref";
	item.instance()[selectedInput] = {
		current: {
			checked: true,
		},
	};
	input.simulate("change", {
		preventDefault: mockFunction,
	});
	expect(mockFunction).toHaveBeenCalled();
});

test(`Simulate checkbox onChange method when onchange prop is not set`, async () => {
	const item = shallow(<CheckboxField {...props} />);
	item.setProps({ onChange: null });
	const input = item.find("Input");
	const selectedInput = "ref";
	item.instance()[selectedInput] = {
		current: {
			checked: true,
		},
	};
	input.simulate("change", {
		preventDefault: mockFunction,
	});
	expect(mockFunction).toHaveBeenCalled();
});

test(`Component render correctly when indetermnate props is passed`, async () => {
	props.indeterminate = true;
	const item = shallow(<CheckboxField {...props} />);
	item.instance().onChange({ preventDefault() {} });
	await wait(50);
	expect(item.find("FontAwesomeIcon").length).toBe(1);
});

test(`Component render correctly when value props is passed as false`, async () => {
	props.value = false;
	const item = shallow(<CheckboxField {...props} />);
	expect(item.find("FontAwesomeIcon").length).toBe(0);
});

test(`Test of updateIndeterminate method when value of indetermnate is changed`, async () => {
	props.indeterminate = true;
	const item = shallow(<CheckboxField {...props} />);
	item.instance().updateIndeterminate = jest.fn();
	item.setProps({ indeterminate: false });
	await wait(50);
	expect(item.instance().updateIndeterminate).toHaveBeenCalled();
});

test(`Test updateIndeterminate method`, async () => {
	props.indeterminate = false;
	const item = shallow(<CheckboxField {...props} />);
	item.instance().ref = {
		current: { indeterminate: true },
	};
	item.instance().updateIndeterminate();
	expect(item.instance().ref.current.indeterminate).toEqual(false);
});
