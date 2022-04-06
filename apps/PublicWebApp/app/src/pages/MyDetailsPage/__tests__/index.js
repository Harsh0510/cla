// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow } from "enzyme";
import MyDetailsPage from "../index";
import Header from "../../../widgets/Header";
import MessageBox from "../../../widgets/MessageBox";
import MockUser from "../../../mocks/MockUser";
import errorType from "../../../common/errorType";
import MockNotification from "../../../mocks/MockNotification";
import staticValues from "../../../common/staticValues";

let session_token, inputFieldName, mockUserData;
let mockReactRef_isValid;
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

// Mock import
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAuthRequiredConsumer", () => mockPassthruHoc);
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
	if (endpoint === "/auth/update-my-details") {
		return {
			result: true,
		};
	} else if (endpoint === "/auth/get-notification-categories") {
		return MockNotification.notificationCategories;
	} else if (endpoint === "/auth/get-my-disabled-notification-categories") {
		return MockNotification.disableCategories;
	} else if (endpoint === "/public/user-update-tutorial-view") {
		return true;
	} else if (endpoint === "/auth/user-get-uneditable-fields") {
		return {
			fields: [],
		};
	}
	throw new Error("should never be here");
}

function resetAll() {
	session_token = "e997d26eef1b2ce43d3151a3be3b74cf0ba4073ee07d2564";
	inputFieldName = "first_name";
	mockUserData = MockUser[0];
	mockReactRef_isValid = true;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	expect(item.containsMatchingElement(<Header />)).toBe(true);
	const fields = item.state().fields;
	expect(fields).toEqual(MockNotification.formFieldsData);
});

/** Error When session data not passed */
test(`Error When session data not passed`, async () => {
	mockUserData = null;
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(20);
	const fields = item.state().fields;
	expect(fields).toEqual(MockNotification.formFieldsData);
});

/** User enter valid first name */
test(`User enter valid first name`, async () => {
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const handleInputChange = jest.spyOn(item.instance(), "handleInputChange");
	item.update();
	item.instance().handleInputChange("first_name", "Test", { isValid: true, message: "" });
	expect(handleInputChange).toHaveBeenCalled();
	expect(item.state().valid.first_name.isValid).toBe(true);
	expect(item.state().valid.first_name.message).toBe("");

	const updateButton = item.find("Button");
	expect(item.containsMatchingElement(<MessageBox />)).toBe(false);
	expect(updateButton.props().disabled).toBe(false);
});

/** User get error message "Special characters are not allowed" when enter invalid first_name */
test(`User get error message "Special characters are not allowed"`, async () => {
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const handleInputChange = jest.spyOn(item.instance(), "handleInputChange");
	item.update();
	item.instance().handleInputChange("first_name", "Test@2", {
		isValid: false,
		errorType: errorType.validation,
		message: "Special characters are not allowed",
	});
	expect(handleInputChange).toHaveBeenCalled();
	expect(item.state().valid.first_name.isValid).toBe(false);
	expect(item.state().valid.first_name.message).toBe("Special characters are not allowed");
	expect(item.state().valid.first_name.errorType).toBe(errorType.validation);
	const updateButton = item.find("Button");
	expect(item.containsMatchingElement(<MessageBox />)).toBe(true);
	expect(updateButton.props().disabled).toBe(true);
});

/** User get error message "Special characters are not allowed" when enter invalid first_name */
test(`User get error message "A first name must be 100 characters or less."`, async () => {
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const handleInputChange = jest.spyOn(item.instance(), "handleInputChange");
	item.update();
	item.instance().handleInputChange("first_name", "Luice".repeat(20), {
		isValid: false,
		errorType: errorType.required,
		message: "please ensure this value must be between 1 to 100",
	});
	expect(handleInputChange).toHaveBeenCalled();
	expect(item.state().fields.first_name).toBe("Luice".repeat(20));
	expect(item.state().valid.first_name.isValid).toBe(false);
	expect(item.state().valid.first_name.message).toBe("please ensure this value must be between 1 to 100");
	expect(item.state().valid.first_name.errorType).toBe(errorType.required);

	const updateButton = item.find("Button");
	const messageBoxMainTitle = item.find("MessageBox");
	expect(item.containsMatchingElement(<MessageBox />)).toEqual(true);
	expect(updateButton.props().disabled).toEqual(true);
	expect(messageBoxMainTitle.props().message).toEqual("please ensure this value must be between 1 to 100");
});

/** User enter valid last name */
test(`User enter valid last name`, async () => {
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const handleInputChange = jest.spyOn(item.instance(), "handleInputChange");
	item.update();
	item.instance().handleInputChange("last_name", "Test", { isValid: true, message: "" });
	expect(handleInputChange).toHaveBeenCalled();
	expect(item.state().valid.last_name.isValid).toBe(true);
	expect(item.state().valid.last_name.message).toBe("");

	const updateButton = item.find("Button");
	expect(item.containsMatchingElement(<MessageBox />)).toBe(false);
	expect(updateButton.props().disabled).toBe(false);
});

/** User get error message "Special characters are not allowed" when enter invalid last_name */
test(`User get error message "Special characters are not allowed" when enter invalid last name`, async () => {
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const handleInputChange = jest.spyOn(item.instance(), "handleInputChange");
	item.update();
	item.instance().handleInputChange("last_name", "Test@2", {
		isValid: false,
		errorType: errorType.validation,
		message: "Special characters are not allowed",
	});
	expect(handleInputChange).toHaveBeenCalled();
	expect(item.state().valid.last_name.isValid).toBe(false);
	expect(item.state().valid.last_name.message).toBe("Special characters are not allowed");
	expect(item.state().valid.last_name.errorType).toBe(errorType.validation);
	const updateButton = item.find("Button");
	expect(item.containsMatchingElement(<MessageBox />)).toBe(true);
	expect(updateButton.props().disabled).toBe(true);
});

/** User get error message "Special characters are not allowed" when enter invalid last_name */
test(`User get error message "A last name must be 100 characters or less." when enter invalid last_name`, async () => {
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const handleInputChange = jest.spyOn(item.instance(), "handleInputChange");
	item.update();
	item.instance().handleInputChange("last_name", "Luice".repeat(20), {
		isValid: false,
		errorType: errorType.required,
		message: "Last name is required.",
	});
	expect(handleInputChange).toHaveBeenCalled();
	expect(item.state().fields.last_name).toBe("Luice".repeat(20));
	expect(item.state().valid.last_name.isValid).toBe(false);
	expect(item.state().valid.last_name.message).toBe("Last name is required.");
	expect(item.state().valid.last_name.errorType).toBe(errorType.required);

	const updateButton = item.find("Button");
	const messageBoxMainTitle = item.find("MessageBox");
	expect(item.containsMatchingElement(<MessageBox />)).toEqual(true);
	expect(updateButton.props().disabled).toEqual(true);
	expect(messageBoxMainTitle.props().message).toEqual("Last name is required.");
});

/** User enter valid Job_title */
test(`User enter valid Job_title`, async () => {
	inputFieldName = "job_title";
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const handleInputChange = jest.spyOn(item.instance(), "handleInputChange");
	item.update();
	item.instance().handleInputChange(inputFieldName, "teacher", {
		isValid: true,
		errorType: "",
		message: "",
	});
	expect(handleInputChange).toHaveBeenCalled();
	expect(item.state().fields.job_title).toEqual("teacher");
	expect(item.state().valid.job_title.isValid).toEqual(true);
	expect(item.state().valid.job_title.errorType).toEqual("");
	expect(item.state().valid.job_title).toEqual({
		isValid: true,
		errorType: "",
		message: "",
	});
});

/** User enter invalid the Job_title */
test(`User enter invalid the Job_title`, async () => {
	inputFieldName = "job_title";
	const validation = {
		isValid: false,
		errorType: "length",
		message: "Maximum 150 characters required",
	};
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const handleInputChange = jest.spyOn(item.instance(), "handleInputChange");
	item.update();
	item.instance().handleInputChange(inputFieldName, "administrator".repeat(20), validation);
	expect(handleInputChange).toHaveBeenCalled();
	expect(item.state().fields.job_title).toEqual("administrator".repeat(20));
	expect(item.state().valid.job_title.isValid).toEqual(false);
	expect(item.state().valid.job_title.errorType).toEqual("length");
	expect(item.state().valid.job_title).toEqual(validation);

	const updateButton = item.find("Button");
	const messageBoxMainTitle = item.find("MessageBox");
	expect(item.containsMatchingElement(<MessageBox />)).toEqual(true);
	expect(updateButton.props().disabled).toEqual(true);
	expect(messageBoxMainTitle.props().message).toEqual("Maximum 150 characters required");
});

/** User enter invalid the Job_title */
test(`User enter invalid the Job_title`, async () => {
	inputFieldName = "job_title";
	const validation = {
		isValid: false,
		errorType: "lengthInvalid",
		message: "Maximum 150 characters required",
	};
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const handleInputChange = jest.spyOn(item.instance(), "handleInputChange");
	item.update();
	item.instance().handleInputChange(inputFieldName, "administrator", validation);
	expect(handleInputChange).toHaveBeenCalled();
	expect(item.state().fields.job_title).toEqual("administrator");
	expect(item.state().valid.job_title.isValid).toEqual(false);
	expect(item.state().valid.job_title.errorType).toEqual("lengthInvalid");
	expect(item.state().valid.job_title).toEqual(validation);

	const updateButton = item.find("Button");
	const messageBoxMainTitle = item.find("MessageBox");
	expect(item.containsMatchingElement(<MessageBox />)).toEqual(true);
	expect(updateButton.props().disabled).toEqual(true);
	expect(messageBoxMainTitle.props().message).toEqual("Maximum 150 characters required");
});

/** User select the title from drop down */
test(`User select value from drop down`, async () => {
	inputFieldName = "title";
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const handleInputChange = jest.spyOn(item.instance(), "handleInputChange");
	item.update();
	item.instance().handleInputChange(inputFieldName, "Mr", {
		isValid: true,
		errorType: "",
		message: "",
	});
	expect(handleInputChange).toHaveBeenCalled();
	expect(item.state().fields.title).toEqual("Mr");
	expect(item.state().valid.title.isValid).toEqual(true);
	expect(item.state().valid.title.errorType).toEqual("");
	expect(item.state().valid.title).toEqual({
		isValid: true,
		errorType: "",
		message: "",
	});
});

test(`User select value from Tutorial View drop down`, async () => {
	inputFieldName = "flyout_enabled";
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const handleInputChange = jest.spyOn(item.instance(), "handleInputChange");
	item.update();
	item.instance().handleInputChange(inputFieldName, "false", {
		isValid: true,
		errorType: "",
		message: "",
	});
	expect(handleInputChange).toHaveBeenCalled();
	expect(item.state().fields.flyout_enabled).toEqual("false");
	expect(item.state().valid.flyout_enabled.isValid).toEqual(true);
	expect(item.state().valid.flyout_enabled.errorType).toEqual("");
	expect(item.state().valid.flyout_enabled).toEqual({
		isValid: true,
		errorType: "",
		message: "",
	});
});

test(`User checked value for Tutorial View`, async () => {
	inputFieldName = "flyout_enabled";
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const handleInputChange = jest.spyOn(item.instance(), "handleInputChange");
	item.update();
	item.instance().handleInputChange(inputFieldName, "false", {
		isValid: true,
		errorType: "",
		message: "",
	});
	expect(handleInputChange).toHaveBeenCalled();
	expect(item.state().fields.flyout_enabled).toEqual("false");
	expect(item.state().valid.flyout_enabled.isValid).toEqual(true);
	expect(item.state().valid.flyout_enabled.errorType).toEqual("");
	expect(item.state().valid.flyout_enabled).toEqual({
		isValid: true,
		errorType: "",
		message: "",
	});
});

test(`User checked true from Tutorial View and ConfirmModal open`, async () => {
	inputFieldName = "flyout_enabled";
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const onTutorialViewChange = jest.spyOn(item.instance(), "onTutorialViewChange");
	item.update();
	item.instance().onTutorialViewChange(true, {
		isValid: true,
		errorType: "",
		message: "",
	});
	expect(onTutorialViewChange).toHaveBeenCalled();
	//expect(item.state().fields.flyout_enabled).toEqual(true);
	expect(item.state().valid.flyout_enabled.isValid).toEqual(true);
	expect(item.state("showConfirmationBox")).toEqual(true);
});

/** User select as 'Select Title' from drop down */
test(`User select as 'Select Title' from drop down `, async () => {
	inputFieldName = "title";
	const errorType = "required";
	const validation = {
		isValid: false,
		errorType: errorType,
		message: "Title is required.",
	};
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const handleInputChange = jest.spyOn(item.instance(), "handleInputChange");
	item.update();
	item.instance().handleInputChange(inputFieldName, "", validation);
	expect(handleInputChange).toHaveBeenCalled();
	expect(item.state().fields.title).toEqual("");
	expect(item.state().valid.title.isValid).toEqual(false);
	expect(item.state().valid.title.errorType).toEqual(errorType);
	expect(item.state().valid.title).toEqual(validation);

	const updateButton = item.find("Button");
	const messageBoxMainTitle = item.find("MessageBox");
	expect(item.containsMatchingElement(<MessageBox />)).toEqual(true);
	expect(updateButton.props().disabled).toEqual(true);
	expect(messageBoxMainTitle.props().message).toEqual("Please ensure all fields are filled correctly.");
});

/** User enter valid copy name*/
test(`User enter valid copy name`, async () => {
	inputFieldName = "name_display_preference";
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const handleInputChange = jest.spyOn(item.instance(), "handleInputChange");
	item.update();
	item.instance().handleInputChange(inputFieldName, "copy name", {
		isValid: true,
		errorType: "",
		message: "",
	});
	expect(handleInputChange).toHaveBeenCalled();
	expect(item.state().fields.name_display_preference).toEqual("copy name");
	expect(item.state().valid.name_display_preference.isValid).toEqual(true);
	expect(item.state().valid.name_display_preference.errorType).toEqual("");
	expect(item.state().valid.name_display_preference).toEqual({
		isValid: true,
		errorType: "",
		message: "",
	});
});

/** User enter invalid the copy name */
test(`User enter invalid the copy name`, async () => {
	inputFieldName = "name_display_preference";
	const validation = {
		isValid: false,
		errorType: "length",
		message: "Maximum 100 characters required",
	};
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const handleInputChange = jest.spyOn(item.instance(), "handleInputChange");
	item.update();
	item.instance().handleInputChange(inputFieldName, "Copy Name 1".repeat(20), validation);
	expect(handleInputChange).toHaveBeenCalled();
	expect(item.state().fields.name_display_preference).toEqual("Copy Name 1".repeat(20));
	expect(item.state().valid.name_display_preference.isValid).toEqual(false);
	expect(item.state().valid.name_display_preference.errorType).toEqual("length");
	expect(item.state().valid.name_display_preference).toEqual(validation);

	const updateButton = item.find("Button");
	const messageBoxMainTitle = item.find("MessageBox");
	expect(item.containsMatchingElement(<MessageBox />)).toEqual(true);
	expect(updateButton.props().disabled).toEqual(true);
	expect(messageBoxMainTitle.props().message).toEqual("Maximum 100 characters required");
});

/** User enter invalid the copy name */
test(`User enter invalid the copy name`, async () => {
	inputFieldName = "name_display_preference";
	const validation = {
		isValid: false,
		errorType: "lengthInvalid",
		message: "Maximum 100 characters required",
	};
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const handleInputChange = jest.spyOn(item.instance(), "handleInputChange");
	item.update();
	item.instance().handleInputChange(inputFieldName, "Copy Name 1".repeat(20), validation);
	expect(handleInputChange).toHaveBeenCalled();
	expect(item.state().fields.name_display_preference).toEqual("Copy Name 1".repeat(20));
	expect(item.state().valid.name_display_preference.isValid).toEqual(false);
	expect(item.state().valid.name_display_preference.errorType).toEqual("lengthInvalid");
	expect(item.state().valid.name_display_preference).toEqual(validation);

	const updateButton = item.find("Button");
	const messageBoxMainTitle = item.find("MessageBox");
	expect(item.containsMatchingElement(<MessageBox />)).toEqual(true);
	expect(updateButton.props().disabled).toEqual(true);
	expect(messageBoxMainTitle.props().message).toEqual("Maximum 100 characters required");
});

/** User update the details */
test(`User update the details`, async () => {
	const validation = { isValid: true, errorType: "", message: "" };

	const mockCall = jest.fn();
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const title = item.find('[name="title"]');
	const first_name = item.find('[name="first_name"]');
	const last_name = item.find('[name="last_name"]');
	const job_title = item.find('[name="job_title"]');
	const name_display_preference = item.find('[name="name_display_preference"]');
	const tutorialView = item.find("CheckboxField").first();
	const receivingEmail = item.find("CheckboxField").at(1);

	title.simulate("change", "title", "Mr", validation);

	first_name.simulate("change", "first_name", "devid", validation);

	last_name.simulate("change", "last_name", "Data", validation);

	job_title.simulate("change", "job_title", "Teacher", validation);
	tutorialView.simulate("change", false);
	receivingEmail.simulate("change", true);

	name_display_preference.simulate("change", "name_display_preference", "Luice charlce ", validation);
	await wait(50);
	const submitButton = item.find('[name="btnRegister"]');
	submitButton.simulate("click", { preventDefault: mockCall });

	expect(mockCall).toHaveBeenCalled();
});

/** User update the details */
test(`User update the details return success result`, async () => {
	global.localStorage.setItem("sessId", session_token);
	const mockCall = jest.fn();
	async function api(endpoint, data) {
		if (endpoint === "/auth/update-my-details") {
			return {
				result: true,
			};
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(<MyDetailsPage api={api} withAuthConsumer_myUserDetails={mockUserData} withAuthConsumer_attemptReauth={mockCall} />);
	await wait(50);
	const submitButton = item.find('[name="btnRegister"]');
	submitButton.simulate("click", { preventDefault: mockCall });
	await wait(50);
	expect(mockCall).toHaveBeenCalled();
	expect(item.state().message).toEqual("Successfully updated");
});

/** User update the details when api returns error*/
test(`User update the details return failed`, async () => {
	global.localStorage.setItem("sessId", session_token);
	async function api(endpoint, data) {
		if (endpoint === "/auth/update-my-details") {
			return {
				result: false,
			};
		}
		return defaultApi(endpoint, data);
	}
	const mockCall = jest.fn();
	const item = shallow(<MyDetailsPage api={api} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const submitButton = item.find('[name="btnRegister"]');
	submitButton.simulate("click", { preventDefault: mockCall });

	await wait(50);
	expect(mockCall).toHaveBeenCalled();
	expect(item.state().message).toEqual(`Something went wrong`);
});

/** User update the details get exception */
test(`User update the details get exception`, async () => {
	global.localStorage.setItem("sessId", session_token);
	async function api(endpoint, data) {
		if (endpoint === "/auth/update-my-details") {
			throw "Unknown error";
		}
		return defaultApi(endpoint, data);
	}
	const mockCall = jest.fn();
	const item = shallow(<MyDetailsPage api={api} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const submitButton = item.find('[name="btnRegister"]');
	submitButton.simulate("click", { preventDefault: mockCall });
	await wait(50);
	expect(mockCall).toHaveBeenCalled();
	expect(item.state().message).toEqual("Unknown error");
});

/** Updated the props details and called component Did Update */
test(`User update the details`, async () => {
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	const beforeUpdateProps = item.state().fields;
	const new_UserData = mockUserData;
	new_UserData.first_name = "Frank";
	item.setProps({ withAuthConsumer_myUserDetails: MockUser[1] });
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	const afterUpdateProps = item.state().fields;
	expect(beforeUpdateProps.first_name != afterUpdateProps.first_name).toBe(true);
});

/** Called componentWillUnmount  */
test("Called componentWillUnmount", async () => {
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.update();
	const spy = jest.spyOn(item.instance(), "componentWillUnmount");
	item.unmount();
	expect(spy).toHaveBeenCalled();
});

/** User disabled the notification */
test("User disabled the notification", async () => {
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.update();
	expect(item.state().fields.disabled_categories.length).toEqual(0);
	item.instance().onCategoriesChange([1, 2]);
	expect(item.state().fields.disabled_categories.length).toEqual(2);
	expect(item.state().fields.disabled_categories).toEqual([1, 2]);
});

test("User disabled the notification", async () => {
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.update();
	item.instance().onReceiveMarketingEmailsChange(true);
	//expect(item.state().fields.disabled_categories.length).toEqual(2);
	expect(item.state().fields.receive_marketing_emails).toEqual(true);
});

test(`User update the details return success result`, async () => {
	global.localStorage.setItem("sessId", session_token);
	const mockCall = jest.fn();
	async function api(endpoint, data) {
		if (endpoint === "/auth/update-my-details") {
			return {
				result: true,
			};
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(<MyDetailsPage api={api} withAuthConsumer_myUserDetails={mockUserData} withAuthConsumer_attemptReauth={mockCall} />);
	await wait(50);

	item.instance().onCategoriesChange([1, 2]);
	item.instance().handleInputChange("title", "Mr.", { isValid: true, message: null });
	item.instance().handleInputChange("title", "Mr.", { isValid: true, message: null });
	const submitButton = item.find('[name="btnRegister"]');
	submitButton.simulate("click", { preventDefault: mockCall });
	await wait(50);
	expect(mockCall).toHaveBeenCalled();
	expect(item.state().message).toEqual("Successfully updated");
});

test(`User checked true from Tutorial View and ConfirmModal open and click on cancle `, async () => {
	inputFieldName = "flyout_enabled";
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const onTutorialViewChange = jest.spyOn(item.instance(), "onTutorialViewChange");
	item.update();
	item.instance().onTutorialViewChange(true, {
		isValid: true,
		errorType: "",
		message: "",
	});
	item.instance().hideConfirmModel();
	expect(onTutorialViewChange).toHaveBeenCalled();
	//expect(item.state().fields.flyout_enabled).toEqual(true);
	expect(item.state().valid.flyout_enabled.isValid).toEqual(true);
	expect(item.state("showConfirmationBox")).toEqual(false);
});

test(`User checked true from Tutorial View and ConfirmModal open and click on confirm `, async () => {
	inputFieldName = "flyout_enabled";
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const onTutorialViewChange = jest.spyOn(item.instance(), "onTutorialViewChange");
	item.update();
	item.instance().onTutorialViewChange(true, {
		isValid: true,
		errorType: "",
		message: "",
	});
	item.instance().onConfirm();
	expect(onTutorialViewChange).toHaveBeenCalled();
	//expect(item.state().fields.flyout_enabled).toEqual(true);
	expect(item.state().valid.flyout_enabled.isValid).toEqual(true);
	expect(item.state("showConfirmationBox")).toEqual(false);
});

/** Called componentWillUnmount  */
test("Called componentWillUnmount when timeout is true", async () => {
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.update();
	const spy = jest.spyOn(item.instance(), "componentWillUnmount");
	item.instance()._timeout = true;
	item.unmount();
	expect(spy).toHaveBeenCalled();
});

test("User disabled the email notification", async () => {
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.update();
	expect(item.state().fields.disabled_categories.length).toEqual(0);
	item.instance().onEmailOptOutChange([staticValues.emailNotificationCategories[0].id, staticValues.emailNotificationCategories[1].id]);
	expect(item.state().fields.email_opt_out.length).toEqual(2);
	expect(item.state().fields.email_opt_out).toEqual([staticValues.emailNotificationCategories[0].id, staticValues.emailNotificationCategories[1].id]);
});

test(`User change disable the some of the email notifications`, async () => {
	const mockCall = jest.fn();
	const item = shallow(<MyDetailsPage api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().onEmailOptOutChange([staticValues.emailNotificationCategories[0].id, staticValues.emailNotificationCategories[1].id]);
	await wait(50);
	const submitButton = item.find('[name="btnRegister"]');
	submitButton.simulate("click", { preventDefault: mockCall });
	expect(item.state().fields.email_opt_out).toEqual([staticValues.emailNotificationCategories[1].id, staticValues.emailNotificationCategories[0].id]);
	expect(mockCall).toHaveBeenCalled();
});
