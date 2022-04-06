// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow } from "enzyme";
import WizardExtract from "../index";

let step, isUnlocked;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withApiConsumer.js", () => mockPassthruHoc);
jest.mock("../../../common/withAuthConsumer.js", () => mockPassthruHoc);
jest.mock("../../../common/withAuthRequiredConsumer.js", () => mockPassthruHoc);

function resetAll() {
	step = 1;
	isUnlocked = false;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<WizardExtract step={step} unlocked={isUnlocked} />);

	expect(item.find("WizardSection").length).toBe(1);
	expect(item.find("StepItem").length).toBe(4);
});

/** Zero step if book is unlocked */
test("Zero step if book is unlocked ", async () => {
	step = 0;
	isUnlocked = true;
	const item = shallow(<WizardExtract step={step} unlocked={isUnlocked} />);
	const stepItem = item.find("StepItem").first();
	const selectedClass = stepItem.children().find("a").props().className;
	const selectedItemText = stepItem.children().find("a").text();

	expect(item.find("WizardSection").length).toBe(1);
	expect(item.find("StepItem").length).toBe(4);
	expect(selectedClass).toEqual("nav-link");
	expect(selectedItemText).toEqual("1Unlock Content");
});

/** First step if book is unlocked */
test("First step if book is unlocked", async () => {
	step = 1;
	isUnlocked = true;
	const item = shallow(<WizardExtract step={step} unlocked={isUnlocked} />);
	const stepItem = item.find("StepItem").first();
	const selectedClass = stepItem.children().find("a").props().className;
	const selectedItemText = stepItem.children().find("a").text();

	expect(item.find("WizardSection").length).toBe(1);
	expect(item.find("StepItem").length).toBe(4);
	expect(selectedClass).toEqual("nav-link active");
	expect(selectedItemText).toEqual("1Unlock Content");
});

/** Second step if book is unlocked */
test("Second step if book is unlocked", async () => {
	let selectedClass = "";
	let selectedItemText = "";

	step = 2;
	isUnlocked = true;
	const item = shallow(<WizardExtract step={step} unlocked={isUnlocked} />);
	const stepItem = item.find("StepItem");
	const stepItem1 = stepItem.first();
	selectedClass = stepItem1.children().find("a").props().className;
	selectedItemText = stepItem1.children().find("a").text();

	expect(item.find("WizardSection").length).toBe(1);
	expect(item.find("StepItem").length).toBe(4);
	expect(selectedClass).toEqual("nav-link active");
	expect(selectedItemText).toEqual("1Unlock Content");

	const stepItem2 = stepItem.at(1);
	selectedClass = stepItem2.children().find("a").props().className;
	selectedItemText = stepItem2.children().find("a").text();

	expect(selectedClass).toEqual("nav-link active");
	expect(selectedItemText).toEqual("2Select Class");
});

/** Third step if book is unlocked */
test("Third step if book is unlocked", async () => {
	let selectedClass = "";
	let selectedItemText = "";

	step = 3;
	isUnlocked = true;
	const item = shallow(<WizardExtract step={step} unlocked={isUnlocked} />);
	const stepItem = item.find("StepItem");
	const stepItem1 = stepItem.first();
	selectedClass = stepItem1.children().find("a").props().className;
	selectedItemText = stepItem1.children().find("a").text();

	expect(item.find("WizardSection").length).toBe(1);
	expect(item.find("StepItem").length).toBe(4);
	expect(selectedClass).toEqual("nav-link active");
	expect(selectedItemText).toEqual("1Unlock Content");

	const stepItem2 = stepItem.at(1);
	selectedClass = stepItem2.children().find("a").props().className;
	selectedItemText = stepItem2.children().find("a").text();

	expect(selectedClass).toEqual("nav-link active");
	expect(selectedItemText).toEqual("2Select Class");

	const stepItem3 = stepItem.at(2);
	selectedClass = stepItem3.children().find("a").props().className;
	selectedItemText = stepItem3.children().find("a").text();

	expect(selectedClass).toEqual("nav-link active");
	expect(selectedItemText).toEqual("3Select Pages");

	const stepItem4 = stepItem.at(3);
	selectedClass = stepItem4.children().find("a").props().className;
	selectedItemText = stepItem4.children().find("a").text();

	expect(selectedClass).toEqual("nav-link");
	expect(selectedItemText).toEqual("4Confirm");
});

/** fourth step if book is unlocked */
test("fourth step if book is unlocked", async () => {
	let selectedClass = "";
	let selectedItemText = "";

	step = 4;
	isUnlocked = true;
	const item = shallow(<WizardExtract step={step} unlocked={isUnlocked} />);
	const stepItem = item.find("StepItem");
	const stepItem1 = stepItem.first();
	selectedClass = stepItem1.children().find("a").props().className;
	selectedItemText = stepItem1.children().find("a").text();

	expect(item.find("WizardSection").length).toBe(1);
	expect(item.find("StepItem").length).toBe(4);
	expect(selectedClass).toEqual("nav-link active");
	expect(selectedItemText).toEqual("1Unlock Content");

	const stepItem2 = stepItem.at(1);
	selectedClass = stepItem2.children().find("a").props().className;
	selectedItemText = stepItem2.children().find("a").text();

	expect(selectedClass).toEqual("nav-link active");
	expect(selectedItemText).toEqual("2Select Class");

	const stepItem3 = stepItem.at(2);
	selectedClass = stepItem3.children().find("a").props().className;
	selectedItemText = stepItem3.children().find("a").text();

	expect(selectedClass).toEqual("nav-link active");
	expect(selectedItemText).toEqual("3Select Pages");

	const stepItem4 = stepItem.at(3);
	selectedClass = stepItem4.children().find("a").props().className;
	selectedItemText = stepItem4.children().find("a").text();

	expect(selectedClass).toEqual("nav-link active");
	expect(selectedItemText).toEqual("4Confirm");
});

/** When user click on icon */
test("When user click on icon", async () => {
	const mockFun = jest.fn();
	const item = shallow(<WizardExtract step={step} unlocked={isUnlocked} />);

	item.setProps({ isTextDisplay: true });
	item.setProps({ doToggelWizard: mockFun });
	item.instance().handleClick({ preventDefault: mockFun });

	expect(mockFun).toHaveBeenCalled();
});
