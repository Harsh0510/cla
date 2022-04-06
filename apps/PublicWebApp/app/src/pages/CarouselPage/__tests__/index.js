// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import CarouselPage from "../index";
import Header from "../../../widgets/Header";
import MockCarousel from "../../../mocks/mockCarousel";
import MockUserRole from "../../../mocks/MockUserRole";
import MockUser from "../../../mocks/MockUser";

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

let ACTION_LIST, ACTION_NEW, ACTION_EDIT;
let location, sortingA, sortingD, page, history, mockUserData, mockCarouselData;

/** wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

async function defaultApi(endpoint, data) {
	// "CarouselesPage" only queries this endpoint
	if (endpoint === "/admin/carousel-slide-get-all") {
		if (data === "error") {
			throw "Unknown error";
		} else {
			return mockCarouselData;
		}
	}

	throw new Error("should never be here");
}

function resetAll() {
	location = {
		search: {
			limit: 10,
			offset: 0,
			sort_field: "sort_order",
			sort_dir: "A",
			loading: true,
			carouselLoaded: false,
			unfilteredCount: 3,
			carouselData: null,
			action: ACTION_LIST,
			message: null,
		},
	};
	history = {
		push: jest.fn(),
	};
	sortingA = [{ direction: "A", columnName: "sort_order" }];
	sortingD = [{ direction: "D", columnName: "sort_order" }];
	page = 2;
	ACTION_LIST = "list";
	ACTION_NEW = "new";
	ACTION_EDIT = "edit";
	mockUserData = MockUser[0];
	mockUserData.role = MockUserRole.claAdmin;
	mockCarouselData = MockCarousel;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<CarouselPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

/** User getting "Unknown error" while loading */
test('User getting "Unknown error" while loading ', async () => {
	mockUserData.role = MockUserRole.claAdmin;

	async function api(endpoint, data) {
		if (endpoint === "/admin/carousel-slide-get-all") {
			return defaultApi(endpoint, "error");
		}
		return defaultApi(endpoint, true);
	}
	const item = shallow(<CarouselPage location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(100);
	item.update();

	expect(item.state().message).toBe("Unknown error");
});

/** User click on create new panel button */
test("User click on create panel button", async () => {
	const item = shallow(<CarouselPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().createCarousel();
	const push = item.instance().props.history.push;
	await wait(100);
	item.update();
	item.instance().forceUpdate();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/carousel-admin?action=" +
			ACTION_NEW +
			"&id&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&sort_dir=asc&sort_field=sort_order"
	);
});

/** User click on cancel button  while ADD Or Edit Form display */
test("User click on cancel button", async () => {
	const item = shallow(<CarouselPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().cancelAddEdit();
	const push = item.instance().props.history.push;
	await wait(100);
	item.update();
	item.instance().forceUpdate();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/carousel-admin?action=" +
			ACTION_LIST +
			"&id&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&sort_dir=asc&sort_field=sort_order"
	);
});

/** User click on delete panel */
test("User click on delete button", async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&oid=1&sort_dir=asc&sort_field=sort_order";
	async function api(endpoint, data) {
		if (endpoint === "/admin/carousel-slide-delete") {
			return {
				result: true,
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<CarouselPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const spy = jest.spyOn(item.instance(), "pushHistory");
	item.instance().deleteCarousel();
	await wait(100);
	item.update();
	// expect(spy).toHaveBeenCalled();
	expect(item.state().message).toBe("Panel deleted successfully");
});

/** User click on submit for create panel and getting "unknown error" message */
test('User click on submit for create panel and getting "unknown error" message', async () => {
	location.search = "?action=" + ACTION_NEW + "&id&limit=10&offset=0&sort_dir=asc&sort_field=sort_order";
	async function api(endpoint, data) {
		if (endpoint === "/admin/carousel-slide-create") {
			if (data !== "") {
				throw "Unknown error";
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<CarouselPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		name: "name1",
		enabled: true,
		image_url: "img",
		image_alt_text: "alt",
		link_url: "Link",
		sort_order: "10",
	});
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().message).toEqual("Unknown error");
});

/** User click on submit for create panel when user login with cla-admin */
test("User click on submit for create panel when user login with cla-admin", async () => {
	mockUserData.role = MockUserRole.claAdmin;
	location.search = "?action=" + ACTION_NEW + "&id&limit=10&offset=0&sort_dir=asc&sort_field=sort_order";
	async function api(endpoint, data) {
		if (endpoint === "/admin/carousel-slide-create") {
			if (data !== "") {
				return {
					created: true,
				};
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<CarouselPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		name: "name1",
		enabled: true,
		image_url: "img",
		image_alt_text: "alt",
		link_url: "Link",
		sort_order: "10",
	});
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().message).toEqual("Successfully added");
});

/** User click on submit for edit and getting the "Unknown error" message */
test('User click on submit for edit and getting the "Unknown error" message', async () => {
	location.search = "?action=" + ACTION_EDIT + "&id=1&limit=10&offset=0&sort_dir=asc&sort_field=sort_order";
	async function api(endpoint, data) {
		if (endpoint === "/admin/carousel-slide-update") {
			throw "Unknown error";
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<CarouselPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		id: "1",
		name: "name1",
		enabled: true,
		image_url: "img",
		image_alt_text: "alt",
		link_url: "Link",
		sort_order: "10",
	});

	item.instance().performQuery = jest.fn();
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("Unknown error");
});

/** User click on submit for edit */
test("User clicks submit for edit panel when user login with cla-admin", async () => {
	mockUserData.role = MockUserRole.claAdmin;
	location.search = "?action=" + ACTION_EDIT + "&id=1&limit=10&offset=0&sort_dir=asc&sort_field=sort_order";
	async function api(endpoint, data) {
		if (endpoint === "/admin/carousel-slide-update") {
			return {
				result: {
					edited: true,
				},
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<CarouselPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	//item.update();

	item.instance().handleSubmit({
		id: "1",
		name: "name1",
		enabled: true,
		image_url: "img",
		image_alt_text: "alt",
		link_url: "Link",
		sort_order: "10",
	});

	item.instance().performQuery = jest.fn();
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.instance().performQuery).toHaveBeenCalled();
});

/** User click on submit for edit and getting the "Record not updated" message*/
test('User click on submit for edit and getting the "Record not updated" message', async () => {
	mockUserData.role = MockUserRole.claAdmin;
	location.search = "?action=" + ACTION_EDIT + "&id=1&limit=10&offset=0&sort_dir=asc&sort_field=sort_order";
	async function api(endpoint, data) {
		if (endpoint === "/admin/carousel-slide-update") {
			return {
				result: {
					result: false,
				},
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<CarouselPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		id: "1",
		name: "name1",
		enabled: true,
		image_url: "img",
		image_alt_text: "alt",
		link_url: "Link",
		sort_order: "10",
	});

	item.instance().performQuery = jest.fn();
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("Record not updated");
});

//** User click on sorting with asecending order from table header field */
test("User click on sorting with ascending order", async () => {
	const item = shallow(<CarouselPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	//ascending order
	item.instance().doSorting(sortingA);
	await wait(50);
	item.update();

	//decending order
	item.instance().doSorting(sortingD);
	//if we don't pass the sorting value it will failed
	//item.instance().doSorting();

	await wait(50);
	item.update();

	expect(item.state().loading).toBe(true);
});

/** User click on sorting with descending order from table header field */
test("User click on sorting with descending order", async () => {
	const item = shallow(<CarouselPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

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
	const item = shallow(<CarouselPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().doPagination(page, 5);
	//if we don't pass the page
	//item.instance().doPaginationPageCountChange();
	await wait(50);
	item.update();

	const push = item.instance().props.history.push;
	const setOffset = (page - 1) * item.state().limit;
	let mockurl = "/profile/admin/carousel-admin?action=list&limit=5&offset=" + setOffset + "&sort_dir=asc&sort_field=sort_order";
	await wait(50);

	expect(push.mock.calls[0][0]).toEqual(mockurl);
});

/** User click on Edit for Panel link */
test("User click on edit Panel link", async () => {
	let ID = "1";

	const item = shallow(<CarouselPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	const attrs = { "data-id": ID };

	item.instance().doOpenEditScreen({ preventDefault: jest.fn(), currentTarget: { getAttribute: (name) => attrs[name], ...attrs } });
	const push = item.instance().props.history.push;
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/carousel-admin?action=edit&id=" +
			ID +
			"&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&sort_dir=" +
			item.state().sort_dir +
			"&sort_field=" +
			item.state().sort_field
	);
});

/** User pass invalid offset and limit value */
test('User pass invalid offset as "-1" and limit value as "0"', async () => {
	//set location search params values
	location.search = "?action=" + ACTION_LIST + "&id&limit=0&offset=-1&sort_dir=asc&sort_field=sort_order";

	const item = shallow(<CarouselPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.update();

	expect(item.state().limit).toEqual(1);
	expect(item.state().offset).toEqual(0);
});

/** User click on delete button and get message */
test("User click on delete button and get message", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/carousel-slide-delete") {
			return {
				result: false,
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<CarouselPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().deleteCarousel();
	await wait(50);
	item.update();

	expect(item.state().message).toEqual("Error deleting panel");
});

/** User click on delete button and get "unknown error" message */
test('User click on delete button and get "unknown error" message', async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/carousel-slide-delete") {
			throw "Unknown Error";
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<CarouselPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().deleteCarousel();
	await wait(50);
	item.update();

	expect(item.state().message).toEqual("Unknown Error");
});

/** User create panel with Name as " test name " */
test('User create panel with Name as " test name "', async () => {
	location.search = "?action=" + ACTION_NEW + "&id&limit=10&offset=0&sort_dir=asc&sort_field=sort_order";
	let params = null;
	async function api(endpoint, data) {
		if (endpoint === "/admin/carousel-slide-create") {
			params = data;
			if (data !== "") {
				return {
					created: true,
				};
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<CarouselPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		name: " test name ",
		enabled: true,
		image_url: "img",
		image_alt_text: "alt",
		link_url: "Link",
		sort_order: "10",
	});
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(params.name).toEqual("test name");
});

/** User click on submit for edit */
test("User login with cla-admin and add/edit class which is created by him/her", async () => {
	mockUserData.role = MockUserRole.claAdmin;
	location.search = "?action=" + ACTION_EDIT + "&id=1&limit=10&offset=0&sort_dir=asc&sort_field=sort_order";
	const item = shallow(<CarouselPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().fields).not.toBe(null);
});

/** panel name modify value*/
test("panel name modify name value", async () => {
	mockUserData.role = MockUserRole.claAdmin;
	location.search = "?action=" + ACTION_EDIT + "&id=1&limit=10&offset=0&sort_dir=desc&sort_field=sort_order";
	const item = shallow(<CarouselPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	const name = item.state().fields.name;
	await wait(50);
	item.instance().handleNameInputField("name modify", "name");
	item.update();
	item.instance().forceUpdate();
	expect(item.state().fields.name).not.toEqual(name);
});
