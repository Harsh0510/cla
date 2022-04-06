import React from "react";
import { shallow, mount } from "enzyme";
import CheckBox from "../CheckBox";

/** Component renders correctly */
test("Component renders", async () => {
	const item = mount(<CheckBox />);
	expect(item.find("input").length).toBe(1);
});

/** When user click on checkbox */
test("When user click on checkbox", async () => {
	const mockFn = jest.fn();
	const item = mount(<CheckBox type="checkbox" onChange={mockFn} checked={false} name={"chk"} />);
	item.instance().doChange({ currentTarget: { checked: true } });
	expect(mockFn).toHaveBeenCalled();
});

test("Display ExtraText on UI", async () => {
	const mockFn = jest.fn();
	const checked = true;
	const extraText = "What will I receive?";
	const item = mount(<CheckBox name={"check"} onChange={mockFn} checked={true} value={checked} extraText={extraText} />);
	expect(item.props.extraText).not.toBe(null);
});
