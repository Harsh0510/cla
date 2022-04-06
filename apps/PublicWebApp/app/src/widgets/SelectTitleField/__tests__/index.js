import React from "react";
import { shallow, mount } from "enzyme";
import SelectTitleField from "../index";

const mockFun = jest.fn();

/**Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(<SelectTitleField name="title" title="Title" value={""} isValid={true} isRequired={true} inputWidth="250px" />);

	expect(item.find("FormInput").length).toBe(1);
});

/**When user input some value in title field */
test("When user input some value in title field", async () => {
	const item = mount(
		<SelectTitleField name="title" title="Title" value={"teacher"} isValid={true} isRequired={true} inputWidth="250px" onChange={mockFun} />
	);
	item.find("select").simulate("change");
	item.instance().onChange({ target: { value: "teacher" } });
	expect(mockFun).toHaveBeenCalled();
});

/**When after input value user goto other control */
test("When after input value user goto other control", async () => {
	const item = mount(
		<SelectTitleField name="title" title="Title" value={"teacher"} isValid={true} isRequired={true} inputWidth="250px" onChange={mockFun} />
	);
	item.find("select").simulate("blur");
	item.instance().onBlur({ target: { value: "teacher" } });
	expect(mockFun).toHaveBeenCalled();
});

/**When after input value user goto other control without onchange */
test("When after input value user goto other control without onchange", async () => {
	const item = mount(<SelectTitleField name="title" title="Title" value={"teacher"} isValid={true} isRequired={true} inputWidth="250px" />);
	item.find("select").simulate("blur");
	item.instance().onBlur({ target: { value: "teacher" } });
	expect(mockFun).toHaveBeenCalled();
});

/**Check user input validation*/
test("Check user input validation", async () => {
	const item = mount(<SelectTitleField name="title" title="Title" value={"teacher"} isValid={false} isRequired={true} inputWidth={""} />);

	item.find("select").simulate("change");
	const spy = jest.spyOn(item.instance(), "fieldIsValid");
	item.instance().fieldIsValid({ target: { value: "teacher" } });
	item.instance().isValid();
	expect(spy).toHaveBeenCalled();
});

/**When set the input textbox optional */
test("When set the input textbox optional", async () => {
	const item = mount(<SelectTitleField name="title" title="Title" value={"teacher"} isValid={true} isRequired={false} />);
	item.instance().fieldIsValid({ target: { value: "teacher" } });
	expect(item.prop("isRequired")).toBe(false);
});
