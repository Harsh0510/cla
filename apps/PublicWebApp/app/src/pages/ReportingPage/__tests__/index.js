// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import ReportingPage from "../index";
import MockUserRole from "../../../mocks/MockUserRole";
import MockUser from "../../../mocks/MockUser";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAdminAuthRequiredConsumer", () => {
	return function (acceptedRoles, WrappedComponent) {
		if (!Object.keys(acceptedRoles).length == 1) {
			throw "It should be passed acceptedToles with a single key";
		}
		return WrappedComponent;
	};
});

let props;
let mockGetAllResult;
let mockUserData;
let mockFiltersresult;

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	mockGetAllResult = new Promise((res) =>
		res({
			copiedTitles: 1,
			copiesTotal: 4,
			filters: [
				{
					data: [
						{
							id: "ab".repeat(15),
							title: "test_class_1",
						},
						{
							id: "xy".repeat(15),
							title: "test_class_2",
						},
						{
							id: "wz".repeat(15),
							title: "test_class_3",
						},
					],
					id: "class",
					title: "Class",
				},
			],
			studentViews: 3,
			unlockedTitles: 45,
		})
	);
	mockFiltersresult = {
		result: [
			{
				data: [
					{ id: "dbe4b2044c6d9bf8ef18f8169f0d6b0e84f3", title: "class" },
					{
						id: "4503c55ecdf775830dd8e978f2f3fb3f9534",
						title: "test class",
					},
				],
				id: "class",
				title: "class",
			},
		],
	};
	mockUserData = MockUser[0];
	mockUserData.role = MockUserRole.teacher;
	props = {
		location: {
			search: "?limit-copy=5&offset-copy=5&sort-dir-copy=desc&sort-field-copy=number_of_copies",
		},
		history: {
			push: jest.fn(),
		},
		api: async (apiName) => {
			if (apiName === "/admin/user-report/filters") {
				return mockFiltersresult;
			} else if (apiName === "/admin/user-report/all") {
				return mockGetAllResult;
			}
		},
		withAuthConsumer_myUserDetails: { mockUserData },
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Component renders correctly`, async () => {
	const item = shallow(<ReportingPage {...props} />);
	await wait(50);
	expect(item.find("HeadTitle").length).toBe(1);
	expect(item.find("SimpleTableViewer").length).toBe(2);
});

test(`Component renders correctly when class is selected and user refresh the page`, async () => {
	props.location.search = "?class=dbe4b2044c6d9bf8ef18f8169f0d6b0e84f3";
	const item = shallow(<ReportingPage {...props} />);
	await wait(50);
	expect(item.find("HeadTitle").length).toBe(1);
	expect(item.find("SimpleTableViewer").length).toBe(2);
	expect(item.state().class).toEqual(["dbe4b2044c6d9bf8ef18f8169f0d6b0e84f3"]);
});

test("When user clicks on reset button", async () => {
	const item = shallow(<ReportingPage {...props} />);

	item.instance().resetAll();
	item.update();
	await wait(50);
	expect(item.state().class).toEqual([]);
	expect(item.state().selectedClass).toEqual([]);
});

test("When user selects class and clicks on apply", async () => {
	const item = shallow(<ReportingPage {...props} />);

	item
		.instance()
		.handlefilterSelection([{ key: "4503c55ecdf775830dd8e978f2f3fb3f9534", label: "class", value: "4503c55ecdf775830dd8e978f2f3fb3f9534" }], "class");

	item.instance().doSearch();
	item.update();
	await wait(50);
	expect(props.history.push.mock.calls[0][0]).toEqual("/profile/admin/reporting?class=4503c55ecdf775830dd8e978f2f3fb3f9534");
});
