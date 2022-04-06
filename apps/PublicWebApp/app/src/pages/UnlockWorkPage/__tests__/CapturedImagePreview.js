// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow, mount } from "enzyme";
import CapturedImagePreview from "../CapturedImagePreview";

let props, eventHandle;

function resetAll() {
	eventHandle = jest.fn();
	props = {
		onDenyPreview: eventHandle,
		onAcceptPreview: eventHandle,
		isSending: false,
		waiting: false,
		unlocked: false,
		didCaputre: false,
		iconColor: "red",
		iconClass: "fa fa-camera",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(<CapturedImagePreview {...props} />);
	expect(item.find("ModalHeader").length).toBe(1);
	expect(item.find("ModalBody").length).toBe(2);
	expect(item.find("ModalFooter").length).toBe(1);
});

test(' User click on the "Send" button', async () => {
	const item = mount(<CapturedImagePreview {...props} />);
	expect(item.find("StyledButton").length).toBe(2);
	const button = item.find("StyledButton").at(0);
	button.simulate("click");
	item.update();
	expect(eventHandle).toBeCalled();
});

test(' User click on the "Send" button but failed', async () => {
	props.isSending = true;
	const item = mount(<CapturedImagePreview {...props} />);
	expect(item.find("StyledButton").length).toBe(2);
	const button = item.find("StyledButton").at(0);
	button.simulate("click");
	item.update();
	expect(eventHandle).not.toBeCalled();
});
