// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow } from "enzyme";
import MyUploadsPage from "../index";
import MockApi from "../../../mocks/MockApi";
import MockUser from "../../../mocks/MockUser";
import TwoOptionSwitch from "../../../widgets/ToggleSwitch/TwoOptionSwitch";

let api;
let sortingA;
let sortingD;
let page;
let history;
let mockUserData;
let location;
let mockLimit;
let mockCourseGetOneForSchool;
let mockResultGetAll;

const mockXHR = {
	open: jest.fn(),
	send: jest.fn(),
	onload: jest.fn(),
	readyState: 4,
	status: 200,
	setRequestHeader: (type, value) => {},

	ontimeout: (_) => {},
};

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

/**
 * Mock for  MyXMLHttpRequest
 **/
jest.mock("../../../common/MyXMLHttpRequest", () => {
	return function () {
		return mockXHR;
	};
});

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

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
	api = defaultApi;
	mockCourseGetOneForSchool = {
		result: {
			courseOid: "1234",
		},
	};
	mockResultGetAll = {
		data: [
			{
				asset_id: 25907,
				authors: [{ role: "A", lastName: "Markson", firstName: "Bob" }],
				content_title: "Some third title",
				copy_count: 12,
				copy_ratio: 0.025,
				date_created: "2022-03-04T10:58:30.981Z",
				filename: "9781973194057_59890c29396ba1fcedc0939c0d07ba830d20.pdf",
				first_name: "Devi",
				id: 83,
				isbn13: "9781973194057",
				last_name: "Odedara",
				oid: "59890c29396ba1fcedc0939c0d07ba830d20",
				pages: [1, 2, 3, 4, 5],
				pdf_url:
					"https://occcladevstorage.blob.core.windows.net/userassetuploads/9781973194057_59890c29396ba1fcedc0939c0d07ba830d20.pdf?sv=2020-06-12&ss=b&srt=o&spr=https&st=2022-03-07T07%3A33%3A06Z&se=2022-03-07T11%3A33%3A06Z&sp=r&sig=IxNoTxXvFDgaKqp5D2LAnxprbn2MjMNW4fdEk7wAmMw%3D",
				upload_name: "test abc",
			},
			{
				asset_id: 25908,
				authors: [],
				content_title: "Some third title",
				copy_count: 3,
				copy_ratio: -1,
				date_created: "2022-03-04T10:58:30.981Z",
				filename: "9781973194057_59890c29396ba1fcedc0939c0d07ba830d20.pdf",
				first_name: "Devi",
				id: 83,
				isbn13: "9781973194057",
				last_name: "Odedara",
				oid: "59890c29396ba1fcedc0939c0d07ba830d20",
				pages: [1, 2, 3, 4, 5],
				pdf_url:
					"https://occcladevstorage.blob.core.windows.net/userassetuploads/9781973194057_59890c29396ba1fcedc0939c0d07ba830d20.pdf?sv=2020-06-12&ss=b&srt=o&spr=https&st=2022-03-07T07%3A33%3A06Z&se=2022-03-07T11%3A33%3A06Z&sp=r&sig=IxNoTxXvFDgaKqp5D2LAnxprbn2MjMNW4fdEk7wAmMw%3D",
				upload_name: "test abc",
			},
		],

		unfiltered_count: 2,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

async function defaultApi(endpoint, data) {
	// "SchoolsPage" only queries this endpoint
	if (endpoint === "/public/course-get-one-for-school") {
		return mockCourseGetOneForSchool;
	}
	if (endpoint === "/public/asset-user-upload-get-all") {
		return mockResultGetAll;
	}
	return api;
}

test("Component renders correctly", async () => {
	const item = shallow(<MyUploadsPage location={{ search: "" }} api={api} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	expect(item.find("AdminPageWrap").length).toBe(1);
	expect(item.find("TwoOptionSwitch").length).toBe(1);
	expect(item.containsMatchingElement(<TwoOptionSwitch />)).toBe(true);
});

/** User click on sorting for ascending order*/
test("User click on sorting for ascending order", async () => {
	mockUserData = MockUser[2];
	const item = shallow(<MyUploadsPage location={{ search: "" }} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	//ascending order
	item.instance().doSorting(sortingA);
	await wait(50);
	item.update();
	expect(item.state().offset).toBe(0);
});

/** User click on sorting for descending order */
test("User click on sorting for descending order", async () => {
	mockUserData = MockUser[2];
	const item = shallow(<MyUploadsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	//decending order
	item.instance().doSorting(sortingD);
	expect(item.state().offset).toBe(0);
});

/** User click on pagination page */
test("User click on pagination page", async () => {
	const item = shallow(<MyUploadsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().doPagination(page, mockLimit);
	const push = item.instance().props.history.push;
	const setOffset = (page - 1) * mockLimit;
	await wait(50);
	item.update();
	expect(push.mock.calls[0][0]).toEqual("/profile/admin/my-uploads?limit=" + mockLimit + "&offset=" + setOffset + "&q_mine_only=0&query=");
});

/** User click for my uploads only q_mine_only value pass with 0*/
/** doMineOnlyToggle */
test("User click on my uploads radion button", async () => {
	location.search = "?limit=10&offset=0&q_mine_only=0";
	const item = shallow(<MyUploadsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	//user click doMineOnlyToggle button
	await wait(20);
	const f_mine_only = item.state().f_mine_only;
	item.instance().doMineOnlyToggle();
	const push = item.instance().props.history.push;
	item.update();
	expect(push.mock.calls[0][0]).toBe("/profile/admin/my-uploads?limit=10&offset=0&q_mine_only=" + Number(!f_mine_only) + "&query=");
});

/** User click for all uploads only q_mine_only value pass with 1*/
/** doMineOnlyToggle */
test("User click on all uploads radio button", async () => {
	location.search = "?limit=10&offset=0&q_mine_only=1";
	const item = shallow(<MyUploadsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	//user click doMineOnlyToggle button
	await wait(20);
	const f_mine_only = item.state().f_mine_only;
	item.instance().doMineOnlyToggle();
	const push = item.instance().props.history.push;
	item.update();
	expect(push.mock.calls[0][0]).toBe("/profile/admin/my-uploads?limit=10&offset=0&q_mine_only=" + Number(!f_mine_only) + "&query=");
});

/** Component load wrong limit and offset values */
test("Component load wrong limit and offset values", async () => {
	location.search = "?limit=10&offset=0&q_mine_only=1";
	const item = shallow(<MyUploadsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	//we have add the filters
	item.setProps({ location: { search: "?limit=-1&offset=-1&sort_dir=asc&sort_field=email" } });
	await wait(50);
	item.update();
	expect(item.state().limit).toEqual(1);
});

// /** User change the filter data and click on the reset button */
test("User change the filter data and click on the reset button", async () => {
	location.search = "?action=list&limit=10&offset=0&q_mine_only=1";
	const item = shallow(<MyUploadsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	item.update();

	//User changing thr filter data
	const searchQuery = "Test";
	expect(item.state().query).toEqual("");
	item.instance().handlefilterSelection(searchQuery, "query");
	expect(item.state().query).toEqual(searchQuery);

	//User going to click on  reset button
	const spy = jest.spyOn(item.instance(), "pushHistory");
	item.instance().resetAll();
	expect(spy).toHaveBeenCalled();
	expect(item.state().query).toEqual("");
	expect(item.state().message).toEqual(null);
});

/** User change the filter data and click on submit button */
test("User change the filter data and click on submit button", async () => {
	location.search = "?action=list&limit=10&offset=0&q_mine_only=1";
	const item = shallow(<MyUploadsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	item.update();

	//User changing thr filter data
	const searchQuery = "Test";
	expect(item.state().query).toEqual("");
	item.instance().handlefilterSelection(searchQuery, "query");
	await wait(50);
	expect(item.state().query).toEqual(searchQuery);

	const push = item.instance().props.history.push;
	//User going to click on  reset button
	item.instance().doSearch();
	expect(push.mock.calls[0][0]).toEqual("/profile/admin/my-uploads?limit=10&offset=0&q_mine_only=1&query=Test");
});

/** User click on upload new extract link */
test("User click on upload new extract link", async () => {
	location.search = "?action=list&limit=10&offset=0&q_mine_only=1";
	const item = shallow(<MyUploadsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.update();

	expect(item.find("ButtonLink").length).toBe(1);
	expect(item.find("ButtonLink").text()).toBe(`Upload new extract`);
	const link = item.find("ButtonLink");
	link.simulate("click", {});
});

/* Called componentWillUnmount */
test("Called componentWillUnmount", async () => {
	const item = shallow(<MyUploadsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	const spy = jest.spyOn(item.instance(), "componentWillUnmount");
	item.unmount();
	expect(spy).toHaveBeenCalled();
});

/** When data not found */
test("When Data not found", async () => {
	location.search = "?action=list&limit=10&offset=0&q_mine_only=1";
	async function customApi(endpoint, data) {
		mockResultGetAll.data = [];
		if (endpoint === "/public/asset-user-upload-get-all") {
			throw "Unknown error";
		}
		return api;
	}
	const item = shallow(<MyUploadsPage location={location} api={customApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	//we have add the filters
	await wait(50);
	item.update();
	expect(item.state().extracts).toEqual([]);
	expect(item.state().unfiltered_count).toEqual(0);
});

/** User click on download pdf link */
test("User click on download pdf link", async () => {
	window.URL.createObjectURL = jest.fn();
	window.navigator.msSaveOrOpenBlob = jest.fn();
	const item = shallow(<MyUploadsPage location={location} api={api} history={history} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.update();
	item.instance().doDownloadPdf("abc", "abc.pdf", { preventDefault: jest.fn() });
	mockXHR.onload();
	expect(mockXHR.send).toBeCalled();
	expect(mockXHR.open).toBeCalledWith("GET", "abc.pdf", true);
});
