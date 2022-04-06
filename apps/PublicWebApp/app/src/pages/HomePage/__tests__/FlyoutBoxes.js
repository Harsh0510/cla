import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow, mount } from "enzyme";
import FlyoutBoxes from "../FlyoutBoxes";
import staticValues from "../../../common/staticValues";

const homeScreenBox = staticValues.homeScreenBox;
const FLYOUT_SCREEN_SEARCH = homeScreenBox.search;
const FLYOUT_SCREEN_UNLOCK = homeScreenBox.unlock;
const FLYOUT_SCREEN_REVIEW_COPIES = homeScreenBox.reviewCopies;
const FLYOUT_SCREEN_REVIEW_ROLLOVER = homeScreenBox.reviewRollover;

const ROLLOVER_JOB_STATUS_COMPLETED = "completed";
const ROLLOVER_JOB_STATUS_ROLLOVER_EMAIL_3 = "rollover-email-3";

jest.mock("../../../assets/images/EP_Laptop.png", () => {
	return null;
});

jest.mock("../../../assets/images/EP_Book.png", () => {
	return null;
});

jest.mock("../../../assets/images/searchUnlockBackground.png", () => {
	return null;
});

jest.mock("../../../assets/images/SearchImage.png", () => {
	return null;
});

jest.mock("../../../assets/images/RefreshIcon.png", () => {
	return null;
});

jest.mock("../../../assets/images/UnlockImage.png", () => {
	return null;
});

jest.mock("react-router-dom", () => ({ withRouter: (a) => a, Link: (b) => b }));

let props, mockFunction, mockFlyoutSeenData, mockUserData, mockRolloverData, mockGetSeenIndex, shouldShowRollOverBox;

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/**
 * Reset function
 */
function resetAll() {
	mockFunction = jest.fn();
	mockUserData = {
		flyout_enabled: true,
	};
	mockFlyoutSeenData = { home_unlock: 0, home_search: 0, home_review_copies: 0 };
	mockRolloverData = {
		extract_expiry_count: 2,
		rollover_job_status: "completed",
		target_execution_date: "2021-06-15T14:37:03.482Z",
	};
	mockGetSeenIndex = (screen) => {
		const myUserDetails = mockUserData;
		if (myUserDetails && myUserDetails.flyout_enabled && mockFlyoutSeenData.hasOwnProperty(screen)) {
			return mockFlyoutSeenData[screen];
		}
		return -1;
	};
	shouldShowRollOverBox = () => {
		if (mockRolloverData && (mockRolloverData.rollover_job_status === "completed" || mockRolloverData.rollover_job_status === "rollover-email-3")) {
			//return this.props.flyouts_getSeenIndex("home_review") === -1 || this.props.flyouts_getSeenIndex("home") === -1;
			if (mockGetSeenIndex(FLYOUT_SCREEN_REVIEW_COPIES) === -1 && mockRolloverData.extract_expiry_count > 0) {
				return true;
			}
			if (mockGetSeenIndex(FLYOUT_SCREEN_REVIEW_ROLLOVER) === -1 && !mockRolloverData.extract_expiry_count) {
				return true;
			}
		}
		return false;
	};
	props = {
		myUserDetails: mockUserData,
		flyoutSeenData: mockFlyoutSeenData,
		getHomeFlyoutScreenInfo: mockFunction,
		getSeenIndex: mockGetSeenIndex,
		shouldShowRollOverBox: shouldShowRollOverBox,
		rolloverData: mockRolloverData,
		updateHomeScreenIndex: mockFunction,
		history: {
			push: jest.fn(),
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly*/
test("Component renders correctly", async () => {
	mockFlyoutSeenData = {};
	const item = shallow(<FlyoutBoxes {...props} />);
	expect(item.find("ContentBoxWrap").length).toBe(1);
});

test("User can see rollover, unlock and search", async () => {
	mockFlyoutSeenData = {};
	const item = shallow(<FlyoutBoxes {...props} />);
	const isShowUnlockBox = item.instance().props.getSeenIndex(FLYOUT_SCREEN_UNLOCK) === -1;
	const isShowSearchBox = item.instance().props.getSeenIndex(FLYOUT_SCREEN_SEARCH) === -1;
	const isShowRolloverBox = item.instance().props.shouldShowRollOverBox();
	expect(isShowUnlockBox).toBe(true);
	expect(isShowSearchBox).toBe(true);
	expect(isShowRolloverBox).toBe(true);
	expect(item.find("ContentBoxWrap").length).toBe(1);
});

test("User already visit rollover and see only unlock and search box", async () => {
	mockFlyoutSeenData = { home_review_copies: 0 };
	const item = shallow(<FlyoutBoxes {...props} />);
	const isShowUnlockBox = item.instance().props.getSeenIndex(FLYOUT_SCREEN_UNLOCK) === -1;
	const isShowSearchBox = item.instance().props.getSeenIndex(FLYOUT_SCREEN_SEARCH) === -1;
	const isShowRolloverBox = item.instance().props.shouldShowRollOverBox();
	expect(isShowUnlockBox).toBe(true);
	expect(isShowSearchBox).toBe(true);
	expect(isShowRolloverBox).toBe(false);
	expect(item.find("ContentBoxWrap").length).toBe(1);
});

test("User already visit unlock and see only rollover and search box", async () => {
	mockFlyoutSeenData = { home_unlock: 0 };
	const item = shallow(<FlyoutBoxes {...props} />);
	const isShowUnlockBox = item.instance().props.getSeenIndex(FLYOUT_SCREEN_UNLOCK) === -1;
	const isShowSearchBox = item.instance().props.getSeenIndex(FLYOUT_SCREEN_SEARCH) === -1;
	const isShowRolloverBox = item.instance().props.shouldShowRollOverBox();
	expect(isShowUnlockBox).toBe(false);
	expect(isShowSearchBox).toBe(true);
	expect(isShowRolloverBox).toBe(true);
	expect(item.find("ContentBoxWrap").length).toBe(1);
});

test("User already visit search and see only rollover and unlock box", async () => {
	mockFlyoutSeenData = { home_search: 0 };
	const item = shallow(<FlyoutBoxes {...props} />);
	const isShowUnlockBox = item.instance().props.getSeenIndex(FLYOUT_SCREEN_UNLOCK) === -1;
	const isShowSearchBox = item.instance().props.getSeenIndex(FLYOUT_SCREEN_SEARCH) === -1;
	const isShowRolloverBox = item.instance().props.shouldShowRollOverBox();
	expect(isShowUnlockBox).toBe(true);
	expect(isShowSearchBox).toBe(false);
	expect(isShowRolloverBox).toBe(true);
	expect(item.find("ContentBoxWrap").length).toBe(1);
});

test("User seen rollover box when user expired count is 0", async () => {
	mockFlyoutSeenData = {};
	props.rolloverData = {
		extract_expiry_count: 0,
		rollover_job_status: "completed",
		target_execution_date: "2021-06-15T14:37:03.482Z",
	};
	const item = shallow(<FlyoutBoxes {...props} />);
	const isShowUnlockBox = item.instance().props.getSeenIndex(FLYOUT_SCREEN_UNLOCK) === -1;
	const isShowSearchBox = item.instance().props.getSeenIndex(FLYOUT_SCREEN_SEARCH) === -1;
	const isShowRolloverBox = item.instance().props.shouldShowRollOverBox();
	expect(isShowUnlockBox).toBe(true);
	expect(isShowSearchBox).toBe(true);
	expect(isShowRolloverBox).toBe(true);
	expect(item.find("ContentBoxWrap").length).toBe(1);
});

test("User clicks on screen unlock button when extract expiry 0", async () => {
	const item = shallow(<FlyoutBoxes {...props} />);
	item.instance().redirectToUnlock({
		preventDefault: mockFunction,
	});
	await wait(50);
	expect(mockFunction).toHaveBeenCalled();
});

test("User clicks on search button box", async () => {
	const item = shallow(<FlyoutBoxes {...props} />);
	item.instance().redirectToSearch({
		preventDefault: mockFunction,
	});
	await wait(50);
	expect(mockFunction).toHaveBeenCalled();
});

test("User clicks on rollover button box", async () => {
	const item = shallow(<FlyoutBoxes {...props} />);
	item.instance().redirectToSearch({
		preventDefault: mockFunction,
	});
	await wait(50);
	expect(mockFunction).toHaveBeenCalled();
});

test("User clicks on rollover button box when extract expiry count > 0", async () => {
	const item = shallow(<FlyoutBoxes {...props} />);
	item.instance().redirectToReviewCopies({
		preventDefault: mockFunction,
	});
	await wait(50);
	expect(mockFunction).toHaveBeenCalled();
});

test("User not seen any flyouts  box when disable the FTUE", async () => {
	mockFlyoutSeenData = {};
	mockRolloverData = {
		extract_expiry_count: 0,
		rollover_job_status: "completed",
		target_execution_date: "2021-06-15T14:37:03.482Z",
	};
	props.myUserDetails = {
		flyout_enabled: false,
	};
	const item = shallow(<FlyoutBoxes {...props} />);

	expect(item.find("ContentBoxWrap").length).toBe(0);
});
