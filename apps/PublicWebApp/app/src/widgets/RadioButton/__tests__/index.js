// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import RadioButton from "../index";

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(<RadioButton />);
	expect(item.find("input").length).toBe(1);
});

/** Component renders correctly */
test("Component renders with props checked true value", async () => {
	const item = mount(<RadioButton checked={true} onChange={() => {}} />);
	expect(item.find("input").length).toBe(1);
});
