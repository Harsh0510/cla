// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow, mount } from "enzyme";
import AdminAssetFavoritePage from "../index";
import MockUser from "../../../mocks/MockUser";
import MockUserRole from "../../../mocks/MockUserRole";
import Header from "../../../widgets/Header";
import mockAssetFavoriteData from "../../../mocks/mockAssetFavoriteData";
import mockExtractFavoriteData from "../../../mocks/mockExtractFavoriteData";

// Mock import
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAuthRequiredConsumer", () => mockPassthruHoc);
jest.mock("../../../assets/images/cover_img.png", () => true);

let ACTION_LIST, sortingA, sortingD, page, mockLimit, history, mockUserData, location, mockExtractfavouritesData, mockAssetfavouritesData;

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

async function defaultApi(endpoint, data) {
	// endpoints
	if (endpoint === "/admin/extract-favorite-get-all") {
		if (data) {
			return mockExtractfavouritesData;
		} else {
			return {
				data: [],
				unfiltered_count: 0,
			};
		}
	}

	if (endpoint === "/admin/asset-favorite-get-all") {
		if (data) {
			return mockAssetfavouritesData;
		} else {
			return {
				data: [],
				unfiltered_count: 0,
			};
		}
	}

	if (endpoint === "/public/asset-favorite-delete-all") {
		return { success: true };
	}

	if (endpoint === "/public/extract-favorite-delete-all") {
		return { success: true };
	}

	if (endpoint === "/public/extract-favorite") {
		return { success: true };
	}

	if (endpoint === "/public/asset-favorite") {
		return { success: true };
	}

	throw new Error("should never be here");
}

/**
 * Reset function
 */
function resetAll() {
	location = {
		search: {
			limit: 10,
			offset: 0,
			sort_field: "title",
			sort_dir: "asc",
			query: "",
			loading: true,
			isLoaded: false,
			unfiltered_count: 3,
			resultData: null,
			unfiltered_count: "5",
			message: null,
			action: ACTION_LIST,
			searchFilterText: null,
			favorite_type: "asset",
			isOpenConfirmationPopUp: false,
		},
	};
	history = {
		push: jest.fn(),
	};
	sortingA = [{ direction: "asc", columnName: "title" }];
	sortingD = [{ direction: "desc", columnName: "title" }];
	page = 2;
	mockLimit = 10;
	ACTION_LIST = "list";
	mockUserData = MockUser[0];
	mockUserData.role = MockUserRole.teacher;
	mockExtractfavouritesData = mockExtractFavoriteData;
	mockAssetfavouritesData = mockAssetFavoriteData;
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders correctly", async () => {
	const item = shallow(<AdminAssetFavoritePage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	expect(item.find("AdminPageWrap").length).toBe(1);
	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

/** When data not found */
test("When Data not found", async () => {
	location.search = "?action=list&ft=asset&limit=10&offset=0&query=&sort_dir=asc&sort_field=title";
	async function customApi(endpoint, data) {
		// "SchoolsPage" only queries this endpoint
		mockAssetFavoriteData.data = [];
		if (endpoint === "/admin/asset-favorite-get-all") {
			return mockAssetFavoriteData;
		}
		return api;
	}
	const item = shallow(<AdminAssetFavoritePage location={location} api={customApi} withAuthConsumer_myUserDetails={mockUserData} />);
	//we have add the filters
	await wait(50);
	item.update();
	expect(item.state().message).toEqual("No data found");
});

/** User click on sorting for ascending order*/
test("User click on sorting for ascending order", async () => {
	mockUserData = MockUser[2];
	const item = shallow(
		<AdminAssetFavoritePage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	//ascending order
	item.instance().doSorting(sortingA);
	await wait(50);
	item.update();
	expect(item.state().offset).toBe(0);
});

/** User click on sorting for descending order */
test("User click on sorting for descending order", async () => {
	mockUserData = MockUser[2];
	const item = shallow(
		<AdminAssetFavoritePage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	//decending order
	item.instance().doSorting(sortingD);
	expect(item.state().offset).toBe(0);
});

/** User click on pagination page */
test("User click on pagination page", async () => {
	const item = shallow(
		<AdminAssetFavoritePage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);

	item.instance().doPagination(page, mockLimit);
	const push = item.instance().props.history.push;
	const setOffset = (page - 1) * mockLimit;
	await wait(50);
	item.update();
	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/favourites?action=" +
			ACTION_LIST +
			"&ft=asset&limit=" +
			mockLimit +
			"&offset=" +
			setOffset +
			"&query&sort_dir=asc&sort_field=title"
	);
});

/** User click on pagination page */
test("User click on pagination page", async () => {
	const item = shallow(
		<AdminAssetFavoritePage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	const page = 0;
	item.instance().doPagination(page, mockLimit);
	const push = item.instance().props.history.push;
	const setOffset = page * mockLimit;
	await wait(50);
	item.update();
	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/favourites?action=" +
			ACTION_LIST +
			"&ft=asset&limit=" +
			mockLimit +
			"&offset=" +
			setOffset +
			"&query&sort_dir=asc&sort_field=title"
	);
});

test("User click on copy radion button", async () => {
	location.search = "?action=list&ft=asset&limit=10&offset=0&query=&sort_dir=asc&sort_field=title";
	const item = shallow(
		<AdminAssetFavoritePage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	//user click doMineOnlyToggle button
	await wait(20);
	item.instance().doAssetCopyToggle();
	const push = item.instance().props.history.push;
	item.update();
	expect(push.mock.calls[0][0]).toBe("/profile/admin/favourites?action=list&ft=copy&limit=10&offset=0&query&sort_dir=asc&sort_field=title");
});

test("User click on asset radion button", async () => {
	location.search = "?action=list&ft=copy&limit=10&offset=0&query=&sort_dir=asc&sort_field=title";
	const item = shallow(
		<AdminAssetFavoritePage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	//user click doMineOnlyToggle button
	await wait(20);
	item.instance().doAssetCopyToggle();
	const push = item.instance().props.history.push;
	item.update();
	expect(push.mock.calls[0][0]).toBe("/profile/admin/favourites?action=list&ft=asset&limit=10&offset=0&query&sort_dir=asc&sort_field=title");
});
/** Component load wrong limit and offset values */
test("Component load wrong limit and offset values", async () => {
	location.search = "?action=list&ft=copy&limit=10&offset=0&query=&sort_dir=asc&sort_field=title";
	const item = shallow(
		<AdminAssetFavoritePage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	//we have add the filters
	item.setProps({ location: { search: "?action=list&ft=copy&limit=-1&offset=-1&query=&sort_dir=asc&sort_field=title" } });
	await wait(50);
	item.update();
	expect(item.state().limit).toEqual(1);
});

/** User change the filter data and click on the reset button */
test("User change the filter data and click on the reset button", async () => {
	location.search = "?action=list&ft=copy&limit=10&offset=0&query=&sort_dir=asc&sort_field=title";
	const item = shallow(
		<AdminAssetFavoritePage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.update();

	//User changing thr filter data
	const selected = "Test";
	expect(item.state().query).toEqual(null);
	item.instance().handlefilterSelection(selected, "query");
	expect(item.state().query).toEqual(selected);

	//User going to click on  reset button
	const spy = jest.spyOn(item.instance(), "pushHistory");
	item.instance().resetAll();
	expect(spy).toHaveBeenCalled();
	expect(item.state().query).toEqual("");
	expect(item.state().message).toEqual(null);
});

/** User change the filter data and click on submit button */
test("User change the filter data and click on submit button", async () => {
	location.search = "?action=list&ft=copy&limit=10&offset=0&query=&sort_dir=asc&sort_field=title";
	const item = shallow(
		<AdminAssetFavoritePage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.update();

	//User changing thr filter data
	const selected = "Test";
	expect(item.state().query).toEqual(null);
	item.instance().handlefilterSelection(selected, "query");
	expect(item.state().query).toEqual(selected);

	const push = item.instance().props.history.push;
	//User going to click on  reset button
	item.instance().doSearch();
	expect(push.mock.calls[0][0]).toEqual("/profile/admin/favourites?action=list&ft=copy&limit=10&offset=0&sort_dir=asc&sort_field=title");
});

test("When user click on doRemoveAllfavourites icon to remove all asset in favorite list and _isMounted false", async () => {
	const item = shallow(
		<AdminAssetFavoritePage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	item.instance().componentWillUnmount();
	item.instance().doRemoveAllFavorites();

	expect(item.state().resultData).toEqual([]);
});

test("When user click on doRemoveAllfavourites icon to remove all asset in favorite list and open ConfirmationPopUp and click on close button", async () => {
	const item = shallow(
		<AdminAssetFavoritePage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	item.instance().onOpenConfirmationPopUp();
	item.instance().onCloseConfirmationPopUp();
	expect(item.state().isOpenConfirmationPopUp).toEqual(false);
});

test("When user click on doRemoveAllfavourites icon to remove all asset in favorite list and open ConfirmationPopUp and click on confirm button", async () => {
	const item = shallow(
		<AdminAssetFavoritePage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	item.instance().onOpenConfirmationPopUp();
	item.instance().onConfirmRemoveAllFilters();
	expect(item.state().resultData).toEqual([]);
});

test("When user click on doRemoveAllfavourites icon to remove all copies in favorite list and open ConfirmationPopUp and click on confirm button", async () => {
	const item = shallow(
		<AdminAssetFavoritePage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	item.setState({ favorite_type: "copy" });
	item.instance().onOpenConfirmationPopUp();
	item.instance().onConfirmRemoveAllFilters();
	expect(item.state().resultData).toEqual([]);
});

test("When user click on favorite icon to add/remove asset in favorite list", async () => {
	const item = shallow(
		<AdminAssetFavoritePage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	item.setState({ resultData: mockAssetFavoriteData.data });
	item.instance().doToggleFavorite(0);
	expect(item.state().resultData).not.toEqual(null);
});

test("When user click on favorite icon to add/remove copy in favorite list", async () => {
	const item = shallow(
		<AdminAssetFavoritePage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	item.setState({ resultData: mockExtractFavoriteData.data });
	item.setState({ favorite_type: "copy" });
	item.instance().doToggleFavorite(0);
	expect(item.state().resultData).not.toEqual(null);
});

test("When user click on favorite icon to add/remove copy in favorite list and resultData is not an array", async () => {
	const item = shallow(
		<AdminAssetFavoritePage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	item.setState({ resultData: { mockAssetFavoriteData } });
	item.setState({ favorite_type: "copy" });
	item.instance().doToggleFavorite(0);
	expect(item.state().resultData).not.toEqual(null);
});

test("When user click on favorite icon to add/remove copy in favorite list and resultData is null", async () => {
	const item = shallow(
		<AdminAssetFavoritePage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	item.setState({ resultData: mockAssetFavoriteData.data });
	item.instance().doToggleFavorite(3);
	expect(item.state().resultData).not.toEqual(null);
});

test("When componentWillUnmount", async () => {
	const item = shallow(
		<AdminAssetFavoritePage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	item.setState({ resultData: mockExtractFavoriteData.data });
	item.instance().doToggleFavorite(0);
	item.instance().componentWillUnmount();
	expect(item.state().resultData).not.toEqual(null);
});
