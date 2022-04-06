import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow, mount } from "enzyme";
import MockUser from "../../../mocks/MockUser";
import AllNotification from "../index";
import Header from "../../../widgets/Header";
import MockNotifications from "../../../mocks/MockNotificationData";

let location,
	sortingA,
	sortingD,
	page,
	history,
	mockUserData,
	mockClassData,
	filters,
	isDeleted = false,
	searchFilterText;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

/** wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("react-router-dom", () => ({ withRouter: (a) => a, Link: (b) => b }));
jest.mock("../../../common/withAdminAuthRequiredConsumer", () => {
	return function (WrappedComponent) {
		return WrappedComponent;
	};
});
jest.mock("../../../common/EventEmitter/withEventEmitterConsumer", () => mockPassthruHoc);

async function defaultApi(endpoint, data) {
	// "ClassesPage" only queries this endpoint
	if (endpoint === "/auth/get-notification") {
		if (data.hasOwnProperty("getCount") && data.getCount) {
			return Math.random() * 10;
		}
		return MockNotifications;
	}
	if (endpoint === "/auth/notification-get-filters") {
		return {
			result: [
				{
					id: "status",
					title: "Read/Unread",
					data: [
						{ id: 1, title: "Read", value: 1 },
						{ id: 2, title: "Unread", value: 0 },
					],
				},
			],
		};
	}
	if (endpoint === "/auth/update-notification") {
		return { result: true, unread_count: 2 };
	}
	if (endpoint === "/auth/delete-notification") {
		isDeleted = true;
		return { result: true };
	}
	throw new Error("should never be here");
}

function resetAll() {
	location = {
		search: "?filter_status=1&limit=10&offset=0&query=test&sort_dir=A&sort_field=title",
	};
	history = {
		push: jest.fn(),
	};
	sortingA = [{ direction: "A", columnName: "description" }];
	sortingD = [{ direction: "D", columnName: "description" }];
	page = 2;
	mockUserData = MockUser[0];
	filters = {
		status: [],
	};
	isDeleted = false;
	searchFilterText = null;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(
		<AllNotification
			location={location}
			api={defaultApi}
			withAuthConsumer_myUserDetails={mockUserData}
			eventEmitter_emit={jest.fn()}
			eventEmitter_off={jest.fn()}
			eventEmitter_on={jest.fn()}
		/>
	);
	await wait(100);
	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

test("Mark Notification as Read/Unread", async () => {
	const item = shallow(
		<AllNotification
			location={location}
			api={defaultApi}
			withAuthConsumer_myUserDetails={mockUserData}
			eventEmitter_emit={jest.fn()}
			eventEmitter_off={jest.fn()}
			eventEmitter_on={jest.fn()}
		/>
	);
	await wait(100);
	await item.instance().markNotificationReadUnread(true, MockNotifications.data[0].oid);
	let toUpdateNotificationData = item.state().notifications.filter((notif) => notif.oid === MockNotifications.data[0].oid);
	expect(toUpdateNotificationData[0].has_read).toBe(true);
});

test("Delete Notification", async () => {
	const item = shallow(
		<AllNotification
			location={location}
			api={defaultApi}
			withAuthConsumer_myUserDetails={mockUserData}
			eventEmitter_emit={jest.fn()}
			eventEmitter_off={jest.fn()}
			eventEmitter_on={jest.fn()}
		/>
	);
	await wait(100);
	await item.instance().deleteNotification(MockNotifications.data[0].oid);
	await wait(20);
	expect(isDeleted).toBe(true);
});

test("search by query", async () => {
	const mockFunction = jest.fn();
	const item = shallow(
		<AllNotification
			location={location}
			api={defaultApi}
			withAuthConsumer_myUserDetails={mockUserData}
			history={{ push: mockFunction }}
			eventEmitter_emit={jest.fn()}
			eventEmitter_off={jest.fn()}
			eventEmitter_on={jest.fn()}
		/>
	);
	item.setState({
		query: "test",
		selectedStatus: ["1", "2"],
	});
	await item.instance().doSearch();
	expect(mockFunction).toHaveBeenCalled();
});

test("fetch notification based on filter", async () => {
	location.search = "?filter_status=1&limit=5&offset=0&query=test&sort_dir=D&sort_field=date_created";
	const item = shallow(
		<AllNotification
			location={location}
			api={defaultApi}
			withAuthConsumer_myUserDetails={mockUserData}
			history={history}
			eventEmitter_emit={jest.fn()}
			eventEmitter_off={jest.fn()}
			eventEmitter_on={jest.fn()}
		/>
	);
	await wait(100);
	item.update();
	expect(item.state().searchFilterText.length).not.toBe(0);
});

test("User showing result with default search options", async () => {
	location.search = "";
	const item = shallow(
		<AllNotification
			location={location}
			api={defaultApi}
			withAuthConsumer_myUserDetails={mockUserData}
			history={history}
			eventEmitter_emit={jest.fn()}
			eventEmitter_off={jest.fn()}
			eventEmitter_on={jest.fn()}
		/>
	);
	await wait(100);
	item.update();
	expect(item.state().limit).toBe(10);
	expect(item.state().offset).toBe(0);
	expect(item.state().sort_field).toBe("date_created");
	expect(item.state().sort_dir).toBe("D");
	expect(item.state().query).toBe("");
});

test("toggle Notification Submenu and close submenu on notification toggle close", async () => {
	const item = shallow(
		<AllNotification
			location={location}
			api={defaultApi}
			withAuthConsumer_myUserDetails={mockUserData}
			history={history}
			eventEmitter_emit={jest.fn()}
			eventEmitter_off={jest.fn()}
			eventEmitter_on={jest.fn()}
		/>
	);

	await wait(100);
	item.setState({
		openNotificationOid: null,
	});

	item.instance().onToggleNotificationItem({ stopPropagation: jest.fn() }, MockNotifications.data[0].oid);
	expect(item.state().openNotificationOid).toBe(MockNotifications.data[0].oid);
	item.instance().onToggleNotificationItem({ stopPropagation: jest.fn() }, MockNotifications.data[0].oid);
	expect(item.state().openNotificationOid).toBe(null);

	item.setState({
		openNotificationOid: "123",
	});

	item.instance().resetSubmenuToggle();
	expect(item.state().openNotificationOid).toBe(null);
});

test("Click On Page", async () => {
	const item = shallow(
		<AllNotification
			location={location}
			api={defaultApi}
			withAuthConsumer_myUserDetails={mockUserData}
			history={history}
			eventEmitter_emit={jest.fn()}
			eventEmitter_off={jest.fn()}
			eventEmitter_on={jest.fn()}
		/>
	);

	await wait(100);
	item.instance().doPagination(2, 3);
	expect(item.state().offset).toBe(3);
	expect(item.state().limit).toBe(3);

	item.instance().doPagination(0, 3);
	expect(item.state().offset).toBe(0);
});

test("Handle Filter selection", async () => {
	const item = shallow(
		<AllNotification
			location={location}
			api={defaultApi}
			withAuthConsumer_myUserDetails={mockUserData}
			history={history}
			eventEmitter_emit={jest.fn()}
			eventEmitter_off={jest.fn()}
			eventEmitter_on={jest.fn()}
		/>
	);

	await wait(100);
	item.instance().handlefilterSelection(["1"], "status");
	expect(item.state().selectedStatus.length).toBe(1);
	item.instance().handlefilterSelection("searchTest", "query");
	expect(item.state().query).toBe("searchTest");

	item.instance().resetAll();
	expect(item.state().selectedStatus.length).toBe(0);
	expect(item.state().query).toBe("");
});

test(`Test componentWillUnmount method`, async () => {
	const mockFunction = jest.fn();
	const item = shallow(
		<AllNotification
			location={location}
			api={defaultApi}
			withAuthConsumer_myUserDetails={mockUserData}
			history={history}
			eventEmitter_emit={mockFunction}
			eventEmitter_off={mockFunction}
			eventEmitter_on={mockFunction}
		/>
	);
	item.instance().componentWillUnmount();
	expect(mockFunction).toHaveBeenCalled();
});

test(`Test fetchFilters method When limit is less then 1 and offset is negative`, async () => {
	const mockFunction = jest.fn();
	location.search = "?filter_status=1&limit=0&offset=-1&query=test&sort_dir=A&sort_field=title";
	const item = shallow(
		<AllNotification
			location={location}
			api={defaultApi}
			withAuthConsumer_myUserDetails={mockUserData}
			history={history}
			eventEmitter_emit={mockFunction}
			eventEmitter_off={mockFunction}
			eventEmitter_on={mockFunction}
		/>
	);
	await wait(100);
	expect(item.state("limit")).toBe(1);
	expect(item.state("offset")).toBe(0);
});

test(`User getting unknown error`, async () => {
	const mockFunction = jest.fn();
	location.search = "?filter_status=1&limit=0&offset=1&query=test&sort_dir=A&sort_field=title";

	const api = async function (endpoint, data) {
		if (endpoint === "/auth/notification-get-filters") {
			throw new Error("Unknown error");
		}
		defaultApi(endpoint, data);
	};

	const item = shallow(
		<AllNotification
			location={location}
			api={api}
			withAuthConsumer_myUserDetails={mockUserData}
			history={history}
			eventEmitter_emit={mockFunction}
			eventEmitter_off={mockFunction}
			eventEmitter_on={mockFunction}
		/>
	);
	await wait(100);
	item.update();
	expect(item.state("message")).toEqual(Error("Unknown error"));
});

test(`User click on 'description' for sorting asc`, async () => {
	const mockFunction = jest.fn();
	location.search = "?filter_status=1&limit=0&offset=1&query=test&sort_dir=A&sort_field=title";

	const item = shallow(
		<AllNotification
			location={location}
			api={defaultApi}
			withAuthConsumer_myUserDetails={mockUserData}
			history={history}
			eventEmitter_emit={mockFunction}
			eventEmitter_off={mockFunction}
			eventEmitter_on={mockFunction}
		/>
	);

	item.instance().doSorting([{ columnName: "description", direction: "asc" }]);
	const push = item.instance().props.history.push;
	await wait(100);
	expect(push.mock.calls[0][0]).toEqual("/see-all-notifications?limit=10&loading=true&offset=0&query=&sort_dir=A&sort_field=description");
});

test(`User click on 'description' for sorting desc`, async () => {
	const mockFunction = jest.fn();
	location.search = "?filter_status=1&limit=0&offset=1&query=test&sort_dir=A&sort_field=title";

	const item = shallow(
		<AllNotification
			location={location}
			api={defaultApi}
			withAuthConsumer_myUserDetails={mockUserData}
			history={history}
			eventEmitter_emit={mockFunction}
			eventEmitter_off={mockFunction}
			eventEmitter_on={mockFunction}
		/>
	);

	item.instance().doSorting([{ columnName: "description", direction: "desc" }]);
	const push = item.instance().props.history.push;
	await wait(100);
	expect(push.mock.calls[0][0]).toEqual("/see-all-notifications?limit=10&loading=true&offset=0&query=&sort_dir=D&sort_field=description");
});

test(`User click on action column radio icon from table raw`, async () => {
	const mockFunction = jest.fn();
	location.search = "?filter_status=1&limit=0&offset=1&query=test&sort_dir=A&sort_field=title";

	const item = shallow(
		<AllNotification
			location={location}
			api={defaultApi}
			withAuthConsumer_myUserDetails={mockUserData}
			history={history}
			eventEmitter_emit={mockFunction}
			eventEmitter_off={mockFunction}
			eventEmitter_on={mockFunction}
		/>
	);

	item.instance().markNotificationReadUnread(false, MockNotifications.data[0].oid);
	await wait(100);
	expect(item.state().offset).toEqual(0);
});

test(`User click on action column radio icon from table raw and execute the on emit event`, async () => {
	const mockFunction = jest.fn();
	location.search = "?filter_status=1&limit=0&offset=1&query=test&sort_dir=A&sort_field=title";

	const item = shallow(
		<AllNotification
			location={location}
			api={defaultApi}
			withAuthConsumer_myUserDetails={mockUserData}
			history={history}
			eventEmitter_emit={mockFunction}
			eventEmitter_off={mockFunction}
			eventEmitter_on={mockFunction}
		/>
	);

	item.instance().markNotificationReadUnread(false, MockNotifications.data[0].oid);
	await wait(100);
	expect(item.state().offset).toEqual(0);
	item.instance().onEmit();
	expect(item.state().offset).toEqual(0);
	expect(item.state().limit).toEqual(1);
});

test(`User click on unread notification title and open the intent to copy form for high priority notification`, async () => {
	const mockFunction = jest.fn();
	location.search = "?filter_status=1&limit=0&offset=1&query=test&sort_dir=A&sort_field=title";

	const item = shallow(
		<AllNotification
			location={location}
			api={defaultApi}
			withAuthConsumer_myUserDetails={mockUserData}
			history={history}
			eventEmitter_emit={mockFunction}
			eventEmitter_off={mockFunction}
			eventEmitter_on={mockFunction}
		/>
	);

	item.instance().openIntentToCopyForm(MockNotifications.data[2]);
	await wait(100);
	expect(item.state().showIntentToCopyForm).toEqual(true);
	expect(item.state().currentNotif).toEqual(MockNotifications.data[2]);
});

test(`User click on read notification title for high priority notification and click on close`, async () => {
	const mockFunction = jest.fn();
	location.search = "?filter_status=1&limit=0&offset=1&query=test&sort_dir=A&sort_field=title";

	const item = shallow(
		<AllNotification
			location={location}
			api={defaultApi}
			withAuthConsumer_myUserDetails={mockUserData}
			history={history}
			eventEmitter_emit={mockFunction}
			eventEmitter_off={mockFunction}
			eventEmitter_on={mockFunction}
		/>
	);

	item.instance().openIntentToCopyForm(MockNotifications.data[3]);
	await wait(100);
	expect(item.state().showIntentToCopyForm).toEqual(true);
	expect(item.state().currentNotif).toEqual(MockNotifications.data[3]);

	item.instance().onCloseIntentToCopy();
	await wait(100);
	expect(item.state().showIntentToCopyForm).toEqual(false);
	expect(item.state().currentNotif).toEqual(null);
});

test(`User click on notification but can't open intent to copy form popup`, async () => {
	const mockFunction = jest.fn();
	location.search = "?filter_status=1&limit=0&offset=1&query=test&sort_dir=A&sort_field=title";

	const item = shallow(
		<AllNotification
			location={location}
			api={defaultApi}
			withAuthConsumer_myUserDetails={mockUserData}
			history={history}
			eventEmitter_emit={mockFunction}
			eventEmitter_off={mockFunction}
			eventEmitter_on={mockFunction}
		/>
	);

	item.instance().openIntentToCopyForm(MockNotifications.data[1]);
	await wait(100);
	expect(item.state().showIntentToCopyForm).toEqual(false);
	expect(item.state().currentNotif).toEqual(null);
});

test(`User don't see any filters`, async () => {
	const mockFunction = jest.fn();
	location.search = "?filter_status=1&limit=0&offset=1&query=test&sort_dir=A&sort_field=title";

	const api = async function (endpoint, data) {
		if (endpoint === "/auth/notification-get-filters") {
			return {
				result: [],
			};
		}
		defaultApi(endpoint, data);
	};

	const item = shallow(
		<AllNotification
			location={location}
			api={api}
			withAuthConsumer_myUserDetails={mockUserData}
			history={history}
			eventEmitter_emit={mockFunction}
			eventEmitter_off={mockFunction}
			eventEmitter_on={mockFunction}
		/>
	);
	await wait(100);
	item.update();
	expect(item.state("filters")).toEqual([]);
});
