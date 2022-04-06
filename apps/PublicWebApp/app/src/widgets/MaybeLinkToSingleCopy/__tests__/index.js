import "../../../mocks/matchMedia.mock";
import messageType from "../../../common/messageType";
import React from "react";
import { shallow } from "enzyme";
import MaybeLinkToSingleCopy from "../index";
import MockMyDetails from "../../../mocks/MockMyDetails";

let props, mockFunction, mockMyUserDetails, mockUserDidChange;

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
	mockFunction = jest.fn();
	mockMyUserDetails = MockMyDetails;
	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		doShowModal: mockFunction,
	};
	mockUserDidChange = false;
}

beforeEach(resetAll);
afterEach(resetAll);

test("User can see link when user has trial access", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_trial_extract_access = true;

	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		doShowModal: mockFunction,
	};
	const item = shallow(<MaybeLinkToSingleCopy {...props} />);
	expect(item.find("CopyEditLinkButton").length).toBe(1);
	expect(item.find("CopyEditLinkButton").props().disable).toBe(false);
});

test("User click on link when user has trial access", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_trial_extract_access = true;

	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		doShowModal: mockFunction,
	};
	const item = shallow(<MaybeLinkToSingleCopy {...props} />);
	expect(item.find("CopyEditLinkButton").length).toBe(1);
	expect(item.find("CopyEditLinkButton").props().disable).toBe(false);
	const link = item.find("CopyEditLinkButton");
	link.simulate("click", {});
	expect(item.state("showModal")).toBe(false);
	expect(mockFunction).toBeCalled();
	item.instance().handleClose();
	await wait(20);
	expect(item.state("showModal")).toBe(false);
	expect(mockFunction).toBeCalled();
});

test("When click on link user seen the popup modal", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_trial_extract_access = true;

	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
	};
	const item = shallow(<MaybeLinkToSingleCopy {...props} />);
	expect(item.find("CopyEditLinkButton").length).toBe(1);
	expect(item.find("CopyEditLinkButton").props().disable).toBe(false);
	const link = item.find("CopyEditLinkButton");
	link.simulate("click", {});
	expect(mockFunction).not.toBeCalled();
	expect(item.state("showModal")).toBe(true);
	expect(item.find("CopyCreationAccessDeniedPopup").length).toBe(1);
	item.instance().handleClose();
	await wait(20);
	expect(item.state("showModal")).toBe(false);
	expect(mockFunction).not.toBeCalled();
	expect(item.find("CopyCreationAccessDeniedPopup").length).toBe(0);
});

test("User close the popup modal when pass the doShowModal function", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_trial_extract_access = true;

	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		doShowModal: mockFunction,
	};
	const item = shallow(<MaybeLinkToSingleCopy {...props} />);
	expect(item.find("CopyEditLinkButton").length).toBe(1);
	expect(item.find("CopyEditLinkButton").props().disable).toBe(false);
	const link = item.find("CopyEditLinkButton");
	link.simulate("click", {});
	expect(mockFunction).toBeCalled();
	expect(item.state("showModal")).toBe(false);
	expect(item.find("CopyCreationAccessDeniedPopup").length).toBe(0);
	item.instance().handleClose();
	await wait(20);
	expect(item.state("showModal")).toBe(false);
	expect(mockFunction).toBeCalled();
	expect(item.find("CopyCreationAccessDeniedPopup").length).toBe(0);
});

test("User close the popup modal when pass the doShowModal function", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_trial_extract_access = true;

	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		doShowModal: mockFunction,
	};
	mockUserDidChange = true;
	const item = shallow(<MaybeLinkToSingleCopy {...props} />);
	expect(item.find("CopyEditLinkButton").length).toBe(1);
	expect(item.find("CopyEditLinkButton").props().disable).toBe(false);
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_trial_extract_access = true;
	const prevProps = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
		doShowModal: mockFunction,
	};
	item.instance().componentDidUpdate(prevProps);
	expect(item.state("showModal")).toBe(false);
});

test("When click on link user seen the popup modal and move to another component", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_trial_extract_access = true;

	props = {
		withAuthConsumer_myUserDetails: mockMyUserDetails,
	};
	const item = shallow(<MaybeLinkToSingleCopy {...props} />);
	expect(item.find("CopyEditLinkButton").length).toBe(1);
	expect(item.find("CopyEditLinkButton").props().disable).toBe(false);
	const link = item.find("CopyEditLinkButton");
	link.simulate("click", {});
	expect(mockFunction).not.toBeCalled();
	expect(item.state("showModal")).toBe(true);
	expect(item.find("CopyCreationAccessDeniedPopup").length).toBe(1);
	item.instance().handleClose();
	await wait(20);
	expect(item.state("showModal")).toBe(false);
	expect(mockFunction).not.toBeCalled();
	expect(item.find("CopyCreationAccessDeniedPopup").length).toBe(0);
	item.instance().componentWillUnmount();
});

test("When link text is passed", async () => {
	props.linkText = "Test Link Text";
	const item = shallow(<MaybeLinkToSingleCopy {...props} />);
	expect(item.find("CopyEditLinkButton").text()).toEqual("Test Link Text");
});
