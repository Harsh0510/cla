// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import SearchFilters from "../SearchFilters";
import MockUnlocImageUploads from "../../../mocks/MockUnlocImageUploadData";
import MockUser from "../../../mocks/MockUser";
import UserRole from "../../../common/UserRole";

let MockUnlocImageUploadsData, mockUserData, props, mockFunction, mockQuery;

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
	MockUnlocImageUploadsData = MockUnlocImageUploads;
}

function resetAll() {
	getData();
	mockFunction = jest.fn();
	mockQuery = "Another";
	mockUserData = MockUser[4];
	props = {
		currentUserRole: mockUserData.role,
		handlefilterSelection: mockFunction,
		filterText: mockQuery,
		queryPlaceHolderText: " Search ..",
		doSearch: mockFunction,
		resetAll: mockFunction,
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
});

/** Component renders correctly with submit and reset button*/
test("Component render with buttons", async () => {
	props.queryPlaceHolderText = "";
	props.currentUserRole = UserRole.claAdmin;
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
	props.mockQuery = "";
	const item = shallow(<SearchFilters {...props} />);
	await wait(20);
	const inputSearch = item.find('[name="SearchQuery"]');

	inputSearch.simulate("change", {
		preventDefault: jest.fn(),
		target: {
			name: "search",
			value: "sagar school",
		},
	});
	expect(props.handlefilterSelection).toHaveBeenCalled();
});
