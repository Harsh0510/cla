// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import TitleDetailsPage from "../index";
import MockWorks from "../../../mocks/MockWorks";
import MockCourses from "../../../mocks/MockCourses";
import MockExtract from "../../../mocks/MockCopyManagementPage";
import Presentation from "../Presentation";
import MockUsersData from "../../../mocks/MockUser";
import MockTempUnlockAsset from "../../../mocks/MockTempUnlockAsset";
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
jest.mock("../../../assets/images/cover_img.png", () => true);

let match, history, mockUserData;
let mockResultFlyOutIndex,
	mockResultFlyOutIndexHome,
	mockResultFlyOutUpdate,
	MockUserData,
	mockResultUserUnlockedAttempt,
	mockResultAssetFavorite,
	mockTempUnlockAsset;

// Mock data for a single work
const mockData = MockWorks[0];
const unlockedISBN = "9781913063047";
const lockedISBN = "9870836489178";

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

jest.mock("../../../common/FlyOutHandler", () => {
	return class {
		constructor(instance, api, screen) {
			this._instance = instance;
			this._api = api;
			this._screen = screen;
		}
		getSeen() {
			this._api("/public/first-time-user-experience-get-mine-seen", { screen: this._screen }).then((result) => {
				this._instance.setState({
					flyOutIndex: result.result,
				});
			});
		}
		destroy() {
			this._active = false;
		}
		onClose(cb, redirectURL) {
			const nextIndex = this._instance.state.flyOutIndex + 1;
			this._api("/public/first-time-user-experience-update", { screen: this._screen, index: nextIndex }).then((result) => {
				if (result.result) {
					this._instance.setState({
						flyOutIndex: nextIndex,
					});
				}
				if (typeof cb === "function") {
					cb();
				}
				if (redirectURL && typeof redirectURL === "string") {
					//const url = getUrl(redirectURL);
					//window.location.href = url;
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

async function defaultApi(endpoint, data) {
	if (endpoint === "/public/asset-get-one") {
		if (data.isbn13) {
			return {
				result: MockWorks[0],
			};
		} else {
			return {
				result: MockWorks[1],
			};
		}
	}
	if (endpoint === "/public/extract-search") {
		return {
			extracts: [],
			academic_year_end: [8, 15],
		};
	}
	if (endpoint === "/public/course-get-all-for-school") {
		return {
			result: MockCourses,
		};
	}
	if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
		return mockResultFlyOutIndex;
	}
	if (endpoint === "/public/first-time-user-experience-update") {
		return mockResultFlyOutUpdate;
	}
	if (endpoint === "/public/asset-favorite") {
		return mockResultAssetFavorite;
	}
	if (endpoint === "/public/get-temp-unlocked-assets") {
		return mockTempUnlockAsset;
	}
	throw new Error("should never be here");
}

/**
 * Reset function
 */
function resetAll() {
	// api = null;
	mockUserData = {
		first_name: "Test",
		last_name: "Surname",
		role: "teacher",
		school: "Test School",
		flyout_enabled: true,
	};
	match = {
		url: "/dummy",
		params: { isbn: unlockedISBN },
	};
	history = {
		push: jest.fn(),
	};
	mockResultFlyOutIndex = { result: -1 };
	mockResultAssetFavorite = { success: true };
	mockTempUnlockAsset = MockTempUnlockAsset;
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders correctly", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/asset-get-one") {
			return {
				result: MockWorks[0],
			};
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<TitleDetailsPage match={match} api={api} />);

	await wait(50);
	expect(item.containsMatchingElement(<Presentation />)).toBe(true);
});

test("Set Notification Count", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/asset-get-one") {
			return {
				result: MockWorks[0],
			};
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<TitleDetailsPage match={match} api={api} />);

	await wait(50);
	expect(item.containsMatchingElement(<Presentation />)).toBe(true);
	item.instance().setNotificationCount(2);
	expect(item.state("notificationCount")).toEqual(2);
});

test("The details of a single work are shown when a valid ISBN is supplied in the URL", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/asset-get-one") {
			return {
				result: MockWorks[0],
			};
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<TitleDetailsPage match={match} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	expect(item.state().resultData).toHaveProperty("is_unlocked", true);
});

test("A link to unlock a title is shown when a the work is not unlocked", async () => {
	match.params.isbn = lockedISBN;

	async function api(endpoint, data) {
		if (endpoint === "/public/asset-get-one") {
			return {
				result: MockWorks[1],
			};
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<TitleDetailsPage match={match} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	expect(item.state().resultData.is_unlocked).toBe(false);
});

test("GoToPage form", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/asset-get-one") {
			return {
				result: MockWorks[1],
			};
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<TitleDetailsPage match={match} history={history} api={api} />);

	await wait(50);
	item.instance().onGoToPageSubmit(232);
	const push = item.instance().props.history.push;
	item.update();
	item.instance().forceUpdate();

	expect(push).toBeCalled();
});

/** Table sorting fucntion called */
test("User get sorting filed data", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/extract-search") {
			return {
				extracts: MockExtract.ExtractSearch.extracts,
				academic_year_end: [8, 15],
			};
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<TitleDetailsPage match={match} history={history} api={api} />);

	const mockDefaultField = item.state().sortField;
	item.instance().doSorting([{ columnName: "teacher", direction: "D" }]);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().sortField).not.toBe(mockDefaultField);
	expect(item.state().sortField).toBe("teacher");
});

/** User click on Create copy */
test("User click on Create copy", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/extract-search") {
			return {
				extracts: MockExtract.ExtractSearch.extracts,
				academic_year_end: [8, 15],
			};
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<TitleDetailsPage match={match} history={history} api={api} />);

	item.instance().onCreateCopySubmit("45d0b50a4a276e3f559bdaf55d713845667e");
	const push = item.instance().props.history.push;

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(push.mock.calls[0][0]).toBe("/works/9781913063047/extract?selected=&course=45d0b50a4a276e3f559bdaf55d713845667e");
});

/** User click on Create copy and get alert message "Invalid format" */
test('User click on Create copy and get alert message "Invalid format"', async () => {
	//mock function for window.print
	global.alert = jest.fn();

	async function api(endpoint, data) {
		if (endpoint === "/public/extract-search") {
			return {
				extracts: MockExtract.ExtractSearch.extracts,
				academic_year_end: [8, 15],
			};
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<TitleDetailsPage match={match} history={history} api={api} />);

	item.instance().onCreateCopySubmit("1", "45d0b50a4a276e3f559bdaf55d713845667e");
	const push = item.instance().props.history.push;

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(push()).toBe(undefined);
});

/** User changes the isbn */
test("User changes the isbn", async () => {
	const fetchWork = jest.fn();

	async function api(endpoint, data) {
		if (endpoint === "/public/extract-search") {
			return {
				extracts: MockExtract.ExtractSearch.extracts,
				academic_year_end: [8, 15],
			};
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<TitleDetailsPage match={match} history={history} api={api} />);

	await wait(50);
	item.update();

	//create mock for fetchwork
	item.instance().fetchWork = jest.fn();
	item.setProps({
		match: {
			url: "/dummy",
			params: { isbn: "9780198426708" },
		},
	});

	await wait(50);
	item.update();

	expect(item.instance().fetchWork).toBeCalled();
});

/** User select 2 page from pagination for the School Copies(Extract)*/
test("User select 2 page from pagination for the School Copies(Extract)", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/extract-search") {
			return {
				extracts: MockExtract.ExtractSearch.extracts,
				academic_year_end: [8, 15],
			};
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<TitleDetailsPage match={match} history={history} api={api} />);

	await wait(50);
	item.update();

	const mockDefaultField = item.state().offset;
	item.instance().doPagination(2, 5);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().offset).not.toBe(mockDefaultField);

	const mockDefaultField1 = item.state().offset;
	item.instance().doPagination(0, 10);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().offset).not.toBe(mockDefaultField1);
});

/** User change the display rows for the School Copies(Extract)*/
test(" User change the display rows for the School Copies(Extract)", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/extract-search") {
			return {
				extracts: MockExtract.ExtractSearch.extracts,
				academic_year_end: [8, 15],
			};
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<TitleDetailsPage match={match} history={history} api={api} />);

	await wait(50);
	item.update();

	const mockDefaultField1 = item.state().limit;
	item.instance().doPagination(0, 25);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().limit).not.toBe(mockDefaultField1);
});

//User enter invalid highlighted page number
test("GoToPage form", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/asset-get-one") {
			return {
				result: MockWorks[1],
			};
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<TitleDetailsPage match={match} history={history} api={api} />);

	await wait(50);
	item.instance().onGoToPageSubmit(-1);
	const push = item.instance().props.history.push;
	item.update();
	item.instance().forceUpdate();

	expect(push).not.toBeCalled();
});

/** User click on unsorting data */
test("User click on unsorting data", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/extract-search") {
			return {
				extracts: MockExtract.ExtractSearch.extracts,
				academic_year_end: [8, 15],
			};
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<TitleDetailsPage match={match} history={history} api={api} />);

	const mockDefaultField = item.state().sortField;
	item.instance().doSorting([]);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().sortField).toEqual(mockDefaultField);
	expect(item.state().sortField).not.toBe("teacher");
});

/** User expand and collapsing the asset title */
test("User expand and collapsing the asset title", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/extract-search") {
			return {
				extracts: MockExtract.ExtractSearch.extracts,
				academic_year_end: [8, 15],
			};
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<TitleDetailsPage match={match} history={history} api={api} />);
	item.instance().toggleWidth("title");
	expect(item.state().isTitleFull).toBe(true);

	item.instance().toggleWidth("title");
	expect(item.state().isTitleFull).toBe(false);
});

/** User expand and collapsing the asset editor */
test("User expand and collapsing the asset editor", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/extract-search") {
			return {
				extracts: MockExtract.ExtractSearch.extracts,
				academic_year_end: [8, 15],
			};
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<TitleDetailsPage match={match} history={history} api={api} />);
	item.instance().toggleWidth("editor");
	expect(item.state().isEditorFull).toBe(true);

	item.instance().toggleWidth("editor");
	expect(item.state().isEditorFull).toBe(false);
});

/** User expand and collapsing the publisher */
test("User expand and collapsing the publisher", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/extract-search") {
			return {
				extracts: MockExtract.ExtractSearch.extracts,
				academic_year_end: [8, 15],
			};
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<TitleDetailsPage match={match} history={history} api={api} />);
	item.instance().toggleWidth("publisher");
	expect(item.state().isPublisherFull).toBe(true);

	item.instance().toggleWidth("publisher");
	expect(item.state().isPublisherFull).toBe(false);
});

/** User expand and collapsing the author */
test("User expand and collapsing the author", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/extract-search") {
			return {
				extracts: MockExtract.ExtractSearch.extracts,
				academic_year_end: [8, 15],
			};
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<TitleDetailsPage match={match} history={history} api={api} />);
	item.instance().toggleWidth("author");
	expect(item.state().isAuthorFull).toBe(true);

	item.instance().toggleWidth("author");
	expect(item.state().isAuthorFull).toBe(false);
});

test("Test doToggleFavorite method", async () => {
	const item = shallow(<TitleDetailsPage match={match} history={history} api={defaultApi} />);
	item.setState({ resultData: { is_favorite: true } });
	item.instance().doToggleFavorite();
	expect(item.state().resultData).not.toBe(null);
});

test("When user move to another page", async () => {
	const item = shallow(<TitleDetailsPage match={match} history={history} api={defaultApi} />);
	item.setState({ resultData: { is_favorite: true } });
	item.instance().componentWillUnmount();
	item.instance().doToggleFavorite();
	expect(item.state().resultData).not.toBe(null);
});

test("When asset is not a temporary unlocked asset", async () => {
	mockTempUnlockAsset = null;

	const item = shallow(<TitleDetailsPage match={match} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	expect(item.state().tempUnlockAssetTitles).toEqual([]);
});

test("When user logout then user seen the unlock message", async () => {
	const fetchWork = jest.fn();

	const item = shallow(<TitleDetailsPage match={match} history={history} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.update();

	//create mock for fetchwork
	item.instance().fetchWork = jest.fn();
	item.setProps({
		withAuthConsumer_myUserDetails: null,
	});

	await wait(50);
	item.update();

	expect(item.instance().fetchWork).toBeCalled();
});
