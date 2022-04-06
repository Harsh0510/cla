// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { mount } from "enzyme";
import PasswordField from "../index";

let props;
let mockFunction;
let mockIsCapsLockActive;
//for reachCreateRef mock
let mockReactRef_isValid;

jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return {
			current: {
				isValid: function () {
					if (mockReactRef_isValid) {
						return true;
					}
					return false;
				},
			},
		};
	};
});

jest.mock("../../IsCapsLockActive", () => {
	return function (props) {
		return props.children(mockIsCapsLockActive);
	};
});

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	mockFunction = jest.fn();
	mockIsCapsLockActive = false;
	props = {
		name: "password",
		title: "password",
		value: "",
		isValid: true,
		placeHolder: "password",
		isRequired: true,
		maxLength: 250,
		onChange: mockFunction,
		onBlur: mockFunction,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(<PasswordField {...props} />);

	expect(item.find("FormInput").length).toBe(1);
});

/**when user input some value in password field */
test("when user input some value in password field", async () => {
	const item = mount(<PasswordField {...props} />);
	item.find("input").simulate("change");
	const spy = jest.spyOn(item.instance(), "onChange");
	item.instance().onChange({ target: { value: "teacher" } });
	expect(spy).toHaveBeenCalled();
});

/**When after input value user goto other control */
test("When after input value user goto other control", async () => {
	const item = mount(<PasswordField {...props} />);
	item.find("input").simulate("blur");
	const spy = jest.spyOn(item.instance(), "onBlur");
	item.instance().onBlur({ target: { value: "teacher" } });
	expect(spy).toHaveBeenCalled();
});

test("Check when field validation type is password", async () => {
	props.validationType = "input-string";
	props.validator = jest.fn();
	props.autoComplete = "new-password";
	const item = mount(<PasswordField {...props} />);
	item.find("input").simulate("change");
	item.instance().fieldIsValid({ target: "Passw" });
	expect(item.prop("validationType")).toBe("input-string");
});

test("User input some value in password field without props event", async () => {
	delete props.onChange;
	delete props.onBlur;
	delete props.placeHolder;
	const item = mount(<PasswordField {...props} />);

	item.find("input").simulate("change");
	const spyOnChange = jest.spyOn(item.instance(), "onChange");
	item.instance().onChange({ target: { value: "test" } });
	expect(spyOnChange).toHaveBeenCalled();

	item.find("input").simulate("blur");
	const spyOnBlur = jest.spyOn(item.instance(), "onBlur");
	item.instance().onBlur({ target: { value: "test" } });
	expect(spyOnBlur).toHaveBeenCalled();
});

/**Check when there is no value in password field  password is isRequired */
test("Check when there is no value in password field and password is isRequired", async () => {
	props.validationType = "input-string";
	props.isRequired = true;
	const item = mount(<PasswordField {...props} />);

	item.find("input").simulate("change");
	item.instance().fieldIsValid({ target: "" });
	item.instance().isValid();
	expect(item.prop("validationType")).toBe("input-string");
});

/**Check when there is no value in password field and password is isRequired */
test("Check when there is no value in password field and password is isRequired", async () => {
	props.validationType = "input-string";
	props.isRequired = false;
	const item = mount(<PasswordField {...props} />);

	item.find("input").simulate("change");
	item.instance().fieldIsValid({ target: "" });
	item.instance().isValid();
	expect(item.prop("validationType")).toBe("input-string");
});

/**User toggle on password view and hide icon */
test("User toggle on password view and hide icon", async () => {
	props.value = "mock";
	props.validationType = "input-string";
	const item = mount(<PasswordField {...props} />);
	item.instance().togglePassword();
	expect(item.state().type).toBe("text");
	expect(item.state().icon).toBe("fas fa-eye-slash");
	expect(item.state().title).toBe("Hide password");

	await wait(50);
	item.instance().togglePassword();
	expect(item.state().type).toBe("password");
	expect(item.state().icon).toBe("fas fa-eye");
	expect(item.state().title).toBe("View password");
});

/**User enter password in password field and show caps lock icon */
test("User enter password in password field and show caps lock icon for caps lock is off", async () => {
	props.validationType = "input-string";
	props.isCapsLockOn = true;
	const item = mount(<PasswordField {...props} />);
	expect(item.find("WrapCapsLockIcon").length).toBe(1);
	expect(item.find("WrapCapsLockIcon").props().title).toBe("Caps lock is off");
});

/**User enter password in password field and show caps lock icon */
test("User enter password in password field and show caps lock icon for caps lock is on", async () => {
	document.msCapsLockWarningOff = false;
	mockIsCapsLockActive = true;
	props.validationType = "input-string";
	props.isCapsLockOn = true;
	const item = mount(<PasswordField {...props} />);
	expect(item.find("WrapCapsLockIcon").length).toBe(1);
	expect(item.find("WrapCapsLockIcon").props().title).toBe("Caps lock is on");
});
