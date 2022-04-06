import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import RolloverJobAddEdit from "../RolloverJobAddEdit";

let fields, props, ACTION_NEW, ACTION_EDIT, mockInputFieldName, mockFormData, mockRolloverData, mockFunction, mockIsCalledDownloadFile;
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withAdminAuthRequiredConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../SelectSchoolWithSearchFilter", () => {
	return function () {
		return;
	};
});

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

jest.mock("../../../../../../Controller/app/core/admin/lib/rolloverIntervalForFirstEmail", () => {
	return 7;
});

jest.mock("xlsx", () => {
	return {
		utils: {
			book_new: jest.fn().mockReturnValue({ SheetNames: [], Sheets: {} }),
			json_to_sheet: jest.fn().mockReturnValue({
				A1: { t: "s", v: "1" },
				B1: { t: "s", v: "Rollover 1" },
				C1: { t: "s", v: "2021-06-15 14:37:03.482942+00" },
			}),
			book_append_sheet: (a, b, c) => {
				return true;
			},
		},
		writeFile: (a, b) => {
			mockIsCalledDownloadFile = true;
			return true;
		},
	};
});
/** wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	mockFunction = jest.fn();
	fields = {
		id: "",
		name: "",
		status: "",
		target_execution_date: 1627410600,
	};
	ACTION_NEW = "new";
	ACTION_EDIT = "edit";
	mockInputFieldName = {
		name: "rolloverjob name",
		target_execution_date: "target_execution_date",
	};
	props = {
		loadingRolloverJob: false,
		action: ACTION_NEW,
		fields: fields,
		message: "",
		cancelAddEdit: jest.fn(),
		handleNameInputField: jest.fn(),
		location: "",
		selectedSchoolIdMap: jest.fn(),
		setLoadingRolloverJob: jest.fn(),
	};
	mockRolloverData = {
		rollover: [
			{
				id: 1,
				name: "rollover",
				rollover_date: "2021-06-15 14:37:03.482942+00",
				status: "scheduled",
			},
		],
		schools: [
			{
				id: 1,
				name: "school",
				school_type: "school type",
				school_level: "school level",
				territory: "territory",
			},
		],
	};
	mockIsCalledDownloadFile = false;
}
const deleteRolloverJob = jest.fn();
const handleSubmit = jest.fn();

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<RolloverJobAddEdit {...props} />);
	expect(item.find("FormSectionTopRow").length).toBe(1);
});

test('Render "Schedule-rollover-job" button while user create rollover job', async () => {
	const item = shallow(<RolloverJobAddEdit {...props} />);
	expect(item.find('[name="Schedule-rollover-job"]').length).toBe(1);
});

test('Render "Update" button while user edit rollover', async () => {
	props.fields = {
		id: 1,
		name: "rillover",
		status: "scheduled",
		target_execution_date: 1622485800,
	};
	props.action = ACTION_EDIT;
	const item = shallow(<RolloverJobAddEdit {...props} />);
	expect(item.find('[name="update"]').length).toBe(1);
});

test("User click on delete button ", async () => {
	props.fields = {
		id: 1,
		name: "rillover",
		status: "scheduled",
		target_execution_date: 1622485800,
	};
	props.action = ACTION_EDIT;

	const item = shallow(<RolloverJobAddEdit {...props} />);
	item.instance().showConfirmModal();

	expect(item.state().isShow).toEqual(true);
});

test("User click on no button from delete dailog box", async () => {
	props.fields = { id: 1, name: "rillover", status: "scheduled", target_execution_date: 1622485800 };
	props.action = ACTION_EDIT;

	const item = shallow(<RolloverJobAddEdit {...props} />);

	item.instance().showConfirmModal();
	expect(item.state().isShow).toEqual(true);
});

test('User click on "yes" button from delete confirmation dialog box', async () => {
	props.fields = { id: 1, name: "rillover", status: "scheduled", target_execution_date: 1622485800 };
	props.action = ACTION_EDIT;
	const item = shallow(<RolloverJobAddEdit {...props} deleteRolloverJob={deleteRolloverJob} />);
	item.instance().showConfirmModal();
	expect(item.state("isShow")).toEqual(true);
	item.instance().onConfirm();
	expect(item.state("isShow")).toEqual(false);
	expect(deleteRolloverJob).toHaveBeenCalled();
});

test("User click on submit for create a new rollover", async () => {
	const item = shallow(<RolloverJobAddEdit {...props} handleSubmit={handleSubmit} />);
	item.instance().doSubmit();
	expect(handleSubmit).toBeCalled();
});

test("User click on submit for update rollover details", async () => {
	props.action = ACTION_EDIT;
	const item = shallow(<RolloverJobAddEdit {...props} />);
	item.instance().showConfirmModal();
	expect(handleSubmit).toBeCalled();
});

test("User click on submit for delete rollover details", async () => {
	const item = shallow(<RolloverJobAddEdit {...props} handleSubmit={handleSubmit} />);
	item.instance().showConfirmModal();
	item.instance().onConfirm();
	expect(deleteRolloverJob).toBeCalled();
});

test("User Change the value of rollover name field", async () => {
	const mockhandleNameInputField = jest.fn();
	props.handleNameInputField = mockhandleNameInputField;
	const item = shallow(<RolloverJobAddEdit {...props} />);
	//before the function called we set the all fields invalid
	item.setState({ name: "rollover job 1" });
	await wait(30);
	item.update();
	item.instance().forceUpdate();
	item.instance().doNameInputFieldChange("Test", "name", true);
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(mockhandleNameInputField).toHaveBeenCalled();
	expect(item.state().name_field_error).toBe(true);
});

test('User click on "Download rollover details" link and get the export file', async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/rollover-job-get-for-export") {
			return mockRolloverData;
		}
		throw new Error("should never be here");
	}
	props.action = ACTION_EDIT;
	const item = shallow(<RolloverJobAddEdit {...props} api={api} />);

	const getDownloadLink = item.find("FormTopCornerCancel").at(1);
	expect(getDownloadLink.text()).toEqual("Download rollover details");
	getDownloadLink.simulate("click", {
		preventDefault: jest.fn(),
		stopPropagation: jest.fn(),
	});
	await wait(100);
	item.update();
	expect(mockIsCalledDownloadFile).toEqual(true);
});

test(`User see loader when form is loading`, async () => {
	props.loadingRolloverJob = true;
	const item = shallow(<RolloverJobAddEdit {...props} />);
	expect(item.find("Loader").length).toBe(1);
});

test(`User see message when rollover is succesfully created`, async () => {
	props.message = "message";
	const item = shallow(<RolloverJobAddEdit {...props} />);
	expect(item.find("FormMessage").length).toBe(2);
});

test("User see error message when target_execution_date is not selected", async () => {
	const item = shallow(<RolloverJobAddEdit {...props} />);
	item.setProps({ fields: { target_execution_date: null } });
	expect(item.state().date_field_error).toEqual(true);
	expect(item.find("Error").text()).toEqual("Please select a date");
});
