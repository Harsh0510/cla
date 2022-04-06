// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import BarcodeSection from "../BarcodeSection";
import { object, exact } from "prop-types";

// Mock asset imports

let props;

function resetAll() {
	props = {
		showStartButton: jest.fn(),
		show: false,
		notFound: false,
		waiting: false,
		unlocked: false,
		didCaputre: false,
		iconColor: "red",
		iconClass: "fa fa-camera",
		isTemp: false,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(<BarcodeSection {...props} />);
	expect(item.find("BarcodeArea").length).toBe(1);
});

test('User show the "Activate Camera" on Capture section', async () => {
	props.show = true;
	props.iconClass = "fa fa-camera";
	const item = shallow(<BarcodeSection {...props} />);
	expect(item.find("ButtonWrap").length).toEqual(1);
	expect(item.find("IconWrapper").length).toEqual(1);
	const ButtonWrap_props = item.find("ButtonWrap").props();
	expect(ButtonWrap_props.bgColor).toBe("#000000");
	expect(item.find("StartButton").text()).toEqual("Activate Camera");
});

test("User show the error message with error exclamation icon while scaning the book", async () => {
	props.show = true;
	props.iconClass = "fa fa-exclamation";
	const item = shallow(<BarcodeSection {...props} />);
	expect(item.find("ButtonWrap").length).toEqual(1);
	const ButtonWrap_props = item.find("ButtonWrap").props();
	expect(ButtonWrap_props.bgColor).toBe("#ffffff");
	expect(item.find("StartButton").length).toEqual(0);
	expect(item.find("IconWrapper").length).toEqual(1);
});

test('User showing the waiting message when click on "Activ Camera"', async () => {
	props.waiting = true;
	props.notFound = false;
	const item = shallow(<BarcodeSection {...props} />);
	expect(item.find("StyledSpinnerContainer").length).toEqual(1);
	expect(item.find("StyledSpinner").length).toEqual(1);
});

test("Component renders with unlocked props", async () => {
	props.show = true;
	props.unlocked = true;
	const item = shallow(<BarcodeSection {...props} />);
	expect(item.find("ButtonWrap").length).toBe(1);
	expect(item.find("IconWrapper").length).toBe(1);
});

test("User showing the error default exclamation icon", async () => {
	props.show = true;
	props.iconClass = "";
	const item = shallow(<BarcodeSection {...props} />);
	expect(item.find("IconWrapper").length).toBe(1);
});

test("When user trying to unlock asset without physical copy", async () => {
	props.show = true;
	props.iconClass = "";
	props.isTemp = true;
	const item = shallow(<BarcodeSection {...props} />);
	expect(item.find("ButtonWrap").length).toBe(1);
});

test("When user trying to unlock asset without physical copy but bbok is not owned by user school", async () => {
	props.show = true;
	props.iconClass = "";
	props.isTemp = true;
	props.unlockStatus = "not-owned-by-school";
	const item = shallow(<BarcodeSection {...props} />);
	expect(item.find("ButtonWrap").length).toBe(1);
});

test("When user temporarily unlocked asset without physical copy", async () => {
	props.show = true;
	props.iconClass = "";
	props.isTemp = true;
	props.unlockStatus = "temp-unlocked";
	const item = shallow(<BarcodeSection {...props} />);
	expect(item.find("ButtonWrap").length).toBe(1);
});

test("When user temporarily unlocked asset without physical copy which asset temporary unlock expires then get error default exclamation icon ", async () => {
	props.show = true;
	props.iconClass = "";
	props.isTemp = true;
	props.unlockStatus = "temp-unlocked-expired";
	const item = shallow(<BarcodeSection {...props} />);
	expect(item.find("ButtonWrap").length).toBe(1);
});

test("When user temporarily unlocked asset and getting unkown status ", async () => {
	props.show = true;
	props.iconClass = "";
	props.isTemp = true;
	props.unlockStatus = "abc";
	const item = shallow(<BarcodeSection {...props} />);
	expect(item.find("ButtonWrap").length).toBe(1);
	expect(item.find("WrapTemporarilyUnlockMessage").length).toBe(0);
});
