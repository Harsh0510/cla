// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import UserAddEdit from "../UserAddEdit";
import MockUserRole from "../../../mocks/MockUserRole";
import MockDropSchoolData from "../../../mocks/MockDropSchoolData";

let MOCKUSERFORMDATA = [
	{
		name: "email",
		value: "abc@email.com",
	},
	{
		name: "first_name",
		value: "abc",
	},
	{
		name: "last_name",
		value: "def",
	},
	{
		name: "role",
		value: "school_admin",
	},
	{
		name: "title",
		value: "Mr",
	},
	{
		name: "school_id",
		value: "1",
	},
];

let CONFIRM_DIALOG_NONE, CONFIRM_DIALOG_DELETE, CONFIRM_DIALOG_RESET_PASSWORD;
let ACTION_NEW, ACTION_EDIT;
let mockUserData;
let location, fields, userTitles, userRoles, userOid, message, mockFormData, inputFieldValue, inputFieldName;
/**
 * This 'HOC' does nothing but 'pass through' the provided component,
 * so it's not necessary to 'dive()' into rendered results,
 * and so it's possible to mock the 'api' function.
 **/
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

// Mock HOC imports
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
/** Mock function for pass mock form data */
jest.mock("../../../common/CustomFormData", () => {
	return function () {
		const ret = [];
		for (const key in mockFormData) {
			if (mockFormData.hasOwnProperty(key)) {
				ret.push(key, mockFormData[key]);
			}
		}
		return ret;
	};
});

// Wait for a specified ashallow of time for async functions
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/**
 * To be called before and after each test. Useful for resetting globally scoped variables
 */
function resetAll() {
	CONFIRM_DIALOG_NONE = "";
	CONFIRM_DIALOG_DELETE = "delete";
	CONFIRM_DIALOG_RESET_PASSWORD = "reset-password";
	ACTION_NEW = "new";
	ACTION_EDIT = "edit";
	mockUserData = {
		first_name: "Test",
		last_name: "Surname",
		role: "teacher",
		school: null,
	};
	location = {
		search: "",
	};
	fields = {
		title: "Mr",
		email: "email@email.com",
		first_name: "firstname",
		last_name: "lastname",
		role: "role",
		school_id: 3,
	};
	userRoles = [
		{
			id: "teacher",
			title: "Teacher",
		},
		{
			id: "school-admin",
			title: "School Admin",
		},
		{
			id: "cla-admin",
			title: "Cla Admin",
		},
	];
	userTitles = ["Mr", "Mrs", "Ms", "Miss", "Dr", "Sir"];
	message = "";
	userOid = "";
	mockFormData = [];
	inputFieldValue = "devid";
	inputFieldName = "first_name";
}

beforeEach(resetAll);
afterEach(resetAll);

/**Pops Mock function */
const handleSubmit = jest.fn();
const cancelAddEdit = jest.fn();
const deleteUser = jest.fn();
const doResetPassword = jest.fn();
const resetPassword = jest.fn();
const handleDrpChange = jest.fn();
const handleDrpRole = jest.fn();
const handleNameInputField = jest.fn();

/** Default Mock api method */
async function defaultApi(endpoint, data = null) {
	// This will be caught by the promise in the component
	throw new Error("should never be here");
}

/** Component renders */
test("Component renders correctly", async () => {
	const item = shallow(
		<UserAddEdit
			key={fields.email || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			resetPassword={resetPassword}
			action={ACTION_EDIT}
			userRoles={userRoles}
			userTitles={userTitles}
			deleteUser={deleteUser}
			currentUserRole={MockUserRole.claAdmin}
			allSchools={MockDropSchoolData.result}
			handleDrpChange={handleDrpChange}
			handleDrpRole={handleDrpRole}
			blockedFields={new Set()}
		/>
	);

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.find("FormWrapAddEdit").length).toBe(1);
});

/** User click on no button from delete dailog box */
test("User click on no button from delete dailog box", async () => {
	const item = shallow(
		<UserAddEdit
			key={fields.email || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			resetPassword={resetPassword}
			action={ACTION_EDIT}
			userRoles={userRoles}
			userTitles={userTitles}
			deleteUser={deleteUser}
			currentUserRole={MockUserRole.claAdmin}
			allSchools={MockDropSchoolData.result}
			handleDrpChange={handleDrpChange}
			handleDrpRole={handleDrpRole}
			blockedFields={new Set()}
		/>
	);

	//set for open the dialog box
	item.setState({ show_confirm_dialog: CONFIRM_DIALOG_DELETE });

	item.instance().doDismissRejectDialog({ preventDefault: jest.fn() });
	await wait(50);
	item.update();

	expect(item.state().show_confirm_dialog).toEqual(CONFIRM_DIALOG_NONE);
});

/** User click on yes button from delete dailog box */
test("User click on yes button from delete dailog box", async () => {
	const item = shallow(
		<UserAddEdit
			key={fields.email || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			resetPassword={resetPassword}
			action={ACTION_EDIT}
			userRoles={userRoles}
			userTitles={userTitles}
			deleteUser={deleteUser}
			currentUserRole={MockUserRole.claAdmin}
			allSchools={MockDropSchoolData.result}
			handleDrpChange={handleDrpChange}
			handleDrpRole={handleDrpRole}
			blockedFields={new Set()}
		/>
	);

	// set the show_confirm dialog in state
	item.setState({ show_confirm_dialog: CONFIRM_DIALOG_NONE });

	item.instance().doShowConfirmDelete({ preventDefault: jest.fn() });
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().show_confirm_dialog).toEqual(CONFIRM_DIALOG_DELETE);
});

/** Use click on reset password button */
test("Use click on reset password button", async () => {
	const item = shallow(
		<UserAddEdit
			key={fields.email || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			resetPassword={resetPassword}
			action={ACTION_EDIT}
			userRoles={userRoles}
			userTitles={userTitles}
			deleteUser={deleteUser}
			currentUserRole={MockUserRole.claAdmin}
			allSchools={MockDropSchoolData.result}
			handleDrpChange={handleDrpChange}
			handleDrpRole={handleDrpRole}
			blockedFields={new Set()}
		/>
	);

	//set show_confirm_dialog value
	item.setState({ show_confirm_dialog: CONFIRM_DIALOG_NONE });
	item.instance().doShowConfirmResetPassword({ preventDefault: jest.fn() });

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().show_confirm_dialog).toEqual(CONFIRM_DIALOG_RESET_PASSWORD);
});

/** Component renders without email get field id, Render without email in getFieldId function called */
test("Component renders without email get field id", async () => {
	let fields = {
		title: "",
		email: "",
		first_name: "",
		last_name: "",
		role: "",
	};

	const item = shallow(
		<UserAddEdit
			key={fields.email || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			resetPassword={resetPassword}
			action={ACTION_EDIT}
			userRoles={userRoles}
			userTitles={userTitles}
			deleteUser={deleteUser}
			currentUserRole={MockUserRole.claAdmin}
			allSchools={MockDropSchoolData.result}
			handleDrpChange={handleDrpChange}
			handleDrpRole={handleDrpRole}
			blockedFields={new Set()}
		/>
	);

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.find("FormWrapAddEdit").length).toBe(1);
});

/** User click on submit button for create */
test("User click on submit button for create a user", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKUSERFORMDATA;

	const item = shallow(
		<UserAddEdit
			key={fields.email || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			resetPassword={resetPassword}
			action={ACTION_EDIT}
			userRoles={userRoles}
			userTitles={userTitles}
			deleteUser={deleteUser}
			currentUserRole={MockUserRole.claAdmin}
			allSchools={MockDropSchoolData.result}
			handleDrpChange={handleDrpChange}
			handleDrpRole={handleDrpRole}
			blockedFields={new Set()}
		/>
	);

	const form = item.find("FormWrapAddEdit");
	await wait(50);
	//item.instance().doSubmit({ preventDefault: jest.fn() });
	item.update();

	form.simulate("submit", {
		preventDefault: mockCall,
		target: [mockFormData],
		relatedTarget: { value: "create-user" },
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(mockCall).toBeCalled();
});

/** User click on submit button for update */
test("User click on submit button for update", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKUSERFORMDATA;

	const item = shallow(
		<UserAddEdit
			key={fields.email || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			resetPassword={resetPassword}
			action={ACTION_EDIT}
			userRoles={userRoles}
			userTitles={userTitles}
			deleteUser={deleteUser}
			currentUserRole={MockUserRole.claAdmin}
			allSchools={MockDropSchoolData.result}
			handleDrpChange={handleDrpChange}
			handleDrpRole={handleDrpRole}
			blockedFields={new Set()}
		/>
	);

	const form = item.find("FormWrapAddEdit");
	await wait(50);
	//item.instance().doSubmit({ preventDefault: jest.fn() });
	item.update();

	form.simulate("submit", {
		preventDefault: mockCall,
		target: [mockFormData],
		relatedTarget: { value: "update-user" },
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(mockCall).toBeCalled();
});

/** User click on submit button for update */
test("User click on submit button for update", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKUSERFORMDATA;

	const item = shallow(
		<UserAddEdit
			key={fields.email || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			resetPassword={resetPassword}
			action={ACTION_EDIT}
			userRoles={userRoles}
			userTitles={userTitles}
			deleteUser={deleteUser}
			currentUserRole={MockUserRole.claAdmin}
			allSchools={MockDropSchoolData.result}
			handleDrpChange={handleDrpChange}
			handleDrpRole={handleDrpRole}
			blockedFields={new Set()}
		/>
	);

	const form = item.find("FormWrapAddEdit");
	await wait(50);
	//item.instance().doSubmit({ preventDefault: jest.fn() });
	item.update();

	form.simulate("submit", {
		preventDefault: mockCall,
		target: [mockFormData],
		relatedTarget: { value: "update-user" },
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(mockCall).toBeCalled();
});

/** User click on yes from delete confirmdialog box */
test("User click on yes from delete confirmdialog box", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKUSERFORMDATA;

	const item = shallow(
		<UserAddEdit
			key={fields.email || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={"Invalid School"}
			fields={fields}
			resetPassword={resetPassword}
			action={ACTION_EDIT}
			userRoles={userRoles}
			userTitles={userTitles}
			deleteUser={deleteUser}
			currentUserRole={MockUserRole.claAdmin}
			allSchools={MockDropSchoolData.result}
			handleDrpChange={handleDrpChange}
			handleDrpRole={handleDrpRole}
			blockedFields={new Set()}
		/>
	);

	item.setState({ show_confirm_dialog: CONFIRM_DIALOG_NONE });
	item.instance().doShowConfirmDelete({ preventDefault: jest.fn() });

	item.instance().doDeleteUser({ preventDefault: jest.fn() });

	expect(deleteUser).toHaveBeenCalled();
});

/** User click on yes from reset password confirmdialog box */
test("User click on yes from reset password confirmdialog box", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKUSERFORMDATA;

	const item = shallow(
		<UserAddEdit
			key={fields.email || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={"Invalid School"}
			fields={fields}
			resetPassword={resetPassword}
			action={ACTION_EDIT}
			userRoles={userRoles}
			userTitles={userTitles}
			deleteUser={deleteUser}
			currentUserRole={MockUserRole.claAdmin}
			allSchools={MockDropSchoolData.result}
			handleDrpChange={handleDrpChange}
			handleDrpRole={handleDrpRole}
			blockedFields={new Set()}
		/>
	);

	item.setState({ show_confirm_dialog: CONFIRM_DIALOG_NONE });
	item.instance().doShowConfirmDelete({ preventDefault: jest.fn() });

	item.instance().doResetPassword({ preventDefault: jest.fn() });
	expect(resetPassword).toHaveBeenCalled();
});

/** User (with cla-admin role) add/edit user with role teacher/school-admin */
test("User (with cla-admin role) add/edit user with role teacher/school-admin", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKUSERFORMDATA;

	const item = shallow(
		<UserAddEdit
			key={fields.email || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			resetPassword={resetPassword}
			action={ACTION_NEW}
			userRoles={userRoles}
			userTitles={userTitles}
			deleteUser={deleteUser}
			currentUserRole={MockUserRole.claAdmin}
			allSchools={MockDropSchoolData.result}
			handleDrpChange={handleDrpChange}
			handleDrpRole={handleDrpRole}
			blockedFields={new Set()}
		/>
	);

	await wait(100);
	item.update();
	item.instance().forceUpdate();
	expect(item.find("AjaxSearchableDropdown").length).toBe(1);
});

/** User (with cla-admin role) add/edit user change role as cla-admin, should not display the School selection */
test("User (with cla-admin role) add/edit user change role as cla-admin", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKUSERFORMDATA;

	const item = shallow(
		<UserAddEdit
			key={fields.email || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			resetPassword={resetPassword}
			action={ACTION_NEW}
			userRoles={userRoles}
			userTitles={userTitles}
			deleteUser={deleteUser}
			currentUserRole={MockUserRole.claAdmin}
			allSchools={MockDropSchoolData.result}
			handleDrpChange={handleDrpChange}
			handleDrpRole={handleDrpRole}
			blockedFields={new Set()}
		/>
	);

	await wait(100);
	item.update();
	item.instance().forceUpdate();

	item.setProps((fields.role = "cla-admin"));

	expect(item.find("SelectSearch").length).toBe(0);
});

/** User (with cla-admin role) add/edit user change role */
test("User (with cla-admin role) add/edit user change role", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKUSERFORMDATA;

	const item = shallow(
		<UserAddEdit
			key={fields.email || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			resetPassword={resetPassword}
			action={ACTION_NEW}
			userRoles={userRoles}
			userTitles={userTitles}
			deleteUser={deleteUser}
			currentUserRole={MockUserRole.claAdmin}
			allSchools={MockDropSchoolData.result}
			handleDrpChange={handleDrpChange}
			handleDrpRole={handleDrpRole}
			blockedFields={new Set()}
		/>
	);

	await wait(100);
	item.update();
	item.instance().doHandleDrpRole({ preventDefault: jest.fn(), target: { value: MockUserRole.schoolAdmin } });

	item.setProps((fields.role = "cla-admin"));

	expect(handleDrpRole).toHaveBeenCalled();
});

/** User modify first name value */
test("User modify first name value", async () => {
	mockFormData = MOCKUSERFORMDATA;

	const item = shallow(
		<UserAddEdit
			key={fields.email || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			resetPassword={resetPassword}
			action={ACTION_NEW}
			userRoles={userRoles}
			userTitles={userTitles}
			deleteUser={deleteUser}
			currentUserRole={MockUserRole.claAdmin}
			allSchools={MockDropSchoolData.result}
			handleDrpChange={handleDrpChange}
			handleDrpRole={handleDrpRole}
			handleNameInputField={handleNameInputField}
			blockedFields={new Set()}
		/>
	);

	await wait(100);
	item.update();
	item.instance().doNameInputFieldChange(inputFieldValue, inputFieldName, true);

	expect(handleNameInputField).toHaveBeenCalled();
});

/** User modify last name value */
test("User modify last name value", async () => {
	mockFormData = MOCKUSERFORMDATA;
	inputFieldName = "last_name";

	const item = shallow(
		<UserAddEdit
			key={fields.email || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			resetPassword={resetPassword}
			action={ACTION_NEW}
			userRoles={userRoles}
			userTitles={userTitles}
			deleteUser={deleteUser}
			currentUserRole={MockUserRole.claAdmin}
			allSchools={MockDropSchoolData.result}
			handleDrpChange={handleDrpChange}
			handleDrpRole={handleDrpRole}
			handleNameInputField={handleNameInputField}
			blockedFields={new Set()}
		/>
	);

	await wait(100);
	item.instance().doNameInputFieldChange(inputFieldValue, inputFieldName, true);

	await wait(50);
	item.update();

	expect(item.state().lastNameisValid).toBe(true);
	expect(handleNameInputField).toHaveBeenCalled();
});

/** User (with cla-admin role) bind the school-admin, teacher, student and cla-admin role */
test("User (with cla-admin role) bind the school-admin, teacher, student and cla-admin role", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKUSERFORMDATA;
	const item = shallow(
		<UserAddEdit
			key={fields.email || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			resetPassword={resetPassword}
			action={ACTION_NEW}
			userRoles={userRoles}
			userTitles={userTitles}
			deleteUser={deleteUser}
			currentUserRole={MockUserRole.claAdmin}
			allSchools={MockDropSchoolData.result}
			handleDrpChange={handleDrpChange}
			handleDrpRole={handleDrpRole}
			blockedFields={new Set()}
		/>
	);

	await wait(100);
	item.update();
	item.instance().forceUpdate();
	expect(item.find("FormCustomSelect").first().children("option").length).toBe(4);
});

/** User (with cla-admin role) bind the school-admin, teacher, student and cla-admin role */
test("User (with school-admin role) bind the school-admin, teacher, and student role", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKUSERFORMDATA;
	let mockUserRoles = userRoles.filter((x) => x.id !== "cla-admin");
	const item = shallow(
		<UserAddEdit
			key={fields.email || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			resetPassword={resetPassword}
			action={ACTION_NEW}
			userRoles={mockUserRoles}
			userTitles={userTitles}
			deleteUser={deleteUser}
			currentUserRole={MockUserRole.schoolAdmin}
			allSchools={MockDropSchoolData.result}
			handleDrpChange={handleDrpChange}
			handleDrpRole={handleDrpRole}
			blockedFields={new Set()}
		/>
	);

	await wait(100);
	item.update();
	item.instance().forceUpdate();
	expect(item.find("FormCustomSelect").first().children("option").length).toBe(3);
});

/** User (with school-admin/teacher role) then bind school-name value in input filed */
test("User (with school-admin/teacher role) then bind school-name value in input filed", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKUSERFORMDATA;
	let mockUserRoles = userRoles.filter((x) => x.id !== "cla-admin");
	const item = shallow(
		<UserAddEdit
			key={fields.email || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			resetPassword={resetPassword}
			action={ACTION_EDIT}
			userRoles={mockUserRoles}
			userTitles={userTitles}
			deleteUser={deleteUser}
			currentUserRole={MockUserRole.claAdmin}
			allSchools={MockDropSchoolData.result}
			handleDrpChange={handleDrpChange}
			handleDrpRole={handleDrpRole}
			blockedFields={new Set()}
		/>
	);
	await wait(100);

	expect(item.find("[name='school']").length).toBe(1);
});
