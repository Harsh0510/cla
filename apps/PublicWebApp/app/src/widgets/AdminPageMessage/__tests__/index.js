// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow } from "enzyme";
import AdminPageMessage from "../index";

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<AdminPageMessage children={<h4>Hello</h4>} />);
	expect(item.find("MessageString").length).toBe(1);
	expect(item.find("h4").length).toBe(1);
	expect(item.find("h4").text()).toBe("Hello");
});

/** Component renders withpout props */
test("Component renders correctly", async () => {
	const item = shallow(<AdminPageMessage />);
	expect(item.find("div").length).toBe(0);
	expect(item.find("MessageString").length).toBe(0);
});
