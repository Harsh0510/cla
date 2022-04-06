// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import AjaxSearchableDropdown from "../index";
import { faArrowAltCircleDown } from "@fortawesome/free-solid-svg-icons";
import staticValues from "../../../common/staticValues";
import { object } from "prop-types";

let props = Object.create(null),
	mockResult = [];

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);

jest.mock("../../../common/cacher", () => {
	return {
		createCachedAsyncFn: (cb) => {
			return cb;
		},
	};
});

async function defaultApi(url, params) {
	return new Promise((resolve, reject) => resolve(mockResult));
}

/** wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

const mockFun = jest.fn();

/**
 * Reset function
 **/
function resetAll() {
	mockResult = {
		result: [
			{ id: 1, name: "Test1" },
			{ id: 2, name: "Test3" },
		],
	};
	props = {
		name: "drodownitem",
		title: "class",
		value: null,
		placeholder: "Placeholder text",
		valid: true,
		disabled: false,
		// singleValueFieldColor: false,
		requestApi: "api/public/course-search",
		multiple: false,
		toolTipText: "Please select a class",
		onChange: mockFun,
		onBlur: mockFun,
		api: defaultApi,
		limit: 5,
		minQueryLength: 2,
		isUsedInForm: false,
		styles: null,
		required: false,
		performApiCallWhenEmpty: true,
		highlightOnError: true,
		showDefaultToolTipOnError: true,
		extractOid: "fac1813fea6267d09149406da6abea1de1ad",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/**Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<AjaxSearchableDropdown {...props} />);

	expect(item.find("AutoSelect").length).toBe(1);
});

test("User select the different item from dropdown", async () => {
	let mockCallback = jest.fn();
	const item = shallow(<AjaxSearchableDropdown {...props} />);
	const select = item.find("AutoSelect");
	item.instance().loadOptions("test", mockCallback);
	await wait(300);
	expect(mockCallback).toHaveBeenCalled();
});

test("When No drodownitem Available from Search", async () => {
	mockResult = { result: [] };
	delete props.minQueryLength;
	const item = shallow(<AjaxSearchableDropdown {...props} />);
	let OptionMsg = item.instance().noOptionsMessage({ inputValue: "" });
	await wait(200);
	expect(OptionMsg).toBe(staticValues.ajaxSearchableDropDown.defaultSearchInputMessage);
});

test("User Search with the query and get different messages", async () => {
	mockResult = { result: [] };

	const item = shallow(<AjaxSearchableDropdown {...props} />);
	let OptionMsg = null;
	OptionMsg = item.instance().noOptionsMessage({ inputValue: "" });
	expect(OptionMsg).toBe(staticValues.ajaxSearchableDropDown.defaultSearchInputMessage);

	OptionMsg = item.instance().noOptionsMessage({ inputValue: "c" });
	expect(OptionMsg).toBe("Type at least 2 characters to view results");

	OptionMsg = item.instance().noOptionsMessage({ inputValue: "test1" });
	item.instance().onChange({ id: 1, title: "test1", key: 1 });
	expect(OptionMsg).toBe(staticValues.ajaxSearchableDropDown.noRecordsOptionMessage);
	expect(mockFun).toHaveBeenCalled();
});

test("When Component is used in Form", async () => {
	props.isUsedInForm = true;
	props.value = [{ id: 1, title: "test", key: 1 }];

	const item = shallow(<AjaxSearchableDropdown {...props} />);

	let mockIsValid = item.instance().isValid();
	expect(mockIsValid).toBe(true);

	const item2 = shallow(<AjaxSearchableDropdown {...props} />);
	item.instance().onChange([{ id: 1, title: "test", key: 1 }]);
	item.instance().onBlur([{ id: 1, title: "test", key: 1 }]);
	mockIsValid = item2.instance().isValid();
	expect(mockIsValid).toBe(true);
});

/* --- When Blur With Empty Value and field is not Required --- */
test("When Component is used in Form with not required field", async () => {
	props.value = [{ id: 1, title: "test", key: 1 }];
	props.required = false;
	const item = shallow(<AjaxSearchableDropdown {...props} />);
	item.instance().onChange("");
	item.instance().onBlur("");
	let mockIsValid = item.instance().isValid();
	expect(mockIsValid).toBe(true);
	props.value = [];
	const item2 = shallow(<AjaxSearchableDropdown {...props} />);

	mockIsValid = item2.instance().isValid();
	expect(mockIsValid).toBe(true);
});

test('User showing the popup message "Please fill in this field"', async () => {
	props.required = true;
	props.title = "dropdownitem";
	const item = shallow(<AjaxSearchableDropdown {...props} />);
	const validResult = item.instance().fieldIsValid();
	expect(validResult).toEqual({
		isValid: false,
		errorType: "required",
		message: "dropdownitem is required.",
	});
});

test("User select the dropdownitem from the list and go to another field", async () => {
	let mockAPI = jest.fn();
	const inputValue = "test";

	let result = [];
	const mockCallback = (test) => {
		result = test;
	};
	const item = shallow(<AjaxSearchableDropdown {...props} />);
	const spy = jest.spyOn(item.instance(), "onChange");
	const spy1 = jest.spyOn(item.instance(), "onBlur");
	item.instance().loadOptions(inputValue, mockCallback);
	expect(item.state().inputValue).toEqual(inputValue);
	await wait(400);
	expect(item.state().inputValue).toEqual(inputValue);

	item.instance().onChange({ id: 2, name: "Test2" });
	item.instance().onBlur({ id: 2, name: "Test2" });
	expect(spy).toHaveBeenCalled();
});

test("User See the tooltip", async () => {
	props.toolTipText = "please select a class";
	const item = shallow(<AjaxSearchableDropdown {...props} />);
	expect(item.find("ToolTipContent").length).toBe(1);
	expect(item.find("ToolTipContent").text()).toBe("please select a class");
});

test("User Search with the query less than query limit", async () => {
	let mockCallback = jest.fn();
	const inputValue = "ttt";
	props.minQueryLength = 2;
	mockResult = {
		result: [],
	};
	props.api = defaultApi;
	const item = shallow(<AjaxSearchableDropdown {...props} />);

	item.instance().loadOptions(inputValue, mockCallback);
	expect(item.state().inputValue).toEqual(inputValue);
	await wait(400);
	expect(item.state().inputValue).toEqual(inputValue);
});

test("User Search with the query and get different messages", async () => {
	let mockCallback = jest.fn();
	const inputValue = "t";

	const item = shallow(<AjaxSearchableDropdown {...props} />);

	item.instance().loadOptions(inputValue, mockCallback);
	expect(item.state().inputValue).toEqual(inputValue);
	await wait(400);
	expect(item.state().inputValue).toEqual(inputValue);
});

test("When componentDidUpdate", async () => {
	props.value = [{ id: 1, title: "test", key: 1 }];
	const item = shallow(<AjaxSearchableDropdown {...props} />);
	item.setProps({ value: null });
	await wait(50);
	expect(item.state("isLoading")).toBe(false);
});

test("When componentWillUnmount", async () => {
	const item = shallow(<AjaxSearchableDropdown {...props} />);
	item.instance().componentWillUnmount();
	await wait(50);
	expect(item.instance()._isMounted).toBe(undefined);
});
test("Called handleInputChange after componetWillUnmount", async () => {
	const inputValue = "";
	props.performApiCallWhenEmpty = true;
	props.minQueryLength = 2;
	props.limit = 0;
	mockResult = {
		result: [],
	};
	props.api = defaultApi;
	const item = shallow(<AjaxSearchableDropdown {...props} />);
	item.instance().componentWillUnmount();
	item.instance().handleInputChange(inputValue);

	expect(item.state().inputValue).toEqual(inputValue);
	await wait(400);
	expect(item.state().inputValue).toEqual(inputValue);
	expect(item.state("dropDownData")).not.toEqual([]);
});

test("When limit is greater then default limit", async () => {
	props.minQueryLength = "";
	props.limit = 27;
	mockResult = {
		result: [],
	};
	props.api = defaultApi;
	const item = shallow(<AjaxSearchableDropdown {...props} />);

	const getLimit = item.instance().getLimit();
	expect(getLimit).toEqual(25);
});

test("When limit not pass", async () => {
	let mockCallback = jest.fn();
	const inputValue = "ttt";
	props.minQueryLength = 2;
	props.limit = 0;
	props.api = defaultApi;
	const item = shallow(<AjaxSearchableDropdown {...props} />);

	item.instance().loadOptions(inputValue, mockCallback);
	expect(item.state().inputValue).toEqual(inputValue);
	await wait(400);
	expect(item.state().inputValue).toEqual(inputValue);
	expect(item.state("dropDownData").length).toEqual(2);
});

test("When onchange is not pass", async () => {
	let mockCallback = jest.fn();
	delete props.onChange;
	const item = shallow(<AjaxSearchableDropdown {...props} />);
	item.instance().onChange("");
	expect(mockCallback).not.toHaveBeenCalled();
});

test("When only required props are pass", async () => {
	delete props.valid;
	delete props.disabled;
	delete props.multiple;
	delete props.toolTipText;
	delete props.styles;
	delete props.minQueryLength;
	delete props.highlightOnError;
	delete props.required;
	const item = shallow(<AjaxSearchableDropdown {...props} />);
	expect(item.find("AutoSelect").length).toBe(1);
});

test("When highlightOnError is pass", async () => {
	props.highlightOnError = true;
	const item = shallow(<AjaxSearchableDropdown {...props} />);
	const AutoSelect = item.find("AutoSelect");
	expect(AutoSelect.props().styles).not.toEqual(null);
});

test("When value is pass", async () => {
	props.value = [{ value: "abc school", school_id: 1 }];
	props.highlightOnError = true;
	const item = shallow(<AjaxSearchableDropdown {...props} />);
	const AutoSelect = item.find("AutoSelect");
});

test("When title is not pass", async () => {
	delete props.title;
	const item = shallow(<AjaxSearchableDropdown {...props} />);
	expect(item.find("InputLabel").length).toBe(0);
});

test("When style is pass", async () => {
	props.style = { color: "white" };
	const item = shallow(<AjaxSearchableDropdown {...props} />);
	const div = item.find("div");
	expect(div.props().style).toEqual({ color: "white" });
});

test("Test isValid function when required is true ", async () => {
	delete props.value;
	props.required = true;
	const item = shallow(<AjaxSearchableDropdown {...props} />);
	const isValid = item.instance().isValid();
	expect(isValid).toEqual(false);
});

test("Test isValid function when required is false", async () => {
	delete props.value;
	props.required = false;
	const item = shallow(<AjaxSearchableDropdown {...props} />);
	const isValid = item.instance().isValid();
	expect(isValid).toEqual(true);
});

test("When query not pass but getting default 25 classes", async () => {
	const inputValue = "";
	props.minQueryLength = 2;
	props.limit = 0;
	mockResult = {
		result: [{ id: 1, title: "test", key: 1 }],
	};
	props.api = defaultApi;
	const item = shallow(<AjaxSearchableDropdown {...props} />);
	item.instance().handleInputChange(inputValue);

	expect(item.state().inputValue).toEqual(inputValue);
	await wait(400);
	expect(item.state().inputValue).toEqual(inputValue);
	expect(item.state("dropDownData")).not.toEqual([]);
});

test("When query pass and getting default 25 classes", async () => {
	const inputValue = "ttt";
	props.minQueryLength = 2;
	props.limit = 0;
	props.api = defaultApi;
	const item = shallow(<AjaxSearchableDropdown {...props} />);
	item.instance().handleInputChange(inputValue);

	expect(item.state().inputValue).toEqual(inputValue);
	await wait(400);
	expect(item.state().inputValue).toEqual(inputValue);
	expect(item.state("dropDownData")).not.toEqual([]);
});

test("When query not pass and getting default 25 classes", async () => {
	const inputValue = "";
	props.performApiCallWhenEmpty = false;
	props.minQueryLength = 2;
	props.limit = 0;
	props.api = defaultApi;
	const item = shallow(<AjaxSearchableDropdown {...props} />);
	item.instance().handleInputChange(inputValue);

	expect(item.state().inputValue).toEqual(inputValue);
	await wait(400);
	expect(item.state().inputValue).toEqual(inputValue);
	expect(item.state("dropDownData")).toEqual([]);
});

test("When minQueryLength not pass", async () => {
	let mockCallback = jest.fn();
	const inputValue = "ttt";
	props.minQueryLength = 0;
	props.limit = 25;
	props.api = defaultApi;
	const item = shallow(<AjaxSearchableDropdown {...props} />);

	item.instance().loadOptions(inputValue, mockCallback);
	expect(item.state().inputValue).toEqual(inputValue);
	await wait(400);
	expect(item.state().inputValue).toEqual(inputValue);
	expect(item.state("dropDownData").length).toEqual(2);
});

test("Update the API Params call When getting the search result", async () => {
	const inputValue = "ttt";
	let newApiParams = null;
	props.minQueryLength = 2;
	props.requestApi = "/auth/get-schools";
	props.updateApiCall = function (url, params) {
		const newParams = Object.create(null);
		newParams.city = "test";
		newParams.postCode = "123456";
		if (params && params.query) {
			newParams.query = params.query;
		}
		newApiParams = newParams;
		return { url: url, params: newParams };
	};
	props.limit = 0;
	props.api = defaultApi;
	const item = shallow(<AjaxSearchableDropdown {...props} />);
	item.instance().handleInputChange(inputValue);
	expect(item.state().inputValue).toEqual(inputValue);
	await wait(400);
	expect(item.state().inputValue).toEqual(inputValue);
	expect(item.state("dropDownData").length).toEqual(2);
	expect(newApiParams).not.toEqual(null);
	expect(newApiParams.city).toEqual("test");
	expect(newApiParams.postCode).toEqual("123456");
});
