import React from "react";
import { shallow, mount } from "enzyme";
import {
	RegisterMyInterest,
	ShareWorkResult,
	SendRequestHelp,
	SendGeneralEnquiry,
	CopyExtentIncreaseEmail,
	SendRequestHelpRaw,
	UnlockAssetProblem,
	UnlockAssetCameraNotDetected,
	ShareExtractLink,
	ResendVerificationEmailFailMessage,
	ResendSetPasswordEmailFailMessage,
	TitleNotAvailableForNotification,
	SendEmailLink,
} from "../index";
import MockUser from "../../../mocks/MockUser";
import MockMyCopies from "../../../mocks/MockMyCopies";

let authors, mockReult, props, mockUserData;

function resetAll() {
	authors = [
		{ role: "A", lastName: "Kaur", firstName: "B." },
		{ role: "A", lastName: "Kaur", firstName: "B." },
		{ role: "B", lastName: "Kaur", firstName: "B." },
		{ role: "B", lastName: "Kaur", firstName: "B." },
		{ role: "B", lastName: "Kaur", firstName: "B." },
	];
	mockReult = null;
	props = {
		searchText: "",
		myUserDetails: MockUser[0],
		isbn: "9781510422858",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** RegisterMyInterest function renders correctly for login user */
test("RegisterMyInterest function renders correctly", async () => {
	const item = shallow(<RegisterMyInterest {...props} />);
	expect(item.find("SendEmailLink").length).toEqual(1);
});

/** RegisterMyInterest function renders correctly without login */
test("RegisterMyInterest function renders correctly without login", async () => {
	props.myUserDetails = [];
	const item = shallow(<RegisterMyInterest {...props} />);
	expect(item.find("SendEmailLink").length).toEqual(1);
});

/** ShareWorkResult function renders correctly */
test("ShareWorkResult function renders correctly", async () => {
	const item = shallow(<ShareWorkResult {...props} />);
	expect(item.find("SendEmailLink").length).toEqual(1);
});

/** SendRequestHelp function renders correctly */
test("SendRequestHelp function renders correctly", async () => {
	const item = shallow(<SendRequestHelp {...props} />);
	expect(item.find("SendLink").length).toEqual(1);
});

/** SendRequestHelpRaw function renders correctly with login */
test("SendRequestHelpRaw function renders correctly with login", async () => {
	const item = shallow(<SendRequestHelpRaw {...props} />);
	expect(item.find("SendEmailLink").length).toEqual(1);
});

/** SendRequestHelpRaw function renders correctly without login */
test("SendRequestHelpRaw function renders correctly without login", async () => {
	props.myUserDetails = [];
	const item = shallow(<SendRequestHelpRaw {...props} />);
	expect(item.find("SendEmailLink").length).toEqual(1);
});

/** SendGeneralEnquiry function renders correctly with login */
test("SendGeneralEnquiry function renders correctly with login", async () => {
	const item = shallow(<SendGeneralEnquiry {...props} />);
	expect(item.find("SendEmailLink").length).toEqual(1);
});

/** SendGeneralEnquiry function renders correctly without login */
test("SendGeneralEnquiry function renders correctly without login", async () => {
	props.myUserDetails = [];
	const item = shallow(<SendGeneralEnquiry {...props} />);
	expect(item.find("SendEmailLink").length).toEqual(1);
});

/** CopyExtentIncreaseEmail function renders correctly with login*/
test("CopyExtentIncreaseEmail function renders correctly with login", async () => {
	const item = shallow(<CopyExtentIncreaseEmail {...props} />);
	expect(item.find("SendEmailLink").length).toEqual(1);
});

/** CopyExtentIncreaseEmail function renders correctly without login */
test("CopyExtentIncreaseEmail function renders correctly without login", async () => {
	props.myUserDetails = [];
	const item = shallow(<CopyExtentIncreaseEmail {...props} />);
	expect(item.find("SendEmailLink").length).toEqual(1);
});

test(`UnlockAssetProblem function renders correctly`, async () => {
	const item = shallow(<UnlockAssetProblem {...props} />);
	expect(item.find("SendEmailLink").length).toEqual(1);
});

test(`UnlockAssetCameraNotDetected function renders correctly`, async () => {
	const item = shallow(<UnlockAssetCameraNotDetected {...props} />);
	expect(item.find("SendEmailLink").length).toEqual(1);
});

test(`ShareExtractLink works correctly`, () => {
	const newProp = MockMyCopies.result[0];
	const shareLinkProp = MockMyCopies.result[2];
	const item = shallow(<ShareExtractLink workDetails={newProp} shareLink={shareLinkProp} copyOId="77b506174732067c1ab9b7b9e6aea8234292" />);
	expect(item.find("SendEmailLink").length).toEqual(1);
});

test(`ShareExtractLink works correctly when access-code is enabled`, () => {
	const newProp = MockMyCopies.result[1];
	const shareLinkProp = MockMyCopies.result[2];
	shareLinkProp.enable_extract_share_access_code = true;
	shareLinkProp.access_code = 14582;
	const item = shallow(<ShareExtractLink workDetails={newProp} shareLink={shareLinkProp} copyOId="77b506174732067c1ab9b7b9e6aea8234292" />);
	expect(item.find("SendEmailLink").length).toEqual(1);
});

test(`ShareExtractLink works correctly when authors are not present`, () => {
	const newProp = MockMyCopies.result[1];
	const shareLinkProp = MockMyCopies.result[2];
	const item = shallow(<ShareExtractLink workDetails={newProp} shareLink={shareLinkProp} copyOId="77b506174732067c1ab9b7b9e6aea8234292" />);
	expect(item.find("SendEmailLink").length).toEqual(1);
});

test(`ShareExtractLink works correctly when there is no author but editors`, () => {
	const newProp = MockMyCopies.result[1];
	const shareLinkProp = MockMyCopies.result[2];
	newProp.work_authors = [
		{ lastName: "Bentley-Davies", firstName: "Caroline", role: "B" },
		{ lastName: "dummy", firstName: "test", role: "B" },
	];
	const item = shallow(<ShareExtractLink workDetails={newProp} shareLink={shareLinkProp} copyOId="77b506174732067c1ab9b7b9e6aea8234292" />);
	expect(item.find("SendEmailLink").length).toEqual(1);
});

test(`ResendVerificationEmailFailMessage works correctly`, () => {
	const item = shallow(<ResendVerificationEmailFailMessage {...props} />);
	expect(item.find("span").text().indexOf("Could not resend email")).not.toBe(-1);
});

test(`ResendVerificationEmailFailMessage works correctly when user data is passed`, () => {
	const item = shallow(<ResendVerificationEmailFailMessage user={props.myUserDetails} />);
	expect(item.find("span").text().indexOf("Could not resend email")).not.toBe(-1);
});

test(`ResendVerificationEmailFailMessage works correctly when user data is not passed`, () => {
	props.myUserDetails = [];
	props.myUserDetails.as_administrator = true;
	const item = shallow(<ResendVerificationEmailFailMessage user={props.myUserDetails} />);
	expect(item.find("span").text().indexOf("Could not resend email")).not.toBe(-1);
});

test(`getVerificationFailMailto works correctly`, () => {
	const item = shallow(<ResendSetPasswordEmailFailMessage {...props} />);
	expect(item.find("span").text().indexOf("Could not resend email")).not.toBe(-1);
});

test(`getVerificationFailMailto works correctly when user is present`, () => {
	const item = shallow(<ResendSetPasswordEmailFailMessage user={props.myUserDetails} />);
	expect(item.find("span").text().indexOf("Could not resend email")).not.toBe(-1);
});

test("TitleNotAvailableForNotification function render correctly", () => {
	const item = shallow(<TitleNotAvailableForNotification {...props} />);
	expect(item.find("SendEmailLink").length).toEqual(1);
});

test(`ShareExtractLink works correctly when there is no editors but author`, () => {
	const newProp = MockMyCopies.result[1];
	const shareLinkProp = MockMyCopies.result[2];
	newProp.work_authors = [
		{ lastName: "Bentley-Davies", firstName: "Caroline", role: "A" },
		{ lastName: "dummy", firstName: "test", role: "A" },
	];
	const item = shallow(<ShareExtractLink workDetails={newProp} shareLink={shareLinkProp} copyOId="77b506174732067c1ab9b7b9e6aea8234292" />);
	expect(item.find("SendEmailLink").length).toEqual(1);
});

test(`ShareExtractLink works correctly when editors and author both`, () => {
	const newProp = MockMyCopies.result[1];
	const shareLinkProp = MockMyCopies.result[2];
	newProp.work_authors = [
		{ lastName: "Bentley-Davies", firstName: "Caroline", role: "A" },
		{ lastName: "dummy", firstName: "test", role: "B" },
	];
	const item = shallow(<ShareExtractLink workDetails={newProp} shareLink={shareLinkProp} copyOId="77b506174732067c1ab9b7b9e6aea8234292" />);
	expect(item.find("SendEmailLink").length).toEqual(1);
});

test("SendEmailLink renders correctlty", async () => {
	props.linkTitle = "Mock Link Title";
	const item = shallow(<SendEmailLink {...props} />);
	expect(item.find("a").length).toBe(1);
	expect(item.find("a").text()).toEqual("Mock Link Title");
});

test("TitleNotAvailableForNotification function render correctly when isbn is not provided", () => {
	delete props.isbn;
	const item = shallow(<TitleNotAvailableForNotification {...props} />);
	expect(item.find("SendEmailLink").length).toEqual(1);
});

test("TitleNotAvailableForNotification function render correctly when userDetails is not provided", () => {
	delete props.myUserDetails;
	const item = shallow(<TitleNotAvailableForNotification {...props} />);
	expect(item.find("SendEmailLink").length).toEqual(1);
});

test(`UnlockAssetProblem function renders correctly when userDetails is not provided`, async () => {
	delete props.myUserDetails;
	const item = shallow(<UnlockAssetProblem {...props} />);
	expect(item.find("SendEmailLink").length).toEqual(1);
});
