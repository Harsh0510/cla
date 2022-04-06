// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import WorkResults from "../WorkResults";
import MockSearchResults from "../../../mocks/MockSearchResults";
import MockSubjects from "../../../mocks/MockSubjects";

let props, mockFunction;
let flyouts_getFirstUnseenIndex, flyouts_setNext, onToggleFavorite;

/**
 * Reset function
 */
function resetAll() {
	flyouts_getFirstUnseenIndex = jest.fn();
	mockFunction = jest.fn();
	props = {
		ajaxLoaded: true,
		items: MockSearchResults.results,
		subjects: MockSubjects,
		searchWasIsbn: false,
		searchWasMaybeIsbn: false,
		breakpoint: 30,
		isMobile: false,
		flyOutIndex: null,
		onCloseFlyOut: mockFunction,
		lockedBook_ISBN: "9645364756659",
		unLockedBook_ISBN: "9645364758789",
		flyouts_getFirstUnseenIndex: flyouts_getFirstUnseenIndex,
		flyouts_setNext: mockFunction,
		onToggleFavorite: mockFunction,
		isLoggedIn: true,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/**
 * This 'HOC' does nothing but 'pass through' the provided component,
 * so it's not necessary to 'dive()' into rendered results,
 * and so it's possible to mock the 'api' function.
 **/
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/getThumbnailUrl", () => mockPassthruHoc);
jest.mock("../../../common/FlyoutManager", () => {
	return { withFlyoutManager: mockPassthruHoc };
});
jest.mock("../../../assets/icons/Lock.png", () => jest.fn());
jest.mock("../../../assets/images/cover_img.png", () => true);

/** wait function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

test("Component renders successfully for desktop", async () => {
	const item = shallow(<WorkResults {...props} />);
	expect(item.find("WorkList").length).toBe(1);
	expect(item.find(".work-item").length).toBe(10);
	expect(item.find("WorkResultStart").length).toBe(10);
	expect(item.find("WorkResultDescription").length).toBe(10);

	expect(item.find("MobRow").length).toBe(0);
	expect(item.find("MobBook").length).toBe(0);
	expect(item.find("MobRowBookInfo").length).toBe(0);
	expect(flyouts_getFirstUnseenIndex).toHaveBeenCalled();
});

test("Component renders successfully for mobile", async () => {
	props.isMobile = true;
	const item = shallow(<WorkResults {...props} />);
	expect(item.find("WorkList").length).toBe(1);
	expect(item.find(".work-item").length).toBe(10);
	expect(item.find("WorkResultStart").length).toBe(0);
	expect(item.find("WorkResultDescription").length).toBe(0);

	expect(item.find("MobRow").length).toBe(20);
	expect(item.find("MobBook").length).toBe(10);
	expect(item.find("MobRowBookInfo").length).toBe(10);
	expect(flyouts_getFirstUnseenIndex).toHaveBeenCalled();
});

test("User getting page loading process", async () => {
	props.ajaxLoaded = false;
	const item = shallow(<WorkResults {...props} />);
	expect(item.find("Loader").length).toBe(1);

	expect(item.find("WorkList").length).toBe(0);
	expect(item.find(".work-item").length).toBe(0);
	expect(item.find("WorkResultStart").length).toBe(0);
	expect(item.find("WorkResultDescription").length).toBe(0);

	expect(item.find("MobRow").length).toBe(0);
	expect(item.find("MobBook").length).toBe(0);
	expect(item.find("MobRowBookInfo").length).toBe(0);
});

test('User get "No results found: invalid ISBN" message', async () => {
	props.items = [];
	props.ajaxLoaded = true;
	props.searchWasMaybeIsbn = true;
	props.searchWasIsbn = false;

	const item = shallow(<WorkResults {...props} />);
	expect(item.find("NoResultsHeading").length).toBe(1);
	expect(item.find("NoResultsHeading").props().children).toBe("No results found: invalid ISBN");

	expect(item.find("WorkList").length).toBe(0);
	expect(item.find(".work-item").length).toBe(0);
	expect(item.find("WorkResultStart").length).toBe(0);
	expect(item.find("WorkResultDescription").length).toBe(0);

	expect(item.find("MobRow").length).toBe(0);
	expect(item.find("MobBook").length).toBe(0);
	expect(item.find("MobRowBookInfo").length).toBe(0);
});

test('User get "No results found" message', async () => {
	props.items = [];
	props.ajaxLoaded = true;
	props.searchWasMaybeIsbn = false;
	props.searchWasIsbn = false;

	const item = shallow(<WorkResults {...props} />);
	expect(item.find("NoResultsHeading").length).toBe(1);
	expect(item.find("NoResultsHeading").props().children).toBe("No results found");

	expect(item.find("WorkList").length).toBe(0);
	expect(item.find(".work-item").length).toBe(0);
	expect(item.find("WorkResultStart").length).toBe(0);
	expect(item.find("WorkResultDescription").length).toBe(0);

	expect(item.find("MobRow").length).toBe(0);
	expect(item.find("MobBook").length).toBe(0);
	expect(item.find("MobRowBookInfo").length).toBe(0);
});

test("User changing the screen size", async () => {
	const item = shallow(<WorkResults {...props} />);

	item.setProps({ breakpoint: 20 });
	await wait(50);
	expect(item.find("WorkList").length).toBe(1);
	expect(item.find(".work-item").length).toBe(10);
	expect(item.find("WorkResultStart").length).toBe(10);
	expect(item.find("WorkResultDescription").length).toBe(10);

	expect(item.find("MobRow").length).toBe(0);
	expect(item.find("MobBook").length).toBe(0);
	expect(item.find("MobRowBookInfo").length).toBe(0);

	item.setProps({ breakpoint: 10, isMobile: true });
	await wait(50);
	expect(item.find("WorkList").length).toBe(1);
	expect(item.find(".work-item").length).toBe(10);
	expect(item.find("WorkResultStart").length).toBe(0);
	expect(item.find("WorkResultDescription").length).toBe(0);

	expect(item.find("MobRow").length).toBe(20);
	expect(item.find("MobBook").length).toBe(10);
	expect(item.find("MobRowBookInfo").length).toBe(10);
});

test("User seen the flyout on unlocked asset thumbnail image", async () => {
	flyouts_getFirstUnseenIndex.mockReturnValue(4);
	let asset_result = MockSearchResults.results;
	asset_result[0].pdf_isbn13 = "9645364758789";
	props.unLockedBook_ISBN = "9645364758789";
	props.flyOutIndex = 4;
	props.results = asset_result;
	const item = shallow(<WorkResults {...props} />);
	expect(item.find("withWhiteOutConsumer").length).toBe(1);
	expect(flyouts_getFirstUnseenIndex).toHaveBeenCalled();
});

test("User not seen the flyout on asset thumbnail image", async () => {
	let asset_result = MockSearchResults.results;
	asset_result[0].is_unlocked = false;
	asset_result[0].pdf_isbn13 = "9645364756659";
	(props.lockedBook_ISBN = "9645364756659"), (props.flyOutIndex = 2);
	const item = shallow(<WorkResults {...props} />);
	expect(item.find("withWhiteOutConsumer").length).toBe(0);
});

test("User not seen the flyout on asset thumbnail image in mobile view", async () => {
	let asset_result = MockSearchResults.results;
	asset_result[0].is_unlocked = false;
	asset_result[0].pdf_isbn13 = "9645364756659";
	(props.lockedBook_ISBN = "9645364756659"), (props.flyOutIndex = 2);
	props.isMobile = true;
	const item = shallow(<WorkResults {...props} />);
	expect(item.find("withWhiteOutConsumer").length).toBe(0);
});

test(`Test onCloseFlyout method`, async () => {
	flyouts_getFirstUnseenIndex.mockReturnValue(4);
	const item = shallow(<WorkResults {...props} />);
	item.find("withWhiteOutConsumer").props().onClose();
	expect(mockFunction).toHaveBeenCalled();
});

test("When User Click on favorite icon to add asset in favorite list", async () => {
	const item = shallow(<WorkResults {...props} />);
	item.instance().onFavoriteClick(1);
	expect(mockFunction).toHaveBeenCalled();
});

test("When user is not logged in in mobile view ", async () => {
	props.isMobile = true;
	props.isLoggedIn = false;
	const item = shallow(<WorkResults {...props} />);
	expect(item.find("WorkTitle").length).toBe(10);
});
