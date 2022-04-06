// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import TitleSection from "../TitleSection";

let isCalledSetDefaultCoverImage;

/**Image mocks */
/**Mocks for image */
jest.mock("../../../assets/icons/blue_unlocked_single.svg", () => jest.fn());
jest.mock("../../../assets/icons/work_locked.svg", () => jest.fn());
jest.mock("../../../assets/icons/preview.png", () => jest.fn());
jest.mock("../../../widgets/PageWrap/images/Sign_in_Shape_1.svg", () => jest.fn());
jest.mock(".././../widgets/PageWrap/images/Sign_in_Shape_2.svg", () => jest.fn());
jest.mock("../../../widgets/PageWrap/images/Sign_in_Shape_1.svg", () => jest.fn());
jest.mock("../../../widgets/PageWrap/images/Sign_in_Shape_1.svg", () => jest.fn());
jest.mock("../../../widgets/PageWrap/images/Sign_in_Shape_1.svg", () => jest.fn());
jest.mock("../../../common/setDefaultCoverImage.js", () => {
	return () => {
		isCalledSetDefaultCoverImage = true;
	};
});

/**
 * This 'HOC' does nothing but 'pass through' the provided component,
 * so it's not necessary to 'dive()' into rendered results,
 * and so it's possible to mock the 'api' function.
 **/
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

// Mock import
jest.mock("../../../common/withPageSize", () => mockPassthruHoc);
jest.mock("react-resize-detector/build/withPolyfill", () => {
	return {
		withResizeDetector: mockPassthruHoc,
	};
});
// jest.mock('@fortawesome/fontawesome-svg-core', () => mockPassthruHoc);
// jest.mock('@fortawesome/react-fontawesome', () => mockPassthruHoc);
// jest.mock('@fortawesome/free-solid-svg-icons', () => mockPassthruHoc);

let props;

function resetAll() {
	props = {
		resultData: {
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
		},
		isbn: "9780007457939",
		className: "StyledTitleSection-y3m261-6 bHbYBH",
		breakpoint: 30,
		width: 1200,
	};
	isCalledSetDefaultCoverImage: false;
}

beforeEach(resetAll);
afterEach(resetAll);

/**mock functions */
const doExtractSort = jest.fn();

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("StudentBook").length).toBe(1);
});

test("User seen in mobile", async () => {
	props.width = 320;
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("Container").length).toBe(2);
	expect(item.find("MobRow").length).toBe(2);
});

test("User seen in table", async () => {
	delete props.width;
	window.innerWidth = 675;
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("StudentBook").length).toBe(1);
});

test(`User see magazine icon and title text for magazine`, async () => {
	props.resultData.work_content_form = "MI";
	const item = shallow(<TitleSection {...props} />);
	const Result = item.find("IconWrapper").childAt(0);
	expect(Result.props().className).toEqual("fal fa-newspaper");
	expect(Result.props().title).toEqual("This title is a magazine.");
});

test(`User see book icon and title text for book`, async () => {
	props.resultData.work_content_form = "BO";
	const item = shallow(<TitleSection {...props} />);
	const Result = item.find("IconWrapper").childAt(0);
	expect(Result.props().className).toEqual("fal fa-book");
	expect(Result.props().title).toEqual("This title is a book.");
});

test(`User see book icon and title text for epub`, async () => {
	props.resultData.file_format = "epub";
	const item = shallow(<TitleSection {...props} />);
	const Result = item.find("IconWrapper").childAt(0);
	expect(Result.props().className).toEqual("fal fa-tablet-alt");
	expect(Result.props().title).toEqual("This title is derived from an ebook and the page numbers may not match the ones in your physical copy.");
});

test(`When asset does not have cover image`, async () => {
	const item = shallow(<TitleSection {...props} />);
	item.find("img").simulate("error");
	expect(isCalledSetDefaultCoverImage).toBeTruthy();
});
