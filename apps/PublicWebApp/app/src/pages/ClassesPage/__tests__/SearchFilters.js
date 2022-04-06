// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import SearchFilters from "../SearchFilters";
import MockUser from "../../../mocks/MockUser";
import MockClassFilterData from "../../../mocks/MockClassFilterData";
import UserRole from "../../../common/UserRole";

let mockUserData,
	props,
	mockFunction,
	mockQuery,
	mockSchoolData,
	mockExamBoardData,
	mockKeyStagesData,
	mockResultFilter,
	filters,
	mockSelectedSchool,
	mockSelectedExamBoard,
	mockSelectedKeyStages,
	mockfiltersLength;

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
	mockResultFilter = MockClassFilterData.result;
	for (const item in mockResultFilter) {
		filters.push(mockResultFilter[item]);
	}
	let examBoardArray = filters.find((filter) => filter.id === "exam_board");
	mockExamBoardData = examBoardArray ? mockMappingData(examBoardArray.data) : null;
	let schoolArray = filters.find((filter) => filter.id === "schools");
	mockSchoolData = schoolArray ? mockMappingData(schoolArray.data) : null;
	let keyStagesArray = filters.find((filter) => filter.id === "key_stage");
	mockKeyStagesData = keyStagesArray ? mockMappingData(keyStagesArray.data) : null;
}

function resetAll() {
	getData();
	mockFunction = jest.fn();
	mockQuery = "Another";
	mockUserData = MockUser[3];
	mockSelectedSchool = mockSchoolData[0];
	mockSelectedExamBoard = mockExamBoardData[0];
	mockSelectedKeyStages = mockKeyStagesData[1];
	mockfiltersLength = 3;
	props = {
		schoolData: mockSchoolData,
		examBoardData: mockExamBoardData,
		keyStagesData: mockKeyStagesData,
		selectedSchools: mockSelectedSchool,
		selectedExamBoard: mockSelectedExamBoard,
		selectedKeyStage: mockSelectedKeyStages,
		currentUserRole: mockUserData.role,
		handlefilterSelection: mockFunction,
		filterText: mockQuery,
		queryPlaceHolderText: " Search ..",
		doSearch: mockFunction,
		resetAll: mockFunction,
		filtersLength: mockfiltersLength,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly*/
test("Component renders correctly", async () => {
	const item = mount(<SearchFilters {...props} />);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.find("WrapForm").length).toBe(1);
	expect(item.find('[name="School"]').length > 0).toBe(true);
	expect(item.find('[name="ExamBoard"]').length > 0).toBe(true);
	expect(item.find('[name="keyStages"]').length > 0).toBe(true);
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
	props.mockQuery = [];
	const item = shallow(<SearchFilters {...props} />);
	await wait(20);
	const inputSearch = item.find('[name="SearchQuery"]');

	inputSearch.simulate("change", {
		preventDefault: jest.fn(),
		target: {
			name: "search",
			value: "english",
		},
	});
	expect(props.handlefilterSelection).toHaveBeenCalled();
});

/** User filter school drop down */
test("User filter school dropdown", async () => {
	props.selectedSchools = [];
	const item = shallow(<SearchFilters {...props} />);
	await wait(20);
	item.instance().handleSchoolDrpChange(mockSchoolData[0]);
	expect(props.handlefilterSelection).toHaveBeenCalled();
});

/** User filter examboard drop down */
test("User filter examboard dropdown", async () => {
	props.selectedSchools = [];
	const item = shallow(<SearchFilters {...props} />);
	await wait(20);
	item.instance().handleExamBoardDrpChange(mockExamBoardData[0]);
	expect(props.handlefilterSelection).toHaveBeenCalled();
});

test("User filter with key stages dropdown", async () => {
	props.selectedKeyStage = [];
	const item = shallow(<SearchFilters {...props} />);
	await wait(20);
	item.instance().handleKeyStageDrpChange(mockKeyStagesData[0]);
	expect(props.handlefilterSelection).toHaveBeenCalled();
});

test("User not getiing any dropdown filters", async () => {
	props.schoolData = null;
	props.examBoardData = null;
	props.keyStagesData = null;
	props.examBoardData = null;
	props.filtersLength = 0;
	const item = shallow(<SearchFilters {...props} />);
	await wait(20);
	expect(item.find('[name="School"]').length).toEqual(0);
	expect(item.find('[name="ExamBoard"]').length).toBe(0);
	expect(item.find('[name="keyStages"]').length).toBe(0);
});

/** User login as 'school-admin' dont display the school filters */
test(`User login as 'school-admin'`, async () => {
	props.currentUserRole = "school-admin";
	props.filtersLength = 2;
	const item = shallow(<SearchFilters {...props} />);
	await wait(20);
	expect(item.find('[name="School"]').length).toEqual(0);
});
