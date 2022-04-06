// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow, mount } from "enzyme";
import UnlockImageUpload from "../index";
import Header from "../../../widgets/Header";
import withApiConsumer from "../../../common/withApiConsumer";
import MockUnlocImageUploadData from "../../../mocks/MockUnlocImageUploadData";
import MockUser from "../../../mocks/MockUser";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);

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

let props, location;
let ACTION_LIST, ACTION_NEW, ACTION_EDIT;
let mockApiListData, mockUserData, history, page, limit, sortingA, sortingD, filters;

function resetAll() {
	mockUserData = MockUser[0];
	props = {
		location: {
			search: {
				limit: 10,
				offset: 0,
				action: "list",
				oid: "cc931bb3ea6972a6bc339fb42d806add3466",
				sort_field: "date_created",
				sort_dir: "D",
				query: "",
			},
		},
		api: defaultApi,
		withAuthConsumer_myUserDetails: mockUserData,
	};
	location = {
		search: `?limit=10&offset=0&action=list&sort_field=date_created&oid&sort_dir=D&query`,
	};
	history = {
		push: jest.fn(),
	};
	sortingA = [{ direction: "A", columnName: "date_created" }];
	sortingD = [{ direction: "D", columnName: "date_created" }];
	page = 2;
	ACTION_LIST = "list";
	ACTION_NEW = "new";
	ACTION_EDIT = "edit";
	mockUserData.role = "cla-admin";
	filters = {
		QUERY: "query",
	};
	mockApiListData = MockUnlocImageUploadData;
}

beforeEach(resetAll);
afterEach(resetAll);

/** wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

async function defaultApi(endpoint, data) {
	//only queries this endpoint
	if (endpoint === "/admin/unlock-image-upload-get-all") {
		if (data.query === "0") {
			throw "Something has been wrong";
		}
		return mockApiListData;
	} else if (endpoint === "/admin/unlock-image-upload-update") {
		if (data.oid === 0) {
			return {
				result: {
					isNotificationCreated: false,
					isUnlockAttemptCreated: false,
					isUnlockImageUpdated: false,
				},
			};
		} else if (data.oid === -1) {
			throw "Unknown error";
		} else if (data.isApproved === true) {
			return {
				result: {
					isNotificationCreated: true,
					isUnlockAttemptCreated: true,
					isUnlockImageUpdated: true,
				},
			};
		} else if (data.isApproved === false) {
			return {
				result: {
					isNotificationCreated: true,
					isUnlockAttemptCreated: false,
					isUnlockImageUpdated: true,
				},
			};
		}
		return mockApiListData;
	}
	throw new Error("should never be here");
}

/** Component renders correctly */
test("Component renders correctly", async () => {
	// const item = shallow(<UnlockImageUpload location={props.location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData}/>);
	const item = shallow(<UnlockImageUpload {...props} />);
	expect(item.containsMatchingElement(<Header />)).toBe(true);
	await wait(100);
	item.update();
	expect(item.state().sort_dir).toBe("D");
	expect(item.state().sort_field).toBe("date_created");
	expect(item.state().listingDataLoaded).toBe(true);
	expect(item.state().defaultSorting[0].columnName).toBe("date_created");
});

test("User passes the limit < 0 and offset < 0", async () => {
	props.location.search.limit = -10;
	props.location.search.limit = -2;
	// const item = shallow(<UnlockImageUpload location={props.location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData}/>);
	const item = shallow(<UnlockImageUpload {...props} />);
	expect(item.containsMatchingElement(<Header />)).toBe(true);
	item.setState({ limit: -10, offset: -1 });
	item.setProps({ location: { search: { limit: -15, offset: -5 } } });
	item.update();
	await wait(100);
	expect(item.state().limit).toBe(1);
});

test("user click on edit icon", async () => {
	let oID = MockUnlocImageUploadData.data[0].id;

	const item = shallow(
		<UnlockImageUpload location={location} api={defaultApi} history={history} hide={true} withAuthConsumer_myUserDetails={mockUserData} />
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
		"/profile/admin/unlock-via-image-upload?action=edit&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&query=&sort_dir=" +
			item.state().sort_dir +
			"&sort_field=" +
			item.state().sort_field
	);
});

/** When action edit */
test("User clicked on edit and get the raw data", async () => {
	location.search = `?action=${ACTION_EDIT}&limit=10&offset=0&oid=${MockUnlocImageUploadData.data[0].oid}&sort_dir=A&sort_field=name`;
	const item = shallow(<UnlockImageUpload location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	expect(item.containsMatchingElement(<Header />)).toBe(true);
	// item.setState({
	//   fields: MockUnlocImageUploadData.data,
	//   oid: "cc931bb3ea6972a6bc339fb42d806add3466",
	//   action: "edit"
	// });
	item.update();
	await wait(100);
	expect(item.state().oid).toBe(MockUnlocImageUploadData.data[0].oid);
	expect(item.state().action).toBe("edit");
	expect(item.state().fields.oid).toEqual(MockUnlocImageUploadData.data[0].oid);
});

/** User click on pagination page */
test("User click on pagination page", async () => {
	const item = shallow(
		<UnlockImageUpload location={location} api={defaultApi} history={history} hide={true} withAuthConsumer_myUserDetails={mockUserData} />
	);

	limit = 10;
	item.instance().doPagination(page, limit);
	await wait(10);
	item.update();

	const push = item.instance().props.history.push;
	const currentPage = page == 0 ? 0 : page - 1;
	const setOffset = currentPage * limit;

	let mockurl = "/profile/admin/unlock-via-image-upload?action=list&limit=10&offset=" + setOffset + "&query=&sort_dir=D&sort_field=date_created";
	await wait(20);
	expect(push.mock.calls[0][0]).toEqual(mockurl);
});

/** User click on sorting from table header field */
test("User click on sorting for asecending order", async () => {
	props.location.search.sort_dir = "D";
	const item = shallow(<UnlockImageUpload location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	//ascending order
	item.instance().doSorting(sortingA);
	await wait(10);
	item.update();
	expect(item.state().loading).toBe(true);
});

/** User click on sorting from table header field */
test("User click on sorting for descending order", async () => {
	props.location.search.sort_dir = "A";
	const item = shallow(<UnlockImageUpload location={location} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	const push = item.instance().props.history.push;
	//descending order
	item.instance().doSorting(sortingD);
	await wait(10);
	item.update();

	expect(item.state().loading).toBe(true);
	expect(push.mock.calls[0][0]).toEqual(
		`/profile/admin/unlock-via-image-upload?action=list&limit=10&offset=0&query=&sort_dir=D&sort_field=date_created`
	);
});

/** User click on cancel button  while ADD Or Edit Form display */
test("User click on cancel button", async () => {
	const item = shallow(<UnlockImageUpload location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().cancelAddEdit();
	const push = item.instance().props.history.push;
	await wait(20);
	item.update();
	item.instance().forceUpdate();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/unlock-via-image-upload?action=" +
			ACTION_LIST +
			"&id&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&query=&sort_dir=D&sort_field=date_created"
	);
});

/** User search anything and call query*/
test("User search anything and call doSearch", async () => {
	const item = shallow(<UnlockImageUpload location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />);
	await wait(50);
	const spy = jest.spyOn(item.instance(), "doSearch");
	item.instance().doSearch();
	expect(spy).toHaveBeenCalled();
});

/** User search school and call push histroy function*/
test("User search school and call push histroy function", async () => {
	const item = shallow(<UnlockImageUpload location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />);
	await wait(10);
	item.instance().handlefilterSelection("school", filters.QUERY);
	item.instance().doSearch();
	const push = item.instance().props.history.push;
	let query = push.mock.calls[0][0];
	expect(query.indexOf("&query=`school`").length !== -1).toBe(true);
});

/** User reset all */
test("User clears all filters", async () => {
	const item = shallow(<UnlockImageUpload location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />);
	await wait(50);
	const spy = jest.spyOn(item.instance(), "pushHistory");
	item.instance().resetAll();
	expect(spy).toHaveBeenCalled();
	expect(item.state().query).toBe("");
});

/** User search school and call push histroy function*/
test("User search school and call push histroy function", async () => {
	location.search = "?query=0";
	const item = shallow(<UnlockImageUpload location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />);
	await wait(10);
	expect(item.state().message).toEqual("Something has been wrong");
});

/** When action edit */
test("User edit the request and update the input values", async () => {
	location.search = `?action=${ACTION_EDIT}&limit=10&offset=0&oid=${MockUnlocImageUploadData.data[0].oid}&sort_dir=A&sort_field=name`;
	const item = shallow(<UnlockImageUpload location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	expect(item.containsMatchingElement(<Header />)).toBe(true);
	item.update();
	await wait(100);
	expect(item.state().oid).toBe(MockUnlocImageUploadData.data[0].oid);
	expect(item.state().action).toBe("edit");
	expect(item.state().fields.oid).toEqual(MockUnlocImageUploadData.data[0].oid);
	const ISBN = "9876454552110";
	item.instance().handleNameInputField(ISBN, "pdf_isbn13", true);
	expect(item.state().fields.pdf_isbn13).toEqual(ISBN);
});

/** When action edit */
test("User edit the request and approve the unlock asset request", async () => {
	location.search = `?action=${ACTION_EDIT}&limit=10&offset=0&oid=${MockUnlocImageUploadData.data[0].oid}&sort_dir=A&sort_field=name`;
	const item = shallow(<UnlockImageUpload location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	expect(item.containsMatchingElement(<Header />)).toBe(true);
	item.update();
	await wait(100);
	expect(item.state().oid).toBe(MockUnlocImageUploadData.data[0].oid);
	expect(item.state().action).toBe("edit");
	expect(item.state().fields.oid).toEqual(MockUnlocImageUploadData.data[0].oid);
	const ISBN = "9876454552110";
	item.instance().handleNameInputField(ISBN, "pdf_isbn13", true);
	expect(item.state().fields.pdf_isbn13).toEqual(ISBN);

	const updatedData = {
		pdf_isbn13: ISBN,
		oid: MockUnlocImageUploadData.data[0].oid,
		isApproved: true,
	};
	item.instance().handleSubmit(updatedData);
	await wait(100);
	expect(item.state().message).toEqual("Successfully updated.");
});

test("User edit the request and reject the unlock asset request", async () => {
	location.search = `?action=${ACTION_EDIT}&limit=10&offset=0&oid=${MockUnlocImageUploadData.data[0].oid}&sort_dir=A&sort_field=name`;
	const item = shallow(<UnlockImageUpload location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	expect(item.containsMatchingElement(<Header />)).toBe(true);
	item.update();
	await wait(100);
	expect(item.state().oid).toBe(MockUnlocImageUploadData.data[0].oid);
	expect(item.state().action).toBe("edit");
	expect(item.state().fields.oid).toEqual(MockUnlocImageUploadData.data[0].oid);
	const ISBN = "9876454552110";
	item.instance().handleNameInputField(ISBN, "pdf_isbn13", true);
	expect(item.state().fields.pdf_isbn13).toEqual(ISBN);

	const updatedData = {
		rejection_reason: "Not cleared picture",
		oid: MockUnlocImageUploadData.data[0].oid,
		isApproved: false,
	};
	item.instance().handleSubmit(updatedData);
	await wait(100);
	expect(item.state().message).toEqual("Successfully updated.");
});

test("User edit the request and getting the error message like 'Error updating request.'", async () => {
	location.search = `?action=${ACTION_EDIT}&limit=10&offset=0&oid=${MockUnlocImageUploadData.data[0].oid}&sort_dir=A&sort_field=name`;
	const item = shallow(<UnlockImageUpload location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	expect(item.containsMatchingElement(<Header />)).toBe(true);
	item.update();
	await wait(100);
	expect(item.state().oid).toBe(MockUnlocImageUploadData.data[0].oid);
	expect(item.state().action).toBe("edit");
	expect(item.state().fields.oid).toEqual(MockUnlocImageUploadData.data[0].oid);
	const ISBN = "9876454552110";
	item.instance().handleNameInputField(ISBN, "pdf_isbn13", true);
	expect(item.state().fields.pdf_isbn13).toEqual(ISBN);

	const updatedData = {
		rejection_reason: "Not cleared picture",
		oid: 0,
		isApproved: false,
	};
	item.instance().handleSubmit(updatedData);
	await wait(100);
	expect(item.state().message).toEqual("Error updating request.");
});

test("User edit the request and getting the unknow error", async () => {
	location.search = `?action=${ACTION_EDIT}&limit=10&offset=0&oid=${MockUnlocImageUploadData.data[0].oid}&sort_dir=A&sort_field=name`;
	const item = shallow(<UnlockImageUpload location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	expect(item.containsMatchingElement(<Header />)).toBe(true);
	item.update();
	await wait(100);
	expect(item.state().oid).toBe(MockUnlocImageUploadData.data[0].oid);
	expect(item.state().action).toBe("edit");
	expect(item.state().fields.oid).toEqual(MockUnlocImageUploadData.data[0].oid);
	const ISBN = "9876454552110";
	item.instance().handleNameInputField(ISBN, "pdf_isbn13", true);
	expect(item.state().fields.pdf_isbn13).toEqual(ISBN);

	const updatedData = {
		rejection_reason: "Not cleared picture",
		oid: -1,
		isApproved: false,
	};
	item.instance().handleSubmit(updatedData);
	await wait(100);
	expect(item.state().message).toEqual("Unknown error");
});

test("User edit the request and getting the message like 'Params not found'", async () => {
	location.search = `?action=${ACTION_EDIT}&limit=10&offset=0&oid=${MockUnlocImageUploadData.data[0].oid}&sort_dir=A&sort_field=name`;
	const item = shallow(<UnlockImageUpload location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	expect(item.containsMatchingElement(<Header />)).toBe(true);
	item.update();
	await wait(100);
	expect(item.state().oid).toBe(MockUnlocImageUploadData.data[0].oid);
	expect(item.state().action).toBe("edit");
	expect(item.state().fields.oid).toEqual(MockUnlocImageUploadData.data[0].oid);
	const ISBN = "9876454552110";
	item.instance().handleNameInputField(ISBN, "pdf_isbn13", true);
	expect(item.state().fields.pdf_isbn13).toEqual(ISBN);

	const updatedData = null;
	item.instance().handleSubmit(updatedData);
	await wait(100);
	expect(item.state().message).toEqual("Params not found.");
});
