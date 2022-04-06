// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import ConfirmEmailPage from "../index";
import Header from "../../../widgets/Header";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAuthRequiredConsumer", () => mockPassthruHoc);

let match, location;
const token = "123";
// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/** defaultApi */
async function defaultApi(endpoint, data = null) {
	// "ConfirmEmailPage" only queries this endpoint
	if (endpoint === "/auth/user-confirm-email-change") {
		if (data === true) {
			return {
				result: {
					result: true,
				},
			};
		}

		if (data === false) {
			return {
				result: {
					result: false,
				},
			};
		}
	}
	throw new Error("should never be here");
}

function resetAll() {
	match = {
		params: {
			token: token,
		},
	};

	location = {
		pathname: "/auth/confirm-email/" + token,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<ConfirmEmailPage match={match} api={defaultApi} location={location} />);
	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

/** Load Confirming message */
test("Load Confirming message", async () => {
	const item = shallow(<ConfirmEmailPage match={match} api={defaultApi} location={location} />);
	expect(item.find("Message").text()).toEqual("Confirming email address change...");
});

/** User\'s valid token */
test("User's valid token", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-confirm-email-change") {
			return { result: true };
		}
		return defaultApi(endpoint, true);
	}

	const item = shallow(<ConfirmEmailPage match={match} api={api} location={location} />);

	await wait(50);
	item.update();

	expect(item.find("Message").text()).toEqual("Your email address has been changed.");
});

/** User\'s Invalid token */
test("User's Invalid token", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/auth/user-confirm-email-change") {
			return { result: false };
		}
		return defaultApi(endpoint, false);
	}

	const item = shallow(<ConfirmEmailPage match={match} api={api} location={location} />);

	await wait(50);
	item.update();

	expect(item.find("Message").text()).toEqual(
		"We couldn't confirm your email change. Your link may have expired. Please contact your institution administrator."
	);
});
