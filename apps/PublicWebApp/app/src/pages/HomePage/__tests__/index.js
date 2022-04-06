import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow, mount } from "enzyme";
import HomePage from "../index";
import Header from "../../../widgets/Header";
import MockUserData from "../../../mocks/MockUser";
import MockUserRole from "../../../mocks/MockUserRole";
import MockData from "../../../mocks/MockCopyManagementPage";
import MockSlideData from "../../../mocks/MockSlideData";
import staticValues from "../../../common/staticValues";

const homeScreenBox = staticValues.homeScreenBox;
const FLYOUT_SCREEN_SEARCH = homeScreenBox.search;
const FLYOUT_SCREEN_UNLOCK = homeScreenBox.unlock;
const FLYOUT_SCREEN_REVIEW_COPIES = homeScreenBox.reviewCopies;
const FLYOUT_SCREEN_REVIEW_ROLLOVER = homeScreenBox.reviewRollover;

/**
 * This 'HOC' does nothing but 'pass through' the provided component,
 * so it's not necessary to 'dive()' into rendered results,
 * and so it's possible to mock the 'api' function.
 **/
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

// Mock import
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAuthConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withPageSize", () => mockPassthruHoc);
jest.mock("react-router-dom", () => ({ withRouter: (a) => a, Link: (b) => b }));

jest.mock("../../../common/FlyOutHandler", () => {
	return class {
		constructor(instance, api, screen) {
			this._instance = instance;
			this._api = api;
			this._screen = screen;
			this._active = true;
		}

		destroy() {
			this._active = false;
		}

		getSeen() {
			this._api("/public/first-time-user-experience-get-mine-seen", { screen: this._screen }).then((result) => {
				if (!this._active) {
					return;
				}
				this._instance.setState({
					flyOutIndex: parseInt(result.result, 10),
				});
			});
		}
		setSeen(index) {
			return new Promise((resolve) => {
				this._api("/public/first-time-user-experience-update", { screen: this._screen, index: index }).then(() => {
					if (!this._active) {
						return;
					}
					this._instance.setState({
						flyOutIndex: index,
					});
					resolve();
				});
			});
		}
		onClose(cb, redirectURL) {
			const nextIndex = this._instance.state.flyOutIndex + 1;
			this.setSeen(nextIndex).then(() => {
				if (typeof cb === "function") {
					cb();
				}
				if (redirectURL && typeof redirectURL === "string") {
					this._instance.props.history.push(redirectURL);
				}
			});
		}

		onCloseNotification(cb, redirectURL) {
			const nextIndex = this._instance.state.flyOutIndexNotification + 1;
			this.setSeenNotification(nextIndex).then(() => {
				if (typeof cb === "function") {
					cb();
				}
				if (redirectURL && typeof redirectURL === "string") {
					this._instance.props.history.push(redirectURL);
				}
			});
		}

		getSeenNotification() {
			this._api("/public/first-time-user-experience-get-mine-seen", { screen: "notification" }).then((result) => {
				if (!this._active) {
					return;
				}
				this._instance.setState({
					flyOutIndexNotification: parseInt(result.result, 10),
				});
			});
		}
	};
});

// Mock asset imports
// Mock asset imports
jest.mock("../../../widgets/PageWrap/images/Sign_in_Shape_1.svg", () => jest.fn());
jest.mock("../../../widgets/PageWrap/images/Sign_in_Shape_2.svg", () => jest.fn());
jest.mock("../../../assets/images/Hero_image_mobile.jpg", () => jest.fn());
jest.mock("../../../assets/images/Hero_image_Desktop.jpg", () => jest.fn());
jest.mock("../../../assets/images/publishers_bg.png", () => jest.fn());
jest.mock("../../../assets/images/publishers.png", () => jest.fn());
jest.mock("../video.mp4", () => jest.fn());
jest.mock("../../../assets/icons/Play_video.png", () => jest.fn());
jest.mock("../../../assets/images/rhema-kallianpur-471933-unsplash.jpg", () => jest.fn());
jest.mock("../../../assets/images/Unlock_book_instruction.png", () => jest.fn());
jest.mock(`../../../assets/images/about-platform.jpg`, () => jest.fn());
jest.mock(`../../../assets/images/barcode.png`, () => jest.fn());
jest.mock(`../../../assets/images/UnlockImage.png`, () => jest.fn());
jest.mock(`../../../assets/images/SearchImage.png`, () => jest.fn());
jest.mock(`../../../assets/images/EP_Laptop.png`, () => jest.fn());
jest.mock(`../../../assets/images/EP_Book.png`, () => jest.fn());
jest.mock(`../../../assets/images/searchUnlockBackground.png`, () => jest.fn());
jest.mock("../../../assets/images/cover_img.png", () => jest.fn());

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

let api,
	mockUserData,
	mockResultFlyoutIndex,
	mockResultFlyoutUpdate,
	mockResultUserUnlockedAttempt,
	mockfunction,
	mockResultFlyoutDisabled,
	mockData,
	mockHomeFlyoutInfo,
	mockDidChange;

jest.mock("../../../common/userDidChange", () => {
	return () => {
		return mockDidChange;
	};
});

async function defaultApi(endpoint, data) {
	// "UserPage" only queries this endpoint
	if (endpoint === "/public/extract-search") {
		if (mockUserData.role !== MockUserRole.claAdmin) {
			return mockData;
		}
	} else if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
		return mockResultFlyoutIndex;
	} else if (endpoint === "/public/first-time-user-experience-update") {
		return mockResultFlyoutUpdate;
	} else if (endpoint === "/auth/update-my-details") {
		return mockResultFlyoutDisabled;
	} else if (endpoint === "/public/carousel-slide-get-all") {
		return MockSlideData;
	} else if (endpoint === "/public/get-home-flyout-info") {
		return mockHomeFlyoutInfo;
	}

	// This will be caught by the promise in the component
	//throw new Error('should never be here');
}

/**
 * Reset function
 */
function resetAll() {
	api = null;
	mockUserData = MockUserData[2];
	mockData = MockData.ExtractSearch;
	mockResultFlyoutIndex = { result: -1 };
	mockResultFlyoutUpdate = { result: true };
	mockResultUserUnlockedAttempt = { user: false, school: true };
	mockResultFlyoutDisabled = { result: true };
	mockHomeFlyoutInfo = {
		flyout_seen_data: {},
		rollover_data: {
			extract_expiry_count: 2,
			rollover_completed: "rolled-over",
			target_execution_date: "2021-06-15T14:37:03.482Z",
		},
	};
	history = {
		push: jest.fn(),
	};
	mockDidChange = false;
	// jest.resetModules();
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly*/
test("Component renders correctly", async () => {
	const item = shallow(
		<HomePage
			location={{ state: null }}
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={{}}
			withAuthConsumer_attemptAuth={{}}
			withAuthConsumer_logout={{}}
			api={defaultApi}
		/>
	);
	await wait(50);
	expect(item.find(Header).length).toBe(1);
});

/** When user login with cla-admin then hide my-copies section */
test("When user login with cla-admin then hide my-copies section", async () => {
	mockUserData = MockUserData[3];
	const item = shallow(
		<HomePage
			location={{ state: null }}
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={{}}
			withAuthConsumer_attemptAuth={{}}
			withAuthConsumer_logout={{}}
			api={defaultApi}
		/>
	);
	expect(item.find("MyCopiesSection").length).toBe(0);
});

/** When user login with teacher/school-admin then show my-copies section */
test("When user login with teacher/school-admin then show my-copies section", async () => {
	mockUserData = MockUserData[2];
	mockUserData.flyout_enabled = false;
	mockResultFlyoutIndex = 5;
	const item = shallow(
		<HomePage
			location={{ state: null }}
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={{}}
			withAuthConsumer_attemptAuth={{}}
			withAuthConsumer_logout={{}}
			api={defaultApi}
		/>
	);

	await wait(50);
	item.update();
	//expect(item.state("flyOutIndex")).toBe(-1);
	expect(item.find("MyCopiesSection").length).toBe(1);
});

/** User login with cla-admin and then after login with another user */
test("User login with cla-admin and then after login with another user", async () => {
	mockUserData = MockUserData[2];
	const item = shallow(
		<HomePage
			location={{ state: null }}
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={{}}
			withAuthConsumer_attemptAuth={{}}
			withAuthConsumer_logout={{}}
			api={defaultApi}
		/>
	);

	const userRole = mockUserData.role;
	item.setProps({ withAuthConsumer_myUserDetails: MockUserData[3] });

	await wait(50);
	item.update();

	const newUser = item.instance().props.withAuthConsumer_myUserDetails.role;
	expect(newUser).not.toEqual(userRole);
});

test("Show can see the all popup boxes)", async () => {
	mockUserData = MockUserData[2];
	mockUserData.flyout_enabled = true;
	mockResultFlyoutIndex = { result: -1 };
	const mockCall = jest.fn();
	const item = shallow(
		<HomePage
			location={{ state: null }}
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={{}}
			withAuthConsumer_attemptAuth={{}}
			withAuthConsumer_logout={{}}
			withAuthConsumer_attemptReauth={mockCall}
			api={defaultApi}
		/>
	);

	await wait(50);
	item.update();
	expect(item.find("FlyoutBoxes").length).toBe(1);
	const isShowSearchBox = item.instance().getSeenIndex(FLYOUT_SCREEN_SEARCH) === -1;
	expect(isShowSearchBox).toBe(true);
	item.instance().componentWillUnmount();
});

test("Show Search popup box", async () => {
	mockUserData = MockUserData[2];
	mockUserData.flyout_enabled = true;
	mockResultFlyoutIndex = { result: 1 };
	const mockCall = jest.fn();
	const item = shallow(
		<HomePage
			location={{ state: null }}
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={{}}
			withAuthConsumer_attemptAuth={{}}
			withAuthConsumer_logout={{}}
			withAuthConsumer_attemptReauth={mockCall}
			api={defaultApi}
		/>
	);
	await wait(50);
	item.update();
	expect(item.find("FlyoutBoxes").length).toBe(1);
	const isShowRolloverBox = item.instance().shouldShowRollOverBox();
	expect(isShowRolloverBox).toBe(true);
	const isShowSearchBox = item.instance().getSeenIndex(FLYOUT_SCREEN_SEARCH) === -1;
	expect(isShowSearchBox).toBe(true);
	const isShowUnlockBox = item.instance().getSeenIndex(FLYOUT_SCREEN_UNLOCK) === -1;
	expect(isShowUnlockBox).toBe(true);
});

test("Show Unlock popup box", async () => {
	mockUserData = MockUserData[2];
	mockUserData.flyout_enabled = true;
	mockResultFlyoutIndex = { result: 3 };
	const mockCall = jest.fn();
	const item = shallow(
		<HomePage
			location={{ state: null }}
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={{}}
			withAuthConsumer_attemptAuth={{}}
			withAuthConsumer_logout={{}}
			withAuthConsumer_attemptReauth={{}}
			withAuthConsumer_attemptReauth={mockCall}
			api={defaultApi}
		/>
	);
	await wait(50);
	item.update();
	expect(item.find("FlyoutBoxes").length).toBe(1);
	const isShowUnlockBox = item.instance().getSeenIndex(FLYOUT_SCREEN_UNLOCK) === -1;
	expect(isShowUnlockBox).toBe(true);
});

test("User see slider", async () => {
	const mockCall = jest.fn();
	const item = shallow(
		<HomePage
			location={{ state: null }}
			withAuthConsumer_myUserDetails={{}}
			withAuthConsumer_lastError={{}}
			withAuthConsumer_attemptAuth={{}}
			withAuthConsumer_logout={{}}
			withAuthConsumer_attemptReauth={{}}
			withAuthConsumer_attemptReauth={mockCall}
			api={defaultApi}
		/>
	);
	await wait(50);
	item.update();
	expect(item.find("CarouselSlider").length).toBe(1);
});

test("User see flyout on notification bell icon", async () => {
	const mockCall = jest.fn();
	const item = shallow(
		<HomePage
			location={{ state: null }}
			withAuthConsumer_myUserDetails={{}}
			withAuthConsumer_lastError={{}}
			withAuthConsumer_attemptAuth={{}}
			withAuthConsumer_logout={{}}
			withAuthConsumer_attemptReauth={{}}
			withAuthConsumer_attemptReauth={mockCall}
			api={defaultApi}
		/>
	);
	item.setState({ flyOutIndexNotification: -1, notificationCount: 1 });
	await wait(50);
	item.instance().forceUpdate();
	expect(item.find("withWhiteOutConsumer").length).toBe(1);
});

test("User do not see My Copies Section when no extract is made by the user", async () => {
	mockData.extracts = [];
	const item = shallow(
		<HomePage
			location={{ state: null }}
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={{}}
			withAuthConsumer_attemptAuth={{}}
			withAuthConsumer_logout={{}}
			api={defaultApi}
		/>
	);
	await wait(50);
	expect(item.state("error")).toBeNull();
});

test("Show Unlock popup box and disable FTUE from my detail page", async () => {
	const mockCall = jest.fn();
	//mockDidChange = true;
	const item = shallow(
		<HomePage
			location={{ state: null }}
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={{}}
			withAuthConsumer_attemptAuth={{}}
			withAuthConsumer_logout={{}}
			withAuthConsumer_attemptReauth={{}}
			withAuthConsumer_attemptReauth={mockCall}
			api={defaultApi}
		/>
	);
	await wait(50);
	item.update();
	expect(item.find("FlyoutBoxes").length).toBe(1);
	mockUserData = MockUserData[2];
	mockUserData.flyout_enabled = false;
	//user disable the FTUE
	await wait(50);
	item.setProps({ withAuthConsumer_myUserDetails: mockUserData });
	await wait(50);
	item.setState({ flyoutSeenData: {} });
	item.update();
	await wait(50);
	expect(item.find("FlyoutBoxes").length).toBe(0);
});

test("Show rollover box when user expired count is 0", async () => {
	mockUserData = MockUserData[2];
	mockUserData.flyout_enabled = true;
	mockResultFlyoutIndex = { result: 1 };
	mockHomeFlyoutInfo = {
		flyout_seen_data: {},
		rollover_data: {
			extract_expiry_count: 0,
			rollover_completed: "rolled-over",
			target_execution_date: "2021-06-15T14:37:03.482Z",
		},
	};
	const mockCall = jest.fn();
	const item = shallow(
		<HomePage
			location={{ state: null }}
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={{}}
			withAuthConsumer_attemptAuth={{}}
			withAuthConsumer_logout={{}}
			withAuthConsumer_attemptReauth={mockCall}
			api={defaultApi}
		/>
	);
	await wait(50);
	item.update();
	expect(item.find("FlyoutBoxes").length).toBe(1);
	const isShowRolloverBox = item.instance().shouldShowRollOverBox();
	expect(isShowRolloverBox).toBe(true);
	const isShowSearchBox = item.instance().getSeenIndex(FLYOUT_SCREEN_SEARCH) === -1;
	expect(isShowSearchBox).toBe(true);
	const isShowUnlockBox = item.instance().getSeenIndex(FLYOUT_SCREEN_UNLOCK) === -1;
	expect(isShowUnlockBox).toBe(true);
});

test("user not show unlock box when he already visted the unlock work page", async () => {
	mockUserData = MockUserData[2];
	mockUserData.flyout_enabled = true;
	mockResultFlyoutIndex = { result: 1 };
	mockHomeFlyoutInfo = {
		flyout_seen_data: { home_unlock: 0 },
		rollover_data: {
			extract_expiry_count: 0,
			rollover_completed: "rolled-over",
			target_execution_date: "2021-06-15T14:37:03.482Z",
		},
	};
	const mockCall = jest.fn();
	const item = shallow(
		<HomePage
			location={{ state: null }}
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={{}}
			withAuthConsumer_attemptAuth={{}}
			withAuthConsumer_logout={{}}
			withAuthConsumer_attemptReauth={mockCall}
			api={defaultApi}
		/>
	);
	await wait(50);
	item.update();
	expect(item.find("FlyoutBoxes").length).toBe(1);
	const isShowRolloverBox = item.instance().shouldShowRollOverBox();
	expect(isShowRolloverBox).toBe(true);
	const isShowSearchBox = item.instance().getSeenIndex(FLYOUT_SCREEN_SEARCH) === -1;
	expect(isShowSearchBox).toBe(true);
	const isShowUnlockBox = item.instance().getSeenIndex(FLYOUT_SCREEN_UNLOCK) === -1;
	expect(isShowUnlockBox).toBe(false);
});

test("User seen rollover box when expired count is 0 and clicked on I unserstand button", async () => {
	mockUserData = MockUserData[2];
	mockUserData.flyout_enabled = true;
	mockResultFlyoutIndex = { result: 1 };
	mockHomeFlyoutInfo = {
		flyout_seen_data: { home_unlock: 0 },
		rollover_data: {
			extract_expiry_count: 0,
			rollover_completed: "rolled-over",
			target_execution_date: "2021-06-15T14:37:03.482Z",
		},
	};
	const mockCall = jest.fn();
	const item = shallow(
		<HomePage
			location={{ state: null }}
			withAuthConsumer_myUserDetails={mockUserData}
			withAuthConsumer_lastError={{}}
			withAuthConsumer_attemptAuth={{}}
			withAuthConsumer_logout={{}}
			withAuthConsumer_attemptReauth={mockCall}
			api={defaultApi}
		/>
	);
	await wait(50);
	item.update();
	expect(item.find("FlyoutBoxes").length).toBe(1);
	let isShowRolloverBox = item.instance().shouldShowRollOverBox();
	expect(isShowRolloverBox).toBe(true);
	const isShowSearchBox = item.instance().getSeenIndex(FLYOUT_SCREEN_SEARCH) === -1;
	expect(isShowSearchBox).toBe(true);
	const isShowUnlockBox = item.instance().getSeenIndex(FLYOUT_SCREEN_UNLOCK) === -1;
	expect(isShowUnlockBox).toBe(false);
	mockResultFlyoutUpdate = true;
	mockHomeFlyoutInfo = {
		flyout_seen_data: { home_review_rollover: 0, home_unlock: 0 },
		rollover_data: {
			extract_expiry_count: 0,
			rollover_completed: "rolled-over",
			target_execution_date: "2021-06-15T14:37:03.482Z",
		},
	};
	//user clicked on I unserstand button
	item.instance().confirmRolloverInfo();
	await wait(50);
	item.update();
	isShowRolloverBox = item.instance().shouldShowRollOverBox();
	expect(isShowRolloverBox).toBe(false);
});
