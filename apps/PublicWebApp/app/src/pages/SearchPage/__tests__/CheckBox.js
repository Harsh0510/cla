// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import CheckBox from "../CheckBox";

/** wait function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

test("Component renders correctly", async () => {
	const doChange = jest.fn();
	const item = mount(
		<CheckBox key={1} children="My Copies" onChange={doChange} checked={false} value={"my_copies"} exclusive={true} isLabel={false} />
	);

	expect(item.find("Li").length).toBe(1);
});

test("Component renders correctly with checked true", async () => {
	const doChange = jest.fn();
	const item = mount(
		<CheckBox key={1} children="My Copies" onChange={doChange} checked={true} value={"my_copies"} exclusive={true} isLabel={false} />
	);

	expect(item.find("Li").length).toBe(1);
});

/** User changed the checkbox value */
test("Component renders correctly with checked true", async () => {
	const doChange = jest.fn();
	const item = mount(<CheckBox key={1} children="My Copies" onChange={doChange} checked={true} value={"my_copies"} isLabel={true} />);

	await wait(50);

	item.instance().doChange({ currentTarget: { checked: true } });

	expect(doChange).toHaveBeenCalled();
});
