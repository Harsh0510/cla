// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import RegistrationQueuePage from "../index";
import Header from "../../../widgets/Header";
import USERDATA from "../../../mocks/MockUser";
import MockUserRole from "../../../mocks/MockUserRole";
import MockStatusFilterData from "../../../mocks/MockStatusFilterData";
import MockUserSearchFilterData from "../../../mocks/MockUserSearchFilterData";
import AdminPageMessage from "../../../widgets/AdminPageMessage";

let MOCKUSERFORMDATA = [
	{
		role: ["teacher", "admin"],
	},
];

let location, sortingA, sortingD, page, history, mockFormData, mockUserData, filters, limit;

// Mock import
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

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
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);

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

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

async function defaultApi(endpoint, data) {
	if (endpoint === "/auth/user-get-all") {
		if (data === "error") {
			throw "Unknown error";
		} else {
			return {
				result: true,
				data: USERDATA,
				unfiltered_count: 3,
			};
		}
	}
	if (endpoint === "/auth/user-get-filters") {
		if (data === "error") {
			throw "Unknown error";
		}
		return MockUserSearchFilterData;
	}

	// This will be caught by the promise in the component
	throw new Error("should never be here");
}

/**
 * Reset function
 */
function resetAll() {
	location = {
		search: "",
	};
	sortingA = [{ direction: "asc", columnName: "first_name" }];
	sortingD = [{ direction: "desc", columnName: "first_name" }];
	page = 2;
	history = {
		push: jest.fn(),
	};
	mockFormData = [];
	mockUserData = USERDATA[0];
	filters = {
		SCHOOL: "school",
		ROLES: "roles",
		QUERY: "query",
		STATUS: "status",
	};
	limit = 5;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<RegistrationQueuePage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

/** User click for do Reject */
/** doReject*/
test("User click for Rejected", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-reject") {
			return true;
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<RegistrationQueuePage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	const attrs = { "data-email": "email@email.com" };

	item.instance().doReject({
		preventDefault: jest.fn(),
		target: { getAttribute: (name) => attrs[name], ...attrs },
	});
	await wait(50);
	item.update();

	expect(item.state().message).toEqual("User rejected");
});

test("User click for Rejected and getting exception error", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-reject") {
			throw "unknown error";
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<RegistrationQueuePage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	const attrs = { "data-email": "email@email.com" };

	item.instance().doReject({
		preventDefault: jest.fn(),
		target: { getAttribute: (name) => attrs[name], ...attrs },
	});
	await wait(100);
	item.update();

	expect(item.state().message).toEqual(`unknown error`);
});

/** User click on link button for verify email*/
/** doResendVerify */
test("User click on link button for verify email", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-resend-registration") {
			return {
				result: true,
			};
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<RegistrationQueuePage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	const attrs = { "data-email": "email@email.com" };

	item.instance().doResendVerify({
		preventDefault: jest.fn(),
		target: { getAttribute: (name) => attrs[name], ...attrs },
	});
	await wait(50);
	item.update();

	expect(item.state().message).toBe("Verification email resent");
});

test("User click on link button for verify email and getting exception error", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-resend-registration") {
			throw "unknown error";
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<RegistrationQueuePage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	const attrs = { "data-email": "email@email.com" };

	item.instance().doResendVerify({
		preventDefault: jest.fn(),
		target: { getAttribute: (name) => attrs[name], ...attrs },
	});
	await wait(50);
	item.update();

	expect(item.state().message).toEqual(`unknown error`);
});

/** User click on link for resend password*/
/** doResendSetPassword */
test("User click on link for resend password", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-resend-registration") {
			return { result: true };
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<RegistrationQueuePage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	const attrs = { "data-email": "email@email.com" };

	item.instance().doResendSetPassword({
		preventDefault: jest.fn(),
		target: { getAttribute: (name) => attrs[name], ...attrs },
	});
	await wait(50);
	item.update();

	expect(item.state().message).toEqual(`'Set password' email resent`);
});

test("User click on link for resend password and getting exception error", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-resend-registration") {
			throw "unknown error";
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<RegistrationQueuePage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	const attrs = { "data-email": "email@email.com" };

	item.instance().doResendSetPassword({
		preventDefault: jest.fn(),
		target: { getAttribute: (name) => attrs[name], ...attrs },
	});
	await wait(50);
	item.update();

	expect(item.state().message).toEqual(`unknown error`);
});

/** User click on button to dismiss the approve email  */
test("User click on button to dismiss the approve email", async () => {
	const item = shallow(
		<RegistrationQueuePage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);

	item.instance().doDismissApprove({ preventDefault: jest.fn() });
	await wait(50);
	item.update();

	expect(item.state().approvingOid).toEqual(null);
});

/** User click on button for approve email */
test("User click on button for approve email", async () => {
	const item = shallow(
		<RegistrationQueuePage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);

	const attrs = { "data-email": "email@email.com" };

	item.instance().doInitApprove({
		preventDefault: jest.fn(),
		target: { getAttribute: (name) => attrs[name], ...attrs },
	});
	await wait(100);
	item.update();

	expect(item.state().approvingOid).toEqual(attrs["data-email"]);
});

/** User\'semail approve */
/** doCompleteApprove*/
test("User's email approve", async () => {
	mockFormData = MOCKUSERFORMDATA;
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-approve") {
			return true;
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<RegistrationQueuePage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().doCompleteApprove({ preventDefault: jest.fn() });

	await wait(50);
	item.update();

	expect(item.state().approvingOid).toEqual(null);
});

test("User's send email of approve but getting exception error", async () => {
	mockFormData = MOCKUSERFORMDATA;
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-approve") {
			throw "unknown error";
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<RegistrationQueuePage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().doCompleteApprove({ preventDefault: jest.fn() });

	await wait(50);
	item.update();

	expect(item.state().message).toEqual(`unknown error`);
});

/** User click on sorting */
test("User click on sorting", async () => {
	const item = shallow(
		<RegistrationQueuePage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);

	//ascending order
	item.instance().doSorting(sortingA);
	await wait(50);
	item.update();
	expect(item.state().offset).toBe(0);
	item.instance().doSorting(sortingD);
	await wait(50);
	item.update();
	expect(item.state().offset).toBe(0);
});

/** User click on pagination page */
test("User click on pagination page", async () => {
	const item = shallow(
		<RegistrationQueuePage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);

	await wait(50);
	item.instance().doPagination(page, limit);

	const push = item.instance().props.history.push;
	const setOffset = (page - 1) * item.state().limit;
	await wait(50);
	item.update();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/registration-queue?limit=5&offset=" +
			setOffset +
			"&query=&sort_dir=" +
			item.state().sort_dir +
			"&sort_field=" +
			item.state().sort_field +
			""
	);
});

/** Component load wrong limit and offset values */
test("Component load wrong limit and offset values", async () => {
	const item = shallow(
		<RegistrationQueuePage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);

	item.setProps({
		location: { search: "?limit=-1&offset=-1&sort_dir=asc&sort_field=email" },
	});
	await wait(50);
	item.update();

	expect(item.state().limit).toEqual(1);
});

/** Default sorting by School for cla-admin user */
test("Default sorting by School for cla-admin user", async () => {
	mockUserData.role = MockUserRole.claAdmin;
	const item = shallow(
		<RegistrationQueuePage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.update();
	expect(item.state().sort_field).toEqual("school");
});

/** No result found for cla-admin user */
test("Default sorting by School for cla-admin user", async () => {
	mockUserData.role = MockUserRole.claAdmin;
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-get-all") {
			return {
				data: [],
				unfiltered_count: 0,
			};
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(<RegistrationQueuePage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.update();
	const adminPageMessage = item.find("AdminPageMessage");
	expect(item.containsMatchingElement(AdminPageMessage)).toBe(true);
	expect(adminPageMessage.length).toEqual(1);
	expect(adminPageMessage.props().children).toEqual("No results found");
});

/** User get Unknown error while loading the filter data*/
test("User get Unknown error while loading the filter data", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-get-filters") {
			return defaultApi(endpoint, "error");
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(<RegistrationQueuePage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().message).toEqual("Unknown error");
});

/** Component renders correctly with UserSearchFilters elements*/
test("Component renders correctly with UserSearchFilters elements", async () => {
	const item = shallow(
		<RegistrationQueuePage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(10);
	expect(item.find("UserSearchFilters").length).toBe(1);
});

/** User search anything in search user filter input text */
test("User search anything in search user filter input text", async () => {
	const item = shallow(
		<RegistrationQueuePage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(10);
	const spy = jest.spyOn(item.instance(), "doSearch");
	item.instance().doSearch();
	expect(spy).toHaveBeenCalled();
});

/** User search anything in search filter input text and call function*/
test("User search anything in search filter input text and call function", async () => {
	const item = shallow(
		<RegistrationQueuePage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(10);
	item.instance().handlefilterSelection("cla-admin", filters.QUERY);
	item.instance().doSearch();
	const push = item.instance().props.history.push;
	let query = push.mock.calls[0][0];
	expect(query.indexOf("&query=`cla-admin`").length !== -1).toBe(true);
});

/** Component renders correctly with UserSearchFilters elements of roles and schools dropdown*/
test("Component renders correctly with UserSearchFilters elements when user login with cla-admin", async () => {
	mockUserData.role = MockUserRole.claAdmin;
	const item = shallow(
		<RegistrationQueuePage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	expect(item.state().schoolData).not.toBeNull();
	expect(item.state().rolesData).not.toBeNull();
});

test("Component renders correctly with UserSearchFilters elements when user login with school-admin", async () => {
	mockUserData.role = MockUserRole.schoolAdmin;
	const item = shallow(
		<RegistrationQueuePage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	expect(item.state().schoolData).toBe(undefined);
	expect(item.state().rolesData).not.toBeNull();
});

///start here
test("When user filtering school filter", async () => {
	const item = shallow(
		<RegistrationQueuePage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.instance().handlefilterSelection([{ value: "2", label: "Another School" }], filters.SCHOOL);
	expect(item.state().selectedSchools).toEqual([{ value: "2", label: "Another School" }]);
});

test("When user clear school filter", async () => {
	const item = shallow(
		<RegistrationQueuePage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.instance().handlefilterSelection([], filters.SCHOOL);
	expect(item.state().selectedSchools).toEqual([]);
});

test("When user filtering roles filter", async () => {
	const item = shallow(
		<RegistrationQueuePage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.instance().handlefilterSelection([{ value: "teacher", label: "Teacher" }], filters.ROLES);
	expect(item.state().selectedRoles).toEqual([{ value: "teacher", label: "Teacher" }]);
});

test("When user clear roles filter", async () => {
	const item = shallow(
		<RegistrationQueuePage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.instance().handlefilterSelection([], filters.ROLES);
	expect(item.state().selectedRoles).toEqual([]);
});

/** User also filter the only school and roles*/
test("User filtering only only school and roles", async () => {
	const item = shallow(
		<RegistrationQueuePage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.instance().handlefilterSelection([{ value: "teacher", label: "Teacher" }], filters.ROLES);
	item.instance().handlefilterSelection([{ value: "2", label: "Another School" }], filters.SCHOOL);
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
	expect(query.indexOf("&filter_schools=`2`").length !== -1).toBe(true);
	expect(query.indexOf("&filter_roles=`teacher`").length !== -1).toBe(true);
});

/** User also filter the only school*/
test("User filtering only school filter", async () => {
	const item = shallow(
		<RegistrationQueuePage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.instance().handlefilterSelection([{ value: "2", label: "Another School" }], filters.SCHOOL);
	await wait(20);
	item.update();
	item.instance().forceUpdate();

	item.instance().doSearch();
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	const push = item.instance().props.history.push;
	let query = push.mock.calls[0][0];
	expect(query.indexOf("&filter_schools=`2`").length !== -1).toBe(true);
});

/** User clears all filters */
test("User clears all filters", async () => {
	const item = shallow(
		<RegistrationQueuePage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	const spy = jest.spyOn(item.instance(), "pushHistory");
	item.instance().resetAll();
	expect(spy).toHaveBeenCalled();
	expect(item.state().query).toBe("");
});

test("User filtering and load filter data", async () => {
	mockUserData.role = MockUserRole.claAdmin;
	location.search = "?action=list&limit=5&offset=0&sort_dir=asc&sort_field=email&userOid";
	const item = shallow(
		<RegistrationQueuePage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.setProps({
		location: {
			search: "?filter_schools=2&filter_roles=teacher&limit=5&offset=0&sort_dir=asc&sort_field=email&userOid",
		},
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().selected).toEqual({
		schools: [2],
		roles: ["teacher"],
		status: [],
	});
});

test("User filtering with status filter", async () => {
	const item = shallow(
		<RegistrationQueuePage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.instance().handlefilterSelection([MockStatusFilterData[0]], filters.STATUS);
	expect(item.state().selectedStatus).toEqual([MockStatusFilterData[0]]);
});

test("User filtering with status filter", async () => {
	const item = shallow(
		<RegistrationQueuePage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.instance().handlefilterSelection([], filters.STATUS);
	expect(item.state().selectedStatus).toEqual([]);
});

test("User search with all filters options and get the records", async () => {
	//location = { search : "?filter_roles=teacher&filter_schools=1&filter_status=unverified&limit=10&offset=0&query=Test&sort_dir=A&sort_field=school" };
	mockUserData = USERDATA[3];
	const item = shallow(
		<RegistrationQueuePage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.setProps({
		location: {
			search: "?filter_roles=teacher&filter_schools=1&filter_status=unverified&limit=10&offset=0&query=Test&sort_dir=A&sort_field=school",
		},
	});
	await wait(100);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().selectedSchools).toEqual([{ value: 1, label: "Test School 1", key: 1 }]);
	expect(item.state().selectedRoles).toEqual([{ value: "teacher", label: "User", key: "teacher" }]);
	expect(item.state().selectedStatus).toEqual([{ value: "unverified", label: "Unverified", key: "unverified" }]);
	expect(item.state().limit).toEqual(10);
	expect(item.state().searchFilterText).toEqual(
		`Showing 1-3 of 3 results for \"Test\" where School = \"Test School 1\" AND Role = \"User\" AND Status = \"Unverified\"`
	);
});

test("User search with all filters options but no records found", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-get-all") {
			return {
				data: [],
				unfiltered_count: 0,
			};
		}
		return defaultApi(endpoint, data);
	}
	mockUserData = USERDATA[3];
	const item = shallow(<RegistrationQueuePage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.setProps({
		location: {
			search: "?filter_roles=teacher&filter_schools=28%2C65&filter_status=unverified&limit=10&offset=0&query=Test&sort_dir=A&sort_field=school",
		},
	});
	await wait(100);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().selectedSchools).toEqual([{ value: 1, label: "Test School 1", key: 1 }]);
	expect(item.state().selectedRoles).toEqual([{ value: "teacher", label: "User", key: "teacher" }]);
	expect(item.state().selectedStatus).toEqual([{ value: "unverified", label: "Unverified", key: "unverified" }]);
	expect(item.state().limit).toEqual(10);
	expect(item.state().searchFilterText).toEqual(``);

	const adminPageMessage = item.find("AdminPageMessage");
	expect(item.containsMatchingElement(AdminPageMessage)).toBe(true);
	expect(adminPageMessage.length).toEqual(1);
	expect(adminPageMessage.props().children).toEqual("No results found");
});

test("User search with only query and get the records", async () => {
	const item = shallow(
		<RegistrationQueuePage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.setProps({
		location: {
			search: "?limit=10&offset=0&query=Test&sort_dir=A&sort_field=school",
		},
	});
	await wait(100);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().selectedRoles).toEqual([]);
	expect(item.state().selectedStatus).toEqual([]);
	expect(item.state().query).toEqual("Test");
	expect(item.state().limit).toEqual(10);
	expect(item.state().searchFilterText).toEqual(`Showing 1-3 of 3 results for \"Test\" where School = \"Test School 1\"`);
});

test("User search with only query but no records found", async () => {
	location = {
		search: "?limit=10&offset=0&query=&sort_dir=A&sort_field=school",
	};
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-get-all") {
			return {
				data: [],
				unfiltered_count: 0,
			};
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<RegistrationQueuePage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.setProps({
		location: {
			search: "?limit=10&offset=0&query=Test&sort_dir=A&sort_field=school",
		},
	});
	await wait(100);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().selectedRoles).toEqual([]);
	expect(item.state().selectedStatus).toEqual([]);
	expect(item.state().query).toEqual("Test");
	expect(item.state().limit).toEqual(10);
	expect(item.state().searchFilterText).toEqual(``);

	const adminPageMessage = item.find("AdminPageMessage");
	expect(item.containsMatchingElement(AdminPageMessage)).toBe(true);
	expect(adminPageMessage.length).toEqual(1);
	expect(adminPageMessage.props().children).toEqual("No results found");
});
