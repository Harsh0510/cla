// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import MockUser from "../../../mocks/MockUser";
import React from "react";
import { shallow, mount } from "enzyme";
import Presentation from "../Presentation";
import Header from "../../../widgets/Header";
import Loader from "../../../widgets/Loader";

let props, mockRefElement, copy, mockUserData, mockImageComplete, mockPageFooterText, mockErrorText, mockNaturalWidth, mockNaturalHeight;

/**
 * This 'HOC' does nothing but 'pass through' the provided component,
 * so it's not necessary to 'dive()' into rendered results,
 * and so it's possible to mock the 'api' function.
 **/
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withAdminAuthRequiredConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
//jest.mock('../../../common/withPageSize', () => mockPassthruHoc);
jest.mock("../../../common/CustomImageDimensions", () => {
	return function () {
		if (mockRefElement) {
			return {
				naturalWidth: mockNaturalWidth,
				naturalHeight: mockNaturalHeight,
				complete: mockImageComplete,
				onload: "",
			};
		} else {
			return null;
		}
	};
});
jest.mock("../../../widgets/GenerateCopyRightImage", () => {
	return function () {
		return "https://dummyimage.com";
	};
});
jest.mock("../../../assets/images/cover_img.png", () => true);

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/**Mock function */
const mockToggleSidebar = jest.fn();
const mockgetPagesForPrint = jest.fn();

/**
 * Reset function
 */
function resetAll() {
	mockUserData = MockUser[0];
	mockRefElement = true;
	mockImageComplete = true;
	mockNaturalWidth = 0;
	mockNaturalHeight = 0;
	mockErrorText = "This link has expired, please ask for the share link to be refreshed and try again";
	props = {
		resultData: [],
		extractPages: ["http://mysite.com/1.png", "http://mysite.com/2.png", "http://mysite.com/3.png"],
		copy: {
			course_name: "Psychology 101",
			course_oid: "bd04e47394b4fe164ecaea0c2b83b7441814",
			date_created: "2018-12-23T18:03:11.261Z",
			exam_board: "AQA",
			oid: "b7552caa7885bd46beb424c95977c2159cc1",
			page_count: 3,
			pages: [1, 26, 33],
			students_in_course: 452,
			teacher: "school admin",
			title: "<",
			user_id: 3,
			work_authors: [],
			work_isbn13: "9780007457939",
			work_title: "Collins Mental Maths",
			year_group: "Y12",
		},
		toggleSidebar: mockToggleSidebar,
		sidebar: false,
		getPagesForPrint: mockgetPagesForPrint,
		pageFooterText: "Created by tfb1name tlb1name for School CLA School B on Date 21 February 2019",
		error: null,
		withAuthConsumer_myUserDetails: mockUserData,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders load without copy data*/
test("Component renders load without copy data", async () => {
	props.resultData = [];
	props.copy = null;
	mockImageComplete = true;
	const item = shallow(<Presentation {...props} />).dive();
	item.instance()._active = false;
	await wait(150);
	item.update();
	expect(item.containsMatchingElement(<Loader />)).toBe(true);
});

/** Component renders load with copy data*/
test("Component renders load with copy data", async () => {
	const item = shallow(<Presentation {...props} />).dive();
	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

/** Copy data as undefined*/
test("Copy data as undefined", async () => {
	props.copy = undefined;
	const item = shallow(<Presentation {...props} />).dive();
	expect(item.containsMatchingElement(<Loader />)).toBe(true);
});

/** User donet have copy data and than after pass the copy data (props.copy && !prevProps.copy) */
test("User donet have copy data and than after pass the copy data", async () => {
	props.copy = null;
	const item = shallow(<Presentation {...props} />).dive();
	let copyData = {
		course_name: "Psychology 101",
		course_oid: "bd04e47394b4fe164ecaea0c2b83b7441818",
		date_created: "2018-12-23T18:03:11.261Z",
		exam_board: "AQA",
		oid: "b7552caa7885bd46beb424c95977c2159cc1",
		page_count: 3,
		pages: [1, 26, 33],
		students_in_course: 452,
		teacher: "school admin",
		title: "<",
		user_id: 3,
		work_authors: [],
		work_isbn13: "9780007457939",
		work_title: "Collins Mental Maths",
		year_group: "Y12",
	};
	item.setProps({ copy: copyData });
	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

/** User have copy data and than after pass the copy data as null (!props.copy && prevProps.copy) */
test("User have copy data and than after pass the copy data as null", async () => {
	const item = shallow(<Presentation {...props} />).dive();
	item.setProps({ copy: null });
	expect(item.containsMatchingElement(<Loader />)).toBe(true);
});

/** User have copy data and than after pass the copy data as null (!props.copy && prevProps.copy) */
test("User have copy data and than after pass the copy data as null", async () => {
	const item = shallow(<Presentation {...props} />).dive();
	item.setProps({ copy: null });
	expect(item.containsMatchingElement(<Loader />)).toBe(true);
});

/** User have copy data and than after change the copy data (this.props.copy && prevProps.copy && (this.props.copy.oid !== prevProps.copy.oid)) */
test("User have copy data and than after change the copy data oid", async () => {
	const item = shallow(<Presentation {...props} />).dive();
	copy = {
		course_name: "Psychology 102",
		course_oid: "bd04e47394b4fe164ecaea0c2b83b7441816",
		date_created: "2018-12-23T18:03:11.261Z",
		exam_board: "AQA",
		oid: "b7552caa7885bd46beb424c95977c2159cc2",
		page_count: 4,
		pages: [1, 26, 33, 35],
		students_in_course: 452,
		teacher: "school admin",
		title: "<",
		user_id: 3,
		work_authors: [],
		work_isbn13: "9780007457939",
		work_title: "Collins Mental Maths",
		year_group: "Y12",
	};
	item.setProps({ copy: copy });
	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

test(`Component renders correctly with PreventRightClick component`, async () => {
	const item = shallow(<Presentation {...props} />);
	expect(item.first("PreventRightClick").length).toBe(1);
});

test(`Render with page footer elements`, async () => {
	const item = shallow(<Presentation {...props} />);
	expect(item.first("PageBootmCornerText").length).toBe(1);
});

test("Component renders with error with link has expired", async () => {
	props.error = mockErrorText;
	const item = shallow(<Presentation {...props} />);
	expect(item.first("Error").length).toBe(1);
	expect(item.first("Error").text().indexOf("This link has expired").length !== -1).toBe(true);
});

test("Component renders with error with extract not found", async () => {
	props.error = "Extract not found";
	const item = shallow(<Presentation {...props} />);
	expect(item.first("Error").length).toBe(1);
	expect(item.first("Error").text().indexOf("Extract not found").length !== -1).toBe(true);
});

/** User don't have copy data and than after change the copy data (this.props.copy && !prevProps.copy) */
test("User have copy data and than after change the copy data oid", async () => {
	props.copy = null;
	const item = shallow(<Presentation {...props} />).dive();
	copy = {
		course_name: "Psychology 102",
		course_oid: "bd04e47394b4fe164ecaea0c2b83b7441816",
		date_created: "2018-12-23T18:03:11.261Z",
		exam_board: "AQA",
		oid: "b7552caa7885bd46beb424c95977c2159cc2",
		page_count: 4,
		pages: [1, 26, 33, 35],
		students_in_course: 452,
		teacher: "school admin",
		title: "<",
		user_id: 3,
		work_authors: [],
		work_isbn13: "9780007457939",
		work_title: "Collins Mental Maths",
		year_group: "Y12",
	};
	item.setProps({ copy: copy });
	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

test('User getting the error message like "Extract Share not valid"', async () => {
	props.error = "Extract Share not valid";
	const item = shallow(<Presentation {...props} />).dive();
	expect(item.containsMatchingElement(<Header />)).toBe(true);
	expect(item.find("Error").text()).toBe("Extract Share not valid");
});
