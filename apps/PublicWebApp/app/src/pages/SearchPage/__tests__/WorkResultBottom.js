// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow, mount } from "enzyme";
import WorkResultBottom from "../WorkResultBottom";
import MockSearchResults from "../../../mocks/MockSearchResults";
import MockMyDetails from "../../../mocks/MockMyDetails";

let props, WrappedComponent, mockMyUserDetails, mockflyoutsGetFirstUnseenIndex;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}
// Mock import
jest.mock("../../../common/withAuthConsumer", () => mockPassthruHoc);
jest.mock("../../../common/FlyoutManager", () => {
	return { withFlyoutManager: mockPassthruHoc };
});
jest.mock("react-router-dom", () => ({ withRouter: (a) => a, Link: (b) => b }));
/**
 * Reset function
 */
function resetAll() {
	WrappedComponent = mockPassthruHoc;
	mockMyUserDetails = MockMyDetails;
	mockflyoutsGetFirstUnseenIndex = 10000;
	props = {
		asset: MockSearchResults.results[0],
		isMobile: false,
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		isLoggedIn: true,
		isFirstLockedAsset: 0,
		flyouts_getFirstUnseenIndex: function () {
			return mockflyoutsGetFirstUnseenIndex;
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("Render the component correctly for Unlocked book", async () => {
	props.asset.is_unlocked = true;
	props.isMobile = false;
	const item = shallow(<WorkResultBottom {...props} />);
	expect(item.find("WrapWorkResultBottom").length).toBe(1);
	expect(item.find("WorkResultLink").length).toBe(1);
});

test('User getting the "Unlock now" Button for locked book', async () => {
	props.asset.is_unlocked = false;
	props.isMobile = false;
	const item = shallow(<WorkResultBottom {...props} />);
	expect(item.find("WrapWorkResultBottom").length).toBe(1);
	expect(item.find("WorkResultLink").length).toBe(0);
	expect(item.find("StyledUnlock").length).toBe(1);
	expect(item.find("StyledUnlock").props().title).toBe("Unlock now");
	expect(item.find("StyledUnlock").props().children[1]).toBe("Unlock now");
});

/** User click on "See Copies" link for unlocked books*/
test('User click on "See Copies" link for unlocked books', async () => {
	props.asset.is_unlocked = true;
	props.asset.copies_count = 5;
	props.isMobile = false;
	const item = shallow(<WorkResultBottom {...props} />);

	expect(item.find("WrapWorkResultBottom").length).toBe(1);
	expect(item.find("WorkResultLink").length).toBe(1);
	expect(item.find("WorkResultButton").length).toBe(2);

	const firstSeeCopiesLink = item.find("WorkResultButton").first();
	firstSeeCopiesLink.simulate("click");
	expect(item.state().show).toBe(true);
});

/** Hide the show copies pop up modal for unlocked books*/
test("Hide the show copies pop up modal for unlocked books", async () => {
	props.asset.is_unlocked = true;
	props.asset.copies_count = 5;
	props.isMobile = false;
	const item = shallow(<WorkResultBottom {...props} />);

	expect(item.find("WrapWorkResultBottom").length).toBe(1);
	expect(item.find("WorkResultLink").length).toBe(1);
	expect(item.find("WorkResultButton").length).toBe(2);

	const firstSeeCopiesLink = item.find("WorkResultButton").first();
	firstSeeCopiesLink.simulate("click");
	expect(item.state().show).toBe(true);

	item.instance().hideModal();
	expect(item.state().show).toBe(false);
});

/** User click on "Share this search result" link for unlocked books*/
test('User click on "Share this search result" link for unlocked books', async () => {
	props.asset.is_unlocked = true;
	props.asset.copies_count = 5;
	props.isMobile = false;
	const item = shallow(<WorkResultBottom {...props} />);

	expect(item.find("WrapWorkResultBottom").length).toBe(1);
	expect(item.find("WorkResultLink").length).toBe(1);
	expect(item.find("WorkResultButton").length).toBe(2);

	const firstShareResultLink = item.find("WorkResultButton").at(1);
	firstShareResultLink.simulate("click");
	expect(item.state().showPopUpInfo).toBe(true);
});

/** Hide the share result pop up modal for unlocked books*/
test("Hide the share result pop up modal for unlocked books", async () => {
	props.asset.is_unlocked = true;
	props.asset.copies_count = 5;
	props.isMobile = false;
	const item = shallow(<WorkResultBottom {...props} />);

	expect(item.find("WrapWorkResultBottom").length).toBe(1);
	expect(item.find("WorkResultLink").length).toBe(1);
	expect(item.find("WorkResultButton").length).toBe(2);

	const firstShareResultLink = item.find("WorkResultButton").at(1);
	firstShareResultLink.simulate("click");
	expect(item.state().showPopUpInfo).toBe(true);

	item.instance().hidePopUpInfo();
	expect(item.state().showPopUpInfo).toBe(false);
});

/** User see "Make a new copy" link for unlocked books in desktop*/
test('User see "Make a new copy" link for unlocked books in desktop', async () => {
	props.asset.is_unlocked = true;
	props.asset.copies_count = 0;
	props.isMobile = false;
	const item = shallow(<WorkResultBottom {...props} />);

	expect(item.find("WrapWorkResultBottom").length).toBe(1);
	expect(item.find("WorkResultLink").length).toBe(1);
	expect(item.find("WorkResultLink").props().children[1]).toBe("   Make a new Copy");
	expect(item.find("WorkResultLink").props().to).not.toBe("");
});

/** User not see "Make a new copy" link for unlocked books in mobile device*/
test('User not see "Make a new copy" link for unlocked books in mobile device', async () => {
	mockMyUserDetails.can_copy = false;
	props.withAuthConsumer_myUserDetails = mockMyUserDetails;
	props.asset.is_unlocked = true;
	props.asset.copies_count = 0;
	props.isMobile = false;
	const item = shallow(<WorkResultBottom {...props} />);

	expect(item.find("WrapWorkResultBottom").length).toBe(1);
	expect(item.find("WorkResultLink").length).toBe(0);
});

/** User not see "Make a new copy" link for locked books in desktop*/
test('User not see "Make a new copy" link for locked books in desktop', async () => {
	props.asset.is_unlocked = false;
	props.asset.copies_count = 0;
	props.isMobile = false;
	const item = shallow(<WorkResultBottom {...props} />);

	expect(item.find("WrapWorkResultBottom").length).toBe(1);
	expect(item.find("WorkResultLink").length).toBe(0);
});

/** User Unlocks a book */
test("User Unlocks a book When currentIndex is 0 and isShowFlyOut is set", async () => {
	props.currentIndex = 0;
	props.isShowFlyOut = true;
	const item = shallow(<WorkResultBottom {...props} />);

	expect(item.find("StyledUnlock").length).toBe(1);
});

test("User Unlocks a book When currentIndex is 0 and isShowFlyOut is not set", async () => {
	props.currentIndex = 0;
	props.isShowFlyOut = false;
	const item = shallow(<WorkResultBottom {...props} />);

	expect(item.find("StyledUnlock").length).toBe(1);
});

/** User not see "Make a new copy" link for unlocked books in desktop device*/
test('User not see "Make a new copy" link for unlocked books in desktop device', async () => {
	props.asset.is_unlocked = true;
	props.asset.copies_count = 1;
	props.isMobile = false;
	const item = shallow(<WorkResultBottom {...props} />);

	expect(item.find("WrapWorkResultBottom").length).toBe(1);
	expect(item.find("WorkResultLink").length).toBe(0);
});

/** User see "Make a new copy" link for unlocked books in desktop device*/
test('User see "Make a new copy" link for unlocked books in desktop device', async () => {
	mockMyUserDetails.can_copy = true;
	props.withAuthConsumer_myUserDetails = mockMyUserDetails;
	props.asset.is_unlocked = true;
	props.asset.copies_count = 1;
	props.isMobile = false;
	const item = shallow(<WorkResultBottom {...props} />);

	expect(item.find("WrapWorkResultBottom").length).toBe(1);
	expect(item.find("WorkResultLink").length).toBe(1);
});

/** User see "Make a new copy" link for single fragments in desktop device*/
test('User see "Make a new copy" link for unlocked books for single fragments in desktop device', async () => {
	mockMyUserDetails.can_copy = true;
	props.withAuthConsumer_myUserDetails = mockMyUserDetails;
	props.asset.fragments = [{ title: "test1", start_page: 4 }];
	props.isMobile = false;
	const item = shallow(<WorkResultBottom {...props} />);

	expect(item.find("WorkResultLink").length).toBe(1);
});

/** User see "Make a new copy" link for multiple fragments in desktop device*/
test('User see "Make a new copy" link for unlocked books for multiple fragments in desktop device', async () => {
	props.asset.fragments = [
		{ title: "test1", start_page: 4 },
		{ title: "test1", start_page: 4 },
	];
	props.isMobile = false;
	const item = shallow(<WorkResultBottom {...props} />);

	expect(item.find("FragmentWrap").length).toBe(1);
	expect(item.find("FragmentLink").length).toBe(4);
});

/** User see "Make a new copy" link for unlocked books for multiple fragments in mobile device*/
test('User see "Make a new copy" link for unlocked books for multiple fragments in mobile device', async () => {
	props.asset.fragments = [
		{ title: "test1", start_page: 4 },
		{ title: "test1", start_page: 4 },
	];
	props.isMobile = true;
	const item = shallow(<WorkResultBottom {...props} />);

	expect(item.find("FragmentWrap").length).toBe(1);
	expect(item.find("FragmentLink").length).toBe(2);
});

/** User see "Make a new copy" link for locked books for multiple fragments in desktop device*/
test('User see "Make a new copy" link for locked books for multiple fragments in desktop device', async () => {
	props.asset.is_unlocked = false;
	props.asset.fragments = [
		{ title: "test1", start_page: 4 },
		{ title: "test1", start_page: 4 },
	];
	props.isMobile = true;
	const item = shallow(<WorkResultBottom {...props} />);

	expect(item.find("FragmentWrap").length).toBe(1);
	expect(item.find("FragmentLink").length).toBe(2);
});

test("User see an see book icons", async () => {
	props.asset.is_unlocked = true;
	props.asset.content_form = "BO";
	const item = shallow(<WorkResultBottom {...props} />);

	expect(item.find("IconWrap").length).toBe(1);
});

test("User see an see book icons on unlocked books and when user is not logged in", async () => {
	props.asset.is_unlocked = false;
	props.isLoggedIn = false;
	props.asset.content_form = "BO";
	const item = shallow(<WorkResultBottom {...props} />);

	expect(item.find("IconWrap").length).toBe(1);
});

test("User see the flyout on unlock now button for unlocked asset", async () => {
	mockflyoutsGetFirstUnseenIndex = 2;
	props.isFirstLockedAsset = true;
	props.asset.is_unlocked = false;
	const item = shallow(<WorkResultBottom {...props} />);
	expect(item.find("StyledUnlock").length).toBe(1);
	expect(item.find("IconWrap").length).toBe(1);
	expect(item.find("IconWrap").childAt(0).props().className).toEqual("fal fa-book");
	expect(item.find("withWhiteOutConsumer").length).toBe(1);
});

test("User is not logged in", async () => {
	delete props.withAuthConsumer_myUserDetails;
	const item = shallow(<WorkResultBottom {...props} />);
	expect(item.find("IconWrap").length).toBe(1);
});

test("Test urlEncodeAsset method", async () => {
	props.asset.fragments = [
		{ title: "test1", start_page: 4 },
		{ title: "test1", start_page: 4 },
	];
	const item = shallow(<WorkResultBottom {...props} />);
	item.instance().urlEncodeAsset();
	expect(item.instance().urlEncodeAsset()).toEqual("9781444144215-title-1");
});

test("Test urlEncodeFragment method", async () => {
	props.asset.fragments = [
		{ title: "test1", start_page: 4 },
		{ title: "test1", start_page: 4 },
	];
	const item = shallow(<WorkResultBottom {...props} />);
	item.instance().urlEncodeFragment();
	expect(item.instance().urlEncodeFragment()).toEqual("works/9781444144215/extract?startPage=undefined");
});

test("Test handleUnlockClick method", async () => {
	props.flyouts_setNext = jest.fn();
	const item = shallow(<WorkResultBottom {...props} />);
	item.instance().handleUnlockClick();
	expect(props.flyouts_setNext).toHaveBeenCalled();
});

test("User see extract if an asset has user uploaded extracts", async () => {
	props.asset = MockSearchResults.results[1];
	const item = shallow(<WorkResultBottom {...props} />);
	expect(item.find("ExtractTitle").length).toBe(2);
});

test("User see extract if an asset has more than 3 user uploaded extracts", async () => {
	props.asset = MockSearchResults.results[1];
	props.asset.uploadedExtracts = [
		{ title: "test1", page_range: [1, 2, 3] },
		{ title: "test2", page_range: [1, 2, 3] },
		{ title: "test3", page_range: [1, 2, 3] },
		{ title: "test4", page_range: [1, 2, 3] },
	];
	const item = shallow(<WorkResultBottom {...props} />);
	expect(item.find("ExtractTitle").length).toBe(3);
});

test("User clicks on more when an asset has more than 3 user uploaded extracts", async () => {
	props.asset = MockSearchResults.results[1];
	props.asset.uploadedExtracts = [
		{ title: "test1", page_range: [1, 2, 3] },
		{ title: "test2", page_range: [1, 2, 3] },
		{ title: "test3", page_range: [1, 2, 3] },
		{ title: "test4", page_range: [1, 2, 3] },
	];
	const item = shallow(<WorkResultBottom {...props} />);
	expect(item.find("ExtractTitle").length).toBe(3);
	expect(item.find("ShowExtractLink").length).toBe(1);
	item.instance().showFullExtracts();
	expect(item.find("ExtractTitle").length).toBe(4);
});

test("When an asset has single user uploaded extract", async () => {
	props.asset = MockSearchResults.results[1];
	props.asset.uploadedExtracts = [{ title: "test1", page_range: [1, 2, 3] }];
	const item = shallow(<WorkResultBottom {...props} />);
	expect(item.find("ExtractTitle").length).toBe(1);
	expect(item.find("WorkResultLink").length).toBe(0);
});

test("User does not see makea new copy link if asset is user uploaded", async () => {
	props.asset.is_system_asset = false;
	const item = shallow(<WorkResultBottom {...props} />);
	expect(item.find("ExtractTitle").length).toBe(0);
	expect(item.find("WorkResultLink").length).toBe(0);
});
