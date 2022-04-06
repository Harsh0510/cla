// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import PasswordPage from "../index";
import messageType from "../../../common/messageType";
import errorType from "../../../common/errorType";
import MessageType from "../../../common/messageType";
import MessageBox from "../../MessageBox";

let props, mockFunction, password, password_confirm, terms_accepted;
//for reachCreateRef mock
let mockReactRef_isValid;

const MESSAGES = {
	confirmPasswordNotMatch: "You have not entered a matching password, please try again.",
	passwordValidationMessage:
		"Your password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one punctuation symbol.",
	passwordLengthMessage: "Your password must be between 8 to 16 characters.",
	acceptTermsConditions: "Please accept the terms & conditions.",
};

const ERROR_MESSAGE = "Please ensure all fields are filled correctly.";

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

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	mockFunction = jest.fn();
	props = {
		hide: false,
		title: "Test Password",
		message: "",
		handleSubmit: mockFunction,
		loading: false,
		messageType: "",
		isTCRequired: true,
	};
	password = "Test@123";
	password_confirm = "Test@123";
	terms_accepted = true;
	mockReactRef_isValid = true;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<PasswordPage {...props} />);
	expect(item.find("PageForm").length).toBe(1);
});

/** User unable to show the Input form */
test("User unable to show the Input form", async () => {
	props.hide = true;
	props.title = "";
	props.message = null;
	const item = shallow(<PasswordPage {...props} />);
	expect(item.find("PageForm").length).toBe(0);
});

test("User click on submit for new/reset password", async () => {
	const mockHandleSubmit = jest.fn();
	props.handleSubmit = mockHandleSubmit;
	const item = shallow(<PasswordPage {...props} />);
	const fields = { fields: { password: password, password_confirm: password, terms_accepted: terms_accepted } };

	item.setState({ fields: fields });
	await wait(100);

	const submitButton = item.find('[name="btnSubmit"]');
	submitButton.simulate("click", { preventDefault: jest.fn() });
	expect(item.state().message).toEqual(null);
	expect(item.state().messageType).toEqual("");
	expect(mockHandleSubmit).toBeCalled();
});

test("User click on submit for new/reset password without any values", async () => {
	mockReactRef_isValid = false;
	const mockHandleSubmit = jest.fn();
	props.handleSubmit = mockHandleSubmit;
	const item = shallow(<PasswordPage {...props} />);
	const fields = { fields: { password: "", password_confirm: "", terms_accepted: false } };
	item.setState({ fields: fields });
	const submitButton = item.find('[name="btnSubmit"]');
	submitButton.simulate("click", { preventDefault: jest.fn() });
	expect(item.state().message).toEqual(null);
	expect(item.state().messageType).toEqual("");
	expect(mockHandleSubmit).not.toBeCalled();
});

test(`User getting the message 'You have not entered a matching password, please try again.'`, async () => {
	const item = shallow(<PasswordPage {...props} />);
	item.setState({
		fields: {
			password: password,
			password_confirm: "123",
			terms_accepted: terms_accepted,
		},
	});
	item.update();
	const cnfrmPwd = item.find('[name="password_confirm"]');
	cnfrmPwd.simulate("blur", "password_confirm", "123", { isValid: true, message: "" });

	expect(item.state().valid.password_confirm).toEqual({
		errorType: errorType.confirmPasswordNotMatch,
		isValid: false,
		message: "You have not entered a matching password, please try again.",
		messageType: "error",
	});
});

test("User changed password value", async () => {
	const item = shallow(<PasswordPage {...props} />);
	item.setState({
		fields: {
			password: password,
			password_confirm: password_confirm,
			terms_accepted: terms_accepted,
		},
	});
	const cnfrmPwd = item.find('[name="password_confirm"]');
	cnfrmPwd.simulate("blur", "password_confirm", password_confirm, { isValid: true, message: "" });
	expect(item.state().valid.password_confirm).toEqual({
		errorType: "",
		isValid: true,
		message: "",
		messageType: "",
	});
});

test("User enter valid password", async () => {
	const item = shallow(<PasswordPage {...props} />);
	const pwd = item.find('[name="password"]');
	pwd.simulate("change", "password", password, { isValid: true, message: "" });
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().fields.password).toEqual(password);
	expect(item.state().valid.password).toEqual({ isValid: true, message: "" });
	expect(item.containsMatchingElement(<MessageBox />)).toBe(false);
});

test("User enter invalid password", async () => {
	const item = shallow(<PasswordPage {...props} />);
	const pwd = item.find('[name="password"]');
	pwd.simulate("change", "password", "test", { isValid: false, message: "Special characters are not allowed", errorType: "validation" });

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().fields.password).toEqual("test");
	expect(item.state().valid.password).toEqual({ isValid: false, message: "Special characters are not allowed", errorType: "validation" });
	expect(item.containsMatchingElement(<MessageBox />)).toBe(true);
	expect(item.find("MessageBox").props().message).toBe("Please ensure all fields are filled correctly.");
	const btnSubmit = item.find('[name="btnSubmit"]');
	expect(btnSubmit.props().disabled).toEqual(true);
});

test("Password Field Validation", async () => {
	const item = shallow(<PasswordPage {...props} />);
	const pwd = item.find('[name="password"]');
	pwd.simulate("change", "password", "Test", {
		isValid: false,
		message: "Password must be at least 8 characters.",
		errorType: "PASSWORD_8_CHARACTER",
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().fields.password).toEqual("Test");
	expect(item.state().valid.password).toEqual({
		isValid: false,
		message: "Password must be at least 8 characters.",
		errorType: "PASSWORD_8_CHARACTER",
	});
	expect(item.containsMatchingElement(<MessageBox />)).toBe(true);
	expect(item.find("MessageBox").props().message).toBe("Password must be at least 8 characters.");
	const btnSubmit = item.find('[name="btnSubmit"]');
	expect(btnSubmit.props().disabled).toEqual(true);

	pwd.simulate("change", "password", "TEST1234", {
		isValid: false,
		message: "Password must contain at least one lowercase letter.",
		errorType: "PASSWORD_LOWER_CHARACTER",
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().fields.password).toEqual("TEST1234");
	expect(item.state().valid.password).toEqual({
		isValid: false,
		message: "Password must contain at least one lowercase letter.",
		errorType: "PASSWORD_LOWER_CHARACTER",
	});
	expect(item.containsMatchingElement(<MessageBox />)).toBe(true);
	expect(item.find("MessageBox").props().message).toBe("Password must contain at least one lowercase letter.");
	const btnSubmit2 = item.find('[name="btnSubmit"]');
	expect(btnSubmit2.props().disabled).toEqual(true);

	pwd.simulate("change", "password", "test1234", {
		isValid: false,
		message: "Password must contain at least one uppercase letter.",
		errorType: "PASSWORD_UPPER_CHARACTER",
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().fields.password).toEqual("test1234");
	expect(item.state().valid.password).toEqual({
		isValid: false,
		message: "Password must contain at least one uppercase letter.",
		errorType: "PASSWORD_UPPER_CHARACTER",
	});
	expect(item.containsMatchingElement(<MessageBox />)).toBe(true);
	expect(item.find("MessageBox").props().message).toBe("Password must contain at least one uppercase letter.");
	const btnSubmit3 = item.find('[name="btnSubmit"]');
	expect(btnSubmit3.props().disabled).toEqual(true);

	pwd.simulate("change", "password", "Test1234", {
		isValid: false,
		message: "Password must contain at least one special character.",
		errorType: "PASSWORD_SPECIAL_CHARACTER",
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().fields.password).toEqual("Test1234");
	expect(item.state().valid.password).toEqual({
		isValid: false,
		message: "Password must contain at least one special character.",
		errorType: "PASSWORD_SPECIAL_CHARACTER",
	});
	expect(item.containsMatchingElement(<MessageBox />)).toBe(true);
	expect(item.find("MessageBox").props().message).toBe("Password must contain at least one special character.");
	const btnSubmit4 = item.find('[name="btnSubmit"]');
	expect(btnSubmit4.props().disabled).toEqual(true);

	pwd.simulate("change", "password", "", { isValid: false, message: "Password not provided", errorType: "PASSWORD_NOT_PROVIDED" });

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().fields.password).toEqual("");
	expect(item.state().valid.password).toEqual({ isValid: false, message: "Password not provided", errorType: "PASSWORD_NOT_PROVIDED" });
	expect(item.containsMatchingElement(<MessageBox />)).toBe(true);
	expect(item.find("MessageBox").props().message).toBe("Password not provided");
	const btnSubmit5 = item.find('[name="btnSubmit"]');
	expect(btnSubmit5.props().disabled).toEqual(true);

	pwd.simulate("change", "password", "", {
		isValid: false,
		message: "Password must contain at least one number.",
		errorType: "PASSWORD_NUMBER_CHARACTER",
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().fields.password).toEqual("");
	expect(item.state().valid.password).toEqual({
		isValid: false,
		message: "Password must contain at least one number.",
		errorType: "PASSWORD_NUMBER_CHARACTER",
	});
	expect(item.containsMatchingElement(<MessageBox />)).toBe(true);
	expect(item.find("MessageBox").props().message).toBe("Password must contain at least one number.");
	const btnSubmit6 = item.find('[name="btnSubmit"]');
	expect(btnSubmit6.props().disabled).toEqual(true);
});

test("Confirm password Field Validation", async () => {
	const item = shallow(<PasswordPage {...props} />);
	const pwd = item.find('[name="password_confirm"]');
	pwd.simulate("change", "password_confirm", "Test", {
		isValid: false,
		message: "Password must be at least 8 characters.",
		errorType: "PASSWORD_8_CHARACTER",
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().fields.password_confirm).toEqual("Test");
	expect(item.state().valid.password_confirm).toEqual({
		isValid: false,
		message: "Password must be at least 8 characters.",
		errorType: "PASSWORD_8_CHARACTER",
	});
	expect(item.containsMatchingElement(<MessageBox />)).toBe(true);
	expect(item.find("MessageBox").props().message).toBe("Password must be at least 8 characters.");
	const btnSubmit = item.find('[name="btnSubmit"]');
	expect(btnSubmit.props().disabled).toEqual(true);

	pwd.simulate("change", "password_confirm", "TEST1234", {
		isValid: false,
		message: "Password must contain at least one lowercase letter.",
		errorType: "PASSWORD_LOWER_CHARACTER",
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().fields.password_confirm).toEqual("TEST1234");
	expect(item.state().valid.password_confirm).toEqual({
		isValid: false,
		message: "Password must contain at least one lowercase letter.",
		errorType: "PASSWORD_LOWER_CHARACTER",
	});
	expect(item.containsMatchingElement(<MessageBox />)).toBe(true);
	expect(item.find("MessageBox").props().message).toBe("Password must contain at least one lowercase letter.");
	const btnSubmit2 = item.find('[name="btnSubmit"]');
	expect(btnSubmit2.props().disabled).toEqual(true);

	pwd.simulate("change", "password_confirm", "test1234", {
		isValid: false,
		message: "Password must contain at least one uppercase letter.",
		errorType: "PASSWORD_UPPER_CHARACTER",
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().fields.password_confirm).toEqual("test1234");
	expect(item.state().valid.password_confirm).toEqual({
		isValid: false,
		message: "Password must contain at least one uppercase letter.",
		errorType: "PASSWORD_UPPER_CHARACTER",
	});
	expect(item.containsMatchingElement(<MessageBox />)).toBe(true);
	expect(item.find("MessageBox").props().message).toBe("Password must contain at least one uppercase letter.");
	const btnSubmit3 = item.find('[name="btnSubmit"]');
	expect(btnSubmit3.props().disabled).toEqual(true);

	pwd.simulate("change", "password_confirm", "Test1234", {
		isValid: false,
		message: "Password must contain at least one special character.",
		errorType: "PASSWORD_SPECIAL_CHARACTER",
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().fields.password_confirm).toEqual("Test1234");
	expect(item.state().valid.password_confirm).toEqual({
		isValid: false,
		message: "Password must contain at least one special character.",
		errorType: "PASSWORD_SPECIAL_CHARACTER",
	});
	expect(item.containsMatchingElement(<MessageBox />)).toBe(true);
	expect(item.find("MessageBox").props().message).toBe("Password must contain at least one special character.");
	const btnSubmit4 = item.find('[name="btnSubmit"]');
	expect(btnSubmit4.props().disabled).toEqual(true);

	pwd.simulate("change", "password_confirm", "", { isValid: false, message: "Password not provided", errorType: "PASSWORD_NOT_PROVIDED" });

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().fields.password_confirm).toEqual("");
	expect(item.state().valid.password_confirm).toEqual({ isValid: false, message: "Password not provided", errorType: "PASSWORD_NOT_PROVIDED" });
	expect(item.containsMatchingElement(<MessageBox />)).toBe(true);
	expect(item.find("MessageBox").props().message).toBe("Password not provided");
	const btnSubmit5 = item.find('[name="btnSubmit"]');
	expect(btnSubmit5.props().disabled).toEqual(true);

	pwd.simulate("change", "password_confirm", "", {
		isValid: false,
		message: "Password must contain at least one number.",
		errorType: "PASSWORD_NUMBER_CHARACTER",
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().fields.password_confirm).toEqual("");
	expect(item.state().valid.password_confirm).toEqual({
		isValid: false,
		message: "Password must contain at least one number.",
		errorType: "PASSWORD_NUMBER_CHARACTER",
	});
	expect(item.containsMatchingElement(<MessageBox />)).toBe(true);
	expect(item.find("MessageBox").props().message).toBe("Password must contain at least one number.");
	const btnSubmit6 = item.find('[name="btnSubmit"]');
	expect(btnSubmit6.props().disabled).toEqual(true);
});

test("User enter invalid password length", async () => {
	const item = shallow(<PasswordPage {...props} />);
	const pwd = item.find('[name="password"]');
	const inValidPassword = "Test@12345678910123456789";
	const mockValid = { isValid: false, message: "please ensure this value must be between 8 to 16", errorType: "length" };
	pwd.simulate("change", "password", inValidPassword, mockValid);
	expect(item.state().fields.password).toEqual(inValidPassword);
	expect(item.state().valid.password).toEqual(mockValid);
	expect(item.containsMatchingElement(<MessageBox />)).toBe(true);
	const btnSubmit = item.find('[name="btnSubmit"]');
	expect(btnSubmit.props().disabled).toEqual(true);
});

test("User enter invalid password", async () => {
	const item = shallow(<PasswordPage {...props} />);
	const pwd = item.find('[name="password"]');
	const inValidPassword = "Test@12345678910123456789";
	const mockValid = { isValid: false, message: "please ensure this value must be between 8 to 16", errorType: "length_test" };
	pwd.simulate("change", "password", inValidPassword, mockValid);
	expect(item.state().fields.password).toEqual(inValidPassword);
	expect(item.state().valid.password).toEqual(mockValid);
	expect(item.containsMatchingElement(<MessageBox />)).toBe(true);
	const btnSubmit = item.find('[name="btnSubmit"]');
	expect(btnSubmit.props().disabled).toEqual(true);
});

test("User enter valid password_confirm", async () => {
	const item = shallow(<PasswordPage {...props} />);
	const pwd = item.find('[name="password_confirm"]');
	pwd.simulate("change", "password_confirm", password_confirm, { isValid: true, message: "" });
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().fields.password_confirm).toEqual(password_confirm);
	expect(item.state().valid.password_confirm).toEqual({ isValid: true, message: "" });
	expect(item.containsMatchingElement(<MessageBox />)).toBe(false);
});

test("User enter invalid password_confirm", async () => {
	const item = shallow(<PasswordPage {...props} />);
	const pwd = item.find('[name="password_confirm"]');
	pwd.simulate("change", "password_confirm", "test", { isValid: false, message: "Special characters are not allowed", errorType: "validation" });

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().fields.password_confirm).toEqual("test");
	expect(item.state().valid.password_confirm).toEqual({ isValid: false, message: "Special characters are not allowed", errorType: "validation" });
	expect(item.containsMatchingElement(<MessageBox />)).toBe(true);

	const btnSubmit = item.find('[name="btnSubmit"]');
	expect(btnSubmit.props().disabled).toEqual(true);
});

test(`show error message`, () => {
	const newProps = { ...props, message: "some error message" };
	const item = shallow(<PasswordPage {...newProps} />);
	expect(item.find("MessageBox").length).toBe(1);
});

test(`when checkbox is toggled`, async () => {
	const item = shallow(<PasswordPage {...props} />);
	item.setState({
		message: "test test",
	});
	item.find("CheckBoxField").simulate("change");
	await wait(200);
	expect(item.state().message).toBe(null);
});
