// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import UnlockContent from "../index";
import Header from "../../../widgets/Header";
import MockUserRole from "../../../mocks/MockUserRole";
import MockUser from "../../../mocks/MockUser";
import MockBluckUpload from "../../../mocks/MockBluckUpload";
import MockSchoolList from "../../../mocks/mockSchoolList";

let props, mockUserData, file, message, mockCell, select_school, valid;
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
		read: jest.fn().mockReturnValue({
			opts: { Date1904: false, CalcPrecision: true, RefreshAll: false, CalcCount: 100, CalcIter: false, CalcDelta: 0.001, CalcSaveRecalc: true },
			SheetNames: ["Sheet1", "Sheet2"],
			Sheets: {
				Sheet1: {
					"!margins": { left: 0.7875, right: 0.7875, top: 1.0527777777777778, bottom: 1.0527777777777778, header: 0.7875, footer: 0.7875 },
					A1: { v: 9781906622701, t: "n", w: "9781906622701" },
					A2: { v: "0-7078-6953-6", t: "s", w: "0-7078-6953-6" },
					A3: { v: "0-7919-7742-0", t: "s", w: "0-7919-7742-0" },
					A4: { v: "0-2316-6741-8", t: "s", w: "0-2316-6741-8" },
					A5: { v: "0-8474-5247-6", t: "s", w: "0-8474-5247-6" },
					A6: { v: "0-1565-2476-7", t: "s", w: "0-1565-2476-7" },
					A7: { v: "0-7640-6210-7", t: "s", w: "0-7640-6210-7" },
					A8: { v: "0-3431-7273-9", t: "s", w: "0-3431-7273-9" },
					A9: { v: "978-7-7705-2352-6", t: "s", w: "978-7-7705-2352-6" },
					A10: { v: "978-5-4748-3548-8", t: "s", w: "978-5-4748-3548-8" },
					A11: { v: "978-8-1310-6512-9", t: "s", w: "978-8-1310-6512-9" },
					A12: { v: "abcddkf", t: "s", w: "abcddkf" },
					D12: { v: "978-8-2785-2070-3", t: "s", w: "978-8-2785-2070-3" },
					F12: { v: "978-9-8033-0656-4", t: "s", w: "978-9-8033-0656-4" },
					A13: { v: "dsfdgf", t: "s", w: "dsfdgf" },
					A14: { v: "dsfdgf", t: "s", w: "dsfdgf" },
					A15: { v: 5555555555, t: "n", w: "5555555555" },
					A16: { v: 4444444444, t: "n", w: "4444444444" },
					A17: { v: 3333333333, t: "n", w: "3333333333" },
					A21: { v: "978-4-6006-2231-2", t: "s", w: "978-4-6006-2231-2" },
					A22: { v: "978-6-8183-7201-0", t: "s", w: "978-6-8183-7201-0" },
					A24: { v: "dsf—dff---fgf", t: "s", w: "dsf—dff---fgf" },
					"!ref": "A1:F24",
				},
				Sheet2: {
					"!margins": { left: 0.7875, right: 0.7875, top: 1.0527777777777778, bottom: 1.0527777777777778, header: 0.7875, footer: 0.7875 },
					C4: { v: 808253360, t: "n", w: "808253360" },
					M7: { v: "dfdsg", t: "s", w: "dfdsg" },
					Q8: { v: "sfdsgf", t: "s", w: "sfdsgf" },
					E12: { v: "07086-3673X", t: "s", w: "07086-3673X" },
					M13: { v: "sfdsf", t: "s", w: "sfdsf" },
					S19: { v: "978-9-0482-6622-7", t: "s", w: "978-9-0482-6622-7" },
					G21: { v: "dsfsfdg", t: "s", w: "dsfsfdg" },
					M23: { v: "$%^$#DS", t: "s", w: "$%^$#DS" },
					P26: { v: "978-5-7635-0533-7", t: "s", w: "978-5-7635-0533-7" },
					G36: { v: "978-3-4247-5899-3", t: "s", w: "978-3-4247-5899-3" },
					D47: { v: "978-1906-62270-1", t: "s", w: "978-1906-62270-1" },
					"!ref": "C4:S47",
				},
			},
			Preamble: {},
			Strings: [
				{ t: "0-7078-6953-6", raw: "<t>0-7078-6953-6</t>", r: "0-7078-6953-6" },
				{ t: "0-7919-7742-0", raw: "<t>0-7919-7742-0</t>", r: "0-7919-7742-0" },
				{ t: "0-2316-6741-8", raw: "<t>0-2316-6741-8</t>", r: "0-2316-6741-8" },
				{ t: "0-8474-5247-6", raw: "<t>0-8474-5247-6</t>", r: "0-8474-5247-6" },
				{ t: "0-1565-2476-7", raw: "<t>0-1565-2476-7</t>", r: "0-1565-2476-7" },
				{ t: "0-7640-6210-7", raw: "<t>0-7640-6210-7</t>", r: "0-7640-6210-7" },
				{ t: "0-3431-7273-9", raw: "<t>0-3431-7273-9</t>", r: "0-3431-7273-9" },
				{ t: "978-7-7705-2352-6", raw: "<t>978-7-7705-2352-6</t>", r: "978-7-7705-2352-6" },
				{ t: "978-5-4748-3548-8", raw: "<t>978-5-4748-3548-8</t>", r: "978-5-4748-3548-8" },
				{ t: "978-8-1310-6512-9", raw: "<t>978-8-1310-6512-9</t>", r: "978-8-1310-6512-9" },
				{ t: "abcddkf", raw: "<t>abcddkf</t>", r: "abcddkf" },
				{ t: "978-8-2785-2070-3", raw: "<t>978-8-2785-2070-3</t>", r: "978-8-2785-2070-3" },
				{ t: "978-9-8033-0656-4", raw: "<t>978-9-8033-0656-4</t>", r: "978-9-8033-0656-4" },
				{ t: "dsfdgf", raw: "<t>dsfdgf</t>", r: "dsfdgf" },
				{ t: "978-4-6006-2231-2", raw: "<t>978-4-6006-2231-2</t>", r: "978-4-6006-2231-2" },
				{ t: "978-6-8183-7201-0", raw: "<t>978-6-8183-7201-0</t>", r: "978-6-8183-7201-0" },
				{ t: "dsf—dff---fgf", raw: "<t>dsf—dff---fgf</t>", r: "dsf—dff---fgf" },
				{ t: "dfdsg", raw: "<t>dfdsg</t>", r: "dfdsg" },
				{ t: "sfdsgf", raw: "<t>sfdsgf</t>", r: "sfdsgf" },
				{ t: "07086-3673X", raw: "<t>07086-3673X</t>", r: "07086-3673X" },
				{ t: "sfdsf", raw: "<t>sfdsf</t>", r: "sfdsf" },
				{ t: "978-9-0482-6622-7", raw: "<t>978-9-0482-6622-7</t>", r: "978-9-0482-6622-7" },
				{ t: "dsfsfdg", raw: "<t>dsfsfdg</t>", r: "dsfsfdg" },
				{ t: "$%^$#DS", raw: "<t>$%^$#DS</t>", r: "$%^$#DS" },
				{ t: "978-5-7635-0533-7", raw: "<t>978-5-7635-0533-7</t>", r: "978-5-7635-0533-7" },
				{ t: "978-3-4247-5899-3", raw: "<t>978-3-4247-5899-3</t>", r: "978-3-4247-5899-3" },
				{ t: "978-1906-62270-1", raw: "<t>978-1906-62270-1</t>", r: "978-1906-62270-1" },
			],
			SSF: {
				0: "General",
				1: "0",
				2: "0.00",
				3: "#,##0",
				4: "#,##0.00",
				9: "0%",
				10: "0.00%",
				11: "0.00E+00",
				12: "# ?/?",
				13: "# ??/??",
				14: "m/d/yy",
				15: "d-mmm-yy",
				16: "d-mmm",
				17: "mmm-yy",
				18: "h:mm AM/PM",
				19: "h:mm:ss AM/PM",
				20: "h:mm",
				21: "h:mm:ss",
				22: "m/d/yy h:mm",
				37: "#,##0 ;(#,##0)",
				38: "#,##0 ;[Red](#,##0)",
				39: "#,##0.00;(#,##0.00)",
				40: "#,##0.00;[Red](#,##0.00)",
				45: "mm:ss",
				46: "[h]:mm:ss",
				47: "mmss.0",
				48: "##0.0E+0",
				49: "@",
				56: '"上午/下午 "hh"時"mm"分"ss"秒 "',
				164: "General",
				65535: "General",
			},
			Metadata: { Country: ["US", "US"] },
			Workbook: {
				Sheets: [
					{ Hidden: 0, name: "Sheet1" },
					{ Hidden: 0, name: "Sheet2" },
				],
				WBProps: { date1904: false },
				Views: [{}],
			},
			Custprops: {
				SystemIdentifier: 131073,
				CodePage: -535,
				FMTID: ["02d5cdd59c2e1b10939708002b2cf9ae", "05d5cdd59c2e1b10939708002b2cf9ae"],
				RevNumber: "16",
				EditTime: "1601-01-01T03:19:28Z",
				LastPrinted: "1601-01-01T00:00:00Z",
				CreatedDate: "2019-03-04T13:24:29.183Z",
				ModifiedDate: "2019-03-06T06:25:16.242Z",
			},
			Props: {
				SystemIdentifier: 131073,
				CodePage: -535,
				FMTID: ["02d5cdd59c2e1b10939708002b2cf9ae", "05d5cdd59c2e1b10939708002b2cf9ae"],
				RevNumber: "16",
				EditTime: "1601-01-01T03:19:28Z",
				LastPrinted: "1601-01-01T00:00:00Z",
				CreatedDate: "2019-03-04T13:24:29.183Z",
				ModifiedDate: "2019-03-06T06:25:16.242Z",
			},
		}),
		utils: {
			decode_range: jest.fn().mockReturnValue({ s: { c: 0, r: 0 }, e: { c: 6, r: 24 } }),
			encode_cell: jest.fn().mockImplementation(() => mockCell.cellAddress), //.mockReturnValue(cell)
			book_new: jest.fn().mockReturnValue({ SheetNames: [], Sheets: {} }),
			json_to_sheet: jest.fn().mockReturnValue({
				A2: { t: "s", v: "9781906622701" },
				B2: { t: "s", v: "Essential Maths A Level Pure Mathematics Book 2" },
				C2: { t: "s", v: "David Rayner&Paul Williams&Lauren Gurney" },
				A1: { t: "s", v: "ISBN" },
				B1: { t: "s", v: "Title" },
				C1: { t: "s", v: "Authors" },
				"!ref": "A1:C2",
			}),
			book_append_sheet: (a, b, c) => {
				return true;
			},
		},
		writeFile: (a, b) => {
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
	if (mockUserData.role === MockUserRole.claAdmin) {
		if (endpoint === "/auth/get-schools") {
			return {
				result: MockSchoolList,
			};
		}
	}
	throw new Error("should never be here");
}

function resetAll() {
	props = {
		accept: ".XLS, .XLSX, .ODT, .ODS, .CSV",
		selectFile: null,
		isbns: [],
		message: "",
	};
	mockUserData = MockUser[0];
	mockUserData.role = MockUserRole.schoolAdmin;
	file = [createFile("file1.xls", 1111, "application/vnd.ms-excel")];
	mockCell = {
		cellAddress: "C4",
	};
	select_school = { label: "Dover Grammar for Boys", value: 7 };
	valid = {
		errorType: "",
		isValid: true,
		message: "",
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

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = shallow(<UnlockContent api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} {...props} />);

	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

test(`When user upload the file`, async () => {
	const item = shallow(<UnlockContent api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} {...props} />);

	item.instance().handleUpload(file);
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().selectFile).not.toBe(null);
});

test(`When User doesn\'t upload any file`, async () => {
	const item = shallow(<UnlockContent api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} {...props} />);

	item.instance().handleUpload();
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().selectFile).toBe(null);
});

test(`When User click on submit event`, async () => {
	const item = shallow(<UnlockContent api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} {...props} />);

	const spy = jest.spyOn(item.instance(), "handleSubmit");
	item.update();
	await wait(50);
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	await wait(50);
	item.update();

	expect(spy).toHaveBeenCalled();
});

test(`When User click on submit event and load uploded file`, async () => {
	const item = shallow(<UnlockContent api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} {...props} />);

	item.instance().handleUpload(file);
	const spy = jest.spyOn(item.instance(), "loadFile");
	item.update();
	await wait(50);
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	await wait(50);
	item.update();

	expect(spy).toHaveBeenCalled();
});

//alredt in comment 25032019
// test(`When User click on submit event and also called the isValidateISBN `, async() => {
// 	let ISBN = "9781906622701" + "a.".repeat(20);
// 	const item = shallow(<UnlockContent
// 						api = {defaultApi}
// 						withAuthConsumer_myUserDetails={mockUserData} {...props}/>);

// 	await wait(50);
// 	item.instance().handleUpload(file);
// 	const spy = jest.spyOn(item.instance(), 'isValidateISBN');
// 	item.update();
// 	await wait(50);
// 	item.instance().handleSubmit({preventDefault : jest.fn()});
// 	await wait(50);
// 	item.update();

// 	expect(spy).toHaveBeenCalled();
// });

test(`Uploaded file have Valid ISBN`, async () => {
	let ISBN = "9781906622701";
	const item = shallow(<UnlockContent api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} {...props} />);

	let res = item.instance().isValidateISBN(ISBN);
	await wait(50);
	item.update();
	expect(res).toEqual(ISBN);
});

/** always return 0-32 value */
test(`Uploaded file have 0-32 digit value`, async () => {
	let ISBN = "9781906622701" + "a.".repeat(30);
	const item = shallow(<UnlockContent api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} {...props} />);

	let res = item.instance().isValidateISBN(ISBN);
	await wait(50);
	item.update();
	expect(res).toEqual("9781906622701a.a.a.a.a.a.a.a.a.a");
});

test(`User upload the file and click on submit button for \`Bulk Unlock\``, async () => {
	mockCell.cellAddress = "A1";
	const item = shallow(<UnlockContent api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} {...props} />);

	item.instance().handleUpload(file);
	const spy = jest.spyOn(item.instance(), "unlockContent");
	item.update();
	await wait(50);
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	await wait(50);
	item.update();

	expect(spy).toHaveBeenCalled();
});

/** Component renders correctly with cla-admin */
test(`Component renders correctly with cla-admin`, async () => {
	mockUserData.role = MockUserRole.claAdmin;
	const item = shallow(<UnlockContent api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} {...props} />);

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.find("UnlockContentForm").children().find("CustomSelectSchool").length).toBe(1);
});

/** If user login with cla-admin and changed the school drop down value */
test("If user login with cla-admin and changed the school drop down value", async () => {
	mockUserData.role = MockUserRole.claAdmin;
	let dropDownValue = { value: "2", label: "Test School 1" };

	const item = shallow(<UnlockContent api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} {...props} />);

	item.instance().handleDrpChange("school", select_school, valid);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().school).toEqual(select_school);
});

/** Component renders correctly with school-admin */
test(`Component renders correctly with school-admin`, async () => {
	mockUserData.role = MockUserRole.schoolAdmin;
	const item = shallow(<UnlockContent api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} {...props} />);

	expect(item.find("UnlockContentForm").children().find("SelectSearch").length).toBe(0);
});

test(`User click on unlocked [[X]] title digit`, async () => {
	mockUserData.role = MockUserRole.schoolAdmin;
	const item = shallow(<UnlockContent api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} {...props} />);

	item.setState({ unlocked: MockBluckUpload.result.unlocked });
	item.instance().onClick();
	expect(item.find("ButtonLink").children("ul").length).toBe(0);
});

test(`User upload the file and click on submit button`, async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/unlock-bulk") {
			return MockBluckUpload;
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(<UnlockContent api={api} withAuthConsumer_myUserDetails={mockUserData} {...props} />);

	item.instance().handleUpload(file);
	const spy = jest.spyOn(item.instance(), "unlockContent");
	item.update();
	await wait(50);
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	await wait(50);
	item.update();

	message = item.state().message;
	expect(message.indexOf(`You have successfully unlocked`).length !== -1).toBe(true);
	//get the download button
	expect(item.find("DonloadLink").text()).toEqual("report");
});

test(`User upload the file and click on submit button, get exception error`, async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/unlock-bulk") {
			throw "unknown error";
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(<UnlockContent api={api} withAuthConsumer_myUserDetails={mockUserData} {...props} />);

	item.instance().handleUpload(file);
	const spy = jest.spyOn(item.instance(), "unlockContent");
	item.update();
	await wait(50);
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	await wait(50);
	item.update();

	message = item.state().message;
	expect(message.indexOf(`unknown error`).length !== -1).toBe(true);
});

test(`User upload the file and click on downloadAReport button`, async () => {
	const mockPreventDefault = jest.fn();
	let returnMockBluckUpload = MockBluckUpload;
	delete returnMockBluckUpload.result.unlocked[0].authors;
	async function api(endpoint, data) {
		if (endpoint === "/admin/unlock-bulk") {
			return returnMockBluckUpload;
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(<UnlockContent api={api} withAuthConsumer_myUserDetails={mockUserData} {...props} />);

	item.instance().handleUpload(file);
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	const downloadAReport = item.find("DonloadLink");
	downloadAReport.simulate("click", { preventDefault: mockPreventDefault });
	expect(mockPreventDefault).toHaveBeenCalled();
});

/** Get Validation message when user not select institution */
test(`Get Validation message when user not select institution`, async () => {
	mockUserData.role = MockUserRole.claAdmin;
	mockCell.cellAddress = "A1";
	const item = shallow(<UnlockContent api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} {...props} />);

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
	mockUserData.role = MockUserRole.claAdmin;
	mockCell.cellAddress = "A1";
	const item = shallow(<UnlockContent api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} {...props} />);

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
