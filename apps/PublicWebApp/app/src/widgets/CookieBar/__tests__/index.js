import React from "react";
import { mount } from "enzyme";
import CookieBar from "../index";

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(<CookieBar />);
	expect(item.find("Text").length).toBe(1);
});

/** When user click on close button */
test("When user click on close button", async () => {
	const item = mount(<CookieBar />);
	item.find("Close").simulate("click");
	expect(item.state().accepted).toBe(true);
});
