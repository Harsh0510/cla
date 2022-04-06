import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow } from "enzyme";
import MergeVerifyPage from "../index";
import MessageType from "../../../common/messageType";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}
let mockFunction;
let calledParams;
let mockResult;
let props;
let mockMessage;
let mockISVerified;

// Mock import
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAuthConsumer", () => mockPassthruHoc);

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

jest.mock("../../../common/customSetTimeout", () => {
	return function (method, time) {
		return setTimeout(method, 100);
	};
});

async function defaultApi(endpoint, params) {
	if (endpoint === "/auth/oauth/hwb/merge-account-complete") {
		calledParams = params;
		if (mockResult) {
			return mockResult;
		} else {
			throw mockMessage;
		}
	} else if (endpoint === "/auth/oauth/hwb/merge-account-resend-token") {
		if (mockISVerified) {
			return mockISVerified;
		} else {
			throw mockISVerified;
		}
	}
	throw new Error("should never be here");
}

function resetAll() {
	mockFunction = jest.fn();
	mockResult = true;
	calledParams = null;
	mockMessage = "";
	mockISVerified = true;
	props = {
		match: {
			params: {
				token: "ABC",
			},
		},
		withAuthConsumer_myUserDetails: {
			requires_merge_confirmation: {
				type: "fuzzy",
				verification_sent: false,
				target_value: "foo@bar.com",
			},
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders correctly", async () => {
	const item = shallow(<MergeVerifyPage api={defaultApi} {...props} />);
	await wait(50);
	expect(item.text().includes("Submit")).toBe(true);
	expect(calledParams).toEqual({
		activation_token: "ABC",
		check_status_only: true,
	});
});

test("User get token expired message", async () => {
	mockResult = false;
	mockMessage = "Token Expired";
	const item = shallow(<MergeVerifyPage api={defaultApi} {...props} />);
	await wait(50);
	expect(item.state().message).not.toEqual(null);
	expect(item.state().messageType).toEqual(MessageType.warning);
});

test("User get token not exist message", async () => {
	mockResult = false;
	mockMessage = "Token NonExistent";
	const item = shallow(<MergeVerifyPage api={defaultApi} {...props} />);
	await wait(50);
	expect(item.state().message).not.toEqual(null);
	expect(item.state().messageType).toEqual(MessageType.warning);
});

test("User get unknown error", async () => {
	mockResult = false;
	mockMessage = "Unknown";
	const item = shallow(<MergeVerifyPage api={defaultApi} {...props} />);
	await wait(50);
	expect(item.state().message).not.toEqual(null);
	expect(item.state().messageType).toEqual(MessageType.warning);
});

test("User submit and acconut merged successfully", async () => {
	const item = shallow(<MergeVerifyPage api={defaultApi} {...props} />);
	await wait(50);
	item.setState({ terms_accepted: true });
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	expect(item.text().includes("Submit")).toBe(true);
	await wait(10);
	expect(item.state().message).not.toEqual(null);
	expect(item.state().messageType).toEqual(MessageType.success);
	expect(item.find("MessageBox").length).toBe(1);
	expect(item.find("MessageBox").props().message).not.toBe(null);
});

test("User submit and get validation error", async () => {
	const item = shallow(<MergeVerifyPage api={defaultApi} {...props} />);
	await wait(50);
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	expect(item.text().includes("Submit")).toBe(true);
	await wait(10);
	expect(item.state().message).toEqual(null);
	expect(item.state().messageType).toEqual(MessageType.error);
	expect(item.state().valid).toEqual({ terms_accepted: { isValid: false, message: "" } });
});

test("Successfully submit", async () => {
	mockResult = { needsReauth: true };
	const item = shallow(<MergeVerifyPage api={defaultApi} {...props} />);
	await wait(50);
	item.setState({ terms_accepted: true });
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	expect(item.text().includes("Submit")).toBe(true);
});

test("User submit and get token expired warning", async () => {
	mockResult = false;
	mockMessage = "Token Expired";
	const item = shallow(<MergeVerifyPage api={defaultApi} {...props} />);
	await wait(50);
	item.setState({ terms_accepted: true });
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	expect(item.text().includes("Submit")).toBe(false);
	await wait(10);
	expect(item.state().message).not.toEqual(null);
	expect(item.state().messageType).toEqual(MessageType.warning);
});

test("User submit and get token not exist warning", async () => {
	mockResult = false;
	mockMessage = "Token NonExistent";
	const item = shallow(<MergeVerifyPage api={defaultApi} {...props} />);
	await wait(50);
	item.setState({ terms_accepted: true });
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	expect(item.text().includes("Submit")).toBe(false);
	await wait(10);
	expect(item.state().message).not.toEqual(null);
	expect(item.state().messageType).toEqual(MessageType.warning);
});

test("User verification mail re-send", async () => {
	mockResult = false;
	mockMessage = "Token Expired";
	const item = shallow(<MergeVerifyPage api={defaultApi} {...props} />);
	await wait(50);
	item.setState({ terms_accepted: true });
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	expect(item.text().includes("Submit")).toBe(false);
	await wait(10);
	expect(item.state().message).not.toEqual(null);
	expect(item.state().messageType).toEqual(MessageType.warning);
	item.instance().doResendVerify();
	expect(item.state().message).toEqual("Processing...");
	await wait(10);
	expect(item.state().message).toEqual("Verification email sent");
});

test("User click on resend verification link and get warning", async () => {
	mockResult = false;
	mockMessage = "Token Expired";
	mockISVerified = false;
	const item = shallow(<MergeVerifyPage api={defaultApi} {...props} />);
	await wait(50);
	item.setState({ terms_accepted: true });
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	expect(item.text().includes("Submit")).toBe(false);
	await wait(10);
	expect(item.state().message).not.toEqual(null);
	expect(item.state().messageType).toEqual(MessageType.warning);
	item.instance().doResendVerify();
	expect(item.state().messageType).toEqual(MessageType.warning);
});

test("When user change manually token", async () => {
	const item = shallow(<MergeVerifyPage api={defaultApi} {...props} />);
	const prevProps = {
		match: {
			params: {
				token: "ABCD",
			},
		},
	};
	item.instance().componentDidUpdate(prevProps);
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().message).toEqual(null);
});

test("When user change the check box", async () => {
	const item = shallow(<MergeVerifyPage api={defaultApi} {...props} />);
	item.instance().handleCheckBoxChange("terms_accepted", true, true);
	await wait();
	expect(item.state().terms_accepted).toEqual(true);
});

test("When componentWillUnmount", async () => {
	const item = shallow(<MergeVerifyPage api={defaultApi} {...props} />);
	item.instance().componentWillUnmount();
	await wait(50);
	expect(item.instance()._isMounted).toBe(undefined);
	expect(item.instance()._timeout).toBe(undefined);
});
