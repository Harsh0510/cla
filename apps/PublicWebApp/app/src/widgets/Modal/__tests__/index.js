// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import Modal from "../index";

const mockFun = jest.fn();

/** Component renders correctly*/
test("Component with hide modal box correctly", async () => {
	const item = mount(<Modal show={false} />);
	expect(item.find("WrapModel").length).toBe(1);
});

/** Render Modal box with show set to false*/
test("Render Modal box with show set to false", async () => {
	const item = mount(<Modal show={false} />);
	expect(item.prop("show")).toBe(false);
});

/**Render Modal box with show set to true */
test("Render Modal box with show set to true", async () => {
	const item = mount(<Modal show={true} />);
	expect(item.prop("show")).toBe(true);
});

test("Render Modal box with title, sub-title and description", async () => {
	const item = mount(<Modal show={true} title={"Title"} subTitle={"Subtitle"} description={"description"} />);
	expect(item.prop("show")).toBe(true);
	expect(item.find("Title").length).toBe(1);
	expect(item.find("SubTitle").length).toBe(1);
	expect(item.find("Description").length).toBe(1);
});
