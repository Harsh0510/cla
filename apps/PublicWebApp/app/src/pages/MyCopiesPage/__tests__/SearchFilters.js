// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import SearchFilters from "../SearchFilters";
import MockUser from "../../../mocks/MockUser";
import MockSchoolFilterData from "../../../mocks/MockSchoolFilterData";
import UserRole from "../../../common/UserRole";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

let mockUserData, props, mockFunction, mockRefInputField;

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return {
			current: {
				focus: jest.fn(),
				value: mockRefInputField,
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

function resetAll() {
	mockFunction = jest.fn();
	mockUserData = MockUser[3];
	mockRefInputField = "";
	props = {
		classData: [
			{ id: 1, title: "Demo class 1" },
			{ id: 2, title: "Demo class 2" },
			{ id: 3, title: "Demo class 3" },
		],
		selectedClass: [],
		handlefilterSelection: mockFunction,
		filterText: "",
		queryPlaceHolderText: "Seach ..",
		doSearch: mockFunction,
		resetAll: mockFunction,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly*/
test("Component renders correctly", async () => {
	props.queryPlaceHolderText = "";
	const item = shallow(<SearchFilters {...props} />);
	expect(item.find("WrapForm").length).toBe(1);
	expect(item.find("FormContainer").length).toBe(1);
	expect(item.find("MultiSelectDropDown").length).toBe(1);
	expect(item.find("SubmitButton").length).toBe(2);
});

/** Component renders correctly without pass dropdown data*/
test("Component renders correctly without pass dropdown data", async () => {
	props.classData = null;
	props.filtersLength = 4;
	const item = mount(<SearchFilters {...props} />);
	expect(item.find("WrapForm").length).toBe(1);
	expect(item.find("FormContainer").length).toBe(1);
	expect(item.find("MultiSelectDropDown").length).toBe(0);
	expect(item.find("SubmitButton").length).toBe(2);
});

/** Component renders correctly with submit and reset button*/
test("Component render with buttons", async () => {
	const item = shallow(<SearchFilters {...props} />);
	expect(item.find("SubmitButton").length).toBe(2);
	expect(item.find('button[name="Search"]').length).toBe(0);
	expect(item.find('button[name="Reset"]').length).toBe(0);
});

/** User change the search query */
test("User change the search query", async () => {
	mockRefInputField = "Test";
	props.filterText = mockRefInputField;
	const item = shallow(<SearchFilters {...props} />);
	await wait(30);
	const inputTextBox = item.find("StyledInput");
	inputTextBox.simulate("change", { preventDefault: jest.fn() });
	expect(props.handlefilterSelection).toHaveBeenCalled();
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

/** User select the multi class from dropdown */
test("User select the multi class from dropdown", async () => {
	mockRefInputField = "Test";
	props.filterText = mockRefInputField;
	props.selectedClass = [
		{ value: 1, label: "Demo class 1", key: 1 },
		{ value: 2, label: "Demo class 2", key: 2 },
	];
	const item = shallow(<SearchFilters {...props} />);
	await wait(30);
	item.instance().handleClassDrpChange(props.selectedClass);
	expect(props.handlefilterSelection).toHaveBeenCalled();
	expect(mockFunction).toHaveBeenCalled();
});

/** User enter the search query and select the filter data and click on submit for search*/
test("User enter the search query and select the filter data and click on submit for search", async () => {
	const item = shallow(<SearchFilters {...props} />);
	item.setProps({
		selectedClass: [
			{ value: 1, label: "Demo class 1", key: 1 },
			{ value: 2, label: "Demo class 2", key: 2 },
		],
		filterText: "test",
	});
	item.instance().handleSearch({ preventDefault: jest.fn() });
	expect(props.doSearch).toHaveBeenCalled();
	expect(mockFunction).toHaveBeenCalled();
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
	expect(props.resetAll).toHaveBeenCalled();
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
