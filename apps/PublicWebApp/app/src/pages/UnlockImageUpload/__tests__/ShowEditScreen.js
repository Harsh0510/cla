// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow, mount } from "enzyme";
import ShowEditScreen from "../ShowEditScreen";
import MockUserRole from "../../../mocks/MockUserRole";

const STATUS_Pending = "pending";
const STATUS_Awaiting = "awaiting";
const STATUS_Rejected = "rejected";
const STATUS_Approved = "approved";
const STATUS_ApprovedPending = "approved-pending";

let MOCKIMAGEUPLOADFORMDATA = [
	{
		oid: "cc931bb3ea6972a6bc339fb42d806add3466",
		date_created: "2020-03-31T09:59:00.570Z",
		user_id: 605,
		status: "awaiting",
		date_closed: "2020-03-31T09:59:00.570Z",
		rejection_reason: null,
		pdf_isbn13: null,
		user_email_log: "brad.scott@cla.co.uk",
		school_name_log: "Custom House (CLA) School",
		url: "https://dummyimage.com/600x400/ff00ff/0000ff.jpg&text=11",
	},
];
let props = {
	oid: "cc931bb3ea6972a6bc339fb42d806add3466",
	date_created: "2020-03-31T09:59:00.570Z",
	user_id: 605,
	status: "awaiting",
	date_closed: "2020-03-31T09:59:00.570Z",
	rejection_reason: null,
	pdf_isbn13: null,
	user_email_log: "brad.scott@cla.co.uk",
	school_name_log: "Custom House (CLA) School",
	url: "https://dummyimage.com/600x400/ff00ff/0000ff.jpg&text=11",
};

/** Mock user data */
let mockUserData = {
	first_name: "Test",
	last_name: "Surname",
	role: "cla-admin",
	school: null,
};
let fields, message, examBoards, keyStages, ACTION_NEW, ACTION_EDIT, CONFIRM_DIALOG_DELETE, CONFIRM_DIALOG_NONE, mockFormData;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

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

/** wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	fields = MOCKIMAGEUPLOADFORMDATA;
	(message = ""), (ACTION_EDIT = "edit");
	mockFormData = [];
}

beforeEach(resetAll);
afterEach(resetAll);

/**Pops Mock function */
const handleSubmit = jest.fn();
const cancelAddEdit = jest.fn();
const deleteClass = jest.fn();
const handleDrpChange = jest.fn();
const handleNameInputField = jest.fn();

/** Component renders correctly */
test("Component renders correctly ", async () => {
	fields = MOCKIMAGEUPLOADFORMDATA;
	const item = mount(
		<ShowEditScreen
			key={"form_" + fields.oid}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			action={ACTION_EDIT}
			deleteClass={deleteClass}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
		/>
	);
	expect(item.find("WrapForm").length).toBe(1);
});

/** User click on edit icon from the listing page, It should display the update-class button in form*/
test("User click on edit icon from the listing page, It should display the Approve and Reject BUtton Form Model", async () => {
	fields = MOCKIMAGEUPLOADFORMDATA;
	const item = mount(
		<ShowEditScreen
			key={"form_" + fields.oid}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			action={ACTION_EDIT}
			deleteClass={deleteClass}
			currentUserRole={MockUserRole.claAdmin}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
		/>
	);
	expect(item.find("ImageWrapper img").src).not.toBeNull();
	expect(item.find('button[name="Approve"]').length).toBe(1);
	expect(item.find('button[name="Reject"]').length).toBe(1);
});

test("Test the Loader", async () => {
	fields = MOCKIMAGEUPLOADFORMDATA;
	const item = mount(
		<ShowEditScreen
			key={"form_" + fields.oid}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			action={ACTION_EDIT}
			deleteClass={deleteClass}
			isInProcess={true}
			currentUserRole={MockUserRole.claAdmin}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
		/>
	);
	expect(item.find("WrapLoader").length).toBe(1);
});

test("Test with Field Status Reject", async () => {
	fields = MOCKIMAGEUPLOADFORMDATA;
	fields[0].status = "reject";
	const item = mount(
		<ShowEditScreen
			key={"form_" + fields.oid}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			action={ACTION_EDIT}
			deleteClass={deleteClass}
			currentUserRole={MockUserRole.claAdmin}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
		/>
	);
	expect(item.find("ImageWrapper img").src).not.toBeNull();
	expect(item.find('button[name="Approve"]').prop("disabled")).toBe(true);
	expect(item.find('button[name="Reject"]').prop("disabled")).toBe(true);
});

test("Test the edit with status awaiting and click on Approve with pdf isbn blank", async () => {
	fields = MOCKIMAGEUPLOADFORMDATA;
	const item = mount(
		<ShowEditScreen
			key={"form_" + fields.oid}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			action={ACTION_EDIT}
			deleteClass={deleteClass}
			isInProcess={true}
			currentUserRole={MockUserRole.claAdmin}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
		/>
	);
	item.instance().doHandleApproveSubmit();
	expect(item.state().pdf_isbn13).toEqual(false);
	expect(item.state().rejection_reason).toEqual(true);
});

test("Test the edit with status awaiting and click on Approve with pdf isbn blank", async () => {
	fields = MOCKIMAGEUPLOADFORMDATA;
	fields[0].pdf_isbn13 = "99999999999999";
	const item = mount(
		<ShowEditScreen
			key={"form_" + fields.oid}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			action={ACTION_EDIT}
			deleteClass={deleteClass}
			isInProcess={true}
			currentUserRole={MockUserRole.claAdmin}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
		/>
	);
	item.instance().doHandleApproveSubmit(handleSubmit());
	expect(item.prop("message")).toEqual(null);
});

test("Test the edit with status awaiting and click on Reject with reason blank", async () => {
	fields = MOCKIMAGEUPLOADFORMDATA;
	fields[0].rejection_reason = "";
	const item = mount(
		<ShowEditScreen
			key={"form_" + fields.oid}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			action={ACTION_EDIT}
			deleteClass={deleteClass}
			isInProcess={true}
			currentUserRole={MockUserRole.claAdmin}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
		/>
	);
	item.instance().doHandleRejectSubmit(handleSubmit());
	expect(item.prop("message")).toEqual(null);
});

test("Test Change the ISBN Number invalid", async () => {
	fields = MOCKIMAGEUPLOADFORMDATA;
	fields[0].rejection_reason = "";
	const item = mount(
		<ShowEditScreen
			key={"form_" + fields.oid}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			action={ACTION_EDIT}
			deleteClass={deleteClass}
			isInProcess={true}
			currentUserRole={MockUserRole.claAdmin}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
		/>
	);

	item.instance().doNameInputFieldChange("99999999999999999", item.find('input[name="pdf_isbn13"]'));
	expect(item.state().rejection_reason).toEqual(true);
});

test("Test to check the message field", async () => {
	fields = MOCKIMAGEUPLOADFORMDATA;
	fields[0].rejection_reason = "";
	const item = mount(
		<ShowEditScreen
			key={"form_" + fields.oid}
			cancelAddEdit={cancelAddEdit}
			message="ISBN not valid"
			fields={fields}
			action={ACTION_EDIT}
			deleteClass={deleteClass}
			isInProcess={true}
			currentUserRole={MockUserRole.claAdmin}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
		/>
	);
	item.instance().doNameInputFieldChange("99999999999999999", item.find('input[name="pdf_isbn13"]'));
	expect(item.prop("message")).toEqual("ISBN not valid");
});

test("test validate ISBN and Rejection reason error message", async () => {
	fields = MOCKIMAGEUPLOADFORMDATA;
	const item = mount(
		<ShowEditScreen
			key={"form_" + fields.oid}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			action={ACTION_EDIT}
			deleteClass={deleteClass}
			isInProcess={true}
			currentUserRole={MockUserRole.claAdmin}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
		/>
	);
	const pdf_isbn13 = item.find('input[name="pdf_isbn13"]');
	pdf_isbn13.simulate("change", {
		target: {
			name: "pdf_isbn13",
			value: "999999999999999999999999",
		},
	});
	expect(item.state().pdf_isbn13).toEqual(true);
	const rejection_reason = item.find('input[name="rejection_reason"]');
	rejection_reason.simulate("change", {
		target: {
			name: "pdf_isbn13",
			value:
				"dsdsdsdsdsdsdsdsdsdsdsdsddsdsdsdsdsdsdsdsdsdsdsdsdsdsdsdsdsdsdssdsdsdsdsdsdsdsdssddsdsddsdsdsssssssssssssssssssssssssssssssssssssssssssssssdsdsdsdsdsds",
		},
	});
	expect(item.state().rejection_reason).toEqual(true);
});

test("User edit upload images", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKIMAGEUPLOADFORMDATA;
	mockFormData[0].pdf_isbn13 = "9781471803048";
	fields = mockFormData;
	const item = mount(
		<ShowEditScreen
			key={"form_" + fields.oid}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			action={ACTION_EDIT}
			deleteClass={deleteClass}
			isInProcess={true}
			currentUserRole={MockUserRole.claAdmin}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
		/>
	);
	item.instance().doHandleApproveSubmit({ preventDefault: jest.fn() });
	expect(handleSubmit).toBeCalled();
});

/* Change the props value and called the component did update event */
test("Change the props value and called the component did update event", async () => {
	const item = mount(
		<ShowEditScreen
			key={"form_" + fields.oid}
			cancelAddEdit={cancelAddEdit}
			message="test"
			fields={fields}
			action={ACTION_EDIT}
			deleteClass={deleteClass}
			isInProcess={true}
			currentUserRole={MockUserRole.claAdmin}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
		/>
	);
	item.setProps({
		message: "test2",
	});
	expect(item.state().rejection_reason).toEqual(true);
	expect(item.state().pdf_isbn13).toEqual(true);
});
