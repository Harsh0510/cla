// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import ExtractListing from "../index";
import MockExtract from "../../../mocks/MockCopyManagementPage";

let isCalledSetDefaultCoverImage;

jest.mock("../../../common/setDefaultCoverImage.js", () => {
	return () => {
		isCalledSetDefaultCoverImage = true;
	};
});

function resetAll() {
	isCalledSetDefaultCoverImage = false;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<ExtractListing extract={MockExtract.ExtractSearch.extracts[0]} />);
	expect(item.find("Tr").length).toBe(1);
});

test(`When asset does not have cover image`, async () => {
	const item = shallow(<ExtractListing extract={MockExtract.ExtractSearch.extracts[0]} />);
	item.find("ItemImage").simulate("error");
	expect(isCalledSetDefaultCoverImage).toBeTruthy();
});
