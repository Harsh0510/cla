import React from "react";
import { shallow } from "enzyme";
import Confirmbox from "../Confirmbox";

let props, mockFunction;

// Wait for a specified amount of time for async functions
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	mockFunction = jest.fn();
	props = {
		rolloverJobName: "test",
		isShow: true,
		deleteConfirmBox: false,
		action: "new",
		onCancle: mockFunction,
		onConfirm: mockFunction,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders correctly when user adds new rollover job", async () => {
	const item = shallow(<Confirmbox {...props} />);
	expect(item.find("FormConfirmBox").length).toBe(1);
	expect(item.find("FormConfirmBoxText").length).toBe(1);
	expect(item.find("FormConfirmBoxButtonNo").length).toBe(1);
	expect(item.find("FormConfirmBoxText").text()).toEqual("Are you sure you want to schedule a new rollover 'test'?");
});

test("When user clicks on confirm button", async () => {
	const item = shallow(<Confirmbox {...props} />);
	expect(item.find("FormConfirmBox").length).toBe(1);
	expect(item.find("FormConfirmBoxText").length).toBe(1);
	expect(
		item.find("FormDeleteButton").simulate("click", {
			preventDefault: () => {},
		})
	);
});

test("When user clicks on cancel button", async () => {
	const item = shallow(<Confirmbox {...props} />);
	expect(item.find("FormConfirmBox").length).toBe(1);
	expect(item.find("FormConfirmBoxText").length).toBe(1);
	expect(
		item.find("FormConfirmBoxButtonNo").simulate("click", {
			preventDefault: () => {},
		})
	);
});

test("Component renders correctly when user deletes rollover job", async () => {
	props.action = "edit";
	const item = shallow(<Confirmbox {...props} />);
	expect(item.find("FormConfirmBox").length).toBe(1);
	expect(item.find("FormConfirmBoxText").length).toBe(1);
	expect(item.find("FormConfirmBoxButtonNo").length).toBe(1);
	expect(item.find("FormConfirmBoxText").text()).toEqual("This action is irreversible. Please be sure you wish to delete 'test'");
});

test("When confirm box is hidden", async () => {
	props.isShow = false;
	const item = shallow(<Confirmbox {...props} />);
	expect(item.find("FormConfirmBox").length).toBe(0);
	expect(item.find("FormConfirmBoxText").length).toBe(0);
	expect(item.find("FormConfirmBoxButtonNo").length).toBe(0);
});
