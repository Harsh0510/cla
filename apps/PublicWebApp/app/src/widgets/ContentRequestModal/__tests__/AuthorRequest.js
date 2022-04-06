import React from "react";
import { shallow } from "enzyme";
import AuthorRequest from "../AuthorRequest";

let props;

function resetAll() {
	props = {
		data: [],
		onChange: jest.fn(),
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Component renders correctly`, async () => {
	const item = shallow(<AuthorRequest {...props} />);
	expect(item.find("Title").text()).toEqual("Author");
	expect(item.find("MultiRowTextField").length).toBe(1);
	expect(item.find("MultiRowTextField").prop("value")).toEqual([""]);
});

test(`Component renders correctly with author values`, async () => {
	props.data = ["author"];
	const item = shallow(<AuthorRequest {...props} />);
	expect(item.find("Title").text()).toEqual("Author");
	expect(item.find("MultiRowTextField").length).toBe(1);
	expect(item.find("MultiRowTextField").prop("value")).toEqual(["author"]);
});

test(`When user changes value of author`, async () => {
	const item = shallow(<AuthorRequest {...props} />);
	expect(item.find("Title").text()).toEqual("Author");
	expect(item.find("MultiRowTextField").length).toBe(1);
	expect(item.find("MultiRowTextField").prop("value")).toEqual([""]);
	item.instance().handleAuthorChange({ name: "authorRequest", value: "test" });
	expect(props.onChange).toHaveBeenCalled();
});
