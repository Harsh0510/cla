// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow } from "enzyme";
import AdminPageWrap from "../index";

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<AdminPageWrap pageTitle={"My Page"} children={<h1>Hello</h1>} id={"wrap"} />);
	expect(item.find("Wrapper").length).toBe(1);
	expect(item.find("PageTitle").length).toBe(1);
	expect(item.find("h1").length).toBe(1);
	expect(item.find("h1").text()).toBe("Hello");
});

/** Return content with wrapper component without passing the props */
test("Component renders correctly without passing the props", async () => {
	const item = shallow(<AdminPageWrap children={<h1>Hello</h1>} id={"wrap"} />);
	expect(item.find("Wrapper").length).toBe(1);
	expect(item.find("PageTitle").length).toBe(0);
	expect(item.find("h1").length).toBe(1);
	expect(item.find("h1").text()).toBe("Hello");
});

/** Component renders correctly with Back URL & Page title */
test("Component renders correctly with Back URL & Page title", async () => {
	const item = shallow(<AdminPageWrap pageTitle="Assets" backURL="admin/backurl" children={<h1>Hello</h1>} />);
	expect(item.find("TopCornerLink").length).toBe(1);
	expect(item.find("PageTitle").text()).toEqual("Assets");
});
