// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import SearchFilters from "../SerachFilter";

let mockUserData;
let props;
let mockFunction;
let mockQuery;
let mockInstitutionData;
let mockFalgsData;
let mockResultFilter;
let filters;
let mockSelectedInstitution;
let mockSelectedFlags;
let mockUserSearchFilterData;

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
	mockUserSearchFilterData = {
		result: [
			{
				id: "flags",
				title: "Flags",
				data: [
					{
						id: "chapter",
						title: "Chapter",
					},
					{
						id: "over_5",
						title: "Over 5%",
					},
					{
						id: "incorrect_pdf_page_count",
						title: "Incorrect PDF page count",
					},
				],
			},
			{
				id: "institutions",
				title: "Institutions",
				data: [],
			},
		],
	};
	mockResultFilter = mockUserSearchFilterData.result;
	for (const item in mockResultFilter) {
		filters.push(mockResultFilter[item]);
	}
	let flagArray = filters.find((filter) => filter.id === "flags");
	mockFalgsData = flagArray ? mockMappingData(flagArray.data) : null;
	let institutionArray = filters.find((filter) => filter.id === "institutions");
	mockInstitutionData = institutionArray ? mockMappingData(institutionArray.data) : null;
}

function resetAll() {
	getData();
	mockFunction = jest.fn();
	mockQuery = "test";
	mockSelectedInstitution = mockInstitutionData[0];
	mockSelectedFlags = mockFalgsData[0];
	props = {
		institutionData: mockInstitutionData,
		falgsData: mockFalgsData,
		selectedInstitutions: mockSelectedInstitution,
		selectedFlags: mockSelectedFlags,
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
	const item = mount(<SearchFilters {...props} />);
	expect(item.find("WrapForm").length).toBe(1);
});

test("Component render with buttons", async () => {
	props.queryPlaceHolderText = "";
	const item = shallow(<SearchFilters {...props} />);
	expect(item.find("SubmitButton").length).toBe(2);
	expect(item.find('button[name="Search"]').length).toBe(0);
	expect(item.find('button[name="Reset"]').length).toBe(0);
});

test("User click on submit for search", async () => {
	const item = shallow(<SearchFilters {...props} />);
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

test("User click on submit and called props function too", async () => {
	const item = shallow(<SearchFilters {...props} />);
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

test("User click on submit and called onfocus function", async () => {
	const item = shallow(<SearchFilters {...props} />);
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

test("User click on resetAll button", async () => {
	const item = shallow(<SearchFilters {...props} />);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	item.find('[name="Reset"]').simulate("click", { preventDefault: mockFunction });
	expect(mockFunction).toHaveBeenCalled();
});

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

test("User Search any Query", async () => {
	props.mockQuery = "";
	const item = shallow(<SearchFilters {...props} />);
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

test("User filter school dropdown", async () => {
	props.selectedInstitutions = [];
	const item = shallow(<SearchFilters {...props} />);
	await wait(20);
	item.instance().handleSchoolDrpChange(mockInstitutionData[0]);
	expect(props.handlefilterSelection).toHaveBeenCalled();
});

test("User filter role dropdown", async () => {
	props.selectedInstitutions = [];
	const item = shallow(<SearchFilters {...props} />);
	await wait(20);
	item.instance().handleFlagDrpChange(mockFalgsData[0]);
	expect(props.handlefilterSelection).toHaveBeenCalled();
});

test("Render components without passimg the lengthOfFilters", async () => {
	delete props.filtersLength;
	const item = shallow(<SearchFilters {...props} />);
	await wait(20);

	expect(item.find("WrapForm").length).toEqual(1);
	expect(item.find('[name="search"]').length > 0).toBe(true);
});
