import React from "react";
import { shallow, mount } from "enzyme";
import FormErrorMessage from "../index";

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(<FormErrorMessage />);
	expect(item.find("ErrorMessage").length).toBe(1);
});
