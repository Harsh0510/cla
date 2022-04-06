import React from "react";
import { shallow, mount } from "enzyme";
import ExpandablePanel from "../index";
import MockFaq from "../../../mocks/MockFaq";

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(<ExpandablePanel faq={MockFaq} />);
	expect(item.find("Wrap").length).toBe(1);
});

/** When user click on faq then expand the panel */
test("When user click on faq then expand the panel", async () => {
	const item = mount(<ExpandablePanel faq={MockFaq} />);
	item.find("Header").simulate("click");
	expect(item.state("open")).toBe(true);
});

/** When faq have no value */
test("When faq have no value", async () => {
	const item = mount(<ExpandablePanel faq={null} />);
	expect(item.find("Wrap").length).toBe(0);
});

/** When user click on again same faq section then collapse the panel */
test("When user click on again same faq section then collapse the panel", async () => {
	const item = mount(<ExpandablePanel faq={MockFaq} />);
	item.setState({ open: true });
	item.find("Header").simulate("click");
	expect(item.state("open")).toBe(false);
});
