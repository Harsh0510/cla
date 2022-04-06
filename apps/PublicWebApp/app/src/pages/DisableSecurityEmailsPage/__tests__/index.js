// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import Header from "../../../widgets/Header";
import DisableSecurityEmailsPage from "../index";

let mockSuccess, props;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);

async function defaultApi(endpoint, data) {
	if (endpoint === "/auth/disable-security-emails") {
		if (mockSuccess) {
			return {
				result: true,
			};
		}
		return {
			result: false,
		};
	}
	throw new Error("should never be here");
}

function resetAll() {
	mockSuccess = true;
	props = {
		match: {
			params: {
				hashed: "1231456",
			},
		},
	};
}

/**wait for async function */

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = shallow(<DisableSecurityEmailsPage {...props} api={defaultApi} />);
	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

/** Component Page title */
test(`Component Page title`, async () => {
	const item = shallow(<DisableSecurityEmailsPage {...props} api={defaultApi} />);
	expect(item.find("Title").length).toBe(1);
	expect(item.find("Title").text()).toBe(`Email settings`);
});

/** User has changed email settings successfully */
test(`User has changed email settings successfully`, async () => {
	const item = shallow(<DisableSecurityEmailsPage {...props} api={defaultApi} />);
	await wait(20);
	expect(item.state().message).toBe(`Your email settings were changed successfully.`);
});

/** User get failed error message when trying to change email settings*/
test(`User get failed error message when trying to change email settings`, async () => {
	mockSuccess = false;
	const item = shallow(<DisableSecurityEmailsPage {...props} api={defaultApi} />);
	await wait(20);
	expect(item.state().message).toBe(`Could not update email settings. Are you sure you followed the link correctly?`);
});

/** User get exception error while trying to change email settings */
test(`User get exception error while trying to change email settings`, async () => {
	async function api(endpoint, data) {
		if (endpoint === "/auth/disable-security-emails") {
			throw "Unknown Error";
		}
	}
	const item = shallow(<DisableSecurityEmailsPage {...props} api={api} />);
	await wait(20);
	expect(item.state().message).toBe(`Unknown Error`);
});

/** When emails params token changed then component load again */
test(` When emails params token changed then component load again`, async () => {
	const item = shallow(<DisableSecurityEmailsPage {...props} api={defaultApi} />);
	await wait(20);
	const spy = jest.spyOn(item.instance(), "doDisableSecurityEmails");
	item.setProps({ match: { params: { hashed: "789456" } } });
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(spy).toHaveBeenCalled();
});
