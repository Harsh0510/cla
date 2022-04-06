// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import RolloverJobPage from "../index";
import Header from "../../../widgets/Header";
import MockRolloverJob from "../../../mocks/MockRolloverJob";
import MockUserRole from "../../../mocks/MockUserRole";
import MockUser from "../../../mocks/MockUser";
import MockRolloverJobFilterData from "../../../mocks/mockRolloverJobFilterData";

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

jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return {
			current: {
				focus: jest.fn(),
				value: "",
				scrollIntoView: jest.fn(),
			},
		};
	};
});

let ACTION_LIST, ACTION_NEW, ACTION_EDIT;
let location, sortingA, sortingD, page, history, mockUserData, mockRolloverJobData, filters;

/** wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

async function defaultApi(endpoint, data) {
	if (endpoint === "/admin/rollover-job-get-filters") {
		if (data === "error") {
			throw "Unknown error";
		}
		return MockRolloverJobFilterData;
	}

	if (endpoint === "/admin/rollover-job-get-all") {
		if (data === "error") {
			throw "Unknown error";
		} else {
			return mockRolloverJobData;
		}
	}

	if (endpoint === "/admin/school-get-ids") {
		if (data === "error") {
			throw "Unknown error";
		}
		return [118708, 118805, 126538, 126658, 131730];
	}

	throw new Error("should never be here");
}

function resetAll() {
	location = {
		search: {
			limit: 10,
			offset: 0,
			sort_field: "title",
			sort_dir: "A",
			loading: true,
			rolloverJobLoaded: false,
			unfiltered_count: 3,
			rolloverJobData: null,
			action: ACTION_NEW,
			message: null,
		},
	};
	history = {
		push: jest.fn(),
	};
	sortingA = [{ direction: "A", columnName: "name" }];
	sortingD = [{ direction: "D", columnName: "name" }];
	page = 2;
	ACTION_LIST = "list";
	ACTION_NEW = "new";
	ACTION_EDIT = "edit";
	mockUserData = MockUser[0];
	mockUserData.role = MockUserRole.claAdmin;
	mockRolloverJobData = MockRolloverJob;
	filters = {
		STATUS: "status",
		QUERY: "query",
		DATE_BEGIN: "date_created_begin",
		DATE_END: "date_created_end",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<RolloverJobPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

/** User getting "Unknown error" while loading */
test('User getting "Unknown error" while loading ', async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/rollover-job-get-all") {
			return defaultApi(endpoint, "error");
		}
		return defaultApi(endpoint, true);
	}
	const item = shallow(<RolloverJobPage location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(100);
	item.update();

	expect(item.state().message).toBe("Unknown error");
});

/** User getting "Unknown error" while loading */
test('User getting "Unknown error" while loading filter data ', async () => {
	mockUserData.role = MockUserRole.claAdmin;

	async function api(endpoint, data) {
		if (endpoint === "/admin/rollover-job-get-filters") {
			return defaultApi(endpoint, "error");
		}
		return defaultApi(endpoint, true);
	}
	const item = shallow(<RolloverJobPage location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(100);
	item.update();

	expect(item.state().message).toBe("Unknown error");
});

/** User click on schedule new rollover button */
test("User click on Schedule new rollover button", async () => {
	const item = shallow(<RolloverJobPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().createRolloverJob();
	const push = item.instance().props.history.push;
	await wait(100);
	item.update();
	item.instance().forceUpdate();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/rollover-management?action=" +
			ACTION_NEW +
			"&id&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&query=&sort_dir=desc&sort_field=target_execution_date"
	);
});

/** User click on cancel button  while ADD Or Edit Form display */
test("User click on cancel button", async () => {
	const item = shallow(<RolloverJobPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().cancelAddEdit();
	const push = item.instance().props.history.push;
	await wait(100);
	item.update();
	item.instance().forceUpdate();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/rollover-management?action=" +
			ACTION_LIST +
			"&id&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&query=&sort_dir=desc&sort_field=target_execution_date"
	);
});

/** User click on delete rollover job */
test("User click on delete button", async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&id=36&sort_dir=dsc&sort_field=target_execution_date";
	async function api(endpoint, data) {
		if (endpoint === "/admin/rollover-job-delete") {
			return {
				result: true,
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<RolloverJobPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const spy = jest.spyOn(item.instance(), "pushHistory");
	item.instance().deleteRolloverJob();
	await wait(100);
	item.update();
	expect(spy).toHaveBeenCalled();
	expect(item.state().query).toBe("");
	expect(item.state().message).toBe("Rollover Job deleted successfully");
});

/** User click on submit for create rollover-job and getting "unknown error" message */
test('User click on submit for create rollover-job and getting "unknown error" message', async () => {
	location.search = "?action=" + ACTION_NEW + "&limit=10&offset=0&oid&sort_dir=dsc&sort_field=target_execution_date";
	async function api(endpoint, data) {
		if (endpoint === "/admin/rollover-job-create") {
			if (data !== "") {
				throw "Unknown error";
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<RolloverJobPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.setState({ action: ACTION_NEW });
	item.instance().handleSubmit({
		126658: "on",
		name: "test",
		pageLimit: "10",
		target_execution_date: "2021-07-21  00:00",
	});
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().message).toEqual("Unknown error");
});

/** User click on submit for create rollover-job when user login with cla-admin */
test("User click on submit for create rollover-job when user login with cla-admin", async () => {
	mockUserData.role = MockUserRole.claAdmin;
	location.search = "?action=" + ACTION_NEW + "&id&limit=10&offset=0&query=&sort_dir=desc&sort_field=target_execution_date";
	async function api(endpoint, data) {
		if (endpoint === "/admin/rollover-job-create") {
			if (data !== "") {
				return {
					success: true,
					id: "24",
				};
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<RolloverJobPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.setState({ action: ACTION_NEW });
	item.instance().handleSubmit({
		126658: "on",
		name: "test",
		pageLimit: "10",
		target_execution_date: Date.UTC(2021, 6, 12, 3, 30, 0, 0),
	});
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().message).toEqual("Rollover for 'test' has been scheduled. Rollover will happen on 12/07/2021 03:30.");
});

/** User click on submit for edit */
test("User clicks submit for edit rollover job when user login with cla-admin", async () => {
	location.search = "?action=" + ACTION_EDIT + "&id=36&limit=10&offset=0&query=&sort_dir=desc&sort_field=target_execution_date";
	async function api(endpoint, data) {
		if (endpoint === "/admin/rollover-job-update") {
			return {
				result: {
					edited: true,
				},
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<RolloverJobPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		id: "36",
		126658: "on",
		name: "test",
		pageLimit: "10",
		target_execution_date: "2021-07-21  00:00",
	});

	item.instance().performQuery = jest.fn();
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.instance().performQuery).toHaveBeenCalled();
});

/** User click on submit for edit and getting the "Unknown error" message */
test('User click on submit for edit and getting the "Unknown error" message', async () => {
	location.search = "?action=" + ACTION_EDIT + "&id=36&limit=10&offset=0&query=&sort_dir=desc&sort_field=target_execution_date";
	async function api(endpoint, data) {
		if (endpoint === "/admin/rollover-job-update") {
			throw "Unknown error";
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<RolloverJobPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		id: "36",
		126658: "on",
		name: "test",
		pageLimit: "10",
		target_execution_date: "2021-07-21  00:00",
	});

	item.instance().performQuery = jest.fn();
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("Unknown error");
});

/** User click on submit for edit and getting the "Record not updated" message*/
test('User click on submit for edit and getting the "Record not updated" message', async () => {
	location.search = "?action=" + ACTION_EDIT + "&id=36&limit=10&offset=0&query=&sort_dir=desc&sort_field=target_execution_date";
	async function api(endpoint, data) {
		if (endpoint === "/admin/rollover-job-update") {
			return {
				result: false,
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<RolloverJobPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		id: "36",
		126658: "on",
		name: "test",
		pageLimit: "10",
		target_execution_date: "2021-07-21  00:00",
	});

	item.instance().performQuery = jest.fn();
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("Record not updated");
});

/** User click on sorting with asecending order from table header field */
test("User click on sorting with ascending order", async () => {
	const item = shallow(<RolloverJobPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	//ascending order
	item.instance().doSorting(sortingA);
	await wait(50);
	item.update();

	//decending order
	item.instance().doSorting(sortingD);

	await wait(50);
	item.update();

	expect(item.state().loading).toBe(true);
});

/** User click on sorting with descending order from table header field */
test("User click on sorting with descending order", async () => {
	const item = shallow(<RolloverJobPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	//decending order
	item.instance().doSorting(sortingD);

	await wait(50);
	item.update();

	expect(item.state().loading).toBe(true);
});

/** User click on pagination page */
test("User click on pagination page", async () => {
	const item = shallow(<RolloverJobPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().doPagination(page, 5);
	await wait(50);
	item.update();

	const push = item.instance().props.history.push;
	const setOffset = (page - 1) * item.state().limit;
	let mockurl =
		"/profile/admin/rollover-management?action=list&id&limit=5&offset=" + setOffset + "&query=&sort_dir=desc&sort_field=target_execution_date";
	await wait(50);

	expect(push.mock.calls[0][0]).toEqual(mockurl);
});

/** User click on jobname for rollover-job link */
test("User click on jobname rollover-job link", async () => {
	let ID = "36";

	const item = shallow(<RolloverJobPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	const attrs = { "data-id": ID };

	item.instance().doOpenEditScreen({ preventDefault: jest.fn(), currentTarget: { getAttribute: (name) => attrs[name], ...attrs } });
	const push = item.instance().props.history.push;
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/rollover-management?action=edit&id=" +
			ID +
			"&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&query=&sort_dir=desc&sort_field=target_execution_date"
	);
});

/** User pass invalid offset and limit value */
test('User pass invalid offset as "-1" and limit value as "0"', async () => {
	//set location search params values
	location.search = "?action=" + ACTION_LIST + "&limit=0&offset=-1&oid&sort_dir=asc&sort_field=title";

	const item = shallow(<RolloverJobPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.update();

	expect(item.state().limit).toEqual(1);
	expect(item.state().offset).toEqual(0);
});

/** User click on delete button and get "unknown error" message */
test('User click on delete button and get "unknown error" message', async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/rollover-job-delete") {
			throw "Unknown Error";
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<RolloverJobPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().deleteRolloverJob();
	await wait(50);
	item.update();

	expect(item.state().message).toEqual("Unknown Error");
});

/** User create rollover-job with name as " test name " */
test('User create rollover-job with name as " test name "', async () => {
	location.search = "?action=" + ACTION_NEW + "&limit=10&offset=0&id&sort_dir=dsc&sort_field=target_execution_date";
	let params = null;
	async function api(endpoint, data) {
		if (endpoint === "/admin/rollover-job-create") {
			params = data;
			if (data !== "") {
				return {
					success: true,
					id: "12",
				};
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<RolloverJobPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		id: "12",
		126658: "on",
		name: "test name",
		pageLimit: "10",
		target_execution_date: "2021-07-21  00:00",
	});
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(params.name).toEqual("test name");
});

/** Component renders correctly with SearchFilters elements*/
test("Component renders correctly with SearchFilters elements", async () => {
	const item = shallow(<RolloverJobPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(10);
	expect(item.find("SearchFilters").length).toBe(1);
});

/** User search anything in filter input text*/
test("User search anything in search  filter input text", async () => {
	const item = shallow(<RolloverJobPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(10);
	const spy = jest.spyOn(item.instance(), "doSearch");
	item.instance().doSearch();
	expect(spy).toHaveBeenCalled();
});

/** User search anything in filter input text and call function*/
test("User search anything in search  filter input text and call function", async () => {
	const item = shallow(<RolloverJobPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(10);
	item.instance().handlefilterSelection("maths", filters.QUERY);
	item.instance().doSearch();
	const push = item.instance().props.history.push;
	let query = push.mock.calls[0][0];
	expect(query.indexOf("&query=`maths`").length !== -1).toBe(true);
});

/** Component renders correctly with SearchFilters elements of status dropdown*/
test("Component renders correctly with SearchFilters elements when user login with cla-admin", async () => {
	const item = shallow(<RolloverJobPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	expect(item.state().statusData).not.toBeNull();
});

/** User filter status called handlefilterSelection */
test("When user filtering status filter", async () => {
	const item = shallow(<RolloverJobPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().handlefilterSelection([{ value: "2", label: "Another School" }], filters.STATUS);
	expect(item.state().selectedStatus).toEqual([{ value: "2", label: "Another School" }]);
});

test("When user clear status filter", async () => {
	const item = shallow(<RolloverJobPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().handlefilterSelection([], filters.STATUS);
	expect(item.state().selectedStatus).toEqual([]);
});

/** User clears all filters */
test("User clears all filters", async () => {
	const item = shallow(<RolloverJobPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const spy = jest.spyOn(item.instance(), "pushHistory");
	item.instance().resetAll();
	expect(spy).toHaveBeenCalled();
	expect(item.state().query).toBe("");
});

test("User filtering and load filter data", async () => {
	location.search = "?action=list&limit=5&offset=0&sort_dir=asc&sort_field=name&id";
	const item = shallow(<RolloverJobPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.setProps({
		location: {
			search:
				"?action=" +
				ACTION_LIST +
				"&filter_status=status1&filter_date_created_begin=1624991400&filter_date_created_end=1624991400&id&offset=0&sort_dir=asc&sort_field=name&id",
		},
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().selected).toEqual({ status: ["status1"], date_created_begin: 1624991400, date_created_end: 1624991400 });
});

/** rollover job name modify  name value*/
test("rollover job name modify  name value", async () => {
	location.search = "?action=" + ACTION_EDIT + "&id=36&limit=10&offset=0&query=&sort_dir=desc&sort_field=target_execution_date";
	const item = shallow(<RolloverJobPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	const name = item.state().fields.name;
	await wait(50);
	item.instance().handleNameInputField("foo", "name");
	item.update();
	item.instance().forceUpdate();
	expect(item.state().fields.name).not.toEqual(name);
});

/** User filter date_created_begin and call function*/
test("User search with date_created_begin filter call function", async () => {
	const item = shallow(<RolloverJobPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(10);
	item.instance().handlefilterSelection("1624991400", filters.DATE_BEGIN);
	item.instance().doSearch();
	const push = item.instance().props.history.push;
	let query = push.mock.calls[0][0];
	expect(query.indexOf("&filter_date_created_begin=`1624991400`").length !== -1).toBe(true);
});

/** User filter date_created_end and call function*/
test("User search with date_created_end filter call function", async () => {
	const item = shallow(<RolloverJobPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(10);
	item.instance().handlefilterSelection("1624991400", filters.DATE_END);
	item.instance().doSearch();
	const push = item.instance().props.history.push;
	let query = push.mock.calls[0][0];
	expect(query.indexOf("&filter_date_created_end=`1624991400`").length !== -1).toBe(true);
});

/** User school filter data*/
test("User saveSchoolSearchFiter", async () => {
	const item = shallow(<RolloverJobPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(10);
	item.instance().saveSchoolSearchFiter({ school_query: "abc", school_filter: {} });
	expect(item.state().school_query).toEqual("abc");
});

test("User select all school from school list", async () => {
	const item = shallow(<RolloverJobPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(10);
	item.instance().onChangeSelectedAllCheckbox();
	await wait(20);
	expect(item.state().selectedSchoolIds).toEqual(["118708", "118805", "126538", "126658", "131730"]);
});

test("User select school by checked checkbox from school list", async () => {
	const item = shallow(<RolloverJobPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(10);
	let ID = "118708";
	const attrs = { "data-school-id": ID };
	item.instance().onChangeSchoolCheckBox({ preventDefault: jest.fn(), currentTarget: { getAttribute: (name) => attrs[name], ...attrs } });
	await wait(20);
	expect(item.state().selectedSchoolIds).toEqual(["118708"]);
});
