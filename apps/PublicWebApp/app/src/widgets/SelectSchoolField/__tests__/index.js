// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import SelectSchoolField from "../index";
import MockSchoolList from "../../../mocks/mockSchoolList";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/reactCreateRef", () => mockPassthruHoc);

const mockFun = jest.fn();
/**Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(
		<SelectSchoolField
			title={"Name of school"}
			name="school"
			placeholder="Select school"
			isValid={true}
			schoolData={MockSchoolList}
			value={""}
			isRequired={true}
		/>
	);

	expect(item.find("SelectSearch").length).toBe(1);
});

/**When user select school from dropdown list*/
test("When user select school from dropdown list", async () => {
	const item = mount(
		<SelectSchoolField
			title={"Name of school"}
			name="school"
			placeholder="Select school"
			isValid={true}
			schoolData={MockSchoolList}
			value={""}
			isRequired={true}
			inputWidth={""}
			onChange={mockFun}
		/>
	);

	item.find("AutoSelect").simulate("change");
	item.instance().onChange();
	expect(mockFun).toHaveBeenCalled();
});

/**When user select school from dropdown list without onchange*/
test("When user select school from dropdown list without onchange", async () => {
	const item = mount(
		<SelectSchoolField
			title={"Name of school"}
			name="school"
			placeholder="Select school"
			isValid={true}
			schoolData={MockSchoolList}
			value={""}
			isRequired={true}
		/>
	);

	item.find("AutoSelect").simulate("change");
	item.instance().onChange();
	expect(mockFun).toHaveBeenCalled();
});

/**When user select school and goto other section */
test("When user select school and goto other section", async () => {
	const item = mount(
		<SelectSchoolField
			title={"Name of school"}
			name="school"
			placeholder="Select school"
			isValid={true}
			schoolData={MockSchoolList}
			value={""}
			isRequired={false}
			onChange={mockFun}
		/>
	);
	item.find("AutoSelect").simulate("blur");
	item.instance().onBlur();
	expect(mockFun).toHaveBeenCalled();
});

/**When user select school and goto other section without onchange */
test("When user select school and goto other section without onchange", async () => {
	const item = mount(
		<SelectSchoolField
			title={"Name of school"}
			name="school"
			placeholder="Select school"
			isValid={true}
			schoolData={MockSchoolList}
			value={""}
			isRequired={false}
		/>
	);
	item.find("AutoSelect").simulate("blur");
	item.instance().onBlur();
	expect(mockFun).toHaveBeenCalled();
});

/**Check select school dropdown validation */
test("Check select school dropdown validation", async () => {
	const item = mount(
		<SelectSchoolField
			title={"Name of school"}
			name="school"
			placeholder="Select school"
			isValid={false}
			schoolData={MockSchoolList}
			value={""}
			inputWidth={"100%"}
			isRequired={true}
		/>
	);
	item.find("AutoSelect").simulate("change");
	//check field validation
	item.instance().fieldIsValid("");
	item.instance().isValid();
	expect(item.instance().fieldIsValid()).toEqual({ errorType: "", isValid: true, message: "" });
});

/**Check select school dropdown validation with isRequired optional*/
test("Check select school dropdown validation with isRequired optional", async () => {
	const item = mount(
		<SelectSchoolField
			title={"Name of school"}
			name="school"
			placeholder="Select school"
			isValid={false}
			schoolData={MockSchoolList}
			value={""}
			inputWidth={"100%"}
			isRequired={false}
		/>
	);
	item.find("AutoSelect").simulate("change");
	//check field validation
	item.instance().fieldIsValid("");
	item.instance().isValid();
	expect(item.instance().fieldIsValid()).toEqual({ errorType: "", isValid: true, message: "" });
});
