import React from "react";
import { shallow, mount } from "enzyme";
import withAuthConsumer from "../withAuthConsumer.js";
import MockUser from "../../mocks/MockUser";

/**Variables  */
let acceptedRoles, WrappedComponent, mockUserData;

function resetAll() {
	mockUserData = MockUser[0];
	WrappedComponent = mockPassthruHoc;
}

beforeEach(resetAll);
afterEach(resetAll);

/**mock hoc function */
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

/**Function render correctly */
test("Component renders correctly", async () => {
	const MyParentComponent = withAuthConsumer();
	const MyFirstComponent = shallow(<MyParentComponent></MyParentComponent>);

	expect(MyFirstComponent.find("ContextConsumer").length).toBe(1);
});
