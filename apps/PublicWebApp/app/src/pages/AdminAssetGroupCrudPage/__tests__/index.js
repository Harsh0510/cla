// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import Header from "../../../widgets/Header";
import MockUser from "../../../mocks/MockUser";
import MockAssetGroupAll from "../../../mocks/MockAssetGroupAll";
import AdminAssetGroupCrud from "../index";

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
let ACTION_LIST, ACTION_EDIT;
let location, sortingA, sortingD, page, limit, history, mockUserData, mockAssetGroupData;

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

async function defaultApi(endpoint, data) {
	// endpoints
	if (endpoint === "/admin/asset-group-get-all") {
		if (data) {
			return mockAssetGroupData;
		} else {
			return {
				data: [],
				unfiltered_count: 0,
			};
		}
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
			unfiltered_count: "5",
			assetData: MockAssetGroupAll,
			action: ACTION_LIST,
			message: null,
		},
	};
	history = {
		push: jest.fn(),
	};
	sortingA = [{ direction: "A", columnName: "title" }];
	sortingD = [{ direction: "desc", columnName: "title" }];
	page = 2;
	limit = 10;
	ACTION_LIST = "list";
	ACTION_EDIT = "edit";
	mockUserData = MockUser[0];
	mockUserData.role = "cla-admin";
	mockAssetGroupData = MockAssetGroupAll;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<AdminAssetGroupCrud location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

/** When user click on Search button and do serching */
test("When user click on Search button and do serching", async () => {
	const item = shallow(
		<AdminAssetGroupCrud location={location} api={defaultApi} history={history} hide={true} withAuthConsumer_myUserDetails={mockUserData} />
	);

	item.instance().handlefilterSelection("search_value", "query");
	expect(item.state().query).toEqual("search_value");
});

/** When user Close the Item Add/Edit */
test("When user closes Add/Edit item form", async () => {
	const item = shallow(
		<AdminAssetGroupCrud location={location} api={defaultApi} history={history} hide={true} withAuthConsumer_myUserDetails={mockUserData} />
	);

	item.instance().cancelAddEdit();
	const push = item.instance().props.history.push;
	const mockurl = "/profile/admin/asset-groups?action=list&id&limit=10&offset=0&query&sort_dir=A&sort_field=title";
	expect(push.mock.calls[0][0]).toEqual(mockurl);
});

/** When user click on reset button and reset search-query */
test("When user click on reset button and reset search-query", async () => {
	const item = shallow(
		<AdminAssetGroupCrud location={location} api={defaultApi} history={history} hide={true} withAuthConsumer_myUserDetails={mockUserData} />
	);

	item.instance().resetAll();
	expect(item.state().query).toEqual("");
});

/** When user click on Edit button in asset */
test("When user click on Edit button in asset", async () => {
	//mock oid
	let oID = mockAssetGroupData.data[0].id;

	const item = shallow(
		<AdminAssetGroupCrud location={location} api={defaultApi} history={history} hide={true} withAuthConsumer_myUserDetails={mockUserData} />
	);

	const attrs = { "data-oid": oID };
	item.instance().doOpenEditScreen({ preventDefault: jest.fn(), currentTarget: { getAttribute: (name) => attrs[name], ...attrs } });
	const push = item.instance().props.history.push;

	expect(item.state().message).toEqual(null);
	let mockurl =
		"/profile/admin/asset-groups?action=" +
		ACTION_EDIT +
		"&limit=" +
		item.state().limit +
		"&offset=" +
		item.state().offset +
		"&query&sort_dir=" +
		item.state().sort_dir +
		"&sort_field=" +
		item.state().sort_field;
	expect(push.mock.calls[0][0]).toEqual(mockurl);
});

/** When user click on submit button in edit section*/
test("When user click on submit button in edit section", async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&id=1036&sort_dir=A&sort_field=title";
	async function api(endpoint, data) {
		if (endpoint === "/admin/asset-group-update") {
			return { result: true };
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<AdminAssetGroupCrud location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		id: 1036,
		buy_book_rules: ["Book Rule1"],
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("Successfully updated");
});

/** When user click on submit button but record not updated*/
test("When user click on submit button but record not updated", async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&id=1036&sort_dir=A&sort_field=title";
	async function api(endpoint, data) {
		if (endpoint === "/admin/asset-group-update") {
			return { result: false };
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<AdminAssetGroupCrud location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		id: 1036,
		buy_book_rules: ["Book Rule1"],
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("Record not updated");
});

/** When user click on cancel button while Edit Asset Page */
test("When user click on cancel button while Edit Asset Page", async () => {
	const item = shallow(<AdminAssetGroupCrud location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().cancelAddEdit();
	const push = item.instance().props.history.push;
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	let mockurl =
		"/profile/admin/asset-groups?action=" +
		ACTION_LIST +
		"&id&limit=" +
		item.state().limit +
		"&offset=" +
		item.state().offset +
		"&query&sort_dir=A&sort_field=title";
	expect(push.mock.calls[0][0]).toEqual(mockurl);
});

/** When user click on pagination page */
test("When user click on pagination page", async () => {
	const item = shallow(
		<AdminAssetGroupCrud
			location={location}
			history={history}
			api={defaultApi}
			onPageChanged={jest.fn()}
			withAuthConsumer_myUserDetails={mockUserData}
		/>
	);

	item.instance().doPagination(page, limit);

	await wait(10);
	item.update();

	const push = item.instance().props.history.push;
	const setOffset = (page - 1) * item.state().limit;
	let mockurl = "/profile/admin/asset-groups?action=list&id&limit=10&offset=" + setOffset + "&query&sort_dir=A&sort_field=title";
	await wait(20);

	expect(push.mock.calls[0][0]).toEqual(mockurl);
});

/** When User search in search text box*/
test("When User search in search text box", async () => {
	const item = shallow(<AdminAssetGroupCrud location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />);
	await wait(50);
	const spy = jest.spyOn(item.instance(), "doSearch");
	item.instance().doSearch();
	expect(spy).toHaveBeenCalled();
});

/** When user click on column to perform ascending sorting action*/
test("When user click on column to perform ascending sorting action", async () => {
	location.search.sort_dir = "D";
	const item = shallow(<AdminAssetGroupCrud location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	//ascending order
	item.instance().doSorting(sortingA);
	await wait(10);
	item.update();

	const push = item.instance().props.history.push;

	let mockurl =
		"/profile/admin/asset-groups?action=list&id&limit=10&loading=true&offset=" + item.state().offset + "&query&sort_dir=A&sort_field=title";
	expect(push.mock.calls[0][0]).toEqual(mockurl);
});

/** When user click on column to perform descending sorting action */
test("When user click on column to perform descending sorting action", async () => {
	location.search.sort_dir = "A";
	const item = shallow(<AdminAssetGroupCrud location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	//descending order
	item.instance().doSorting(sortingD);
	await wait(10);
	item.update();

	const push = item.instance().props.history.push;

	let mockurl =
		"/profile/admin/asset-groups?action=list&id&limit=10&loading=true&offset=" + item.state().offset + "&query&sort_dir=D&sort_field=title";
	expect(push.mock.calls[0][0]).toEqual(mockurl);
});
