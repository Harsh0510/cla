// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import TrustedDomainAddEdit from "../TrustedDomainAddEdit";
import MockSchoolList from "../../../mocks/mockSchoolList";
import MockUserRole from "../../../mocks/MockUserRole";
import MockUser from "../../../mocks/MockUser";

let MOCKFORMDATA = [
	{
		name: "oid",
		value: "2",
	},
	{
		name: "school_id",
		value: "abc",
	},
	{
		name: "domain",
		value: "best.com",
	},
];

let fields, message, ACTION_NEW, ACTION_EDIT, CONFIRM_DIALOG_DELETE, CONFIRM_DIALOG_NONE, mockFormData, mockUserData;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withAdminAuthRequiredConsumer", () => mockPassthruHoc);
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

/** wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/** resetAll for reset the values */
function resetAll() {
	(fields = {
		oid: 0,
		school_id: "",
		domain: "",
	}),
		(message = null),
		(ACTION_NEW = "new");
	ACTION_EDIT = "edit";
	CONFIRM_DIALOG_DELETE = "delete";
	CONFIRM_DIALOG_NONE = "";
	mockFormData = [];
	mockUserData = MockUser[0];
	mockUserData.role = MockUserRole.claAdmin;
}

beforeEach(resetAll);
afterEach(resetAll);

/**Pops Mock function */
const deleteData = jest.fn();
const handleDrpChange = jest.fn();
const handleSubmit = jest.fn();
const cancelAddEdit = jest.fn();

/** Component renders correctly */
test("Component renders correctly ", async () => {
	const item = mount(
		<TrustedDomainAddEdit
			key={fields.oid || "__NEW__"}
			message={message}
			fields={fields}
			action={ACTION_NEW}
			allSchools={MockSchoolList}
			deleteData={deleteData}
			handleDrpChange={handleDrpChange}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
		/>
	);

	expect(item.find("FormWrapAddEdit").length).toBe(1);
});

/** User click on create button from above the listing page, It should display the create button in form*/
test("User click on create button from above the listing page, It should display the create button in form", async () => {
	const item = mount(
		<TrustedDomainAddEdit
			key={fields.oid || "__NEW__"}
			message={message}
			fields={fields}
			action={ACTION_NEW}
			allSchools={MockSchoolList}
			deleteData={deleteData}
			handleDrpChange={handleDrpChange}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
		/>
	);

	expect(item.find('button[name="create-TrustedDomain"]').length).toBe(1);
});

/** User click on edit icon from the listing page, It should display the update button in form*/
test("User click on edit icon from the listing page, It should display the update button in form", async () => {
	fields = {
		oid: 1,
		school_id: 2,
		domain: "email.com",
	};
	const item = mount(
		<TrustedDomainAddEdit
			key={fields.oid || "__NEW__"}
			message={message}
			fields={fields}
			action={ACTION_EDIT}
			allSchools={MockSchoolList}
			deleteData={deleteData}
			handleDrpChange={handleDrpChange}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
		/>
	);

	expect(item.find('button[name="update-TrustedDomain"]').length).toBe(1);
});

/** User click on delete button and it should be display the confirmation dialog box */
test("User click on delete button and it should be display the confirmation dialog box ", async () => {
	fields = {
		oid: 1,
		school_id: 2,
		domain: "email.com",
	};
	const item = mount(
		<TrustedDomainAddEdit
			key={fields.oid || "__NEW__"}
			message={message}
			fields={fields}
			action={ACTION_EDIT}
			allSchools={MockSchoolList}
			deleteData={deleteData}
			handleDrpChange={handleDrpChange}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
		/>
	);

	expect(item.find('button[name="update-TrustedDomain"]').length).toBe(1);
	item.setState({ show_confirm_dialog: CONFIRM_DIALOG_NONE });
	item.instance().doShowConfirmDelete({ preventDefault: jest.fn() });
	expect(item.state().show_confirm_dialog).toEqual(CONFIRM_DIALOG_DELETE);
	await wait(100);
	item.update();
	expect(item.find('button[name="delete-Confirm"]').length).toBe(1);
	expect(item.find('button[name="delete-Cancel"]').length).toBe(1);
});

/** User click on no button from delete dailog box */
test("User click on no button from delete dailog box", async () => {
	fields = {
		oid: 1,
		school_id: 2,
		domain: "email.com",
	};
	const item = mount(
		<TrustedDomainAddEdit
			key={fields.oid || "__NEW__"}
			message={message}
			fields={fields}
			action={ACTION_EDIT}
			allSchools={MockSchoolList}
			deleteData={deleteData}
			handleDrpChange={handleDrpChange}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
		/>
	);

	item.setState({ show_confirm_dialog: CONFIRM_DIALOG_DELETE });
	item.instance().doDismissRejectDialog({ preventDefault: jest.fn() });

	await wait(50);
	item.update();

	expect(item.state().show_confirm_dialog).toEqual(CONFIRM_DIALOG_NONE);
	expect(item.find('button[name="delete-Confirm"]').length).toBe(0);
	expect(item.find('button[name="delete-Cancel"]').length).toBe(0);
});

/** User click on yes button from delete dailog box */
test("User click on yes button from delete dailog box ", async () => {
	fields = {
		oid: 1,
		school_id: 2,
		domain: "email.com",
	};
	const item = mount(
		<TrustedDomainAddEdit
			key={fields.oid || "__NEW__"}
			message={message}
			fields={fields}
			action={ACTION_EDIT}
			allSchools={MockSchoolList}
			deleteData={deleteData}
			handleDrpChange={handleDrpChange}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
		/>
	);

	item.setState({ show_confirm_dialog: CONFIRM_DIALOG_NONE });
	//item.instance().doShowConfirmDelete({ preventDefault: jest.fn()});
	item.instance().doDelete({ preventDefault: jest.fn() });

	//expect(item.state().show_confirm_dialog).toEqual(CONFIRM_DIALOG_DELETE);
	expect(deleteData).toHaveBeenCalled();
});

/** User click submit for create a new domain */
test("User click on submit for create a new domain", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKFORMDATA;

	const item = mount(
		<TrustedDomainAddEdit
			key={fields.oid || "__NEW__"}
			message={message}
			fields={fields}
			action={ACTION_EDIT}
			allSchools={MockSchoolList}
			deleteData={deleteData}
			handleDrpChange={handleDrpChange}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
		/>
	);

	const form = item.find("form");

	form.simulate("submit", {
		preventDefault: mockCall,
		target: [mockFormData],
		relatedTarget: { value: "create-TrustedDomain" },
	});

	expect(handleSubmit).toBeCalled();
});

/** User click on submit for update domain details */
test("User click on submit for update domain details", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKFORMDATA;

	const item = mount(
		<TrustedDomainAddEdit
			key={fields.oid || "__NEW__"}
			message={message}
			fields={fields}
			action={ACTION_EDIT}
			allSchools={MockSchoolList}
			deleteData={deleteData}
			handleDrpChange={handleDrpChange}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
		/>
	);

	const form = item.find("form");

	form.simulate("submit", {
		preventDefault: mockCall,
		target: [mockFormData],
		relatedTarget: { value: "update-TrustedDomain" },
	});

	expect(handleSubmit).toBeCalled();
});

/** User click on submit Get success/update/error message*/
test("User click on submit get message", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKFORMDATA;
	message = "";
	fields = {
		oid: 1,
		school_id: 2,
		domain: "email.com",
	};
	const item = mount(
		<TrustedDomainAddEdit
			key={fields.oid || "__NEW__"}
			message={message}
			fields={fields}
			action={ACTION_EDIT}
			allSchools={MockSchoolList}
			deleteData={deleteData}
			handleDrpChange={handleDrpChange}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
		/>
	);

	const form = item.find("form");

	form.simulate("submit", {
		preventDefault: mockCall,
		target: [mockFormData],
		relatedTarget: { value: "create-TrustedDomain" },
	});
	item.setProps({ message: "Trusted Domain updated successfully" });

	expect(item.find("FormMessage").length).toEqual(1);
});

/** User enter the domain name*/
test("User enter the domain name", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKFORMDATA;
	message = "";
	fields = {
		oid: 1,
		school_id: 2,
		domain: "",
	};
	const item = mount(
		<TrustedDomainAddEdit
			key={fields.oid || "__NEW__"}
			message={message}
			fields={fields}
			action={ACTION_EDIT}
			allSchools={MockSchoolList}
			deleteData={deleteData}
			handleDrpChange={handleDrpChange}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			handleDomainChange={mockCall}
		/>
	);

	const domain = item.find('input[name="domain"]');

	domain.simulate("change", {
		target: {
			name: "domain",
			value: "ddgg",
		},
	});

	expect(item.state().domain_field_error).toEqual(null);
});

/** User enter the domain name*/
test("User enter the invalid domain name", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKFORMDATA;
	message = "";
	fields = {
		oid: 1,
		school_id: 2,
		domain: "",
	};
	const item = mount(
		<TrustedDomainAddEdit
			key={fields.oid || "__NEW__"}
			message={message}
			fields={fields}
			action={ACTION_EDIT}
			allSchools={MockSchoolList}
			deleteData={deleteData}
			handleDrpChange={handleDrpChange}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			handleDomainChange={mockCall}
		/>
	);

	const domain = item.find('input[name="domain"]');

	domain.simulate("change", {
		target: {
			name: "domain",
			value: " ",
		},
	});

	expect(item.state().domain_field_error).toEqual("spaces not allowed");
});
