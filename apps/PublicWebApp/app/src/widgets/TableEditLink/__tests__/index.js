// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow } from "enzyme";
import TableEditLink from "../index";

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<TableEditLink to="/url" link="testlink" />);
	expect(item.find("Link").length).toBe(1);
});
