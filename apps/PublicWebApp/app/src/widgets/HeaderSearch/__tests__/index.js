// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import HeaderSearch from "../index";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAuthConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withPageSize", () => mockPassthruHoc);

let mockProps;

function resetAll() {
	mockProps = {
		location: {
			pathname: "/",
			search: "",
			hash: "",
			key: "az8bb7",
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<HeaderSearch breakpoint={30} {...mockProps} />);
	item.setProps({ withAuthConsumer_myUserDetails: { school: "for Greenwich Observatory (CLA) School", role: "school-admin" } });
	expect(item.find("SearchWrap").length).toBe(1);
	// for home page can't find button is not shown
	expect(item.find("StyledContentRequestButton").length).toBe(0);
});

/** Show unlock in mobile */
test("Show unlock in mobile", async () => {
	const item = shallow(<HeaderSearch breakpoint={10} {...mockProps} />);
	expect(item.find("StyledUnlock").length).toBe(1);
});

/** Dont show unlock in mobile */
/*test('Dont show unlock in mobile', async () => {
	const item = shallow(<HeaderSearch 
							breakpoint={10}
							show_unlock_mobile={false} 
							/>).dive();

	expect(item.find('StyledUnlock').length).toBe(0);
});*/

test("When user role is school admin and any page other than home page can't find what you're looking for button is shown", async () => {
	mockProps.location.pathname = "/unlock";
	const item = shallow(<HeaderSearch breakpoint={30} {...mockProps} />);
	item.setProps({ withAuthConsumer_myUserDetails: { school: "for Greenwich Observatory (CLA) School", role: "school-admin" } });
	expect(item.find("SearchWrap").length).toBe(1);
	expect(item.find("StyledContentRequestButton").length).toBe(1);
});

test("When user role is cla admin and any page other than home page can't find what you're looking for button is not shown", async () => {
	mockProps.location.pathname = "/unlock";
	const item = shallow(<HeaderSearch breakpoint={30} {...mockProps} />);
	item.setProps({ withAuthConsumer_myUserDetails: { school: "for Greenwich Observatory (CLA) School", role: "cla-admin" } });
	expect(item.find("SearchWrap").length).toBe(1);
	expect(item.find("StyledContentRequestButton").length).toBe(0);
});

test("User sees content request model when clicks on can't find what you're looking for button", async () => {
	mockProps.location.pathname = "/unlock";
	const item = shallow(<HeaderSearch breakpoint={30} {...mockProps} />);
	item.setProps({ withAuthConsumer_myUserDetails: { school: "for Greenwich Observatory (CLA) School", role: "school-admin" } });
	const contentRequestButton = item.find("StyledContentRequestButton");
	expect(contentRequestButton.length).toBe(1);
	contentRequestButton.simulate("click");
	expect(item.find("ContentRequestModal").length).toBe(1);
});

test("When user close content request modal", async () => {
	mockProps.location.pathname = "/unlock";
	const item = shallow(<HeaderSearch breakpoint={30} {...mockProps} />);
	item.setProps({ withAuthConsumer_myUserDetails: { school: "for Greenwich Observatory (CLA) School", role: "school-admin" } });
	const contentRequestButton = item.find("StyledContentRequestButton");
	expect(contentRequestButton.length).toBe(1);
	contentRequestButton.simulate("click");
	expect(item.find("ContentRequestModal").length).toBe(1);
	item.instance().hideContentRequestModal();
	expect(item.find("ContentRequestModal").length).toBe(0);
});
