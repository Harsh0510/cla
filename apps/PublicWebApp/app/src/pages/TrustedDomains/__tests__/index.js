// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import Header from "../../../widgets/Header";
import TrustedDomains from "../index";
import MockTrustedDomains from "../../../mocks/MockTrustedDomains";
import MockSchoolList from "../../../mocks/mockSchoolList";
import MockUserRole from "../../../mocks/MockUserRole";
import MockUser from "../../../mocks/MockUser";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/smoothScroll", () => jest.fn());
jest.mock("../../../common/withAdminAuthRequiredConsumer", () => {
	return function (acceptedRoles, WrappedComponent) {
		if (!Object.keys(acceptedRoles).length == 1) {
			throw "It should be passed acceptedToles with a single key";
		}
		if (!acceptedRoles.hasOwnProperty("cla-admin")) {
			throw "It should be passed acceptedToles with a key: cla-admin || school-admin || teacher";
		}
		return WrappedComponent;
	};
});

let ACTION_LIST, ACTION_NEW, ACTION_EDIT;
let location, sortingA, sortingD, page, limit, history, mockUserData, mockTrustedDomainsData;

/** wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

async function defaultApi(endpoint, data) {
	// endpoints
	if (endpoint === "/admin/trusted-domain-get-all") {
		if (data) {
			return mockTrustedDomainsData;
		} else {
			return {
				data: [],
				unfiltered_count: 0,
			};
		}
	}
	if (endpoint === "/auth/get-schools") {
		return MockSchoolList;
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
			isLoaded: false,
			unfiltered_count: 3,
			resultData: null,
			action: ACTION_LIST,
			message: null,
		},
	};
	history = {
		push: jest.fn(),
	};
	sortingA = [{ direction: "A", columnName: "title" }];
	sortingD = [{ direction: "D", columnName: "title" }];
	page = 2;
	limit = 10;
	ACTION_LIST = "list";
	ACTION_NEW = "new";
	ACTION_EDIT = "edit";
	mockUserData = MockUser[0];
	mockUserData.role = MockUserRole.claAdmin;
	mockTrustedDomainsData = MockTrustedDomains;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<TrustedDomains location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

test("Renders craete domain button correctly", async () => {
	const item = shallow(<TrustedDomains location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	item.setState({ filters: 1 });
	expect(item.find("Button").props().setBottom).toBe(0);
});

/** Component renders correctly */
test("Component renders correctly without blank data", async () => {
	async function api(endpoint, data) {
		return defaultApi(endpoint, false);
	}
	const item = shallow(<TrustedDomains location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	item.update();

	expect(item.state().message).toEqual("No data found");
});

/** When user click on Search button and do serching */
test("When user click on Search button and do serching", async () => {
	const item = shallow(<TrustedDomains location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().handlefilterSelection("search_value", "query");
	expect(item.state().query).toEqual("search_value");
});

/** When user click on reset button and reset search-query */
test("When user click on reset button and reset search-query", async () => {
	const item = shallow(<TrustedDomains location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().resetAll();
	expect(item.state().query).toEqual("");
});

/** User click on create button */
test("User click on create button", async () => {
	const item = shallow(<TrustedDomains location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().createTrustedDomain();
	const push = item.instance().props.history.push;
	await wait(100);
	item.update();
	item.instance().forceUpdate();
	expect(push.mock.calls[0][0]).toEqual("/profile/admin/trusted-domains?action=new&limit=10&offset=0&oid&query&sort_dir=asc&sort_field=domain");
});

/** User click on cancel button  while ADD Or Edit Form display */
test("User click on cancel button", async () => {
	const item = shallow(<TrustedDomains location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().cancelAddEdit();
	const push = item.instance().props.history.push;
	await wait(100);
	item.update();
	item.instance().forceUpdate();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/trusted-domains?action=" +
			ACTION_LIST +
			"&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&oid&query&sort_dir=asc&sort_field=domain"
	);
});

/** User click on delete Trusted Domain data */
test("User click on delete button", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/trusted-domain-delete") {
			return {
				result: true,
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<TrustedDomains location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().deleteData();

	await wait(50);
	item.update();

	expect(item.state().message).toEqual("Trusted Domain deleted successfully");
});

/** User click on delete button abd get exception error */
test("User click on delete button abd get exception error", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/trusted-domain-delete") {
			throw "unknown error";
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<TrustedDomains location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().deleteData();

	await wait(50);
	item.update();

	expect(item.state().message).toEqual(`unknown error`);
});

/** User click on submit for create Trusted Domain */
test("User click on submit for create but return exception", async () => {
	location.search = "?action=" + ACTION_NEW + "&limit=10&offset=0&oid&sort_dir=A&sort_field=title";
	async function api(endpoint, data) {
		if (endpoint === "/admin/trusted-domain-create") {
			throw "Unknown error";
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<TrustedDomains location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		school_id: 5,
		domain: "email.com",
	});
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().message).toEqual("Unknown error");
});

/** User click on submit for create Trusted Domain */
test("User click on submit for create Trusted Domain", async () => {
	location.search = "?action=" + ACTION_NEW + "&limit=10&offset=0&oid&sort_dir=A&sort_field=title";
	async function api(endpoint, data) {
		if (endpoint === "/admin/trusted-domain-create") {
			if (data !== "") {
				return {
					ID: 5,
					success: true,
				};
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<TrustedDomains location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		school_id: 5,
		domain: "email.com",
	});
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().message).toEqual("Trusted Domain added successfully");
});

/** User clicks submit for update domain details*/
test("User clicks submit for update domain details", async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&oid=2&sort_dir=asc&sort_field=school_name";
	async function api(endpoint, data) {
		if (endpoint === "/admin/trusted-domain-update") {
			return {
				result: true,
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<TrustedDomains location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		id: 2,
		school_id: 3,
		domain: "email1.com",
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("Trusted Domain updated successfully");
});

test("User clicks submit for update domain details and return exception error", async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&oid=2&sort_dir=desc&sort_field=school_name";
	async function api(endpoint, data) {
		if (endpoint === "/admin/trusted-domain-update") {
			throw "Unknown error";
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<TrustedDomains location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		id: 2,
		school_id: 3,
		domain: "email1.com",
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("Unknown error");
});

/** User click on sorting with asecending order from table header field */
test("User click on sorting with ascending order", async () => {
	const item = shallow(<TrustedDomains location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

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

/** User click on pagination page */
test("User click on pagination page", async () => {
	const item = shallow(<TrustedDomains location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().doPagination(page, limit);
	//if we don't pass the page
	//item.instance().doPaginationPageCountChange();
	await wait(50);
	item.update();

	const push = item.instance().props.history.push;
	const setOffset = (page - 1) * item.state().limit;
	let mockurl = "/profile/admin/trusted-domains?action=list&limit=10&offset=" + setOffset + "&oid&query&sort_dir=asc&sort_field=domain";
	await wait(50);

	expect(push.mock.calls[0][0]).toEqual(mockurl);
});

/** User pass invalid limit and offset value */
test("User pass invalid limit and offset value", async () => {
	location.search = "?action=" + ACTION_LIST + "&limit=0&offset=-10&oid&sort_dir=d&sort_field=domain";
	async function api(endpoint, data) {
		if (endpoint === "/admin/trusted-domain-get-all") {
			if (data !== "") {
				return {
					ID: 5,
				};
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<TrustedDomains location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().limit).toEqual(1);
	expect(item.state().offset).toEqual(0);
});

/** User click on Edit Icon from list*/
test("User click on Edit Icon from list", async () => {
	//mock oid
	let ID = 2;

	const item = shallow(<TrustedDomains location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	const attrs = { "data-oid": ID };

	item.instance().doOpenEditScreen({ preventDefault: jest.fn(), currentTarget: { getAttribute: (name) => attrs[name], ...attrs } });
	const push = item.instance().props.history.push;
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/trusted-domains?action=edit&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&oid=" +
			ID +
			"&query&sort_dir=" +
			item.state().sort_dir +
			"&sort_field=" +
			item.state().sort_field
	);
});

/** User click on sorting with descending order from table header field */
test("User click on sorting with descending order", async () => {
	const item = shallow(<TrustedDomains location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	//decending order
	item.instance().doSorting(sortingD);
	await wait(50);
	item.update();

	expect(item.state().loading).toBe(true);
});

/** Component renders correctly with filterSearchBar elements*/
test("Component renders correctly with filterSearchBar elements", async () => {
	const item = shallow(<TrustedDomains location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(10);
	expect(item.find("FilterSearchBar").length).toBe(1);
});

/** User search anything in filter input text*/
test("User search anything in search domain filter input text", async () => {
	const item = shallow(<TrustedDomains location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(10);
	const spy = jest.spyOn(item.instance(), "doSearch");
	item.instance().doSearch();
	expect(spy).toHaveBeenCalled();
});

/** User search anything in filter input text and call function*/
test("User search anything in search domain filter input text and call function", async () => {
	const item = shallow(<TrustedDomains location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(10);
	item.instance().doSearch("CLA School B");
	const push = item.instance().props.history.push;
	let query = push.mock.calls[0][0];
	expect(query.indexOf("&query=`CLA School B`").length !== -1).toBe(true);
});
