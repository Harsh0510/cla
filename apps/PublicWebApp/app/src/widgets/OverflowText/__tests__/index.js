import OverflowText from "../index";
import React from "react";
import { shallow } from "enzyme";

let mockTitle;
let props;

function resetAll() {
	mockTitle = "BBC History Revealed - October 2019";
	props = {
		onClick: jest.fn(),
		isShowFullText: false,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders successfully", async () => {
	const item = shallow(<OverflowText {...props}>{mockTitle}</OverflowText>);
	expect(item.text()).toEqual(mockTitle);
});

test("Component renders successfully without title", async () => {
	mockTitle = null;
	const item = shallow(<OverflowText {...props}>{mockTitle}</OverflowText>);
	expect(item.text()).toEqual("");
});

test("When limit is not passed", async () => {
	mockTitle =
		"Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus animi iure quo ducimus iusto, saepe quasi dolorum inventore cumque a natus consequatur. Ipsam fugiat quod enim aperiam, alias eligendi quasi dolor itaque, aliquam non unde ullam, animi blanditiis incidunt fugit perspiciatis. Qui nobis ad, veniam dolor ipsa doloremque quae nostrum aliquid, est eligendi commodi officiis! Ad, in! Quasi officia consequuntur voluptates numquam beatae vel consequatur non sequi reiciendis maxime impedit quidem molestias aliquam in, ea blanditiis, qui animi distinctio dolorum. Officiis dolor numquam voluptates odit, deleniti incidunt eveniet omnis. Ipsa labore accusantium repellendus, laborum numquam aspernatur laudantium corporis sint eligendi!";
	const item = shallow(<OverflowText {...props}>{mockTitle}</OverflowText>);
	expect(item.find("Fragment").text()).toEqual(
		"Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus animi iure quo ducimus iusto, saepe quasi dolorum inventore cumque a natus consequatur. Ipsam fugiat quod enim aperiam, alias eligendi quasi dolor itaque, aliquam non unde ullam, animi blanditiis incidunt fugit perspiciatis. Qui nobis ad, veniam dolor ipsa doloremque quae nostrum aliquid, est eligendi commodi officiis! Ad, in! Quasi officia consequuntur voluptates numquam beatae vel consequatur non sequi reiciendis maxime impedit quidem molestias aliquam in, ea blanditiis, qui animi distinctio dolorum. Officiis dolor numquam voluptates odit, deleniti incidunt eveniet omnis. Ipsa labore accusantium repellendus, laborum numquam aspernatur laudantium corporis sint eligendi!"
	);
});

test("When limit is passed", async () => {
	mockTitle =
		"Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus animi iure quo ducimus iusto, saepe quasi dolorum inventore cumque a natus consequatur. Ipsam fugiat quod enim aperiam, alias eligendi quasi dolor itaque, aliquam non unde ullam, animi blanditiis incidunt fugit perspiciatis. Qui nobis ad, veniam dolor ipsa doloremque quae nostrum aliquid, est eligendi commodi officiis! Ad, in! Quasi officia consequuntur voluptates numquam beatae vel consequatur non sequi reiciendis maxime impedit quidem molestias aliquam in, ea blanditiis, qui animi distinctio dolorum. Officiis dolor numquam voluptates odit, deleniti incidunt eveniet omnis. Ipsa labore accusantium repellendus, laborum numquam aspernatur laudantium corporis sint eligendi!";
	props.limit = 95;
	const item = shallow(<OverflowText {...props}>{mockTitle}</OverflowText>);
	expect(item.find("Text").text()).toEqual("Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus animi iure quo ducimus iust...");
});

test("When limit is passed", async () => {
	mockTitle =
		"Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus animi iure quo ducimus iusto, saepe quasi dolorum inventore cumque a natus consequatur. Ipsam fugiat quod enim aperiam, alias eligendi quasi dolor itaque, aliquam non unde ullam, animi blanditiis incidunt fugit perspiciatis. Qui nobis ad, veniam dolor ipsa doloremque quae nostrum aliquid, est eligendi commodi officiis! Ad, in! Quasi officia consequuntur voluptates numquam beatae vel consequatur non sequi reiciendis maxime impedit quidem molestias aliquam in, ea blanditiis, qui animi distinctio dolorum. Officiis dolor numquam voluptates odit, deleniti incidunt eveniet omnis. Ipsa labore accusantium repellendus, laborum numquam aspernatur laudantium corporis sint eligendi!";
	props.isShowFullText = true;
	const item = shallow(<OverflowText {...props}>{mockTitle}</OverflowText>);
	expect(item.find("Text").text()).toEqual(
		"Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus animi iure quo ducimus iusto, saepe quasi dolorum inventore cumque a natus consequatur. Ipsam fugiat quod enim aperiam, alias eligendi quasi dolor itaque, aliquam non unde ullam, animi blanditiis incidunt fugit perspiciatis. Qui nobis ad, veniam dolor ipsa doloremque quae nostrum aliquid, est eligendi commodi officiis! Ad, in! Quasi officia consequuntur voluptates numquam beatae vel consequatur non sequi reiciendis maxime impedit quidem molestias aliquam in, ea blanditiis, qui animi distinctio dolorum. Officiis dolor numquam voluptates odit, deleniti incidunt eveniet omnis. Ipsa labore accusantium repellendus, laborum numquam aspernatur laudantium corporis sint eligendi!"
	);
});
