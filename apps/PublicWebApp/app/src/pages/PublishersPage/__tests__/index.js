// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import PublisherPage from "../index";
import Header from "../../../widgets/Header";
import MockPublisherList from "../../../mocks/MockPublisherList";
import MockUser from "../../../mocks/MockUser";

let location, sortingA, sortingD, page, limit, history, mockFormData, mockUserData;
const ACTION_LIST = "list";
const ACTION_EDIT = "edit";

// Mock import
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withAdminAuthRequiredConsumer", () => {
	return function (acceptedRoles, WrappedComponent) {
		if (!Object.keys(acceptedRoles).length == 1) {
			throw "It should be passed acceptedToles with a single key";
		}
		if (!acceptedRoles.hasOwnProperty("cla-admin")) {
			throw "It should be passed acceptedToles with a key: cla-admin";
		}
		return WrappedComponent;
	};
});
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/smoothScroll", () => jest.fn());
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
	if (endpoint === "/admin/publisher-get-all") {
		if (data === "error") {
			throw "Unknown error";
		} else {
			return {
				data: MockPublisherList.data,
				unfiltered_count: MockPublisherList.unfiltered_count,
			};
		}
	}
	if (endpoint === "/admin/publisher-update") {
		return { result: true };
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
	mockUserData = MockUser[0];
	sortingA = [{ direction: "asc", columnName: "contact_name" }];
	sortingD = [{ direction: "desc", columnName: "contact_name" }];
	page = 2;
	limit = 10;
	history = {
		push: jest.fn(),
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders */
test("Component renders correctly", async () => {
	const item = shallow(<PublisherPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

/** Component render listing publisher and getting the unknown error */
test("Component render listing publisher and getting the unknown error", async () => {
	location.search = "?action=list&limit=-1&offset=-1&sort_dir=asc&sort_field=contact_name&id";
	async function api(endpoint, data) {
		if (endpoint === "/admin/publisher-get-all") {
			return defaultApi(endpoint, "error");
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<PublisherPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.update();
	expect(item.state().message).toEqual("Unknown error");
});

/** When user click on Search button and do serching */
test("When user click on Search button and do serching", async () => {
	const item = shallow(<PublisherPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().handlefilterSelection("search_value", "query");
	expect(item.state().query).toEqual("search_value");
});

/** When user click on reset button and reset search-query */
test("When user click on reset button and reset search-query", async () => {
	const item = shallow(<PublisherPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().resetAll();
	expect(item.state().query).toEqual("");
});

/** User search anything in filter input text*/
test("User search anything in search user filter input text", async () => {
	const item = shallow(<PublisherPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(10);
	const spy = jest.spyOn(item.instance(), "doSearch");
	item.instance().doSearch("Group");
	expect(spy).toHaveBeenCalled();
});

/** User search publisher and call push histroy function*/
test("User search anything in search filter input text and call function", async () => {
	const item = shallow(<PublisherPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(10);
	item.instance().doSearch("Group");
	const push = item.instance().props.history.push;
	let query = push.mock.calls[0][0];
	expect(query.indexOf("&query=`Group`").length !== -1).toBe(true);
});

/** User click on Edit for publisher link */
test("User click on edit publisher link", async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=-1&offset=-1&sort_dir=A&sort_field=contact_name&id=1";
	const item = shallow(<PublisherPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	const attrs = { "data-pid": "1" };

	item.instance().doOpenEditScreen({ preventDefault: jest.fn(), currentTarget: { getAttribute: (name) => attrs[name], ...attrs } });
	const push = item.instance().props.history.push;

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/publishers?action=edit&id=1&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&query&sort_dir=A&sort_field=contact_name"
	);
});

/** User click on cancel button */
test("User click on cancel button", async () => {
	const item = shallow(<PublisherPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().cancelAddEdit();
	const push = item.instance().props.history.push;

	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/publishers?action=" +
			ACTION_LIST +
			"&id&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&query&sort_dir=A&sort_field=name"
	);
});

/** Component load wrong limit and offset values */
test("Component load wrong limit and offset values", async () => {
	location.search = "?action=new&limit=1&offset=-1&sort_dir=A&sort_field=name&id=1";
	const item = shallow(<PublisherPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	item.setProps({ location: { search: "?action=new&limit=-1&offset=-1&sort_dir=A&sort_field=name&id=1" } });
	await wait(20);
	item.update();

	expect(item.state().limit).toEqual(1);
});

/** User click on sorting */
test("User click on sorting", async () => {
	const item = shallow(<PublisherPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	//ascending order
	item.instance().doSorting(sortingA);
	await wait(50);
	item.update();

	expect(item.state().offset).toBe(0);
});

test("User click on sorting for descending order", async () => {
	const item = shallow(<PublisherPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	const spy = jest.spyOn(item.instance(), "pushHistory");
	await wait(20);
	//decending order
	item.instance().doSorting(sortingD);
	await wait(50);
	item.update();

	expect(spy).toHaveBeenCalled();
});

/** User click on pagination page */
test("User click on pagination page", async () => {
	const item = shallow(<PublisherPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().doPagination(page, limit);

	const push = item.instance().props.history.push;
	const setOffset = (page - 1) * item.state().limit;
	await wait(50);
	item.update();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/publishers?action=list&id&limit=" +
			item.state().limit +
			"&offset=" +
			setOffset +
			"&query&sort_dir=" +
			item.state().sort_dir +
			"&sort_field=" +
			item.state().sort_field +
			""
	);
});

/** User not getting the message "No data found"*/
test('User not getting the message "No data found"', async () => {
	location.search = "?action=list&limit=10&offset=0&sort_dir=asc&sort_field=contact_name&id";
	async function api(endpoint, data) {
		if (endpoint === "/admin/publisher-get-all") {
			return { data: [], unfiltered_count: 0 };
		}
		return defaultApi(endpoint, true);
	}
	const item = shallow(<PublisherPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.update();
	expect(item.state().message).toEqual("No data found");
});

/** User update the existing publisher details successfully*/
test("User update the existing publisher details successfully", async () => {
	location.search = "?action=edit&id=1&limit=10&offset=0&query&sort_dir=A&sort_field=name";
	const item = shallow(<PublisherPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().handleSubmit({
		buy_book_rules: ["www.gmail.com", "www.facebook.com"],
	});
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("Successfully updated");
});

/** User getting the message "Record not Update" while updateing the existing record */
test('User getting the message "Record not Update"', async () => {
	location.search = "?action=edit&id=1&limit=10&offset=0&query&sort_dir=A&sort_field=name";
	async function customApi(endpoint, data) {
		if (endpoint === "/admin/publisher-get-all") {
			return {
				data: MockPublisherList.data,
				unfiltered_count: MockPublisherList.unfiltered_count,
			};
		}
		if (endpoint === "/admin/publisher-update") {
			return { result: false };
		}
	}
	const item = shallow(<PublisherPage location={location} api={customApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().handleSubmit({
		buy_book_rules: ["www.gmail.com", "www.facebook.com"],
	});
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("Record not updated");
});

/** User getting the message "No fields changed" while updateing the existing record */
test('User getting the message "No fields changed"', async () => {
	location.search = "?action=edit&id=1&limit=10&offset=0&query&sort_dir=A&sort_field=name";
	async function customApi(endpoint, data) {
		if (endpoint === "/admin/publisher-get-all") {
			return {
				data: MockPublisherList.data,
				unfiltered_count: MockPublisherList.unfiltered_count,
			};
		}
		if (endpoint === "/admin/publisher-update") {
			throw new Error("No fields changed");
		}
	}
	const item = shallow(<PublisherPage location={location} api={customApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().handleSubmit({
		buy_book_rules: ["www.google.com", "www.facebook.com"],
	});
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("Error: No fields changed");
});

test("User only update the temp_unlock_opt_in in existing publisher details successfully", async () => {
	location.search = "?action=edit&id=1&limit=10&offset=0&query&sort_dir=A&sort_field=name";
	const item = shallow(<PublisherPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().handleSubmit({
		temp_unlock_opt_in: true,
	});
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("Successfully updated");
});
