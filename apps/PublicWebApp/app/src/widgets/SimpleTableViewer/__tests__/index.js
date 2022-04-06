import React from "react";
import { shallow } from "enzyme";
import SimpleTableViewer from "../index";

let props;
let mockResult;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);

jest.mock("../../../common/withAdminAuthRequiredConsumer", () => {
	return function (acceptedRoles, WrappedComponent) {
		if (!Object.keys(acceptedRoles).length == 1) {
			throw "It should be passed acceptedToles with a single key";
		}
		if (!acceptedRoles.hasOwnProperty("cla-admin")) {
			throw "It should be passed acceptedToles with a key: cla-admin || school-admin || teacher";
		}
		return WrappedComponent;
	};
});

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	mockResult = {
		data: [
			{
				title: "test title",
				isbn: "9781911208730",
				number_of_copies: 10,
				number_of_student_clicks: 15,
				date_created: "2021-11-24T04:36:44.922Z",
			},
		],
		unfiltered_count: 1,
	};
	props = {
		location: {
			search: "?limit-copy=5&offset-copy=5&sort-dir-copy=desc&sort-field-copy=number_of_copies",
		},
		history: {
			push: jest.fn(),
		},
		apiEndPoint: "/admin/user-report/copies",
		api: async () => {
			return new Promise((res) => res(mockResult));
		},
		fields: [
			{ id: "title", title: "Title", width: 200, align: "left", type: "text", sortingEnabled: true },
			{ id: "isbn", title: "ISBN", width: 180, align: "left", type: "text", sortingEnabled: false },
			{ id: "number_of_copies", title: "Number of copies", width: 170, align: "left", type: "text", sortingEnabled: true },
			{ id: "number_of_student_clicks", title: "Number of student clicks", width: 200, align: "left", type: "text", sortingEnabled: true },
			{ id: "date_created", title: "Date created", width: 160, align: "left", type: "date", sortingEnabled: true },
		],
		defaultSortField: "date_created",
		defaultSortDir: "desc",
		defaultRowsLimit: 5,
		limitParamName: "limit-copy",
		offsetParamName: "offset-copy",
		sortFieldParamName: "sort-field-copy",
		sortDirParamName: "sort-dir-copy",
		pageUrl: "/profile/admin/reporting",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Component renders correctly`, async () => {
	const item = shallow(<SimpleTableViewer {...props} />);
	await wait(50);
	expect(item.find("Presentation").length).toBe(1);
	expect(item.find("Message").length).toBe(0);
});

test(`Component renders correctly without results`, async () => {
	mockResult = {
		data: [],
		unfiltered_count: 0,
	};
	const item = shallow(<SimpleTableViewer {...props} />);
	await wait(50);
	expect(item.find("Presentation").length).toBe(0);
	expect(item.find("Message").length).toBe(1);
});

test(`Component renders correctly when search is not passed in params`, async () => {
	props.location.search = "";
	const item = shallow(<SimpleTableViewer {...props} />);
	await wait(50);
	expect(item.find("Presentation").length).toBe(1);
	expect(item.find("Message").length).toBe(0);
});

test(`Component renders correctly when limit and offset value is less than 0`, async () => {
	props.location.search = "?limit-copy=-5&offset-copy=-5&sort-dir-copy=desc&sort-field-copy=number_of_copies";
	const item = shallow(<SimpleTableViewer {...props} />);
	await wait(50);
	expect(item.find("Presentation").length).toBe(1);
	expect(item.find("Message").length).toBe(0);
});

test("User click on pagination page", async () => {
	const item = shallow(<SimpleTableViewer {...props} />);
	const page = 2;
	const limit = 5;

	item.instance().doPagination(page, limit);
	await wait(50);
	item.update();

	const push = item.instance().props.history.push;
	let mockurl = "/profile/admin/reporting?limit-copy=5&offset-copy=5&sort-dir-copy=desc&sort-field-copy=number_of_copies";
	await wait(50);

	expect(push.mock.calls[0][0]).toEqual(mockurl);
});

test("User click on sorting", async () => {
	const item = shallow(<SimpleTableViewer {...props} />);

	//ascending order
	item.instance().doSorting([{ direction: "A", columnName: "title" }]);
	await wait(50);
	item.update();

	//decending order
	item.instance().doSorting([{ direction: "D", columnName: "title" }]);
	await wait(50);
	item.update();
	expect(item.state().loading).toBe(true);
});

test("When user click on reset button", async () => {
	const item = shallow(<SimpleTableViewer {...props} />);

	item.instance().resetAll();
	item.update();
	await wait(50);
	expect(props.history.push.mock.calls[0][0]).toEqual(
		"/profile/admin/reporting?limit-copy=5&offset-copy=0&sort-dir-copy=desc&sort-field-copy=number_of_copies"
	);
});
