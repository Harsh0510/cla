// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";

import MockMyDetails from "../../../mocks/MockMyDetails";
import messageType from "../../../common/messageType";
import UserAssetAccessMessage from "../index";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

// Mock import
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAuthConsumer", () => mockPassthruHoc);

let props, mockFunction, mockApiParams, mockMyUserDetails;

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

async function defaultApi(endpoint, data) {
	if (endpoint === "/auth/user-resend-registration") {
		if (mockApiParams === true) {
			return {
				result: true,
			};
		}
		if (mockApiParams === false) {
			return {
				result: false,
			};
		}
		throw new Error("should never be here");
	}
}

function resetAll() {
	mockMyUserDetails = MockMyDetails;
	mockFunction = jest.fn();
	mockApiParams = false;
	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		api: defaultApi,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders correctly when user mail is unverified", async () => {
	mockMyUserDetails.can_copy = false;
	const item = shallow(<UserAssetAccessMessage {...props} />);
	expect(item.find("CopyEditLinkButton").length).toBe(1);
});

test("Return null when user can copy", async () => {
	mockMyUserDetails.can_copy = true;
	const item = shallow(<UserAssetAccessMessage {...props} />);
	expect(item.find("userAssetAccessMessage").length).toBe(0);
});

test("When user clicked on verification email link and get success message", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_verified = false;
	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		api: defaultApi,
	};
	mockApiParams = true;
	const item = shallow(<UserAssetAccessMessage {...props} />);
	expect(item.find("CopyEditLinkButton").length).toBe(1);
	const copyEditLinkButton = item.find("CopyEditLinkButton");
	copyEditLinkButton.simulate("click", {
		preventDefault: () => {},
	});
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(item.state("doShowModal")).toBe(true);
	expect(item.state("messageType")).toBe(messageType.success);
});

test("When user clicked on verification email link and get error message", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_verified = false;
	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		api: defaultApi,
	};
	mockApiParams = false;
	const item = shallow(<UserAssetAccessMessage {...props} />);
	expect(item.find("CopyEditLinkButton").length).toBe(1);
	const copyEditLinkButton = item.find("CopyEditLinkButton");
	copyEditLinkButton.simulate("click", {
		preventDefault: () => {},
	});
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(item.state("doShowModal")).toBe(true);
	expect(item.state("messageType")).toBe(messageType.error);
});

test("When user clicked on verification email link and get error message of Unknown error", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_verified = false;
	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		api: defaultApi,
	};
	mockApiParams = "Unknown error";
	const item = shallow(<UserAssetAccessMessage {...props} />);
	expect(item.find("CopyEditLinkButton").length).toBe(1);
	const copyEditLinkButton = item.find("CopyEditLinkButton");
	copyEditLinkButton.simulate("click", {
		preventDefault: () => {},
	});
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(item.state("doShowModal")).toBe(true);
	expect(item.state("messageType")).toBe(messageType.error);
});

test("When user clicked on verification email link with success result and move to another component", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_verified = false;
	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		api: defaultApi,
	};
	mockApiParams = true;
	const item = shallow(<UserAssetAccessMessage {...props} />);
	expect(item.find("CopyEditLinkButton").length).toBe(1);
	const copyEditLinkButton = item.find("CopyEditLinkButton");
	copyEditLinkButton.simulate("click", {
		preventDefault: () => {},
	});
	item.instance().componentWillUnmount();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(item.state("doShowModal")).toBe(false);
	expect(item.state("messageType")).toBe(null);
});

test("When user clicked on verification email link with error and move to another component", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_verified = false;
	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		api: defaultApi,
	};
	mockApiParams = "Unknown error";
	const item = shallow(<UserAssetAccessMessage {...props} />);
	expect(item.find("CopyEditLinkButton").length).toBe(1);
	const copyEditLinkButton = item.find("CopyEditLinkButton");
	copyEditLinkButton.simulate("click", {
		preventDefault: () => {},
	});
	item.instance().componentWillUnmount();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(item.state("doShowModal")).toBe(false);
	expect(item.state("messageType")).toBe(null);
});

test("When user has verified but can not approve", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_verified = true;
	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		api: defaultApi,
	};
	const item = shallow(<UserAssetAccessMessage {...props} />);
	expect(item.find("CopyEditLinkButton").length).toBe(0);
});

test("When user clicked on verification email link and close modal", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_verified = false;
	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		api: defaultApi,
	};
	mockApiParams = true;
	const item = shallow(<UserAssetAccessMessage {...props} />);
	const copyEditLinkButton = item.find("CopyEditLinkButton");
	copyEditLinkButton.simulate("click", {
		preventDefault: () => {},
	});
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(item.state("doShowModal")).toBe(true);
	expect(item.state("messageType")).toBe(messageType.success);
	//User close the modal
	item.instance().handleCloseModal();
	expect(item.state("doShowModal")).toBe(false);
});

test("When user clicked on support email link and move to another component", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_verified = false;
	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		api: defaultApi,
	};
	mockApiParams = true;
	const item = shallow(<UserAssetAccessMessage {...props} />);
	expect(item.find("_default").length).toBe(1);
	const _default = item.find("_default");
	_default.simulate("click", {
		preventDefault: () => {},
	});
	item.instance().componentWillUnmount();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(item.state("doShowModal")).toBe(false);
	expect(item.state("messageType")).toBe(null);
});
