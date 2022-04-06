import React from "react";
import { mount } from "enzyme";
import ProminentIconButton from "../index";

let props;

function resetAll() {
	props = {
		href: "href",
		image: "image.png",
		verticalOffset: "tooltip",
		children: "children",
		tooltip: "TestDummy Text",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(<ProminentIconButton {...props} />);
	expect(item.find("Wrap").length).toBe(1);
	expect(item.find("ImageWrap").length).toBe(1);
	expect(item.find("Text").length).toBe(1);
	expect(item.find("TextInner").length).toBe(1);
	expect(item.find("TextInner").text()).toBe(props.children);
	expect(item.find("Tooltip").length).toBe(1);
});

/** Component renders correctly */
test("Component renders correctly with required props", async () => {
	delete props.verticalOffset;
	delete props.tooltip;
	const item = mount(<ProminentIconButton {...props} />);
	expect(item.find("Wrap").length).toBe(1);
	expect(item.find("ImageWrap").length).toBe(1);
	expect(item.find("Text").length).toBe(1);
	expect(item.find("TextInner").length).toBe(1);
	expect(item.find("TextInner").text()).toBe(props.children);
	expect(item.find("Tooltip").length).toBe(0);
});
