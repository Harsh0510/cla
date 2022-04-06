import React from "react";
import { shallow, mount } from "enzyme";
import TextField from "../index";

const handleInputChange = jest.fn();
const handleInputKeyUp = jest.fn();
const passwordIsStrong = jest.fn();
const RegExPatterns = {
	name: /^[^\r\t\n\]\[¬|\<>?:@~{}_+!£$%^&/*,./;'#\[\]|]{1,255}$/,
};

/**Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(
		<TextField
			name="extract_title"
			title="Copy Title"
			value={""}
			isValid={true}
			placeHolder={"title"}
			isRequired={true}
			maxLength={250}
			onChange={handleInputChange}
			onBlur={handleInputChange}
		/>
	);

	expect(item.find("FormInput").length).toBe(1);
});

/**when user input some value in textbox */
test("when user input some value in textbox", async () => {
	const item = mount(
		<TextField
			name="extract_title"
			title="Copy Title"
			value={""}
			isValid={true}
			placeHolder={"title"}
			isRequired={true}
			maxLength={250}
			onChange={handleInputChange}
			onBlur={handleInputChange}
		/>
	);
	item.find("input").simulate("change");
	const spy = jest.spyOn(item.instance(), "onChange");
	item.instance().onChange({ target: { value: "teacher" } });
	expect(spy).toHaveBeenCalled();
});

/**When after input value user goto other control */
test("When after input value user goto other control", async () => {
	const item = mount(
		<TextField
			name="extract_title"
			title="Copy Title"
			value={""}
			isValid={true}
			placeHolder={"title"}
			isRequired={true}
			maxLength={250}
			onChange={handleInputChange}
			onBlur={handleInputChange}
		/>
	);
	item.find("input").simulate("blur");
	const spy = jest.spyOn(item.instance(), "onBlur");
	item.instance().onBlur({ target: { value: "teacher" } });
	expect(spy).toHaveBeenCalled();
});

/**Check when field validation type is email*/
test("Check field is validation", async () => {
	const item = mount(
		<TextField
			name="extract_title"
			title="Copy Title"
			value={"mack@gmail.com"}
			isValid={true}
			placeHolder={"title"}
			isRequired={true}
			maxLength={250}
			onChange={handleInputChange}
			onBlur={handleInputChange}
			validationType="email"
		/>
	);

	item.find("input").simulate("change");
	const spy = jest.spyOn(item.instance(), "onChange");
	item.instance().fieldIsValid({ target: "mack@gmail.com" });
	expect(item.prop("validationType")).toBe("email");
});

/**Check when field validation type is string */
test("Check when field validation type is string", async () => {
	const item = mount(
		<TextField
			name="extract_title"
			title="Copy Title"
			value={"mack"}
			isValid={false}
			placeHolder={"title"}
			inputWidth={""}
			isRequired={true}
			onChange={handleInputChange}
			onBlur={handleInputChange}
			patterns={RegExPatterns.name}
			validationType="input-string"
		/>
	);

	item.find("input").simulate("change");
	item.instance().fieldIsValid({ target: "mack" });
	item.instance().isValid();
	expect(item.prop("validationType")).toBe("input-string");
});

/**Check when field validation type is number */
test("Check when field validation type is number", async () => {
	const item = mount(
		<TextField
			name="extract_title"
			title="Copy Title"
			value={"mack"}
			isValid={true}
			placeHolder={"title"}
			isRequired={true}
			maxLength={250}
			onChange={handleInputChange}
			onBlur={handleInputChange}
			validationType="number"
		/>
	);

	item.find("input").simulate("change");
	item.instance().fieldIsValid({ target: "mack" });
	expect(item.prop("validationType")).toBe("number");
});

test("Check when field validation type is password", async () => {
	const item = mount(
		<TextField
			name="password"
			title="Password"
			value={"Passw"}
			isValid={true}
			placeHolder={"Password"}
			isRequired={true}
			maxLength={250}
			onChange={handleInputChange}
			onBlur={handleInputChange}
			validationType="input-string"
			validator={passwordIsStrong}
			autoComplete={"new-password"}
		/>
	);

	item.find("input").simulate("change");
	item.instance().fieldIsValid({ target: "Passw" });
	expect(item.prop("validationType")).toBe("input-string");
});

/**Check when field validation type is string with min and max length validation  */
test("Check when field validation type is string with min and max length validation", async () => {
	const item = mount(
		<TextField
			name="extract_title"
			title="Copy Title"
			value={"mack"}
			isValid={false}
			placeHolder={"title"}
			isRequired={false}
			minLength={1}
			maxLength={250}
			onChange={handleInputChange}
			onBlur={handleInputChange}
			validationType="input-string"
		/>
	);

	item.find("input").simulate("change");
	item.instance().fieldIsValid({ target: "mack" });
	item.instance().isValid();
	expect(item.prop("validationType")).toBe("input-string");
});

/**Check when there is no value in input text box */
test("Check when there is no value in input text box", async () => {
	const item = mount(
		<TextField
			name="extract_title"
			title="Copy Title"
			value={""}
			isValid={false}
			placeHolder={"title"}
			isRequired={false}
			minLength={1}
			maxLength={250}
			onChange={handleInputChange}
			onBlur={handleInputChange}
			validationType="input-string"
		/>
	);

	item.find("input").simulate("change");
	item.instance().fieldIsValid({ target: "" });
	item.instance().isValid();
	expect(item.prop("validationType")).toBe("input-string");
});

/**Check when field validation type is number and field input value is optional */
test("Check when field validation type is number and field input value is optional", async () => {
	const item = mount(
		<TextField
			name="extract_title"
			title="Copy Title"
			value={"mack"}
			isValid={true}
			placeHolder={"title"}
			isRequired={false}
			maxLength={250}
			onChange={handleInputChange}
			onBlur={handleInputChange}
			validationType="number"
		/>
	);

	item.find("input").simulate("change");
	item.instance().fieldIsValid({ target: "mack" });
	expect(item.prop("validationType")).toBe("number");
});

/**User input some value in textbox with call onKeyUp event */
test("User input some value in textbox with call onKeyUp event", async () => {
	const item = mount(
		<TextField
			name="first_name"
			title="First name"
			value={"test"}
			isValid={true}
			placeHolder={"title"}
			isRequired={true}
			maxLength={250}
			onChange={handleInputChange}
			onBlur={handleInputChange}
			onKeyUp={handleInputKeyUp}
		/>
	);
	item.find("input").simulate("keyUp");
	const spy = jest.spyOn(item.instance(), "onKeyUp");
	item.instance().onKeyUp({ target: { value: "test" } });
	expect(spy).toHaveBeenCalled();
	expect(handleInputKeyUp).toBeCalled();
});

/**User input some value in textbox without props event*/
test("User input some value in textbox without props event", async () => {
	const item = mount(
		<TextField name="first_name" title="First name" value={"test"} isValid={true} placeHolder={"title"} isRequired={true} maxLength={250} />
	);

	item.find("input").simulate("change");
	const spyOnChange = jest.spyOn(item.instance(), "onChange");
	item.instance().onChange({ target: { value: "test" } });
	expect(spyOnChange).toHaveBeenCalled();

	item.find("input").simulate("blur");
	const spyOnBlur = jest.spyOn(item.instance(), "onBlur");
	item.instance().onBlur({ target: { value: "test" } });
	expect(spyOnBlur).toHaveBeenCalled();

	item.find("input").simulate("keyUp");
	const spyOnKeyUp = jest.spyOn(item.instance(), "onKeyUp");
	item.instance().onKeyUp({ target: { value: "test" } });
	expect(spyOnKeyUp).toHaveBeenCalled();
});
