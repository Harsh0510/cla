import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import TermsUseRaw from "../index";

/** renders correctly with array only */
test("renders correctly", async () => {
	const item = shallow(<TermsUseRaw />);
	expect(item.find("HeadTitle").length).toBe(1);
	expect(item.find("MainTitle").length).toBe(1);
	expect(item.find("AnchorLink").length).toBe(6);
});
