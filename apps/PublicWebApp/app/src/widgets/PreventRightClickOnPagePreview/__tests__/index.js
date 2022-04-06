// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import PreventRightClick from "../index";

jest.mock("../1x1.png", () => jest.fn());

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<PreventRightClick />);
	expect(item.find("Wrapper").length).toBe(1);
});

test("User clicks on Component", async () => {
	const item = shallow(<PreventRightClick />);
	const spy = jest.spyOn(item.instance(), "handleClick");

	item.instance().handleClick({ preventDefault: jest.fn() });
	await wait(20);
	item.update();

	expect(spy).toHaveBeenCalled();
});

test("User click right click on Component", async () => {
	const mockPreventDefault = jest.fn();
	const item = shallow(<PreventRightClick />);
	item.instance().handleClick({ preventDefault: mockPreventDefault, type: "contextmenu" });
	await wait(20);
	item.update();
	expect(mockPreventDefault).toHaveBeenCalled();
});
