// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React, { createRef } from "react";
import { shallow } from "enzyme";
import Header from "../index";
import MockUserData from "../../../mocks/MockUser";
import MockNotificationData from "../../../mocks/MockNotificationData";

let mockUserData, mockProps, hocConf, mockNotificationData, mockFunction, props, mockIsFocusOnMaincontent, mockElement;
/**
 * This 'HOC' does nothing but 'pass through' the provided component,
 * so it's not necessary to 'dive()' into rendered results,
 * and so it's possible to mock the 'api' function.
 **/
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

/** Mock for assets */
jest.mock("../../../assets/images/cla_logo.png", () => jest.fn());
jest.mock("../../../assets/icons/close.png", () => jest.fn());
jest.mock("../../../assets/icons/menu.svg", () => jest.fn());
jest.mock("../../../assets/icons/Library.svg", () => jest.fn());

/** Mock for HOC */
jest.mock("../../../common/staticValues", () => {
	return { NotificationIntervalTime: 100 };
});
jest.mock("../../../common/withAuthConsumer", () => mockPassthruHoc);
jest.mock("../../../common/EventEmitter/withEventEmitterConsumer", () => mockPassthruHoc);
jest.mock("react-router-dom", () => ({ withRouter: (a) => a, Link: (b) => b }));
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("react-resize-detector/build/withPolyfill", () => {
	return { withResizeDetector: mockPassthruHoc };
});

global.document.getElementById = (id) => {
	if (id == "main-content") {
		return {
			querySelector: () => {
				return {
					focus: () => {
						mockIsFocusOnMaincontent = true;
						return mockIsFocusOnMaincontent;
					},
				};
			},
		};
	}
};

jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return {
			current: {
				value: "mack",
				contains: () => {
					return true;
				},
			},
		};
	};
});

/**wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}
//../../common/EventEmitter/withEventEmitterConsumer

async function defaultApi(endpoint, data = null) {
	// "ActivatePasswordPage" only queries this endpoint
	if (endpoint === "/auth/get-notification") {
		if (data.getCount) {
			return {
				unread_count: Math.random() * 20,
				high_priority_count: 0,
			};
		}
		return mockNotificationData;
	} else if (endpoint === "/auth/update-notification") {
		return { result: true };
	} else if (endpoint === "/auth/delete-notification") {
		return { result: true };
	} else if (endpoint === "/public/extract-get-review-count") {
		return {
			result: { count: 43 },
		};
	}
	throw new Error("should never be here");
}

function resetAll() {
	mockFunction = jest.fn();
	mockNotificationData = MockNotificationData;
	mockUserData = null;
	mockIsFocusOnMaincontent = false;
	mockElement = "";
	mockProps = {
		withAuthConsumer_myUserDetails: null,
		withAuthConsumer_lastError: null,
		hide_search: true,
		isShowSkipContentLink: false,
		jumpToContentId: "main-content",
		match: {
			path: "/",
			url: "/",
			isExact: true,
			params: {},
		},
		location: {
			pathname: "/",
			search: "",
			hash: "",
			key: "az8bb7",
		},
		history: {
			length: 5,
			action: "PUSH",
			location: {
				pathname: "/",
				search: "",
				hash: "",
				key: "az8bb7",
			},
		},
		eventEmitter_on: (arg1, arg2) => {
			return true;
		},
		eventEmitter_off: (arg1, arg2) => {
			return true;
		},
	};
	hocConf = {
		width: 1024,
		height: 1000,
	};
	props = {
		setNotificationCount: mockFunction,
		onClose: mockFunction,
		width: 1300,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(
		<Header
			{...props}
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			hide_search={true}
			match={mockProps.match}
			location={mockProps.location}
			api={defaultApi}
			history={mockProps.history}
			eventEmitter_on={mockProps.eventEmitter_on}
			isShowSkipContentLink={false}
		/>
	);
	await wait(100);
	item.update();
	expect(item.find("WrapperHeader").length).toBe(1);
	expect(item.find("BlogLink").length).toBe(1);
});

/** User scroll the page (scroll position greater than 10) */
test("User scroll the page (scroll position set as 20)", async () => {
	window.scrollY = 20;

	const item = shallow(
		<Header
			{...props}
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			hide_search={true}
			match={mockProps.match}
			location={mockProps.location}
			api={defaultApi}
			history={mockProps.history}
			eventEmitter_on={mockProps.eventEmitter_on}
		/>
	);
	window.dispatchEvent(new window.UIEvent("scroll", {}));

	expect(item.state().scrolled).toBe(true);
});

test("Test onOutsideDropdownClick method", async () => {
	window.scrollY = 20;
	const e = {
		target: {
			classList: {
				contains: () => {
					return false;
				},
			},
		},
	};
	const item = shallow(
		<Header
			{...props}
			withAuthConsumer_myUserDetails={MockUserData[1]}
			withAuthConsumer_lastError={null}
			hide_search={true}
			match={mockProps.match}
			location={mockProps.location}
			api={defaultApi}
			history={mockProps.history}
			eventEmitter_on={mockProps.eventEmitter_on}
		/>
	);
	item.setState({ openNotificationOid: true });
	window.dispatchEvent(new window.UIEvent("scroll", {}));
	item.find("Notification").props().onOutsideDropdownClick(e);
	expect(item.state("openNotificationOid")).toBe(null);

	item.setState({ openNotificationOid: false });
	item.find("Notification").props().onOutsideDropdownClick(e);
	expect(item.state("openNotificationOid")).toBe(false);
});

/** User scroll the page Up */
test("User scroll the page Up", async () => {
	window.scrollY = 0;

	const item = shallow(
		<Header
			{...props}
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			hide_search={true}
			match={mockProps.match}
			location={mockProps.location}
			api={defaultApi}
			history={mockProps.history}
			eventEmitter_on={mockProps.eventEmitter_on}
		/>
	);
	window.dispatchEvent(new window.UIEvent("scroll", {}));

	expect(item.state().scrolled).toBe(false);
});

/** User move to another page from Home page */
test("User move to another page from Home page", async () => {
	const item = shallow(
		<Header
			{...props}
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			hide_search={true}
			match={mockProps.match}
			location={mockProps.location}
			api={defaultApi}
			history={mockProps.history}
			eventEmitter_on={mockProps.eventEmitter_on}
			isShowSkipContentLink={false}
		/>
	);
	mockProps.location = {
		pathname: "/works",
		search: "?q=english",
		hash: "",
		key: "ewx4w4",
	};

	item.setProps({ location: mockProps.location });

	expect(item.find("WrapperHeader").length).toBe(1);
});

/** Component load for signed in user */
test("Component load correctly for signed in user", async () => {
	mockUserData = MockUserData[0];
	const item = shallow(
		<Header
			{...props}
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			hide_search={true}
			match={mockProps.match}
			location={mockProps.location}
			api={defaultApi}
			history={mockProps.history}
			eventEmitter_on={mockProps.eventEmitter_on}
		/>
	);
	item.setProps({ location: mockProps.location });
	expect(item.find("AccountMenu").length).toBe(1);
});

/** User click on profile after signed in*/
test("User click on profile", async () => {
	mockUserData = MockUserData[0];

	const item = shallow(
		<Header
			{...props}
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			hide_search={true}
			match={mockProps.match}
			location={mockProps.location}
			api={defaultApi}
			history={mockProps.history}
			eventEmitter_on={mockProps.eventEmitter_on}
		/>
	);
	const accountMenuOpenLink = item.find("ProfileName");
	accountMenuOpenLink.simulate("click", {
		stopPropagation: jest.fn(),
	});

	expect(item.state().accountMenuOpen).toBe(true);
});

/** User click outside the profile menu */
test("User click outside the profile menu", async () => {
	mockUserData = MockUserData[0];

	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			hide_search={true}
			match={mockProps.match}
			location={mockProps.location}
			api={defaultApi}
			history={mockProps.history}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	item.setProps({ setNotificationCount: "", onClose: "" });
	const accountMenuOpenLink = item.find("AccountMenuOpen");

	accountMenuOpenLink.simulate("click", {
		preventDefault: jest.fn(),
	});

	accountMenuOpenLink.simulate("click", {
		preventDefault: jest.fn(),
	});

	expect(item.state().accountMenuOpen).toBe(false);
});

test("User click on notification icon when profile menu is open", async () => {
	mockUserData = MockUserData[0];

	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			hide_search={true}
			match={mockProps.match}
			location={mockProps.location}
			api={defaultApi}
			history={mockProps.history}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	item.setProps({ setNotificationCount: "2", onClose: "" });

	item.setState({ accountMenuOpen: true });

	item.find("ALink").simulate("click", {
		stopPropagation: jest.fn(),
	});

	await wait(50);

	expect(item.state().accountMenuOpen).toBe(false);
	expect(item.state().showNotifications).toBe(true);
});

test("User click on profile when notification menu is open", async () => {
	mockUserData = MockUserData[0];

	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			hide_search={true}
			match={mockProps.match}
			location={mockProps.location}
			api={defaultApi}
			history={mockProps.history}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	item.setProps({ setNotificationCount: "2", onClose: "" });

	item.setState({ showNotifications: true });

	item.find("ProfileName").simulate("click", {
		stopPropagation: jest.fn(),
	});

	await wait(50);

	expect(item.state().accountMenuOpen).toBe(true);
	expect(item.state().showNotifications).toBe(false);
});

/** User click on menu icon in responsive view */
test("User click on menu icon in responsive view", async () => {
	mockUserData = MockUserData[0];

	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			hide_search={true}
			match={mockProps.match}
			location={mockProps.location}
			api={defaultApi}
			history={mockProps.history}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	item.setProps({ onClose: "" });
	const accountMenuOpenLink = item.find("AccountMenuOpenLinkIcon");
	accountMenuOpenLink.simulate("click", {
		stopPropagation: jest.fn(),
	});

	item.setState({ accountMenuOpen: true });
	expect(item.state().accountMenuOpen).toBe(true);
});

/** User click on close menu icon in responsive view */
test("User click on close menu icon in responsive view", async () => {
	mockUserData = MockUserData[0];

	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			hide_search={true}
			match={mockProps.match}
			location={mockProps.location}
			api={defaultApi}
			history={mockProps.history}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);

	const accountMenuOpenLink = item.find("AccountMenu");
	accountMenuOpenLink.simulate("click", {
		preventDefault: jest.fn(),
	});
	expect(item.state().accountMenuOpen).toBe(false);
});

/** User click on signout */
test("User click on signout", async () => {
	mockUserData = MockUserData[0];

	const mockwithAuthConsumer_logout = jest.fn();
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			hide_search={true}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={defaultApi}
			withAuthConsumer_logout={mockwithAuthConsumer_logout}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);

	const AccountMenuLogout = item.find("AccountMenuItemSignOut").find("AccountMenuLink");
	AccountMenuLogout.simulate("click", {
		preventDefault: jest.fn(),
	});
	expect(mockwithAuthConsumer_logout).toHaveBeenCalled();
});

/** Hide Serch Wrapper */
test("Hide Serch Wrapper", async () => {
	mockUserData = MockUserData[0];
	const mockwithAuthConsumer_logout = jest.fn();
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={defaultApi}
			withAuthConsumer_logout={mockwithAuthConsumer_logout}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	expect(item.find("HeaderSearch").length).toBe(0);
});

/** User login with teacher role */
test("User login with teacher role", async () => {
	mockUserData = MockUserData[0];
	mockUserData.role = "teacher";
	const mockwithAuthConsumer_logout = jest.fn();
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			withAuthConsumer_logout={mockwithAuthConsumer_logout}
			api={defaultApi}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	expect(item.find("Administration").length).toBe(0);
});

/** Hide my-copies link when user login with cla-admin  */
test("Hide my-copies link when user login with cla-admin", async () => {
	mockUserData = MockUserData[3];
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={defaultApi}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	expect(item.find("AccountMenuLink").at(1).text()).not.toEqual("My Copies");
});

/** Show my-copies link when user login with school-admin/teacher*/
test("Show my-copies link when user login with school-admin/teacher", async () => {
	mockUserData = MockUserData[2];
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={defaultApi}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	expect(item.find("AccountMenuLink").at(1).text()).toEqual("My Copies");
});

/** User login with teacher role*/
test("User login with teacher display the Administration link in dropdown", async () => {
	mockUserData = MockUserData[2];
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={defaultApi}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	expect(item.find("AccountMenuLink").at(5).text()).toEqual("Administration");
});

/** after the toggel function it is return vice a versa value of menuOpen */
test("Component render with location key updated ", async () => {
	mockUserData = MockUserData[2];
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={defaultApi}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	let prevMenuOpen = item.state().menuOpen;
	item.setState({ menuOpen: true });
	item.setProps({ location: { key: "xyz" } });
	item.setProps({ open: true });

	item.update();
	item.instance().forceUpdate();

	await wait(50);
	expect(item.state().menuOpen).toBe(prevMenuOpen);
});

/** When User click on outside area of menu*/
test("When User click on outside area of menu", async () => {
	mockUserData = MockUserData[2];
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={defaultApi}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	item.instance().handleOutsideClick({
		preventDefault: jest.fn(),
		target: { value: "mack" },
	});
	expect(item.find("HeaderLoginSection").length).toBe(1);
	item.setState({
		accountMenuOpen: true,
	});
	item.update();
	item.instance().handleOutsideClick({
		preventDefault: jest.fn(),
		target: { value: "mack" },
	});
});

/** When User click on logout button on mobile menu*/
test("When User click on logout button on mobile menu", async () => {
	mockUserData = MockUserData[2];
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={defaultApi}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	item.setState({ menuOpen: true });
	item.setProps({ width: 320, withAuthConsumer_logout: jest.fn() });

	item.find("MobAccountMenuLink").at(4).simulate("click", { preventDefault: jest.fn() });
	item.setState({ menuOpen: false });
	expect(item.find("MobAccountMenuLink").at(4).length).toBe(1);
});

/** When User role is cla admin in mobile view*/
test("When User role is not cla admin in mobile view", async () => {
	mockUserData = MockUserData[3];
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={defaultApi}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	item.setProps({ width: 320 });
	expect(item.find("MobileAccountSection").length).toBe(1);
});

/** When User is not login in mobile view*/
test("When User is not login in mobile view", async () => {
	mockUserData = null;
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={defaultApi}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	item.setProps({ width: 320 });
	expect(item.find("MobileSignInSection").length).toBe(1);
});

test(`When count is greater than limit`, async () => {
	mockUserData = MockUserData[1];
	async function api(endpoint, data = null) {
		// "ActivatePasswordPage" only queries this endpoint
		if (endpoint === "/auth/get-notification") {
			if (data.getCount) {
				return 30;
			}
			return mockNotificationData;
		}
		throw new Error("should never be here");
	}
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={api}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	await wait(100);
	item.find("NotificationBellIcon").simulate("click", {
		preventDefault: jest.fn(),
	});
	expect(item.state().showNotifications).toBe(false);
	expect(item.state().notificationCountText).toMatch(/20+/);
});

test(`mark notification read/unread `, async () => {
	mockUserData = MockUserData[1];
	async function api(endpoint, data = null) {
		if (endpoint === "/auth/get-notification") {
			if (data.showAll) {
				return mockNotificationData;
			} else if (data.getCount) {
				return {
					unread_count: 1,
					high_priority_count: 2,
					totalNotificationCount: 4,
				};
			}
		} else if (endpoint === "/auth/update-notification") {
			return {
				result: true,
				unread_count: 1,
				high_priority_count: 2,
			};
		}
		throw new Error("should never be here");
	}
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={api}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	await wait(500);
	item.find("NotificationBellIcon").simulate("click", {
		preventDefault: jest.fn(),
	});
	expect(item.state().notificationCount).toBe(1);
	await item.instance().markNotificationReadUnread(true, mockNotificationData.data[0].oid);
	expect(item.state().notificationCount).toBe(1);
});

test(`mark notification read/unread `, async () => {
	mockUserData = MockUserData[1];
	async function api(endpoint, data = null) {
		if (endpoint === "/auth/get-notification") {
			if (data.showAll) {
				return mockNotificationData;
			} else if (data.getCount) {
				return {
					unread_count: 1,
					high_priority_count: 2,
					totalNotificationCount: 4,
				};
			}
		} else if (endpoint === "/auth/update-notification") {
			return {
				result: true,
				unread_count: 1,
				high_priority_count: 2,
			};
		}
		throw new Error("should never be here");
	}
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={api}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	await wait(500);
	await item.find("NotificationBellIcon").simulate("click", {
		preventDefault: jest.fn(),
	});
	expect(item.state().notificationCount).toBe(1);
	item.setState({
		notifications: [
			{
				oid: "da8461c58e7cb4fffac7e3892a9bec231a1d",
				has_read: "",
			},
		],
	});
	await item.instance().markNotificationReadUnread(true, mockNotificationData.data[0].oid);

	expect(item.state("notifications")).toEqual([{ oid: "da8461c58e7cb4fffac7e3892a9bec231a1d", has_read: "" }]);

	item.setState({
		notifications: [
			{
				oid: "da8461c58e7cb4fffac7e3892a9bec",
				has_read: "",
			},
		],
	});
	await item.instance().markNotificationReadUnread(true, mockNotificationData.data[0].oid);

	expect(item.state("notifications")).toEqual([{ oid: "da8461c58e7cb4fffac7e3892a9bec", has_read: "" }]);
});

test(`delete all notifications by category`, async () => {
	mockUserData = MockUserData[1];
	let countcall = 0;
	async function api(endpoint, data = null) {
		if (endpoint === "/auth/get-notification") {
			if (data.getCount) {
				return 20;
			}
			if (countcall) {
				return {
					data: [],
					unread_count: 0,
					high_priority_count: 0,
					totalNotificationCount: 0,
				};
			}
			return mockNotificationData;
		} else if (endpoint === "/auth/delete-notification") {
			countcall++;
			return {
				result: true,
			};
		}
		throw new Error("should never be here");
	}
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={api}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	await wait(500);
	item.find("NotificationBellIcon").simulate("click", {
		stopPropagation: jest.fn(),
	});
	await wait(200);
	await item.instance().deleteNotification(0, 1);
	await wait(200);
	expect(item.state().notifications.length).toBe(0);
	item.setState({ onClose: "" });
	item.setState({ onClose: "" });
	await item.instance().toggleNotification({
		stopPropagation: jest.fn(),
	});
	expect(item.state().showNotifications).toBe(false);
});

test(`When Notification Popup is Open for more than 1 minute`, async () => {
	mockUserData = MockUserData[1];
	let item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={defaultApi}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	item.instance().onToggleNotificationItem(mockNotificationData.data[0].oid);
	expect(item.state().openNotificationOid).toBe(mockNotificationData.data[0].oid);
	item.instance().onToggleNotificationItem(mockNotificationData.data[0].oid);
	expect(item.state().openNotificationOid).toBe(null);
	item.setState({
		showNotifications: true,
		lastListFetchedTime: new Date().getTime() - 700000,
	});
	await item.instance().toggleNotification({
		stopPropagation: jest.fn(),
	});
	expect(item.state().lastListFetchedTime).not.toBe(0);

	item.setState({
		showNotifications: true,
	});

	item.instance().getAllNotificationTimer();
	await wait(100);
});

test(`When Notification Popup is Open for more than 1 minute and _isMounted false`, async () => {
	mockUserData = MockUserData[1];
	let item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={defaultApi}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	item.instance().onToggleNotificationItem(mockNotificationData.data[0].oid);
	expect(item.state().openNotificationOid).toBe(mockNotificationData.data[0].oid);
	item.instance().onToggleNotificationItem(mockNotificationData.data[0].oid);
	expect(item.state().openNotificationOid).toBe(null);
	item.setState({
		showNotifications: true,
		lastListFetchedTime: new Date().getTime() - 700000,
	});
	item.instance()._isMounted = false;
	await item.instance().toggleNotification({
		stopPropagation: jest.fn(),
	});
	expect(item.state().lastListFetchedTime).not.toBe(0);

	item.setState({
		showNotifications: true,
	});

	item.instance().getAllNotificationTimer();
	await wait(100);
});

test(`When user Gets logged out remove timers`, async () => {
	mockUserData = MockUserData[1];
	let item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={defaultApi}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>,
		{ disableLifecycleMethods: false }
	);
	await item.find("NotificationBellIcon").simulate("click", {
		preventDefault: jest.fn(),
	});
	expect(item.state().allNotificatioInterval).not.toBe(0);
	item.instance().clearTimer(item.state().allNotificatioInterval);
	expect(item.state().allNotificatioInterval).toBe(undefined);
});

test(`Close Popup when clicked on Document`, async () => {
	mockUserData = MockUserData[1];
	let item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={defaultApi}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	item.setState({
		showNotifications: true,
	});
	let e = {
		target: null,
		preventDefault: jest.fn(),
	};
	await item.instance().handleOutsideNotificationClick(e);
	await wait(500);
	expect(item.state().showNotifications).toBe(true);
	item.setState({
		showNotifications: true,
	});
	item.setProps({
		withAuthConsumer_myUserDetails: null,
		location: { key: "123" },
	});
	item.update();
	expect(item.state().allNotificatioInterval).toBe(undefined);
});

test(`Remove interval on unmount`, async () => {
	mockUserData = MockUserData[1];
	async function api(endpoint, data = null) {
		if (endpoint === "/auth/get-notification") {
			if (data.getCount) {
				return 15;
			}
			const data = { ...mockNotificationData };
			data.unread_count = 50;
			return data;
		} else if (endpoint === "/auth/delete-notification") {
			return {
				result: true,
			};
		}
		throw new Error("should never be here");
	}
	let item = shallow(
		<Header
			{...props}
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={defaultApi}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			eventEmitter_off={(arg1, arg2) => jest.fn()}
		/>
	);
	const componentWillUnmount = jest.spyOn(item.instance(), "componentWillUnmount");
	await wait(20);
	item.unmount();
	expect(componentWillUnmount).toHaveBeenCalled();
});

test(`User get the notification count as '20+'`, async () => {
	mockUserData = MockUserData[1];
	mockNotificationData.unread_count = 50;
	async function api(endpoint, data = null) {
		if (endpoint === "/auth/get-notification") {
			if (data.getCount) {
				return {
					unread_count: 25,
					high_priority_count: 4,
					totalNotificationCount: 30,
				};
			}
			return mockNotificationData;
		} else if (endpoint === "/auth/delete-notification") {
			return {
				result: true,
			};
		}
		throw new Error("should never be here");
	}
	let item = shallow(
		<Header
			{...props}
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={api}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
		/>
	);
	await wait(20);
	item.find("NotificationBellIcon").simulate("click", {
		preventDefault: jest.fn(),
	});
	const getAllNotifications = jest.spyOn(item.instance(), "getAllNotifications");
	await wait(200);
	await item.instance().deleteNotification(mockNotificationData.data[0].oid);
	await wait(200);

	expect(item.state().notificationCount).toEqual(25);
	expect(getAllNotifications).toHaveBeenCalled();
});

test(`Test onEmit method when scrolling is not set`, async () => {
	window.scrollY = 0;
	async function api(endpoint, data = null) {
		if (endpoint === "/auth/get-notification") {
			if (data.getCount) {
				return {
					unread_count: 25,
					high_priority_count: 4,
					totalNotificationCount: 30,
				};
			}
			return mockNotificationData;
		}
		throw new Error("should never be here");
	}
	const item = shallow(
		<Header
			{...props}
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			hide_search={true}
			match={mockProps.match}
			location={mockProps.location}
			api={api}
			history={mockProps.history}
			eventEmitter_on={mockProps.eventEmitter_on}
		/>
	);
	window.dispatchEvent(new window.UIEvent("scroll", {}));
	item.instance().onEmit();
	await wait(200);
	expect(item.state("notificationCount")).toBe(25);
});

test("User redirect to another page", async () => {
	const item = shallow(
		<Header
			{...props}
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			hide_search={true}
			match={mockProps.match}
			location={mockProps.location}
			api={defaultApi}
			history={mockProps.history}
			eventEmitter_on={mockProps.eventEmitter_on}
			eventEmitter_off={mockProps.eventEmitter_off}
			isShowSkipContentLink={false}
		/>
	);
	await wait(100);
	item.update();
	expect(item.find("WrapperHeader").length).toBe(1);
	expect(item.find("BlogLink").length).toBe(1);

	item.instance().componentWillUnmount();
	await wait(100);
	const result_1 = await item.instance().getNotificationCount();
	const result_2 = await item.instance().getAllNotifications();

	expect(item.instance()._isMounted).toBe(undefined);
	expect(result_1).toBe(undefined);
	expect(result_2).toBe(undefined);
});

test(`User mark high proority unread notification`, async () => {
	mockUserData = MockUserData[1];
	async function api(endpoint, data = null) {
		if (endpoint === "/auth/get-notification") {
			if (data.showAll) {
				return mockNotificationData;
			} else if (data.getCount) {
				return {
					unread_count: 2,
					high_priority_count: 2,
					totalNotificationCount: 4,
				};
			}
		} else if (endpoint === "/auth/update-notification") {
			return {
				result: true,
				unread_count: 1,
				high_priority_count: 2,
				totalNotificationCount: 4,
			};
		}
		throw new Error("should never be here");
	}
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={api}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	await wait(500);
	item.setState({ showAllNotification: true });
	await item.find("NotificationBellIcon").simulate("click", {
		preventDefault: jest.fn(),
	});
	await wait(100);
	expect(item.state().notificationCount).toBe(2);

	//click on unread notification
	await item.instance().markNotificationReadUnread(true, mockNotificationData.data[2], false);
	expect(item.state().notificationCount).toBe(2);
	expect(item.state().showIntentToCopyForm).toBe(true);
	expect(item.state().currentNotif).toBe(mockNotificationData.data[2]);

	//close the content to copy form popup
	await item.instance().onCloseIntentToCopy();
	expect(item.state().notificationCount).toBe(1);
	expect(item.state().showIntentToCopyForm).toBe(false);
	expect(item.state().currentNotif).toBe(null);
});

test(`User mark high proority read notification`, async () => {
	mockUserData = MockUserData[1];
	async function api(endpoint, data = null) {
		if (endpoint === "/auth/get-notification") {
			if (data.showAll) {
				return mockNotificationData;
			} else if (data.getCount) {
				return {
					unread_count: 2,
					high_priority_count: 2,
					totalNotificationCount: 4,
				};
			}
		} else if (endpoint === "/auth/update-notification") {
			return {
				result: true,
				unread_count: 1,
				high_priority_count: 2,
				totalNotificationCount: 4,
			};
		}
		throw new Error("should never be here");
	}
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={api}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	await wait(500);
	item.setState({ showAllNotification: true });
	await item.find("ALink").simulate("click", {
		stopPropagation: jest.fn(),
	});
	await wait(200);

	//click on read notification
	await item.instance().markNotificationReadUnread(true, mockNotificationData.data[3], false);
	expect(item.state().showIntentToCopyForm).toBe(true);
	expect(item.state().currentNotif).toBe(mockNotificationData.data[3]);

	//close the content to copy form popup
	await item.instance().onCloseIntentToCopy();
	expect(item.state().showIntentToCopyForm).toBe(false);
	expect(item.state().currentNotif).toBe(null);
});

test(`User mark high proority read notification and leave the page`, async () => {
	mockUserData = MockUserData[1];
	async function api(endpoint, data = null) {
		if (endpoint === "/auth/get-notification") {
			if (data.showAll) {
				return mockNotificationData;
			} else if (data.getCount) {
				return {
					unread_count: 2,
					high_priority_count: 2,
					totalNotificationCount: 4,
				};
			}
		} else if (endpoint === "/auth/update-notification") {
			return {
				result: true,
				unread_count: 1,
				high_priority_count: 2,
				totalNotificationCount: 4,
			};
		}
		throw new Error("should never be here");
	}
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={api}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			eventEmitter_off={mockProps.eventEmitter_off}
			{...props}
		/>
	);
	await wait(500);
	item.instance().componentWillUnmount();
	item.setState({ showAllNotification: true });
	await item.find("ALink").simulate("click", {
		stopPropagation: jest.fn(),
	});
	await wait(200);
	//click on read notification
	const result_2 = await item.instance().markNotificationReadUnread(true, mockNotificationData.data[3], false);
	expect(result_2).toBe(undefined);
	expect(item.state().showIntentToCopyForm).toBe(true);
	expect(item.state().currentNotif).toBe(mockNotificationData.data[3]);

	//close the content to copy form popup
	await item.instance().onCloseIntentToCopy();
	expect(item.state().showIntentToCopyForm).toBe(false);
	expect(item.state().currentNotif).toBe(null);
});

test(`User delete all notifications by category and leave the page`, async () => {
	mockUserData = MockUserData[1];
	let countcall = 0;
	async function api(endpoint, data = null) {
		if (endpoint === "/auth/get-notification") {
			if (data.getCount) {
				return 20;
			}
			if (countcall) {
				return {
					data: [],
					unread_count: 0,
					high_priority_count: 0,
					totalNotificationCount: 0,
				};
			}
			return mockNotificationData;
		} else if (endpoint === "/auth/delete-notification") {
			countcall++;
			return {
				result: true,
			};
		}
		throw new Error("should never be here");
	}
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={api}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			eventEmitter_off={mockProps.eventEmitter_off}
			{...props}
		/>
	);
	await wait(500);
	item.instance().componentWillUnmount();
	item.find("NotificationBellIcon").simulate("click", {
		stopPropagation: jest.fn(),
	});
	await wait(200);
	await item.instance().deleteNotification(0, 1);
	await wait(200);
	expect(item.state().notifications.length).toBe(0);
	item.setState({ onClose: "" });
	item.setState({ onClose: "" });
	await item.instance().toggleNotification({
		stopPropagation: jest.fn(),
	});
	expect(item.state().showNotifications).toBe(false);
});

test("User seen the Skip Content Link in page", async () => {
	mockUserData = MockUserData[3];
	props.isShowSkipContentLink = true;
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={defaultApi}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	item.setProps({ width: 320 });
	expect(item.find("WrapperHeader").length).toBe(2);
});

/** User login with teacher role*/
test("User login with teacher display the 'My Copies' link in dropdown", async () => {
	mockUserData = MockUserData[2];
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={defaultApi}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	expect(item.find("AccountMenuLink").at(1).text()).toEqual("My Copies");
});
/** User login with teacher role*/
test("User login with teacher display the 'Review Copies' link in dropdown", async () => {
	mockUserData = MockUserData[2];
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={defaultApi}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	expect(item.find("AccountMenuLink").at(2).text()).toEqual("Review Copies ");
});

/** User login with teacher role*/
test("User login with teacher display the 'My Favourites' link in dropdown", async () => {
	mockUserData = MockUserData[2];
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={defaultApi}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	expect(item.find("AccountMenuLink").at(3).text()).toEqual("My Favourites");
});

/** User login with cla admin role*/
test("User login with cla admin and the 'My Copies' link not visible in dropdown", async () => {
	mockUserData = MockUserData[3];
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={defaultApi}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	expect(item.find("AccountMenuLink").at(1).text()).toEqual("Unlocked Content");
});

/** User login with cla admin role*/
test("User login with cla admin and the 'My Favourites' link not visible in dropdown", async () => {
	mockUserData = MockUserData[3];
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={defaultApi}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	expect(item.find("AccountMenuLink").at(2).text()).toEqual("Administration");
});

test("User seen the Skip Content Link in page and click to skip content link", async () => {
	mockUserData = MockUserData[3];
	props.isShowSkipContentLink = true;
	props.jumpToContentId = "main-content";
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={defaultApi}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	const SkipContentLink = item.find("SkipContentLink");
	SkipContentLink.simulate("click");
	expect(mockIsFocusOnMaincontent).toEqual(true);
});

test("User seen the Skip Content Link in page and click to skip content link but not get element", async () => {
	mockUserData = MockUserData[3];
	props.isShowSkipContentLink = true;
	props.jumpToContentId = "main";
	const item = shallow(
		<Header
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={null}
			match={mockProps.match}
			location={mockProps.location}
			history={mockProps.history}
			api={defaultApi}
			hide_search={false}
			eventEmitter_on={mockProps.eventEmitter_on}
			{...props}
		/>
	);
	const SkipContentLink = item.find("SkipContentLink");
	SkipContentLink.simulate("click");
	expect(mockIsFocusOnMaincontent).toEqual(false);
});
