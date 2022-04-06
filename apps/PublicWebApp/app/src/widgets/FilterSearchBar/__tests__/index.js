// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import FilterSearchBar from "../index";

let props, mockCreateRefValue, mockFunction;

jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return {
			current: {
				focus: jest.fn(),
				value: mockCreateRefValue,
			},
		};
	};
});

function resetAll() {
	mockFunction = jest.fn();
	props = {
		queryPlaceHolderText: "Search School",
		filterText: "Another school",
		doSearch: mockFunction,
		resetAll: mockFunction,
		handlefilterSelection: mockFunction,
	};
	mockCreateRefValue = "another";
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<FilterSearchBar />);
	expect(item.find("WrapperForm").length).toBe(1);
	expect(item.find("StyledInput").length).toBe(1);
});

test("Component render with submit button and props", async () => {
	delete props.queryPlaceHolderText;
	const item = shallow(<FilterSearchBar {...props} />);
	expect(item.find("SubmitButton").length).toBe(2);
	expect(item.find("StyledInput").props().placeholder).toEqual("Search ");
});

test("User click on submit", async () => {
	const item = shallow(<FilterSearchBar {...props} />);
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

test("User click on reset button", async () => {
	const item = shallow(<FilterSearchBar {...props} />);
	const spy = jest.spyOn(item.instance(), "handleResetAll");
	item.instance().handleResetAll({ preventDefault: jest.fn() });
	expect(spy).toHaveBeenCalled();
});

test("Test when onChange event occured on Search Box", async () => {
	const item = shallow(<FilterSearchBar {...props} />);
	const spy = jest.spyOn(item.instance(), "handleQueryChange");
	item.instance().handleQueryChange({ preventDefault: jest.fn() });
	expect(spy).toHaveBeenCalled();
});

test("User click on submit and called props function too", async () => {
	const item = shallow(<FilterSearchBar {...props} />);
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
	const item = shallow(<FilterSearchBar {...props} />);
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

test("User click on submit with input value", async () => {
	const item = shallow(<FilterSearchBar {...props} />);
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
	expect(item.instance().onFocus).toHaveBeenCalled();
});

test("When called onfocus function without any value", async () => {
	mockCreateRefValue = "";
	const item = shallow(<FilterSearchBar {...props} />);
	item.instance().onFocus = jest.fn();
	item.instance().handleSearch({
		preventDefault: jest.fn(),
		target: {
			elements: {
				search: {
					value: "",
				},
			},
		},
	});
	expect(item.instance().onFocus).toHaveBeenCalled();
});
