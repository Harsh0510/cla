// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import Overview from "../Overview";
import CapturedImagePreview from "../CapturedImagePreview";
import MockUser from "../../../mocks/MockUser";

let unlocked, message, response, redirect, resultCode, show, waiting, school, notFound;

// Mock asset imports
jest.mock("../../../assets/icons/Play_video.png", () => jest.fn());
jest.mock("../../../assets/images/rhema-kallianpur-471933-unsplash.jpg", () => jest.fn());

let props = null;
let mockFunction = jest.fn();

function resetAll() {
	props = {
		unlocked: false,
		message: "",
		response: null,
		redirect: false,
		resultCode: "9870836489178",
		show: true,
		waiting: false,
		school: "Test School",
		notFound: false,
		showUnlockMore: false,
		didCaputre: false,
		doDisplayTakePictureOptions: false,
		doDisplayTakePictureButton: false,
		onDenyPreview: mockFunction,
		onAcceptPreview: mockFunction,
		backFromTempUnlock: mockFunction,
		findBookOnClick: mockFunction,
		isSending: false,
		isTemp: false,
		myUserDetails: MockUser[0],
		isbnTitle: "9870836489178/The 2nd Book of Mathsteasers for Years 5–8",
		location: {
			search: {
				isbn: null,
			},
		},
		openContentRequestModal: jest.fn(),
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<Overview {...props} />);
	expect(item.find("WrapContainer").length).toBe(1);
	expect(item.find("HelpText").length).toBe(1);
});

test("Component load with cancel button ", async () => {
	props.show = false;
	const item = shallow(<Overview {...props} />);
	expect(item.find("StyledCancel").length).toBe(1);
});

/** Scan barcode and get waiting messsage */
test(`Scan barcode and get waiting messsage`, async () => {
	props.show = false;
	props.waiting = true;
	props.notFound = null;
	props.show = null;
	props.unlocked = false;
	props.message = "";

	const item = shallow(<Overview {...props} />);
	expect(item.find("MessageBlock").length).toBe(2);
});

/** Scan barcode and get error type message */
test(`Scan barcode and get error type messsage`, async () => {
	props.show = false;
	props.waiting = false;
	props.notFound = null;
	props.show = null;
	props.unlocked = false;
	props.message = "";
	const item = shallow(<Overview {...props} />);
	expect(item.find("MessageBlock").length).toBe(1);
});

/** Scan barcode and get success scanning message */
test(`Scan barcode and get success scanning message`, async () => {
	props.show = false;
	props.waiting = false;
	props.notFound = null;
	props.show = null;
	props.unlocked = true;
	props.showUnlockMore = true;
	props.message = "";
	const item = shallow(<Overview {...props} />);
	const response = item.find("MessageBlock").props();
	expect(item.find("WrapperButtonSection").length).toBe(1);
	expect(item.find("ButtonSmallWithIcon").length).toBe(2);
	expect(item.find("ButtonSmallWithIcon").at(0).text()).toBe("Unlock more ");
	expect(item.find("ButtonSmallWithIcon").at(1).text()).toBe("Take me to my book ");
	expect(item.find("MessageBlock").length).toBe(1);
});

test(`Scan barcode and get not device error message`, async () => {
	props.show = false;
	props.waiting = false;
	props.notFound = null;
	props.show = true;
	props.unlocked = null;
	props.showUnlockMore = null;
	props.message = "Device error message";
	const item = shallow(<Overview {...props} />);
	expect(item.find("BarcodeMessageSection").length).toBe(2);
	expect(item.find("MessageBlock").length).toBe(2);
	expect(item.find("WrapperButtonSection").length).toEqual(0);
});

test(`User get the options for take picture`, async () => {
	props.show = false;
	props.waiting = false;
	props.notFound = null;
	props.show = true;
	props.unlocked = null;
	props.showUnlockMore = false;
	props.message = "We are having trouble detecting barcode. Could you take a picture for us?";
	props.doDisplayTakePictureOptions = true;
	props.iconClasses = "fa fa-exclamation";
	props.iconColor = "messageError";

	const item = shallow(<Overview {...props} />);
	expect(item.find("BarcodeMessageSection").length).toBe(2);
	expect(item.find("ButtonSmallWithIcon").length).toBe(2);
	expect(item.find("WrapperButtonSection").length).toEqual(2);
	expect(item.find("UnlockAgainButton").length).toEqual(1);
	expect(item.find("AssetUnlockButton").length).toEqual(1);
	expect(item.find("AssetUnlockButton").props().to).toEqual("/asset-upload");
});

test(`User get capture buton after selecting the picture option`, async () => {
	props.show = false;
	props.waiting = false;
	props.notFound = null;
	props.show = true;
	props.unlocked = null;
	props.showUnlockMore = false;
	props.message = "Perhaps we can still help you? Please contact our support team for help";
	props.doDisplayTakePictureOptions = false;
	props.doDisplayTakePictureButton = true;
	props.iconClasses = "fa fa-exclamation";
	props.iconColor = "messageError";

	const item = shallow(<Overview {...props} />);
	expect(item.find("BarcodeMessageSection").length).toBe(2);
	expect(item.find("ButtonSmallWithIcon").length).toBe(1);
	expect(item.find("ButtonSmallWithIcon").text()).toBe("OK ");
	expect(item.find("WrapperButtonSection").length).toEqual(1);
});

test(`User getting the popup modal with cpatured image after capturing the image`, async () => {
	props.waiting = false;
	props.notFound = null;
	props.show = true;
	props.unlocked = null;
	props.showUnlockMore = false;
	props.message = "Perhaps we can still help you? Please contact our support team for help";
	props.doDisplayTakePictureOptions = false;
	props.doDisplayTakePictureButton = true;
	props.iconClasses = "fa fa-exclamation";
	props.iconColor = "messageError";
	props.doShowPreviewImage = true;
	props.previewImageDataUrl = "Temp Image URL";
	const item = shallow(<Overview {...props} />);
	expect(item.containsMatchingElement(<CapturedImagePreview />)).toBe(true);
});

test(`User show unlock more button after uploding the image`, async () => {
	props.waiting = false;
	props.notFound = null;
	props.show = true;
	props.unlocked = null;
	props.showUnlockMore = true;
	props.message = `Thank You we have send it to our robots and notify you when it's been unlocked. Would you like to unlock something else?`;
	props.doDisplayTakePictureOptions = false;
	props.doDisplayTakePictureButton = false;
	props.iconClasses = "fa fa-success";
	props.iconColor = "green";
	props.onDenyPreview = jest.fn();
	props.onAcceptPreview = jest.fn();
	const item = shallow(<Overview {...props} />);
	expect(item.find("BarcodeMessageSection").length).toBe(2);
	expect(item.find("ButtonSmallWithIcon").length).toBe(1);
	expect(item.find("ButtonSmallWithIcon").text()).toBe("Unlock more ");
	expect(item.find("WrapperButtonSection").length).toEqual(1);
});

test(`User clock on  unlock more button`, async () => {
	props.waiting = false;
	props.notFound = null;
	props.show = true;
	props.unlocked = null;
	props.showUnlockMore = true;
	props.message = `Thank You we have send it to our robots and notify you when it's been unlocked. Would you like to unlock something else?`;
	props.doDisplayTakePictureOptions = false;
	props.doDisplayTakePictureButton = false;
	props.iconClasses = "fa fa-success";
	props.iconColor = "green";
	props.onDenyPreview = jest.fn();
	props.onAcceptPreview = jest.fn();
	props.unlockMore = jest.fn();
	const item = shallow(<Overview {...props} />);
	expect(item.find("BarcodeMessageSection").length).toBe(2);
	expect(item.find("ButtonSmallWithIcon").length).toBe(1);
	const attrs = { "data-type": "type" };
	item.instance().doUnlockMore({ preventDefault: jest.fn(), currentTarget: { getAttribute: (name) => attrs[name], ...attrs } });
	expect(item.find("ButtonSmallWithIcon").text()).toBe("Unlock more ");
	expect(item.find("WrapperButtonSection").length).toEqual(1);
});

test("Component load with close button ", async () => {
	props.isTemp = true;
	props.unlockStatus = "temp-unlocked";
	const item = shallow(<Overview {...props} />);
	expect(item.find("StyledHelpLink").length).toBe(3);
});

test(`User show the text box for Temporarily unlocked asset`, async () => {
	props.isTemp = true;
	props.unlockStatus = null;
	const item = shallow(<Overview {...props} />);
	expect(item.find("BarcodeMessageSection").length).toBe(2);
	expect(item.find("SubmitButton").length).toBe(1);
	expect(item.find("BackButton").length).toBe(1);
	expect(item.find("WrapForm").length).toEqual(1);
});

test(`User Get error for enter a valid ISBN`, async () => {
	props.isTemp = true;
	props.unlockStatus = null;
	props.isbnValidationMsg = "No ISBN entered. Please make sure that there are 13 digits and that you have removed any gaps.";
	const item = shallow(<Overview {...props} />);
	expect(item.find("BarcodeMessageSection").length).toBe(2);
	expect(item.find("SubmitButton").length).toBe(1);
	expect(item.find("BackButton").length).toBe(1);
	expect(item.find("WrapForm").length).toEqual(1);
	expect(item.find("ErrorMessage").length).toBe(1);
	expect(item.find("ErrorMessage").text()).toBe("No ISBN entered. Please make sure that there are 13 digits and that you have removed any gaps.");
});

test(`User Get error for invalid isbn`, async () => {
	props.isTemp = true;
	props.unlockStatus = null;
	props.isbnValidationMsg = "The ISBN has not been recognised. Please make sure that there are 13 digits and that you have removed any gaps.";
	const item = shallow(<Overview {...props} />);
	expect(item.find("BarcodeMessageSection").length).toBe(2);
	expect(item.find("SubmitButton").length).toBe(1);
	expect(item.find("BackButton").length).toBe(1);
	expect(item.find("WrapForm").length).toEqual(1);
	expect(item.find("ErrorMessage").length).toBe(1);
	expect(item.find("ErrorMessage").text()).toBe(
		"The ISBN has not been recognised. Please make sure that there are 13 digits and that you have removed any gaps."
	);
});

test(`User Show temporarily unlocked asset list`, async () => {
	props.isTemp = true;
	props.tempUnlockAssetTitles = [{ expiration_date: "2021-03-30T13:31:41.401Z", pdf_isbn13: "9780750273121", title: "Transport" }];
	const item = shallow(<Overview {...props} />);
	expect(item.find("TempUnlockWrap").length).toBe(1);
	expect(item.find("TempUnlock").length).toBe(1);
	expect(item.find("TempUnlockAsset").length).toBe(1);
	expect(item.find("TempUnlockAsset").props().data).toBe(props.tempUnlockAssetTitles);
});

test(`When user try to unlock book which is not available for temporary unlocking`, async () => {
	props.isTemp = true;
	props.unlockStatus = "does-not-exist";
	const item = shallow(<Overview {...props} />);
	expect(item.find("BarcodeMessageSection").length).toBe(2);
	expect(item.find("Span").length).toBe(1);
	expect(item.find("Span").text()).toEqual("Tell us about it");
});

test(`When user try to unlock book which is does not exist on ep`, async () => {
	props.isTemp = false;
	props.unlockStatus = "does-not-exist";
	const item = shallow(<Overview {...props} />);
	expect(item.find("BarcodeMessageSection").length).toBe(2);
	expect(item.find("Span").length).toBe(1);
	expect(item.find("Span").text()).toEqual("Tell us about it");
});

test(`When user clicks tell us about it link`, async () => {
	props.isTemp = true;
	props.unlockStatus = "does-not-exist";
	const item = shallow(<Overview {...props} />);
	const openContentRequestModalLink = item.find("Span");
	openContentRequestModalLink.simulate("click");
	expect(props.openContentRequestModal).toHaveBeenCalled();
});

test(`When user loggen in as cla admin and not gets button for upload your own content`, async () => {
	props.show = false;
	props.waiting = false;
	props.notFound = null;
	props.show = true;
	props.unlocked = null;
	props.showUnlockMore = false;
	props.message = "We are having trouble detecting barcode. Could you take a picture for us?";
	props.doDisplayTakePictureOptions = true;
	props.iconClasses = "fa fa-exclamation";
	props.iconColor = "messageError";
	props.myUserDetails = MockUser[3];

	const item = shallow(<Overview {...props} />);
	expect(item.find("BarcodeMessageSection").length).toBe(2);
	expect(item.find("ButtonSmallWithIcon").length).toBe(3);
	expect(item.find("WrapperButtonSection").length).toEqual(2);
	expect(item.find("UnlockAgainButton").length).toEqual(0);
	expect(item.find("AssetUnlockButton").length).toEqual(0);
});

test("When loading is true", async () => {
	props.loading = true;
	const item = shallow(<Overview {...props} />);
	expect(item.find("Loader").length).toBe(1);
});
