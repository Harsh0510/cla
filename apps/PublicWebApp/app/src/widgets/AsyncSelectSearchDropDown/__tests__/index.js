// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import AsyncSelectSearchDropDown from "../index";
import MockSchoolDropDownData from "../../../mocks/MockSchoolDropDownData";
import staticValues from "../../../common/staticValues";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/reactCreateRef", () => mockPassthruHoc);

/** wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

const mockFun = jest.fn();
/**Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(
		<AsyncSelectSearchDropDown
			title={"Name of school"}
			name="school"
			onChange={mockFun}
			isValid={true}
			dropdownData={MockSchoolDropDownData}
			value={{ value: 1, label: "AVM Mandir (AVM-65)" }}
			isRequired={true}
			handleSearchInputChange={mockFun}
			onBlur={() => this.onBlur(value)}
		/>
	);

	expect(item.find("SelectSearch").length).toBe(1);
});

test("Component renders correctly with styled component", async () => {
	const item = shallow(
		<AsyncSelectSearchDropDown
			title={"Name of school"}
			name="school"
			onChange={mockFun}
			isValid={true}
			dropdownData={MockSchoolDropDownData}
			value={{ value: 1, label: "AVM Mandir (AVM-65)" }}
			isRequired={true}
			handleSearchInputChange={mockFun}
			onBlur={() => this.onBlur(value)}
		/>
	);

	expect(item.find("AutoSelect").props().styles.control()).toEqual({
		border: "1px solid #c5c5c5",
		borderRadius: "0px",
		minHeight: "auto",
	});
	expect(item.find("AutoSelect").props().styles.loadingIndicator()).toEqual({ display: "none" });
	expect(item.find("AutoSelect").props().styles.loadingMessage()).toEqual({ display: "none" });
});

/**Component renders correctly with default props value */
test("Component renders correctly", async () => {
	const item = shallow(
		<AsyncSelectSearchDropDown
			onChange={mockFun}
			isValid={true}
			dropdownData={MockSchoolDropDownData}
			isRequired={true}
			handleSearchInputChange={mockFun}
			onBlur={() => this.onBlur(value)}
		/>
	);

	expect(item.find("SelectSearch").length).toBe(1);
});
/**User select the different school from dropdown*/
test("User select the different school from dropdown", async () => {
	const item = shallow(
		<AsyncSelectSearchDropDown
			title={"Name of school"}
			name="school"
			onChange={mockFun}
			isValid={true}
			dropdownData={MockSchoolDropDownData}
			value={{ value: 1, label: "AVM Mandir (AVM-65)" }}
			isRequired={true}
			handleSearchInputChange={mockFun}
			onBlur={() => this.onBlur(value)}
		/>
	);
	const select = item.find("AutoSelect");
	select.simulate("change", { value: 3, label: "Dover Grammar for Boys" });
	expect(mockFun).toBeCalled();
});

/**User select the different school from dropdown without props event*/
test("User select the different school from dropdown without props event", async () => {
	const item = shallow(
		<AsyncSelectSearchDropDown
			title={"Name of school"}
			name="school"
			isValid={true}
			dropdownData={MockSchoolDropDownData}
			value={{ value: 1, label: "AVM Mandir (AVM-65)" }}
			isRequired={true}
			handleSearchInputChange={mockFun}
			onBlur={() => this.onBlur(value)}
		/>
	);
	const select = item.find("AutoSelect");
	select.simulate("change", { value: 3, label: "Dover Grammar for Boys" });
	expect(item.props().onChange).toEqual(undefined);
});

/**User search the school from dropdown*/
test("User serach the data with dropdown", async () => {
	const item = shallow(
		<AsyncSelectSearchDropDown
			title={"Name of school"}
			name="school"
			onChange={mockFun}
			isValid={true}
			dropdownData={MockSchoolDropDownData}
			value={{ value: 1, label: "AVM Mandir (AVM-65)" }}
			isRequired={true}
			handleSearchInputChange={mockFun}
			onBlur={() => this.onBlur(value)}
		/>
	);
	const select = item.find("AutoSelect");
	select.simulate("inputChange", "AVM");
	expect(mockFun).toBeCalled();
	expect(item.state().inputValue).toBe("AVM");
});

/**User search the school from dropdown*/
test("User serach the data with dropdown", async () => {
	const item = shallow(
		<AsyncSelectSearchDropDown
			title={"Name of school"}
			name="school"
			onChange={mockFun}
			isValid={true}
			dropdownData={MockSchoolDropDownData}
			value={{ value: 1, label: "AVM Mandir (AVM-65)" }}
			isRequired={true}
			onBlur={() => this.onBlur(value)}
		/>
	);
	const select = item.find("AutoSelect");
	select.simulate("inputChange", "AVM");
	expect(item.state().inputValue).toBe("AVM");
	expect(item.props().handleSearchInputChange).toEqual(undefined);
});

test("When user select school and goto other section without onchange", async () => {
	const item = shallow(
		<AsyncSelectSearchDropDown
			title={"Name of school"}
			name="school"
			onChange={mockFun}
			isValid={true}
			dropdownData={MockSchoolDropDownData}
			value={{ value: 1, label: "AVM Mandir (AVM-65)" }}
			isRequired={true}
			onBlur={() => this.onBlur(value)}
		/>
	);
	const select = item.find("AutoSelect");
	select.simulate("blur", { value: 1, label: "AVM Mandir (AVM-65)" });
	expect(mockFun).toBeCalled();
});

test("When user select school and goto other section without onchange", async () => {
	const item = shallow(
		<AsyncSelectSearchDropDown
			title={"Name of school"}
			name="school"
			isValid={true}
			dropdownData={MockSchoolDropDownData}
			value={{ value: 1, label: "AVM Mandir (AVM-65)" }}
			isRequired={true}
			onBlur={() => this.onBlur(value)}
		/>
	);
	const select = item.find("AutoSelect");
	select.simulate("blur", { value: 1, label: "AVM Mandir (AVM-65)" });
	expect(item.props().onChange).toEqual(undefined);
});

test("Check select school dropdown validation with isRequired optional", async () => {
	let result = {};
	let mockOnChange = (name, value, valid) => {
		result.name = name;
		result.value = value;
		result.valid = valid;
	};
	const item = shallow(
		<AsyncSelectSearchDropDown
			title={"Name of school"}
			name="school"
			onChange={mockOnChange}
			isValid={true}
			dropdownData={MockSchoolDropDownData}
			value={{ value: 1, label: "AVM Mandir (AVM-65)" }}
		/>
	);
	const select = item.find("AutoSelect");
	select.simulate("change", { value: 1, label: "AVM Mandir (AVM-65)" });
	expect(result.name).toEqual("school");
	expect(result.value).toEqual({ value: 1, label: "AVM Mandir (AVM-65)" });
	expect(result.valid).toEqual({ isValid: true, errorType: "", message: "" });
});

test("Check select school dropdown validation with isRequired optional", async () => {
	let result = {};
	let mockOnChange = (name, value, valid) => {
		result.name = name;
		result.value = value;
		result.valid = valid;
	};
	const item = shallow(
		<AsyncSelectSearchDropDown
			title={"Name of school"}
			name="school"
			onChange={mockOnChange}
			isValid={true}
			dropdownData={MockSchoolDropDownData}
			value={{ value: 1, label: "AVM Mandir (AVM-65)" }}
			isRequired={false}
		/>
	);
	const select = item.find("AutoSelect");
	select.simulate("change", { value: 1, label: "AVM Mandir (AVM-65)" });
	expect(result.name).toEqual("school");
	expect(result.value).toEqual({ value: 1, label: "AVM Mandir (AVM-65)" });
	expect(result.valid).toEqual({ isValid: true, errorType: "", message: "" });
});

test("Dropdown validation with any error  when isRequired flag as true", async () => {
	let result = {};
	let mockOnChange = (name, value, valid) => {
		result.name = name;
		result.value = value;
		result.valid = valid;
	};
	const item = shallow(
		<AsyncSelectSearchDropDown
			title={"Name of school"}
			name="school"
			onChange={mockOnChange}
			isValid={true}
			dropdownData={MockSchoolDropDownData}
			value=""
			isRequired={true}
		/>
	);
	const select = item.find("AutoSelect");
	select.simulate("change", "");
	expect(result.name).toEqual("school");
	expect(result.value).toEqual("");
	expect(result.valid).toEqual({
		errorType: "required",
		isValid: false,
		message: "Name of school is required.",
	});
});

test("Dropdown validation no error when isRequired flag as false", async () => {
	let result = {};
	let mockOnChange = (name, value, valid) => {
		result.name = name;
		result.value = value;
		result.valid = valid;
	};
	const item = shallow(
		<AsyncSelectSearchDropDown
			title={"Name of school"}
			name="school"
			onChange={mockOnChange}
			isValid={true}
			dropdownData={MockSchoolDropDownData}
			value=""
			isRequired={false}
		/>
	);
	const select = item.find("AutoSelect");
	select.simulate("change", "");
	expect(result.name).toEqual("school");
	expect(result.value).toEqual("");
	expect(result.valid).toEqual({
		errorType: "",
		isValid: true,
		message: "",
	});
});

test("Dropdown validation result", async () => {
	let mockOnChange = () => {};
	const item = shallow(
		<AsyncSelectSearchDropDown
			title={"Name of school"}
			name="school"
			onChange={mockOnChange}
			isValid={true}
			dropdownData={MockSchoolDropDownData}
			value=""
			onBlur={() => this.onBlur(value)}
			isRequired={true}
		/>
	);
	const select = item.find("AutoSelect");
	const result = item.instance().isValid();
	expect(result).toEqual(false);
});

test("Dropdown validation result when isRequired flag as true", async () => {
	let mockOnChange = () => {};
	const item = shallow(
		<AsyncSelectSearchDropDown
			title={"Name of school"}
			name="school"
			onChange={mockOnChange}
			isValid={true}
			dropdownData={MockSchoolDropDownData}
			value=""
			onBlur={() => this.onBlur(value)}
			isRequired={false}
		/>
	);
	const select = item.find("AutoSelect");
	const result = item.instance().isValid();
	expect(result).toEqual(true);
});

test("Dropdown validation result when isRequired flag as true and has value", async () => {
	let mockOnChange = () => {};
	const item = shallow(
		<AsyncSelectSearchDropDown
			title={"Name of school"}
			name="school"
			onChange={mockOnChange}
			isValid={true}
			dropdownData={MockSchoolDropDownData}
			value={{ value: 1, label: "AVM Mandir (AVM-65)" }}
			onBlur={() => this.onBlur(value)}
			isRequired={false}
		/>
	);
	const select = item.find("AutoSelect");
	const result = item.instance().isValid();
	expect(result).toEqual(true);
});

test("User search from dropdown input area", async () => {
	let isLoadoptions = false;
	let mockCallback = () => {
		isLoadoptions = true;
	};

	const item = shallow(
		<AsyncSelectSearchDropDown
			title={"Name of school"}
			name="school"
			onChange={mockFun}
			isValid={true}
			dropdownData={MockSchoolDropDownData}
			value={{ value: 1, label: "AVM Mandir (AVM-65)" }}
			isRequired={false}
		/>
	);
	const select = item.find("AutoSelect");
	item.instance().loadOptions("test", mockCallback);
	await wait(1050);
	expect(isLoadoptions).toEqual(true);
});

test("User showing the loading process when dropdown data is loading", async () => {
	const item = shallow(
		<AsyncSelectSearchDropDown
			title={"Name of school"}
			name="school"
			onChange={mockFun}
			isValid={true}
			dropdownData={MockSchoolDropDownData}
			value={{ value: 1, label: "AVM Mandir (AVM-65)" }}
			onBlur={() => this.onBlur(value)}
			isRequired={false}
			asyncSelectLoading={true}
		/>
	);
	const label = item.find("label");
	expect(label.find("i").length).toEqual(1);
	expect(label.find("i").props().className).toEqual("fas fa-spinner fa-spin");

	//Change the props values
	item.setProps({ asyncSelectLoading: false });
	await wait(50);
	const labelAfter = item.find("label");
	item.update();
	item.instance().forceUpdate();
	expect(labelAfter.find("i").length).toBe(0);
});

test("When No School Available from Search", async () => {
	const item = shallow(
		<AsyncSelectSearchDropDown
			title={"Name of school"}
			name="school"
			onChange={mockFun}
			isValid={true}
			dropdownData={MockSchoolDropDownData}
			value={{ value: 1, label: "AVM Mandir (AVM-65)" }}
			onBlur={() => this.onBlur(value)}
			isRequired={false}
			asyncSelectLoading={true}
		/>
	);
	await wait(200);
	let OptionMsg = item.instance().noOptionsMessage({ inputValue: "" });
	expect(OptionMsg).toBe(staticValues.schoolAsyncDropDown.defaultSearchInputMessage);
});

/* When Typed Keyword is less than 3 character */

test("When No Option Found With Query", async () => {
	function defaultApi(url, params) {
		let result = {
			result: [],
		};
		return new Promise((resolve, reject) => resolve(result));
	}
	let isLoadoptions = false;
	let mockCallback = (query) => {
		isLoadoptions = true;
	};
	const item = shallow(
		<AsyncSelectSearchDropDown
			title={"Name of school"}
			name="school"
			onChange={mockFun}
			isValid={true}
			dropdownData={MockSchoolDropDownData}
			value={{ value: 1, label: "AVM Mandir (AVM-65)" }}
			onBlur={() => this.onBlur(value)}
			isRequired={false}
			asyncSelectLoading={true}
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
