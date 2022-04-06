import React from "react";
import { shallow, mount } from "enzyme";
import Loader from "./../Loader";

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<Loader />);
	expect(item.find("div").length).toBe(1);
});

/** Component renders correctly with dive text */
test("Component renders with Loading text", async () => {
	const item = shallow(<Loader />);
	expect(item.find("div").text()).toEqual("Loading...");
});
