import React from "react";
import { shallow } from "enzyme";
import BookCoverPage from "../BookCoverPage";
import MockBookCover from "../../../mocks/MockBookCover";

let props;
let isCalledSetDefaultCoverImage;

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
	props = {
		isShowBookInfo: false,
		resultData: MockBookCover[0],
		urlEncodeAsset: "9781906622701-essential-maths-a-level-pure-mathematics-book-2",
		isbn: "9781906622701",
		classesName: "9781906622701",
		handleEvents: jest.fn(),
		isNew: true,
	};
	isCalledSetDefaultCoverImage = false;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<BookCoverPage {...props} />);
	await wait(100);
	item.update();

	expect(item.find("BookInfo").length).toBe(1);
	expect(item.find("WorkResultDescription").length).toBe(1);
	expect(item.find("BookImage").props().alt).toEqual(props.resultData.work_title);
});

/** User Click on arrow book button to show book details */
test("User click on arrow button to display book details", async () => {
	const item = shallow(<BookCoverPage {...props} />);
	const mockIsShowBookInfo = item.instance().props.isShowBookInfo;
	item.setProps({ isShowBookInfo: true });
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.find("FavoriteIconWrap").length).toBe(1);
	expect(item.find("FavoriteIconWrap").length).toBe(1);
	expect(item.find("FavoriteIcon").length).toBe(1);
	expect(item.instance().props.isShowBookInfo).not.toBe(mockIsShowBookInfo);
});

/** User not getting the book information */
test("User not getting the book information", async () => {
	props.resultData = [];
	props.isNew = false;
	const item = shallow(<BookCoverPage {...props} />);
	await wait(100);
	item.update();
	expect(item.find("BookInfo").length).toBe(1);
	expect(item.find("WorkResultDescription").length).toBe(1);
	expect(item.find("BookImage").props().alt).toEqual("");
});

test(`User see magazine icon and title text for magazine`, async () => {
	props.resultData.work_content_form = "MI";
	const item = shallow(<BookCoverPage {...props} />);
	const Result = item.find("DescriptionWrap").childAt(1);
	expect(Result.childAt(0).props().className).toEqual("fal fa-newspaper");
	expect(Result.childAt(0).props().title).toEqual("This title is a magazine.");
});

test(`User see book icon and title text for book`, async () => {
	props.resultData.work_content_form = "BO";
	const item = shallow(<BookCoverPage {...props} />);
	const Result = item.find("DescriptionWrap").childAt(1);
	expect(Result.childAt(0).props().className).toEqual("fal fa-book");
	expect(Result.childAt(0).props().title).toEqual("This title is a book.");
});

test(`User see epub icon and title text for epub`, async () => {
	props.resultData.file_format = "epub";
	const item = shallow(<BookCoverPage {...props} />);
	const Result = item.find("DescriptionWrap").childAt(1);
	expect(Result.childAt(0).props().className).toEqual("fal fa-tablet-alt");
	expect(Result.childAt(0).props().title).toEqual(
		"This title is derived from an ebook and the page numbers may not match the ones in your physical copy."
	);
});

test(`User see mobile and tablet icon`, async () => {
	props.resultData.file_format = "epub";
	const item = shallow(<BookCoverPage {...props} />);
	expect(item.find("ScreenView").length).toBe(1);
});

test(`User see clone link`, async () => {
	props.resultData.status = "active";
	const item = shallow(<BookCoverPage {...props} />);
	expect(item.find("CloneCopyView").length).toBe(1);
	expect(item.find("CloneCopyView").text()).toBe("Clone this copy");
});

test(`When uploaded asset does not have cover image`, async () => {
	props.resultData.asset_url = "abc.pdf";
	const item = shallow(<BookCoverPage {...props} />);
	item.find("BookImage").simulate("error");
	expect(isCalledSetDefaultCoverImage).toBeTruthy();
});
