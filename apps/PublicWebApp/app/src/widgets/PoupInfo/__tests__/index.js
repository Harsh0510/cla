import React from "react";
import { shallow, mount } from "enzyme";
import PoupInfo from "../index";

/**Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(<PoupInfo show={true} />);
	expect(item.find("WrapModel").length).toBe(1);
});

/**Component renders with show info set it to false*/
test("Component renders with show info set it to false", async () => {
	const item = mount(<PoupInfo show={false} />);
	expect(item.prop("show")).toBe(false);
});

/**Component renders with show info set it to true*/
test("Component renders with show info set it to true", async () => {
	const item = mount(<PoupInfo show={true} />);
	expect(item.prop("show")).toBe(true);
});
