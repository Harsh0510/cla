// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import RegisterPage from "../index";
import Header from "../../../widgets/Header";
import MockSchool from "../../../mocks/MockSchool";
import errorType from "../../../common/errorType";

let select_school, is_mapped, valid, mockReactRef_isValid, mockErrorMessage, mockErr, mockErrorTypeValue, mockApprovedDomain, mockErrorType;

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

jest.mock("../../../common/googleEvent", () => {
	return jest.fn();
});

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

async function defaultApi(endpoint, data) {
	// "RegisterPage" only queries this endpoint
	if (endpoint === "/auth/get-schools") {
		return MockSchool;
	}

	if (endpoint === "/auth/get-is-domain-mapped-with-school") {
		return { result: true };
	}

	if (endpoint === "/auth/register") {
		return {
			result: true,
			auto_registered: mockApprovedDomain,
		};
	}

	// This will be caught by the promise in the component
	throw new Error("should never be here");
}

/**
 * To be called before and after each test. Useful for resetting globally scoped variables
 */
function resetAll() {
	// add reset scripts
	select_school = {
		label: "Test 1 School",
		value: 1,
	};
	valid = {
		errorType: "",
		isValid: true,
		message: "",
	};

	mockReactRef_isValid = true;
	mockErrorMessage = "";
	mockErrorTypeValue = null;
	mockErrorType = {
		validation: "validation",
		length: "length",
		required: "required",
	};
	mockApprovedDomain: false;
	is_mapped: true;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<RegisterPage api={defaultApi} />);

	await wait(50);
	item.update();
	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

test("Check What will I receive link text", async () => {
	const item = shallow(<RegisterPage api={defaultApi} />);
	item.setState({ showInformationText: true });
	await wait(50);
	item.update();
	expect(item.find("InformationText").length).toBe(2);
	item.instance().showInformationText({ preventDefault: jest.fn() });
	await wait(50);
	item.update();
	expect(item.find("InformationText").length).toBe(1);
});

/** User enter valid and invalid email address */
test("User enter valid and invalid email address", async () => {
	const item = shallow(<RegisterPage api={defaultApi} />);

	const spy = jest.spyOn(item.instance(), "bindSchoolData");
	item.instance().handleInputChange("email", "test@email.com", {
		isValid: true,
		message: "",
	});
	item.instance().handleDrpChange("school", { label: "Test School", value: "1" }, { isValid: true, message: "" });
	await wait(100);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().fields.email).toBe("test@email.com");
	expect(item.state().fields.school).toEqual({
		label: "Test School",
		value: "1",
	});

	item.instance().handleInputChange("email", "test@email.com", {
		isValid: true,
		message: "",
	});
	await wait(1050);
	item.update();
	item.instance().forceUpdate();

	expect(spy).toHaveBeenCalled();
	expect(item.state().fields.school).toEqual({
		label: "Test School",
		value: "1",
	});
	expect(item.state().valid.school.isValid).toEqual(true);
});

/** User search school in school drop down */
it("User search school in school drop down", async () => {
	const item = shallow(<RegisterPage api={defaultApi} />);
	item.instance().handleDrpChange("school", select_school, valid);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().fields.school).toEqual(select_school);
});

/** User enter valid details and clicks on submit button for create new user */
it("User enter valid details and clicks on submit button for create new user", async () => {
	const mockHandleSubmit = jest.fn();
	const item = shallow(<RegisterPage api={defaultApi} />);

	const school = item.find('[name="school"]');
	const last_name = item.find('[name="last_name"]');
	const first_name = item.find('[name="first_name"]');
	const email = item.find('[name="email"]');
	const title = item.find('[name="title"]');
	const job_title = item.find('[name="job_title"]');
	const btnRegister = item.find('[name="btnRegister"]');

	email.simulate("change", "email", "william@email.com", {
		isValid: true,
		message: "",
	});
	await wait(1050);
	item.update();
	item.instance().forceUpdate();

	school.simulate("change", "school", select_school, {
		isValid: true,
		message: "",
	});
	await wait(1050);
	item.update();
	item.instance().forceUpdate();

	first_name.simulate("change", "first_name", "William", {
		isValid: true,
		message: "",
	});

	last_name.simulate("change", "last_name", "Powers", {
		isValid: true,
		message: "",
	});

	title.simulate("change", "title", "Mr", { isValid: true, message: "" });

	job_title.simulate("change", "job_title", "job title", {
		isValid: true,
		message: "",
	});

	await wait(50);
	btnRegister.simulate("click", {
		preventDefault: mockHandleSubmit,
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(mockHandleSubmit).toHaveBeenCalled();
	expect(item.state().message).toBe(`Successfully registered.`);
	expect(item.state().auto_registered).toBe(mockApprovedDomain);
});

/** User getting message */
it("User getting message", async () => {
	async function api(endpoint, data) {
		// "RegisterPage" only queries this endpoint
		if (endpoint === "/auth/get-schools") {
			return { result: [MockSchool.result[0]] };
		}
		if (endpoint === "/auth/get-is-domain-mapped-with-school") {
			return { result: false };
		}
		if (endpoint === "/auth/register") {
			throw new Error("A user with that email already exists");
		}
		defaultApi(endpoint, data);
	}

	const mockHandleSubmit = jest.fn();
	const item = shallow(<RegisterPage api={api} />);

	const school = item.find('[name="school"]');
	const last_name = item.find('[name="last_name"]');
	const first_name = item.find('[name="first_name"]');
	const email = item.find('[name="email"]');
	const title = item.find('[name="title"]');
	const job_title = item.find('[name="job_title"]');
	const btnRegister = item.find('[name="btnRegister"]');

	email.simulate("change", "email", "william@email.com", {
		isValid: true,
		message: "",
	});
	await wait(1050);
	item.update();
	item.instance().forceUpdate();

	school.simulate("change", "school", select_school, {
		isValid: true,
		message: "",
	});
	await wait(1050);
	item.update();
	item.instance().forceUpdate();

	first_name.simulate("change", "first_name", "William", {
		isValid: true,
		message: "",
	});

	last_name.simulate("change", "last_name", "Powers", {
		isValid: true,
		message: "",
	});

	title.simulate("change", "title", "Mr", { isValid: true, message: "" });

	job_title.simulate("change", "job_title", "job title", {
		isValid: true,
		message: "",
	});

	await wait(50);
	btnRegister.simulate("click", {
		preventDefault: mockHandleSubmit,
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(mockHandleSubmit).toHaveBeenCalled();
	const message = shallow(item.state().message);
	expect(message.find("Fragment").length).toEqual(1);
});

/** User enter some invalid details and clicks on submit button for create new user */
it("User enter some invalid and clicks on submit button for create new user", async () => {
	mockReactRef_isValid = false;
	const mockHandleSubmit = jest.fn();
	const item = shallow(<RegisterPage api={defaultApi} />);

	const school = item.find('[name="school"]');
	const last_name = item.find('[name="last_name"]');
	const first_name = item.find('[name="first_name"]');
	const email = item.find('[name="email"]');
	const title = item.find('[name="title"]');
	const job_title = item.find('[name="job_title"]');
	const btnRegister = item.find('[name="btnRegister"]');
	const terms_accepted = item.find('[name="terms_accepted"]');

	email.simulate("change", "email", "william@email.com", {
		isValid: true,
		message: "",
	});
	await wait(1050);
	item.update();
	item.instance().forceUpdate();

	school.simulate("change", "school", select_school, {
		isValid: true,
		message: "",
	});

	first_name.simulate("change", "first_name", "William@", {
		isValid: false,
		errorType: errorType.validation,
		message: "Special characters are not allowed",
	});

	last_name.simulate("change", "last_name", "Powers", {
		isValid: true,
		message: "",
	});

	title.simulate("change", "title", "Mr", { isValid: true, message: "" });

	job_title.simulate("change", "job_title", "job title", {
		isValid: true,
		message: "",
	});

	terms_accepted.simulate("change", "terms_accepted", true, {
		isValid: true,
		message: "",
	});

	// await wait(50);
	// item.update();
	// item.instance().forceUpdate();
	btnRegister.simulate("click", {
		preventDefault: mockHandleSubmit,
	});

	await wait(100);
	item.update();
	item.instance().forceUpdate();
	expect(mockHandleSubmit).toHaveBeenCalled();
	expect(item.state().message).toBeNull();
});

/** User filled form get message if any field value invalid*/
it("User filled form get message if any field value invalid", async () => {
	const item = shallow(<RegisterPage api={defaultApi} />);

	item.setState({
		valid: {
			email: { isValid: false, message: "" },
			school: { isValid: false, message: "" },
			title: { isValid: false, message: "" },
			first_name: { isValid: false, message: "" },
			last_name: { isValid: false, message: "" },
			job_title: { isValid: false, message: "" },
			terms_accepted: { isValid: false, message: "" },
			receive_marketing_emails: { isValid: false, message: "" },
			password: { isValid: true, message: "" },
			password_confirm: { isValid: true, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result.status).toBe(false);
	expect(result.message).toBe(`Please ensure all fields are filled correctly.`);
	expect(item.find("MessageBox").length).toBe(1);
});

it("User Password Validation get message if any field value invalid", async () => {
	const item = shallow(<RegisterPage api={defaultApi} />);
	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: { isValid: true, message: "" },
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: true, message: "" },
			password: { isValid: false, message: "Password not provided", errorType: "PASSWORD_NOT_PROVIDED" },
			password_confirm: { isValid: true, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result.status).toBe(false);
	expect(result.message).toBe(`Please ensure all fields are filled correctly.`);
	expect(item.state().valid["password"].message).toBe("Password not provided");
	expect(item.find("MessageBox").length).toBe(1);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: { isValid: true, message: "" },
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: true, message: "" },
			password: { isValid: false, message: "", errorType: "PASSWORD_8_CHARACTER" },
			password_confirm: { isValid: false, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result2 = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result2.status).toBe(false);
	expect(result2.message).toBe(`Please ensure all fields are filled correctly.`);
	expect(item.state().valid["password"].message).toBe("Password must be at least 8 characters.");
	expect(item.find("MessageBox").length).toBe(1);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: { isValid: true, message: "" },
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: true, message: "" },
			password: { isValid: false, message: "", errorType: "PASSWORD_LOWER_CHARACTER" },
			password_confirm: { isValid: false, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result3 = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result3.status).toBe(false);
	expect(result3.message).toBe(`Please ensure all fields are filled correctly.`);
	expect(item.state().valid["password"].message).toBe("Password must contain at least one lowercase letter.");
	expect(item.find("MessageBox").length).toBe(1);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: { isValid: true, message: "" },
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: true, message: "" },
			password: { isValid: false, message: "", errorType: "PASSWORD_UPPER_CHARACTER" },
			password_confirm: { isValid: false, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result4 = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result4.status).toBe(false);
	expect(result4.message).toBe(`Please ensure all fields are filled correctly.`);
	expect(item.state().valid["password"].message).toBe("Password must contain at least one uppercase letter.");
	expect(item.find("MessageBox").length).toBe(1);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: { isValid: true, message: "" },
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: true, message: "" },
			password: { isValid: false, message: "", errorType: "PASSWORD_SPECIAL_CHARACTER" },
			password_confirm: { isValid: false, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result5 = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result5.status).toBe(false);
	expect(result5.message).toBe(`Please ensure all fields are filled correctly.`);
	expect(item.state().valid["password"].message).toBe("Password must contain at least one special character.");
	expect(item.find("MessageBox").length).toBe(1);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: { isValid: true, message: "" },
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: true, message: "" },
			password: { isValid: false, message: "", errorType: "PASSWORD_NUMBER_CHARACTER" },
			password_confirm: { isValid: false, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result6 = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result6.status).toBe(false);
	expect(result6.message).toBe(`Please ensure all fields are filled correctly.`);
	expect(item.state().valid["password"].message).toBe(`Password must contain at least one number.`);
	expect(item.find("MessageBox").length).toBe(1);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: { isValid: true, message: "" },
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: true, message: "" },
			password: { isValid: false, message: "", errorType: "" },
			password_confirm: { isValid: false, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result7 = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result7.status).toBe(false);
	expect(result7.message).toBe(`Please ensure all fields are filled correctly.`);
	expect(item.state().valid["password"].message).toBe(`Password not provided`);
	expect(item.find("MessageBox").length).toBe(1);
});

it("User Confirm-Password Validation get message if any field value invalid", async () => {
	const item = shallow(<RegisterPage api={defaultApi} />);
	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: { isValid: true, message: "" },
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: true, message: "" },
			password_confirm: { isValid: false, message: "Password not provided", errorType: "PASSWORD_NOT_PROVIDED" },
			password: { isValid: true, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result.status).toBe(false);
	expect(result.message).toBe(`Please ensure all fields are filled correctly.`);
	expect(item.state().valid["password_confirm"].message).toBe("Password not provided");
	expect(item.find("MessageBox").length).toBe(1);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: { isValid: true, message: "" },
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: true, message: "" },
			password_confirm: { isValid: false, message: "", errorType: "PASSWORD_8_CHARACTER" },
			password: { isValid: true, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result2 = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result2.status).toBe(false);
	expect(result2.message).toBe(`Please ensure all fields are filled correctly.`);
	expect(item.state().valid["password_confirm"].message).toBe(`Password must be at least 8 characters.`);
	expect(item.find("MessageBox").length).toBe(1);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: { isValid: true, message: "" },
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: true, message: "" },
			password_confirm: { isValid: false, message: "", errorType: "PASSWORD_LOWER_CHARACTER" },
			password: { isValid: true, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result3 = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result3.status).toBe(false);
	expect(result3.message).toBe(`Please ensure all fields are filled correctly.`);
	expect(item.state().valid["password_confirm"].message).toBe(`Password must contain at least one lowercase letter.`);
	expect(item.find("MessageBox").length).toBe(1);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: { isValid: true, message: "" },
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: true, message: "" },
			password_confirm: { isValid: false, message: "", errorType: "PASSWORD_UPPER_CHARACTER" },
			password: { isValid: true, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result4 = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result4.status).toBe(false);
	expect(result4.message).toBe(`Please ensure all fields are filled correctly.`);
	expect(item.state().valid["password_confirm"].message).toBe(`Password must contain at least one uppercase letter.`);
	expect(item.find("MessageBox").length).toBe(1);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: { isValid: true, message: "" },
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: true, message: "" },
			password_confirm: { isValid: false, message: "", errorType: "PASSWORD_SPECIAL_CHARACTER" },
			password: { isValid: true, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result5 = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result5.status).toBe(false);
	expect(result5.message).toBe(`Please ensure all fields are filled correctly.`);
	expect(item.state().valid["password_confirm"].message).toBe(`Password must contain at least one special character.`);
	expect(item.find("MessageBox").length).toBe(1);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: { isValid: true, message: "" },
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: true, message: "" },
			password_confirm: { isValid: false, message: "", errorType: "PASSWORD_NUMBER_CHARACTER" },
			password: { isValid: true, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result6 = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result6.status).toBe(false);
	expect(result6.message).toBe(`Please ensure all fields are filled correctly.`);
	expect(item.state().valid["password_confirm"].message).toBe(`Password must contain at least one number.`);
	expect(item.find("MessageBox").length).toBe(1);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: { isValid: true, message: "" },
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: true, message: "" },
			password_confirm: { isValid: false, message: "", errorType: "" },
			password: { isValid: true, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result7 = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result7.status).toBe(false);
	expect(result7.message).toBe(`Please ensure all fields are filled correctly.`);
	expect(item.state().valid["password_confirm"].message).toBe(`Password not provided`);
	expect(item.find("MessageBox").length).toBe(1);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: { isValid: true, message: "" },
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: true, message: "" },
			password_confirm: { isValid: false, message: "", errorType: "confirmPasswordNotMatch" },
			password: { isValid: true, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result8 = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result8.status).toBe(false);
	expect(result8.message).toBe(`Please ensure all fields are filled correctly.`);
	expect(item.state().valid["password_confirm"].message).toBe(`You have not entered a matching password, please try again.`);
	expect(item.find("MessageBox").length).toBe(1);
});

it("Check Password match with confirm password or not", async () => {
	const item = shallow(<RegisterPage api={defaultApi} />);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: { isValid: true, message: "" },
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: false, message: "" },
			password_confirm: { isValid: true, message: "" },
			password: { isValid: true, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	item.setState({ fields: { password: "Test@1234" } });
	item.setState({ fields: { password_confirm: "Test@123" } });
	const result = item.instance().isFormValid();
	expect(item.instance().confirmedPassword("Test@123")).toBe(false);
});

/** Get validation message if school is invalid */
it("Get validation message if school is invalid", async () => {
	const item = shallow(<RegisterPage api={defaultApi} />);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: false, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: { isValid: true, message: "" },
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: false, message: "" },
			password: { isValid: true, message: "" },
			password_confirm: { isValid: true, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result.status).toBe(false);
	expect(result.message).toBe(`Please ensure all fields are filled correctly.`);
	expect(item.find("MessageBox").length).toBe(1);
});

/** Get validation message if title is invalid */
it("Get validation message if title is invalid", async () => {
	const item = shallow(<RegisterPage api={defaultApi} />);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: false, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: { isValid: true, message: "" },
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: false, message: "" },
			password: { isValid: true, message: "" },
			password_confirm: { isValid: true, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result.status).toBe(false);
	expect(result.message).toBe(`Please ensure all fields are filled correctly.`);
	expect(item.find("MessageBox").length).toBe(1);
});

/** Get validation with custom message if first_name isn't allowed 'Special characters'*/
it(`Get validation with custom message if first_name isn't allowed 'Special characters'`, async () => {
	mockReactRef_isValid = null;
	mockErrorMessage = "Special characters are not allowed";
	const item = shallow(<RegisterPage api={defaultApi} />);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: false, message: mockErrorMessage },
			last_name: { isValid: true, message: "" },
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: false, message: "" },
			password: { isValid: true, message: "" },
			password_confirm: { isValid: true, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result.status).toBe(false);
	expect(result.message).toBe("Please ensure all fields are filled correctly.");
	expect(item.state().valid["first_name"].message).toBe(mockErrorMessage);
	expect(item.find("MessageBox").length).toBe(1);
});

/** Get validation with custom message if first_name required*/
it(`Get validation with custom message if first_name required`, async () => {
	mockReactRef_isValid = null;
	mockErrorMessage = "First name not provided.";
	const item = shallow(<RegisterPage api={defaultApi} />);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: {
				isValid: false,
				message: "",
				errorType: mockErrorType.required,
			},
			last_name: { isValid: true, message: "" },
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: false, message: "" },
			password: { isValid: true, message: "" },
			password_confirm: { isValid: true, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result.status).toBe(false);
	expect(result.message).toBe("Please ensure all fields are filled correctly.");
	expect(item.state().valid["first_name"].message).toBe(mockErrorMessage);
	expect(item.find("MessageBox").length).toBe(1);
});

/** Get validation with custom message if last_name isn't allowed 'Special characters'*/
it(`Get validation with custom message if last_name isn't allowed 'Special characters'`, async () => {
	mockReactRef_isValid = null;
	mockErrorMessage = "Special characters are not allowed";
	const item = shallow(<RegisterPage api={defaultApi} />);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: { isValid: false, message: mockErrorMessage },
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: false, message: "" },
			password: { isValid: true, message: "" },
			password_confirm: { isValid: true, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result.status).toBe(false);
	expect(result.message).toBe("Please ensure all fields are filled correctly.");
	expect(item.state().valid["last_name"].message).toBe(mockErrorMessage);
	expect(item.find("MessageBox").length).toBe(1);
});

/** Get validation with custom message if last_name required*/
it(`Get validation with custom message if last_name required`, async () => {
	mockReactRef_isValid = null;
	mockErrorMessage = "Last name not provided.";
	const item = shallow(<RegisterPage api={defaultApi} />);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: {
				isValid: false,
				message: "",
				errorType: mockErrorType.required,
			},
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: false, message: "" },
			password: { isValid: true, message: "" },
			password_confirm: { isValid: true, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result.status).toBe(false);
	expect(result.message).toBe("Please ensure all fields are filled correctly.");
	expect(item.state().valid["last_name"].message).toBe(mockErrorMessage);
	expect(item.find("MessageBox").length).toBe(1);
});

/** Get validation with custom message if job_title isn't allowed 'Special characters'*/
it(`Get validation with custom message if job_title isn't allowed 'Special characters'`, async () => {
	mockReactRef_isValid = null;
	mockErrorMessage = "Special characters are not allowed";
	const item = shallow(<RegisterPage api={defaultApi} />);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: { isValid: true, message: "" },
			job_title: { isValid: false, message: mockErrorMessage },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: false, message: "" },
			password: { isValid: true, message: "" },
			password_confirm: { isValid: true, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result.status).toBe(false);
	expect(result.message).toBe("Please ensure all fields are filled correctly.");
	expect(item.state().valid["job_title"].message).toBe(mockErrorMessage);
	expect(item.find("MessageBox").length).toBe(1);
});

/** Get validation with custom message if job_title required*/
it(`Get validation with custom message if job_title required`, async () => {
	mockReactRef_isValid = null;
	mockErrorMessage = "Job title must be 150 characters or less.";
	const item = shallow(<RegisterPage api={defaultApi} />);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: { isValid: true, message: "" },
			job_title: {
				isValid: false,
				message: "",
				errorType: mockErrorType.length,
			},
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: false, message: "" },
			password: { isValid: true, message: "" },
			password_confirm: { isValid: true, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result.status).toBe(false);
	expect(result.message).toBe("Please ensure all fields are filled correctly.");
	expect(item.state().valid["job_title"].message).toBe(mockErrorMessage);
	expect(item.find("MessageBox").length).toBe(1);
});

/** Get validation with custom message if user does't checked terms_accepted */
it(`Get validation with custom message if user does't checked terms_accepted `, async () => {
	mockReactRef_isValid = null;
	mockErrorMessage = "We need you to agree to the terms and conditions before you register.";
	const item = shallow(<RegisterPage api={defaultApi} />);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: { isValid: true, message: "" },
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: false, message: mockErrorMessage },
			receive_marketing_emails: { isValid: false, message: "" },
			password: { isValid: true, message: "" },
			password_confirm: { isValid: true, message: "" },
			password: { isValid: true, message: "" },
			password_confirm: { isValid: true, message: "" },
		},
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();
	const result = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result.status).toBe(false);
	expect(result.message).toBe("Please ensure all fields are filled correctly.");
	expect(item.state().valid["terms_accepted"].message).toBe(mockErrorMessage);
	expect(item.find("MessageBox").length).toBe(1);
});

test("Fetch school data from AjaxSearchable dropdown", async () => {
	const item = shallow(<RegisterPage api={defaultApi} />);
	const spy = jest.spyOn(item.instance(), "updateApiCall");
	item.instance().updateApiCall("/auth/get-schools", { query: "Dover School" });
	await wait(1050);
	item.update();
	item.instance().forceUpdate();

	expect(spy).toHaveBeenCalled();
});

/** When component render in componentWillUnmount*/
test(`Component redener componentWillUnmount `, async () => {
	const mockHandleSubmit = jest.fn();
	const item = shallow(<RegisterPage api={defaultApi} />);
	const spy = jest.spyOn(item.instance(), "componentWillUnmount");

	const school = item.find('[name="school"]');
	const last_name = item.find('[name="last_name"]');
	const first_name = item.find('[name="first_name"]');
	const email = item.find('[name="email"]');
	const title = item.find('[name="title"]');
	const job_title = item.find('[name="job_title"]');
	const btnRegister = item.find('[name="btnRegister"]');

	email.simulate("change", "email", "william@email.com", {
		isValid: true,
		message: "",
	});
	await wait(1050);
	item.update();
	item.instance().forceUpdate();

	school.simulate("change", "school", select_school, {
		isValid: true,
		message: "",
	});
	await wait(1050);
	item.update();
	item.instance().forceUpdate();

	first_name.simulate("change", "first_name", "William", {
		isValid: true,
		message: "",
	});

	last_name.simulate("change", "last_name", "Powers", {
		isValid: true,
		message: "",
	});

	title.simulate("change", "title", "Mr", { isValid: true, message: "" });

	job_title.simulate("change", "job_title", "job title", {
		isValid: true,
		message: "",
	});

	await wait(50);
	btnRegister.simulate("click", {
		preventDefault: mockHandleSubmit,
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(mockHandleSubmit).toHaveBeenCalled();
	expect(item.state().message).toBe(`Successfully registered.`);
	expect(item.state().auto_registered).toBe(mockApprovedDomain);
	item.unmount();
	expect(spy).toHaveBeenCalled();
});

/** When component render in componentWillUnmount*/
test(`Component redener componentWillUnmount dont invoked any timeout function`, async () => {
	const mockHandleSubmit = jest.fn();
	const item = shallow(<RegisterPage api={defaultApi} />);
	const spy = jest.spyOn(item.instance(), "componentWillUnmount");
	item.unmount();
	expect(spy).toHaveBeenCalled();
});

test(`User first select the school then add the work email address`, async () => {
	const mockSearchQuery = "Test";
	const mockEmail = "test@greenwhich.com";
	const mockSelectSchool = { label: "Test 1 School", value: 1 };
	async function api(endpoint, data) {
		// "RegisterPage" only queries this endpoint
		if (endpoint === "/auth/get-schools") {
			if (data.domain) {
				return { result: [] };
			} else {
				return MockSchool;
			}
		}
		if (endpoint === "/auth/register") {
			throw new Error("A user with that email already exists");
		}
		defaultApi(endpoint, data);
	}
	const item = shallow(<RegisterPage api={api} />);
	// User search the school as 'Test'
	item.instance().updateApiCall("/auth/get-schools", { query: "Test" });
	await wait(250);
	expect(item.state().asyncSelectLoading).toEqual(false);
	expect(item.state().fields.school).toEqual(null);
	expect(item.state().fields.email).toEqual("");

	// User select the school
	item.instance().handleDrpChange("school", mockSelectSchool, { isValid: true });
	expect(item.state().fields.school).toEqual(mockSelectSchool);
	expect(item.state().fields.email).toEqual("");

	// User add the work email
	item.instance().handleInputChange("email", mockEmail, { isValid: true });
	await wait(300);
	expect(item.state().fields.school).toEqual(mockSelectSchool);
	expect(item.state().fields.email).toEqual(mockEmail);
});

test(`User entered email and auto selected school, After than change the email with different domain`, async () => {
	async function api(endpoint, data) {
		// "RegisterPage" only queries this endpoint
		if (endpoint === "/auth/get-schools") {
			if (data.domain === "xtsschool.com") {
				return {
					result: [
						{
							id: "101",
							name: "Om School",
							address1: "address1",
							address2: "address1",
							city: "city",
							post_code: "post_code",
							country: "1",
							local_authority: "local_authority",
							school_level: "primary",
							number_of_students: 100,
							school_home_page: "https://www.cla.co.uk",
							school_level: "high_school",
						},
					],
				};
			} else if (data.domain === "highschool.com") {
				return MockSchool;
			} else {
				return MockSchool;
			}
		}
		if (endpoint === "/auth/get-is-domain-mapped-with-school") {
			return { result: false };
		}
		if (endpoint === "/auth/register") {
			throw new Error("A user with that email already exists");
		}
		defaultApi(endpoint, data);
	}
	const item = shallow(<RegisterPage api={api} />);
	item.instance().handleInputChange("email", "test@xtsschool.com", { isValid: true });
	await wait(250);
	expect(item.state().asyncSelectLoading).toEqual(false);
	expect(item.state().fields.school).not.toEqual(null);
	expect(item.state().fields.school.value).toEqual("101");
	expect(item.state().fields.school.label).toEqual("Om School");
	expect(item.state().fields.email).toEqual("test@xtsschool.com");

	item.instance().handleInputChange("email", "test@highschool.com", { isValid: true });
	await wait(300);
	expect(item.state().asyncSelectLoading).toEqual(false);
	expect(item.state().fields.school).not.toEqual(null);
});

test(`User search school with the full post-code`, async () => {
	const item = shallow(<RegisterPage />);
	const updateApiParams = item.instance().updateApiCall("/auth/get-schools", { query: "PO16 0HZ" });
	expect(updateApiParams.params.full_postcode_search).toBe(true);
	expect(updateApiParams.params.query).toBe("PO16 0HZ");
});

test(`User search school with the partial post-code`, async () => {
	const item = shallow(<RegisterPage />);
	const updateApiParams = item.instance().updateApiCall("/auth/get-schools", { query: "PO16" });
	expect(updateApiParams.params.partial_postcode_search).toBe(true);
	expect(updateApiParams.params.query).toBe("PO16");
});

test(`User search school with more than three characters and after that search wth two characters`, async () => {
	const item = shallow(<RegisterPage />);
	// User search the school as 'Test'
	let updateApiPaams = item.instance().updateApiCall("/auth/get-schools", { query: "PO16" });
	await wait(250);
	expect(updateApiPaams.params.partial_postcode_search).toEqual(true);
	expect(item.state().fields.school).toEqual(null);
	expect(updateApiPaams.params.query).toEqual("PO16");

	updateApiPaams = item.instance().updateApiCall("/auth/get-schools", { query: "PO" });
	await wait(250);
	expect(updateApiPaams.params.query).toEqual("PO");
});

it("Approved domain user enter valid details and clicks on submit button for register", async () => {
	const mockHandleSubmit = jest.fn();
	mockApprovedDomain = true;
	const item = shallow(<RegisterPage api={defaultApi} />);

	const school = item.find('[name="school"]');
	const last_name = item.find('[name="last_name"]');
	const first_name = item.find('[name="first_name"]');
	const email = item.find('[name="email"]');
	const title = item.find('[name="title"]');
	const job_title = item.find('[name="job_title"]');
	const btnRegister = item.find('[name="btnRegister"]');

	email.simulate("change", "email", "william@email.com", {
		isValid: true,
		message: "",
	});
	await wait(1050);
	item.update();
	item.instance().forceUpdate();

	school.simulate("change", "school", select_school, {
		isValid: true,
		message: "",
	});
	await wait(1050);
	item.update();
	item.instance().forceUpdate();

	first_name.simulate("change", "first_name", "William", {
		isValid: true,
		message: "",
	});

	last_name.simulate("change", "last_name", "Powers", {
		isValid: true,
		message: "",
	});

	title.simulate("change", "title", "Mr", { isValid: true, message: "" });

	job_title.simulate("change", "job_title", "job title", {
		isValid: true,
		message: "",
	});

	await wait(50);
	btnRegister.simulate("click", {
		preventDefault: mockHandleSubmit,
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(mockHandleSubmit).toHaveBeenCalled();
	expect(item.state().message).toBe(`Successfully registered.`);
	expect(item.state().auto_registered).toBe(true);

	expect(item.find("SmallText").length).toBe(3);
});

it(`Get message during confirm password 'You have not entered a matching password, please try again.' `, async () => {
	mockReactRef_isValid = null;
	mockErrorMessage = "We need you to agree to the terms and conditions before you register.";
	const item = shallow(<RegisterPage api={defaultApi} />);
	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			school: { isValid: true, message: "" },
			title: { isValid: true, message: "" },
			first_name: { isValid: true, message: "" },
			last_name: { isValid: true, message: "" },
			job_title: { isValid: true, message: "" },
			terms_accepted: { isValid: true, message: "" },
			receive_marketing_emails: { isValid: true, message: "" },
			password: { isValid: true, message: "" },
			password_confirm: { isValid: true, message: "" },
			password: { isValid: true, message: "" },
			password_confirm: { isValid: true, message: "" },
		},
		fields: {
			Password: "abc",
		},
	});

	await wait(20);
	item.update();
	item.instance().handleInputChange("password_confirm", "abc", { isValid: true });
	const result = item.instance().isFormValid();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(result.status).toBe(false);
	expect(result.message).toBe("Please ensure all fields are filled correctly.");
	expect(item.state().valid["password_confirm"].message).toBe(`You have not entered a matching password, please try again.`);
	expect(item.find("MessageBox").length).toBe(1);
});
