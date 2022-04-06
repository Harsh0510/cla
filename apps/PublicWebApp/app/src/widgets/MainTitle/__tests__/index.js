import React from "react";
import { mount, shallow } from "enzyme";
import MainTitle from "../index";

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(<MainTitle title="Education Platform" icon="fa-info-circle" />);
	expect(item.find("MainTitleWrap").length).toBe(1);
});

/** When there is no title in page*/
test("When there is no page title", async () => {
	const item = mount(<MainTitle title="" icon="fa-info-circle" />);
	expect(item.find("h1").debug()).toBe("<h1 />");
});
