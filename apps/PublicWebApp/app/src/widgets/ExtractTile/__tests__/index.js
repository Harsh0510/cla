// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import ExtractTile from "../index";
import MockExtract from "../../../mocks/MockCopyManagementPage";

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<ExtractTile extract={MockExtract.ExtractSearch.extracts[0]} />);
	expect(item.find("li").length).toBe(1);
});
