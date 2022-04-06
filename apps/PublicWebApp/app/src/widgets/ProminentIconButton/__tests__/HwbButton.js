import React from "react";
import { mount } from "enzyme";
import HwbButton from "../HwbButton";

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(<HwbButton />);
	expect(item.find("ProminentIconButton").length).toBe(1);
	expect(item.find("ProminentIconButton").text()).toBe("Sign in with Hwb");
	expect(item.find("ProminentIconButton").props().verticalOffset).toEqual("3px");
	expect(item.find("ProminentIconButton").props().tooltip).toEqual("Hwb is the digital Platform for learning and teaching in Wales.");
});
