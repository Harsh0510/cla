// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import Header from "../../../widgets/Header";
import SupportPage from "../index";

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<SupportPage />);
	expect(item.find("h3").at(0).text()).toEqual("Read our FAQs");
});

/** Component render with header title */
test("Component render with header title", async () => {
	const item = shallow(<SupportPage />);
	const mainTitle = item.find("MainTitle").dive();
	expect(mainTitle.find("h1").text()).toEqual("Accessing more support");
});

/** Component render with useful links section */
test("Component render with useful links section", async () => {
	const item = shallow(<SupportPage />);
	const userfulLinks = item.find("h3").at(4);
	expect(userfulLinks.text()).toEqual("Useful links");
});

/** Display Useful links section with ListWithCheckBox component*/
test("Display Useful links section with ListWithCheckBox component", async () => {
	const item = shallow(<SupportPage />);
	const listWithCheckBox = item.find("ListWithCheckBox").dive();
	expect(listWithCheckBox.find("AnchorLink").at(0).text()).toEqual("About the Platform");
});
