// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import SearchFilters from "../SearchFilters";
import MockUser from "../../../mocks/MockUser";
import MockProcessingLogFilterData from "../../../mocks/mockAssetProccesingLogFilterData";

let mockUserData,
	props,
	mockFunction,
	mockQuery,
	mockStageData,
	mockHighPriorityData,
	mockSuccessData,
	mockResultFilter,
	filters,
	mockSelectedStage,
	mockSelectedHighPriority,
	mockSelectedSuccess,
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
	mockResultFilter = MockProcessingLogFilterData.result;
	for (const item in mockResultFilter) {
		filters.push(mockResultFilter[item]);
	}
	let stageArray = filters.find((filter) => filter.id === "stage");
	mockStageData = stageArray ? mockMappingData(stageArray.data) : null;
	let successArray = filters.find((filter) => filter.id === "success");
	mockSuccessData = successArray ? mockMappingData(successArray.data) : null;
	let highPriorityArray = filters.find((filter) => filter.id === "high_priority");
	mockHighPriorityData = highPriorityArray ? mockMappingData(highPriorityArray.data) : null;
}

function resetAll() {
	getData();
	mockFunction = jest.fn();
	mockQuery = "gg";
	mockUserData = MockUser[3];
	mockSelectedHighPriority = mockHighPriorityData[0];
	mockSelectedStage = mockStageData[0];
	mockSelectedHighPriority = mockHighPriorityData[1];
	mockfiltersLength = 4;
	props = {
		stageData: mockStageData,
		successData: mockSuccessData,
		highPriorityData: mockHighPriorityData,
		selectedstage: mockSelectedStage,
		selectedSuccess: mockSelectedSuccess,
		selectedHighPriority: mockSelectedHighPriority,
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
	expect(item.find('[name="Stage"]').length > 0).toBe(true);
	expect(item.find('[name="Success"]').length > 0).toBe(true);
});

/** Component renders correctly with submit and reset button*/
test("Component render with buttons", async () => {
	props.queryPlaceHolderText = "";
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

/** User filter stage drop down */
test("User filter stage dropdown", async () => {
	const item = shallow(<SearchFilters {...props} />);
	await wait(20);
	item.instance().handleStageDrpChange(mockStageData[0]);
	expect(props.handlefilterSelection).toHaveBeenCalled();
});

test("User filter with success dropdown", async () => {
	props.selectedSuccess = [];
	const item = shallow(<SearchFilters {...props} />);
	await wait(20);
	item.instance().handleSuccessDrpChange(mockSuccessData[0]);
	expect(props.handlefilterSelection).toHaveBeenCalled();
});

test("User not getiing any dropdown filters", async () => {
	props.stageData = null;
	props.highPriorityData = null;
	props.successData = null;
	props.filtersLength = 0;
	const item = shallow(<SearchFilters {...props} />);
	await wait(20);
	expect(item.find('[name="Stage"]').length).toBe(0);
	expect(item.find('[name="Success"]').length).toBe(0);
});

test("User getiing 2 dropdown filters stage and high priority", async () => {
	props.successData = null;
	props.filtersLength = 0;
	const item = shallow(<SearchFilters {...props} />);
	await wait(20);
	expect(item.find('[name="Stage"]').length > 0).toBe(true);
	expect(item.find('[name="Success"]').length).toBe(0);
});

test("User getiing 2 dropdown filters high priority and success", async () => {
	props.stageData = null;
	props.filtersLength = 0;
	const item = shallow(<SearchFilters {...props} />);
	await wait(20);
	expect(item.find('[name="Stage"]').length).toBe(0);
	expect(item.find('[name="Success"]').length > 0).toBe(true);
});
