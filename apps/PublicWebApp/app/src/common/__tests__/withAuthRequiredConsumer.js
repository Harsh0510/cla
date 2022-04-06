import React from "react";
import { shallow, mount } from "enzyme";
import withAuthRequiredConsumer from "../withAuthRequiredConsumer";
import MockUser from "../../mocks/MockUser";

/**mock hoc function */
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

/**mock */
// jest.mock('../AuthContext', () => mockPassthruHoc);

/**variables */
let acceptedRoles, WrappedComponent, mockUserData;

function resetAll() {
	mockUserData = MockUser[0];
	WrappedComponent = mockPassthruHoc;
}

beforeEach(resetAll);
afterEach(resetAll);

/**Function render correctly */
test("Component renders correctly", async () => {
	const MyParentComponent = withAuthRequiredConsumer(WrappedComponent);
	const MyFirstComponent = shallow(<MyParentComponent />);

	expect(MyFirstComponent.find("ContextConsumer").length).toBe(1);
});
