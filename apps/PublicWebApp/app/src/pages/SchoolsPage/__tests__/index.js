// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import SchoolsPage from "../index";
import Header from "../../../widgets/Header";
import MockSchool from "../../../mocks/MockSchools";
import MockUser from "../../../mocks/MockUser";
import MockSchoolFilterData from "../../../mocks/MockSchoolFilterData";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/smoothScroll", () => jest.fn());
jest.mock("../../../common/withAdminAuthRequiredConsumer", () => {
	return function (acceptedRoles, WrappedComponent) {
		const role = "cla-admin";
		if (!Object.keys(acceptedRoles).length == 1) {
			throw "It should be passed acceptedToles with a single key";
		}
		if (!acceptedRoles.hasOwnProperty(role)) {
			throw "It should be passed acceptedToles with a single key: cla-admin";
		}
		return WrappedComponent;
	};
});

let ACTION_LIST, ACTION_NEW, ACTION_EDIT;
let location, sortingA, sortingD, page, limit, history, mockUserData, mockSchoolData, filters;

/** wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

async function defaultApi(endpoint, data) {
	// "SchoolsPage" only queries this endpoint
	if (endpoint === "/admin/school-get-all") {
		if (data === "error") {
			throw "Unknown error";
		}
		return mockSchoolData;
	}
	if (endpoint === "/admin/school-get-filters") {
		if (data === "error") {
			throw "Unknown error";
		}
		return MockSchoolFilterData;
	}
	if (endpoint === "/admin/school-get-uneditable-fields") {
		return {
			fields: [],
		};
	}
	throw new Error("should never be here");
}

function resetAll() {
	location = {
		search: {
			limit: 10,
			offset: 0,
			sort_field: "name",
			sort_dir: "A",
			loading: true,
			schoolsLoaded: false,
			unfiltered_count: "5",
			schoolsData: MockSchool,
			action: ACTION_LIST,
			message: null,
		},
	};
	history = {
		push: jest.fn(),
	};
	sortingA = [{ direction: "A", columnName: "name" }];
	sortingD = [{ direction: "D", columnName: "name" }];
	page = 2;
	limit = 10;
	ACTION_LIST = "list";
	ACTION_NEW = "new";
	ACTION_EDIT = "edit";
	mockUserData = MockUser[3];
	mockUserData.role = "cla-admin";
	mockSchoolData = MockSchool;
	filters = {
		TERRITORY: "territory",
		SCHOOL_LEVEL: "school_level",
		SCHOOL_TYPE: "school_type",
		QUERY: "query",
		SCHOOL: "School",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<SchoolsPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	expect(item.containsMatchingElement(<Header />)).toBe(true);
	expect(item.state().sort_dir).toBe("A");
});

/** User click on create new school button */
test("User click on create new school button ", async () => {
	const item = shallow(<SchoolsPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	item.instance().createSchool();
	const push = item.instance().props.history.push;
	await wait(20);
	item.update();
	item.instance().forceUpdate();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/institutions?action=" +
			ACTION_NEW +
			"&id=&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&query=&sort_dir=A&sort_field=name"
	);
});

/** User click on cancel button  while ADD Or Edit Form display */
test("User click on cancel button", async () => {
	const item = shallow(<SchoolsPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().cancelAddEdit();
	const push = item.instance().props.history.push;
	await wait(20);
	item.update();
	item.instance().forceUpdate();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/institutions?action=" +
			ACTION_LIST +
			"&id&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&query=&sort_dir=A&sort_field=name"
	);
});

/** User click on delete class */
test("User click on delete button", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-delete") {
			return {
				result: true,
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	item.instance().deleteSchool();
	const push = item.instance().props.history.push;
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().offset).toBe(0);
	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/institutions?action=" +
			ACTION_LIST +
			"&id&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&query=&sort_dir=A&sort_field=name"
	);
});

/** User click on delete button and get message */
test("User click on delete button and get message", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-delete") {
			return {
				result: false,
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().deleteSchool();

	await wait(50);
	item.update();

	expect(item.state().message).toEqual("Error deleting institution");
});

/** User click on delete button and get "unknown error" message */
test('User click on delete button and get "unknown error" message', async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-delete") {
			throw "Unknown Error";
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().deleteSchool();

	await wait(50);
	item.update();

	expect(item.state().message).toEqual("Unknown Error");
});

/** User click on submit for create class */
test("User click on submit for create", async () => {
	location.search = "?action=" + ACTION_NEW + "&limit=10&offset=0&sort_dir=A&sort_field=name";
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-create") {
			if (data !== "") {
				return {
					success: true,
				};
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		identifier: "test04",
		name: "School Name 04",
		address1: "address line 1",
		address2: "asd",
		city: "city",
		county: "india",
		post_code: "zz-aaa",
		territory: "scotland",
		local_authority: "local auth",
		school_level: "infant",
		school_type: "other",
		school_home_page: "School home page",
		number_of_students: 10,
	});
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().message.props.children[0].indexOf("<>School created successfully.").length !== -1).toBe(true);
});

/** User click on submit for edit */
test("User clicks submit for edit", async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&id=4&sort_dir=A&sort_field=name";
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-update") {
			return true;
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		id: 4,
		identifier: "test004",
		name: "School Name 004",
		address1: "addressline 1",
		address2: "addressline 2",
		city: "city 04",
		county: "UK",
		post_code: "382-245-625",
		territory: "jersey",
		local_authority: "local authority",
		school_level: "primary",
		school_type: "college",
		school_home_page: "School home-page",
		number_of_students: 120,
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("Successfully updated.");
});

/** User click on sorting from table header field */
test("User click on sorting for asecending order", async () => {
	location.search.sort_dir = "D";
	const item = shallow(<SchoolsPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	//ascending order
	item.instance().doSorting(sortingA);
	await wait(10);
	item.update();

	expect(item.state().loading).toBe(true);
});

/** User click on sorting from table header field */
test("User click on sorting for descending order", async () => {
	location.search.sort_dir = "A";
	const item = shallow(<SchoolsPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	//descending order
	item.instance().doSorting(sortingD);
	await wait(10);
	item.update();

	expect(item.state().loading).toBe(true);
});

/** User click on pagination page */
test("User click on pagination page", async () => {
	const item = shallow(<SchoolsPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().doPagination(page, limit);
	//if we don't pass the page
	//item.instance().doPaginationPageCountChange();
	await wait(10);
	item.update();

	const push = item.instance().props.history.push;
	const setOffset = (page - 1) * item.state().limit;
	let mockurl = "/profile/admin/institutions?action=list&id=&limit=10&offset=" + setOffset + "&query=&sort_dir=A&sort_field=name";
	await wait(20);

	expect(push.mock.calls[0][0]).toEqual(mockurl);
});

/** User change the limit & offset value */
test("User change the limit as 0 & offset as -1", async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=0&offset=-1&id=4&sort_dir=A&sort_field=name";

	const item = shallow(<SchoolsPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.setState({
		filters: [
			{
				id: "territory",
				title: "Territory",
				data: [{ id: "england", title: "England" }],
			},
		],
	});
	await wait(10);
	item.update();
	expect(item.state().limit).toEqual(1);
	expect(item.state().offset).toEqual(0);
});

/** User get Unknown error while loading the Schools Data*/
test("User get Unknown error", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-get-all") {
			return defaultApi(endpoint, "error");
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().message).toEqual("Unknown error");
});

/** User get Unknown error while loading the Schools filter data*/
test("User get Unknown error while loading the Schools filter data", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-get-filters") {
			return defaultApi(endpoint, "error");
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().message).toEqual("Unknown error");
});

/** User get message while creating School*/
test('User get message "A school with that identifier already exists" while creating School', async () => {
	location.search = "?action=" + ACTION_NEW + "&limit=10&offset=0&id&sort_dir=A&sort_field=name";
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-create") {
			if (data !== "") {
				throw "A school with that identifier already exists";
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		identifier: "test04",
		name: "School Name 04",
		address1: "address line 1",
		address2: "asd",
		city: "city",
		county: "india",
		post_code: "zz-aaa",
		territory: "scotland",
		local_authority: "local auth",
		school_level: "infant",
		school_type: "other",
		school_home_page: "School home page",
		number_of_students: 10,
	});
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().message).toEqual("A school with that identifier already exists");
});

/** User get message while creating School*/
test('User get message "A school with that name already exists" while creating School', async () => {
	location.search = "?action=" + ACTION_NEW + "&limit=10&offset=0&id&sort_dir=A&sort_field=name";
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-create") {
			if (data !== "") {
				throw "A school with that name already exists";
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		identifier: "test04",
		name: "School Name 04",
		address1: "address line 1",
		address2: "asd",
		city: "city",
		county: "india",
		post_code: "zz-aaa",
		territory: "scotland",
		local_authority: "local auth",
		school_level: "infant",
		school_type: "other",
		school_home_page: "School home page",
		number_of_students: 10,
	});
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().message).toEqual("A school with that name already exists");
});

/** User get message while creating School*/
test('User get message "A school with those details already exists" while creating School', async () => {
	location.search = "?action=" + ACTION_NEW + "&limit=10&offset=0&id&sort_dir=A&sort_field=name";
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-create") {
			if (data !== "") {
				throw "A school with those details already exists";
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		identifier: "test04",
		name: "School Name 04",
		address1: "address line 1",
		address2: "asd",
		city: "city",
		county: "india",
		post_code: "zz-aaa",
		territory: "scotland",
		local_authority: "local auth",
		school_level: "infant",
		school_type: "other",
		school_home_page: "School home page",
		number_of_students: 10,
	});
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().message).toEqual("A school with those details already exists");
});

/** User get message while creating School*/
test('User get message "Unknown error" while creating School', async () => {
	location.search = "?action=" + ACTION_NEW + "&limit=10&offset=0&id&sort_dir=A&sort_field=name";
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-create") {
			if (data !== "") {
				throw "Unknown error";
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		identifier: "test04",
		name: "School Name 04",
		address1: "address line 1",
		address2: "asd",
		city: "city",
		county: "india",
		post_code: "zz-aaa",
		territory: "scotland",
		local_authority: "local auth",
		school_level: "infant",
		school_type: "other",
		school_home_page: "School home page",
		number_of_students: 10,
	});
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().message).toEqual("Unknown error");
});

/** User get message "School not found" while editing School */
test('User get message "School not found" while editing School', async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&id=4&sort_dir=D&sort_field=name";
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-update") {
			throw "School not found";
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		id: 4,
		identifier: "test004",
		name: "School Name 004",
		address1: "addressline 1",
		address2: "addressline 2",
		city: "city 04",
		county: "UK",
		post_code: "382-245-625",
		territory: "jersey",
		local_authority: "local authority",
		school_level: "primary",
		school_type: "college",
		school_home_page: "School home-page",
		number_of_students: 120,
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("School not found");
});

/** User get message "Unknown error" while editing School */
test('User get message "Unknown error" while editing School', async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&id=4&sort_dir=A&sort_field=name";
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-update") {
			throw "Unknown error";
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		id: 4,
		identifier: "test004",
		name: "School Name 004",
		address1: "addressline 1",
		address2: "addressline 2",
		city: "city 04",
		county: "UK",
		post_code: "382-245-625",
		territory: "jersey",
		local_authority: "local authority",
		school_level: "primary",
		school_type: "college",
		school_home_page: "School home-page",
		number_of_students: 120,
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("Unknown error");
});

/** User get message "No fields changed" while editing School */
test('User get message "No fields changed" while editing School', async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&id=4&sort_dir=A&sort_field=name";
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-update") {
			throw "No fields changed";
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		id: 4,
		identifier: "test004",
		name: "School Name 004",
		address1: "addressline 1",
		address2: "addressline 2",
		city: "city 04",
		county: "UK",
		post_code: "382-245-625",
		territory: "jersey",
		local_authority: "local authority",
		school_level: "primary",
		school_type: "college",
		school_home_page: "School home-page",
		number_of_students: 120,
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("No fields changed");
});

/** Pass School Level as null while edit school */
test('Pass school_level as "null" while edit school', async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&id=4&sort_dir=A&sort_field=name";
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-update") {
			throw "School Level not provided";
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		id: 4,
		identifier: "test004",
		name: "School Name 004",
		address1: "addressline 1",
		address2: "addressline 2",
		city: "city 04",
		county: "UK",
		post_code: "382-245-625",
		territory: "jersey",
		local_authority: "",
		school_level: "",
		school_type: "",
		school_home_page: "",
		number_of_students: "",
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("School Level not provided");
});

/** Pass territory as "test" while edit school */
test('Pass territory as "test" while edit school', async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&id=4&sort_dir=A&sort_field=name";
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-update") {
			throw "Territory not found";
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		id: 4,
		identifier: "test004",
		name: "School Name 004",
		address1: "addressline 1",
		address2: "addressline 2",
		city: "city 04",
		county: "UK",
		post_code: "382-245-625",
		territory: "test",
		local_authority: "",
		school_level: "",
		school_type: "",
		school_home_page: "",
		number_of_students: "",
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("Territory not found");
});

/** Pass School Level as null while edit school */
test('Pass school_level as "test" while edit school', async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&id=4&sort_dir=A&sort_field=name";
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-update") {
			throw "School level not found";
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		id: 4,
		identifier: "test004",
		name: "School Name 004",
		address1: "addressline 1",
		address2: "addressline 2",
		city: "city 04",
		county: "UK",
		post_code: "382-245-625",
		territory: "jersey",
		local_authority: "",
		school_level: "",
		school_type: "",
		school_home_page: "",
		number_of_students: "",
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("School level not found");
});

/** Pass school_type as "test" while edit school */
test('Pass school_type as "test" while edit school', async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&id=4&sort_dir=A&sort_field=name";
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-update") {
			throw "School type not found";
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(10);
	item.update();

	item.instance().handleSubmit({
		id: 4,
		identifier: "test004",
		name: "School Name 004",
		address1: "addressline 1",
		address2: "addressline 2",
		city: "city 04",
		county: "UK",
		post_code: "382-245-625",
		territory: "jersey",
		local_authority: "",
		school_level: "",
		school_type: "",
		school_home_page: "",
		number_of_students: "",
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("School type not found");
});

/** Pass school_type as "test" while edit school */
test('Pass school_type as "test" while edit school', async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&id=4&sort_dir=A&sort_field=name";
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-update") {
			throw "School type not found";
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(10);
	item.update();

	item.instance().handleSubmit({
		id: 4,
		identifier: "test004",
		name: "School Name 004",
		address1: "addressline 1",
		address2: "addressline 2",
		city: "city 04",
		county: "UK",
		post_code: "382-245-625",
		territory: "jersey",
		local_authority: "",
		school_level: "",
		school_type: "",
		school_home_page: "",
		number_of_students: "",
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("School type not found");
});

/** User click on Edit for class link */
test("User click on edit schools link", async () => {
	//mock oid
	let oID = mockSchoolData.data[0].id;

	const item = shallow(
		<SchoolsPage location={location} api={defaultApi} history={history} hide={true} withAuthConsumer_myUserDetails={mockUserData} />
	);

	const attrs = { "data-oid": oID };

	item.instance().doOpenEditScreen({
		preventDefault: jest.fn(),
		currentTarget: { getAttribute: (name) => attrs[name], ...attrs },
	});
	const push = item.instance().props.history.push;
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual(null);
	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/institutions?action=edit&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&query=&sort_dir=" +
			item.state().sort_dir +
			"&sort_field=" +
			item.state().sort_field
	);
});

/** This test case for any user change the any pagination or limit etc.. */
/** Update the previous props */
test("User changed any filed value", async () => {
	const item = shallow(<SchoolsPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	const prevProps = item.instance().props.location.search;

	item.setProps({
		location: {
			search: {
				limit: 10,
				offset: 10,
				sort_field: "name",
				sort_dir: "A",
				loading: true,
				schoolsLoaded: false,
				unfiltered_count: "5",
				schoolsData: MockSchool,
				action: ACTION_LIST,
				message: null,
			},
		},
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();
	const currentProps = item.instance().props.location.search;

	expect(currentProps).not.toEqual(prevProps);
});

/** Create School button visible even if there is no schools */
test("Create School button visible even if there is no schools", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-get-all") {
			return {
				data: [],
				unfiltered_count: 0,
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<SchoolsPage location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);

	expect(item.find('[name="create-new"]').length).toBe(1);
});

/** Component renders correctly with SearchFilters elements*/
test("Component renders correctly with SearchFilters elements", async () => {
	const item = shallow(<SchoolsPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	expect(item.find("HeadTitle").length).toBe(1);
	expect(item.find("AdminPageWrap").length).toBe(1);
	expect(item.find("PageDetail").length).toBe(1);
});

/** User search anything and call query*/
test("User search anything and call doSearch", async () => {
	const item = shallow(<SchoolsPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />);
	await wait(50);
	const spy = jest.spyOn(item.instance(), "doSearch");
	item.instance().doSearch();
	expect(spy).toHaveBeenCalled();
});

/** User search school and call push histroy function*/
test("User search school and call push histroy function", async () => {
	const item = shallow(<SchoolsPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />);
	await wait(10);
	item.instance().handlefilterSelection("school", filters.QUERY);
	item.instance().doSearch();
	const push = item.instance().props.history.push;
	let query = push.mock.calls[0][0];
	expect(query.indexOf("&query=`school`").length !== -1).toBe(true);
});

/** User also filter the only territory, school_level*/
test("User filtering only territory, school_level filters", async () => {
	const item = shallow(<SchoolsPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />);
	await wait(50);
	item.instance().handlefilterSelection([{ value: "england", label: "England" }], filters.TERRITORY);
	item.instance().handlefilterSelection([{ value: "nursery", label: "Nursery" }], filters.SCHOOL_LEVEL);
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
	expect(query.indexOf("&filter_school_level=`nursery`").length !== -1).toBe(true);
	expect(query.indexOf("&filter_territory=`england`").length !== -1).toBe(true);
});

/** User search school also filter the territory, school_level, school_type*/
test("User search school and call push histroy function", async () => {
	const item = shallow(<SchoolsPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />);
	await wait(50);
	item.instance().handlefilterSelection([{ value: "england", label: "England" }], filters.TERRITORY);
	item.instance().handlefilterSelection([{ value: "nursery", label: "Nursery" }], filters.SCHOOL_LEVEL);
	item.instance().handlefilterSelection([{ value: "academy", label: "Academy" }], filters.SCHOOL_TYPE);
	await wait(20);
	item.update();
	item.instance().forceUpdate();

	item.instance().doSearch("school");
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	const push = item.instance().props.history.push;
	let query = push.mock.calls[0][0];
	expect(query.indexOf("&query=`school`").length !== -1).toBe(true);
	expect(query.indexOf("&filter_school_level=`nursery`").length !== -1).toBe(true);
	expect(query.indexOf("&filter_school_type=`academy`").length !== -1).toBe(true);
	expect(query.indexOf("&filter_territory=`england`").length !== -1).toBe(true);
});

/** User clears all filters */
test("User clears all filters", async () => {
	const item = shallow(<SchoolsPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />);
	await wait(50);
	const spy = jest.spyOn(item.instance(), "pushHistory");
	item.instance().resetAll();
	expect(spy).toHaveBeenCalled();
	expect(item.state().query).toBe("");
});

/** User filter territory called handlefilterSelection */
test("When user filtering territory filter", async () => {
	const item = shallow(<SchoolsPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />);
	await wait(50);
	item.instance().handlefilterSelection({ value: "england", label: "England" }, filters.TERRITORY);
	expect(item.state().selectedTerritory).toEqual({
		value: "england",
		label: "England",
	});
});

test("When user clear territory filter", async () => {
	const item = shallow(<SchoolsPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />);
	await wait(50);
	item.instance().handlefilterSelection([], filters.TERRITORY);
	expect(item.state().selectedTerritory).toEqual([]);
});

/** User filter school_level called handlefilterSelection */
test("When user filtering school_level filter", async () => {
	const item = shallow(<SchoolsPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />);
	await wait(50);
	item.instance().handlefilterSelection({ value: "nursery", label: "Nursery" }, filters.SCHOOL_LEVEL);
	expect(item.state().selectedSchoolLevel).toEqual({
		value: "nursery",
		label: "Nursery",
	});
});

test("When user clear school_level filter", async () => {
	const item = shallow(<SchoolsPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />);
	await wait(50);
	item.instance().handlefilterSelection([], filters.SCHOOL_LEVEL);
	expect(item.state().selectedSchoolLevel).toEqual([]);
});

/** User filter school_type called handlefilterSelection */
test("When user filtering school_type filter", async () => {
	const item = shallow(<SchoolsPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />);
	await wait(50);
	item.instance().handlefilterSelection({ value: "academy", label: "Academy" }, filters.SCHOOL_TYPE);
	expect(item.state().selectedSchoolType).toEqual({
		value: "academy",
		label: "Academy",
	});
});

test("When user clear school_type filter", async () => {
	const item = shallow(<SchoolsPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />);
	await wait(50);
	item.instance().handlefilterSelection([], filters.SCHOOL_TYPE);
	expect(item.state().selectedSchoolType).toEqual([]);
});

test("User filtering and load filter data", async () => {
	location.search = "?action=" + ACTION_LIST + "&limit=10&offset=0&id=4&sort_dir=A&sort_field=name";
	const item = shallow(<SchoolsPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />);
	await wait(50);
	item.setProps({
		location: {
			search:
				"?action=" +
				ACTION_LIST +
				"&filter_schools=3&filter_school_level=england&filter_school_type=academy&filter_territory=nursery&id&limit=10&offset=0&query=&sort_dir=A&sort_field=name",
		},
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().selected).toEqual({
		territory: ["nursery"],
		school_level: ["england"],
		school_type: ["academy"],
		schools: [3],
	});
});

/** Load the filter data when current user log out and log in with another user */
test(`Load the filter data when current user log out and log in with another user`, async () => {
	location.search = "?action=" + ACTION_LIST + "&limit=10&offset=0&id=4&sort_dir=A&sort_field=name";
	const item = shallow(<SchoolsPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />);
	await wait(50);
	const spy = jest.spyOn(item.instance(), "fetchFilters");
	item.setProps({ withAuthConsumer_myUserDetails: MockUser[1] });
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(spy).toHaveBeenCalled();
});

/** User Change school name, city post_code etc.. */
test(`User Change school name, city post_code etc..`, async () => {
	const inputFieldValue = "Test School Name";
	const inputFieldName = "name";
	location.search = "?action=" + ACTION_LIST + "&limit=10&offset=0&id=4&sort_dir=A&sort_field=name";
	const item = shallow(<SchoolsPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />);
	await wait(50);
	const schoolName = item.state().fields.name;
	item.instance().handleNameInputField(inputFieldValue, inputFieldName);
	await wait(10);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().fields.name).not.toEqual(schoolName);
});

test('Pass gsg as "null" while edit school', async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&id=4&sort_dir=A&sort_field=name";
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-update") {
			return true;
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		id: 4,
		identifier: "test004",
		name: "School Name 004",
		address1: "addressline 1",
		address2: "addressline 2",
		city: "city 04",
		county: "UK",
		post_code: "382-245-625",
		territory: "jersey",
		local_authority: "",
		school_level: "eng",
		school_type: "",
		school_home_page: "",
		number_of_students: "",
		gsg: "",
		dfe: "dfe",
		seed: "seed",
		nide: "nide",
		hwb_identifier: "hwb_identifier",
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("Successfully updated.");
});

test('Pass dfe as "null" while edit school', async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&id=4&sort_dir=A&sort_field=name";
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-update") {
			return true;
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		id: 4,
		identifier: "test004",
		name: "School Name 004",
		address1: "addressline 1",
		address2: "addressline 2",
		city: "city 04",
		county: "UK",
		post_code: "382-245-625",
		territory: "jersey",
		local_authority: "",
		school_level: "eng",
		school_type: "",
		school_home_page: "",
		number_of_students: "",
		gsg: "gsg",
		dfe: "",
		seed: "seed",
		nide: "nide",
		hwb_identifier: "hwb_identifier",
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("Successfully updated.");
});

test('Pass seed as "null" while edit school', async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&id=4&sort_dir=A&sort_field=name";
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-update") {
			return true;
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		id: 4,
		identifier: "test004",
		name: "School Name 004",
		address1: "addressline 1",
		address2: "addressline 2",
		city: "city 04",
		county: "UK",
		post_code: "382-245-625",
		territory: "jersey",
		local_authority: "",
		school_level: "eng",
		school_type: "",
		school_home_page: "",
		number_of_students: "",
		gsg: "gsg",
		dfe: "dfe",
		seed: "",
		nide: "nide",
		hwb_identifier: "hwb_identifier",
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("Successfully updated.");
});
test('Pass nide as "null" while edit school', async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&id=4&sort_dir=A&sort_field=name";
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-update") {
			return true;
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		id: 4,
		identifier: "test004",
		name: "School Name 004",
		address1: "addressline 1",
		address2: "addressline 2",
		city: "city 04",
		county: "UK",
		post_code: "382-245-625",
		territory: "jersey",
		local_authority: "",
		school_level: "eng",
		school_type: "",
		school_home_page: "",
		number_of_students: "",
		gsg: "gsg",
		dfe: "dfe",
		seed: "seed",
		nide: "",
		hwb_identifier: "hwb_identifier",
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("Successfully updated.");
});

test('Pass hwb_identifier as "null" while edit school', async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&id=4&sort_dir=A&sort_field=name";
	async function api(endpoint, data) {
		if (endpoint === "/admin/school-update") {
			return true;
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<SchoolsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		id: 4,
		identifier: "test004",
		name: "School Name 004",
		address1: "addressline 1",
		address2: "addressline 2",
		city: "city 04",
		county: "UK",
		post_code: "382-245-625",
		territory: "jersey",
		local_authority: "",
		school_level: "eng",
		school_type: "",
		school_home_page: "",
		number_of_students: "",
		gsg: "gsg",
		dfe: "dfe",
		seed: "seed",
		nide: "nide",
		hwb_identifier: "",
	});

	await wait(20);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("Successfully updated.");
});
