// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import AsyncSchoolFilter from "../index";
import { faArrowAltCircleDown } from "@fortawesome/free-solid-svg-icons";
import staticValues from "../../../common/staticValues";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

function defaultApi(url, params) {
	let result = {
		result: [
			{ id: 1, name: "Test1" },
			{ id: 2, title: "Test3" },
		],
	};
	return new Promise((resolve, reject) => resolve(result));
}

/** wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

const mockFun = jest.fn();

/**Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<AsyncSchoolFilter title={"school"} name="school" onChange={mockFun} value={[]} api={mockFun} />);

	expect(item.find("AutoSelect").length).toBe(1);
});

/**User select the different school from dropdown*/
test("User select the different school from dropdown", async () => {
	let mockCallback = jest.fn();
	const item = shallow(<AsyncSchoolFilter title={"school"} name="school" onChange={mockFun} value={[]} api={defaultApi} limit={5} />);
	const select = item.find("AutoSelect");
	item.instance().loadOptions("test", mockCallback);
	await wait(300);
	expect(mockCallback).toHaveBeenCalled();
});

test("When No School Available from Search", async () => {
	const item = shallow(<AsyncSchoolFilter title={"school"} name="school" onChange={mockFun} value={[]} api={defaultApi} isMulti={true} />);
	let OptionMsg = item.instance().noOptionsMessage({ inputValue: "" });
	await wait(200);
	expect(OptionMsg).toBe(staticValues.schoolAsyncDropDown.defaultSearchInputMessage);
});

test("User Search with the query and get different messages", async () => {
	function defaultApi(url, params) {
		let result = {
			result: [],
		};
		return new Promise((resolve, reject) => resolve(result));
	}

	const item = shallow(
		<AsyncSchoolFilter
			title={"school"}
			name="school"
			onChange={mockFun}
			value={[]}
			api={defaultApi}
			request_URL="test"
			isLabelRequired={false}
			isMulti={false}
		/>
	);
	let OptionMsg = null;
	OptionMsg = item.instance().noOptionsMessage({ inputValue: "" });
	expect(OptionMsg).toBe(staticValues.schoolAsyncDropDown.defaultSearchInputMessage);

	OptionMsg = item.instance().noOptionsMessage({ inputValue: "cu" });
	expect(OptionMsg).toBe(staticValues.schoolAsyncDropDown.continueSearchInputMessage);

	OptionMsg = item.instance().noOptionsMessage({ inputValue: "test1" });
	item.instance().onChange({ id: 1, title: "test1", key: 1 });
	expect(OptionMsg).toBe(staticValues.schoolAsyncDropDown.noRecordsOptionMessage);
	expect(mockFun).toHaveBeenCalled();
});

/* When Typed Keyword is less than 3 character */

test("When Component is used in Form", async () => {
	function defaultApi(url, params) {
		let result = {
			result: [],
		};
		return new Promise((resolve, reject) => resolve(result));
	}

	const item = shallow(
		<AsyncSchoolFilter
			title={"school"}
			name="school"
			onChange={mockFun}
			value={""}
			api={defaultApi}
			request_URL="test"
			isLabelRequired={false}
			isMulti={false}
			isUsedInForm={true}
			isRequired={true}
		/>
	);

	let mockIsValid = item.instance().isValid();
	expect(mockIsValid).toBe(false);

	const item2 = shallow(
		<AsyncSchoolFilter
			title={"school"}
			name="school"
			onChange={mockFun}
			value={[{ id: 1, title: "test", key: 1 }]}
			api={defaultApi}
			request_URL="test"
			isLabelRequired={false}
			isMulti={false}
			isUsedInForm={true}
			isRequired={true}
		/>
	);
	item.instance().onChange([{ id: 1, title: "test", key: 1 }]);
	mockIsValid = item2.instance().isValid();
	expect(mockIsValid).toBe(true);
});

/* --- When Blur With Empty Value and field is not Required --- */
test("When Component is used in Form with not required field", async () => {
	const item = shallow(
		<AsyncSchoolFilter
			title={"school"}
			name="school"
			onChange={mockFun}
			value={[{ id: 1, title: "test", key: 1 }]}
			api={defaultApi}
			request_URL="test"
			isLabelRequired={false}
			isMulti={false}
			isUsedInForm={true}
			isRequired={false}
			isBgDark={true}
		/>
	);
	item.instance().onChange("");
	let mockIsValid = item.instance().isValid();
	expect(mockIsValid).toBe(true);

	const item2 = shallow(
		<AsyncSchoolFilter
			title={"school"}
			name="school"
			onChange={mockFun}
			value={""}
			api={defaultApi}
			request_URL="test"
			isLabelRequired={false}
			isMulti={false}
			isUsedInForm={true}
			isRequired={false}
			isBgDark={true}
			styles={"color:red"}
		/>
	);

	mockIsValid = item2.instance().isValid();
	expect(mockIsValid).toBe(true);
});

/**User see not show more thean 25 rows in results*/
test("User select the different school from dropdown", async () => {
	let apiParams = "";
	let apiURL = "";
	function api(url, params) {
		apiParams = params;
		apiURL = url;
		let result = {
			result: [
				{ id: 1, name: "Test1" },
				{ id: 2, title: "Test3" },
			],
		};
		return new Promise((resolve, reject) => resolve(result));
	}
	const inputValue = "test";
	let result = [];
	const mockCallback = (test) => {
		result = test;
	};
	const item = shallow(<AsyncSchoolFilter title={"school"} name="school" onChange={mockFun} value={[]} api={api} limit={50} />);
	item.instance().loadOptions(inputValue, mockCallback);
	await wait(400);

	expect(item.state().inputValue).toEqual(inputValue);
	expect(result.length).toEqual(2);
	expect(apiParams.limit).toEqual(25);
	expect(apiParams.query).toEqual("test");
	expect(apiURL).toEqual(staticValues.api.schoolRequestApi);
});

test("User not show more than 25 rows in dropdown options", async () => {
	let apiParams = "";
	let apiURL = "";
	function api(url, params) {
		apiParams = params;
		apiURL = url;
		let result = {
			result: [
				{ id: 1, name: "Test1" },
				{ id: 2, title: "Test3" },
			],
		};
		return new Promise((resolve, reject) => resolve(result));
	}
	const inputValue = "test";
	let result = [];
	const mockCallback = (test) => {
		result = test;
	};
	const item = shallow(<AsyncSchoolFilter title={"school"} name="school" onChange={mockFun} value={[]} api={api} />);
	item.instance().loadOptions(inputValue, mockCallback);
	await wait(400);

	expect(item.state().inputValue).toEqual(inputValue);
	expect(result.length).toEqual(2);
	expect(apiParams.limit).toEqual(25);
	expect(apiParams.query).toEqual("test");
	expect(apiURL).toEqual(staticValues.api.schoolRequestApi);
});

test("User see 25 rows in dropdown options", async () => {
	let apiParams = "";
	let apiURL = "";
	function api(url, params) {
		apiParams = params;
		apiURL = url;
		let result = {
			result: [
				{ id: 1, name: "Test1" },
				{ id: 2, title: "Test3" },
			],
		};
		return new Promise((resolve, reject) => resolve(result));
	}
	const inputValue = "test";
	let result = [];
	const mockCallback = (test) => {
		result = test;
	};
	const item = shallow(<AsyncSchoolFilter title={"school"} name="school" onChange={mockFun} value={[]} api={api} limit={50} />);
	item.instance().loadOptions(inputValue, mockCallback);
	await wait(400);

	expect(item.state().inputValue).toEqual(inputValue);
	expect(result.length).toEqual(2);
	expect(apiParams.limit).toEqual(25);
	expect(apiParams.query).toEqual("test");
	expect(apiURL).toEqual(staticValues.api.schoolRequestApi);
});

test("User not getting the results when query provided as null", async () => {
	let mockAPI = jest.fn();
	let isLoadoptions = false;
	const inputValue = "te";
	let result = [];
	const mockCallback = (test) => {
		result = test;
	};
	const item = shallow(<AsyncSchoolFilter title={"school"} name="school" onChange={mockFun} value={[]} api={mockAPI} />);
	item.instance().loadOptions(inputValue, mockCallback);
	expect(item.state().inputValue).toEqual(inputValue);
	await wait(400);
	expect(mockAPI).not.toHaveBeenCalled();
	expect(result.length).toEqual(0);
});

test("User not getting the results when query provided as null", async () => {
	let mockAPI = jest.fn();
	const inputValue = "te";
	let result = [];
	const mockCallback = (test) => {
		result = test;
	};
	const item = shallow(
		<AsyncSchoolFilter
			title={"school"}
			name="school"
			onChange={mockFun}
			selectedData={null}
			api={mockAPI}
			singleValueFieldColor={true}
			isUsedInAddEditForm={true}
			isMulti={false}
		/>
	);
	item.instance().loadOptions(inputValue, mockCallback);
	expect(item.state().inputValue).toEqual(inputValue);
	await wait(400);
	expect(mockAPI).not.toHaveBeenCalled();
	expect(result.length).toEqual(0);
});

test("User select the school from the list", async () => {
	let mockAPI = jest.fn();
	const inputValue = "test";
	let apiParams = "";
	let apiURL = "";
	function api(url, params) {
		apiParams = params;
		apiURL = url;
		let result = {
			result: [
				{ id: 1, name: "Test1" },
				{ id: 2, title: "Test3" },
			],
		};
		return new Promise((resolve, reject) => resolve(result));
	}
	let result = [];
	const mockCallback = (test) => {
		result = test;
	};
	const item = shallow(
		<AsyncSchoolFilter
			title={"school"}
			name="school"
			onChange={mockFun}
			selectedData={{ id: 1, name: "Test1" }}
			api={api}
			singleValueFieldColor={true}
			isUsedInAddEditForm={true}
			isMulti={false}
		/>
	);
	item.instance().loadOptions(inputValue, mockCallback);
	expect(item.state().inputValue).toEqual(inputValue);
	await wait(400);
	expect(item.state().inputValue).toEqual(inputValue);
	expect(result.length).toEqual(2);
	expect(apiParams.limit).toEqual(25);
	expect(apiParams.query).toEqual("test");
	expect(apiURL).toEqual(staticValues.api.schoolRequestApi);
});

test('User showing the popup message "Please fill in this field"', async () => {
	let mockAPI = jest.fn();
	const inputValue = "test";
	let apiParams = "";
	let apiURL = "";
	function api(url, params) {
		apiParams = params;
		apiURL = url;
		let result = {
			result: [
				{ id: 1, name: "Test1" },
				{ id: 2, title: "Test3" },
			],
		};
		return new Promise((resolve, reject) => resolve(result));
	}
	let result = [];
	const mockCallback = (test) => {
		result = test;
	};
	const item = shallow(
		<AsyncSchoolFilter
			title={"school"}
			name="school"
			onChange={mockFun}
			selectedData={null}
			api={api}
			singleValueFieldColor={true}
			isUsedInAddEditForm={true}
			isMulti={false}
			isRequired={true}
		/>
	);
	const validResult = item.instance().fieldIsValid();
	expect(validResult).toEqual({
		isValid: false,
		errorType: "required",
		message: "school is required.",
	});
});

test("User select the school from the list", async () => {
	let mockAPI = jest.fn();
	const inputValue = "test";
	let apiParams = "";
	let apiURL = "";
	function api(url, params) {
		apiParams = params;
		apiURL = url;
		let result = {
			result: [
				{ id: 1, name: "Test1" },
				{ id: 2, title: "Test3" },
			],
		};
		return new Promise((resolve, reject) => resolve(result));
	}
	let result = [];
	const mockCallback = (test) => {
		result = test;
	};
	const item = shallow(
		<AsyncSchoolFilter
			title={"school"}
			name="school"
			selectedData={{ id: 1, name: "Test1" }}
			api={api}
			singleValueFieldColor={true}
			isUsedInAddEditForm={true}
			isMulti={false}
		/>
	);
	const spy = jest.spyOn(item.instance(), "onChange");
	item.instance().loadOptions(inputValue, mockCallback);
	expect(item.state().inputValue).toEqual(inputValue);
	await wait(400);
	expect(item.state().inputValue).toEqual(inputValue);
	expect(result.length).toEqual(2);
	expect(apiParams.limit).toEqual(25);
	expect(apiParams.query).toEqual("test");
	expect(apiURL).toEqual(staticValues.api.schoolRequestApi);

	item.instance().onChange({ id: 2, name: "Test2" });
	expect(spy).toHaveBeenCalled();
});
