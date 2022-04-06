import React from "react";
import { shallow } from "enzyme";
import Presentation from "../Presentation";

let props;

function resetAll() {
	props = {
		data: [
			{
				title: "test title",
				isbn: "9781911208730",
				number_of_copies: 10,
				number_of_student_clicks: 15,
				date_created: "2021-11-24T04:36:44.922Z",
			},
		],
		unfilteredCount: 1,
		fields: [
			{ id: "title", title: "Title", width: 200, align: "left", type: "text", sortingEnabled: true },
			{ id: "isbn", title: "ISBN", width: 180, align: "left", type: "text", sortingEnabled: false },
			{ id: "number_of_copies", title: "Number of copies", width: 170, align: "left", type: "text", sortingEnabled: true },
			{ id: "number_of_student_clicks", title: "Number of student clicks", width: 200, align: "left", type: "text", sortingEnabled: true },
			{ id: "date_created", title: "Date created", width: 160, align: "left", type: "date", sortingEnabled: true },
		],
		doSorting: jest.fn(),
		doPagination: jest.fn(),
		showColumnSelector: false,
		limit: 5,
		offset: 0,
		loading: false,
		sortField: "title",
		sortDir: "D",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Component renders correctly`, async () => {
	const item = shallow(<Presentation {...props} />);
	expect(item.find("TableGrid").length).toBe(1);
	expect(item.find("TableGridFooter").length).toBe(1);
});

test(`Component renders correctly with sort direction ascending`, async () => {
	props.sortDir = "A";
	const item = shallow(<Presentation {...props} />);
	expect(item.find("TableGrid").length).toBe(1);
	expect(item.find("TableGridFooter").length).toBe(1);
});
