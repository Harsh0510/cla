// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import UnlockButton from "../index";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("react-router-dom/Link", () => mockPassthruHoc);

/** UnlockButton button renders correctly */
test("UnlockButton button renders correctly", async () => {
	const item = shallow(<UnlockButton to="/url" />);
	expect(item.find("Link").length).toBe(1);
});
