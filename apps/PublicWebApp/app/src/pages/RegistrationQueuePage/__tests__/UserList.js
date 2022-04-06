// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import UserList from "../UserList";
import USERDATA from "../../../mocks/MockUser";
import MockUserRole from "../../../mocks/MockUserRole";

let userRole, mockSort_dir;
/**
 * Reset function
 */
function resetAll() {
	userRole = MockUserRole.schoolAdmin;
	mockSort_dir = "D";
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	userRole = MockUserRole.schoolAdmin;
	const item = shallow(<UserList userData={USERDATA} userRole={userRole} />);

	expect(item.find("TableGridFooter").length).toBe(1);
});

test(`Component with pass sort direction descending`, async () => {
	mockSort_dir = "A";
	userRole = MockUserRole.schoolAdmin;
	const item = shallow(<UserList userData={USERDATA} userRole={userRole} sort_dir={mockSort_dir} />);

	let defaultSorting = item.find("TableGrid").props().defaultSorting;
	expect(defaultSorting[0].direction).toEqual("asc");
});

/** school-admin User dont display the school column */
test("school-admin User dont display the school column", async () => {
	userRole = MockUserRole.schoolAdmin;
	const item = shallow(<UserList userData={USERDATA} userRole={userRole} />);

	let columns = item.find("TableGrid").props().column;
	let filterdata = columns.find((row) => row.name == "school") ? true : false;

	expect(filterdata).toBe(false);
});

/** cla-admin User should display the school column */
test("cla-admin Userm should display the school column", async () => {
	userRole = MockUserRole.claAdmin;
	const item = shallow(<UserList userData={USERDATA} userRole={userRole} />);

	let columns = item.find("TableGrid").props().column;
	let filterdata = columns.find((row) => row.name == "school") ? true : false;

	expect(filterdata).toBe(true);
});
