import React from "react";
import { shallow } from "enzyme";
import SliderPage from "../SliderPage";
import CoverPageWrapper from "../../../widgets/CoverPage/CoverPageWrapper";

let props, mockHighlightsData;

jest.mock("../../../assets/images/cover_img.png", () => true);

function resetAll() {
	(mockHighlightsData = [
		{
			colour: "#FFFF00",
			date_created: "2020-11-09T13:07:48.788Z",
			height: 30,
			oid: "0dad626ae3c3d1461ea3f546169f6ebae1e2",
			page: 1,
			position_x: 7.5,
			position_y: 7.5,
			width: 30,
		},
		{
			colour: "#FFFF00",
			date_created: "2020-11-09T13:07:48.788Z",
			height: 30,
			oid: "0dad626ae3c3d1461ea3f546169f6ebae1e2",
			page: 1,
			position_x: 7.5,
			position_y: 7.5,
			width: 30,
		},
	]),
		(props = {
			key: 1,
			pageNumber: 1,
			currentIndex: 1,
			pageImageUrl: "testyurl.png",
			copyRightTextImage: "Test Book. Publish 2019.",
			highlights: mockHighlightsData,
		});
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<SliderPage {...props} />);
	expect(item.find("CustomControl").length).toBe(1);
});

/** Check right click prevent component present or not*/
test("Check right click prevent component present or not", async () => {
	const item = shallow(<SliderPage {...props} />);
	expect(item.find("PreventRightClick").length).toBe(1);
});

/** Check RetryableImage component present or not*/
test("Check RetryableImage component present or not", async () => {
	const item = shallow(<SliderPage {...props} />);
	expect(item.find("RetryableImage").length).toBe(1);
});

/** Display the cover page*/
test("Display the cover page", async () => {
	props.isCoverPage = true;
	props.data = {
		course_name: "Class 4",
		course_oid: "3393f1bf1db01d86a46750b43315d9ce2f81",
		date_created: "2019-08-26T08:02:12.675Z",
		date_expired: "2019-11-26T08:02:12.674Z",
		edition: 1,
		exam_board: "CCEA",
		expired: false,
		imprint: "Taylor and Francis",
		oid: "9ea37106583786e4b87f6ff04a5fca339e57",
		page_count: 3,
		pages: [19, 20, 21],
		school_name: "AVM Mandir (AVM-65)",
		students_in_course: 19,
		teacher: "Mrs Salina Joes",
		title: "Behaviour 4 My Future 19 to 21",
		user_id: 642,
		work_authors: [{ role: "A", lastName: "Davis", firstName: "Susie" }],
		work_isbn13: "9781351698962",
		work_publication_date: "2008-10-06T00:00:00.000Z",
		work_publisher: "Taylor and Francis",
		work_title: "Behaviour 4 My Future",
		year_group: "y12",
	};
	const item = shallow(<SliderPage {...props} />);
	expect(item.containsMatchingElement(<CoverPageWrapper />)).toBe(true);
});

test("User seen the watermark image with copyright text", async () => {
	props.is_watermarked = true;
	const item = shallow(<SliderPage {...props} />);
	expect(item.find("RetryableImage").length).toBe(1);
	expect(item.find("FooterImge").length).toBe(0);
});

test("When specific extract page didnot have any highlights", async () => {
	props.highlights = [];
	const item = shallow(<SliderPage {...props} />);
	expect(item.find("RetryableImage").length).toBe(1);
});

test("When pageImageUrl is not pass display 'Page not available for copy` as blank page ", async () => {
	props.pageImageUrl = "";
	const item = shallow(<SliderPage {...props} />);
	expect(item.find("AssetPageNotAvailable").length).toBe(1);
});
