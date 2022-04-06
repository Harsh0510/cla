// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import SearchPage from "../index";
import MockSearchResults, { Mockfilters } from "../../../mocks/MockSearchResults";
import MockApi from "../../../mocks/MockApi";
import Header from "../../../widgets/Header";
import Pagination from "../../../widgets/Pagination";
import MockUserRole from "../../../mocks/MockUserRole";
import MockUser from "../../../mocks/MockUser";
import MockSubject from "../../../mocks/MockSubject";
import withPageSize from "../../../common/withPageSize";
import MockTempUnlockAsset from "../../../mocks/MockTempUnlockAsset";
import MockSearchFilters from "../../../mocks/MockSearchFilters";
/**
 * This 'HOC' does nothing but 'pass through' the provided component,
 * so it's not necessary to 'dive()' into rendered results,
 * and so it's possible to mock the 'api' function.
 **/
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

// Mock HOC import
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withPageSize", () => mockPassthruHoc);
jest.mock("../../../common/withAuthConsumer", () => mockPassthruHoc);
jest.mock("react-resize-detector", () => {
	return { withResizeDetector: mockPassthruHoc };
});
jest.mock("../../../common/FlyoutManager", () => {
	return { withFlyoutManager: mockPassthruHoc };
});

// Mock asset imports
jest.mock("../../../widgets/PageWrap/images/Sign_in_Shape_1.svg", () => jest.fn());
jest.mock("../../../widgets/PageWrap/images/Sign_in_Shape_2.svg", () => jest.fn());
jest.mock("../../../assets/images/Hero_image_mobile.jpg", () => jest.fn());
jest.mock("../../../assets/images/Hero_image_Desktop.jpg", () => jest.fn());
jest.mock("../../../assets/icons/Play_video.png", () => jest.fn());
jest.mock("../../../assets/images/rhema-kallianpur-471933-unsplash.jpg", () => jest.fn());
jest.mock("../../../assets/icons/arrow.svg", () => jest.fn());
jest.mock("../../../assets/images/cover_img.png", () => true);

let mockUserData, width, props;
let mockResultUserIndexUpdate, mockResultUserSeenIndex, mockResultAssetFavorite, mockTempUnlockAsset;
let WrappedComponent, flyouts_getFirstUnseenIndex, flyouts_getSeenIndex, flyouts_setNext, flyouts_setIndex;
let mockFiterData;
let mockCourseGetOneForSchool;

/**
 * wait
 * @param {*} millis
 */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/**
 * Reset function
 */
function resetAll() {
	flyouts_getFirstUnseenIndex = jest.fn();
	flyouts_getSeenIndex = jest.fn();
	flyouts_setNext = jest.fn();
	flyouts_setIndex = jest.fn();
	MockUser[0].flyout_enabled = false;
	mockUserData = MockUser[0];
	width = 1024;
	mockResultUserSeenIndex = { result: -1 };
	mockResultUserIndexUpdate = { result: true };
	mockResultAssetFavorite = { success: true };
	WrappedComponent = mockPassthruHoc;
	props = {
		flyouts_getFirstUnseenIndex: flyouts_getFirstUnseenIndex,
		flyouts_getSeenIndex: flyouts_getSeenIndex,
		flyouts_setNext: flyouts_setNext,
		flyouts_setIndex: flyouts_setIndex,
		flyout_getLatestFlyoutIndex: jest.fn(),
	};
	mockTempUnlockAsset = MockTempUnlockAsset;
	mockFiterData = MockSearchFilters;
	mockCourseGetOneForSchool = {
		result: {
			courseOid: "1234",
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/**
 * default api
 * @param {*} endpoint
 * @param {*} data
 */
async function defaultApi(endpoint, data) {
	if (endpoint === "/search/search") {
		if (data === false) {
			throw "Unknown error";
		}
		return MockSearchResults;
	} else if (endpoint === "/search/get-filters") {
		if (data === false) {
			throw "Unknown error";
		}
		return mockFiterData;
	} else if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
		return mockResultUserSeenIndex;
	} else if (endpoint === "/public/first-time-user-experience-update") {
		return mockResultUserIndexUpdate;
	} else if (endpoint === "/public/asset-favorite") {
		return mockResultAssetFavorite;
	} else if (endpoint === "/public/get-temp-unlocked-assets") {
		return mockTempUnlockAsset;
	} else if (endpoint === "/public/course-get-one-for-school") {
		return mockCourseGetOneForSchool;
	}
	throw new Error("should never be here");
}

/** Component renders correctly */
test("Component renders correctly", async () => {
	flyouts_getSeenIndex.mockReturnValue(-1);
	const location = {
		pathname: "/works",
	};
	const item = shallow(<SearchPage {...props} location={location} api={defaultApi} />);
	expect(item.find(Header).length).toBe(1);
	expect(flyouts_getFirstUnseenIndex).toHaveBeenCalled();
});

/** Search results contain work items */
test("Search results contain work items", async () => {
	const location = {
		pathname: "/works",
		search: "?q=english&page=1",
	};
	const item = shallow(<SearchPage {...props} location={location} api={defaultApi} width={width} />);

	await wait(50);
	item.update();
	expect(item.state("data").length).toBe(MockSearchResults.results.length);
});

/** Search results are paginated */
test("Search results are paginated", async () => {
	const location = {
		pathname: "/works",
		search: "?q=english&page=2&limit=2",
	};

	const item = shallow(<SearchPage {...props} location={location} api={MockApi} />);

	await wait(100);
	expect(item.find(Pagination).length).toBe(1);
});

/** Search is performed when search query changes */
test("Search is performed when search query changes", async () => {
	const location = {
		pathname: "/works",
		search: "?q=english&page=1&limit=2",
	};
	const item = shallow(<SearchPage {...props} location={location} api={MockApi} />);

	await wait(50);
	item.setProps({
		location: {
			pathname: "/works",
			search: "?q=maths&page=1&limit=2",
		},
	});

	await wait(50);
	expect(item.find(Pagination).length).toBe(1);
});

/** User change the Results Per Pages from Pagination */
test("User change the Results Per Pages from Pagination", async () => {
	const location = {
		pathname: "/works",
		search: "?q=english&limit=4",
	};
	const item = shallow(<SearchPage {...props} location={location} api={MockApi} />);

	await wait(50);
	item.setProps({
		location: {
			pathname: "/works",
			search: "?q=maths&limit=24",
		},
	});

	await wait(50);
	expect(item.state().limit).toBe(24);
});

/** User change the Pagination page */
test("User click on next page", async () => {
	const map = {};
	window.scrollTo = jest.fn((event, cb) => {
		map[event] = cb;
	});

	const location = {
		pathname: "/works",
		search: "?q=english&limit=4",
	};
	const history = {
		push: jest.fn(),
	};

	const item = shallow(<SearchPage {...props} location={location} api={MockApi} history={history} />);

	const push = item.instance().props.history.push;

	await wait(50);
	item.update();

	item.instance().handlePagination(2);

	await wait(50);
	item.update();

	expect(push.mock.calls[0][0]).toEqual("/works?limit=4&page=2&q=english");
});

/** User with school-admin/teacher role should have misc filter group data */
test("User with school-admin/cla-admin role should have misc filter group data", async () => {
	let filterdata = false;
	mockUserData.role = MockUserRole.schoolAdmin;

	const location = {
		pathname: "/works",
		search: "?filter_misc=my_copies&filter_subject=E",
	};
	const item = shallow(<SearchPage {...props} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	item.update();

	filterdata = item.state().filters.find((row) => row.id == "misc") ? true : false;

	expect(filterdata).toBe(true);
});

/** User with teacher role should have misc filter group data */
test("User with teacher role should have misc filter group data", async () => {
	let filterdata = false;
	mockUserData.role = MockUserRole.claAdmin;

	const location = {
		pathname: "/works",
		search: "?filter_misc=my_copies&filter_subject=E",
	};
	const item = shallow(<SearchPage {...props} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	item.update();

	filterdata = item.state().filters.find((row) => row.id == "misc") ? true : false;

	expect(filterdata).toBe(false);
});

/** User with school-admin/teacher than search api param should be misc filter */
test("User with school-admin/teacher than search api param should be misc filter", async () => {
	mockUserData.role = MockUserRole.schoolAdmin;
	let api_SearcParam = [];
	const location = {
		pathname: "/works",
		search: "?filter_misc=my_copies&filter_subject=Y&q=english&page=1&",
	};

	async function api(endpoint, data) {
		if (endpoint === "/search/search") {
			api_SearcParam = data;
			return MockSearchResults;
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<SearchPage {...props} location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.update();

	expect(api_SearcParam.filter.misc[0]).toBe("my_copies");
});

/** User with school-admin/teacher than search api param should not be misc filter */
test("User with school-admin/teacher than search api param should not be misc filter", async () => {
	mockUserData.role = MockUserRole.claAdmin;
	let api_SearcParam = [];
	const location = {
		pathname: "/works",
		search: "?filter_misc=my_copies&filter_subject=Y&q=english&page=1&",
	};

	async function api(endpoint, data) {
		if (endpoint === "/search/search") {
			api_SearcParam = data;
			return MockSearchResults;
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<SearchPage {...props} location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.update();

	expect(api_SearcParam.filter.hasOwnProperty("misc")).toBe(false);
});

/** User with school-admin/teacher than search api param should not be misc filter */
test("User with school-admin role and do sign out from the work page", async () => {
	mockUserData.role = MockUserRole.schoolAdmin;
	let api_SearcParam = [];
	const location = {
		pathname: "/works",
		search: "?filter_misc=my_copies&filter_subject=Y&q=english&page=1&",
	};

	async function api(endpoint, data) {
		if (endpoint === "/search/search") {
			api_SearcParam = data;
			return MockSearchResults;
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<SearchPage {...props} location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(50);
	item.update();
	expect(api_SearcParam.filter.hasOwnProperty("misc")).toBe(true);

	item.setProps({
		withAuthConsumer_myUserDetails: null,
	});
	await wait(50);
	item.update();

	expect(api_SearcParam.filter.hasOwnProperty("misc")).toBe(false);
});

/** User Search filter and checked the filter */
test("User click on filter checkbox for my library section ", async () => {
	mockUserData.role = MockUserRole.schoolAdmin;
	let api_SearcParam = [];
	const history = {
		push: jest.fn(),
	};
	let filterItem = [
		{
			filterGroup: "misc",
			filterId: "my_school_library",
			isChecked: false,
		},
		{
			filterGroup: "misc",
			filterId: "my_copies",
			isChecked: true,
		},
	];
	const location = {
		pathname: "/works",
		search: "?filter_misc=my_school_library&q=english&page=1&",
	};

	async function api(endpoint, data) {
		if (endpoint === "/search/search") {
			api_SearcParam = data;
			return MockSearchResults;
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<SearchPage {...props} location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} history={history} />);

	const push = item.instance().props.history.push;
	await wait(100);
	item.instance().selectFilter(filterItem);
	item.update();
	item.instance().forceUpdate();
	await wait(50);

	expect(push.mock.calls[0][0]).toEqual("/works?filter_misc=my_copies&q=english");
});

/** User Search filter and checked the filter */
test("User click on filter checkbox for subject section ", async () => {
	mockUserData.role = MockUserRole.claAdmin;
	let api_SearcParam = [];
	const history = {
		push: jest.fn(),
	};
	let filterItem = [
		{
			filterGroup: "subject",
			filterId: "Y",
			isChecked: true,
		},
	];
	const location = {
		pathname: "/works",
		search: "?q=english&page=1&",
	};

	async function api(endpoint, data) {
		if (endpoint === "/search/search") {
			api_SearcParam = data;
			return MockSearchResults;
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<SearchPage {...props} location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} history={history} />);

	const push = item.instance().props.history.push;
	await wait(100);
	item.instance().selectFilter(filterItem);
	item.update();
	item.instance().forceUpdate();
	await wait(50);

	expect(push.mock.calls[0][0]).toEqual("/works?filter_subject=Y&q=english");
});

/** Component load with ISBN number and get searchWasMaybeIsbn true*/
test("User search with isbn number ", async () => {
	mockUserData.role = MockUserRole.claAdmin;
	let api_SearcParam = [];
	const history = {
		push: jest.fn(),
	};
	const location = {
		pathname: "/works",
		search: "?q=9870836489178",
	};

	async function api(endpoint, data) {
		if (endpoint === "/search/search") {
			api_SearcParam = data;
			return MockSearchResults;
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<SearchPage {...props} location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} history={history} />);

	await wait(100);

	expect(item.state().searchWasMaybeIsbn).toBe(true);
});

/** Component load with wrong ISBN number and get searchWasIsbn value false*/
test("User search with wrong isbn number ", async () => {
	mockUserData.role = MockUserRole.claAdmin;
	let api_SearcParam = [];
	const history = {
		push: jest.fn(),
	};
	const location = {
		pathname: "/works",
		search: "?q=0545010225",
	};

	async function api(endpoint, data) {
		if (endpoint === "/search/search") {
			api_SearcParam = data;
			return MockSearchResults;
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<SearchPage {...props} location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} history={history} />);

	await wait(100);

	expect(item.state().searchWasIsbn).toBe(false);
});

/** User change the Pagination page  and also change per page result onResultsPerPageChange*/
test("User update per page limit", async () => {
	const map = {};
	window.scrollTo = jest.fn((event, cb) => {
		map[event] = cb;
	});

	const location = {
		pathname: "/works",
		search: "?q=9870836489178&limit=12",
	};
	const history = {
		push: jest.fn(),
	};

	const item = shallow(<SearchPage {...props} location={location} api={MockApi} history={history} />);

	const push = item.instance().props.history.push;

	await wait(50);
	const attrs = { "data-limit": "48" };
	item.instance().onResultsPerPageChange({ preventDefault: jest.fn(), target: { value: 48 } });
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(push.mock.calls[0][0]).toEqual("/works?limit=48&q=9870836489178");
});

/** User change the subject filter expanded true */
test("User change the subject filter expanded true", async () => {
	const location = {
		pathname: "/works",
		search: "?q=english&limit=4",
	};
	const history = {
		push: jest.fn(),
	};

	const item = shallow(<SearchPage {...props} location={location} api={MockApi} history={history} />);
	await wait(50);
	item.instance().setOpenSubjectFlag(true);
	expect(item.state().openSubject).toEqual(true);
});

/** User change the subject filter expanded false */
test("User change the subject filter expanded false", async () => {
	const location = {
		pathname: "/works",
		search: "?q=english&limit=4",
	};
	const history = {
		push: jest.fn(),
	};

	const item = shallow(<SearchPage {...props} location={location} api={MockApi} history={history} />);
	await wait(50);
	item.instance().setOpenSubjectFlag(false);
	expect(item.state().openSubject).toEqual(false);
});

/** Fetch All Subjects Successfully */
test("Fetch All Subjects Successfully", async () => {
	const history = {
		push: jest.fn(),
	};
	const location = {
		pathname: "/works",
		search: "?q=AFKV",
	};
	async function api(endpoint, data) {
		if (endpoint === "/public/subjects-get-all") {
			return MockSubject;
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(<SearchPage {...props} location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} history={history} />);

	await wait(100);
	expect(item.state().allSubjects).not.toBe(null);
	expect(item.find("WorkResults").length).toBe(1);
});

/** When user click on refine search in mobile view*/
test("When user click on refine search in mobile view", async () => {
	flyouts_getFirstUnseenIndex.mockReturnValue(5);
	withPageSize.TABLET = 20;
	const location = {
		pathname: "/works",
		search: "?q=maths",
	};
	const history = {
		push: jest.fn(),
	};

	const item = shallow(
		<SearchPage {...props} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />
	);

	item.setProps({ breakpoint: 10, width: "320" });
	item.setState({ open: true });

	await wait(20);
	item.find("SearchLabel").simulate("click", { preventDefault: jest.fn() });
	expect(item.state("open")).toBe(true);
});

test("User seen the pop-up modal ", async () => {
	flyouts_getFirstUnseenIndex.mockReturnValue(0);
	const location = {
		pathname: "/works",
		search: "?q=maths",
	};
	const history = {
		push: jest.fn(),
	};
	mockUserData.flyout_enabled = true;
	mockResultUserSeenIndex = { result: -1 };
	const item = shallow(
		<SearchPage {...props} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />
	);
	await wait(20);
	expect(item.find("withWhiteOutConsumer").length).toBe(1);

	item.find("withWhiteOutConsumer").props().handleShowMe();
	expect(flyouts_setNext).toHaveBeenCalled();
});

test("User seen click on show me button and view all flyouts ", async () => {
	flyouts_getFirstUnseenIndex.mockReturnValue(5);
	const location = {
		pathname: "/works",
		search: "?q=",
	};
	const history = {
		push: jest.fn(),
	};
	mockUserData.flyout_enabled = true;
	mockResultUserSeenIndex = { result: -1 };
	mockResultUserIndexUpdate = { result: true };
	const item = shallow(
		<SearchPage {...props} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />
	);
	expect(item.find("withWhiteOutConsumer").length).toBe(1);

	item.find("withWhiteOutConsumer").props().onClose();
	expect(flyouts_setNext).toHaveBeenCalled();
});

test("When User Click on favorite icon to add asset in favorite list", async () => {
	flyouts_getFirstUnseenIndex.mockReturnValue(5);
	const location = {
		pathname: "/works",
		search: "?q=",
	};
	const history = {
		push: jest.fn(),
	};
	mockUserData.flyout_enabled = true;
	mockResultUserSeenIndex = { result: -1 };
	mockResultUserIndexUpdate = { result: true };
	const item = shallow(
		<SearchPage {...props} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />
	);
	item.instance().doToggleFavorite();
	item.setState({ data: [{ title: "title 1", publisher: "publisher 1" }] });
	expect(item.find("withWhiteOutConsumer").length).toBe(1);
	expect(item.state().data.length).toBe(1);

	item.find("withWhiteOutConsumer").props().onClose();
	expect(flyouts_setNext).toHaveBeenCalled();
});

test("When User move to another page", async () => {
	flyouts_getFirstUnseenIndex.mockReturnValue(5);
	const location = {
		pathname: "/works",
		search: "?q=",
	};
	const history = {
		push: jest.fn(),
	};
	mockUserData.flyout_enabled = true;
	mockResultUserSeenIndex = { result: -1 };
	mockResultUserIndexUpdate = { result: true };
	const item = shallow(
		<SearchPage {...props} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} history={history} />
	);
	item.instance().componentWillUnmount();
	item.instance().doToggleFavorite();
	expect(item.find("withWhiteOutConsumer").length).toBe(1);
	expect(item.state("data").length).toBe(0);

	item.find("withWhiteOutConsumer").props().onClose();
	expect(flyouts_setNext).toHaveBeenCalled();
});

test("User see prompt when school has temporary unlocked assets", async () => {
	const history = {
		push: jest.fn(),
	};
	const location = {
		pathname: "/works",
		search: "?q",
	};
	async function api(endpoint, data) {
		if (endpoint === "public/get-temp-unlocked-assets") {
			return mockTempUnlockAsset;
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(<SearchPage {...props} location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} history={history} />);
	await wait(100);
	item.update();
	expect(item.state().tempUnlockAssetData).not.toBe(null);
	expect(item.find("TempUnlockWrap").length).toBe(1);
	expect(item.find("TempUnlockAsset").length).toBe(1);
});

test("User see prompt when school has temporary unlocked assets in mobile screen", async () => {
	const history = {
		push: jest.fn(),
	};
	const location = {
		pathname: "/works",
		search: "?q",
	};
	async function api(endpoint, data) {
		if (endpoint === "public/get-temp-unlocked-assets") {
			return mockTempUnlockAsset;
		}
		return defaultApi(endpoint, data);
	}
	props.isMobile = true;
	const item = shallow(<SearchPage {...props} location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} history={history} />);
	await wait(100);
	item.update();
	expect(item.state().tempUnlockAssetData).not.toBe(null);
	expect(item.find("TempUnlockWrap").length).toBe(1);
	expect(item.find("TempUnlockAsset").length).toBe(1);
});

test("User sees content request modal when user clicks on tell us link", async () => {
	const history = {
		push: jest.fn(),
	};
	const location = {
		pathname: "/works",
		search: "?q=0545010225",
	};

	async function api(endpoint, data) {
		if (endpoint === "/search/search") {
			api_SearcParam = data;
			return MockSearchResults;
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<SearchPage {...props} location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} history={history} />);
	await wait(100);
	item.find("Span").simulate("click");
	expect(item.find("ContentRequestModal").length).toBe(1);
});

test("When user close content request modal", async () => {
	const history = {
		push: jest.fn(),
	};
	const location = {
		pathname: "/works",
		search: "?q=0545010225",
	};

	async function api(endpoint, data) {
		if (endpoint === "/search/search") {
			api_SearcParam = data;
			return MockSearchResults;
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<SearchPage {...props} location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} history={history} />);
	await wait(100);
	item.find("Span").simulate("click");
	expect(item.find("ContentRequestModal").length).toBe(1);

	const hideContentRequestModal = item.find("ContentRequestModal").prop("handleClose");
	hideContentRequestModal();
	expect(item.find("ContentRequestModal").length).toBe(0);
});

test("When no result found for search user sees the button for upload own extract", async () => {
	const location = {
		pathname: "/works",
		search: "?q=english",
	};
	async function api(endpoint, data) {
		if (endpoint === "/search/search") {
			return { unfiltered_count: 0, results: [] };
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(<SearchPage {...props} location={location} api={api} width={width} />);

	await wait(50);
	item.update();
	expect(item.find("AssetUploadButtonLink").length).toBe(1);
});
