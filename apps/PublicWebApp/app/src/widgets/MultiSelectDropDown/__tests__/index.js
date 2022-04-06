// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import MultiSelectDropDown from "../index";
import MockClassFilterData from "../../../mocks/MockClassFilterData";

let mockUserData,
	props,
	mockFunction,
	mcokQuery,
	mockSchoolData,
	mockExamBoardData,
	mockResultFilter,
	filters,
	mockSelectedSchool,
	mockSelectedExamBoard;

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

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
	let schoolArray = filters.find((filter) => filter.id === "schools");
	mockSchoolData = schoolArray ? mockMappingData(schoolArray.data) : null;
}

function resetAll() {
	getData();
	mockFunction = jest.fn();
	mockSelectedSchool = mockSchoolData[0];
	props = {
		name: "Select",
		options: mockSchoolData,
		selectedData: mockSelectedSchool,
		placeholder: " Search ..",
		eventName: mockFunction,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly*/
test(`Component renders correctly`, async () => {
	const item = mount(<MultiSelectDropDown {...props} />);
	expect(item.find("FormContainer").length).toBe(1);
});

test(`Component renders correctly with flyOutIndex 0`, async () => {
	const item = mount(<MultiSelectDropDown {...props} />);
	item.setProps({ flyOutIndex: 0 });
	expect(item.find("FormContainer").length).toBe(1);
});

/** User change the dropdown value */
test(`User change the dropdown value`, async () => {
	props.isBgDark = true;
	props.isWidthFull = true;
	props.isMarginRequiredInResponsive = true;
	props.isLabelRequired = false;
	props.isMulti = false;
	props.styles = { color: "red" };
	const item = shallow(<MultiSelectDropDown {...props} />);
	const selectdrp = item.find('[name="Select"]');
	selectdrp.simulate("change");
	expect(mockFunction).toHaveBeenCalled();
});

/** Test styled functions */
test(`Test styled functions`, async () => {
	props.isBgDark = true;
	props.isWidthFull = true;
	props.isMarginRequiredInResponsive = true;
	props.isLabelRequired = false;
	props.isMulti = false;
	props.areOptionLinks = true;
	props.styles = { color: "red" };
	const item = shallow(<MultiSelectDropDown {...props} />);
	const selectdrp = item.find('[name="Select"]');
	selectdrp.simulate("change");
	expect(mockFunction).toHaveBeenCalled();
	expect(item.find("AutoSelect").props().styles.control()).toEqual({
		background: "#006473",
		color: "#ffffff",
		border: "none",
		borderRadius: "0px",
	});

	const base = {
		border: "none",
	};
	expect(item.find("AutoSelect").props().styles.placeholder(base)).toEqual({ border: "none", color: "#ffffff" });
	expect(item.find("AutoSelect").props().styles.singleValue()).toEqual({ color: "#ffffff" });
	expect(item.find("AutoSelect").props().styles.multiValue()).toEqual({ color: "#ffffff" });
	expect(item.find("AutoSelect").props().styles.indicatorSeparator()).toEqual({ display: "none" });
});
