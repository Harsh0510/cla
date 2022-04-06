// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import Header from "../../../widgets/Header";
import TextField from "../../../widgets/TextField";
import ForgotPasswordPage from "../index";

let validEmail, invalidEmail, error_message, mockReactRef_isValid;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
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

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

jest.mock("../../../common/customSetTimeout", () => {
	return function (method, time) {
		return setTimeout(method, 100);
	};
});

async function defaultApi(endpoint, data) {
	if (endpoint === "/auth/user-init-password-reset") {
		return {
			result: true,
		};
	}
	throw new Error("should never be here");
}

function resetAll() {
	validEmail = "email@email.com";
	invalidEmail = "email123";
	error_message = "Please enter a valid email address.";
	mockReactRef_isValid = true;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<ForgotPasswordPage api={defaultApi} />);
	expect(item.containsMatchingElement(<Header />)).toBe(true);
	expect(item.containsMatchingElement(<TextField />)).toBe(true);
});

/** User enter valid email  */
test("User enter the email", async () => {
	const item = shallow(<ForgotPasswordPage api={defaultApi} />);
	item.instance().handleChange("email", validEmail, { isValid: true, message: "", errorType: "" });
	expect(item.state().fields.email).toEqual(validEmail);
	expect(item.state().valid.email.isValid).toEqual(true);
});

/** User enter invalid email */
test("User enter invalid email ", async () => {
	const item = shallow(<ForgotPasswordPage api={defaultApi} />);
	item.instance().handleChange("email", invalidEmail, { isValid: false, message: error_message, errorType: "validation" });
	expect(item.state().fields.email).toEqual(invalidEmail);
	expect(item.state().valid.email.isValid).toEqual(false);
	expect(item.state().valid.email.message).toEqual(error_message);
});

/** User enter invalid email and click on submit button*/
test("User enter invalid email and click on submit button", async () => {
	const item = shallow(<ForgotPasswordPage api={defaultApi} />);
	item.instance().handleChange("email", invalidEmail, { isValid: false, message: error_message, errorType: "validation" });
	expect(item.state().fields.email).toEqual(invalidEmail);
	expect(item.state().valid.email.isValid).toEqual(false);
	expect(item.state().valid.email.message).toEqual(error_message);
	await wait(50);
	const form = item.find("ForgotForm");
	mockReactRef_isValid = false;
	form.simulate("submit", { preventDefault: jest.fn() });
	await wait(50);
	expect(item.state().hide).toBe(false);
	const MessageBox = item.find("MessageBox");
});

/** User enter valid email address and click on submit*/
test("User enter valid email address and click on submit", async () => {
	const item = shallow(<ForgotPasswordPage api={defaultApi} />);
	item.instance().handleChange("email", validEmail, { isValid: true, message: "", errorType: "" });
	expect(item.state().fields.email).toEqual(validEmail);
	const form = item.find("ForgotForm");
	form.simulate("submit", { preventDefault: jest.fn() });
	await wait(50);
	expect(item.state().hide).toBe(true);
	expect(item.state().valid.email.isValid).toBe(true);
	expect(item.state().fields.email).toEqual("");
	expect(item.find("FormTitle").children().find("h1").text().trim()).toEqual(`Your password reset email has been sent`);
});

/** User enter valid address and get exception in result */
test(`User enter valid address and get exception in result`, async () => {
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-init-password-reset") {
			return {
				result: false,
			};
		}
		throw new Error("should never be here");
	}
	const item = shallow(<ForgotPasswordPage api={api} />);
	item.instance().handleChange("email", validEmail, { isValid: true, message: "", errorType: "" });
	const form = item.find("ForgotForm");
	form.simulate("submit", { preventDefault: jest.fn() });
	await wait(50);
	expect(item.state().hide).toBe(true);
	expect(item.state().valid.email.isValid).toBe(true);
	expect(item.find("FormTitle").children().find("h1").text().trim()).toEqual(`Your password reset email has been sent`);
});

/** User enter valid address and get exception in result */
test(`User enter valid address and get exception in result`, async () => {
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-init-password-reset") {
			return {
				result: false,
			};
		}
		throw new Error("should never be here");
	}
	const item = shallow(<ForgotPasswordPage api={api} />);
	item.instance().handleChange("email", validEmail, { isValid: true, message: "", errorType: "" });
	const form = item.find("ForgotForm");
	form.simulate("submit", { preventDefault: jest.fn() });
	await wait(50);
	expect(item.state().hide).toBe(true);
	expect(item.state().valid.email.isValid).toBe(true);
	expect(item.find("FormTitle").children().find("h1").text().trim()).toEqual(`Your password reset email has been sent`);
});

/** User enter valid email address and click on submit and after that change the Email address*/
test("User enter valid email address and click on submit", async () => {
	const item = shallow(<ForgotPasswordPage api={defaultApi} />);
	item.instance().handleChange("email", validEmail, { isValid: true, message: "", errorType: "" });
	expect(item.state().fields.email).toEqual(validEmail);
	const form = item.find("ForgotForm");
	form.simulate("submit", { preventDefault: jest.fn() });
	await wait(50);
	expect(item.state().hide).toBe(true);
	expect(item.state().valid.email.isValid).toBe(true);
	expect(item.state().fields.email).toEqual("");
	expect(item.find("FormTitle").children().find("h1").text().trim()).toEqual(`Your password reset email has been sent`);

	item.instance().handleChange("email", "test@email.com", { isValid: true, message: "", errorType: "" });
	expect(item.state().hide).toBe(false);
	expect(item.state().valid.email.isValid).toBe(true);
	expect(item.state().fields.email).toEqual("test@email.com");
});

test(`when component unmounts when timeout true`, () => {
	const item = shallow(<ForgotPasswordPage api={defaultApi} />);
	item.instance()._timeout = true;
	item.unmount();
	expect(item.instance()).toBe(null);
});

test(`when component unmounts`, () => {
	const item = shallow(<ForgotPasswordPage api={defaultApi} />);
	item.instance().setStateTimeOut();
	item.unmount();
	expect(item.instance()).toBe(null);
});

test(`User email account is locked for 5 min and enter valid address`, async () => {
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-init-password-reset") {
			return {
				result: false,
				message: "Email account temporarily locked",
			};
		}
		throw new Error("should never be here");
	}
	const item = shallow(<ForgotPasswordPage api={api} />);
	item.instance().handleChange("email", validEmail, { isValid: true, message: "", errorType: "" });
	const form = item.find("ForgotForm");
	form.simulate("submit", { preventDefault: jest.fn() });
	await wait(50);
	expect(item.state().hide).toBe(true);
	expect(item.state().valid.email.isValid).toBe(true);
	expect(item.find("FormTitle").children().find("h1").text().trim()).toEqual(`Email account temporarily locked`);
});
