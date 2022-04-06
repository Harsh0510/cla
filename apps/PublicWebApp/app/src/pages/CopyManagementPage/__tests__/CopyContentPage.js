// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import CopyContentPage from "../CopyContentPage";
import MockBookCover from "../../../mocks/MockBookCover";
import MockExtractNoteData from "../../../mocks/MockExtractNotes";
import ConfirmModal from "../../../widgets/ConfirmModal";
import MockNotesData from "../../../mocks/MockNotesData";
import MockHighlightsData from "../../../mocks/MockHighlightsData";
import MockHighlightPageJoinData from "../../../mocks/MockHighlightPageJoinData";
let props, eventHandle;

jest.mock("../../../assets/images/cover_img.png", () => true);

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	eventHandle = jest.fn();
	props = {
		isSidebar: true,
		extractPages: [
			"https://dummyimage.com/1200x1000/ee0000/333.png&text=1",
			"https://dummyimage.com/1200x1000/ee0000/333.png&text=1",
			"https://dummyimage.com/1200x1000/ee0000/333.png&text=1",
		],
		loading: false,
		data: MockBookCover[0],
		copyRightTextImage: "data:image/png;base64",
		shareLinks: [],
		copyOid: "bc6a1c6c1dbf34532784f73cb3230736dbc9",
		deactivateShare: eventHandle,
		getShareLink: eventHandle,
		isCopyTitleEditable: false,
		submitCopyTitleEditable: eventHandle,
		isDisplayCopyTitleEditable: eventHandle,
		isLinkShare: false,
		onDoPrint: eventHandle,
		toggleSidebar: eventHandle,
		getShareLink: eventHandle,
		setStateForDeactivateLink: eventHandle,
		deactivateLinkId: null,
		onOpen: eventHandle,
		pageNumberToNoteMap: MockExtractNoteData,
		pageNumberToHighlightMap: MockHighlightsData,
		pageNumberToHighlightPageJoinMap: MockHighlightPageJoinData,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	props.flyOutIndex = 0;
	const item = shallow(<CopyContentPage {...props} />);
	expect(item.find("BookTableContent").length).toBe(1);
});

/** Component with incorrect pageNumberToNoteMap */
test(`Component with incorrect pageNumberToNoteMap`, async () => {
	props.pageNumberToNoteMap = {
		0: [
			{ width: 20, height: 20, top: 10, left: 10, content: "test 1" },
			{ width: 20, height: 20, top: 10, left: 10, content: "test 1" },
		],
	};
	const item = shallow(<CopyContentPage {...props} />);
	expect(item.find("BookTableContent").length).toBe(1);
});

test(`Component renders when data expired`, async () => {
	props.data.expired = true;
	const item = shallow(<CopyContentPage {...props} />);
	expect(item.find("ExpiredMessage").length).toBe(1);
});
/** User shows the full screen mode  */
test(`User shows the full screen mode`, async () => {
	props.isSidebar = false;
	const item = shallow(<CopyContentPage {...props} />);
	expect(item.find("CopyContent").length).toBe(0);
});

/** When user havn't create any sharelinks */
test(`When user havn't create any sharelinks`, async () => {
	props.isLinkShare = true;
	props.shareLinks = [{ oid: "1a1b98187edff32103d1dd4d5148f507a285" }];
	const item = shallow(<CopyContentPage {...props} />);
	expect(item.find("ShareTableRaw").find("ShareRow").length).toBe(0);
});

/** When User click on full screen button */
test(`When User click on create link button`, async () => {
	const item = shallow(<CopyContentPage {...props} />);
	const btnCreateLink = item.find("FullLimeBGSection");
	expect(btnCreateLink.find("Button").text()).toMatch("Create a new link");
	item.find("Button").simulate("click");
	item.update();
	expect(eventHandle).toBeCalled();
});

test("show modal popup ", () => {
	props.deactivateLinkId = 1;
	const item = shallow(<CopyContentPage {...props} />);
	item.instance().hideConfirmModel();
	item.instance().onConfirm(1);
	expect(eventHandle).toBeCalled();
	expect(item.containsMatchingElement(<ConfirmModal />)).toBe(true);
});

test("hide Side bar", () => {
	props.isSidebar = false;
	const item = shallow(<CopyContentPage {...props} />);
	expect(item.find("CopyContent").length).toBe(0);
});
test("Check pageNumberToNoteMap data", () => {
	const item = shallow(<CopyContentPage {...props} />);
	expect(item.find("pageNumberToNoteMap").length).toBe(0);
});
test("Check pageNumberToNoteMap data", () => {
	props.pageNumberToNoteMap = [1, 2, 3];
	const item = shallow(<CopyContentPage {...props} />);
	expect(item.find("pageNumberToNoteMap").length).toBe(0);
});
test(`User shows the uploded asset extract`, async () => {
	props.copiesData = [{ asset_url: "abc.pdf" }];
	const item = shallow(<CopyContentPage {...props} />);
	expect(item.find("PdfViewer").length).toBe(1);
});
