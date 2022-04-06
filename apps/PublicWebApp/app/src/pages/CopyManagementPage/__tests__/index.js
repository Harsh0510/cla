// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import CopyManagementPage from "../index";
import Presentation from "../Presentation";
import MockUserData from "../../../mocks/MockUser";
import MockData from "../../../mocks/MockCopyManagementPage";
import MockExtractNoteData from "../../../mocks/MockExtractNotes";
import MockExtractHighlightData from "../../../mocks/MockExtractHighlights";
import theme from "../../../common/theme";
import getUrl from "../../../common/getUrl";

let location,
	mockUserData,
	match,
	history,
	mockResultFlyOutIndex,
	mockResultFlyOutUpdate,
	mockExtractNoteGetAllResult,
	mockExtractHighlightGetAllResult,
	mockResult_ExtractPageJoin,
	mockExtractNote,
	mockExtractHighlight,
	mockExtractNoteCreateResult,
	mockFunction,
	shouldUpdateNote,
	mockWidth,
	mockHeight,
	mockLeft,
	mockTop;
let mockResult_ExtractViewSearch = MockData.ExtractViewSearch;
let mockResult_ExtractSearch = MockData.ExtractSearch;
let mockResult_ExtractGetShareLinks = MockData.ExtractGetShareLinks;
let mockExtractFavoriteResult;
/**
 * This 'HOC' does nothing but 'pass through' the provided component,
 * so it's not necessary to 'dive()' into rendered results,
 * and so it's possible to mock the 'api' function.
 **/
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}
jest.mock("../../../common/withPageSize", () => mockPassthruHoc);
jest.mock("../../../common/withAuthRequiredConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
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

jest.mock("../../../common/googleEvent", () => {
	return jest.fn();
});
/**wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

jest.mock("../../../common/customSetTimeout", () => {
	return function (method, time) {
		setTimeout(method, 100);
	};
});
jest.mock("../../../assets/images/cover_img.png", () => true);

function resetAll() {
	mockFunction = jest.fn();
	mockWidth = 50;
	mockHeight = 50;
	mockLeft = 30;
	mockTop = 30;
	location = {
		search: {
			highlighted: 1,
			shareOid: 1,
		},
	};
	history = {
		push: jest.fn(),
	};
	mockUserData = MockUserData[0];
	mockUserData.flyout_enabled = false;
	match = {
		params: {
			copyOid: "",
			isbn: "",
		},
	};
	mockResultFlyOutIndex = { result: -1 };
	mockResultFlyOutUpdate = { result: true };
	mockExtractNoteGetAllResult = MockExtractNoteData;
	mockExtractHighlightGetAllResult = MockExtractHighlightData;
	mockExtractNote = {
		result: [
			{
				oid: "1c9b2f8149f2293b32ac2009f02b1d165862",
				colour: "#99f997",
				position_x: 646,
				position_y: 702,
				width: 200,
				height: 100,
				content: "",
				page: 1,
				zindex: 1,
				date_created: "2020-10-28T15:27:02.296Z",
			},
			{
				oid: "1c9b2f8149f2293b32ac2009f02b1d165863",
				colour: "#99f997",
				position_x: 646,
				position_y: 702,
				width: 200,
				height: 100,
				content: "",
				page: 1,
				zindex: 2,
				date_created: "2020-10-28T15:27:02.296Z",
			},
			{
				oid: "1c9b2f8149f2293b32ac2009f02b1d165864",
				colour: "#99f997",
				position_x: 646,
				position_y: 702,
				width: 200,
				height: 100,
				content: "",
				page: 1,
				zindex: 3,
				date_created: "2020-10-28T15:27:02.296Z",
			},
		],
		result_extract_page_join: [],
	};
	mockExtractHighlight = {
		result: [
			{
				oid: "2e9b2f8149f2293b32ac2009f02b1d165862",
				colour: "#99f997",
				position_x: 146,
				position_y: 302,
				width: 100,
				height: 300,
				page: 1,
				date_created: "2020-10-28T15:27:02.296Z",
			},
		],
		result_extract_page_join: [
			{
				extract_id: 552,
				first_highlight_name: `concat_ws('', cla_user.title, '. ', cla_user.last_name)`,
				first_highlight_date: "2020-11-05 13:35:29.511559+00",
				page: 2,
			},
		],
	};
	mockResult_ExtractPageJoin = { result: [{ page: 1, first_highlight_name: "Mr. Admin", first_highlight_date: "2020-11-09T06:12:48.903Z" }] };
	shouldUpdateNote = mockFunction;
	mockExtractNoteCreateResult = {
		result: [
			{
				oid: "3453",
			},
		],
	};
	mockExtractFavoriteResult = { success: true };
}

/** Default API */
async function defaultApi(endpoint, data) {
	// extract-view-one endpoint
	endpoint = endpoint.replace(/\s+/g, " ");
	if (endpoint === "/public/extract-view-one") {
		return mockResult_ExtractViewSearch;
	}

	//extract-search endpoint
	if (endpoint === "/public/extract-search") {
		if (data != "") {
			return mockResult_ExtractSearch;
		}
	}

	//extract-page-join-get-all endpoint
	if (endpoint === "/public/extract-page-join-get-all") {
		return mockResult_ExtractPageJoin;
	}

	//extract-highlight-get-all endpoint
	if (endpoint === "/public/extract-highlight-get-all") {
		return mockExtractHighlightGetAllResult;
	}

	//extract-note-create endpoint
	if (endpoint === "/public/extract-note-create") {
		return mockExtractNote;
	}

	//extract-highlight-create endpoint
	if (endpoint === "/public/extract-highlight-create") {
		return mockExtractHighlight;
	}

	//extract-note-delete endpoint
	if (endpoint === "/public/extract-note-delete") {
		return;
	}

	//extract-note-delete endpoint
	if (endpoint === "/public/extract-note-update") {
		return mockExtractNote;
	}

	//extract-get-share-links endpoint
	if (endpoint === "/public/extract-get-share-links") {
		if (data != "") {
			return mockResult_ExtractGetShareLinks;
		}
	}

	//extract-share-add endpoint
	if (endpoint === "/public/extract-share-add") {
		if (data != "") {
			return true;
		}
	}

	//extract-share-deactivate endpoint
	if (endpoint === "/public/extract-share-deactivate") {
		if (data != "") {
			return true;
		}
	}

	//extract-title-update endpoint
	if (endpoint === "/public/extract-title-update") {
		return { result: true };
	}

	if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
		return mockResultFlyOutIndex;
	}

	if (endpoint === "/public/first-time-user-experience-update") {
		return mockResultFlyOutUpdate;
	}

	// reset access-code
	if (endpoint === "/public/extract-share-reset-accesscode") {
		return {
			oid: "b7552caa7885bd46beb424c95977c2159cc1",
		};
	}

	//public/extract-note-get-all"
	if (endpoint === "/public/extract-note-get-all") {
		return mockExtractNoteGetAllResult;
	}
	///public/extract-note-create"
	if (endpoint === "/public/extract-note-create") {
		return mockExtractNoteCreateResult;
	}
	if (endpoint === "/public/extract-favorite") {
		return mockExtractFavoriteResult;
	}

	if (endpoint === "/public/extract-highlight-delete") {
		return { result: true };
	}

	// This will be caught by the promise in the component
	throw new Error("should never be here");
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	location.search = "highlighted=1&shareOid=";
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().componentWillUnmount();
	await wait(100);
	expect(item.containsMatchingElement(<Presentation />)).toBe(true);
});

test("Component renders correctly with flyOutIndex -1", async () => {
	location.search = "highlighted=1&shareOid=";
	mockUserData.flyout_enabled = true;
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(100);

	expect(item.containsMatchingElement(<Presentation />)).toBe(true);
	expect(item.state("flyOutIndex")).toBe(-1);
});

/** User get error while loading the Page */
test("User get error Extract Not Found while loading the Page", async () => {
	location.search = "highlighted=1&shareOid=";
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};
	mockUserData.role = "teacher";
	async function api(endpoint, data) {
		if (endpoint === "/public/extract-view-one") {
			throw "Extract not found";
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<CopyManagementPage location={location} match={match} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(100);
	expect(item.state().error).toEqual("Extract not found");
});

/** User get error Could not view extract. while loading the Page */
test("User get error Could not view extract. while loading the Page", async () => {
	location.search = "";
	match = {
		params: {
			isbn: "",
			copyOid: "",
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/extract-view-one") {
			throw " Extract Share ";
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<CopyManagementPage location={location} match={match} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(100);
	expect(item.state().error).toEqual("Could not view extract. Are you sure you followed the link correctly?");
});

/** User get error Could not view extract. while loading the Page */
test("User get error Could not view extract. while loading the Page", async () => {
	location.search = "";
	match = {
		params: {
			isbn: "",
			copyOid: "",
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/extract-view-one") {
			throw " Extract Share ";
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<CopyManagementPage location={location} match={match} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(100);
	expect(item.state().error).toEqual("Could not view extract. Are you sure you followed the link correctly?");
});

/** User click on Create-link (GetShareLink)*/
test("User click on Create-link (GetShareLink)", async () => {
	location.search = "highlighted=1&shareOid=";
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	item.instance().getShareLink({ preventDefault: jest.fn() });
	await wait(20);
	expect(item.state().isLinkShare).toBe(true);
	expect(item.containsMatchingElement(<Presentation />)).toBe(true);
});

test("User click on Create-link (GetShareLink) When flyOutIndex is 0 ", async () => {
	location.search = "highlighted=1&shareOid=";
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	item.setState({ flyOutIndex: 0 });
	await wait(20);
	item.instance().getShareLink({ preventDefault: jest.fn() });
	await wait(20);
	expect(item.state().isLinkShare).toBe(true);
	expect(item.containsMatchingElement(<Presentation />)).toBe(true);
	expect(item.state("isOpen")).toEqual(false);
	expect(item.state("photoIndex")).toEqual(0);
});

/** User click on "Deactivate" icon  (GetShareLink)*/
test('User click on "Deactivate" icon ', async () => {
	location.search = "highlighted=1&shareOid=";
	mockUserData.flyout_enabled = true;
	mockResultFlyOutIndex = { result: 0 };
	match = {
		params: {
			isbn: "9780007505500",
			copyOid: "8d682994b557517e9d652ad0e5cc13050e5c",
		},
	};

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(20);

	item.instance().deactivateShare();
	expect(item.containsMatchingElement(<Presentation />)).toBe(true);
	expect(item.state("flyOutIndex")).toBe(0);
});

/** User change shareOid*/
test("User change shareOid", async () => {
	location.search = "highlighted=1&shareOid=bfad28ec4d31736fc7a7f83c942ab2e71dd3";
	match = {
		params: {
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	match = {
		params: {
			copyOid: "8d682994b557517e9d652ad0e5cc13050e5c",
		},
	};
	item.setProps({ match: match });
	item.instance().deactivateShare();
	expect(item.containsMatchingElement(<Presentation />)).toBe(true);
});

/** User change location search*/
test("User change location search", async () => {
	location = {
		search: "?highlighted=1&shareOid=bfad28ec4d31736fc7a7f83c942ab2e71dd3",
	};
	match = {
		params: {
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	item.setProps({ location: { search: "?highlighted=2&shareOid=5bbcd418eeae1ed175a1d886be1bb983ecd3" } });

	await wait(20);
	expect(item.state().highlighted).toBe("2");
});

/** User click on full view screen icon*/
test("User click on full view screen icon", async () => {
	location = {
		search: "?highlighted=1&shareOid=bfad28ec4d31736fc7a7f83c942ab2e71dd3",
	};
	match = {
		params: {
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	let mocksidebar = item.state().sidebar;
	await wait(20);
	item.instance().toggleSidebar();
	expect(item.state().sidebar).not.toBe(mocksidebar);

	mocksidebar = item.state().sidebar;
	await wait(20);
	item.instance().toggleSidebar();
	expect(item.state().sidebar).not.toBe(mocksidebar);
});

/** User click on Print this copy*/
test("User click on Print this copy", async () => {
	location = {
		search: "?highlighted=1&shareOid=bfad28ec4d31736fc7a7f83c942ab2e71dd3",
	};
	match = {
		params: {
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	item.instance().getPagesForPrint();
	expect(item.state().extractPages.length).toBe(3);
});

/** User click on Print this copy and not getting the data*/
test("User click on Print this copy and not getting the data", async () => {
	location = {
		search: "?highlighted=1&shareOid=bfad28ec4d31736fc7a7f83c942ab2e71dd3",
	};
	match = {
		params: {
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/extract-view-one") {
			return { urls: [] };
		} else {
			return defaultApi(endpoint, data);
		}
	}

	const item = shallow(<CopyManagementPage location={location} match={match} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	item.instance().getPagesForPrint();

	await wait(20);
	expect(item.state().extractPages.length).toBe(0);
});

/** User get copy text  */
test(`Get footer function called`, async () => {
	location = {
		search: "?highlighted=1&shareOid=bfad28ec4d31736fc7a7f83c942ab2e71dd3",
	};
	match = {
		params: {
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/extract-view-one") {
			return { urls: [] };
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<CopyManagementPage location={location} match={match} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	const spy = jest.spyOn(item.instance(), "getPageFooterText");
	await wait(20);

	item.instance().getPageFooterText();
	expect(spy).toHaveBeenCalled();
});

test(`Get footer text for page with school name`, async () => {
	location = {
		search: "?highlighted=1&shareOid=bfad28ec4d31736fc7a7f83c942ab2e71dd3",
	};
	match = {
		params: {
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/extract-view-one") {
			return { urls: [] };
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);

	var result = item.instance().getPageFooterText();
	expect(result.indexOf("s dude, Test School. Licence expires 31 July 2019.") !== -1).toBe(true);
});

test(`Get footer text for page without school`, async () => {
	location = {
		search: "?highlighted=1&shareOid=8d682994b557517e9d652ad0e5cc13050e5c",
	};
	match = {
		params: {
			copyOid: "8d682994b557517e9d652ad0e5cc13050e5c",
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/extract-view-one") {
			return { urls: [] };
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);

	var result = item.instance().getPageFooterText();
	expect(result.indexOf("s dude, Test School. Licence expires 31 July 2019.") !== -1).toBe(true);
});

test("User click on Print this copy and get image binded with copytext image", async () => {
	location = {
		search: "?highlighted=1&shareOid=bfad28ec4d31736fc7a7f83c942ab2e71dd3",
	};
	match = {
		params: {
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	let result = item.instance().getPagesForPrint();
	expect(result[0].props.children.props.children.length).toBe(2);
	expect(result[0].props.children.props.children[1].props.src).toBe("https://dummyimage.com");
});

/**User getting the congratulations message when landing on extract page after creating the extract */
test("User getting the congratulations message and click on close icon", async () => {
	location.search = "highlighted=1&action=created&shareOid=";
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	expect(item.state().action).toEqual("created");
	item.instance().hideNewCopyMessage();

	await wait(20);
	expect(item.state().action).toEqual(null);
});

/**User click on expand icon for view book more information */
test("User click on expand icon for view book more information", async () => {
	location.search = "highlighted=1&action=created&shareOid=";
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	expect(item.state().isShowBookInfo).toEqual(false);
	item.instance().handleEvents({ preventDefault: jest.fn() }, "BookCopyContent");
	expect(item.state().isShowBookInfo).toEqual(true);

	item.instance().handleEvents({ preventDefault: jest.fn() }, "BookCopyContent");
	expect(item.state().isShowBookInfo).toEqual(false);
});

/**User click on expand icon for view book more information */
test("User click on expand icon for view book more information", async () => {
	location.search = "highlighted=1&action=created&shareOid=";
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	expect(item.state().isShowBookInfo).toEqual(false);
	item.instance().handleEvents({ preventDefault: jest.fn() }, "BookCopyContent");
	expect(item.state().isShowBookInfo).toEqual(true);

	item.instance().handleEvents({ preventDefault: jest.fn() }, "BookCopyContent");
	expect(item.state().isShowBookInfo).toEqual(false);
});

/** User edit the extract title successfully */
test("User edit the extract title successfully", async () => {
	location.search = "highlighted=1&action=created&shareOid=";
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	expect(item.state().isCopyTitleEditable).toEqual(false);

	//When user click on edit
	item.instance().isDisplayCopyTitleEditable({ preventDefault: jest.fn() });
	expect(item.state().isCopyTitleEditable).toEqual(true);

	//when user click on enter for update the title
	item.instance().submitCopyTitleEditable({ preventDefault: jest.fn() }, "Test Title");
	await wait(20);
	expect(item.state().isCopyTitleEditable).toEqual(false);
});

/** User can not update the extract title */
test("User can not update the extract title", async () => {
	location.search = "highlighted=1&action=created&shareOid=";
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/extract-title-update") {
			return { result: false };
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<CopyManagementPage location={location} match={match} api={api} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	expect(item.state().isCopyTitleEditable).toEqual(false);

	//When user click on edit
	item.instance().isDisplayCopyTitleEditable({ preventDefault: jest.fn() });
	expect(item.state().isCopyTitleEditable).toEqual(true);

	//when user click on enter for update the title
	item.instance().submitCopyTitleEditable({ preventDefault: jest.fn() }, "Test Title");
	await wait(20);
	expect(item.state().isCopyTitleEditable).toEqual(true);
});

/** User trying to print the copy using ctrl+p */
test("User trying to print the copy using ctrl+p", async () => {
	location.search = "highlighted=1&action=created&shareOid=";
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	//When user click on edit
	let e = {
		ctrlKey: true,
		metaKey: true,
		key: "p",
		cancelBubble: false,
		preventDefault: jest.fn(),
		stopImmediatePropagation: jest.fn(),
		stopPropagation: jest.fn(),
	};
	item.instance().handleKeyDown(e);
	expect(e.cancelBubble).toEqual(true);

	let e1 = {
		ctrlKey: false,
		metaKey: false,
		key: "q",
		cancelBubble: false,
		preventDefault: jest.fn(),
		stopImmediatePropagation: jest.fn(),
		stopPropagation: jest.fn(),
	};
	item.instance().handleKeyDown(e1);
	expect(e1.cancelBubble).toEqual(false);
	item.instance().toggleWidth("author");
	expect(item.state().isAuthorFull).toBe(true);
	item.instance().toggleWidth("editor");
	expect(item.state().isEditorFull).toBe(true);
	item.instance().toggleWidth("publisher");
	expect(item.state().isPublisherFull).toBe(true);
	item.instance().toggleWidth("title");
	expect(item.state().isTitleFull).toBe(true);

	let e2 = {
		ctrlKey: false,
		metaKey: true,
		key: "q",
		charCode: 18,
		keyCode: 17,
		cancelBubble: false,
		preventDefault: jest.fn(),
		stopImmediatePropagation: jest.fn(),
		stopPropagation: jest.fn(),
	};
	item.instance().handleKeyDown(e2);
	expect(e.cancelBubble).toEqual(true);
	expect(e.stopImmediatePropagation).toHaveBeenCalled();
});

/* Test ImageLightBox */
test("Test onOpen method and to display ImageLightBox", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(100);
	item.instance().onOpen();
	await wait(20);
	expect(item.state("isOpen")).toEqual(true);
	expect(item.find("ImageLightBox").length).toBe(1);
});

test("Test onClose method and to hide ImageLightBox", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(100);
	item.instance().onClose();
	await wait(20);
	expect(item.state("isOpen")).toEqual(false);
	expect(item.find("ImageLightBox").length).toBe(0);
});

test("Test onMovePrevRequest method and to  move prev button event from lightbox", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};
	const prevIndex = 2;
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(100);
	item.instance().onMovePrevRequest(prevIndex);
	await wait(20);
	expect(item.state("photoIndex")).toEqual(2);
	expect(item.find("ImageLightBox").length).toBe(0);
});

test("Test onMoveNextRequest method and to  move next button event from lightbox", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};
	const nextIndex = 2;
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(100);
	item.instance().onMoveNextRequest(nextIndex);
	await wait(20);
	expect(item.state("photoIndex")).toEqual(2);
	expect(item.find("ImageLightBox").length).toBe(0);
});

test("Test onNoteSelect method and to handle change event of Add note dropdown", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};
	const option = { key: "#option1", text: "Yellow", value: theme.colours.noteYellow, toolTip: "Add a yellow note", colour: theme.colours.noteYellow };
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(100);
	item.instance().onNoteSelect(option);
	await wait(20);
	expect(item.state("selectedNote")).toEqual(option);
	expect(item.find("ImageLightBox").length).toBe(0);
});

test("Test handleNoteClick method and to Get extract noted by extract oid (copy oid)", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(100);
	const option = {
		value: {
			oid: "1c9b2f8149f2293b32ac2009f02b1d165862",
			colour: "#99f997",
			position_x: 646,
			position_y: 702,
			width: 200,
			height: 100,
			content: "",
			page: 1,
			zindex: 4,
			date_created: "2020-10-28T15:27:02.296Z",
		},
	};
	item.instance().onNoteSelect(option);
	expect(item.state("selectedNote").length).not.toBe(null);
	item.instance().handleNoteClick({ stopPropagation: jest.fn(), target: { tagName: "IMG" }, currentTarget: { tagName: "IMG" } });
	await wait(20);
	// expect(item.state("selectedNote")).toEqual(option);
	expect(item.find("ImageLightBox").length).toBe(0);
});

/* test setStateForLinkShare method */
test("Test setStateForLinkSharee method", async () => {
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(100);
	item.instance().setStateForLinkShare();
	expect(item.state("isLinkShare")).toEqual(false);
});

/* test setStateForDeactivateLink method */
test("Test setStateForDeactivateLink method", async () => {
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(100);
	item.instance().setStateForDeactivateLink("bfad28ec4d31736fc7a7f83c942ab2e71dd3");
	expect(item.state("deactivateLinkId")).toEqual("bfad28ec4d31736fc7a7f83c942ab2e71dd3");
});

/* test resetAccessCode method */
test("Test when user clicks to reset access-code", async () => {
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	item.instance().resetAccessCode("b7552caa7885bd46beb424c95977c2159cc1");
	await wait(100);
	expect(item.state().shareLinks2).not.toEqual([]);
});

test("User seen the watermark image with copyright text when click on print", async () => {
	mockResult_ExtractViewSearch = {
		is_watermarked: true,
		urls: ["dummyimage.com/image1.png"],
	};
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(100);
	const pages = item.instance().getPagesForPrint();
	expect(pages.length).toBe(1);
});

test("User seen the blank page when click on print", async () => {
	mockResult_ExtractViewSearch = {
		is_watermarked: true,
		urls: ["dummyimage.com/image1.png", null],
	};
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(100);
	const pages = item.instance().getPagesForPrint();
	expect(pages.length).toBe(1);
});

test("update notification count", async () => {
	mockResult_ExtractViewSearch = {
		is_watermarked: true,
		urls: ["dummyimage.com/image1.png"],
	};
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(100);
	const pages = item.instance().setNotificationCount(10);
	await wait(50);
	expect(item.state().notificationCount).toBe(10);
});

test("Test handleNoteClick method and to create new notes", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(100);
	const option = {
		value: {
			oid: "1c9b2f8149f2293b32ac2009f02b1d165862",
			colour: "#99f997",
			position_x: 646,
			position_y: 702,
			width: 200,
			height: 100,
			content: "",
			page: 1,
			zindex: 4,
			date_created: "2020-10-28T15:27:02.296Z",
		},
	};
	item.instance().onNoteSelect(option);
	expect(item.state("selectedNote").length).not.toBe(null);
	item
		.instance()
		.handleNoteClick({ target: { tagName: "SelectNoteDropDown" }, currentTarget: { tagName: "SelectNoteDropDown" }, stopPropagation: jest.fn() });
	expect(item.state("selectedNote").length).not.toBe(null);
	expect(item.state("pageNumberToNoteMap").length).not.toBe(null);
});

test("Test handleNoteContentChange method and to update notes on change", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(100);
	item.instance().getExtractAllNotes();
	expect(item.state("pageNumberToNoteMap").length).not.toBe(null);
	const oid = "1c9b2f8149f2293b32ac2009f02b1d165862";
	const content = "My First Note";
	const option = { key: "#option1", text: "Yellow", value: theme.colours.noteYellow, toolTip: "Add a yellow note", colour: theme.colours.noteYellow };
	item.instance().onNoteSelect(option);
	item.instance().handleNoteContentChange(oid, content);
	expect(item.state("pageNumberToNoteMap").length).not.toBe(null);
});

test("Test handleNoteClose method and to delete notes on cllick on close icon", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(100);
	const oid = "1c9b2f8149f2293b32ac2009f02b1d165862";
	const option = { key: "#option1", text: "Yellow", value: theme.colours.noteYellow, toolTip: "Add a yellow note", colour: theme.colours.noteYellow };
	item.instance().onNoteSelect(option);
	item.instance().handleNoteClose({ preventDefault: jest.fn(), cancelBubble: jest.fn(), stopPropagation: jest.fn() }, oid);
	expect(item.state("pageNumberToNoteMap").length).not.toBe(null);
});

test("Test handleNoteOnMoveOrResize method and to move notes or resize notes", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(100);
	const oid = "1c9b2f8149f2293b32ac2009f02b1d165862";
	const option = { key: "#option1", text: "Yellow", value: theme.colours.noteYellow, toolTip: "Add a yellow note", colour: theme.colours.noteYellow };
	item.instance().onNoteSelect(option);
	item.instance().handleNoteOnMoveOrResize(oid, mockWidth, mockHeight, mockLeft, mockTop);
	expect(item.state("pageNumberToNoteMap").length).not.toBe(null);
});

test("Test handleNoteOnMoveOrResize method when user didnot select note", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(100);
	const oid = "1c9b2f8149f2293b32ac2009f02b1d165862";
	item.instance().handleNoteOnMoveOrResize(oid, mockWidth, mockHeight, mockLeft, mockTop);
	expect(item.state("pageNumberToNoteMap").length).not.toBe(null);
});

test("When user didnot able to create note", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(100);
	const option = null;
	item.instance().onNoteSelect(option);
	expect(item.state("selectedNote")).toBe(null);
	item.setState({ copiesData: null });
	item.setState({ photoIndex: null });
	item.instance().getExtractAllNotes();
	item.setState({ pageNumberToNoteMap: null });
	item.instance().handleNoteClick({
		target: { tagName: "SelectNoteDropDown" },
		currentTarget: { tagName: "SelectHighlightDropDown" },
		stopPropagation: jest.fn(),
	});
	expect(item.state("copiesData")).toBe(null);
});

test("When user not able to update notes on change", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(100);
	const oid = "1c9b2f8149f2293b32ac2009f02b1d165862";
	const content = "My First Note";
	item.instance().getExtractAllNotes();
	item.setState({ pageNumberToNoteMap: null });
	item.setState({ copiesData: null });
	item.setState({ photoIndex: null });
	item.instance().handleNoteContentChange(oid, content);
	expect(item.state("pageNumberToNoteMap")).toBe(null);
});

test("Test handleNoteContentChange method and to update notes on change", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(100);
	item.instance().getExtractAllNotes();
	expect(item.state("pageNumberToNoteMap").length).not.toBe(null);
	const oid = "1c9b2f8149f2293b32ac2009f02b1d165862";
	const content = "My First Note";
	const option = { key: "#option1", text: "Yellow", value: theme.colours.noteYellow, toolTip: "Add a yellow note", colour: theme.colours.noteYellow };
	item.instance().onNoteSelect(option);
	item.setState({ selectedNoteOid: "1c9b2f8149f2293b32ac2009f02b1d165862" });
	item.instance().handleNoteContentChange(oid, content);
	expect(item.state("pageNumberToNoteMap").length).not.toBe(null);
});

test("Test onHighlightDraw method and to create new highlight", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(100);
	const option = {
		value: {
			oid: "1c9b2f8149f2293b32ac2009f02b1d165862",
			colour: "#99f997",
			position_x: 646,
			position_y: 702,
			width: 200,
			height: 100,
			page: 1,
			date_created: "2020-10-28T15:27:02.296Z",
		},
	};
	item.instance().onHighlightSelect(option);
	expect(item.state("selectedHighlight").length).not.toBe(null);
	await wait(20);
	item.instance().onHighlightDraw(mockWidth, mockHeight, mockLeft, mockTop);
	expect(item.state("selectedHighlight").length).not.toBe(null);
	expect(item.state("pageNumberToHighlightMap").length).not.toBe(null);
});

test("When user add extract to favorite list", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	item.setState({ copiesData: mockResult_ExtractSearch.extracts });
	item.instance().doToggleFavorite();
	expect(item.state("copiesData").length).not.toBe(null);
});

test("When user add extract to favorite list but didnot have copiesData", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	item.setState({ copiesData: null });
	item.instance().doToggleFavorite();
	expect(item.state("copiesData")).toBe(null);
});

test("When user move to another page", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd2",
		},
	};

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	item.setState({ copiesData: mockResult_ExtractSearch.extracts });
	item.instance().componentWillUnmount();
	item.instance().doToggleFavorite();
	expect(item.state("copiesData")).not.toBe(null);
});

test("When copiesData is not provided", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	item.setState({ copiesData: null });
	item.instance().componentWillUnmount();
	item.instance()._doNoteUpdates();
	expect(item.state("copiesData")).toBe(null);
});

test("User select the note overlape note ", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "d7cb38b0d80166b3c7f5134ceaae6e5e1ec6",
		},
	};

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	const oid = "d7cb38b0d80166b3c7f5134ceaae6e5e1ec6";
	await wait(100);
	item.instance().setState({ photoIndex: 1 });
	item.instance().handleNoteSelection(oid);
	expect(item.state("selectedNoteOid").length).not.toBe(null);
});

test("User bring note to the front ", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	const oid = "1c9b2f8149f2293b32ac2009f02b1d165862";
	await wait(100);
	item.instance().setState({ photoIndex: 0 });
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

test("When user deletes highlight ", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	const option = {
		value: {
			oid: "1c9b2f8149f2293b32ac2009f02b1d165862",
			colour: "#99f997",
			position_x: 646,
			position_y: 702,
			width: 200,
			height: 100,
			page: 1,
			date_created: "2020-10-28T15:27:02.296Z",
		},
	};
	item.instance().onHighlightSelect(option);
	const oid = "bfad28ec4d31736fc7a7f83c942ab2e71dd3";
	item.setState({ copiesData: mockResult_ExtractSearch.extracts });
	item.setState({ selectedHighlight: { value: "Delete" } });
	await wait(20);
	item.instance().shouldUpdateNote(option);
	item.instance().handleHiglightDelete(oid);
	expect(item.state("pageNumberToHighlightMap").length).not.toBe(null);
	expect(item.state("pageNumberToHighlightPageJoinMap").length).not.toBe(null);
});

test("User see mobile view popup when click on mobile icon", async () => {
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	let isPopupOpen = false;
	window.open = (arg1, arg2, arg3) => {
		isPopupOpen = true;
	};
	item.instance().showViewModal({ preventDefault: jest.fn(), target: { className: "fas fa-mobile-alt" } });
	expect(isPopupOpen).toEqual(true);
});

test("User see tablet view popup when click on tablet icon", async () => {
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	let isPopupOpen = false;
	window.open = (arg1, arg2, arg3) => {
		isPopupOpen = true;
	};
	item.instance().showViewModal({ preventDefault: jest.fn(), target: { className: "fas fa-tablet-alt" } });
	expect(isPopupOpen).toEqual(true);
});

test("Test handleNoteClose method and to delete notes on press ctrl+delete", async () => {
	location.search = "highlighted=1&action=created&shareOid=";
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};

	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);

	await wait(20);
	//When user click on edit
	let e = {
		ctrlKey: true,
		metaKey: true,
		key: "Delete",
		cancelBubble: false,
		preventDefault: jest.fn(),
		stopImmediatePropagation: jest.fn(),
		stopPropagation: jest.fn(),
		target: { id: "abc" },
	};
	item.setState({ selectedNoteOid: 1 });
	item.instance().handleKeyDown(e);
	expect(e.cancelBubble).toEqual(true);
	expect(item.state("pageNumberToNoteMap").length).not.toBe(null);

	let e1 = {
		ctrlKey: false,
		metaKey: false,
		key: "Delete",
		cancelBubble: false,
		preventDefault: jest.fn(),
		stopImmediatePropagation: jest.fn(),
		stopPropagation: jest.fn(),
		target: { id: "abc" },
	};
	item.instance().handleKeyDown(e1);
	expect(e1.cancelBubble).toEqual(true);
	item.instance().toggleWidth("author");
	expect(item.state().isAuthorFull).toBe(true);
	item.instance().toggleWidth("editor");
	expect(item.state().isEditorFull).toBe(true);
	item.instance().toggleWidth("publisher");
	expect(item.state().isPublisherFull).toBe(true);
	item.instance().toggleWidth("title");
	expect(item.state().isTitleFull).toBe(true);

	let e2 = {
		ctrlKey: false,
		metaKey: true,
		key: "Delete",
		charCode: 18,
		keyCode: 17,
		cancelBubble: false,
		preventDefault: jest.fn(),
		stopImmediatePropagation: jest.fn(),
		stopPropagation: jest.fn(),
		target: { id: "abc" },
	};
	item.instance().handleKeyDown(e2);
	expect(e.cancelBubble).toEqual(true);
	expect(e.stopImmediatePropagation).toHaveBeenCalled();
});

test("When user clicks on pdf page for full screen view", async () => {
	match = {
		params: {
			isbn: "9780198426707",
			copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		},
	};
	MockData.ExtractSearch.extracts[0].asset_url = "abc.pdf";
	const item = shallow(<CopyManagementPage location={location} match={match} api={defaultApi} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(100);
	item.instance().onOpen();
	await wait(20);
	expect(item.state("isOpenUserUploadedAsset")).toEqual(true);
	expect(item.find("FullScreenReader").length).toBe(1);
});
