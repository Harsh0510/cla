// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import SharedLinksTable from "../SharedLinksTable";
import MockData from "../../../mocks/MockCopyManagementPage";

//local params props decalration
let props = {
	copyOid: null,
	shareLinks: null,
	extractPages: null,
	deactivateShare: null,
};

/**
 * This 'HOC' does nothing but 'pass through' the provided component,
 * so it's not necessary to 'dive()' into rendered results,
 * and so it's possible to mock the 'api' function.
 **/
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withPageSize", () => mockPassthruHoc);

/**wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	props = {
		copyOid: "bfad28ec4d31736fc7a7f83c942ab2e71dd3",
		shareLinks: MockData.ExtractGetShareLinks.result,
		extractPages: MockData.ExtractPages,
		deactivateShare: MockData.ExtractGetShareLinks,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const mockdeactivateShare = jest.fn();
	const item = shallow(<SharedLinksTable copyOid={props.copyOid} shareLinks={props.shareLinks} deactivateShare={mockdeactivateShare} />).dive();
	await wait(100);
	item.update();
	expect(item.find("ShareTableRaw").length).toBe(1);
});

/** User getting the sharelinks data null  */
test("User getting the sharelinks data null ", async () => {
	const mockdeactivateShare = jest.fn();
	props.shareLinks = [];
	const item = shallow(<SharedLinksTable copyOid={props.copyOid} shareLinks={null} deactivateShare={mockdeactivateShare} />).dive();

	expect(item.find("ShareRow").length).toBe(0);
});

/** Render component with mount */
test("Render component with mount ", async () => {
	const mockdeactivateShare = jest.fn();
	props.shareLinks = [];
	const item = shallow(<SharedLinksTable copyOid={props.copyOid} shareLinks={props.shareLinks} deactivateShare={mockdeactivateShare} />).dive();

	expect(item.find("ShareTableRaw").length).toBe(1);
});

test(`Component Flyout renders correctly`, async () => {
	const mockdeactivateShare = jest.fn();
	const item = shallow(
		<SharedLinksTable
			copyOid={props.copyOid}
			shareLinks={props.shareLinks}
			deactivateShare={mockdeactivateShare}
			flyOutIndex={1}
			sharePopupOpen={false}
		/>
	).dive();

	expect(item.find("withWhiteOutConsumer").length).toBe(1);
});

test(`User access the some of extracts using access code`, async () => {
	const mockdeactivateShare = jest.fn();

	const item = shallow(
		<SharedLinksTable
			copyOid={props.copyOid}
			shareLinks={props.shareLinks}
			deactivateShare={mockdeactivateShare}
			flyOutIndex={1}
			sharePopupOpen={false}
		/>
	).dive();

	expect(item.find("withWhiteOutConsumer").length).toBe(1);
});
