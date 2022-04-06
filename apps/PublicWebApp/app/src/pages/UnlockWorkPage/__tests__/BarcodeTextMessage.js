// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import BarcodeTextMessage from "../BarcodeTextMessage";
import MockUser from "../../../mocks/MockUser";

let props, mockMessageTypeValue, mockTitle;

function resetAll() {
	props = {
		waiting: false,
		notFound: false,
		myUserDetails: MockUser[0],
		resultCode: "9870836489178",
		message: null,
		show: true,
		unlocked: false,
		iconColor: "red",
		didCaputre: false,
		isTemp: false,
		unlockedTitle: null,
	};
	mockMessageTypeValue = {
		warning: "warning",
		error: "error",
		success: "success",
		confirmed: "confirmed",
	};
	mockTitle = {
		waitingTittle: "Waiting for permission",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component render with waiting text message */
test(`Component render with waiting text message`, async () => {
	props.waiting = true;
	const item = shallow(<BarcodeTextMessage {...props} />);
	expect(item.find("MessageBox").length).toBe(1);
	const response = item.find("MessageBox").props();
	expect(response.type).toBe(mockMessageTypeValue.warning);
	expect(response.title).toBe(mockTitle.waitingTittle);
	expect(response.displayIcon).toBe(false);
});

/** When asset not found and get `BarcodeTextMessage` */
test(`When asset not found and get 'BarcodeTextMessage'`, async () => {
	props.notFound = true;
	const item = shallow(<BarcodeTextMessage {...props} />);
	expect(item.find("DisplayMessage").length).toBe(1);
	const response = item.find("DisplayMessage").props();
	expect(response.bgColor).toBe("red");
});

/** While scanning get exception error message */
test(`While scanning get exception error message`, async () => {
	props.message = "error";
	const item = shallow(<BarcodeTextMessage {...props} />);
	expect(item.find("DisplayMessage").length).toBe(1);
	const response = item.find("DisplayMessage").props();
	expect(response.bgColor).toBe("red");
	expect(item.find("DisplayMessage").text()).toBe("error");
});

// /** While scanning retun blank message */
// test(`While scanning retun blank message`, async () => {
// 	props.message = "success";
// 	props.unlocked = true;
// 	const item = shallow(<BarcodeTextMessage {...props} />);
// 	expect(item.find("MessageBox").length).toBe(1);
// 	const compProps = item.find("MessageBox").props();
// 	expect(compProps.title).toBe("");
// 	expect(compProps.message).toBe("success");
// });

test(`While scanning getting the error message`, async () => {
	props.message = "error";
	props.show = false;
	props.unlocked = false;
	const item = shallow(<BarcodeTextMessage {...props} />);
	const response = item.find("DisplayMessage").props();
	expect(item.find("DisplayMessage").length).toBe(1);
	expect(response.bgColor).toBe("red");
});

test(`While scanning getting no message`, async () => {
	props.message = "";
	props.show = false;
	props.unlocked = false;
	const item = shallow(<BarcodeTextMessage {...props} />);
	expect(item.find("DisplayMessage").length).toBe(0);
	expect(item).toEqual({});
});

/** An asset not found and not get ISBN number */
test(`An asset not found and not get ISBN number`, async () => {
	props.resultCode = null;
	props.notFound = true;
	const item = shallow(<BarcodeTextMessage {...props} />);
	const response = item.find("DisplayMessage").props();
	expect(item.find("DisplayMessage").length).toBe(1);
	expect(response.bgColor).toBe("red");
});

test(`Successfully barcode detect asset using camera`, async () => {
	props.resultCode = null;
	props.didCaputre = true;
	const item = shallow(<BarcodeTextMessage {...props} />);
	const response = item.find("MessageBox").props();
	expect(item.find("MessageBox").length).toBe(1);
	expect(response.type).toBe(mockMessageTypeValue.success);
});

test(`Successfully unlock asset using camera`, async () => {
	props.resultCode = null;
	props.unlocked = true;
	props.unlockStatus = "successfully-unlocked";
	const item = shallow(<BarcodeTextMessage {...props} />);
	const response = item.find("DisplayMessage").props();
	expect(item.find("DisplayMessage").length).toBe(1);
	expect(response.bgColor).toBe("#006473");
	expect(item.find("DisplayMessage").at(0).text()).toBe("Successfully unlocked!");
});

test(`Getting message when asset is already unlock and user try to unlock asset using camera`, async () => {
	props.resultCode = null;
	props.unlocked = true;
	props.unlockStatus = "already-unlocked";
	const item = shallow(<BarcodeTextMessage {...props} />);
	const response = item.find("DisplayMessage").props();
	expect(item.find("DisplayMessage").length).toBe(1);
	expect(response.bgColor).toBe("#006473");
	expect(item.find("DisplayMessage").at(0).text()).toBe("This book was already unlocked for your institution on the Education Platform");
});

test(`User getting confirmation message`, async () => {
	props.resultCode = null;
	props.notFound = true;
	props.isTemp = true;
	props.unlockStatus = "temp-unlocked-must-confirm";
	props.unlockedTitle = { title: "test title" };
	props.school = "test school";
	const item = shallow(<BarcodeTextMessage {...props} />);
	expect(item.find("MessageBox").length).toBe(1);
	expect(item.find("WrapperButtonSection").length).toBe(1);
	expect(item.find("ButtonSmallWithIcon").length).toBe(2);
	const response = item.find("MessageBox").props();
	expect(response.type).toBe(mockMessageTypeValue.confirmed);
});

test(`User try to unlock temporarily unlocked expired asset`, async () => {
	props.resultCode = null;
	props.notFound = true;
	props.isTemp = true;
	props.unlockStatus = "temp-unlocked-expired";
	const item = shallow(<BarcodeTextMessage {...props} />);
	expect(item.find("MessageBox").length).toBe(1);
	const response = item.find("MessageBox").props();
	expect(response.displayIcon).toBe(false);
	expect(response.type).toBe(mockMessageTypeValue.confirmed);
});

test(`User try to unlock already unlocked asset`, async () => {
	props.resultCode = null;
	props.notFound = true;
	props.isTemp = true;
	props.unlockStatus = "already-unlocked";
	const item = shallow(<BarcodeTextMessage {...props} />);
	const response = item.find("DisplayMessage").props();
	expect(item.find("DisplayMessage").length).toBe(1);
	expect(response.bgColor).toBe("#006473");
	expect(item.find("DisplayMessage").at(0).text()).toBe("This book was already unlocked for your institution on the Education Platform");
});

test(`User succesfully unlocked asset`, async () => {
	props.resultCode = null;
	props.notFound = true;
	props.isTemp = true;
	props.unlockStatus = "successfully-unlocked";
	const item = shallow(<BarcodeTextMessage {...props} />);
	const response = item.find("DisplayMessage").props();
	expect(item.find("DisplayMessage").length).toBe(1);
	expect(item.find("DisplayMessage").at(0).text()).toBe("Successfully unlocked!");
	expect(response.bgColor).toBe("#006473");
});

test(`User get error when asset is not exist in education platform`, async () => {
	props.notFound = true;
	props.unlockStatus = "does-not-exist";
	const item = shallow(<BarcodeTextMessage {...props} />);
	expect(item.find("Span").length).toBe(1);
	const response = item.find("DisplayMessage").props();
	expect(item.find("DisplayMessage").length).toBe(1);
	expect(response.bgColor).toBe("red");
});

test(`User get unknown status when asset is temporary unlocked`, async () => {
	props.resultCode = null;
	props.notFound = true;
	props.isTemp = true;
	props.unlockStatus = "abc";
	const item = shallow(<BarcodeTextMessage {...props} />);
	expect(item.find("DisplayMessage").length).toBe(0);
});

test(`User get status unknown status`, async () => {
	props.unlocked = true;
	props.unlockStatus = "abc";
	const item = shallow(<BarcodeTextMessage {...props} />);
	expect(item.find("DisplayMessage").length).toBe(0);
});

test(`User do not see pop up `, async () => {
	props.unlockStatus = "does-not-exist";
	props.resultCode = null;
	props.isTemp = false;
	const item = shallow(<BarcodeTextMessage {...props} />);
	expect(item.find("Span").length).toBe(1);
});
