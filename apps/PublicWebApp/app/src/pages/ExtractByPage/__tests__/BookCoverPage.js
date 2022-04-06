import React from "react";
import { shallow, mount } from "enzyme";
import BookCoverPage from "../BookCoverPage";
import MockWorks from "../../../mocks/MockWorks";

let props, urlEncodeAsset, resultData, mockHandleEvents, isCalledSetDefaultCoverImage;

jest.mock("../../../common/setDefaultCoverImage.js", () => {
	return () => {
		isCalledSetDefaultCoverImage = true;
	};
});

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	resultData = MockWorks[0];
	mockHandleEvents = jest.fn();
	urlEncodeAsset = resultData.isbn13 + "-" + resultData.title.replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase();
	props = {
		isBookTableContent: true,
		isbn: resultData.isbn13,
		resultData: resultData,
		urlEncodeAsset: urlEncodeAsset,
		handleEvents: mockHandleEvents,
		classesName: "Test Class",
		handleGotoPageSubmit: mockHandleEvents,
		isShowTooltip: true,
		onFlyoutClose: jest.fn(),
	};
	isCalledSetDefaultCoverImage = false;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component render correctly */
test(`Component render correctly`, async () => {
	const item = shallow(<BookCoverPage {...props} />);
	expect(item.find("BookInfo").length).toBe(1);
	expect(item.find("WorkResultDescription").length).toBe(1);
	expect(item.find("DescriptionAndIconWrap").length).toBe(1);
});

test(`Click on the Go To page box`, async () => {
	props.setGoToPageValue = mockHandleEvents;
	props.gotoPageValue = "1";
	const item = shallow(<BookCoverPage {...props} />);
	expect(item.find("BookInfo").length).toBe(1);
	expect(item.find("WorkResultDescription").length).toBe(1);
	expect(item.find("DescriptionAndIconWrap").length).toBe(1);
	item.instance().gotoTextBox.current = 1;
	item.instance().handleGotoPageSubmit({ preventDefault: jest.fn(), target: { value: "1" } });
});

test("User do not see the tool tip", async () => {
	props.isShowTooltip = false;
	const item = shallow(<BookCoverPage {...props} />);
	expect(item.find("AjaxSearchableDropdown").props().toolTipText).toBe(null);
});

test("User seen full copy icon when asset can full copy", async () => {
	props.isShowTooltip = false;
	props.resultData = MockWorks[1];
	const item = shallow(<BookCoverPage {...props} />);
	expect(item.find("IconSection").length).toBe(1);
});

test("User not seen full copy icon when asset can not full copy", async () => {
	props.isShowTooltip = false;
	props.resultData = MockWorks[0];
	const item = shallow(<BookCoverPage {...props} />);
	expect(item.find("IconSection").length).toBe(0);
});

test(`User see magazine icon and title text for magazine`, async () => {
	props.resultData.content_form = "MI";
	const item = shallow(<BookCoverPage {...props} />);
	expect(item.find("IconWrapper").childAt(0).props().className).toEqual("fal fa-newspaper");
	expect(item.find("IconWrapper").childAt(0).props().title).toEqual("This title is a magazine.");
});

test(`User see book icon and title text for book`, async () => {
	props.resultData.content_form = "BO";
	const item = shallow(<BookCoverPage {...props} />);
	expect(item.find("IconWrapper").childAt(0).props().className).toEqual("fal fa-book");
	expect(item.find("IconWrapper").childAt(0).props().title).toEqual("This title is a book.");
});

test(`User see epub icon and title text for epub`, async () => {
	props.resultData.file_format = "epub";
	const item = shallow(<BookCoverPage {...props} />);
	expect(item.find("IconWrapper").childAt(0).props().className).toEqual("fal fa-tablet-alt");
	expect(item.find("IconWrapper").childAt(0).props().title).toEqual(
		"This title is derived from an ebook and the page numbers may not match the ones in your physical copy."
	);
});

test("User seen the flyout on epub icon", async () => {
	props.flyOutIndex = 5;
	props.resultData = MockWorks[0];
	const item = shallow(<BookCoverPage {...props} />);
	expect(item.find("withWhiteOutConsumer").length).toBe(1);
});

test("User seen the flyout on goto page input section", async () => {
	props.flyOutIndex = 6;
	props.resultData = MockWorks[0];
	const item = shallow(<BookCoverPage {...props} />);
	expect(item.find("withWhiteOutConsumer").length).toBe(1);
});

test(`When asset does not have cover image`, async () => {
	const item = shallow(<BookCoverPage {...props} />);
	item.find("BookImage").simulate("error");
	expect(isCalledSetDefaultCoverImage).toBeTruthy();
});
