// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import ClassesPage from "../index";
import Header from "../../../widgets/Header";
import MockClasses from "../../../mocks/MockClasses";
import MockSchoolList from "../../../mocks/mockSchoolList";
import MockUserRole from "../../../mocks/MockUserRole";
import MockUser from "../../../mocks/MockUser";
import MockClassFilterData from "../../../mocks/MockClassFilterData";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/smoothScroll", () => jest.fn());
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAdminAuthRequiredConsumer", () => {
	return function (acceptedRoles, WrappedComponent) {
		if (!Object.keys(acceptedRoles).length == 3) {
			throw "It should be passed acceptedToles with a single key";
		}
		if (!acceptedRoles.hasOwnProperty("cla-admin" || "school-admin" || "teacher")) {
			throw "It should be passed acceptedToles with a key: cla-admin || school-admin || teacher";
		}
		return WrappedComponent;
	};
});

let ACTION_LIST, ACTION_NEW, ACTION_EDIT;
let location, sortingA, sortingD, page, history, mockUserData, mockClassData, filters;

/** wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

async function defaultApi(endpoint, data) {
	// "ClassesPage" only queries this endpoint
	if (endpoint === "/admin/class-get-all") {
		if (data === "error") {
			throw "Unknown error";
		} else {
			return mockClassData;
		}
	}

	if (mockUserData.role === MockUserRole.claAdmin) {
		if (endpoint === "/auth/get-schools") {
			return MockSchoolList;
		}
	}

	if (endpoint === "/admin/class-get-filters") {
		if (data === "error") {
			throw "Unknown error";
		}
		return MockClassFilterData;
	}

	if (endpoint === "/admin/class-get-uneditable-fields") {
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
			sort_field: "title",
			sort_dir: "A",
			loading: true,
			classesLoaded: false,
			unfiltered_count: 3,
			classesData: null,
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
	ACTION_LIST = "list";
	ACTION_NEW = "new";
	ACTION_EDIT = "edit";
	mockUserData = MockUser[0];
	mockUserData.role = MockUserRole.schoolAdmin;
	mockClassData = MockClasses;
	filters = {
		SCHOOL: "school",
		EXAMBOARD: "examboard",
		QUERY: "query",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<ClassesPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

/** Component renders correctly */
test("Component renders with school-admin login", async () => {
	mockUserData.role = MockUserRole.schoolAdmin;

	const item = shallow(<ClassesPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(100);

	let filterdata = item.state().columns.find((row) => row.name == "school") ? true : false;

	expect(filterdata).toBe(false);
});

/** User getting "Unknown error" while loading */
test('User getting "Unknown error" while loading ', async () => {
	mockUserData.role = MockUserRole.schoolAdmin;

	async function api(endpoint, data) {
		if (endpoint === "/admin/class-get-all") {
			return defaultApi(endpoint, "error");
		}
		return defaultApi(endpoint, true);
	}
	const item = shallow(<ClassesPage location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(100);
	item.update();

	expect(item.state().message).toBe("Unknown error");
});

/** User getting "Unknown error" while loading */
test('User getting "Unknown error" while loading filter data ', async () => {
	mockUserData.role = MockUserRole.schoolAdmin;

	async function api(endpoint, data) {
		if (endpoint === "/admin/class-get-filters") {
			return defaultApi(endpoint, "error");
		}
		return defaultApi(endpoint, true);
	}
	const item = shallow(<ClassesPage location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(100);
	item.update();

	expect(item.state().message).toBe("Unknown error");
});
/** Component renders correctly */
test("Component renders with cla-admin login", async () => {
	mockUserData.role = MockUserRole.claAdmin;

	const item = shallow(<ClassesPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(100);

	let filterdata = item.state().columns.find((row) => row.name == "school") ? true : false;

	expect(filterdata).toBe(true);
});

/** User click on create new class button */
test("User click on create class button", async () => {
	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().createClass();
	const push = item.instance().props.history.push;
	await wait(100);
	item.update();
	item.instance().forceUpdate();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/classes?action=" +
			ACTION_NEW +
			"&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&oid&query=&sort_dir=asc&sort_field=title"
	);
});

/** User click on cancel button  while ADD Or Edit Form display */
test("User click on cancel button", async () => {
	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().cancelAddEdit();
	const push = item.instance().props.history.push;
	await wait(100);
	item.update();
	item.instance().forceUpdate();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/classes?action=" +
			ACTION_LIST +
			"&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&oid&query=&sort_dir=asc&sort_field=title"
	);
});

/** User click on delete class */
test("User click on delete button", async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&oid=12345678914006546554654&sort_dir=asc&sort_field=title";
	async function api(endpoint, data) {
		if (endpoint === "/admin/class-delete") {
			return {
				result: true,
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ClassesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const spy = jest.spyOn(item.instance(), "pushHistory");
	item.instance().deleteClass();
	await wait(100);
	item.update();
	expect(spy).toHaveBeenCalled();
	expect(item.state().query).toBe("");
	expect(item.state().message).toBe("Class deleted successfully");
});

/** User click on submit for create class when user login with school-admin */
test("User click on submit for create class when user login with school-admin", async () => {
	location.search = "?action=" + ACTION_NEW + "&limit=10&offset=0&oid&sort_dir=asc&sort_field=title";
	async function api(endpoint, data) {
		if (endpoint === "/admin/class-create") {
			if (data !== "") {
				return {
					success: true,
					id: "24f360a5-e114-48c0-8c83-270905ce374f",
				};
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ClassesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		title: "title1",
		key_stage: "key_stage",
		year_group: "year_group",
		identifier: "identifier",
		exam_board: "EdExcel",
		number_of_students: "10",
	});
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().message).toEqual("Successfully added");
});

/** User click on submit for create class and getting "unknown error" message */
test('User click on submit for create class and getting "unknown error" message', async () => {
	location.search = "?action=" + ACTION_NEW + "&limit=10&offset=0&oid&sort_dir=asc&sort_field=title";
	async function api(endpoint, data) {
		if (endpoint === "/admin/class-create") {
			if (data !== "") {
				throw "Unknown error";
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ClassesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		title: "title1",
		key_stage: "key_stage",
		year_group: "year_group",
		identifier: "identifier",
		exam_board: "EdExcel",
		number_of_students: "10",
	});
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().message).toEqual("Unknown error");
});

/** User click on submit for create class when user login with cla-admin */
test("User click on submit for create class when user login with cla-admin", async () => {
	mockUserData.role = MockUserRole.claAdmin;
	location.search = "?action=" + ACTION_NEW + "&limit=10&offset=0&oid&sort_dir=asc&sort_field=title";
	async function api(endpoint, data) {
		if (endpoint === "/admin/class-create") {
			if (data !== "") {
				return {
					success: true,
					id: "24f360a5-e114-48c0-8c83-270905ce374f",
				};
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ClassesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		title: "title1",
		key_stage: "key_stage",
		year_group: "year_group",
		identifier: "identifier",
		exam_board: "EdExcel",
		number_of_students: "10",
	});
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().message).toEqual("Successfully added");
});

/** User click on submit for edit */
test("User clicks submit for edit class when user login with school-admin", async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&oid=24f360a5-e114-48c0-8c83-270905ce374f&sort_dir=asc&sort_field=title";
	async function api(endpoint, data) {
		if (endpoint === "/admin/class-update") {
			return {
				result: {
					edited: true,
				},
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ClassesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		oid: "24f360a5-e114-48c0-8c83-270905ce374f",
		title: "title1",
		key_stage: "key_stage",
		year_group: "year_group",
		identifier: "identifier",
		exam_board: "EdExcel",
		number_of_students: "10",
	});

	item.instance().performQuery = jest.fn();
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	//expect(item.state().message).toEqual('Successfully updated');
	expect(item.instance().performQuery).toHaveBeenCalled();
});

/** User click on submit for edit and getting the "Unknown error" message */
test('User click on submit for edit and getting the "Unknown error" message', async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&oid=24f360a5-e114-48c0-8c83-270905ce374f&sort_dir=asc&sort_field=title";
	async function api(endpoint, data) {
		if (endpoint === "/admin/class-update") {
			throw "Unknown error";
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ClassesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		oid: "24f360a5-e114-48c0-8c83-270905ce374f",
		title: "title1",
		key_stage: "key_stage",
		year_group: "year_group",
		identifier: "identifier",
		exam_board: "EdExcel",
		number_of_students: "10",
	});

	item.instance().performQuery = jest.fn();
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("Unknown error");
});

/** User click on submit for edit */
test("User clicks submit for edit class when user login with cla-admin", async () => {
	mockUserData.role = MockUserRole.claAdmin;
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&oid=24f360a5-e114-48c0-8c83-270905ce374f&sort_dir=asc&sort_field=title";
	async function api(endpoint, data) {
		if (endpoint === "/admin/class-update") {
			return {
				result: {
					edited: true,
				},
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ClassesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	//item.update();

	item.instance().handleSubmit({
		oid: "24f360a5-e114-48c0-8c83-270905ce374f",
		title: "title1",
		key_stage: "key_stage",
		year_group: "year_group",
		identifier: "identifier",
		exam_board: "EdExcel",
		number_of_students: "10",
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
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&oid=24f360a5-e114-48c0-8c83-270905ce374f&sort_dir=asc&sort_field=title";
	async function api(endpoint, data) {
		if (endpoint === "/admin/class-update") {
			return {
				result: {
					edited: false,
				},
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ClassesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		oid: "24f360a5-e114-48c0-8c83-270905ce374f",
		title: "title1",
		key_stage: "key_stage",
		year_group: "year_group",
		identifier: "identifier",
		exam_board: "EdExcel",
		number_of_students: "10",
	});

	item.instance().performQuery = jest.fn();
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("Record not updated");
});

/** User click on sorting with asecending order from table header field */
test("User click on sorting with ascending order", async () => {
	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

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
	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

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
	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().doPagination(page, 5);
	//if we don't pass the page
	//item.instance().doPaginationPageCountChange();
	await wait(50);
	item.update();

	const push = item.instance().props.history.push;
	const setOffset = (page - 1) * item.state().limit;
	let mockurl = "/profile/admin/classes?action=list&limit=5&offset=" + setOffset + "&oid=&query=&sort_dir=asc&sort_field=title";
	await wait(50);

	expect(push.mock.calls[0][0]).toEqual(mockurl);
});

/** If user login with cla-admin then get school data */
test("User login with cla-admin then load school data", async () => {
	mockUserData.role = MockUserRole.claAdmin;

	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	expect(item.state().allSchools).not.toEqual([]);
});

/** If user login with cla-admin and changed the school drop down value */
test("If user login with cla-admin and changed the school drop down value", async () => {
	mockUserData.role = MockUserRole.claAdmin;
	let dropDownValue = { value: "2", label: "Test School 1" };

	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().handleDrpChange("school", dropDownValue);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().fields.school_id).toEqual("2");
});

/** User click on Edit for class link */
test("User click on edit class link", async () => {
	let oID = "24f360a5-e114-48c0-8c83-270905ce374f";

	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	const attrs = { "data-oid": oID };

	item.instance().doOpenEditScreen({ preventDefault: jest.fn(), currentTarget: { getAttribute: (name) => attrs[name], ...attrs } });
	const push = item.instance().props.history.push;
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/classes?action=edit&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&oid=" +
			oID +
			"&query=&sort_dir=" +
			item.state().sort_dir +
			"&sort_field=" +
			item.state().sort_field
	);
});

/** User pass invalid offset and limit value */
test('User pass invalid offset as "-1" and limit value as "0"', async () => {
	//set location search params values
	location.search = "?action=" + ACTION_LIST + "&limit=0&offset=-1&oid&sort_dir=asc&sort_field=title";

	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.update();

	expect(item.state().limit).toEqual(1);
	expect(item.state().offset).toEqual(0);
});

/** User clicks submit for update class when examBard not selected */
test("User clicks submit for update class when examBard not selected", async () => {
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&oid=24f360a5-e114-48c0-8c83-270905ce374f&sort_dir=asc&sort_field=title";

	async function api(endpoint, data) {
		if (endpoint === "/admin/class-update") {
			return {
				result: {
					edited: true,
				},
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ClassesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		oid: "24f360a5-e114-48c0-8c83-270905ce374f",
		title: "title1",
		key_stage: "key_stage",
		year_group: "year_group",
		identifier: "identifier",
		exam_board: "",
		number_of_students: "10",
	});

	item.instance().performQuery = jest.fn();
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	//expect(item.state().message).toEqual('Successfully updated');
	expect(item.instance().performQuery).toHaveBeenCalled();
});

/** User click on delete button and get message */
test("User click on delete button and get message", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/class-delete") {
			return {
				result: false,
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ClassesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().deleteClass();
	await wait(50);
	item.update();

	expect(item.state().message).toEqual("Error deleting class");
});

/** User click on delete button and get "unknown error" message */
test('User click on delete button and get "unknown error" message', async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/class-delete") {
			throw "Unknown Error";
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ClassesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().deleteClass();
	await wait(50);
	item.update();

	expect(item.state().message).toEqual("Unknown Error");
});

/** Create Class button visible even if there is no classes found */
test("Create Class button visible even if there is no classes found ", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/class-get-all") {
			return {
				data: [],
				unfiltered_count: 0,
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ClassesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);

	expect(item.find('[name="create-new"]').length).toBe(1);
});

/** User create class with Title as " test title " */
test('User create class with Title as " test title "', async () => {
	location.search = "?action=" + ACTION_NEW + "&limit=10&offset=0&oid&sort_dir=asc&sort_field=title";
	let params = null;
	async function api(endpoint, data) {
		if (endpoint === "/admin/class-create") {
			params = data;
			if (data !== "") {
				return {
					success: true,
					id: "24f360a5-e114-48c0-8c83-270905ce374f",
				};
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ClassesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		title: " test title ",
		key_stage: "key_stage",
		year_group: "year_group",
		identifier: "identifier",
		exam_board: "EdExcel",
		number_of_students: "10",
	});
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(params.title).toEqual("test title");
});

/** User click on submit for edit */
test("User login with teacher and add/edit class which is created by him/her", async () => {
	mockUserData.role = MockUserRole.teacher;
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&oid=24f360a5-e114-48c0-8c83-270905ce374f&sort_dir=asc&sort_field=title";
	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().fields.is_own).toBe(true);
});

/** User click on submit for edit */
test("User login with teacher and add/edit class which is not created by him/her", async () => {
	mockUserData.role = MockUserRole.teacher;
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&oid=24f360a5-e114-48c0-8c83-270905ce374d&sort_dir=asc&sort_field=title";
	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().fields.is_own).toBe(false);
});

/** class title modify last name value*/
test("class title modify last name value", async () => {
	mockUserData.role = MockUserRole.teacher;
	location.search = "?action=" + ACTION_EDIT + "&limit=10&offset=0&oid=24f360a5-e114-48c0-8c83-270905ce374d&sort_dir=desc&sort_field=title";
	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	const title = item.state().fields.title;
	await wait(50);
	item.instance().handleNameInputField("foo", "title");
	item.update();
	item.instance().forceUpdate();
	expect(item.state().fields.title).not.toEqual(title);
});

/** Component renders correctly with SearchFilters elements*/
test("Component renders correctly with SearchFilters elements", async () => {
	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(10);
	expect(item.find("SearchFilters").length).toBe(1);
});

/** User search anything in filter input text*/
test("User search anything in search course filter input text", async () => {
	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(10);
	const spy = jest.spyOn(item.instance(), "doSearch");
	item.instance().doSearch();
	expect(spy).toHaveBeenCalled();
});

/** User search anything in filter input text and call function*/
test("User search anything in search course filter input text and call function", async () => {
	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(10);
	item.instance().handlefilterSelection("maths", filters.QUERY);
	item.instance().doSearch();
	const push = item.instance().props.history.push;
	let query = push.mock.calls[0][0];
	expect(query.indexOf("&query=`maths`").length !== -1).toBe(true);
});

/** Component renders correctly with SearchFilters elements of examBoard and schools dropdown*/
test("Component renders correctly with SearchFilters elements when user login with cla-admin", async () => {
	mockUserData.role = MockUserRole.claAdmin;
	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	expect(item.state().schoolData).not.toBeNull();
	expect(item.state().examBoardData).not.toBeNull();
});

/** here school-admin not find school data */
test("Component renders correctly with SearchFilters elements when user login with school-admin", async () => {
	mockUserData.role = MockUserRole.schoolAdmin;
	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	expect(item.state().schoolData).toBe(undefined);
	expect(item.state().examBoardData).not.toBeNull();
});

//again start
/** User filter territory called handlefilterSelection */
test("When user filtering school filter", async () => {
	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().handlefilterSelection([{ value: "2", label: "Another School" }], filters.SCHOOL);
	expect(item.state().selectedSchools).toEqual([{ value: "2", label: "Another School" }]);
});

test("When user clear school filter", async () => {
	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().handlefilterSelection([], filters.SCHOOL);
	expect(item.state().selectedSchools).toEqual([]);
});

/** User filter territory called handlefilterSelection */
test("When user filtering examboard filter", async () => {
	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().handlefilterSelection([{ value: "EdExcel", label: "EdExcel" }], filters.EXAMBOARD);
	expect(item.state().selectedExamBoard).toEqual([{ value: "EdExcel", label: "EdExcel" }]);
});

test("When user clear examboard filter", async () => {
	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().handlefilterSelection([], filters.EXAMBOARD);
	expect(item.state().selectedExamBoard).toEqual([]);
});

/** User also filter the only school and examboard*/
test("User filtering only only school and examboard", async () => {
	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().handlefilterSelection([{ value: "EdExcel", label: "EdExcel" }], filters.EXAMBOARD);
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
	expect(query.indexOf("&filter_exam_board=`student`").length !== -1).toBe(true);
});

/** User also filter the only school*/
test("User filtering only school filter", async () => {
	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
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
	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const spy = jest.spyOn(item.instance(), "pushHistory");
	item.instance().resetAll();
	expect(spy).toHaveBeenCalled();
	expect(item.state().query).toBe("");
});

test("User filtering and load filter data", async () => {
	mockUserData.role = MockUserRole.claAdmin;
	location.search = "?action=list&limit=5&offset=0&sort_dir=asc&sort_field=email&userOid";
	const item = shallow(<ClassesPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.setProps({
		location: {
			search: "?action=" + ACTION_LIST + "&filter_schools=2&filter_exam_board=EdExcel&limit=5&offset=0&sort_dir=asc&sort_field=email&userOid",
		},
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().selected).toEqual({ schools: [2], exam_board: ["EdExcel"], key_stage: [] });
});
