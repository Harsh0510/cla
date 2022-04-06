// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import UserUploadedExtractPage from "../index";
import USERDATA from "../../../mocks/MockUser";
import Header from "../../../widgets/Header";

const mockXHR = {
	open: jest.fn(),
	send: jest.fn(),
	onload: jest.fn(),
	readyState: 4,
	status: 200,
	setRequestHeader: (type, value) => {},
	ontimeout: (_) => {},
};

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAdminAuthRequiredConsumer", () => {
	return function (acceptedRoles, WrappedComponent) {
		if (!Object.keys(acceptedRoles).length == 2) {
			throw "It should be passed acceptedToles with a single key";
		}
		if (!acceptedRoles.hasOwnProperty("cla-admin")) {
			throw "It should be passed acceptedToles with a key: cla-admin";
		}
		return WrappedComponent;
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

let location, history, sortingA, sortingD, page, filters;
let mockUserExtractData;
let mockUserData;
let mockFilterResult;

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

async function defaultApi(endpoint, data) {
	// "UserPage" only queries this endpoint
	if (endpoint === "/admin/asset-user-upload-delete") {
		return {
			result: true,
		};
	}

	if (endpoint === "/admin/asset-user-upload-get-all") {
		return mockUserExtractData;
	}

	if (endpoint === "/admin/asset-user-upload-get-filters") {
		return mockFilterResult;
	}

	// This will be caught by the promise in the component
	throw new Error("should never be here");
}

function resetAll() {
	location = {
		search: "",
	};
	history = {
		push: jest.fn(),
	};
	sortingA = [{ direction: "asc", columnName: "user_name" }];
	sortingD = [{ direction: "desc", columnName: "user_name" }];
	mockUserData = USERDATA[0];
	mockUserExtractData = {
		data: [
			{
				id: 50,
				user_id: 61703,
				date_of_upload: "2022-03-07T05:44:58.098Z",
				page_range: [12, 13],
				filename: "9780307283672_9c0a9ed99b45d67985e43a080886f2ed41ea.pdf",
				file_size: 150642,
				copy_ratio: 0.01,
				first_name: "Ayushi",
				last_name: "Joshi",
				email: "ayushi@cla.com",
				school_id: 74803,
				isbn13: "9780307283672",
				title: "Some third title",
				publisher: "OUP",
				page_count: 200,
				school_name: "Euler Academy",
				copy_count: 1,
				pdf_url: "https://occcladevstorage.blob.core.windows.net/public/Dickens_Carol.pdf",
			},
		],
		unfiltered_count: 1,
	};
	mockFilterResult = {
		result: [
			{
				id: "flags",
				title: "Flags",
				data: [
					{
						id: "chapter",
						title: "Chapter",
					},
					{
						id: "over_5",
						title: "Over 5%",
					},
					{
						id: "incorrect_pdf_page_count",
						title: "Incorrect PDF page count",
					},
				],
			},
			{
				id: "institutions",
				title: "Institutions",
				data: [],
			},
		],
	};
	filters = {
		INSTITUTIONS: "institution",
		FLAGS: "flags",
		QUERY: "query",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders correctly", async () => {
	const item = shallow(<UserUploadedExtractPage location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

test("User click on sorting with ascending order", async () => {
	const item = shallow(
		<UserUploadedExtractPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	//ascending order
	item.instance().doSorting(sortingA);
	await wait(50);
	item.update();
	expect(item.state().offset).toBe(0);
});

test("User click on sorting for descending order", async () => {
	const item = shallow(
		<UserUploadedExtractPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	//decending order
	item.instance().doSorting(sortingD);
	expect(item.state().offset).toBe(0);
});

test("User click on pagination page", async () => {
	const item = shallow(
		<UserUploadedExtractPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	item.instance().doPagination(page, 5);
	await wait(50);
	item.update();
	const push = item.instance().props.history.push;
	const setOffset = (page - 1) * item.state().limit;
	let mockurl = "/profile/admin/user-uploaded-extracts?action=list&limit=5&offset=" + setOffset + "&query=&sort_dir=desc&sort_field=id";
	await wait(50);
	expect(push.mock.calls[0][0]).toEqual(mockurl);
});

test("User click on delete icon", async () => {
	let ID = "1";
	const item = shallow(
		<UserUploadedExtractPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);

	const attrs = { "data-id": ID };

	item.instance().doOpenDeleteConfirmationModal({ preventDefault: jest.fn(), currentTarget: { getAttribute: (name) => attrs[name], ...attrs } });
	const push = item.instance().props.history.push;
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(push.mock.calls[0][0]).toEqual(
		"/profile/admin/user-uploaded-extracts?action=delete&id=" +
			ID +
			"&limit=" +
			item.state().limit +
			"&offset=" +
			item.state().offset +
			"&query=&sort_dir=desc" +
			"&sort_field=" +
			item.state().sort_field
	);
	expect(item.find("ConfirmModal").length).toBe(1);
});

test("User click on delete icon and clicks on yes button", async () => {
	let ID = "1";
	const item = shallow(
		<UserUploadedExtractPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	const attrs = { "data-id": ID };
	item.instance().doOpenDeleteConfirmationModal({ preventDefault: jest.fn(), currentTarget: { getAttribute: (name) => attrs[name], ...attrs } });
	const push = item.instance().props.history.push;
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.find("ConfirmModal").length).toBe(1);
	item.instance().deleteUploadedExtract();
	await wait(50);
	item.update();
	expect(item.state().message).toEqual("Extract Deleted successfully.");
	expect(item.find("ConfirmModal").length).toBe(0);
});

test("User click on delete icon and clicks on no button", async () => {
	let ID = "1";
	const item = shallow(
		<UserUploadedExtractPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	const attrs = { "data-id": ID };
	item.instance().doOpenDeleteConfirmationModal({ preventDefault: jest.fn(), currentTarget: { getAttribute: (name) => attrs[name], ...attrs } });
	const push = item.instance().props.history.push;
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.find("ConfirmModal").length).toBe(1);
	item.instance().hideDeletePopUP();
	await wait(50);
	item.update();
	expect(item.state().isShowDeletePopUp).toEqual(false);
	expect(item.find("ConfirmModal").length).toBe(0);
});

test("User click on eye icon", async () => {
	const item = shallow(
		<UserUploadedExtractPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.update();
	item
		.instance()
		.doDownloadPdf(
			"9780307283672_9c0a9ed99b45d67985e43a080886f2ed41ea.pdf",
			"https://occcladevstorage.blob.core.windows.net/public/Dickens_Carol.pdf",
			{ preventDefault: () => {} }
		);
	await wait(50);
	item.update();
});

test("Called componentWillUnmount", async () => {
	const item = shallow(
		<UserUploadedExtractPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	item.instance()._isMounted = true;
	item.instance().componentWillUnmount();
	await wait(50);
	item.instance().deleteUploadedExtract();
	item.instance().updateState();
	expect(item.instance()._isMounted).toBe(undefined);
});

test("When unkown error found", async () => {
	location.search = "?action=list&limit=10&offset=0";
	async function customApi(endpoint, data) {
		mockUserExtractData.data = [];
		if (endpoint === "/admin/asset-user-upload-get-all") {
			throw "Unknown error";
		}
		if (endpoint === "/admin/asset-user-upload-get-filters") {
			return mockFilterResult;
		}
		return api;
	}
	const item = shallow(
		<UserUploadedExtractPage location={location} api={customApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.update();
	expect(item.state().unfilteredCount).toEqual(0);
});

test("When no data found", async () => {
	mockUserExtractData = [];
	const item = shallow(
		<UserUploadedExtractPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	//we have add the filters
	await wait(50);
	item.update();
	expect(item.state().unfilteredCount).toEqual(0);
});

test("When user changes the url manually", async () => {
	const item = shallow(
		<UserUploadedExtractPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	item.setProps({ location: { search: "action=list&limit=10&offset=0" } });
	await wait(50);
	item.update();
	expect(item.state().offset).toBe(0);
});

test("When user copies full chapter", async () => {
	mockUserExtractData.data[0].is_copying_full_chapter = true;
	const item = shallow(
		<UserUploadedExtractPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.update();
	expect(item.instance().state.rows[0].copy_limit).toEqual("Chapter");
});

test("When limit and offset is invalid", async () => {
	location.search = "?action=list&limit=-1&offset=-1";
	const item = shallow(
		<UserUploadedExtractPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.update();
	expect(item.instance().state.limit).toEqual(1);
	expect(item.instance().state.offset).toEqual(0);
});

test("When record is not deleted", async () => {
	async function customApi(endpoint, data) {
		if (endpoint === "/admin/asset-user-upload-delete") {
			return {
				result: false,
			};
		}

		if (endpoint === "/admin/asset-user-upload-get-all") {
			return mockUserExtractData;
		}
		if (endpoint === "/admin/asset-user-upload-get-filters") {
			return mockFilterResult;
		}
	}
	const item = shallow(
		<UserUploadedExtractPage location={location} api={customApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.update();
	item.instance().deleteUploadedExtract();
	await wait(50);
	item.update();
	expect(item.instance().state.message).toEqual("Error deleting extract.");
});

test("User filtering and load filter data", async () => {
	location.search = "?action=list&limit=2&offset=10";
	const item = shallow(
		<UserUploadedExtractPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.setProps({
		location: {
			search: "?action=list&filter_institutions=2&filter_flags=chapter&limit=5&offset=0&sort_dir=asc&sort_field=email",
		},
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().selected).toEqual({
		institutions: [2],
		flags: ["chapter"],
	});
});

test("User clears all filters", async () => {
	const item = shallow(
		<UserUploadedExtractPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	const spy = jest.spyOn(item.instance(), "pushHistory");
	item.instance().resetAll();
	expect(spy).toHaveBeenCalled();
	expect(item.state().query).toBe("");
});

test("User filtering only school filter", async () => {
	const item = shallow(
		<UserUploadedExtractPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.instance().handlefilterSelection([{ value: "2", label: "Another School" }], filters.INSTITUTIONS);
	await wait(20);
	item.update();
	item.instance().forceUpdate();

	item.instance().doSearch();
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	const push = item.instance().props.history.push;
	let query = push.mock.calls[0][0];
	expect(query.indexOf("&filter_institutions=`2`").length !== -1).toBe(true);
});

test("User filtering only school filter", async () => {
	const item = shallow(
		<UserUploadedExtractPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.instance().handlefilterSelection([{ value: "chapter", label: "Chapter" }], filters.FLAGS);
	await wait(20);
	item.update();
	item.instance().forceUpdate();

	item.instance().doSearch();
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	const push = item.instance().props.history.push;
	let query = push.mock.calls[0][0];
	expect(query.indexOf("&filter_flags=`chapter`").length !== -1).toBe(true);
});

test("User search with any query", async () => {
	const item = shallow(
		<UserUploadedExtractPage location={location} api={defaultApi} history={history} withAuthConsumer_myUserDetails={mockUserData} />
	);
	await wait(50);
	item.instance().handlefilterSelection("test", filters.QUERY);
	await wait(20);
	item.update();
	item.instance().forceUpdate();

	item.instance().doSearch();
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	const push = item.instance().props.history.push;
	let query = push.mock.calls[0][0];
	expect(query.indexOf("&query=`test`").length !== -1).toBe(true);
});
