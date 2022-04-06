// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import ScreenView from "../ScreenView";

let props;

function resetAll() {
	props = { isExpiredCopy: true, showViewModal: jest.fn() };
}

/**wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<ScreenView {...props} />);
	expect(item.find("Title").length).toBe(1);
	const tabletIcon = item.find("i").at(0);
	expect(tabletIcon.props().className).toEqual("fas fa-mobile-alt");
	expect(item.find("MediaItem").at(0).props().children.props.title).toEqual("See mobile view");
	const mocileIcon = item.find("i").at(1);
	expect(mocileIcon.props().className).toEqual("fas fa-tablet-alt");
	expect(item.find("MediaItem").at(1).props().children.props.title).toEqual("See tablet view");
});
