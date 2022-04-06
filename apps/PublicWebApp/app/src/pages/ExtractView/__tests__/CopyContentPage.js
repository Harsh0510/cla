// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import CopyContentPage from "../CopyContentPage";
import MockBookCover from "../../../mocks/MockBookCover";
import MockNotesData from "../../../mocks/MockNotesData";
import MockHighlightsData from "../../../mocks/MockHighlightsData";
import MockHighlightPageJoinData from "../../../mocks/MockHighlightPageJoinData";

let props, mockFunction, toggleSidebar;

jest.mock("../../../assets/images/cover_img.png", () => true);

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	toggleSidebar = jest.fn();
	mockFunction = jest.fn();
	props = {
		isSidebar: true,
		extractPages: ["https://dummyimage.com/1200x1000/ee0000/333.png&text=1", "https://dummyimage.com/1200x1000/ee0000/333.png&text=1"],
		loading: false,
		toggleSidebar: toggleSidebar,
		data: MockBookCover[0],
		copyRightTextImage: "Footer text testing",
		onOpen: mockFunction,
		pageNumberToNoteMap: MockNotesData,
		pageNumberToHighlightMap: MockHighlightsData,
		pageNumberToHighlightPageJoinMap: MockHighlightPageJoinData,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = shallow(<CopyContentPage {...props} />).dive();
	expect(item.find("BookTableContent").length).toBe(1);
	expect(item.find("BookView").length).toBe(1);
});

/** User shows the full screen mode  */
test(`User shows the full screen mode`, async () => {
	props.isSidebar = false;
	const item = shallow(<CopyContentPage {...props} />).dive();
	expect(item.find("CopyContent").length).toBe(0);
});

/** User click on full screen button */
test(`User click on full screen button`, async () => {
	const item = shallow(<CopyContentPage {...props} />).dive();
	const btnFullscreen = item.find("ButtonClose");
	expect(btnFullscreen.find("span").text()).toEqual("Fullscreen");
	btnFullscreen.simulate("click");
	await wait(20);
	item.update();
	expect(mockFunction).toBeCalled();
});

/** User click on compress icon */
test(`User click on compress icon`, async () => {
	props.isSidebar = false;
	const item = shallow(<CopyContentPage {...props} />).dive();
	const compressIcon = item.find("TabMenu");
	compressIcon.simulate("click");
	await wait(20);
	item.update();
	expect(toggleSidebar).toBeCalled();
});

test("When specific extract page didnot have notes and highlights", () => {
	props.pageNumberToNoteMap = [];
	props.pageNumberToHighlightMap = [];
	props.pageNumberToHighlightPageJoinMap = [];
	const item = shallow(<CopyContentPage {...props} />).dive();
	expect(item.find("BookTableContent").length).toBe(1);
	expect(item.find("BookView").length).toBe(1);
});

test("When user see uploaded pdf extract page", () => {
	props.uploadedPdfUrl = "abc.pdf";
	const item = shallow(<CopyContentPage {...props} />).dive();
	expect(item.find("PdfViewer").length).toBe(1);
});
