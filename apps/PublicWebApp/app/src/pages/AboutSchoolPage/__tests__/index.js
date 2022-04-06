// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import AboutSchoolPage from "../index";

jest.mock("../../../assets/images/wonde.png", () => {
	return;
});
jest.mock("../../../assets/images/cla.png", () => {
	return;
});

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<AboutSchoolPage />);
	expect(item.find("AboutSection h3").text()).toEqual(
		"The Copyright Licensing Agency Education Platform is an online service that gives schools covered by the CLA Education Licence access to digital resources to use for teaching."
	);
});

/** Component renders with header title */
test("Component renders with header title", async () => {
	const item = shallow(<AboutSchoolPage />);
	const mainTitle = item.find("MainTitle").dive();
	expect(mainTitle.find("MainTitleText h1").text()).toEqual("About the Education Platform");
});

/** Component renders with Give your teachers and school staff these benefits section */
test("Component renders with Give your teachers and school staff these benefits section", async () => {
	const item = shallow(<AboutSchoolPage />);
	const pageContainer = item.find("PageContainer h3").at(2);
	expect(pageContainer.text()).toEqual("Give your teachers and school staff these benefits");
});

/** Component renders with ListWithCheckBox option*/
test("Component renders with ListWithCheckBox option", async () => {
	const item = shallow(<AboutSchoolPage />);
	const listWithCheckBox = item.find("ListWithCheckBox").at(0).dive();
	expect(listWithCheckBox.find("span").at(0).text()).toEqual(
		"Completely free access to digital resources paid for by your Government so you can use the resources to support your teaching"
	);
});

/** Component renders with Useful links*/
test("Component renders with Useful links", async () => {
	const item = shallow(<AboutSchoolPage />);
	const usefulLinks = item.find("h3").at(1);
	expect(usefulLinks.text()).toEqual("Take a quick video tour of the Education Platform (1'30\" duration)");
});
