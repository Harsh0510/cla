import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import ClassCreateBulkPage from "../index";
import MockUser from "../../../mocks/MockUser";
import Header from "../../../widgets/Header";

let props;
let mockUserData;
let file;
let mockResultFileJsonData;
let mockCell;
let MockBulkUploadSuccessResult;
let mockIsCalledDownloadFile;
let is_book_new_Called;
let mockSheets;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);

jest.mock("../../../common/withAdminAuthRequiredConsumer", () => {
	return function (acceptedRoles, WrappedComponent) {
		if (!Object.keys(acceptedRoles).length == 2) {
			throw "It should be passed acceptedToles with a single key";
		}
		if (!acceptedRoles.hasOwnProperty("cla-admin" || "school-admin")) {
			throw "It should be passed acceptedToles with a key: cla-admin || school-admin";
		}
		return WrappedComponent;
	};
});

jest.mock("xlsx", () => {
	return {
		read: () => {
			return {
				SheetNames: ["Sheet1"],
				Sheets: mockSheets,
			};
		},
		utils: {
			sheet_to_json: () => {
				return mockResultFileJsonData;
			},
			decode_range: jest.fn().mockReturnValue({ s: { c: 0, r: 0 }, e: { c: 6, r: 24 } }),
			encode_cell: jest.fn().mockImplementation(() => mockCell.cellAddress), //.mockReturnValue(cell)
			book_new: () => {
				// is_book_new_Called = true;
			},
			book_append_sheet: (a, b, c) => {
				return true;
			},
			json_to_sheet: jest.fn().mockReturnValue({
				A1: { t: "s", v: "name" },
				B1: { t: "s", v: "KS" },
				C1: { t: "s", v: "122" },
				D1: { t: "s", v: "25" },
				E1: { t: "s", v: "AQA" },
			}),
		},
		writeFile: (a, b) => {
			mockIsCalledDownloadFile = true;
			return true;
		},
	};
});

jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return {
			current: {
				isValid: function () {
					return true;
				},
			},
		};
	};
});

/** wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

async function defaultApi(endpoint, data) {
	if (endpoint === "/admin/class-create-bulk") {
		return {
			errors: [],
			successfullyLoadedIndexes: [1, 2, 3],
		};
	}
	throw new Error("should never be here");
}

function resetAll() {
	mockUserData = MockUser[0];
	props = {
		accept: ".XLS, .XLSX, .ODT, .ODS, .CSV, .TXT",
		selectFile: null,
		isbns: [],
		message: "",
		withAuthConsumer_myUserDetails: mockUserData,
	};
	mockResultFileJsonData = [
		{
			"Exam Board": "AQA",
			"Instructions for filling out the template": "Name (class name) and Year Group are mandatory fields",
			"Key Stage": "KS1",
			"Name ": "abc123",
			"Number of Students": 25,
			"Year Group": 2,
		},
		{
			"Exam Board": "kjh",
			"Instructions for filling out the template": "Key Stage, Number of Students and Exam Board are optional fields",
			"Key Stage": "hdhd",
			"Name ": 134,
			"Number of Students": "hjh",
			"Year Group": "dbn",
		},
	];
	file = [createFile("file1.xls", 1111, "application/vnd.ms-excel")];
	mockCell = {
		cellAddress: "C4",
	};
	MockBulkUploadSuccessResult = [
		{
			index: 0,
			item: { success: true },
			origClass: {
				title: "test class1",
				year_group: 2,
				number_of_students: 25,
				exam_board: "EXAM_BOARD",
				key_stage: "KS",
			},
		},
		{
			index: 1,
			item: { success: true },
			origClass: {
				title: "test class2",
				year_group: "Test Fn 1",
				number_of_students: "teacher",
				exam_board: "EXAM_BOARD",
				key_stage: "KS",
			},
		},
	];
	mockSheets = {
		Sheet1: {
			A1: { t: "s", v: "name" },
			A2: { t: "s", v: "test1" },
			A3: { t: "s", v: "test2" },
			B1: { t: "s", v: "year_group" },
			B2: { t: "s", v: "y12" },
			B3: { t: "s", v: "y12" },
			C1: { t: "s", v: "number_of_students" },
			C2: { t: "s", v: "100" },
			C3: { t: "s", v: "100" },
			D1: { t: "s", v: "exam_board" },
			D2: { t: "s", v: "eb1" },
			D3: { t: "s", v: "eb1" },
			E1: { t: "s", v: "key_stage" },
			E2: { t: "s", v: "ks1" },
			E3: { t: "s", v: "ks1" },
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

const createFile = (name, size, type) => {
	const file = new File([], name, { type });
	Object.defineProperty(file, "size", {
		get() {
			return size;
		},
	});
	return file;
};

test(`Component renders successfully`, async () => {
	const item = shallow(<ClassCreateBulkPage api={defaultApi} {...props} />);
	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

test(`When user upload the file`, async () => {
	const item = shallow(<ClassCreateBulkPage api={defaultApi} {...props} />);

	item.instance().handleUpload(file);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().selectFile).not.toBe(null);
});

test(`When User doesn\'t upload any file`, async () => {
	const item = shallow(<ClassCreateBulkPage api={defaultApi} {...props} />);

	item.instance().handleUpload();
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().selectFile).toBe(null);
});

test(`When User click on submit event`, async () => {
	const item = shallow(<ClassCreateBulkPage api={defaultApi} {...props} />);

	const spy = jest.spyOn(item.instance(), "handleSubmit");
	item.update();
	await wait(50);
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	await wait(50);
	item.update();

	expect(spy).toHaveBeenCalled();
});

test(`When User click on submit event and load uploded file`, async () => {
	const item = shallow(<ClassCreateBulkPage api={defaultApi} {...props} />);

	item.instance().handleUpload(file);
	const spy = jest.spyOn(item.instance(), "loadFile");
	item.update();
	await wait(50);
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	await wait(50);
	item.update();

	expect(spy).toHaveBeenCalled();
});

test(`User upload the file and click on submit button for \`Bulk Create Class\``, async () => {
	const item = shallow(<ClassCreateBulkPage api={defaultApi} {...props} />);

	item.instance().handleUpload(file);
	const spy = jest.spyOn(item.instance(), "createBulkClasses");
	item.update();
	await wait(50);
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	await wait(50);
	item.update();

	expect(spy).toHaveBeenCalled();
});

test(`Error Spreadsheet invalid. Are you sure you followed the template correctly? When upload file dont have Array data`, async () => {
	mockCell.cellAddress = "A1";
	mockResultFileJsonData = null;
	mockSheets = { Sheet1: {} };
	const item = shallow(<ClassCreateBulkPage api={defaultApi} {...props} />);

	item.instance().handleUpload(file);
	const spy = jest.spyOn(item.instance(), "createBulkClasses");
	item.update();
	await wait(50);
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	await wait(50);
	item.update();

	expect(item.state().message).toEqual("Spreadsheet invalid. Are you sure you followed the template correctly?");
	expect(spy).not.toHaveBeenCalled();
});

test(`Component renders correctly with cla-admin`, async () => {
	props.withAuthConsumer_myUserDetails.role = "cla-admin";
	const item = shallow(<ClassCreateBulkPage api={defaultApi} {...props} />);

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.find("CreateBulkClassesForm").children().find("CustomSelectSchool").length).toBe(1);
});

/** If user login with cla-admin and changed the school drop down value */
test("If user login with cla-admin and changed the school drop down value", async () => {
	props.withAuthConsumer_myUserDetails.role = "cla-admin";
	const item = shallow(<ClassCreateBulkPage api={defaultApi} {...props} />);

	item.instance().handleDrpChange("school", 1, true);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().school).toEqual(1);
});

/** Component renders correctly with school-admin */
test(`Component renders correctly with school-admin`, async () => {
	const item = shallow(<ClassCreateBulkPage api={defaultApi} {...props} />);
	expect(item.find("CreateBulkClassesForm").children().find("SelectSearch").length).toBe(0);
});

test(`User click on created [[3]] title digit`, async () => {
	const item = shallow(<ClassCreateBulkPage api={defaultApi} {...props} />);
	item.setState({ successData: MockBulkUploadSuccessResult });
	item.instance().onClick();
	expect(item.find("ButtonLink").children("ul").length).toBe(0);
});

test(`User upload the file and click on submit button, get exception error`, async () => {
	const item = shallow(<ClassCreateBulkPage api={defaultApi} {...props} />);

	item.instance().handleUpload(file);
	const spy = jest.spyOn(item.instance(), "createBulkClasses");
	item.update();
	await wait(50);
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	await wait(50);
	item.update();

	const message = item.state().message;
	expect(message.indexOf(`unknown error`).length !== -1).toBe(true);
});

test(`Get Validation message when user not select institution`, async () => {
	props.withAuthConsumer_myUserDetails.role = "cla-admin";
	const item = shallow(<ClassCreateBulkPage api={defaultApi} {...props} />);

	item.setState({
		valid: {
			school: { isValid: false, message: "" },
			selectFile: { isValid: true, message: "" },
		},
	});

	await wait(50);
	item.update();
	const result = item.instance().isFormValid();
	await wait(10);
	expect(result.status).toBe(false);
	expect(result.message).toBe(`Please select an institution`);
});

/** Get Validation message when user not select any file */
test(`Get Validation message when user not select any file`, async () => {
	props.withAuthConsumer_myUserDetails.role = "cla-admin";
	const item = shallow(<ClassCreateBulkPage api={defaultApi} {...props} />);

	item.setState({
		valid: {
			school: { isValid: true, message: "" },
			selectFile: { isValid: false, message: "" },
		},
	});

	await wait(50);
	item.update();
	const result = item.instance().isFormValid();
	await wait(10);
	expect(result.status).toBe(false);
	expect(result.message).toBe(`Please select a file`);
});

test(`User upload the file and click on submit button`, async () => {
	const mockPreventDefault = jest.fn();
	const MockBulkUploadErrorsResult = [
		{
			index: 0,
			item: { success: true },
			origClass: {
				title: "test class1",
				year_group: 2,
				number_of_students: 25,
				exam_board: "EXAM_BOARD",
				key_stage: "KS",
			},
			message: "A class with that email already exists",
		},
	];
	const item = shallow(<ClassCreateBulkPage api={defaultApi} {...props} />);

	item.instance().handleUpload(file);
	const spy = jest.spyOn(item.instance(), "createBulkClasses");
	item.update();
	await wait(50);
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	await wait(50);
	item.update();

	const message = item.state().message;

	expect(message.indexOf(`You have successfully created`).length !== -1).toBe(true);
	item.setState({ successData: MockBulkUploadSuccessResult, errorsData: MockBulkUploadErrorsResult });
	expect(item.find("ReportLink").text()).toEqual("report");
	const downloadLink = item.find("ReportLink");
	downloadLink.simulate("click", { preventDefault: mockPreventDefault });
	expect(mockIsCalledDownloadFile).toEqual(true);
});

test("Invalidate File", async () => {
	const item = shallow(<ClassCreateBulkPage api={defaultApi} {...props} />);
	await item.instance().invalidateFileUpload();
	expect(item.state().userUploadedFiles).toBe(null);
});

test("When only single class is created", async () => {
	const mockPreventDefault = jest.fn();
	MockBulkUploadSuccessResult = [
		{
			index: 0,
			item: { success: true },
			origClass: {
				title: "test class1",
				year_group: 2,
				number_of_students: 25,
				exam_board: "EXAM_BOARD",
				key_stage: "KS",
			},
		},
	];
	const item = shallow(<ClassCreateBulkPage api={defaultApi} {...props} />);

	item.instance().handleUpload(file);
	const spy = jest.spyOn(item.instance(), "createBulkClasses");
	item.update();
	await wait(50);
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	await wait(50);
	item.update();

	const message = item.state().message;

	expect(message.indexOf(`You have successfully created`).length !== -1).toBe(true);
	item.setState({ successData: MockBulkUploadSuccessResult, errorsData: [] }), expect(item.find("ReportLink").text()).toEqual("report");
	const downloadLink = item.find("ReportLink");
	downloadLink.simulate("click", { preventDefault: mockPreventDefault });
	expect(mockIsCalledDownloadFile).toEqual(true);
});

test("When no class is created", async () => {
	const item = shallow(<ClassCreateBulkPage api={defaultApi} {...props} />);
	item.instance().handleUpload(file);
	const spy = jest.spyOn(item.instance(), "createBulkClasses");
	item.update();
	await wait(50);
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	await wait(50);
	item.update();
	const message = item.state().message;
	expect(message.indexOf(`You have successfully created`).length !== -1).toBe(true);
	item.setState({ successData: [], errorsData: [] });
	expect(item.find("AdminPageFilterMessage").length).toBe(0);
});

test("User Upload file and get download message", async () => {
	const classes = [
		{ title: "name", key_stage: "KS1", year_group: "25", number_of_students: "25", exam_board: "AQA" },
		{ title: "test", key_stage: "KS1", year_group: "25", number_of_students: "25", exam_board: "AQA" },
	];
	const item = shallow(<ClassCreateBulkPage api={defaultApi} {...props} />);
	item.setState({ school: { label: "test school", value: 7 } });
	item.instance().createBulkClasses(classes);
	await wait(50);
	item.update();
	expect(item.state().successData.length).toBe(3);
	expect(item.find("ReportLink").length).toBe(1);
	expect(item.state().message).toEqual("You have successfully created 3 classes.");
});
