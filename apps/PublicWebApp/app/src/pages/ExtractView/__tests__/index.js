// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import ExtractView from "../index";
import MockExtract from "../../../mocks/MockCopyManagementPage";
import MockUser from "../../../mocks/MockUser";
import MockExtractHighlightData from "../../../mocks/MockExtractHighlights";
import MockExtractNoteData from "../../../mocks/MockExtractNotes";

let match, location, history, mockUserData, mockExtractSearchResult, mockResult_ExtractPageJoin;
let mockExtractHighlightGetAllResult, mockExtractNoteGetAllResult;
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
jest.mock("../../../widgets/GenerateCopyRightImage", () => {
	return function () {
		return "https://dummyimage.com";
	};
});
jest.mock("../../../common/getHighQualityCopyrightFooterTextFromExtract", () => {
	return function () {
		return `s dude, Test School. Licence expires 31 July 2019.`;
	};
});
jest.mock("../../../assets/images/cover_img.png", () => true);

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	match = {
		params: {
			extractOid: "123",
		},
	};
	location = {
		search: "",
	};
	history = {
		push: jest.fn(),
	};
	mockUserData = MockUser[0];
	mockExtractSearchResult = {
		error: null,
		extracts: MockExtract.ExtractSearch.extracts,
	};
	mockExtractNoteGetAllResult = MockExtractNoteData;
	mockExtractHighlightGetAllResult = MockExtractHighlightData;
	mockResult_ExtractPageJoin = { result: [{ page: 0, first_highlight_name: "Mr. Admin", first_highlight_date: "2020-11-09T06:12:48.903Z" }] };
}

beforeEach(resetAll);
afterEach(resetAll);

/** default api method*/
async function defaultApi(endpoint, data) {
	if (endpoint === "/public/extract-view-one") {
		return {
			urls: ["http://mysite.com/1.png", "http://mysite.com/2.png", "http://mysite.com/3.png"],
		};
	}
	if (endpoint === "/public/extract-search") {
		return mockExtractSearchResult;
	}
	if (endpoint === "/public/extract-page-join-get-all") {
		return mockResult_ExtractPageJoin;
	}
	if (endpoint === "/public/extract-highlight-get-all") {
		return mockExtractHighlightGetAllResult;
	}
	if (endpoint === "/public/extract-note-get-all") {
		return mockExtractNoteGetAllResult;
	}
	throw new Error("should never be here");
}

/** User get message  like "Could not view extract .."*/
test('User get message  like "Could not view extract .."', async () => {
	match = {
		params: {
			extractOid: "123",
		},
	};
	async function api(endpoint, data) {
		if (endpoint === "/public/extract-view-one") {
			throw "Extract Share error";
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(<ExtractView match={match} location={location} api={api} />);
	await wait(50);
	item.update();

	expect(item.state().error).toEqual("Could not view extract. Are you sure you followed the link correctly?");
});

/** User get message  like "The link to this content has expired. .."*/
test('User get message  like "The link to this content has expired. .."', async () => {
	match = {
		params: {
			extractOid: "123",
		},
	};
	async function api(endpoint, data) {
		if (endpoint === "/public/extract-view-one") {
			throw "The link to this content has expired";
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(<ExtractView match={match} location={location} api={api} />);
	await wait(50);
	item.update();
	const errorMessge = item.state().error;

	expect(errorMessge.props.children[0]).toEqual("The link to this content has expired. If you made the copy, please regenerate the link");
});

/** User get unknown error message when fetching extract view URLs*/
test("User get unknown error message when fetching extract view URLs", async () => {
	match = {
		params: {
			extractOid: "123",
			shareOid: "589",
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/extract-view-one") {
			throw "Unknown error";
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<ExtractView match={match} location={location} api={api} />);
	await wait(50);
	item.update();

	expect(item.state().error).toEqual("Unknown error");
});

/** Show or hide the sidebar */
test("User clicks on sidebar and hide/show sidebar", async () => {
	match = {
		params: {
			extractOid: "123",
		},
	};

	const item = shallow(<ExtractView match={match} location={location} api={defaultApi} />);
	const mocksidebar = item.state().sidebar;

	item.instance().toggleSidebar();
	await wait(50);
	item.update();

	expect(item.state().sidebar).not.toBe(mocksidebar);
});

/** User get page for print */
test("User get page for print", async () => {
	match = {
		params: {
			extractOid: "1234",
		},
	};

	const item = shallow(<ExtractView match={match} location={location} api={defaultApi} />);

	const mockExtractPages = item.state().extractPages;
	await wait(100);
	item.update();
	item.instance().forceUpdate();

	item.instance().getPagesForPrint();
	await wait(50);
	item.update();

	expect(item.state().extractPages).not.toBe(mockExtractPages);
});

/** User cahnge the extractOid */
test("User change the extractOid", async () => {
	match = {
		params: {
			extractOid: "1234",
			shareOid: "589",
		},
	};

	const item = shallow(<ExtractView match={match} location={location} api={defaultApi} />);

	await wait(100);
	item.update();
	const mockExtractPages = item.state().extractPages;
	item.setProps({
		match: {
			params: {
				extractOid: "12345",
				shareOid: "58910",
			},
		},
	});

	await wait(50);
	item.update();

	expect(item.state().extractPages).not.toBe(mockExtractPages);
});

/** User cahnge the shareoid */
test("User cahnge the shareoid", async () => {
	match = {
		params: {
			extractOid: "1234",
			shareOid: "589",
		},
	};

	const item = shallow(<ExtractView match={match} location={location} api={defaultApi} />);

	await wait(100);
	item.update();
	const mockExtractPages = item.state().extractPages;
	item.setProps({
		match: {
			params: {
				extractOid: "1234",
				shareOid: "58910",
			},
		},
	});

	await wait(50);
	item.update();

	expect(item.state().extractPages).not.toBe(mockExtractPages);
});

/** User dont get page for print */
test("User dont get page for print", async () => {
	match = {
		params: {
			extractOid: "1234",
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/extract-view-one") {
			return {
				urls: [],
			};
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<ExtractView match={match} location={location} api={api} />);

	item.instance().getPagesForPrint();
	await wait(50);
	item.update();

	expect(item.state().extractPages.length).toBe(0);
});

/** User get copy text  */
test(`Get footer function called`, async () => {
	match = {
		params: {
			extractOid: "1234",
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/extract-view-one") {
			return {
				urls: [],
			};
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<ExtractView match={match} location={location} api={api} />);

	const spy = jest.spyOn(item.instance(), "getPageFooterText");
	await wait(20);
	item.update();
	item.instance().getPageFooterText();
	expect(spy).toHaveBeenCalled();
});

test(`Get footer text for page`, async () => {
	match = {
		params: {
			extractOid: "1234",
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/extract-view-one") {
			return {
				urls: [],
			};
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<ExtractView match={match} location={location} api={api} />);

	await wait(20);
	item.update();
	var result = item.instance().getPageFooterText();
	expect(result.indexOf("s dude, Test School. Licence expires 31 July 2019.") !== -1).toBe(true);
});

test(`Component renders correctly when user is viewers`, async () => {
	let getParams = Object.create(null);
	match = {
		params: {
			extractOid: "1234",
		},
	};

	async function api(endpoint, data) {
		getParams = data;
		return defaultApi(endpoint, data);
	}

	const item = shallow(<ExtractView match={match} location={location} api={api} />);

	await wait(20);
	item.update();

	let key = Object.keys(getParams);
	expect(key.length).toBe(2);
	expect(getParams).toHaveProperty("extract_oid");
});

test(`Component renders correctly when user is teacher/school-admin`, async () => {
	let getParams = Object.create(null);
	match = {
		params: {
			extractOid: "1234",
		},
	};

	async function api(endpoint, data) {
		getParams = data;
		return defaultApi(endpoint, data);
	}

	const item = shallow(<ExtractView match={match} location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	item.update();

	let key = Object.keys(getParams);
	expect(key.length).toBe(2);
	expect(getParams).toHaveProperty("extract_oid");
});

test(`Component renders correctly when user is teacher/school-admin`, async () => {
	mockExtractSearchResult.error = "requireaccesscode";
	const item = shallow(<ExtractView match={match} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(20);
	item.update();
	expect(item.find("ContentAccess").length).toBe(1);
});

test(`Test onChangeAccessCode method`, async () => {
	const item = shallow(<ExtractView match={match} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	item.instance().onChangeAccessCode();
	await wait(20);
	item.update();
	expect(item.state().access_code).toBe(null);
	expect(item.state().access_validation_message).toBe(null);

	item.instance().onChangeAccessCode("123456");
	await wait(20);
	item.update();
	expect(item.state().access_code).toBe("123456");
	expect(item.state().access_validation_message).toEqual("Please enter a five digit access code");

	item.instance().onChangeAccessCode("12345");
	await wait(20);
	item.update();
	expect(item.state().access_code).toBe("12345");
	expect(item.state().access_validation_message).toEqual(null);
});

test(`Test submitAccessCode method`, async () => {
	const item = shallow(<ExtractView match={match} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	item.setState({ access_code: null });
	item.instance().submitAccessCode();
	await wait(20);
	item.update();
	expect(item.state().access_validation_message).toEqual("Please enter a five digit access code");

	item.setState({ access_code: "12345" });
	item.instance().submitAccessCode();
	await wait(20);
	item.update();
	expect(item.state().access_code_error).toEqual(null);
});

test(`User click on Collapse and expand icons for show full Asset Title`, async () => {
	const item = shallow(<ExtractView match={match} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(20);
	item.update();

	item.instance().toggleWidth("");
	item.update();
	expect(item.state().isTitleFull).toBe(true);

	item.instance().toggleWidth("");
	item.update();
	expect(item.state().isTitleFull).toBe(false);
});

test(`User click on Collapse and expand icons for show full Asset Author information`, async () => {
	const item = shallow(<ExtractView match={match} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(20);
	item.update();

	item.instance().toggleWidth("author");
	item.update();
	expect(item.state().isAuthorFull).toBe(true);

	item.instance().toggleWidth("author");
	item.update();
	expect(item.state().isAuthorFull).toBe(false);
});

test(`User click on Collapse and expand icons for show full Asset Editor information`, async () => {
	const item = shallow(<ExtractView match={match} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(20);
	item.update();

	item.instance().toggleWidth("editor");
	item.update();
	expect(item.state().isEditorFull).toBe(true);

	item.instance().toggleWidth("editor");
	item.update();
	expect(item.state().isEditorFull).toBe(false);
});

test(`User click on Collapse and expand icons for show full Asset Editor information`, async () => {
	const item = shallow(<ExtractView match={match} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(20);
	item.update();

	item.instance().toggleWidth("publisher");
	item.update();
	expect(item.state().isPublisherFull).toBe(true);

	item.instance().toggleWidth("publisher");
	item.update();
	expect(item.state().isPublisherFull).toBe(false);
});

/* Test ImageLightBox Component */
test(`Test ImageLightBox opens Correctly`, async () => {
	const item = shallow(<ExtractView match={match} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	item.instance().onOpen();
	expect(item.state("isOpen")).toEqual(true);
	expect(item.find("ImageLightBox").length).toBe(1);
});

test(`Test ImageLightBox closes Correctly`, async () => {
	const item = shallow(<ExtractView match={match} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	item.instance().onClose();
	expect(item.state("isOpen")).toEqual(false);
	expect(item.find("ImageLightBox").length).toBe(0);
});

test("User bring note to the front ", async () => {
	const item = shallow(<ExtractView match={match} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	const oid = "1c9b2f8149f2293b32ac2009f02b1d165862";
	await wait(100);
	item.instance().setState({ photoIndex: 1 });
	item.instance().handleNoteSelection(oid);
	expect(item.state("selectedNoteOid").length).not.toBe(null);
	expect(item.state("pageNumberToNoteMap")).toEqual({
		1: [
			{
				colour: "#99f997",
				content: "",
				date_created: "2020-10-28T15:27:02.296Z",
				height: 100,
				oid: "1c9b2f8149f2293b32ac2009f02b1d165862",
				page: 1,
				position_x: 646,
				position_y: 702,
				width: 200,
				zindex: 1,
			},
		],
		2: [
			{
				colour: "#f18ef2",
				content: "",
				date_created: "2020-10-28T15:16:56.593Z",
				height: 100,
				oid: "d7cb38b0d80166b3c7f5134ceaae6e5e1ec6",
				page: 2,
				position_x: 198,
				position_y: 154,
				width: 200,
				zindex: 3,
			},
		],
	});
});

test("When user clicks on pdf page for full screen view", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};
	async function api(endpoint, data) {
		if (endpoint === "/public/extract-view-one") {
			return {
				asset: "https://occcladevstorage.blob.core.windows.net/public/Dickens_Carol.pdf",
				is_watermarked: false,
				urls: null,
			};
		}
		return defaultApi(endpoint, data);
	}
	const item = shallow(<ExtractView match={match} location={location} api={api} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(100);
	item.instance().onOpen();
	await wait(20);
	expect(item.state("isOpenUserUploadedAsset")).toEqual(true);
	expect(item.find("FullScreenReader").length).toBe(1);
});

test("Test onMovePrevRequest method", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};
	const prevIndex = 2;
	const item = shallow(<ExtractView match={match} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(100);
	item.instance().onMovePrevRequest(prevIndex);
	await wait(20);
	expect(item.state("photoIndex")).toEqual(2);
	expect(item.find("ImageLightBox").length).toBe(0);
});

test("Test onMoveNextRequest method", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};
	const nextIndex = 2;
	const item = shallow(<ExtractView match={match} location={location} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(100);
	item.instance().onMoveNextRequest(nextIndex);
	await wait(20);
	expect(item.state("photoIndex")).toEqual(2);
	expect(item.find("ImageLightBox").length).toBe(0);
});
