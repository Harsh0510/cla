// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { mount, shallow } from "enzyme";
import MultiRowTextField from "../index";

let mockFun = jest.fn();

let state = {
	buy_book_rules_value: ["Booke Rule1"],
	buy_book_rules_valid: [],
};

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(
		<MultiRowTextField
			value={state.buy_book_rules_value}
			valid={state.buy_book_rules_valid}
			type="template"
			name="buy_book_rules"
			onChange={mockFun}
		/>
	);
	expect(item.find("AddOne").length).toBe(1);
});

/** When user input some value in Textbox  */
test("When user input some value in Textbox", async () => {
	const item = mount(
		<MultiRowTextField
			value={state.buy_book_rules_value}
			valid={state.buy_book_rules_valid}
			type="template"
			name="buy_book_rules"
			onChange={mockFun}
			maxItems={10}
		/>
	);
	item.find("SmallInput").simulate("change");
	//when user input more value
	item.instance().canAddMore(mockFun);
	expect(mockFun).toHaveBeenCalled();
});

/** When user goto another control after input value  */
test("When user goto another control after input value", async () => {
	const item = mount(
		<MultiRowTextField
			value={state.buy_book_rules_value}
			valid={state.buy_book_rules_valid}
			type="template"
			name="buy_book_rules"
			onChange={mockFun}
		/>
	);
	item.find("SmallInput").simulate("blur");
	expect(mockFun).toHaveBeenCalled();
});

/** Check whether input value is valid */
test("Check whether input value is valid", async () => {
	const item = mount(
		<MultiRowTextField
			value={state.buy_book_rules_value}
			valid={state.buy_book_rules_valid}
			type="template"
			name="buy_book_rules"
			onChange={mockFun}
		/>
	);
	item.instance().isValid(mockFun);
	//set valid false to check invalid value
	item.setProps({ valid: false });
	expect(mockFun).toHaveBeenCalled();
});

/** When user click on add icon */
test("When user click on add icon", async () => {
	const item = mount(
		<MultiRowTextField
			value={state.buy_book_rules_value}
			valid={state.buy_book_rules_valid}
			type="template"
			name="buy_book_rules"
			onChange={mockFun}
		/>
	);
	item.find("AddOne").simulate("click");
	item.instance().doAddOne({ mockFun, preventDefault: mockFun });
	expect(mockFun).toHaveBeenCalled();
});

/** When user click on delete icon */
test("When user click on delete button", async () => {
	const item = mount(
		<MultiRowTextField
			value={state.buy_book_rules_value}
			valid={state.buy_book_rules_valid}
			type="template"
			name="buy_book_rules"
			onChange={mockFun}
		/>
	);
	item.find("InputRowIcon").at(0).simulate("click");
	item.instance().doDeleteOne({ preventDefault: mockFun, currentTarget: { getAttribute: mockFun } });
	expect(mockFun).toHaveBeenCalled();
});

/** When user click on move up icon */
test("When user click on move up icon", async () => {
	state.buy_book_rules_value = ["Rule1", "Rule2"];
	const item = mount(
		<MultiRowTextField
			value={state.buy_book_rules_value}
			valid={state.buy_book_rules_valid}
			type="template"
			name="buy_book_rules"
			onChange={mockFun}
		/>
	);
	item.find("InputRowIcon").at(3).simulate("click");
	//item.instance().currentTarget=item.find('InputRowIcon').at(3);
	item.instance().doMoveUp({ preventDefault: mockFun, currentTarget: { getAttribute: mockFun } });
	expect(mockFun).toHaveBeenCalled();
});

/** When user click on move down icon */
test("When user click on move down icon", async () => {
	state.buy_book_rules_value = ["Rule1", "Rule2"];
	const item = mount(
		<MultiRowTextField
			value={state.buy_book_rules_value}
			valid={state.buy_book_rules_valid}
			type="template"
			name="buy_book_rules"
			onChange={mockFun}
		/>
	);

	item.find("InputRowIcon").at(2).simulate("click");
	item.instance().doMoveDown({ preventDefault: mockFun, currentTarget: { getAttribute: mockFun } });
	expect(mockFun).toHaveBeenCalled();
});

/** When there is no value set in textbox */
test("When there is no value set in textbox", async () => {
	state.buy_book_rules_value = false;
	const item = mount(
		<MultiRowTextField
			value={state.buy_book_rules_value}
			valid={state.buy_book_rules_valid}
			type="template"
			name="buy_book_rules"
			onChange={mockFun}
			maxItems={10}
		/>
	);

	item.instance().canAddMore(mockFun);
	expect(mockFun).toHaveBeenCalled();
});

/** When title is set in component*/
test("When title is set in component", async () => {
	state.buy_book_rules_value = "";
	const item = mount(
		<MultiRowTextField
			value={state.buy_book_rules_value}
			valid={state.buy_book_rules_valid}
			type="template"
			name="buy_book_rules"
			onChange={mockFun}
			title={"Add Edit Pub"}
		/>
	);
	expect(item.prop("title")).toEqual("Add Edit Pub");
});

/** When there is no value in textbox */
test("When there is no value in textbox", async () => {
	state.buy_book_rules_value = false;
	const item = mount(
		<MultiRowTextField
			value={state.buy_book_rules_value}
			valid={state.buy_book_rules_valid}
			type="template"
			name="buy_book_rules"
			onChange={mockFun}
			maxItems={10}
		/>
	);

	item.instance().canAddMore(mockFun);
	expect(mockFun).toHaveBeenCalled();
});

/** When type is other then template */
test("When type is other then template", async () => {
	state.buy_book_rules_value = ["Rule 1", "Rule 2"];
	const item = mount(
		<MultiRowTextField
			value={state.buy_book_rules_value}
			valid={state.buy_book_rules_valid}
			type="template_mock"
			name="buy_book_rules"
			onChange={mockFun}
		/>
	);
	item.instance().fieldIsValid(state.buy_book_rules_value);
	expect(item.prop("type")).not.toBe("template");
});
