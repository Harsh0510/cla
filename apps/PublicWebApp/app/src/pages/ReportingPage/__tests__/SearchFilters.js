import React from "react";
import { shallow, mount } from "enzyme";
import SearchFilters from "../SearchFilters";

let props, mockFunction;

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	mockFunction = jest.fn();
	props = {
		classData: [
			{ id: 1, title: "Demo class 1" },
			{ id: 2, title: "Demo class 2" },
			{ id: 3, title: "Demo class 3" },
		],
		selectedClass: [],
		handlefilterSelection: mockFunction,
		doSearch: mockFunction,
		resetAll: mockFunction,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders correctly", async () => {
	const item = shallow(<SearchFilters {...props} />);
	expect(item.find("WrapForm").length).toBe(1);
	expect(item.find("MultiSelectDropDown").length).toBe(1);
	expect(item.find("SubmitButton").length).toBe(2);
});

test("Component renders correctly without pass dropdown data", async () => {
	props.classData = null;
	props.filtersLength = 4;
	const item = mount(<SearchFilters {...props} />);
	expect(item.find("WrapForm").length).toBe(1);
	expect(item.find("MultiSelectDropDown").length).toBe(1);
	expect(item.find("SubmitButton").length).toBe(2);
});

test("Component render with buttons", async () => {
	const item = shallow(<SearchFilters {...props} />);
	expect(item.find("SubmitButton").length).toBe(2);
	expect(item.find('button[name="Search"]').length).toBe(0);
	expect(item.find('button[name="Reset"]').length).toBe(0);
});

test("User select the multi class from dropdown", async () => {
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

test("User select the class and click on submit for search", async () => {
	const item = shallow(<SearchFilters {...props} />);
	item.setProps({
		selectedClass: [
			{ value: 1, label: "Demo class 1", key: 1 },
			{ value: 2, label: "Demo class 2", key: 2 },
		],
	});
	item.instance().handleSearch({ preventDefault: jest.fn() });
	expect(props.doSearch).toHaveBeenCalled();
	expect(mockFunction).toHaveBeenCalled();
});

test("User click on submit and called props function too", async () => {
	const item = shallow(<SearchFilters {...props} />);
	item.instance().handleSearch({ preventDefault: jest.fn(), target: { elements: { search: { value: "another" } } } });
	expect(props.doSearch).toHaveBeenCalled();
});

test("User click on resetAll button", async () => {
	const item = shallow(<SearchFilters {...props} />);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	item.find('[name="Reset"]').simulate("click", { preventDefault: mockFunction });
	expect(props.resetAll).toHaveBeenCalled();
	expect(mockFunction).toHaveBeenCalled();
});

test("User click on resetAll button and after its called the props event", async () => {
	const item = shallow(<SearchFilters {...props} />);
	await wait(50);
	item.instance().forceUpdate();
	item.find('[name="Reset"]').simulate("click", { preventDefault: jest.fn() });
	expect(props.resetAll).toHaveBeenCalled();
	expect(mockFunction).toHaveBeenCalled();
});
