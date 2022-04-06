import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow, mount } from "enzyme";
import SearchFilters from "../SearchFilters";

let props, e;

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

/** wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	props = {
		handlefilterSelection: jest.fn(),
		doSearch: jest.fn(),
		resetAll: jest.fn(),
		filterLength: 1,
	};
	e = {
		preventDefault: jest.fn(),
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders Correctly", async () => {
	const item = shallow(<SearchFilters {...props} />);
	expect(item.find("WrapFormSection").length).toBe(1);
});

test(`search by query`, async () => {
	const item = shallow(<SearchFilters {...props} />);
	item.instance().handleQueryChange(e);
	expect(props.handlefilterSelection).toHaveBeenCalled();
});

test(`handle Search`, () => {
	const item = shallow(<SearchFilters {...props} />);
	item.instance().handleSearch(e);
	expect(props.doSearch).toHaveBeenCalled();
});

test(`Reset Filter`, () => {
	const item = shallow(<SearchFilters {...props} />);
	item.instance().handleResetAll(e);
	expect(props.resetAll).toHaveBeenCalled();
});

test(`When Status is Changes`, async () => {
	const item = shallow(<SearchFilters {...props} />);
	item.instance().handleStatusDrpChange(e);
	expect(props.handlefilterSelection).toHaveBeenCalled();
});

test(`when Status is selected`, async () => {
	let newProps = props;
	newProps.queryPlaceHolderText = "PlaceHolderText";
	newProps.statusData = [
		{
			title: "Read",
			value: 1,
		},
		{
			title: "Unead",
			value: 0,
		},
	];
	const item = shallow(<SearchFilters {...newProps} />);
	item.instance().inputField.current.value = "test";
	item.instance().onFocus();
	expect(item.find("MultiSelectDropDown").length).toBe(1);
});
