import React from "react";
import { shallow } from "enzyme";
import IntentToCopyForm from "../index";
import MockUser from "../../../mocks/MockUser";

let props, mockFunction, mockApiResult;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAuthRequiredConsumer", () => mockPassthruHoc);

async function defaultApi(endpoint, data = null) {
	await wait(100);
	if (endpoint === "/public/intent-to-copy-update") {
		if (!mockApiResult) {
			throw new Error("Unknown error");
		}
		return mockApiResult;
	}
	throw new Error("should never be here");
}

function resetAll() {
	mockFunction = jest.fn();
	mockApiResult = {
		updated: true,
	};
	props = {
		isUnlock: true,
		onCloseIntentToCopy: mockFunction,
		unlock_attempt_oid: "87965462132132132132132131",
		isbn: 987654632321,
		api: defaultApi,
		withAuthConsumer_myUserDetails: MockUser[0],
		has_replied: false,
		calledAfterSubmit: () => {
			return;
		},
		openContentRequestModal: jest.fn(),
		history: {
			push: jest.fn(),
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = shallow(<IntentToCopyForm {...props} />);
	item.setState({ is_loading: true });
	await wait(1040);
	expect(item.find("Modal").length).toBe(1);
	expect(item.find("ModalContent").length).toBe(1);
	expect(item.find("WrapModalContent").length).toBe(2);
});

test(`User seen the popup and click on yes button then redirects to tell us what you are copying screen`, async () => {
	const item = shallow(<IntentToCopyForm {...props} />);
	expect(item.find("Modal").length).toBe(1);
	const yesButton = item.find("StyledButton").first();
	yesButton.simulate("click", { preventDefault: mockFunction });
	expect(props.history.push).toHaveBeenCalled();
	expect(props.history.push.mock.calls[0][0]).toEqual("/asset-upload/before-we-start");
});

test(`User seen the popup and click on no button then intent to copy section opens`, async () => {
	const item = shallow(<IntentToCopyForm {...props} />);
	expect(item.find("Modal").length).toBe(1);
	const noButton = item.find("StyledButton").last();
	noButton.simulate("click", { preventDefault: mockFunction });
	expect(item.find("Modal").length).toBe(1);
	expect(item.find("FooterContent").length).toBe(2);
	expect(item.find("FooterContent").at(0).text()).toBe(
		"Did you know that you can also photocopy or make a digital scan of this book under the terms of the Education Licence?"
	);
	expect(item.find("FooterContent").at(1).text()).toBe("More information");
});

test(`User seen the intent to copy popup and click on yes button`, async () => {
	const item = shallow(<IntentToCopyForm {...props} />);
	item.setState({ isShowUploadOwnExtract: false });
	expect(item.find("Modal").length).toBe(1);
	const yesButton = item.find("StyledButton").first();
	yesButton.simulate("click", { preventDefault: mockFunction });
	expect(item.state("isLoading")).toBe(true);
	expect(item.find("[className='fa fa-spinner fa-spin']").length).toBe(1);
	await wait(120);
	expect(item.state("didSubmitIntentCopyForm")).toBe(true);
	expect(item.find("WrapModalContent").length).toBe(1);
	expect(item.find("BoxArea").length).toBe(1);
	expect(item.find("BoxTextArea").length).toBe(1);
	expect(item.find("span").length).toBe(1);
	expect(item.find("span").text().length).not.toBeNull();
});

test(`User seen the intent to copy popup and click on no button`, async () => {
	const item = shallow(<IntentToCopyForm {...props} />);
	item.setState({ isShowUploadOwnExtract: false });
	expect(item.find("Modal").length).toBe(1);
	const noButton = item.find("StyledButton").last();
	noButton.simulate("click", { preventDefault: mockFunction });
	expect(item.setState({ isLoading: true }));
	expect(item.find("[className='fa fa-spinner fa-spin']").length).toBe(1);
	await wait(120);
	expect(item.state("didSubmitIntentCopyForm")).toBe(true);
	expect(item.find("WrapModalContent").length).toBe(1);
	expect(item.find("WrapModalContent").text()).toEqual(
		"Thank you for letting us know. This information helps us monitor how the Education Licence is being used by schools so that we can distribute revenue back to publishers and authors."
	);
});

test(`User click on close button`, async () => {
	const item = shallow(<IntentToCopyForm {...props} />);
	expect(item.find("Modal").length).toBe(1);
	item.instance().onClose();
	expect(item.state("errorIntentCopyForm")).toBe(null);
	expect(item.state("didSubmitIntentCopyForm")).toBe(false);
	await wait(20);
	expect(mockFunction).toHaveBeenCalled();
});

test(`when intent-to-copy is not updated`, async () => {
	async function api(endpoint, data = null) {
		if (endpoint === "/public/intent-to-copy-update") {
			return {
				updated: false,
			};
		}
	}
	const item = shallow(<IntentToCopyForm isUnlock={false} isbn={987654632321} api={api} />);
	expect(item.find("Modal").length).toBe(1);
	item.instance().onAcceptIntentToCopy();
	await wait(40);
	expect(item.state("didSubmitIntentCopyForm")).toBe(true);
	expect(item.state("isLoading")).toBe(false);
	expect(item.state("errorIntentCopyForm")).toBe("Error: Something went wrong!");
});

test(`when request not get`, async () => {
	async function api(endpoint, data = null) {
		if (endpoint === "/public/intent-to-copy-updat") {
			return {
				updated: true,
			};
		}
		throw new Error("should never be here");
	}
	const item = shallow(<IntentToCopyForm isUnlock={false} api={api} />);
	expect(item.find("Modal").length).toBe(1);
	expect(item.find("i").length).toBe(2);
	await wait(40);
	item.instance().onAcceptIntentToCopy();
	// item.instance().updateIntentToCopy();
	await wait(1020);
	expect(item.state("isLoading")).toBe(false);
	expect(item.state("didSubmitIntentCopyForm")).toBe(true);
	expect(item.state("errorIntentCopyForm")).not.toBe(null);
});

test(`User seen the intent to copy popup and click on yes button and getting unknown error`, async () => {
	mockApiResult = null;
	const item = shallow(<IntentToCopyForm {...props} />);
	item.setState({ isShowUploadOwnExtract: false });
	expect(item.find("Modal").length).toBe(1);
	const yesButton = item.find("StyledButton").first();
	yesButton.simulate("click", { preventDefault: mockFunction });
	expect(item.state("isLoading")).toBe(true);
	await wait(120);
	expect(item.state("didSubmitIntentCopyForm")).toBe(true);
	expect(item.find("WrapModalContent").length).toBe(1);
	expect(item.find("BoxArea").length).toBe(1);
	expect(item.find("BoxTextArea").length).toBe(1);
	expect(item.find("span").length).toBe(1);
	expect(item.find("span").text().length).not.toBeNull();
	expect(item.state().errorIntentCopyForm).toBe("Error: Something went wrong!");
	expect(item.find("span").text()).toBe("Error: Something went wrong!");
});

test(`User getting message 'This book is not on the Platform but we will let you know if it does become available.'`, async () => {
	props.isUnlock = false;
	props.has_replied = true;
	const item = shallow(<IntentToCopyForm {...props} />);
	expect(item.find("WrapModalContent").length).toBe(1);
	expect(item.find("BoxArea").length).toBe(1);
	expect(item.find("BoxTextArea").length).toBe(1);
	expect(item.find("span").length).toBe(1);
	expect(item.find("span").text()).toBe("This book is not on the Platform but we will let you know if it does become available.");
});

test(`User sees content request modal when user clicks on tell us link`, async () => {
	props.isTemp = true;
	const item = shallow(<IntentToCopyForm {...props} />);
	item.setState({ is_loading: true });
	await wait(1040);
	item.find("Span").simulate("click");
	expect(props.openContentRequestModal).toHaveBeenCalled();
});

test(`When isbn is not passed in props`, async () => {
	delete props.isbn;
	const item = shallow(<IntentToCopyForm {...props} />);
	item.setState({ is_loading: true });
	await wait(1040);
	expect(item.find("Modal").length).toBe(1);
	expect(item.find("ModalContent").length).toBe(1);
	expect(item.find("WrapModalContent").length).toBe(2);
});
test(`When user unlock book temporary and isbn is not passed in props`, async () => {
	delete props.isbn;
	props.isTemp = true;
	const item = shallow(<IntentToCopyForm {...props} />);
	item.setState({ is_loading: true });
	await wait(1040);
	expect(item.find("Modal").length).toBe(1);
	expect(item.find("ModalContent").length).toBe(1);
	expect(item.find("WrapModalContent").length).toBe(2);
});
