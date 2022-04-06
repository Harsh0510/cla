// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import Header from "../../../widgets/Header";
import RegisterHelp from "../index";

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<RegisterHelp />);
	expect(item.find("h3").at(0).text()).toEqual("Most schools are eligible");
});

/** Component render with header title */
test("Component render with header title", async () => {
	const item = shallow(<RegisterHelp />);
	const mainTitle = item.find("MainTitle").dive();
	expect(mainTitle.find("h1").text()).toEqual("Registering as a user");
});

/** Component render with Useful links section */
test("Component render with Useful links section", async () => {
	const item = shallow(<RegisterHelp />);
	const userfulLinks = item.find("h3").at(2);
	expect(userfulLinks.text()).toEqual("Useful links");
});

/** Display Useful links section with ListWithCheckBox component*/
test("Display Useful links section with ListWithCheckBox component", async () => {
	const item = shallow(<RegisterHelp />);
	const listWithCheckBox = item.find("ListWithCheckBox").dive();
	expect(listWithCheckBox.find("AnchorLink").at(0).text()).toEqual("About the Platform");
});
