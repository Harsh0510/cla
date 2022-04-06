// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import Header from "../../../widgets/Header";
import CookiePolicy from "../index";

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<CookiePolicy />);

	expect(item.containsMatchingElement(<Header />)).toBe(true);
	expect(item.find("PageContainer").length).toBe(1);
});

/** Component header title */
test("Component header title", async () => {
	const item = shallow(<CookiePolicy />);
	expect(item.find("MainTitle").length).toBe(1);
});
