// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import UserSearchFilters from "../index";
import MockUser from "../../../mocks/MockUser";
import MockUserSearchFilterData from "../../../mocks/MockUserSearchFilterData";
import UserRole from "../../../common/UserRole";
import USER_FILTER_STATUS from "../../../mocks/MockStatusFilterData";

let mockUserData,
	props,
	mockFunction,
	mockQuery,
	mockSchoolData,
	mockRolesData,
	mockStatusData,
	mockResultFilter,
	filters,
	mockSelectedSchool,
	mockSelectedRoles,
	mockSelectedStatus;

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return {
			current: {
				focus: jest.fn(),
				value: "",
			},
		};
	};
});

function mockMappingData(arrayData) {
	let arr = [];
	let setOption = {
		value: null,
		label: null,
		key: null,
	};
	arrayData.map((item) => {
		const data = Object.assign({}, setOption);
		data.value = item.id;
		data.label = item.title;
		data.key = item.id;
		arr.push(data);
	});
	return arr;
}

function getData() {
	filters = [];
	mockResultFilter = MockUserSearchFilterData.result;
	for (const item in mockResultFilter) {
		filters.push(mockResultFilter[item]);
	}
	let roleArray = filters.find((filter) => filter.id === "roles");
	mockRolesData = roleArray ? mockMappingData(roleArray.data) : null;
	let schoolArray = filters.find((filter) => filter.id === "schools");
	mockSchoolData = schoolArray ? mockMappingData(schoolArray.data) : null;
	let statusArray = filters.find((filter) => filter.id === "schools");
	mockStatusData = statusArray ? mockMappingData(statusArray.data) : null;
}

function resetAll() {
	getData();
	mockFunction = jest.fn();
	mockQuery = "Another";
	mockUserData = MockUser[3];
	mockSelectedSchool = mockSchoolData[0];
	mockSelectedRoles = mockRolesData[0];
	mockSelectedStatus = mockStatusData[0];
	props = {
		schoolData: mockSchoolData,
		rolesData: mockRolesData,
		statusData: mockStatusData,
		selectedSchools: mockSelectedSchool,
		selectedRoles: mockSelectedRoles,
		selectedStatus: mockSelectedStatus,
		currentUserRole: mockUserData.role,
		handlefilterSelection: mockFunction,
		filterText: mockQuery,
		queryPlaceHolderText: " Search ..",
		doSearch: mockFunction,
		resetAll: mockFunction,
		filtersLength: 2,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly*/
test("Component renders correctly", async () => {
	const item = mount(<UserSearchFilters {...props} />);
	expect(item.find("WrapForm").length).toBe(1);
});

/** Component renders correctly with submit and reset button*/
test("Component render with buttons", async () => {
	props.queryPlaceHolderText = "";
	props.currentUserRole = UserRole.schoolAdmin;
	const item = shallow(<UserSearchFilters {...props} />);
	expect(item.find("SubmitButton").length).toBe(2);
	expect(item.find('button[name="Search"]').length).toBe(0);
	expect(item.find('button[name="Reset"]').length).toBe(0);
});

/** User click on submit for search*/
test("User click on submit for search", async () => {
	const item = shallow(<UserSearchFilters {...props} />);
	const spy = jest.spyOn(item.instance(), "handleSearch");
	item.instance().handleSearch({
		preventDefault: jest.fn(),
		target: {
			elements: {
				search: {
					value: "another",
				},
			},
		},
	});
	expect(spy).toHaveBeenCalled();
});

/** User click on submit and called props function too*/
test("User click on submit and called props function too", async () => {
	const item = shallow(<UserSearchFilters {...props} />);
	item.instance().handleSearch({
		preventDefault: jest.fn(),
		target: {
			elements: {
				search: {
					value: "another",
				},
			},
		},
	});
	expect(props.doSearch).toHaveBeenCalled();
});

/** User click on submit and called onfocus function*/
test("User click on submit and called onfocus function", async () => {
	const item = shallow(<UserSearchFilters {...props} />);
	item.instance().onFocus = jest.fn();
	item.instance().handleSearch({
		preventDefault: jest.fn(),
		target: {
			elements: {
				search: {
					value: "another",
				},
			},
		},
	});
	//before
	expect(item.instance().onFocus).toHaveBeenCalled();
	expect(props.doSearch).toHaveBeenCalled();
	//after
	expect(item.instance().onFocus).toHaveBeenCalled();
});

/** User click on ResetAll button for clear the filters*/
test("User click on resetAll button", async () => {
	const item = shallow(<UserSearchFilters {...props} />);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	item.find('[name="Reset"]').simulate("click", { preventDefault: mockFunction });
	expect(mockFunction).toHaveBeenCalled();
});

/** Called props reset function */
test("User click on resetAll button and after its called the props event", async () => {
	const item = shallow(<UserSearchFilters {...props} />);
	await wait(50);
	item.instance().onFocus = mockFunction;
	item.update();
	item.instance().forceUpdate();
	item.find('[name="Reset"]').simulate("click", { preventDefault: jest.fn() });
	expect(props.resetAll).toHaveBeenCalled();
	expect(mockFunction).toHaveBeenCalled();
});

/** User Search any Query */
test("User Search any Query", async () => {
	props.mockQuery = "";
	const item = shallow(<UserSearchFilters {...props} />);
	await wait(20);
	const inputSearch = item.find('[name="search"]');

	inputSearch.simulate("change", {
		preventDefault: jest.fn(),
		target: {
			name: "search",
			value: "teacher",
		},
	});
	expect(props.handlefilterSelection).toHaveBeenCalled();
});

/** User filter school drop down */
test("User filter school dropdown", async () => {
	props.selectedSchools = [];
	const item = shallow(<UserSearchFilters {...props} />);
	await wait(20);
	item.instance().handleSchoolDrpChange(mockSchoolData[0]);
	expect(props.handlefilterSelection).toHaveBeenCalled();
});

/** User filter role drop down */
test("User filter role dropdown", async () => {
	props.selectedSchools = [];
	const item = shallow(<UserSearchFilters {...props} />);
	await wait(20);
	item.instance().handleRoleDrpChange(mockRolesData[0]);
	expect(props.handlefilterSelection).toHaveBeenCalled();
});

/** For registration queue, see the user status dropdown data */
test("User on Registration Queue Page", async () => {
	props.statusData = USER_FILTER_STATUS;
	props.createUserPageLink = "admin/create-user?action=new";
	const item = shallow(<UserSearchFilters {...props} />);
	await wait(20);
	item.instance().handleStatusDrpChange(mockSelectedStatus);
	expect(props.handlefilterSelection).toHaveBeenCalled();
	expect(item.find('[name="Status"]').length).toEqual(1);
});

/** User filter status drop down */
test("User filter status dropdown", async () => {
	props.selectedStatus = [];
	const item = shallow(<UserSearchFilters {...props} />);
	await wait(20);
	item.instance().handleStatusDrpChange(mockStatusData[0]);
	expect(props.handlefilterSelection).toHaveBeenCalled();
});

test("Render components without passomg the lengthOfFilters", async () => {
	delete props.filtersLength;
	const item = shallow(<UserSearchFilters {...props} />);
	await wait(20);

	expect(item.find("WrapForm").length).toEqual(1);
	expect(item.find('[name="search"]').length > 0).toBe(true);
	expect(item.find('[name="Role"]').length > 0).toBe(true);
	expect(item.find('[name="Status"]').length > 0).toBe(true);
});

test("Render components without passomg the lengthOfFilters > 3", async () => {
	props.filtersLength = 4;
	const item = shallow(<UserSearchFilters {...props} />);
	await wait(20);

	expect(item.find("WrapForm").length).toEqual(1);
	expect(item.find('[name="search"]').length > 0).toBe(true);
	expect(item.find('[name="Role"]').length > 0).toBe(true);
	expect(item.find('[name="Status"]').length > 0).toBe(true);
});

test("Render components without passomg dropdown data", async () => {
	delete props.schoolData;
	delete props.rolesData;
	delete props.statusData;

	const item = shallow(<UserSearchFilters {...props} />);
	await wait(20);

	expect(item.find("WrapForm").length).toEqual(1);
	expect(item.find('[name="search"]').length).toBe(1);
	expect(item.find('[name="Role"]').length).toBe(0);
	expect(item.find('[name="Status"]').length).toBe(0);
	expect(item.find('[name="School"]').length).toBe(0);
});
