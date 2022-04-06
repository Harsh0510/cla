import React from "react";
import { shallow, mount } from "enzyme";
import withWhiteOutConsumer from "../withWhiteOutConsumer";

/** mock HOC function */
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

/** variables */
let WrappedComponent;

function resetAll() {
	WrappedComponent = mockPassthruHoc;
}

beforeEach(resetAll);
afterEach(resetAll);

/**Function render correctly */
test("Component renders correctly", async () => {
	const MyParentComponent = withWhiteOutConsumer(WrappedComponent);
	const MyFirstComponent = shallow(<MyParentComponent />);
	expect(MyFirstComponent.find("ContextConsumer").length).toBe(1);
});
