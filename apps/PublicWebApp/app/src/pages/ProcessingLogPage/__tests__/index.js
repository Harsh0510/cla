// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import ProcessingLogPage from "../index";
import Header from "../../../widgets/Header";
import MockProcessingLog from "../../../mocks/mockProcessingLog";
import MockUserRole from "../../../mocks/MockUserRole";
import MockUser from "../../../mocks/MockUser";
import mockAssetProccesingLogFilterData from "../../../mocks/mockAssetProccesingLogFilterData";
import mockProcessingLog from "../../../mocks/mockProcessingLog";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/smoothScroll", () => jest.fn());
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAdminAuthRequiredConsumer", () => {
	return function (acceptedRoles, WrappedComponent) {
		if (!Object.keys(acceptedRoles).length == 1) {
			throw "It should be passed acceptedToles with a single key";
		}
		if (!acceptedRoles.hasOwnProperty("cla-admin")) {
			throw "It should be passed acceptedToles with a key: cla-admin ";
		}
		return WrappedComponent;
	};
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

let ACTION_LIST, ACTION_EDIT;
let location, sortingA, sortingD, page, history, mockUserData, mockProcessingLogData, filters;
let mockIsCalledDownloadAPI;
/** wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

async function defaultApi(endpoint, data) {
	if (endpoint === "/admin/asset-processing-log-get-all") {
		if (data === "error") {
			throw "Unknown error";
		} else {
			return mockProcessingLogData;
		}
	}

	if (endpoint === "/admin/asset-processing-log-get-filters") {
		if (data === "error") {
			throw "Unknown error";
		}
		return mockAssetProccesingLogFilterData;
	}

	if (endpoint === "/admin/asset-processing-log-get-export") {
		mockIsCalledDownloadAPI = true;
		if (data === "error") {
			throw "Unknown error";
		} else {
			return mockProcessingLogData;
		}
	}

	throw new Error("should never be here");
}

function resetAll() {
	location = {
		search: {
			limit: 10,
			offset: 0,
			sort_field: "id",
			sort_dir: "D",
			loading: true,
			carouselLoaded: false,
			unfilteredCount: 3,
			processingLogData: null,
			action: ACTION_LIST,
			message: null,
			query: "",
		},
	};
	history = {
		push: jest.fn(),
	};
	sortingA = [{ direction: "A", columnName: "id" }];
	sortingD = [{ direction: "D", columnName: "id" }];
	page = 2;
	ACTION_LIST = "list";
	ACTION_EDIT = "edit";
	mockUserData = MockUser[0];
	mockUserData.role = MockUserRole.claAdmin;
	mockProcessingLogData = MockProcessingLog;
	filters = {
		STAGE: "stage",
		HIGHPRIORITY: "highpriority",
		SUCCESS: "success",
		QUERY: "query",
	};
	mockIsCalledDownloadAPI = false;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<ProcessingLogPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

/** User click on submit for edit */
test("User login with cla-admin and show processing log data", async () => {
	mockUserData.role = MockUserRole.claAdmin;
	location.search = "?action=" + ACTION_EDIT + "&id=1&limit=10&offset=0&sort_dir=asc&sort_field=id";
	const item = shallow(<ProcessingLogPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().fields).not.toBe(null);
});

/** User getting "Unknown error" while loading */
test('User getting "Unknown error" while loading filter data ', async () => {
	mockUserData.role = MockUserRole.claAdmin;

	async function api(endpoint, data) {
		if (endpoint === "/admin/asset-processing-log-get-filters") {
			return defaultApi(endpoint, "error");
		}
		return defaultApi(endpoint, true);
	}
	const item = shallow(<ProcessingLogPage location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(100);
	item.update();

	expect(item.state().message).toBe("Unknown error");
});

//** User click on sorting with asecending order from table header field */
test("User click on sorting with ascending order", async () => {
	const item = shallow(<ProcessingLogPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	//decending order
	item.instance().doSorting(sortingA);
	//if we don't pass the sorting value it will failed
	//item.instance().doSorting();

	await wait(50);
	item.update();

	expect(item.state().loading).toBe(false);
});

/** User click on sorting with descending order from table header field */
test("User click on sorting with descending order", async () => {
	const item = shallow(<ProcessingLogPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	//decending order
	item.instance().doSorting(sortingD);
	//if we don't pass the sorting value it will failed
	//item.instance().doSorting();

	await wait(50);
	item.update();

	expect(item.state().loading).toBe(true);
});

/** User click on pagination page */
test("User click on pagination page", async () => {
	const item = shallow(<ProcessingLogPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().doPagination(page, 5);
	//if we don't pass the page
	//item.instance().doPaginationPageCountChange();
	await wait(50);
	item.update();

	const push = item.instance().props.history.push;
	const setOffset = (page - 1) * item.state().limit;
	let mockurl =
		"/profile/admin/processing-log-admin?action=list&filter_date_created_begin&filter_date_created_end&limit=5&offset=" +
		setOffset +
		"&query=&sort_dir=desc&sort_field=id";
	await wait(50);

	expect(push.mock.calls[0][0]).toEqual(mockurl);
});

/** User pass invalid offset and limit value */
test('User pass invalid offset as "-1" and limit value as "0"', async () => {
	//set location search params values
	location.search = "?action=" + ACTION_LIST + "&limit=0&offset=-1&sort_dir=desc&sort_field=id";

	const item = shallow(<ProcessingLogPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.update();

	expect(item.state().limit).toEqual(1);
	expect(item.state().offset).toEqual(0);
});

/** User search anything in filter input text*/
test("User search anything in search user filter input text", async () => {
	const item = shallow(<ProcessingLogPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(10);
	const spy = jest.spyOn(item.instance(), "doSearch");
	item.instance().doSearch();
	expect(spy).toHaveBeenCalled();
});

/** User click on Edit for class link */
test("User click on edit class link", async () => {
	let ID = 1;

	const item = shallow(<ProcessingLogPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	item.instance().setState({ Processinglogdbdata: mockProcessingLog.data });
	const attrs = { "data-id": ID };

	item.instance().doOpenEditScreen({ preventDefault: jest.fn(), currentTarget: { getAttribute: (name) => attrs[name], ...attrs } });
	const push = item.instance().props.history.push;
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/processing-log-admin?action=edit&filter_date_created_begin&filter_date_created_end&id=" +
			ID +
			"&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&query=&sort_dir=" +
			item.state().sort_dir +
			"&sort_field=" +
			item.state().sort_field
	);
});

/** User clears all filters */
test("User clears all filters", async () => {
	const item = shallow(<ProcessingLogPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const spy = jest.spyOn(item.instance(), "pushHistory");
	item.instance().resetAll();
	expect(spy).toHaveBeenCalled();
	expect(item.state().query).toBe("");
});

/** Component renders correctly with UserSearchFilters elements*/
test("Component renders correctly with ProcessingLogSearchFilters elements", async () => {
	const item = shallow(<ProcessingLogPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(10);
	expect(item.find("SearchFilters").length).toBe(1);
});

/** User search school and call push histroy function*/
test("User search anything in search user filter input text and call function", async () => {
	const item = shallow(<ProcessingLogPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(10);
	item.instance().handlefilterSelection("gg", "query");
	item.instance().doSearch();
	const push = item.instance().props.history.push;
	let query = push.mock.calls[0][0];
	expect(query.indexOf("&query=`gg`").length !== -1).toBe(true);
});

/** User filter stage called handlefilterSelection */
test("When user filtering stage filter", async () => {
	const item = shallow(<ProcessingLogPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().handlefilterSelection([{ value: "Stage1", label: "Stage1" }], filters.STAGE);
	expect(item.state().selectedStage).toEqual([{ value: "Stage1", label: "Stage1" }]);
});

test("When user clear stage filter", async () => {
	const item = shallow(<ProcessingLogPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().handlefilterSelection([], filters.STAGE);
	expect(item.state().selectedStage).toEqual([]);
});

test("When user filtering success filter", async () => {
	const item = shallow(<ProcessingLogPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().handlefilterSelection([{ value: true, label: "true" }], filters.SUCCESS);
	expect(item.state().selectedSuccess).toEqual([{ value: true, label: "true" }]);
});

test("When user clear success filter", async () => {
	const item = shallow(<ProcessingLogPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().handlefilterSelection([], filters.SUCCESS);
	expect(item.state().selectedSuccess).toEqual([]);
});

/** User also filter the only stage and success*/
test("User filtering only stage and success", async () => {
	const item = shallow(<ProcessingLogPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().handlefilterSelection([{ value: "Stage1", label: "Stage1" }], filters.STAGE);
	item.instance().handlefilterSelection([{ value: true, label: "true" }], filters.SUCCESS);
	await wait(20);
	item.update();
	item.instance().forceUpdate();

	item.instance().doSearch();
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	const push = item.instance().props.history.push;
	let query = push.mock.calls[0][0];
	expect(query.indexOf("&query=").length !== -1).toBe(true);
	expect(query.indexOf("&filter_stage=`stage1`").length !== -1).toBe(true);
	expect(query.indexOf("&filter_succes=`true`").length !== -1).toBe(true);
});

test("User filtering only stage and high_priority", async () => {
	const item = shallow(<ProcessingLogPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().handlefilterSelection([{ value: "Stage1", label: "Stage1" }], filters.STAGE);
	item.instance().handlefilterSelection([{ value: true, label: "true" }], filters.HIGHPRIORITY);
	await wait(20);
	item.update();
	item.instance().forceUpdate();

	item.instance().doSearch();
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	const push = item.instance().props.history.push;
	let query = push.mock.calls[0][0];
	expect(query.indexOf("&query=").length !== -1).toBe(true);
	expect(query.indexOf("&filter_stage=`stage1`").length !== -1).toBe(true);
	expect(query.indexOf("&filter_high_priority=`true`").length !== -1).toBe(true);
});

test("User filtering and load filter data", async () => {
	mockUserData.role = MockUserRole.claAdmin;
	location.search = "?action=list&limit=5&offset=0&sort_dir=asc&sort_field=id&id";
	const item = shallow(<ProcessingLogPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.setProps({
		location: {
			search:
				"?action=" +
				ACTION_LIST +
				"&filter_stage=Stage1&filter_high_priority=false&filter_success=true&limit=5&offset=0&sort_dir=asc&sort_field=id&id",
		},
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().selected).toEqual({ stage: ["Stage1"], success: [true], high_priority: [] });
});

test("User click on return to top button", async () => {
	const item = shallow(<ProcessingLogPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	item.instance().cancelAddEdit();
	await wait(100);
	expect(item.state().action).toBe(ACTION_LIST);
});

test("User can see download link", async () => {
	const item = shallow(<ProcessingLogPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(100);
	expect(item.find("DownloadLinkButton").length).toBe(1);
});

test("User click on download link", async () => {
	const item = shallow(<ProcessingLogPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(100);
	const button = item.find("DownloadLinkButton");
	expect(button.length).toBe(1);
	button.simulate("click");
	expect(mockIsCalledDownloadAPI).toEqual(true);
});
