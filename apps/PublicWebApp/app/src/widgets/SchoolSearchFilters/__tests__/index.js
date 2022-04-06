// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import SearchFilters from "../index";
import MockUser from "../../../mocks/MockUser";
import MockSchoolFilterData from "../../../mocks/MockSchoolFilterData";
import UserRole from "../../../common/UserRole";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

let mockUserData,
	props,
	mockFunction,
	mockQuery,
	mockTerritoryData,
	mockLevelData,
	mockTypeData,
	mockSchoolData,
	mockResultFilter,
	filters,
	mockSelectedTerritory,
	mockSelectedSchoollevel,
	mockSelectedSchoolType,
	mockSelectedSchool;

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
	mockResultFilter = MockSchoolFilterData.result;
	for (const item in mockResultFilter) {
		filters.push(mockResultFilter[item]);
	}
	let levelArray = filters.find((filter) => filter.id === "school_level");
	mockLevelData = levelArray ? mockMappingData(levelArray.data) : null;
	let territoryArray = filters.find((filter) => filter.id === "territory");
	mockTerritoryData = territoryArray ? mockMappingData(territoryArray.data) : null;
	let typeArray = filters.find((filter) => filter.id === "school_type");
	mockTypeData = typeArray ? mockMappingData(typeArray.data) : null;
	let schoolArray = filters.find((filter) => filter.id === "schools");
	mockSchoolData = schoolArray ? mockMappingData(schoolArray.data) : null;
}

function resetAll() {
	getData();
	mockFunction = jest.fn();
	mockQuery = "Another";
	mockUserData = MockUser[3];
	mockSelectedTerritory = mockTerritoryData[0];
	mockSelectedSchoollevel = mockLevelData[0];
	mockSelectedSchoolType = mockTypeData[0];
	mockSelectedSchool = mockSchoolData[0];
	props = {
		territoryData: mockTerritoryData,
		levelData: mockLevelData,
		typeData: mockTypeData,
		schoolData: mockSchoolData,
		selectedTerritory: mockSelectedTerritory,
		selectedSchoollevel: mockSelectedSchoollevel,
		selectedSchoolType: mockSelectedSchoolType,
		selectedSchools: mockSelectedSchool,
		currentUserRole: mockUserData.role,
		handlefilterSelection: mockFunction,
		filterText: mockQuery,
		queryPlaceHolderText: " Search ..",
		filtersLength: 2,
		doSearch: mockFunction,
		resetAll: mockFunction,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly*/
test("Component renders correctly", async () => {
	delete props.filtersLength;
	const item = mount(<SearchFilters {...props} />);
	expect(item.find("WrapForm").length).toBe(1);
	expect(item.find("AutoSelect").length).toBe(4);
});

/** Component renders correctly without pass dropdown data*/
test("Component renders correctly without pass dropdown data", async () => {
	props.territoryData = null;
	props.levelData = null;
	props.typeData = null;
	props.schoolData = null;
	const item = mount(<SearchFilters {...props} />);
	expect(item.find("WrapForm").length).toBe(1);
});

/** Component renders correctly with submit and reset button*/
test("Component render with buttons", async () => {
	props.queryPlaceHolderText = "";
	props.currentUserRole = UserRole.schoolAdmin;
	const item = shallow(<SearchFilters {...props} />);
	expect(item.find("SubmitButton").length).toBe(2);
	expect(item.find('button[name="Search"]').length).toBe(0);
	expect(item.find('button[name="Reset"]').length).toBe(0);
});

/** Component renders correctly with Filterlist*/
test("Component render with Filterlist", async () => {
	props.filtersLength = 3;
	props.currentUserRole = UserRole.schoolAdmin;
	const item = shallow(<SearchFilters {...props} />);
	const SearchButtonSection = item.find("SearchButtonSection");
	expect(SearchButtonSection.props().numberOfFilters).toEqual(3);
});

/** User click on submit for search*/
test("User click on submit for search", async () => {
	const item = shallow(<SearchFilters {...props} />);
	const spy = jest.spyOn(item.instance(), "handleSearch");
	item.instance().handleSearch({ preventDefault: jest.fn(), target: { elements: { search: { value: "another" } } } });
	expect(spy).toHaveBeenCalled();
});

/** User click on submit and called props function too*/
test("User click on submit and called props function too", async () => {
	const item = shallow(<SearchFilters {...props} />);
	item.instance().handleSearch({ preventDefault: jest.fn(), target: { elements: { search: { value: "another" } } } });
	expect(props.doSearch).toHaveBeenCalled();
});

/** User click on submit and called onfocus function*/
test("User click on submit and called onfocus function", async () => {
	const item = shallow(<SearchFilters {...props} />);
	item.instance().onFocus = jest.fn();
	item.instance().handleSearch({ preventDefault: jest.fn(), target: { elements: { search: { value: "another" } } } });
	//before
	expect(item.instance().onFocus).toHaveBeenCalled();
	expect(props.doSearch).toHaveBeenCalled();
	//after
	expect(item.instance().onFocus).toHaveBeenCalled();
});

/** User click on ResetAll button for clear the filters*/
test("User click on resetAll button", async () => {
	const item = shallow(<SearchFilters {...props} />);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	item.find('[name="Reset"]').simulate("click", { preventDefault: mockFunction });
	expect(mockFunction).toHaveBeenCalled();
});

/** Called props reset function */
test("User click on resetAll button and after its called the props event", async () => {
	const item = shallow(<SearchFilters {...props} />);
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
	const item = shallow(<SearchFilters {...props} />);
	await wait(20);
	const inputSearch = item.find('[name="search"]');

	inputSearch.simulate("change", {
		preventDefault: jest.fn(),
		target: {
			name: "search",
			value: "another school",
		},
	});
	expect(props.handlefilterSelection).toHaveBeenCalled();
});

/** User filter Territory drop down */
test("User filter territory dropdown", async () => {
	const item = shallow(<SearchFilters {...props} />);
	await wait(20);
	item.instance().handleTerritoryDrpChange(mockTerritoryData[0]);
	expect(props.handlefilterSelection).toHaveBeenCalled();
});

/** User filter SchoolLevel drop down */
test("User filter SchoolLevel dropdown", async () => {
	const item = shallow(<SearchFilters {...props} />);
	await wait(20);
	item.instance().handleSchoolLevelDrpChange(mockLevelData[0]);
	expect(props.handlefilterSelection).toHaveBeenCalled();
});

/** User filter SchoolType drop down */
test("User filter SchoolType dropdown", async () => {
	const item = shallow(<SearchFilters {...props} />);
	await wait(20);
	item.instance().handleSchoolTypeDrpChange(mockLevelData[0]);
	expect(props.handlefilterSelection).toHaveBeenCalled();
});

/** User log in with cla-admin show school dropdown control */
test("User log in with cla-admin show school dropdown control", async () => {
	const item = shallow(<SearchFilters {...props} />);
	await wait(20);
	expect(item.find('[name="School"]').length).toBe(1);
});

/** User log in with school-admin/teacher hide school dropdown control */
test("User log in with school-admin/teacher hide school dropdown control", async () => {
	props.schoolData = [];
	props.currentUserRole = UserRole.schoolAdmin;
	const item = shallow(<SearchFilters {...props} />);
	await wait(20);
	expect(item.find('[name="School"]').length).toBe(0);
});

/** User filter school drop down */
test("User filter school dropdown", async () => {
	props.selectedSchools = [];
	const item = shallow(<SearchFilters {...props} />);
	await wait(20);
	item.instance().handleSchoolDrpChange(mockSchoolData[0]);
	expect(props.handlefilterSelection).toHaveBeenCalled();
});
