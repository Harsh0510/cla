// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow, mount } from "enzyme";
import LinkIcon from "../LinkIcon";

let props, mockFunction;
/**
 * Reset function
 */
function resetAll() {
	mockFunction = jest.fn();
	props = {
		linkTitle: "<title>",
		iconClass: "fas fa-user-clock",
		linkTo: "/profile/admin/users",
		isDisplay: true,
		isButtonType: false,
		width: "130px",
		onButtonClick: mockFunction,
		isButtonType: false,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders correctly", async () => {
	const item = shallow(<LinkIcon {...props} />);
	expect(item.find("LinkSection").length).toEqual(1);
});

test("Return a link", async () => {
	const item = shallow(<LinkIcon {...props} />);
	expect(item.find("LinkSection").length).toEqual(1);
	expect(item.find("RedirectLink").length).toEqual(1);
});

test("Return a Button for onClick event", async () => {
	props.isButtonType = true;
	props.onButtonClick = mockFunction;
	const item = shallow(<LinkIcon {...props} />);
	expect(item.find("ButtonSection").length).toEqual(1);
	expect(item.find("LinkButton").length).toEqual(1);
});

test("Return a link without props", async () => {
	const item = shallow(<LinkIcon />);
	expect(item.find("LinkSection").length).toEqual(1);
	expect(item.find("RedirectLink").length).toEqual(1);
});

test("Return null when isDisplay props as false", async () => {
	props.isDisplay = false;
	const item = shallow(<LinkIcon {...props} />);
	expect(item.find("LinkSection").length).toEqual(0);
	expect(item.find("RedirectLink").length).toEqual(0);
	expect(item.find("ButtonSection").length).toEqual(0);
	expect(item.find("LinkButton").length).toEqual(0);
	expect(item.debug()).toEqual("<Fragment />");
});
