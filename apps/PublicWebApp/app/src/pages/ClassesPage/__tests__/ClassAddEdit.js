// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import ClassAddEdit from "../ClassAddEdit";
import MockSchoolList from "../../../mocks/mockSchoolList";
import MockUserRole from "../../../mocks/MockUserRole";
import ExamBoards from "../../../mocks/mockExamBoards";
import KeyStage from "../../../mocks/mockKeyStage";

let MOCKCLASSFORMDATA = [
	{
		name: "oid",
		value: "1",
	},
	{
		name: "title",
		value: "abc",
	},
	{
		name: "key_stage",
		value: "key stage",
	},
	{
		name: "year_group",
		value: "y12",
	},
	{
		name: "identifier",
		value: "identifier",
	},
	{
		name: "exam_board",
		value: "EdExcel",
	},
	{
		name: "number_of_students",
		value: "10",
	},
];
let props;
/** Mock user data */
let mockUserData = {
	first_name: "Test",
	last_name: "Surname",
	role: "teacher",
	school: null,
};
let fields, message, examBoards, keyStages, ACTION_NEW, ACTION_EDIT, CONFIRM_DIALOG_DELETE, CONFIRM_DIALOG_NONE, mockFormData;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

//jest.mock('../../../common/withAdminAuthRequiredConsumer', () => mockPassthruHoc);
//jest.mock('../../../common/withApiConsumer', () => mockPassthruHoc);

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
		oid: "",
		date_created: "",
		title: "",
		key_stage: "",
		year_group: "",
		identifier: "",
		number_of_students: "",
		exam_board: "",
		is_own: false,
		extract_count: 0,
	}),
		(message = ""),
		(examBoards = ExamBoards),
		(keyStages = KeyStage),
		(ACTION_NEW = "new");
	ACTION_EDIT = "edit";
	CONFIRM_DIALOG_DELETE = "delete";
	CONFIRM_DIALOG_NONE = "";
	mockFormData = [];
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
const deleteClass = jest.fn();
const handleDrpChange = jest.fn();
const handleNameInputField = jest.fn();

/** Component renders correctly */
test("Component renders correctly ", async () => {
	const item = mount(
		<ClassAddEdit
			key={fields.oid || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			keyStages={keyStages}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteClass={deleteClass}
			currentUserRole={MockUserRole.schoolAdmin}
			allSchools={MockSchoolList}
			handleDrpChange={handleDrpChange}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
			{...props}
		/>
	);

	expect(item.find("FormWrapAddEdit").length).toBe(1);
});

/** User clicks create class button from above the listing page, It should display the create-class button in form*/
test("User clicks create class button from above the listing page, It should display the create-class button in form", async () => {
	const item = mount(
		<ClassAddEdit
			key={fields.oid || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_NEW}
			deleteClass={deleteClass}
			{...props}
			currentUserRole={MockUserRole.schoolAdmin}
			allSchools={MockSchoolList}
			handleDrpChange={handleDrpChange}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
			keyStages={keyStages}
		/>
	);

	expect(item.find('button[name="create-class"]').length).toBe(1);
});

/** User click on edit icon from the listing page, It should display the update-class button in form*/
test("User click on edit icon from the listing page, It should display the update-class button in form", async () => {
	fields = {
		oid: "1",
		date_created: "15/1/2015",
		title: "test",
		key_stage: "test",
		year_group: "test",
		identifier: "test",
		number_of_students: "10000",
		exam_board: "test",
	};

	const item = mount(
		<ClassAddEdit
			key={fields.oid || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteClass={deleteClass}
			currentUserRole={MockUserRole.schoolAdmin}
			allSchools={MockSchoolList}
			handleDrpChange={handleDrpChange}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
			keyStages={keyStages}
			{...props}
		/>
	);

	expect(item.find('button[name="update-class"]').length).toBe(1);
});

/** User login with cla-admin and add/edit the class than should be render "Select School" component */
test('User login with cla-admin and add/edit the class than should be render "Select School" component', async () => {
	const item = shallow(
		<ClassAddEdit
			key={fields.oid || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_NEW}
			deleteClass={deleteClass}
			currentUserRole={MockUserRole.claAdmin}
			allSchools={MockSchoolList}
			handleDrpChange={handleDrpChange}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
			keyStages={keyStages}
			{...props}
		/>
	);

	expect(item.find("AjaxSearchableDropdown").length).toBe(1);
});

/** User login with cla-admin and add/edit the class than should not be render "Select School" component */
test('User login with school-admin and add/edit the class than should not be render "Select School" component', async () => {
	const item = shallow(
		<ClassAddEdit
			key={fields.oid || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_NEW}
			deleteClass={deleteClass}
			currentUserRole={MockUserRole.schoolAdmin}
			allSchools={MockSchoolList}
			handleDrpChange={handleDrpChange}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
			keyStages={keyStages}
			{...props}
		/>
	);

	expect(item.find(".form").children().find("FormSelectSearch").length).toBe(0);
});

/** User click on delete button and it should be display the confirmation dialog box */
test("User click on delete button and it should be display the confirmation dialog box ", async () => {
	fields = {
		oid: "1",
		date_created: "15/1/2015",
		title: "test",
		key_stage: "test",
		year_group: "test",
		identifier: "test",
		number_of_students: "10000",
		exam_board: "test",
	};

	const item = mount(
		<ClassAddEdit
			key={fields.oid || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteClass={deleteClass}
			currentUserRole={MockUserRole.schoolAdmin}
			allSchools={MockSchoolList}
			handleDrpChange={handleDrpChange}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
			keyStages={keyStages}
			{...props}
		/>
	);

	item.setState({ show_confirm_dialog: CONFIRM_DIALOG_NONE });
	item.instance().doShowConfirmDelete({ preventDefault: jest.fn() });

	expect(item.state().show_confirm_dialog).toEqual(CONFIRM_DIALOG_DELETE);
});

/** User click on no button from delete dailog box */
test("User click on no button from delete dailog box", async () => {
	fields = {
		oid: "1",
		date_created: "15/1/2015",
		title: "test",
		key_stage: "test",
		year_group: "test",
		identifier: "test",
		number_of_students: "10000",
		exam_board: "test",
	};

	const item = mount(
		<ClassAddEdit
			key={fields.oid || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteClass={deleteClass}
			currentUserRole={MockUserRole.schoolAdmin}
			allSchools={MockSchoolList}
			handleDrpChange={handleDrpChange}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
			keyStages={keyStages}
			{...props}
		/>
	);

	item.setState({ show_confirm_dialog: CONFIRM_DIALOG_DELETE });

	item.instance().doDismissRejectDialog({ preventDefault: jest.fn() });

	expect(item.state().show_confirm_dialog).toEqual(CONFIRM_DIALOG_NONE);
});

/** User click on yes button from delete dailog box */
test("User click on yes button from delete dailog box ", async () => {
	fields = {
		oid: "1",
		date_created: "15/1/2015",
		title: "test",
		key_stage: "test",
		year_group: "test",
		identifier: "test",
		number_of_students: "10000",
		exam_board: "test",
	};

	const item = mount(
		<ClassAddEdit
			key={fields.oid || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteClass={deleteClass}
			currentUserRole={MockUserRole.schoolAdmin}
			allSchools={MockSchoolList}
			handleDrpChange={handleDrpChange}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
			keyStages={keyStages}
			{...props}
		/>
	);

	item.setState({ show_confirm_dialog: CONFIRM_DIALOG_NONE });
	//item.instance().doShowConfirmDelete({ preventDefault: jest.fn()});
	item.instance().doDelete({ preventDefault: jest.fn() });

	//expect(item.state().show_confirm_dialog).toEqual(CONFIRM_DIALOG_DELETE);
	expect(deleteClass).toHaveBeenCalled();
});

/** User enter invalid number_of_students value **/
test("User enter invalid number_of_students value", async () => {
	const item = mount(
		<ClassAddEdit
			key={fields.oid || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_NEW}
			deleteClass={deleteClass}
			currentUserRole={MockUserRole.schoolAdmin}
			allSchools={MockSchoolList}
			handleDrpChange={handleDrpChange}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
			keyStages={keyStages}
			{...props}
		/>
	);

	const number_of_students = item.find('input[name="number_of_students"]');

	number_of_students.simulate("change", {
		target: {
			name: "number_of_students",
			value: "ddgg",
		},
	});

	expect(item.state().number_field_error).toEqual("The number of students must be a number between 1 and 9999");
});

/** User enter valid number_of_students value **/
test("User enter valid number_of_students value", async () => {
	const item = mount(
		<ClassAddEdit
			key={fields.oid || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_NEW}
			deleteClass={deleteClass}
			currentUserRole={MockUserRole.schoolAdmin}
			allSchools={MockSchoolList}
			handleDrpChange={handleDrpChange}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
			keyStages={keyStages}
			{...props}
		/>
	);

	const number_of_students = item.find('input[name="number_of_students"]');

	number_of_students.simulate("change", {
		target: {
			name: "number_of_students",
			value: "50",
		},
	});

	expect(item.state().number_field_error).toEqual(null);
});

/** User enter 100000 in number_of_students input */
test("User enter 100000 in number_of_students input", async () => {
	const item = mount(
		<ClassAddEdit
			key={fields.oid || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_NEW}
			deleteClass={deleteClass}
			currentUserRole={MockUserRole.schoolAdmin}
			allSchools={MockSchoolList}
			handleDrpChange={handleDrpChange}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
			keyStages={keyStages}
			{...props}
		/>
	);

	const number_of_students = item.find('input[name="number_of_students"]');

	number_of_students.simulate("change", {
		target: {
			name: "number_of_students",
			value: "100000",
		},
	});

	expect(item.state().number_field_error).toEqual("The number of students must be a number between 1 and 9999");
});

/** User click submit for create a new class */
test("User click on submit for create a new class", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKCLASSFORMDATA;

	const item = mount(
		<ClassAddEdit
			key={fields.oid || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_NEW}
			deleteClass={deleteClass}
			currentUserRole={MockUserRole.schoolAdmin}
			allSchools={MockSchoolList}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
			keyStages={keyStages}
			handleDrpChange={handleDrpChange}
			{...props}
		/>
	);

	const form = item.find("form");

	form.simulate("submit", {
		preventDefault: mockCall,
		target: [mockFormData],
		relatedTarget: { value: "create-class" },
	});

	expect(handleSubmit).toBeCalled();
});

/** User click on submit for update class details */
test("User click on submit for update class details", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKCLASSFORMDATA;

	const item = mount(
		<ClassAddEdit
			key={fields.oid || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteClass={deleteClass}
			currentUserRole={MockUserRole.schoolAdmin}
			allSchools={MockSchoolList}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
			keyStages={keyStages}
			handleDrpChange={handleDrpChange}
			{...props}
		/>
	);

	const form = item.find("form");

	form.simulate("submit", {
		preventDefault: mockCall,
		target: [mockFormData],
		relatedTarget: { value: "update-class" },
	});

	expect(handleSubmit).toBeCalled();
});

/** User click on submit for delete class details */
test("User click on submit for delete class details", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKCLASSFORMDATA;

	const item = mount(
		<ClassAddEdit
			key={fields.oid || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteClass={deleteClass}
			currentUserRole={MockUserRole.schoolAdmin}
			allSchools={MockSchoolList}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
			keyStages={keyStages}
			handleDrpChange={handleDrpChange}
			{...props}
		/>
	);

	const form = item.find("form");

	form.simulate("submit", {
		preventDefault: mockCall,
		target: [mockFormData],
		relatedTarget: { value: "delete-class" },
	});

	expect(handleSubmit).toBeCalled();
});

/** User click on submit Get success/update/error message*/
test("User click on submit get message", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKCLASSFORMDATA;
	message = "";
	fields = {
		oid: "1",
		date_created: "15/1/2015",
		title: "test",
		key_stage: "test",
		year_group: "test",
		identifier: "test",
		number_of_students: "10000",
		exam_board: "test",
	};

	const item = mount(
		<ClassAddEdit
			key={fields.oid || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteClass={deleteClass}
			currentUserRole={MockUserRole.schoolAdmin}
			allSchools={MockSchoolList}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
			keyStages={keyStages}
			handleDrpChange={handleDrpChange}
			{...props}
		/>
	);

	const form = item.find("form");

	form.simulate("submit", {
		preventDefault: mockCall,
		target: [mockFormData],
		relatedTarget: { value: "create-class" },
	});
	item.setProps({ message: "Successfull Updated" });

	expect(item.find("FormMessage").length).toEqual(1);
});

/** User click on edit on class which have extract_count > 0*/
test("User click on edit on class which have extract_count > 0", async () => {
	const mockCall = jest.fn();
	fields = {
		oid: "1",
		date_created: "15/1/2015",
		title: "test",
		key_stage: "test",
		year_group: "test",
		identifier: "test",
		number_of_students: "10000",
		exam_board: "test",
		extract_count: 2,
	};

	const item = mount(
		<ClassAddEdit
			key={fields.oid || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteClass={deleteClass}
			currentUserRole={MockUserRole.schoolAdmin}
			allSchools={MockSchoolList}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
			keyStages={keyStages}
			handleDrpChange={handleDrpChange}
			{...props}
		/>
	);

	expect(item.find("FormFieldsDisabledMessage").length).toEqual(1);
});

/** Pass action value as null*/
test("User click on edit on class which have extract_count > 0", async () => {
	const mockCall = jest.fn();
	const item = mount(
		<ClassAddEdit
			key={fields.oid || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={null}
			deleteClass={deleteClass}
			currentUserRole={MockUserRole.schoolAdmin}
			allSchools={MockSchoolList}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
			keyStages={keyStages}
			handleDrpChange={handleDrpChange}
			{...props}
		/>
	);

	expect(item.find('button[name="update-class"]').length).toBe(0);
	expect(item.find('button[name="create-class"]').length).toBe(0);
});

/** Pass title as " test   title  and occurs error"*/
test('Pass title as " test   title " and occurs error', async () => {
	const mockCall = jest.fn();
	const item = shallow(
		<ClassAddEdit
			key={fields.oid || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={message}
			fields={fields}
			examBoards={examBoards}
			action={null}
			deleteClass={deleteClass}
			currentUserRole={MockUserRole.schoolAdmin}
			allSchools={MockSchoolList}
			userRole={MockUserRole.schoolAdmin}
			handleNameInputField={handleNameInputField}
			keyStages={keyStages}
			handleDrpChange={handleDrpChange}
			{...props}
		/>
	);

	const titleinput = item.find('[name="title"]');
	titleinput.simulate("change", { target: { name: "title", value: " test   title " } });

	item.update();

	expect(item.state().title_field_error).not.toBe(null);

	titleinput.simulate("change", { target: { name: "title", value: "test title" } });

	item.update();

	expect(item.state().title_field_error).toBe(true);
});

/** User login with teacher, user is a owner of class */
test(`User login with teacher, user is a owner of class`, async () => {
	fields = {
		oid: 1,
		date_created: "15/1/2015",
		title: "test",
		key_stage: "test",
		year_group: "test",
		identifier: "test",
		number_of_students: "10000",
		exam_board: "test",
		extract_count: 2,
		is_own: false,
	};

	const item = mount(
		<ClassAddEdit
			key={fields.oid || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteClass={deleteClass}
			currentUserRole={MockUserRole.teacher}
			allSchools={MockSchoolList}
			userRole={MockUserRole.teacher}
			handleNameInputField={handleNameInputField}
			keyStages={keyStages}
			handleDrpChange={handleDrpChange}
			{...props}
		/>
	);

	await wait(150);
	item.update();
	item.instance().forceUpdate();
	expect(item.find("FormFieldsDisabledMessage").text().trim()).toEqual(`You may not edit a class you did not create.`);
});

/** User login with cla-admin/school-admin and extract_count is greater than 0 */
test(`User login with cla-admin/school-admin and extract_count is greater than 0`, async () => {
	fields = {
		oid: 1,
		date_created: "15/1/2015",
		title: "test",
		key_stage: "test",
		year_group: "test",
		identifier: "test",
		number_of_students: "10000",
		exam_board: "test",
		extract_count: 2,
		is_own: true,
	};
	const item = mount(
		<ClassAddEdit
			key={fields.oid || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_EDIT}
			deleteClass={deleteClass}
			currentUserRole={MockUserRole.claAdmin}
			allSchools={MockSchoolList}
			handleDrpChange={handleDrpChange}
			userRole={MockUserRole.claAdmin}
			handleNameInputField={handleNameInputField}
			keyStages={keyStages}
			{...props}
		/>
	);

	await wait(150);
	item.update();
	item.instance().forceUpdate();
	expect(item.find("FormFieldsDisabledMessage").text().trim()).toEqual(`Cannot edit this class because it has active copies.`);
});

/** User login with cla-admin/school-admin and extract_count is greater than 0 */
test(`User login with cla-admin/school-admin and extract_count is less than 0`, async () => {
	fields.is_own = true;
	const item = mount(
		<ClassAddEdit
			key={fields.oid || "__NEW__"}
			handleSubmit={handleSubmit}
			cancelAddEdit={cancelAddEdit}
			message={null}
			fields={fields}
			examBoards={examBoards}
			action={ACTION_NEW}
			deleteClass={deleteClass}
			currentUserRole={MockUserRole.claAdmin}
			allSchools={MockSchoolList}
			handleDrpChange={handleDrpChange}
			userRole={MockUserRole.claAdmin}
			handleNameInputField={handleNameInputField}
			keyStages={keyStages}
			{...props}
		/>
	);

	await wait(150);
	item.update();
	item.instance().forceUpdate();
	expect(item.find("FormFieldsDisabledMessage").length).toBe(0);
});
