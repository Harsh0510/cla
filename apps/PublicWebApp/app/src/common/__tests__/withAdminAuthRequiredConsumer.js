import React from "react";
import { shallow, mount } from "enzyme";
import withAdminAuthRequiredConsumer from "../withAdminAuthRequiredConsumer";
import MockUser from "../../mocks/MockUser";

/**mock hoc function */
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

/**mock */
// jest.mock('../AuthContext', () => {
//	 return function(){
//			 return {value : {myUserDetails : mockUserData }}
//	 };
// });

/**variables */
let acceptedRoles, WrappedComponent, mockUserData;

function resetAll() {
	acceptedRoles = {
		"cla-admin": true,
		teacher: true,
	};
	mockUserData = MockUser[0];
	WrappedComponent = mockPassthruHoc;
}

beforeEach(resetAll);
afterEach(resetAll);

/**Function render correctly */
test("Component renders correctly", async () => {
	const MyParentComponent = withAdminAuthRequiredConsumer(acceptedRoles, WrappedComponent);
	const MyFirstComponent = shallow(<MyParentComponent />);

	expect(MyFirstComponent.find("ContextConsumer").length).toBe(1);
});

/**Function render correctly */
test("Component renders correctly without acceptedRoles", async () => {
	const MyParentComponent = withAdminAuthRequiredConsumer(WrappedComponent);
	const MyFirstComponent = shallow(<MyParentComponent />);

	expect(MyFirstComponent.find("ContextConsumer").length).toBe(1);
});
