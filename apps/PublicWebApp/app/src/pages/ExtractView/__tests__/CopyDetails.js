import React from "react";
import { shallow } from "enzyme";
import CopyDetails from "../CopyDetails";

let props, mockFunction;

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	mockFunction = jest.fn();
	props = {
		data: {
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
			file_format: "pdf",
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<CopyDetails {...props} />);
	expect(item.find("HeadTitle").length).toBe(1);
	expect(item.find("CopyNameSection").length).toBe(1);
});

/** User getting the pages in Consecutive form */
test("User getting the pages in Consecutive form", async () => {
	const item = shallow(<CopyDetails {...props} />);
	expect(item.find("HeadTitle").length).toBe(1);
	expect(item.find("[name='copyPages']").text()).toEqual("19-21");
});

/** User getting the pages in Consecutive form with the the page offset props */
test("User getting the pages in Consecutive form", async () => {
	props.data.page_offset_roman = 2;
	props.data.page_offset_arabic = 4;
	const item = shallow(<CopyDetails {...props} />);
	expect(item.find("HeadTitle").length).toBe(1);
	expect(item.find("[name='copyPages']").text()).toEqual("15-17");
});

test("User see message on when extract created from epub asset", async () => {
	props.data.file_format = "epub";
	const item = shallow(<CopyDetails {...props} />);
	expect(item.find("Ptag").length).toBe(1);
	expect(item.find("Ptag").text()).toBe(
		"The page numbers in the digital version of this book may not match the ones in your physical copy so please select your pages carefully."
	);
});
