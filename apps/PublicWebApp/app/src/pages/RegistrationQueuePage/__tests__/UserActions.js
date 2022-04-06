// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import UserActions from "../UserActions";
import USERDATA from "../../../mocks/MockUser";

let status;
/**
 * Reset function
 */
function resetAll() {
	status = ["Unverified", "Pending", "Approved"];
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly with Unverified status*/
test("Component renders correctly with approve email", async () => {
	const mockDoCompleteApprove = jest.fn();
	const item = shallow(
		<UserActions approvingOid={USERDATA[0].email} status={status[0]} email={USERDATA[0].email} doCompleteApprove={mockDoCompleteApprove} />
	);
	expect(item.find("FormWrap").length).toBe(1);
});

/** Component renders correctly with Pending status*/
/** now we have to change the status and mock function too*/
test("Component renders correctly with Pending status", async () => {
	const mockDoInitApprove = jest.fn();
	const item = shallow(<UserActions email={USERDATA[0].email} status={status[1]} doInitApprove={mockDoInitApprove} />);
	expect(item.find("ActionLink").length).toBe(2);
	expect(item.find("ActionLink").at(0).text()).toEqual("Approve");
	expect(item.find("ActionLink").at(1).text()).toEqual("Block");
});

test("Component renders correctly with Unverified status", async () => {
	const mockDoInitApprove = jest.fn();
	const item = shallow(<UserActions email={USERDATA[0].email} status={status[0]} doInitApprove={mockDoInitApprove} />);
	expect(item.find("ActionLink").length).toBe(2);
	expect(item.find("ActionLink").at(1).text()).toEqual("Resend Verification Email");
});

test("Component renders correctly with Approved status", async () => {
	const mockDoInitApprove = jest.fn();
	const item = shallow(<UserActions email={USERDATA[0].email} status={status[2]} doInitApprove={mockDoInitApprove} />);
	expect(item.find("ActionLink").length).toBe(1);
	expect(item.find("ActionLink").at(0).text()).toEqual("Resend Password Set Email");
});
