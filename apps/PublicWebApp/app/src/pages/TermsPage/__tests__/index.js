// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import Header from "../../../widgets/Header";
import TermsPage from "../index";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withAuthConsumer", () => mockPassthruHoc);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<TermsPage />);

	expect(item.containsMatchingElement(<Header />)).toBe(true);
});
