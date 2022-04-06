// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import Header from "../../../widgets/Header";
import CopyPage from "../index";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../how to make copies_1.jpg", () => mockPassthruHoc);
jest.mock("../how to make copies_2.jpg", () => mockPassthruHoc);
jest.mock("../how to make copies_3.jpg", () => mockPassthruHoc);
jest.mock("../how to make copies_4.jpg", () => mockPassthruHoc);
jest.mock("../how to make copies_5.jpg", () => mockPassthruHoc);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<CopyPage />);
	expect(item.find("PageContainer h3").at(0).text()).toEqual("Prerequisites");
});

/** Component render with header title */
test("Component render with header title", async () => {
	const item = shallow(<CopyPage />);
	const mainTitle = item.find("MainTitle").dive().find("h1");
	expect(mainTitle.text()).toEqual("How to make copies");
});

/** Component render with naviagtion bar title */
test("Component render with naviagtion bar title", async () => {
	const item = shallow(<CopyPage />);
	const navigationBar = item.find("NavigationBar").find("a").at(0);
	expect(navigationBar.text()).toEqual("Prerequisites");
});

/** Component render with 5 images */
test("Component render with partners images", async () => {
	const item = shallow(<CopyPage />);
	expect(item.find("img").length).toBe(5);
});
