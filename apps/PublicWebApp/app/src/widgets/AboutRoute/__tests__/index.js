import React from "react";
import { shallow } from "enzyme";
import AbouteRoute from "../index";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

// Mock import
jest.mock("../../../common/withAuthConsumer", () => mockPassthruHoc);

let props;

beforeEach(resetAll);
afterEach(resetAll);

function resetAll() {
	props = {
		withAuthConsumer_myUserDetails: { is_fe_user: true },
	};
}

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<AbouteRoute {...props} />);
	expect(item.find("Redirect").length).toBe(1);
	expect(item.find("Redirect").props().to).toBe("/about-for-fe");
});

/** Component renders correctly */
test("Component renders correctly with school user", async () => {
	props.withAuthConsumer_myUserDetails = { is_fe_user: false };
	const item = shallow(<AbouteRoute {...props} />);
	expect(item.find("Redirect").length).toBe(1);
	expect(item.find("Redirect").props().to).toBe("/about-for-school");
});
