// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import messageType from "../../../common/messageType";
import React from "react";
import { shallow } from "enzyme";
import CopyCreationAccessDeniedPopup from "../index";
import MockMyDetails from "../../../mocks/MockMyDetails";

let mockAPIData = false,
	mockFunction,
	mockMyUserDetails,
	props,
	mockUserDidChange;

/**
 * This 'HOC' does nothing but 'pass through' the provided component,
 * so it's not necessary to 'dive()' into rendered results,
 * and so it's possible to mock the 'api' function.
 **/
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

// Mock import
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAuthConsumer", () => mockPassthruHoc);

/**
 * Timeout mock function
 */
jest.mock("../../../common/customSetTimeout", () => {
	return function (method, time) {
		setTimeout(method, 50);
	};
});
jest.mock("../../../common/userDidChange", () => {
	return function (newProps, oldProps) {
		if (mockUserDidChange) {
			return true;
		}
		return false;
	};
});

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}
/**
 * Reset function
 */
function resetAll() {
	mockAPIData = false;
	mockFunction = jest.fn();
	mockMyUserDetails = MockMyDetails;
	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		handleClose: mockFunction,
		api: defaultApi,
	};
	mockUserDidChange = false;
}

beforeEach(resetAll);
afterEach(resetAll);

async function defaultApi(endpoint, data) {
	if (endpoint === "/auth/user-resend-registration") {
		if (mockAPIData === true) {
			return {
				result: true,
			};
		}
		if (mockAPIData === false) {
			return {
				result: false,
			};
		}
		throw new Error("should never be here");
	}
}

/** Component renders correctly */
test("Component renders correctly", async () => {
	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		handleClose: mockFunction,
		api: defaultApi,
	};
	const item = shallow(<CopyCreationAccessDeniedPopup {...props} />);
	expect(item.find("Wrap").length).toBe(0);
	expect(item.find("Modal").length).toBe(0);
	expect(item.find("ModalContent").length).toBe(0);
});

test("Component renders correctly when user detail not provided", async () => {
	props = {};
	const item = shallow(<CopyCreationAccessDeniedPopup {...props} />);
	expect(item.find("Wrap").length).toBe(0);
	expect(item.find("Modal").length).toBe(0);
	expect(item.find("ModalContent").length).toBe(0);
});

test("Return Null when user trial extract access finished", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_trial_extract_access = false;
	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		handleClose: mockFunction,
		api: defaultApi,
	};
	const item = shallow(<CopyCreationAccessDeniedPopup {...props} />);
	expect(item.find("Wrap").length).toBe(0);
	expect(item.find("Modal").length).toBe(0);
	expect(item.find("ModalContent").length).toBe(0);
});

test("When User has trial extract access but user not verified his email", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_trial_extract_access = true;
	mockMyUserDetails.has_verified = false;
	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		handleClose: mockFunction,
		api: defaultApi,
	};
	const item = shallow(<CopyCreationAccessDeniedPopup {...props} />);
	expect(item.find("Wrap").length).toBe(1);
	expect(item.find("Modal").length).toBe(1);
	expect(item.find("ModalContent").length).toBe(1);
	expect(item.find("ModalHeader").length).toBe(1);
	expect(item.find("ModalHeaderDescription").length).toBe(1);
	expect(item.find("ModalBody").length).toBe(1);
});

test("When User has trial extract access but user has verified but not approve from admin", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_trial_extract_access = true;
	mockMyUserDetails.has_verified = true;

	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		handleClose: mockFunction,
		api: defaultApi,
	};
	const item = shallow(<CopyCreationAccessDeniedPopup {...props} />);
	expect(item.find("Wrap").length).toBe(1);
	expect(item.find("Modal").length).toBe(1);
	expect(item.find("ModalContent").length).toBe(1);
	expect(item.find("ModalHeader").length).toBe(1);
	expect(item.find("ModalBody").length).toBe(1);
});

test("When User click on request a new email link and get success message", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_trial_extract_access = true;
	mockMyUserDetails.has_verified = false;
	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		handleClose: mockFunction,
		api: defaultApi,
	};
	mockAPIData = true;
	const item = shallow(<CopyCreationAccessDeniedPopup {...props} />);
	expect(item.find("Wrap").length).toBe(1);
	expect(item.find("Modal").length).toBe(1);
	expect(item.find("ModalContent").length).toBe(1);
	expect(item.find("ModalHeader").length).toBe(1);
	expect(item.find("ModalHeaderDescription").length).toBe(1);
	expect(item.find("ModalBody").length).toBe(1);
	expect(item.find("CopyEditLinkButton").length).toBe(1);
	const requestEmailLink = item.find("CopyEditLinkButton");
	requestEmailLink.simulate("click", {
		preventDefault: () => {},
	});
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().doShowMessage).toBe(true);
	expect(item.state("resultMessageType")).toBe(messageType.success);
	expect(item.find("MessageBox").length).toBe(1);
	expect(item.state("isLoading")).toBe(false);
	await wait(50);
	expect(item.state().doShowMessage).toBe(false);
	expect(item.find("MessageBox").length).toBe(0);
	expect(item.state("resultMessageType")).toBe(null);
});

test("When User click on request a new email link and get error message", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_trial_extract_access = true;
	mockMyUserDetails.has_verified = false;
	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		handleClose: mockFunction,
		api: defaultApi,
	};
	mockAPIData = false;
	const item = shallow(<CopyCreationAccessDeniedPopup {...props} />);
	expect(item.find("Wrap").length).toBe(1);
	expect(item.find("Modal").length).toBe(1);
	expect(item.find("ModalContent").length).toBe(1);
	expect(item.find("ModalHeader").length).toBe(1);
	expect(item.find("ModalHeaderDescription").length).toBe(1);
	expect(item.find("ModalBody").length).toBe(1);
	expect(item.find("CopyEditLinkButton").length).toBe(1);
	const requestEmailLink = item.find("CopyEditLinkButton");
	requestEmailLink.simulate("click", {
		preventDefault: () => {},
	});
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().doShowMessage).toBe(true);
	expect(item.state("resultMessageType")).toBe(messageType.error);
	expect(item.find("MessageBox").length).toBe(1);
	expect(item.state("isLoading")).toBe(false);
	await wait(50);
	expect(item.state().doShowMessage).toBe(false);
	expect(item.find("MessageBox").length).toBe(0);
	expect(item.state("resultMessageType")).toBe(null);
});

test("When User click on request a new email link and get error message", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_trial_extract_access = true;
	mockMyUserDetails.has_verified = false;
	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		handleClose: mockFunction,
		api: defaultApi,
	};
	mockAPIData = "exception";
	const item = shallow(<CopyCreationAccessDeniedPopup {...props} />);
	expect(item.find("Wrap").length).toBe(1);
	expect(item.find("Modal").length).toBe(1);
	expect(item.find("ModalContent").length).toBe(1);
	expect(item.find("ModalHeader").length).toBe(1);
	expect(item.find("ModalHeaderDescription").length).toBe(1);
	expect(item.find("ModalBody").length).toBe(1);
	expect(item.find("CopyEditLinkButton").length).toBe(1);
	const requestEmailLink = item.find("CopyEditLinkButton");
	requestEmailLink.simulate("click", {
		preventDefault: () => {},
	});
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().doShowMessage).toBe(true);
	expect(item.state("resultMessageType")).toBe(messageType.error);
	expect(item.find("MessageBox").length).toBe(1);
	expect(item.state("isLoading")).toBe(false);
	await wait(50);
	expect(item.state().doShowMessage).toBe(false);
	expect(item.find("MessageBox").length).toBe(0);
	expect(item.state("resultMessageType")).toBe(null);
});

test("When User detail change", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_trial_extract_access = true;
	mockMyUserDetails.has_verified = false;
	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		handleClose: mockFunction,
		api: defaultApi,
	};
	mockAPIData = "exception";
	const item = shallow(<CopyCreationAccessDeniedPopup {...props} />);
	expect(item.find("Wrap").length).toBe(1);
	expect(item.find("Modal").length).toBe(1);
	expect(item.find("ModalContent").length).toBe(1);
	expect(item.find("ModalHeader").length).toBe(1);
	expect(item.find("ModalHeaderDescription").length).toBe(1);
	expect(item.find("ModalBody").length).toBe(1);
	expect(item.find("CopyEditLinkButton").length).toBe(1);

	mockMyUserDetails.can_copy = true;
	mockMyUserDetails.has_trial_extract_access = false;
	mockMyUserDetails.has_verified = true;
	const prevProps = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		handleClose: mockFunction,
		api: defaultApi,
	};
	mockUserDidChange = true;
	item.instance().componentDidUpdate(prevProps);
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(item.find("Wrap").length).toBe(0);
	expect(item.find("Modal").length).toBe(0);
});

test("When User detail change", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_trial_extract_access = true;
	mockMyUserDetails.has_verified = false;
	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		handleClose: mockFunction,
		api: defaultApi,
	};
	mockAPIData = "exception";
	const item = shallow(<CopyCreationAccessDeniedPopup {...props} />);
	expect(item.find("Wrap").length).toBe(1);
	expect(item.find("Modal").length).toBe(1);
	expect(item.find("ModalContent").length).toBe(1);
	expect(item.find("ModalHeader").length).toBe(1);
	expect(item.find("ModalHeaderDescription").length).toBe(1);
	expect(item.find("ModalBody").length).toBe(1);
	expect(item.find("CopyEditLinkButton").length).toBe(1);

	mockMyUserDetails.can_copy = true;
	mockMyUserDetails.has_trial_extract_access = false;
	mockMyUserDetails.has_verified = true;
	const prevProps = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		handleClose: mockFunction,
		api: defaultApi,
	};
	mockUserDidChange = true;
	item.instance().componentDidUpdate(prevProps);
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(item.find("Wrap").length).toBe(0);
	expect(item.find("Modal").length).toBe(0);
});

test("When user mount to another page", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_trial_extract_access = true;
	mockMyUserDetails.has_verified = false;
	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		handleClose: mockFunction,
		api: defaultApi,
	};
	mockAPIData = "exception";
	const item = shallow(<CopyCreationAccessDeniedPopup {...props} />);
	expect(item.find("Wrap").length).toBe(1);
	expect(item.find("Modal").length).toBe(1);
	expect(item.find("ModalContent").length).toBe(1);
	expect(item.find("ModalHeader").length).toBe(1);
	expect(item.find("ModalHeaderDescription").length).toBe(1);
	expect(item.find("ModalBody").length).toBe(1);
	expect(item.find("CopyEditLinkButton").length).toBe(1);
	const requestEmailLink = item.find("CopyEditLinkButton");
	requestEmailLink.simulate("click", {
		preventDefault: () => {},
	});
	item.instance().componentWillUnmount();
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().doShowMessage).toBe(false);
	expect(item.find("MessageBox").length).toBe(0);
	expect(item.state("resultMessageType")).toBe(null);
});

test("When User click on close", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_trial_extract_access = true;
	mockMyUserDetails.has_verified = false;
	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		handleClose: mockFunction,
		api: defaultApi,
	};
	mockAPIData = true;
	const item = shallow(<CopyCreationAccessDeniedPopup {...props} />);
	expect(item.find("Wrap").length).toBe(1);
	expect(item.find("Modal").length).toBe(1);
	expect(item.find("ModalContent").length).toBe(1);
	expect(item.find("ModalHeader").length).toBe(1);
	expect(item.find("ModalHeaderDescription").length).toBe(1);
	expect(item.find("ModalBody").length).toBe(1);
	expect(item.find("CopyEditLinkButton").length).toBe(1);

	item.instance().handleClose();
	expect(mockFunction).toBeCalled();
});
