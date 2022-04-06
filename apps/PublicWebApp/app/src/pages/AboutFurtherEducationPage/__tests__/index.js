// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import AboutFurtherEducationPage from "../index";

jest.mock("../../../assets/images/wonde.png", () => {
	return;
});
jest.mock("../../../assets/images/cla.png", () => {
	return;
});

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<AboutFurtherEducationPage />);
	expect(item.find("AboutSection h3").text()).toEqual(
		"The Copyright Licensing Agency Education Platform is an online service that gives Further Education colleges covered by the CLA Education Licence access to digital resources to use for learning and teaching."
	);
});

/** Component renders with header title */
test("Component renders with header title", async () => {
	const item = shallow(<AboutFurtherEducationPage />);
	const mainTitle = item.find("MainTitle").dive();
	expect(mainTitle.find("MainTitleText h1").text()).toEqual("About the Education Platform");
});

/** Component renders with Give your college staff these benefits section */
test("Component renders with Give your college staff these benefits section", async () => {
	const item = shallow(<AboutFurtherEducationPage />);
	const pageContainer = item.find("PageContainer h3").at(1);
	expect(pageContainer.text()).toEqual("Give your college staff these benefits");
});

/** Component renders with ListWithCheckBox option*/
test("Component renders with ListWithCheckBox option", async () => {
	const item = shallow(<AboutFurtherEducationPage />);
	const listWithCheckBox = item.find("ListWithCheckBox").at(0).dive();
	expect(listWithCheckBox.find("span").at(0).text()).toEqual(
		"Completely free access to digital resources, already covered by your CLA Licence, so you can use the resources to support your learning and teaching"
	);
});

/** Component renders with Useful links*/
test("Component renders with Useful links", async () => {
	const item = shallow(<AboutFurtherEducationPage />);
	const usefulLinks = item.find("h3").at(2);
	expect(usefulLinks.text()).toEqual("Take a quick video tour of the Education Platform (1'30\" duration)");
});
