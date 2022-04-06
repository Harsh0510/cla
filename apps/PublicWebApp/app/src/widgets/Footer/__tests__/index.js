// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import Footer from "../index";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}
jest.mock("../../../common/withAuthConsumer", () => mockPassthruHoc);

jest.mock("../../../assets/images/footer-bg-new.png", () => jest.fn());
jest.mock("../../../assets/images/footer-logo.png", () => jest.fn());

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<Footer />);
	await wait(100);
	expect(item.find("StyledFooter").length).toBe(1);
});
