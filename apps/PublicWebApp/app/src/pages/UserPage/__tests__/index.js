// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import UserPage from "../index";
import Header from "../../../widgets/Header";
import UserAddEdit from "../UserAddEdit";
import USERDATA from "../../../mocks/MockUser";
import USERROLE from "../../../mocks/MockUserRole";
import MOCKDROPSCHOOLDATA from "../../../mocks/MockDropSchoolData";
import UserRole from "../../../common/UserRole";
import MockUserSearchFilterData from "../../../mocks/MockUserSearchFilterData";
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

//jest.mock('../../../common/withAdminAuthRequiredConsumer', () => mockPassthruHoc);
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
jest.mock("../../../common/smoothScroll", () => {
	return function () {
		return;
	};
});
let location, history, sortingA, sortingD, page, inputFieldValue, inputFieldName, filters;
let mockUserData;

const ACTION_LIST = "list";
const ACTION_NEW = "new";
const ACTION_EDIT = "edit";

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

async function defaultApi(endpoint, data) {
	// "UserPage" only queries this endpoint
	if (endpoint === "/auth/user-get-all") {
		if (data === "error") {
			throw "Unknown error";
		} else {
			return {
				data: USERDATA,
				unfiltered_count: 4,
			};
		}
	}

	if (endpoint === "/auth/user-get-filters") {
		if (data === "error") {
			throw "Unknown error";
		}
		return MockUserSearchFilterData;
	}

	if (endpoint === "/auth/user-get-uneditable-fields") {
		return {
			fields: [],
		};
	}

	// This will be caught by the promise in the component
	throw new Error("should never be here");
}

function resetAll() {
	location = {
		search: {
			limit: 10,
			offset: 0,
			sort_field: "email",
			sort_direction: "A",
			action: ACTION_LIST,
			userOid: undefined,
		},
	};
	history = {
		push: jest.fn(),
	};
	sortingA = [{ direction: "asc", columnName: "first_name" }];
	sortingD = [{ direction: "desc", columnName: "first_name" }];
	page = 2;
	mockUserData = USERDATA[0];
	inputFieldValue = "devid";
	inputFieldName = "first_name";
	filters = {
		SCHOOL: "school",
		ROLES: "roles",
		QUERY: "query",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<UserPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

/** User click on create user button */
test("User click on create user button", async () => {
	const item = shallow(<UserPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().createUser();
	const push = item.instance().props.history.push;

	await wait(50);
	item.update();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/users?action=new&limit=" + item.state().limit + "&offset=" + item.state().offset + "&query=&sort_dir=asc&sort_field=email&userOid"
	);
});

/** User click on create user and set the fied value null in performQuery function */
test("User click on create user button and set the fields state value", async () => {
	location.search = "?action=new&limit=10&offset=0&sort_dir=desc&sort_field=email&userOid";
	const item = shallow(<UserPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.update();

	expect(item.state().fields.title).toEqual("");
});

/** User click on sorting */
test("User click on sorting for asecending order", async () => {
	const item = shallow(<UserPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	//ascending order
	item.instance().doSorting(sortingA);
	await wait(50);
	item.update();
	expect(item.state().loading).toBe(true);
});

test("User click on sorting for descending order", async () => {
	const item = shallow(<UserPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	//decending order
	item.instance().doSorting(sortingD);
	await wait(50);
	item.update();

	expect(item.state().loading).toBe(true);
});

/** User click on pagination page */
test("User click on pagination page", async () => {
	const item = shallow(<UserPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().doPagination(page);
	//if we don't pass the page
	//item.instance().doPagination();

	const push = item.instance().props.history.push;
	const setOffset = (page - 1) * item.state().limit;
	await wait(50);
	item.update();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/users?action=" + item.state().action + "&offset=" + setOffset + "&query=&sort_dir=asc&sort_field=email&userOid"
	);
});

/** User click on cancel button */
test("User click on cancel button", async () => {
	const item = shallow(<UserPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().cancelAddEdit();
	const push = item.instance().props.history.push;

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/users?action=" +
			ACTION_LIST +
			"&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&query=&sort_dir=asc&sort_field=email&userOid"
	);
});

/** User click on delete button */
test("User click on delete button", async () => {
	location.search = "?action=edit&limit=10&offset=0&sort_dir=asc&sort_field=email&userOid=schooladmin@email.com";
	let currentUser = {
		email: "email@email.com",
	};

	async function api(endpoint, data) {
		if (endpoint === "/auth/user-delete") {
			return {
				result: true,
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<UserPage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	//force fully store the current user value
	item.setState({ currentUser: currentUser });
	item.instance().deleteUser({
		email: "email@email.com",
	});
	const push = item.instance().props.history.push;
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/users?action=list&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&query=&sort_dir=asc&sort_field=email&userOid"
	);
});

/** User click on delete button and get unknown error */
test("User click on delete button and get unknown error", async () => {
	location.search = "?action=edit&limit=10&offset=0&sort_dir=asc&sort_field=email&userOid=email@email.com";
	const currentUser = {
		email: "email@email.com",
	};

	async function api(endpoint, data) {
		if (endpoint === "/auth/user-delete") {
			return {
				result: false,
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<UserPage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	//force fully store set email
	item.setState({ currentUser: currentUser });
	item.instance().deleteUser();

	await wait(50);
	item.update();

	expect(item.state().message).toEqual('Something went wrong and "email@email.com" was not deleted. Please try again later.');
});

/** User click on reset password button */
test("User click on reset password button", async () => {
	location.search = "?action=edit&limit=10&offset=0&sort_dir=asc&sort_field=email&userOid=schooladmin@email.com";

	let currentUser = {
		email: "schooladmin@email.com",
	};

	async function api(endpoint, data) {
		if (endpoint === "/auth/user-init-password-reset") {
			if (data.email === currentUser.email) {
				return {
					result: true,
				};
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<UserPage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	item.setState({ currentUser: { email: currentUser.email } });
	await wait(50);
	item.instance().resetPassword();
	await wait(50);
	item.update();

	expect(item.state().message).toEqual('This "schooladmin@email.com" password has been reset.');
});

/** User click on reset password button and get unknown error */
test("User click on reset password button and get unknown error", async () => {
	location.search = "?action=edit&limit=10&offset=0&sort_dir=asc&sort_field=email&userOid=schooladmin1@email.com";

	async function api(endpoint, data) {
		if (endpoint === "/auth/user-init-password-reset") {
			return {
				result: false,
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<UserPage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	item.setState({ currentUser: { email: "schooladmin1@email.com" } });
	await wait(50);
	item.instance().resetPassword();
	await wait(50);
	item.update();

	expect(item.state().message).toEqual(
		'Something went wrong and the password for "schooladmin1@email.com" was not changed. Please try again later. If the user hasn\'t activated their account yet, please re-send their activation email to set their password.'
	);
});

/** User (with school-admin role) click on submit button while create new user */
test("User click on submit button while create new user", async () => {
	mockUserData.role = "school-admin";
	location.search = "?action=new&limit=10&offset=0&sort_dir=asc&sort_field=email&userOid";

	async function api(endpoint, data) {
		if (endpoint === "/auth/user-create") {
			if (data.email === "abc@abc.com") {
				return {
					success: true,
					id: 1,
				};
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<UserPage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		title: "MR",
		email: "abc@abc.com",
		first_name: "abc",
		last_name: "xyz",
		role: "teacher",
	});

	await wait(50);
	item.update();

	expect(item.state().message).toEqual("Successfully added");
});

/** User (with cla-admin role) click on submit button while create new user */
test("User click on submit button while create new user", async () => {
	mockUserData.role = "cla-admin";
	location.search = "?action=new&limit=10&offset=0&sort_dir=asc&sort_field=email&userOid";
	let apiParamas = null;
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-create") {
			apiParamas = data;
			if (data.email === "abc@abc.com") {
				return {
					success: true,
					id: 1,
				};
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<UserPage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		title: "MR",
		email: "abc@abc.com",
		first_name: "abc",
		last_name: "xyz",
		role: "teacher",
		school_id: 1,
	});

	await wait(50);
	item.update();
	expect(item.state().message).toEqual("Successfully added");
});

/** User click on update button while edit user */
test("User click on update button while edit user", async () => {
	location.search = "?action=edit&limit=10&offset=0&sort_dir=asc&sort_field=email&userOid=schooladmin@email.com";

	async function api(endpoint, data) {
		if (endpoint === "/auth/user-update") {
			if (data.email === "schooladmin@email.com") {
				return {
					result: true,
				};
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<UserPage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.setState({ currentUser: { email: "schooladmin1@email.com" } });

	item.instance().handleSubmit({
		title: "MR",
		email: "schooladmin@email.com",
		first_name: "abc",
		last_name: "xyz",
		role: "teacher",
	});

	await wait(50);
	item.update();

	expect(item.state().message).toEqual("Successfully updated");
});

/** Component load wrong limit and offset values */
test("Component load wrong limit and offset values", async () => {
	location.search = "?action=new&limit=-1&offset=-1&sort_dir=asc&sort_field=email&userOid";
	async function api(endpoint, data) {
		return defaultApi(endpoint, true);
	}

	const item = shallow(<UserPage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().createUser();
	await wait(50);
	item.update();

	expect(item.state().action).toEqual(ACTION_NEW);
});

/** Use listing load getting the unknown error */
test("Use listing load getting the error", async () => {
	location.search = "?action=list&limit=-1&offset=-1&sort_dir=asc&sort_field=email&userOid";
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-get-all") {
			return defaultApi(endpoint, "error");
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<UserPage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.update();

	expect(item.state().message).toEqual("Unknown error");
});

/** User get Unknown error while loading the filter data*/
test("User get Unknown error while loading the filter data", async () => {
	location.search = "?action=list&limit=-1&offset=-1&sort_dir=asc&sort_field=email&userOid";
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-get-filters") {
			return defaultApi(endpoint, "error");
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(<UserPage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().message).toEqual("Unknown error");
});

/** User click on Submit button and getting the error while edit the user */
test("User click on submit while edit user and getting the error", async () => {
	location.search = "?action=edit&limit=-1&offset=-1&sort_dir=asc&sort_field=email&userOid=email@email.com";
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-update") {
			throw "A user with that email already exists";
		}
		return defaultApi("/auth/user-get-all", true);
	}
	const item = shallow(<UserPage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	item.setState({
		currentUser: {
			title: "MRs",
			email: "email@email.com",
			first_name: "abc 2",
			last_name: "xyz 3",
			role: "teacher 1",
		},
		action: ACTION_EDIT,
	});

	await wait(50);
	item.update();

	item.instance().handleSubmit({
		title: "MR",
		email: "email@email.com",
		first_name: "abc 1",
		last_name: "xyz 1",
		role: "teacher 1",
	});
	await wait(50);
	item.update();
	expect(item.state().message).toEqual("A user with that email already exists");
});

/** User click on create button and getting the error while creating the user */
test("User click on create and getting the error", async () => {
	location.search = "?action=new&limit=-1&offset=-1";
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-create") {
			throw "A user with that email already exists";
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(<UserPage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		title: "MR",
		email: "abc@abc.com",
		first_name: "abc",
		last_name: "xyz",
		role: "teacher",
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("A user with that email already exists");
});

/** User click on delete button and getting the error */
test("User click on delete button and getting the error", async () => {
	location.search = "?action=edit&limit=10&offset=0&sort_dir=asc&sort_field=email&userOid=schooladmin@email.com";
	let currentUser = {
		email: "email@email.com",
	};

	async function api(endpoint, data) {
		if (endpoint === "/auth/user-delete") {
			if (data.email === currentUser.email) {
				throw "Could not delete account";
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<UserPage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	//force fully store the current user value
	item.setState({ currentUser: currentUser });
	item.instance().deleteUser({
		email: "email@email.com",
	});

	const push = item.instance().props.history.push;
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().message).toEqual("Could not delete account");
});

/** User click on reset password button and getting the error*/
test("User click on reset password button and getting the error", async () => {
	location.search = "?action=edit&limit=10&offset=0&sort_dir=asc&sort_field=email&userOid=schooladmin@email.com";

	let currentUser = {
		email: "schooladmin@email.com",
	};

	async function api(endpoint, data) {
		if (endpoint === "/auth/user-init-password-reset") {
			if (data.email === currentUser.email) {
				throw "Could not reset password";
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<UserPage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	item.setState({ currentUser: { email: currentUser.email } });
	item.instance().resetPassword();
	await wait(50);
	item.update();

	expect(item.state().message).toEqual("Could not reset password");
});

/** User with cla-admin role should display school in table columns*/
test("User with cla-admin role should display school in table columns", async () => {
	mockUserData.role = USERROLE.claAdmin;
	const item = shallow(<UserPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.update();

	let hasSchoolColumn = item.state().columns.find((row) => row.name == "school") ? true : false;
	expect(hasSchoolColumn).toEqual(true);
});

/** User with school-admin role should not display school in table columns*/
test("User with school-admin role should not display school in table columns", async () => {
	mockUserData.role = USERROLE.schoolAdmin;
	const item = shallow(<UserPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.update();
	let hasSchoolColumn = item.state().columns.find((row) => row.name == "school") ? false : true;
	expect(hasSchoolColumn).toEqual(true);
});

/** User click on Edit for User link */
test("User click on edit User link", async () => {
	const item = shallow(<UserPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	const attrs = { "data-email": "schooladmin@email.com" };

	item.instance().doOpenEditScreen({
		preventDefault: jest.fn(),
		currentTarget: { getAttribute: (name) => attrs[name], ...attrs },
	});
	const push = item.instance().props.history.push;

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/users?action=edit&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&query=&sort_dir=asc&sort_field=email&userOid=schooladmin%40email.com"
	);
});

/** User (with cla-admin role) click on submit button while create new user as cla-admin */
test("User (with cla-admin role) click on submit button while create new user", async () => {
	mockUserData.role = USERROLE.claAdmin;
	location.search = "?action=new&limit=10&offset=0&sort_dir=asc&sort_field=email&userOid";
	let apiParamas = null;
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-create") {
			apiParamas = data;
			if (data.email === "abc@abc.com") {
				return {
					success: true,
					id: 1,
				};
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<UserPage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		title: "MR",
		email: "abc@abc.com",
		first_name: "abc",
		last_name: "xyz",
		role: USERROLE.claAdmin,
		school_id: 1,
	});

	await wait(50);
	item.update();

	expect(apiParamas.hasOwnProperty("school_id")).toEqual(false);
});

/** User (with cla-admin role) click on submit button while create new user as school-admin/teacher */
test("User (with cla-admin role) click on submit button while create new user", async () => {
	mockUserData.role = USERROLE.claAdmin;
	location.search = "?action=new&limit=10&offset=0&sort_dir=asc&sort_field=email&userOid";
	let apiParamas = null;
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-create") {
			apiParamas = data;
			if (data.email === "abc@abc.com") {
				return {
					success: true,
					id: 1,
				};
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<UserPage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.instance().handleSubmit({
		title: "MR",
		email: "abc@abc.com",
		first_name: "abc",
		last_name: "xyz",
		role: USERROLE.schoolAdmin,
		school_id: 1,
	});

	await wait(50);
	item.update();

	expect(apiParamas.hasOwnProperty("school_id")).toEqual(true);
});

/** User (with cla-admin role) click on update button while edit user role as "teacher"/"school-admin" */
test('User (with cla-admin role) click on update button while edit user role as "teacher"/"school-admin"', async () => {
	mockUserData = USERDATA[3];
	location.search = "?action=edit&limit=10&offset=0&sort_dir=asc&sort_field=email&userOid=schooladmin@email.com";
	let apiParamas = null;
	let mockPostData = {
		title: "MR",
		email: "schooladmin@email.com",
		first_name: "abc1 asas",
		last_name: "xyz asas",
		role: USERROLE.schoolAdmin,
		school_id: 3,
	};

	async function api(endpoint, data) {
		if (endpoint === "/auth/user-update") {
			apiParamas = data;
			return {
				result: true,
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<UserPage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	item.setState({ currentUser: { email: "schooladmin@email.com" } });
	await wait(100);
	item.update();
	item.instance().forceUpdate();
	item.instance().handleSubmit(mockPostData);

	await wait(50);
	item.update();
	expect(Object.keys(apiParamas).length).not.toBe(Object.keys(mockPostData).length);
});

/** User (with cla-admin role) click on update button while edit user role as "cla-admin" */
test('User (with cla-admin role) click on update button while edit user role as "cla-admin"', async () => {
	mockUserData.role = USERROLE.claAdmin;
	location.search = "?action=edit&limit=10&offset=0&sort_dir=asc&sort_field=email&userOid=schooladmin@email.com";
	let apiParamas = null;

	async function api(endpoint, data) {
		if (endpoint === "/auth/user-update") {
			apiParamas = data;
			return {
				result: true,
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<UserPage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	item.setState({ currentUser: { email: "schooladmin@email.com" } });
	await wait(100);
	item.update();
	item.instance().forceUpdate();

	item.instance().handleSubmit({
		title: "MR",
		email: "schooladmin@email.com",
		first_name: "abc1 asas",
		last_name: "xyz asas",
		role: USERROLE.claAdmin,
		school_id: 1,
	});

	await wait(50);
	item.update();

	let filterdata = apiParamas.school_id ? true : false;
	expect(filterdata).toEqual(false);
});
/** Update the state of Name Input Field like first name and last name */
test("User modify first name value", async () => {
	location.search = "?action=new&limit=10&offset=0&sort_dir=asc&sort_field=email&userOid";
	let apiParamas = null;
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-create") {
			apiParamas = data;
			if (data.email === "abc@abc.com") {
				return {
					success: true,
					id: 1,
				};
			}
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<UserPage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	const firstName = item.state().fields.first_name;
	item.instance().handleNameInputField(inputFieldValue, inputFieldName);
	item.update();
	item.instance().forceUpdate();
	await wait(50);

	expect(item.state().fields.first_name).not.toEqual(firstName);
});

/** User modify last name value*/
test("User modify last name value", async () => {
	mockUserData.role = USERROLE.claAdmin;
	location.search = "?action=edit&limit=10&offset=0&sort_dir=asc&sort_field=email&userOid=schooladmin@email.com";
	inputFieldName = "last_name";
	let apiParamas = null;

	async function api(endpoint, data) {
		if (endpoint === "/auth/user-update") {
			apiParamas = data;
			return {
				result: true,
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<UserPage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	const LastName = item.state().fields.last_name;
	await wait(50);
	item.instance().handleNameInputField(inputFieldValue, inputFieldName);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().fields.last_name).not.toEqual(LastName);
});

/** If user login with cla-admin and changed the school drop down value */
test("If user login with cla-admin and changed the school drop down value", async () => {
	mockUserData.role = USERROLE.claAdmin;
	let dropDownValue = { value: "2", label: "Test School 1" };

	const item = shallow(<UserPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().handleDrpChange("School", dropDownValue, true);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().fields.school_id).toEqual("2");
});

/** If user login with school-admin and changed the school drop down value */
test("If user login with school-admin and changed the role drop down value", async () => {
	mockUserData.role = USERROLE.claAdmin;
	let dropDownValue = { value: "2", label: "teacher" };

	const item = shallow(<UserPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().handleDrpRole(dropDownValue.label);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().fields.role).toEqual("teacher");
});

/** Component renders correctly with UserSearchFilters elements*/
test("Component renders correctly with UserSearchFilters elements", async () => {
	const item = shallow(<UserPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(10);
	expect(item.find("UserSearchFilters").length).toBe(1);
});

/** Component renders correctly with UserSearchFilters elements of roles and schools dropdown*/
test("Component renders correctly with UserSearchFilters elements when user login with cla-admin", async () => {
	mockUserData.role = UserRole.claAdmin;
	const item = shallow(<UserPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	expect(item.state().schoolData).not.toBeNull();
	expect(item.state().rolesData).not.toBeNull();
});

test("Component renders correctly with UserSearchFilters elements when user login with school-admin", async () => {
	mockUserData.role = UserRole.schoolAdmin;
	const item = shallow(<UserPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	expect(item.state().schoolData).toBe(undefined);
	expect(item.state().rolesData).not.toBeNull();
});

/** User search anything in filter input text*/
test("User search anything in search user filter input text", async () => {
	const item = shallow(<UserPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(10);
	const spy = jest.spyOn(item.instance(), "doSearch");
	item.instance().doSearch();
	expect(spy).toHaveBeenCalled();
});

/** User search school and call push histroy function*/
test("User search anything in search user filter input text and call function", async () => {
	const item = shallow(<UserPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(10);
	item.instance().handlefilterSelection("teacher", filters.QUERY);
	item.instance().doSearch();
	const push = item.instance().props.history.push;
	let query = push.mock.calls[0][0];
	expect(query.indexOf("&query=`teacher`").length !== -1).toBe(true);
});

/** User filter territory called handlefilterSelection */
test("When user filtering school filter", async () => {
	const item = shallow(<UserPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().handlefilterSelection([{ value: "2", label: "Another School" }], filters.SCHOOL);
	expect(item.state().selectedSchools).toEqual([{ value: "2", label: "Another School" }]);
});

test("When user clear school filter", async () => {
	const item = shallow(<UserPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().handlefilterSelection([], filters.SCHOOL);
	expect(item.state().selectedSchools).toEqual([]);
});

test("When user clear roles filter", async () => {
	const item = shallow(<UserPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().handlefilterSelection([], filters.ROLES);
	expect(item.state().selectedRoles).toEqual([]);
});

/** User also filter the only school and roles*/
test("User filtering only only school and roles", async () => {
	const item = shallow(<UserPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.instance().handlefilterSelection([{ value: "school-admin", label: "school admin" }], filters.ROLES);
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
	expect(query.indexOf("&filter_roles=`school-admin`").length !== -1).toBe(true);
});

/** User also filter the only school*/
test("User filtering only school filter", async () => {
	const item = shallow(<UserPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
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
	const item = shallow(<UserPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	const spy = jest.spyOn(item.instance(), "pushHistory");
	item.instance().resetAll();
	expect(spy).toHaveBeenCalled();
	expect(item.state().query).toBe("");
});

test("User filtering and load filter data", async () => {
	mockUserData.role = UserRole.claAdmin;
	location.search = "?action=list&limit=5&offset=0&sort_dir=asc&sort_field=email&userOid";
	const item = shallow(<UserPage location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.setProps({
		location: {
			search: "?action=" + ACTION_LIST + "&filter_schools=2&filter_roles=teacher&limit=5&offset=0&sort_dir=asc&sort_field=email&userOid",
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

/** User click on reset password button and get account locked  error */
test("User click on reset password button and get account locked error", async () => {
	location.search = "?action=edit&limit=10&offset=0&sort_dir=asc&sort_field=email&userOid=schooladmin1@email.com";

	async function api(endpoint, data) {
		if (endpoint === "/auth/user-init-password-reset") {
			return {
				result: false,
				message: "Email account temporarily locked",
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<UserPage location={location} history={history} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	item.setState({ currentUser: { email: "schooladmin1@email.com" } });
	await wait(50);
	item.instance().resetPassword();
	await wait(50);
	item.update();

	expect(item.state().message).toEqual("This user account is temporarily locked. Please try again in 5 minutes.");
});
