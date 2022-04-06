// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import SchoolAddEdit from "../SchoolAddEdit";

//get data from controller/app/common
const TERRITORIES = require("../../../../../../Controller/app/common/territories");
const SCHOOLLEVELS = require("../../../../../../Controller/app/common/school-levels");
const SCHOOLTYPES = require("../../../../../../Controller/app/common/school-types");

let MOCKSCHOOLFORMDATA = [
	{
		name: "id",
		value: "1",
	},
	{
		name: "identifier",
		value: "idn001",
	},
	{
		name: "name",
		value: "CLA School",
	},
	{
		name: "address1",
		value: "address line 1",
	},
	{
		name: "address2",
		value: "address line 2",
	},
	{
		name: "city",
		value: "[city]",
	},
	{
		name: "county",
		value: "[county]",
	},
	{
		name: "post_code",
		value: "555-dd45",
	},
	{
		name: "territory",
		value: "england",
	},
	{
		name: "local_authority",
		value: "local auth",
	},
	{
		name: "school_level",
		value: "primary",
	},
	{
		name: "school_type",
		value: "college",
	},
	{
		name: "school_home_page",
		value: "[school home page]",
	},
	{
		name: "number_of_students",
		value: "100",
	},
	{
		name: "gsg",
		value: "100",
	},
	{
		name: "dfe",
		value: "100",
	},
	{
		name: "seed",
		value: "100",
	},
	{
		name: "nide",
		value: "100",
	},
	{
		name: "hwb_identifier",
		value: "100",
	},
];

/** Mock data variables*/
let mockUserData,
	fields,
	message,
	examBoards,
	ACTION_NEW,
	ACTION_EDIT,
	CONFIRM_DIALOG_DELETE,
	CONFIRM_DIALOG_NONE,
	mockFormData,
	territories,
	schoolLevels,
	schoolTypes,
	mockDeleteTitle,
	mockInputFieldName,
	mockhandleNameInputField,
	props;

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
		id: "",
		identifier: "",
		name: "",
		address1: "",
		address2: "",
		city: "",
		county: "",
		post_code: "",
		territory: "",
		local_authority: "",
		school_level: "",
		school_type: "",
		school_home_page: "",
		number_of_students: "",
		gsg: "",
		dfe: "",
		seed: "",
		nide: "",
		hwb_identifier: "",
	}),
		(message = ""),
		(territories = TERRITORIES),
		(schoolLevels = SCHOOLLEVELS),
		(schoolTypes = SCHOOLTYPES),
		(ACTION_NEW = "new");
	ACTION_EDIT = "edit";
	CONFIRM_DIALOG_DELETE = "delete";
	CONFIRM_DIALOG_NONE = "";
	mockFormData = [];
	mockDeleteTitle = "Are you sure you wish to delete this institution? This action is irreversible, please be sure.";
	mockhandleNameInputField = jest.fn();
	mockInputFieldName = {
		name: "name",
		identifier: "identifier",
		address1: "address1",
		address2: "address2",
		city: "city",
		post_code: "post_code",
		local_authority: "local_authority",
		gsg: "A",
		dfe: "TS",
		seed: "C",
		nide: "nide",
		hwb_identifier: "hwb",
	};
	props = {
		blockedFields: {
			has: jest.fn(),
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/**Pops Mock function */
const handleSubmit = jest.fn();
const cancelAddEdit = jest.fn();
const deleteSchool = jest.fn();

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(
		<SchoolAddEdit
			key={fields.id || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_NEW}
			deleteSchool={deleteSchool}
			territories={territories}
			schoolLevels={schoolLevels}
			schoolTypes={schoolTypes}
			error={true}
			{...props}
		/>
	);

	expect(item.find("FormWrapAddEdit").length).toBe(1);
});

/** Render "Create school" button while user create School */
test('Render "Create school" button while user create School', async () => {
	const item = shallow(
		<SchoolAddEdit
			key={fields.id || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_NEW}
			deleteSchool={deleteSchool}
			territories={territories}
			schoolLevels={schoolLevels}
			schoolTypes={schoolTypes}
			{...props}
		/>
	);

	expect(item.find('[name="create-school"]').length).toBe(1);
});

/** Render "Update" button while user edit School */
test('Render "Update" button while user edit School', async () => {
	fields = {
		id: 1,
		identifier: "test01",
		name: "School Name 01",
		address1: "address line 1",
		address2: "asd",
		city: "city",
		county: "india",
		post_code: "zz-aaa",
		territory: "england",
		local_authority: "local auth",
		school_level: "primary",
		school_type: "college",
		school_home_page: "School home page",
		number_of_students: 10,
		gsg: "A",
		dfe: "TS",
		seed: "C",
		nide: "nide",
		hwb_identifier: "hwb",
	};

	const item = shallow(
		<SchoolAddEdit
			key={fields.id || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteSchool={deleteSchool}
			territories={territories}
			schoolLevels={schoolLevels}
			schoolTypes={schoolTypes}
			{...props}
		/>
	);

	expect(item.find('[name="update-school"]').length).toBe(1);
});

/** User click on delete button and display the confirmation dialog box */
test("User click on delete button ", async () => {
	fields = {
		id: 1,
		identifier: "test01",
		name: "School Name 01",
		address1: "address line 1",
		address2: "asd",
		city: "city",
		county: "india",
		post_code: "zz-aaa",
		territory: "england",
		local_authority: "local auth",
		school_level: "primary",
		school_type: "college",
		school_home_page: "School home page",
		number_of_students: 10,
		gsg: "A",
		dfe: "TS",
		seed: "C",
		nide: "nide",
		hwb_identifier: "hwb",
	};

	const item = shallow(
		<SchoolAddEdit
			key={fields.id || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteSchool={deleteSchool}
			territories={territories}
			schoolLevels={schoolLevels}
			schoolTypes={schoolTypes}
			{...props}
		/>
	);

	item.setState({ show_confirm_dialog: CONFIRM_DIALOG_NONE });
	item.instance().doShowConfirmDelete({ preventDefault: jest.fn() });

	expect(item.state().show_confirm_dialog).toEqual(CONFIRM_DIALOG_DELETE);
	// expect(deleteSchool).toHaveBeenCalled();
});

/** User click on no button from delete dailog box */
test("User click on no button from delete dailog box", async () => {
	fields = {
		id: 1,
		identifier: "test01",
		name: "School Name 01",
		address1: "address line 1",
		address2: "asd",
		city: "city",
		county: "india",
		post_code: "zz-aaa",
		territory: "england",
		local_authority: "local auth",
		school_level: "primary",
		school_type: "college",
		school_home_page: "School home page",
		number_of_students: 10,
		gsg: "A",
		dfe: "TS",
		seed: "C",
		nide: "nide",
		hwb_identifier: "hwb",
	};

	const item = shallow(
		<SchoolAddEdit
			key={fields.id || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteSchool={deleteSchool}
			territories={territories}
			schoolLevels={schoolLevels}
			schoolTypes={schoolTypes}
			{...props}
		/>
	);

	item.setState({ show_confirm_dialog: CONFIRM_DIALOG_DELETE });
	item.instance().doDismissRejectDialog({ preventDefault: jest.fn() });

	expect(item.state().show_confirm_dialog).toEqual(CONFIRM_DIALOG_NONE);
});

/** User click on delete button and display the confirmation dialog box */
test('User click on "yes" button from delete confirmation dialog box', async () => {
	fields = {
		id: 1,
		identifier: "test01",
		name: "School Name 01",
		address1: "address line 1",
		address2: "asd",
		city: "city",
		county: "india",
		post_code: "zz-aaa",
		territory: "england",
		local_authority: "local auth",
		school_level: "primary",
		school_type: "college",
		school_home_page: "School home page",
		number_of_students: 10,
		gsg: "A",
		dfe: "TS",
		seed: "C",
		nide: "nide",
		hwb_identifier: "hwb",
	};

	const item = shallow(
		<SchoolAddEdit
			key={fields.id || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteSchool={deleteSchool}
			territories={territories}
			schoolLevels={schoolLevels}
			schoolTypes={schoolTypes}
			{...props}
		/>
	);

	item.setState({ show_confirm_dialog: CONFIRM_DIALOG_NONE });
	item.instance().doShowConfirmDelete({ preventDefault: jest.fn() });

	item.instance().doDelete({ preventDefault: jest.fn() });

	expect(item.find("FormConfirmBoxText").text()).toEqual(mockDeleteTitle);
	expect(item.find("FormConfirmBox").length).toBe(1);
	expect(deleteSchool).toHaveBeenCalled();
});

/** User enter invalid number_of_students value **/
test("User enter invalid number_of_students value", async () => {
	const item = shallow(
		<SchoolAddEdit
			key={fields.id || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_NEW}
			deleteSchool={deleteSchool}
			territories={territories}
			schoolLevels={schoolLevels}
			schoolTypes={schoolTypes}
			{...props}
		/>
	);

	const number_of_students = item.find('[name="number_of_students"]');

	number_of_students.simulate("change", {
		target: {
			name: "number_of_students",
			value: "ddgg",
		},
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().number_field_error).toEqual("The number of students must be a number between 1 and 9999");
});

/** User enter valid number_of_students value **/
test("User enter valid number_of_students value", async () => {
	const item = shallow(
		<SchoolAddEdit
			key={fields.id || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_NEW}
			deleteSchool={deleteSchool}
			territories={territories}
			schoolLevels={schoolLevels}
			schoolTypes={schoolTypes}
			{...props}
		/>
	);

	const number_of_students = item.find('[name="number_of_students"]');

	number_of_students.simulate("change", {
		target: {
			name: "number_of_students",
			value: "50",
		},
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().number_field_error).toEqual(null);
});

/** User enter 100000 in number_of_students input */
test("User enter 100000 in number_of_students input", async () => {
	const item = shallow(
		<SchoolAddEdit
			key={fields.id || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_NEW}
			deleteSchool={deleteSchool}
			territories={territories}
			schoolLevels={schoolLevels}
			schoolTypes={schoolTypes}
			{...props}
		/>
	);

	const number_of_students = item.find('[name="number_of_students"]');

	number_of_students.simulate("change", {
		target: {
			name: "number_of_students",
			value: "100000",
		},
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().number_field_error).toEqual("The number of students must be a number between 1 and 9999");
});

/** User click submit for create a new school */
test("User click on submit for create a new school", async () => {
	mockFormData = MOCKSCHOOLFORMDATA;

	const item = shallow(
		<SchoolAddEdit
			key={fields.id || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_NEW}
			deleteSchool={deleteSchool}
			territories={territories}
			schoolLevels={schoolLevels}
			schoolTypes={schoolTypes}
			{...props}
		/>
	);

	const form = item.find("FormWrapAddEdit");
	form.simulate("submit", {
		preventDefault: jest.fn(),
		target: [mockFormData],
		relatedTarget: { value: "create-class" },
	});

	expect(handleSubmit).toBeCalled();
});

/** User click on submit for update school details */
test("User click on submit for update school details", async () => {
	mockFormData = MOCKSCHOOLFORMDATA;

	const item = shallow(
		<SchoolAddEdit
			key={fields.id || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteSchool={deleteSchool}
			territories={territories}
			schoolLevels={schoolLevels}
			schoolTypes={schoolTypes}
			{...props}
		/>
	);

	const form = item.find("FormWrapAddEdit");
	await wait(50);
	item.update();

	form.simulate("submit", {
		preventDefault: jest.fn(),
		target: [mockFormData],
		relatedTarget: { value: "update-class" },
	});

	expect(handleSubmit).toBeCalled();
});

/** User click on submit for delete school details */
test("User click on submit for delete school details", async () => {
	mockFormData = MOCKSCHOOLFORMDATA;

	const item = shallow(
		<SchoolAddEdit
			key={fields.id || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteSchool={deleteSchool}
			territories={territories}
			schoolLevels={schoolLevels}
			schoolTypes={schoolTypes}
			{...props}
		/>
	);

	const form = item.find("FormWrapAddEdit");
	await wait(50);
	item.update();

	form.simulate("submit", {
		preventDefault: jest.fn(),
		target: [mockFormData],
		relatedTarget: { value: "delete-class" },
	});

	expect(deleteSchool).toBeCalled();
});

/** User get success message */
test("User click on submit for update school details", async () => {
	mockFormData = MOCKSCHOOLFORMDATA;
	message = "Successfully updated.";
	const item = shallow(
		<SchoolAddEdit
			key={fields.id || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteSchool={deleteSchool}
			territories={territories}
			schoolLevels={schoolLevels}
			schoolTypes={schoolTypes}
			{...props}
		/>
	);

	expect(item.find("FormMessage").length).toEqual(1);
});

/** User Change the value of school name field*/
test("User Change the value of school name field", async () => {
	mockFormData = MOCKSCHOOLFORMDATA;
	const item = shallow(
		<SchoolAddEdit
			key={fields.id || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteSchool={deleteSchool}
			territories={territories}
			schoolLevels={schoolLevels}
			schoolTypes={schoolTypes}
			handleNameInputField={mockhandleNameInputField}
			{...props}
		/>
	);
	//before the function called we set the all fields invalid
	item.setState({ name: false });
	await wait(30);
	item.update();
	item.instance().forceUpdate();
	item.instance().doNameInputFieldChange("Test School", mockInputFieldName.name, true);
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(mockhandleNameInputField).toHaveBeenCalled();
	expect(item.state().isFormValid).toBe(true);
	expect(item.state().name).toBe(true);
});

/** User Change the value of identifier field */
test("User Change the value of identifier field", async () => {
	mockFormData = MOCKSCHOOLFORMDATA;
	const item = shallow(
		<SchoolAddEdit
			key={fields.id || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteSchool={deleteSchool}
			territories={territories}
			schoolLevels={schoolLevels}
			schoolTypes={schoolTypes}
			handleNameInputField={mockhandleNameInputField}
			{...props}
		/>
	);
	//before the function called we set the all fields invalid
	item.setState({ identifier: false });
	await wait(30);
	item.update();
	item.instance().forceUpdate();
	item.instance().doNameInputFieldChange("12345", mockInputFieldName.identifier, true);
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(mockhandleNameInputField).toHaveBeenCalled();
	expect(item.state().isFormValid).toBe(true);
	expect(item.state().identifier).toBe(true);
});

/** User Change the value of address1 field */
test("User Change the value of address1 field", async () => {
	mockFormData = MOCKSCHOOLFORMDATA;
	const item = shallow(
		<SchoolAddEdit
			key={fields.id || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteSchool={deleteSchool}
			territories={territories}
			schoolLevels={schoolLevels}
			schoolTypes={schoolTypes}
			handleNameInputField={mockhandleNameInputField}
			{...props}
		/>
	);
	//before the function called we set the all fields invalid
	item.setState({ address1: false });
	await wait(30);
	item.update();
	item.instance().forceUpdate();
	item.instance().doNameInputFieldChange("address1", mockInputFieldName.address1, true);
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(mockhandleNameInputField).toHaveBeenCalled();
	expect(item.state().isFormValid).toBe(true);
	expect(item.state().address1).toBe(true);
});

/** User Change the value of address2 field */
test("User Change the value of address2 field", async () => {
	mockFormData = MOCKSCHOOLFORMDATA;
	const item = shallow(
		<SchoolAddEdit
			key={fields.id || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteSchool={deleteSchool}
			territories={territories}
			schoolLevels={schoolLevels}
			schoolTypes={schoolTypes}
			handleNameInputField={mockhandleNameInputField}
			{...props}
		/>
	);
	//before the function called we set the all fields invalid
	item.setState({ address2: false });
	await wait(30);
	item.update();
	item.instance().forceUpdate();
	item.instance().doNameInputFieldChange("address2", mockInputFieldName.address2, true);
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(mockhandleNameInputField).toHaveBeenCalled();
	expect(item.state().isFormValid).toBe(true);
	expect(item.state().address2).toBe(true);
});

/** User Change the value of city field */
test("User Change the value of city field", async () => {
	mockFormData = MOCKSCHOOLFORMDATA;
	const item = shallow(
		<SchoolAddEdit
			key={fields.id || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteSchool={deleteSchool}
			territories={territories}
			schoolLevels={schoolLevels}
			schoolTypes={schoolTypes}
			handleNameInputField={mockhandleNameInputField}
			{...props}
		/>
	);
	//before the function called we set the all fields invalid
	item.setState({ city: false });
	await wait(30);
	item.update();
	item.instance().forceUpdate();
	item.instance().doNameInputFieldChange("USA", mockInputFieldName.city, true);
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(mockhandleNameInputField).toHaveBeenCalled();
	expect(item.state().isFormValid).toBe(true);
	expect(item.state().city).toBe(true);
});

/** User Change the value of post_code field */
test("User Change the value of post_code field", async () => {
	mockFormData = MOCKSCHOOLFORMDATA;
	const item = shallow(
		<SchoolAddEdit
			key={fields.id || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteSchool={deleteSchool}
			territories={territories}
			schoolLevels={schoolLevels}
			schoolTypes={schoolTypes}
			handleNameInputField={mockhandleNameInputField}
			{...props}
		/>
	);
	//before the function called we set the all fields invalid
	item.setState({ post_code: false });
	await wait(30);
	item.update();
	item.instance().forceUpdate();
	item.instance().doNameInputFieldChange("1321321", mockInputFieldName.post_code, true);
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(mockhandleNameInputField).toHaveBeenCalled();
	expect(item.state().isFormValid).toBe(true);
	expect(item.state().post_code).toBe(true);
});

/** User change the local_authority and get invalid filed */
test("User change the local_authority and get invalid filed", async () => {
	mockFormData = MOCKSCHOOLFORMDATA;
	const item = shallow(
		<SchoolAddEdit
			key={fields.id || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteSchool={deleteSchool}
			territories={territories}
			schoolLevels={schoolLevels}
			schoolTypes={schoolTypes}
			handleNameInputField={mockhandleNameInputField}
			{...props}
		/>
	);
	//before the function called we set the all fields invalid
	item.setState({ local_authority: true });
	await wait(30);
	item.update();
	item.instance().forceUpdate();
	item.instance().doNameInputFieldChange("1321321", mockInputFieldName.local_authority, false);
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(mockhandleNameInputField).toHaveBeenCalled();
	expect(item.state().isFormValid).toBe(false);
	expect(item.state().local_authority).toBe(false);
});
