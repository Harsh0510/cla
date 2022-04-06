// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow, mount } from "enzyme";
import MyCopiesPage from "../index";
import MockApi from "../../../mocks/MockApi";
import MockUser from "../../../mocks/MockUser";
import MockExtractSearch from "../../../mocks/MockExtractSearch";
import TwoOptionSwitch from "../../../widgets/ToggleSwitch/TwoOptionSwitch";

let api,
	sortingA,
	sortingD,
	page,
	history,
	mockUserData,
	location,
	mockLimit,
	mockGetExtractFilters,
	mockGetExtractSearch,
	mockGetExtractReactivate,
	mockResultFlyOutIndex,
	mockResultFlyOutUpdate;

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
jest.mock("../../../common/withAdminAuthRequiredConsumer", () => {
	return function (acceptedRoles, WrappedComponent) {
		if (!Object.keys(acceptedRoles).length === 2) {
			throw "It should be passed acceptedToles with a single key";
		}
		if (!acceptedRoles.hasOwnProperty("teacher" || "school-admin")) {
			throw "It should be passed acceptedToles with a single key: cla-admin";
		}
		return WrappedComponent;
	};
});
jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return {
			current: {
				focus: jest.fn(),
				value: "",
			},
		};
	};
});
jest.mock("../../../assets/images/cover_img.png", () => true);

/**
 * Timeout mock function
 */
jest.mock("../../../common/customSetTimeout", () => {
	return function (method, time) {
		setTimeout(method, 50);
	};
});

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

		getSeenHome() {
			this._api("/public/first-time-user-experience-get-mine-seen", { screen: "home" }).then((result) => {
				this._instance.setState({
					flyOutIndexHome: result.result,
				});
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
		destroy() {
			this._active = false;
		}
		stop() {
			return;
		}

		getSeenFlyOutIndex(screen) {
			this._api("/public/first-time-user-experience-get-mine-seen", { screen: screen }).then((result) => {
				if (!this._active) {
					return;
				}
				this._instance.setState({
					screenFlyOutIndex: parseInt(result.result, 10),
				});
			});
		}
	};
});

/**
 * Reset function
 */
function resetAll() {
	api = MockApi;
	sortingA = [{ direction: "asc", columnName: "work_title" }];
	sortingD = [{ direction: "desc", columnName: "title" }];
	page = 2;
	history = {
		push: jest.fn(),
	};
	mockUserData = MockUser[0];
	(location = {
		search: "",
	}),
		(mockLimit = 10);
	mockGetExtractFilters = [
		{
			id: "class",
			title: "class",
			data: [
				{ id: 437, title: "test class" },
				{ id: 397, title: "Demo" },
				{ id: 411, title: "demo1" },
				{ id: 296, title: "LotusClass - ks2" },
				{ id: 395, title: "Mapletree" },
				{ id: 15, title: "My Random Course" },
			],
		},
	];
	mockGetExtractSearch = MockExtractSearch;
	mockGetExtractReactivate = {
		erroredExtract: [],
		reactivateCount: 1,
	};
	api = defaultApi;
	mockResultFlyOutIndex = { result: -1 };
	mockResultFlyOutUpdate = { result: true };
}

beforeEach(resetAll);
afterEach(resetAll);

async function defaultApi(endpoint, data) {
	// "SchoolsPage" only queries this endpoint
	if (endpoint === "/public/extract-search") {
		return mockGetExtractSearch;
	}
	if (endpoint === "/public/extract-get-filters") {
		return {
			result: mockGetExtractFilters,
		};
	}
	if (endpoint === "/public/extract-reactivate") {
		return mockGetExtractReactivate;
	}
	if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
		return mockResultFlyOutIndex;
	}
	if (endpoint === "/public/first-time-user-experience-update") {
		return mockResultFlyOutUpdate;
	}
	return api;
}

test("Component renders correctly", async () => {
	const item = shallow(<MyCopiesPage location={{ search: "" }} api={api} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	expect(item.find("AdminPageWrap").length).toBe(1);
	expect(item.find("TwoOptionSwitch").length).toBe(1);
	expect(item.containsMatchingElement(<TwoOptionSwitch />)).toBe(true);
});

/** User click on sorting for ascending order*/
test("User click on sorting for ascending order", async () => {
	mockUserData = MockUser[2];
	const item = shallow(<MyCopiesPage location={{ search: "" }} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	//ascending order
	item.instance().doSorting(sortingA);
	await wait(50);
	item.update();
	expect(item.state().offset).toBe(0);
});

/** User click on sorting for descending order */
test("User click on sorting for descending order", async () => {
	mockUserData = MockUser[2];
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	//decending order
	item.instance().doSorting(sortingD);
	expect(item.state().offset).toBe(0);
});

/** User click on pagination page */
test("User click on pagination page", async () => {
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().doPagination(page, mockLimit);
	const push = item.instance().props.history.push;
	const setOffset = (page - 1) * mockLimit;
	await wait(50);
	item.update();
	expect(push.mock.calls[0][0]).toEqual(
		"/profile/my-copies?expiry_status&limit=" + mockLimit + "&offset=" + setOffset + "&q_mine_only=0&query=&review=0"
	);
});

/** User click for my copies only q_mine_only value pass with 0*/
/** doMineOnlyToggle */
test("User click on my copies radion button", async () => {
	location.search = "?limit=10&offset=0&q_mine_only=0";
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	//user click doMineOnlyToggle button
	await wait(20);
	const f_mine_only = item.state().f_mine_only;
	item.instance().doMineOnlyToggle();
	const push = item.instance().props.history.push;
	item.update();
	expect(push.mock.calls[0][0]).toBe("/profile/my-copies?limit=10&offset=0&q_mine_only=" + Number(!f_mine_only) + "&query=&review=0");
});

/** User click for all copies only q_mine_only value pass with 1*/
/** doMineOnlyToggle */
test("User click on all copies radio button", async () => {
	location.search = "?limit=10&offset=0&q_mine_only=1";
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	//user click doMineOnlyToggle button
	await wait(20);
	const f_mine_only = item.state().f_mine_only;
	item.instance().doMineOnlyToggle();
	const push = item.instance().props.history.push;
	item.update();
	expect(push.mock.calls[0][0]).toBe("/profile/my-copies?limit=10&offset=0&q_mine_only=" + Number(!f_mine_only) + "&query=&review=0");
});

/** Component load wrong limit and offset values */
test("Component load wrong limit and offset values", async () => {
	location.search = "?limit=10&offset=0&q_mine_only=1";
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	//we have add the filters
	item.setProps({ location: { search: "?limit=-1&offset=-1&sort_dir=asc&sort_field=email" } });
	await wait(50);
	item.update();
	expect(item.state().limit).toEqual(1);
});

/** User not getting the data into the filters */
test("User not getting the data into the filters", async () => {
	location.search = "?limit=10&offset=0&q_mine_only=1";
	async function customApi(endpoint, data) {
		// "SchoolsPage" only queries this endpoint
		if (endpoint === "/public/extract-get-filters") {
			return {
				result: [
					{
						id: "test",
						title: "class",
						data: [],
					},
				],
			};
		}
		return api;
	}
	const item = shallow(<MyCopiesPage location={location} api={customApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	//we have add the filters
	item.setProps({ location: { search: "?limit=-1&offset=-1&sort_dir=asc&sort_field=email" } });
	await wait(50);
	item.update();
	expect(item.state().classData).toEqual(null);
});

/** User not getting the unknonw error while retirving the filter data */
test("User not getting the unknonw error while retirving the filter data", async () => {
	location.search = "?limit=10&offset=0&q_mine_only=1";
	async function customApi(endpoint, data) {
		// "SchoolsPage" only queries this endpoint
		if (endpoint === "/public/extract-get-filters") {
			throw new Error("Unknown error");
		}
		return api;
	}
	const item = shallow(<MyCopiesPage location={location} api={customApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	//we have add the filters
	item.setProps({ location: { search: "?limit=-1&offset=-1&sort_dir=asc&sort_field=email" } });
	await wait(50);
	item.update();
	expect(item.state().message).toEqual(new Error("Unknown error"));
});

/** User filter the data by query and class and getting the 0 result */
test("User filter the data by query and class and getting the 0 result", async () => {
	location.search = "?action=list&filter_class=397&limit=10&offset=0&oid&q_mine_only=1&query=Test";
	async function customApi(endpoint, data) {
		// "SchoolsPage" only queries this endpoint
		if (endpoint === "/public/extract-search") {
			return {
				extracts: [],
				unfiltered_count: 0,
				academic_year_end: [8, 15],
			};
		}
		if (endpoint === "/public/extract-get-filters") {
			return {
				result: [
					{
						id: "class",
						title: "class",
						data: [
							{ id: 437, title: "test class" },
							{ id: 397, title: "Demo" },
							{ id: 411, title: "demo1" },
							{ id: 296, title: "LotusClass - ks2" },
							{ id: 395, title: "Mapletree" },
							{ id: 15, title: "My Random Course" },
						],
					},
				],
			};
		}
		return api;
	}
	const item = shallow(<MyCopiesPage location={location} api={customApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.update();
	expect(item.state().unfiltered_count).toEqual(0);
	expect(item.state().extracts).toEqual([]);
});

/** User change the filter data and click on the reset button */
test("User change the filter data and click on the reset button", async () => {
	location.search = "?action=list&limit=10&offset=0&q_mine_only=1";
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.update();

	//User changing thr filter data
	const searchQuery = "Test";
	expect(item.state().query).toEqual("");
	item.instance().handlefilterSelection(searchQuery, "query");
	expect(item.state().query).toEqual(searchQuery);

	const selectedClass = { value: 397, label: "Demo", key: 397 };
	expect(item.state().selectedClass).toEqual([]);
	item.instance().handlefilterSelection(selectedClass, "class");
	expect(item.state().selectedClass).toEqual(selectedClass);

	//User going to click on  reset button
	const spy = jest.spyOn(item.instance(), "pushHistory");
	item.instance().resetAll();
	expect(spy).toHaveBeenCalled();
	expect(item.state().query).toEqual("");
	expect(item.state().selectedClass).toEqual([]);
	expect(item.state().message).toEqual(null);
});

/** User change the filter data and click on submit button */
test("User change the filter data and click on submit button", async () => {
	location.search = "?action=list&limit=10&offset=0&q_mine_only=1";
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.update();

	//User changing thr filter data
	const searchQuery = "Test";
	expect(item.state().query).toEqual("");
	item.instance().handlefilterSelection(searchQuery, "query");
	expect(item.state().query).toEqual(searchQuery);

	const selectedClass = [
		{ value: 1, label: "Demo class 1", key: 1 },
		{ value: 2, label: "Demo class 2", key: 2 },
	];
	expect(item.state().selectedClass).toEqual([]);
	item.instance().handlefilterSelection(selectedClass, "class");
	expect(item.state().selectedClass).toEqual(selectedClass);

	const push = item.instance().props.history.push;
	//User going to click on  reset button
	item.instance().doSearch();
	expect(push.mock.calls[0][0]).toEqual("/profile/my-copies?action=list&filter_class=1%2C2&limit=10&offset=0&oid&q_mine_only=1&query=Test&review=0");
});

test("When user click on favorite icon to add/remove copies in favorite list", async () => {
	async function customApi(endpoint, data) {
		if (endpoint === "/public/extract-favorite") {
			return { success: true };
		}
		return api;
	}
	const item = shallow(<MyCopiesPage location={location} api={customApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	item.setState({ extracts: [{ is_favorite: true, oid: "c38da68d77e2ab50f2055f7fb029cc10b8c0" }] });
	item.instance().doToggleFavorite(0);
	expect(item.state().extracts).toEqual([{ is_favorite: true, oid: "c38da68d77e2ab50f2055f7fb029cc10b8c0" }]);
	item.instance().componentWillUnmount();
});

test("When user move to another page", async () => {
	async function customApi(endpoint, data) {
		if (endpoint === "/public/extract-favorite") {
			return { success: true };
		}
		return api;
	}
	const item = shallow(<MyCopiesPage location={location} api={customApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	item.setState({ extracts: [{ is_favorite: true, oid: "c38da68d77e2ab50f2055f7fb029cc10b8c0" }] });
	item.instance().doToggleFavorite(0);
	item.instance().componentWillUnmount();
	expect(item.state().extracts).not.toBe(null);
});

test(`Showing user a modal for unverfied or un approve user `, async () => {
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	const value = "Dummy Value";
	item.instance().doShowModal(value);
	expect(item.state("showModal")).toEqual("Dummy Value");
});

test(`Hiding a modal for unverfied or un approve user `, async () => {
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	item.instance().hideModal();
	expect(item.state("showModal")).toBe(false);
});

/** User checked for hide expired copyies */
test("User click on hide expired copies checkbox", async () => {
	location.search = "?expiry_status&limit=10&mine_only=1&offset=0&q_mine_only=1&query=&review=0";
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(20);
	item.instance().hideExpiredCopies("test", true, true);
	const push = item.instance().props.history.push;
	item.update();
	expect(push.mock.calls[0][0]).toBe("/profile/my-copies?expiry_status=active_only&limit=10&mine_only=1&offset=0&q_mine_only=1&query=&review=0");
	item.setProps({ location: { search: "?expiry_status=active_only&limit=10&mine_only=1&offset=0&q_mine_only=1&query=" } });
	await wait(20);
	expect(item.state().isReviewScreen).toEqual(false);
	expect(item.state().expiry_status).toEqual("active_only");
});

test("User click on show copy review page", async () => {
	location.search = "?expiry_status=review_only&limit=10&mine_only=1&offset=0&q_mine_only=1&query=&review=1";
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	//user click showCopyReviewPage button
	await wait(20);
	item.instance().showCopyReviewPage();
	const push = item.instance().props.history.push;
	item.update();
	expect(push.mock.calls[0][0]).toBe("/profile/my-copies?expiry_status=review_only&limit=10&offset=0&q_mine_only=1&query=&review=1");
	item.setProps({ location: { search: "?expiry_status=review_only&limit=10&mine_only=1&offset=0&q_mine_only=1&query=&review=1" } });
	await wait(20);
	expect(item.state().isReviewScreen).toEqual(true);
	expect(item.state().expiry_status).toEqual("review_only");
});

test("User swicthes to review the copies page and my copy page", async () => {
	location.search = "?expiry_status=review_only&limit=10&mine_only=1&offset=0&q_mine_only=1&query=&review=1";
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	//user click showMyCopyPage button
	await wait(20);
	expect(item.state().isReviewScreen).toEqual(true);
	expect(item.state().expiry_status).toEqual("review_only");
	item.instance().showMyCopyPage();
	const push = item.instance().props.history.push;
	item.update();
	expect(push.mock.calls[0][0]).toBe("/profile/my-copies?expiry_status=active_only&limit=10&offset=0&q_mine_only=1&query=&review=0");
	item.setProps({ location: { search: "?expiry_status=active_only&limit=10&mine_only=1&offset=0&q_mine_only=1&query=&review=0" } });
	await wait(20);
	expect(item.state().isReviewScreen).toEqual(false);
	expect(item.state().expiry_status).toEqual("active_only");
});

test("User review the copies page, select some extract and click on reactivate button", async () => {
	location.search = "?expiry_status=review_only&limit=10&mine_only=1&offset=0&q_mine_only=1&query=&review=1";
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	item.update();
	await wait(20);
	//user can see the ReactivateButton
	const reactivateBtn = item.find("ReactivateButton");
	expect(reactivateBtn.props().disabled).toEqual(true);
	// user select some extract
	item.instance().onChangeExtractCheckBox({
		currentTarget: {
			getAttribute: (name) => {
				return `${"a".repeat(32)}`;
			},
		},
	});
	await wait(20);
	expect(item.state().oids).toEqual(["a".repeat(32)]);
	expect(item.state().hasSelectedAllCopies).toEqual(false);
	//user click showReactivateConfirmModal button
	item.instance().showReactivateConfirmModal();
	expect(item.state().isShowReactivateConfirmModal).toEqual(true);

	//user click on cancel to reactivate
	item.instance().hideReactivateConfirmModel();
	expect(item.state().isShowReactivateConfirmModal).toEqual(false);

	//user again click showReactivateConfirmModal button
	item.instance().showReactivateConfirmModal();
	expect(item.state().isShowReactivateConfirmModal).toEqual(true);

	//user click on confirm to reactivate
	item.instance().onConfirmReactivateExtract();
	expect(item.state().isShowReactivateConfirmModal).toEqual(false);
	await wait(20);
	expect(item.state().extractRreactivatedResponse).toEqual({ erroredExtract: [], reactivateCount: 1, leftToReview: 2 });
});

test("User review the copies page, select all extract and click on reactivate button", async () => {
	location.search = "?expiry_status=review_only&limit=10&mine_only=1&offset=0&q_mine_only=1&query=&review=1";
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	item.update();
	await wait(20);
	//user can see the ReactivateButton
	const reactivateBtn = item.find("ReactivateButton");
	expect(reactivateBtn.props().disabled).toEqual(true);
	// user select all extract by click on select All from header
	item.instance().onChangeSelectedAllCheckbox();
	await wait(20);
	expect(item.state().oids).toEqual([]);
	expect(item.state().hasSelectedAllCopies).toEqual(true);

	//user click showReactivateConfirmModal button
	item.instance().showReactivateConfirmModal();
	expect(item.state().isShowReactivateConfirmModal).toEqual(true);

	//user click on cancel to reactivate
	item.instance().hideReactivateConfirmModel();
	expect(item.state().isShowReactivateConfirmModal).toEqual(false);

	//user again click showReactivateConfirmModal button
	item.instance().showReactivateConfirmModal();
	expect(item.state().isShowReactivateConfirmModal).toEqual(true);

	//user click on confirm to reactivate
	item.instance().onConfirmReactivateExtract();
	await wait(20);
	expect(item.state().showReactivateSuccessMessage).toEqual(true);
	await wait(50);
	expect(item.state().showReactivateSuccessMessage).toEqual(false);
	expect(item.state().extractRreactivatedResponse).toEqual(null);
});

test("Reset extract reactivated response", async () => {
	location.search = "?expiry_status=review_only&limit=10&mine_only=1&offset=0&q_mine_only=1&query=&review=1";
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	//user click reasetExtractRreactivatedResponse button
	await wait(20);
	item.instance().resetExtractRreactivatedResponse();
	expect(item.state().extractRreactivatedResponse).toEqual(null);
});

test("User load the page and move to another page", async () => {
	location.search = "?expiry_status=review_only&limit=10&mine_only=1&offset=0&q_mine_only=1&query=&review=1";
	async function customApi(endpoint, data) {
		if (endpoint === "/public/extract-reactivate") {
			return { erroredExtract: [], reactivateCount: 1 };
		}
		return api;
	}
	const item = shallow(<MyCopiesPage location={location} api={customApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	item.instance().fetchFilters();
	await wait(20);
	item.instance().componentWillUnmount();
	item.instance().updateState();
	await wait(50);
	expect(item.instance()._isMounted).toBe(undefined);
});

test("User (has the trial period) click on extract title or share link than show the Copy Creation Access Denied Popup", async () => {
	location.search = "?limit=10&mine_only=1&offset=0&q_mine_only=1&query=";
	mockUserData.can_copy = false;
	mockUserData.has_trial_extract_access = true;
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	//user click on any extract title
	await wait(20);
	item.instance().doShowModal(true);
	await wait(20);
	expect(item.state().showModal).toBe(true);
});

test("User (has the expired the trial period) and disable the extract title and extract share link", async () => {
	location.search = "?limit=10&mine_only=1&offset=0&q_mine_only=1&query=";
	mockUserData.can_copy = false;
	mockUserData.has_trial_extract_access = false;
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(20);
	expect(item.state().tableRows[0].title.props.children.props.disable).toBe(true);
	expect(item.state().tableRows[0].share.props.disable).toBe(true);
});

test("User selected all extract and manualy deselect & select any one of the extract from list", async () => {
	location.search = "?expiry_status=review_only&limit=10&mine_only=1&offset=0&q_mine_only=1&query=&review=1";
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	item.update();
	await wait(20);
	//user can see the ReactivateButton
	const reactivateBtn = item.find("ReactivateButton");
	expect(reactivateBtn.props().disabled).toEqual(true);
	// user select all extract by click on select All from header
	item.instance().onChangeSelectedAllCheckbox();
	await wait(20);
	expect(item.state().oids).toEqual([]);
	expect(item.state().mapOids).toEqual(Object.create(null));
	expect(item.state().hasSelectedAllCopies).toEqual(true);

	//user dis select the extract
	item.instance().onChangeExtractCheckBox({
		currentTarget: {
			getAttribute: (name) => {
				return `${"a".repeat(32)}`;
			},
		},
	});
	await wait(20);
	expect(item.state().oids).toEqual(["a".repeat(32)]);
	expect(item.state().oids).toEqual(Object.keys(item.state().mapOids));
	expect(item.state().mapOids).not.toEqual(Object.create(null));

	//user select the extract again
	item.instance().onChangeExtractCheckBox({
		currentTarget: {
			getAttribute: (name) => {
				return `${"a".repeat(32)}`;
			},
		},
	});
	await wait(20);
	expect(item.state().oids).toEqual([]);
	expect(item.state().oids).toEqual(Object.keys(item.state().mapOids));
	expect(item.state().mapOids).toEqual(Object.create(null));
});

test("User selected all extract and manualy dis-select all the extract from list", async () => {
	location.search = "?expiry_status=review_only&limit=10&mine_only=1&offset=0&q_mine_only=1&query=&review=1";
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	item.update();
	await wait(20);
	//user can see the ReactivateButton
	const reactivateBtn = item.find("ReactivateButton");
	expect(reactivateBtn.props().disabled).toEqual(true);
	// user select all extract by click on select All from header
	item.instance().onChangeSelectedAllCheckbox();
	await wait(20);
	expect(item.state().oids).toEqual([]);
	expect(item.state().mapOids).toEqual(Object.create(null));
	expect(item.state().hasSelectedAllCopies).toEqual(true);

	//user dis select the extract
	item.instance().onChangeExtractCheckBox({
		currentTarget: {
			getAttribute: (name) => {
				return `${"a".repeat(32)}`;
			},
		},
	});
	await wait(20);
	expect(item.state().oids).toEqual(["a".repeat(32)]);
	expect(item.state().oids).toEqual(Object.keys(item.state().mapOids));
	expect(item.state().mapOids).not.toEqual(Object.create(null));
	expect(item.state().hasSelectedAllCopies).toEqual(true);

	//user select the extract again
	item.instance().onChangeExtractCheckBox({
		currentTarget: {
			getAttribute: (name) => {
				return `${"b".repeat(32)}`;
			},
		},
	});
	await wait(20);
	expect(item.state().oids).toEqual(["a".repeat(32), "b".repeat(32)]);
	expect(item.state().oids).toEqual(Object.keys(item.state().mapOids));
	expect(item.state().mapOids).not.toEqual(Object.create(null));
	expect(item.state().hasSelectedAllCopies).toEqual(true);

	//user select the extract again
	item.instance().onChangeExtractCheckBox({
		currentTarget: {
			getAttribute: (name) => {
				return `${"c".repeat(32)}`;
			},
		},
	});
	await wait(20);
	expect(item.state().oids).toEqual([]);
	expect(item.state().oids).toEqual(Object.keys(item.state().mapOids));
	expect(item.state().mapOids).toEqual(Object.create(null));
	expect(item.state().hasSelectedAllCopies).toEqual(false);
});

test("User manualy select & dis-select any one of the extract from list", async () => {
	location.search = "?expiry_status=review_only&limit=10&mine_only=1&offset=0&q_mine_only=1&query=&review=1";
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	item.update();
	await wait(20);
	//user can see the ReactivateButton
	const reactivateBtn = item.find("ReactivateButton");
	expect(reactivateBtn.props().disabled).toEqual(true);

	//user dis select the extract
	item.instance().onChangeExtractCheckBox({
		currentTarget: {
			getAttribute: (name) => {
				return `${"a".repeat(32)}`;
			},
		},
	});
	await wait(20);
	expect(item.state().oids).toEqual(["a".repeat(32)]);
	expect(item.state().oids).toEqual(Object.keys(item.state().mapOids));
	expect(item.state().mapOids).not.toEqual(Object.create(null));

	//user select the extract again
	item.instance().onChangeExtractCheckBox({
		currentTarget: {
			getAttribute: (name) => {
				return `${"a".repeat(32)}`;
			},
		},
	});
	await wait(20);
	expect(item.state().oids).toEqual([]);
	expect(item.state().oids).toEqual(Object.keys(item.state().mapOids));
	expect(item.state().mapOids).toEqual(Object.create(null));
});

test("User manualy selected all the extract from list", async () => {
	location.search = "?expiry_status=review_only&limit=10&mine_only=1&offset=0&q_mine_only=1&query=&review=1";
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	item.update();
	await wait(20);
	//user can see the ReactivateButton
	const reactivateBtn = item.find("ReactivateButton");
	expect(reactivateBtn.props().disabled).toEqual(true);

	//user dis select the extract
	item.instance().onChangeExtractCheckBox({
		currentTarget: {
			getAttribute: (name) => {
				return `${"a".repeat(32)}`;
			},
		},
	});
	await wait(20);
	expect(item.state().oids).toEqual(["a".repeat(32)]);
	expect(item.state().oids).toEqual(Object.keys(item.state().mapOids));
	expect(item.state().mapOids).not.toEqual(Object.create(null));
	expect(item.state().hasSelectedAllCopies).toEqual(false);

	//user select the extract again
	item.instance().onChangeExtractCheckBox({
		currentTarget: {
			getAttribute: (name) => {
				return `${"b".repeat(32)}`;
			},
		},
	});
	await wait(20);
	expect(item.state().oids).toEqual(["a".repeat(32), "b".repeat(32)]);
	expect(item.state().oids).toEqual(Object.keys(item.state().mapOids));
	expect(item.state().mapOids).not.toEqual(Object.create(null));
	expect(item.state().hasSelectedAllCopies).toEqual(false);

	//user select the extract again
	item.instance().onChangeExtractCheckBox({
		currentTarget: {
			getAttribute: (name) => {
				return `${"c".repeat(32)}`;
			},
		},
	});
	await wait(20);
	expect(item.state().oids).toEqual([]);
	expect(item.state().oids).toEqual(Object.keys(item.state().mapOids));
	expect(item.state().mapOids).toEqual(Object.create(null));
	expect(item.state().hasSelectedAllCopies).toEqual(true);
});

test(`User can see number of students when reviewing copies page`, async () => {
	location.search = "?expiry_status=review_only&limit=10&mine_only=1&offset=0&q_mine_only=1&query=&review=1";
	mockGetExtractSearch = MockExtractSearch;
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	expect(item.state().tableRows[0].no_of_students.props.title).not.toEqual(null);

	expect(item.state().columns.length).toEqual(12);
});

test(`User can not see number of students when revieing my copies`, async () => {
	location.search = "?limit=10&mine_only=1&offset=0&q_mine_only=1&query=&review=0";
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	expect(item.state().columns.length).not.toEqual(12);
	expect(item.state().columns.length).toEqual(9);
});

test(`User see flyout pop up on review copies page`, async () => {
	location.search = "?limit=10&mine_only=1&offset=0&q_mine_only=1&query=&review=1";
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.setState({ screenFlyOutIndex: -1 });
	item.instance().updateHomeScreenBoxIndex();
	await wait(50);
	expect(item.find("withWhiteOutConsumer").length).toBe(1);
	expect(item.find("withWhiteOutConsumer").props().title).toEqual("Review last year's copies");
});

test(`User see flyout pop up on review copies page link`, async () => {
	location.search = "?limit=10&mine_only=1&offset=0&q_mine_only=1&query=&review=0";
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.setState({ screenFlyOutIndex: -1 });
	item.instance().updateHomeScreenBoxIndex();
	await wait(50);
	expect(item.find("withWhiteOutConsumer").length).toBe(1);
});

test(`User see flyout on notification icon`, async () => {
	location.search = "?limit=10&mine_only=1&offset=0&q_mine_only=1&query=&review=0";
	const item = shallow(<MyCopiesPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.setState({ flyOutIndex: 0 });
	item.setState({ flyOutIndexNotification: -1 });
	item.setState({ notificationCount: 1 });
	await wait(50);
	expect(item.find("withWhiteOutConsumer").length).toBe(1);
});
