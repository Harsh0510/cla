import React from "react";
import { shallow } from "enzyme";
import CoverPageWrapper from "../CoverPageWrapper";
import CoverPage from "../index";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

// Mock import
jest.mock("react-resize-detector/build/withPolyfill", () => {
	return { withResizeDetector: mockPassthruHoc };
});

jest.mock("../../../assets/images/cover_img.png", () => true);

let props, mockFunction, currentPage;

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	currentPage = 1;
	mockFunction = jest.fn();
	props = {
		data: {
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
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component render correctly */
test(`Component render correctly`, async () => {
	const item = shallow(<CoverPageWrapper {...props} />);
	item.setProps({ width: "320", height: "324" });
	item.update();
	await wait(50);
	expect(item.find(CoverPage).length).toBe(1);
});
