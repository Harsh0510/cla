// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import SelectField from "../index";
import mockExamBoards from "../../../mocks/mockExamBoards";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

//import errorType component
jest.mock("../../../common/errorType", () => mockPassthruHoc);

jest.mock("../../../common/reactCreateRef", () => mockPassthruHoc);

const mockFun = jest.fn();

const ref_exam_board = mockFun;

let state = {
	fields: {
		extract_title: "",
		school: "",
		course_oid: "",
		course_name: "",
		work_title: "",
		number_of_students: "",
		exam_board: "",
	},
	valid: {
		extract_title: { isValid: true, message: "" },
		number_of_students: { isValid: true, message: "" },
		exam_board: { isValid: true, message: "" },
	},
};

let handleInputChange = mockFun;

/**Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(
		<SelectField
			ref={ref_exam_board}
			name="exam_board"
			title="Exam Board (optional)"
			value={state.fields.exam_board}
			isValid={state.valid.exam_board.isValid}
			options={mockExamBoards}
			onChange={handleInputChange}
			onBlur={handleInputChange}
			isRequired={false}
			isDefaultSelectText={true}
			inputWidth={""}
		/>
	);
	expect(item.find("FormInput").length).toBe(1);
});

/**When user select exam board level*/
test("When user select exam board level", async () => {
	state.fields.exam_board = "AQA";
	const item = mount(
		<SelectField
			ref={ref_exam_board}
			name="exam_board"
			title="Exam Board (optional)"
			value={state.fields.exam_board}
			isValid={state.valid.exam_board.isValid}
			options={mockExamBoards}
			onChange={handleInputChange}
			onBlur={handleInputChange}
			isRequired={false}
			isDefaultSelectText={true}
		/>
	);

	item.find("select").simulate("change");
	expect(handleInputChange).toHaveBeenCalled();
});

/**When user select exam then control pass to other element*/
test("When user select exam then control pass to other element", async () => {
	const item = mount(
		<SelectField
			ref={ref_exam_board}
			name="exam_board"
			title="Exam Board (optional)"
			value={state.fields.exam_board}
			isValid={state.valid.exam_board.isValid}
			options={mockExamBoards}
			onChange={handleInputChange}
			onBlur={handleInputChange}
			isRequired={false}
			isDefaultSelectText={true}
		/>
	);

	item.find("select").simulate("blur");
	expect(handleInputChange).toHaveBeenCalled();
});

/**Check validation when user not select any value*/
test("Check validation when user select value or not", async () => {
	const item = mount(
		<SelectField
			ref={ref_exam_board}
			name="exam_board"
			title="Exam Board (optional)"
			value={state.fields.exam_board}
			isValid={state.valid.exam_board.isValid}
			options={mockExamBoards}
			onChange={handleInputChange}
			onBlur={handleInputChange}
			isRequired={false}
			isDefaultSelectText={true}
			inputWidth={"100%"}
			isDefaultSelectText={false}
		/>
	);

	item.find("select").simulate("change");

	//on change call fieldIsvalid function
	item.instance().fieldIsValid({ target: { value: "" } });
	item.setProps({ isValid: false });
	expect(handleInputChange).toHaveBeenCalled();
});
