// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import Loader from "../index";

let full;
/**
 * Reset function
 */
function resetAll() {
	full = true;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Function renders correctly */
test("Function renders correctly", async () => {
	const item = shallow(<Loader />);
	expect(item.find("StyledLoader").length).toBe(1);
});

/** Function renders correctly */
test("Function renders with props value", async () => {
	full = false;
	const item = mount(<Loader full={full} />);
	expect(item.find("StyledLoader").length).toBe(1);
});
