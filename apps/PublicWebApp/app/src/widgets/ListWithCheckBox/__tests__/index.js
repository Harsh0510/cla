// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import ListWithCheckBox from "../index";

const LINKS = [
	{ name: "About", url: "/about" },
	{ name: "Registering as a user", url: "/how-to-register" },
	{ name: "Using the Platform to make copies", url: "/how-to-copy" },
	{ name: "Accessing more support", url: "/support" },
];

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(<ListWithCheckBox options={LINKS} isIcon={false} isUrls={true} />);
	expect(item.find("ListWrap").length).toBe(1);
});

/** When list display with icon */
test("When list display with icon", async () => {
	const item = mount(<ListWithCheckBox options={LINKS} isIcon={true} isUrls={true} />);
	expect(item.prop("isIcon")).toBe(true);
});
