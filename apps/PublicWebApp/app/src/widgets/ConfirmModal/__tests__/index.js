import React from "react";
import { shallow } from "enzyme";
import ConfirmModal from "../index";

let props;

function resetAll() {
	const eventHandle = jest.fn();
	props = {
		uniqueId: 1,
		title: "Header Title",
		subTitle: "subTitle",
		extractTitle: "Test Title",
		onConfirm: eventHandle,
		onCancel: eventHandle,
		width: "600px",
	};
}
beforeEach(resetAll);
afterEach(resetAll);

test("renders correctly", () => {
	const item = shallow(<ConfirmModal {...props} />);
	expect(item.find("Wrapper").length).toBe(1);
});

test("When Header Title is not present", () => {
	delete props.title;
	delete props.width;
	delete props.uniqueId;
	delete props.subTitle;
	const item = shallow(<ConfirmModal {...props} />);
	item.setProps({ title: "" });
	expect(item.find("Wrapper").length).toBe(1);
});

test("When Header Title is Empty", () => {
	props.headerTitle = "";
	const item = shallow(<ConfirmModal {...props} />);
	expect(item.find("Wrapper").length).toBe(1);
});

test("When Click on the Confirm Button", () => {
	const item = shallow(<ConfirmModal {...props} />);
	item.instance().handleConfirm();
	expect(item.find("Wrapper").length).toBe(1);
});

test("When Click on the Confirm Button when not have uniqueId ", () => {
	delete props.uniqueId;
	const item = shallow(<ConfirmModal {...props} />);
	item.instance().handleConfirm();
	expect(item.find("Wrapper").length).toBe(1);
});
