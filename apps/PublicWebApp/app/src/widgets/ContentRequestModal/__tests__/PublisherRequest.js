import React from "react";
import { shallow } from "enzyme";
import PublisherRequest from "../PublisherRequest";

let props;

function resetAll() {
	props = {
		data: [],
		onChange: jest.fn(),
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = shallow(<PublisherRequest {...props} />);
	expect(item.find("Title").text()).toEqual("Publisher");
	expect(item.find("MultiRowTextField").length).toBe(1);
});

test(`Component renders correctly with Publisher values`, async () => {
	props.data = ["publisher"];
	const item = shallow(<PublisherRequest {...props} />);
	expect(item.find("Title").text()).toEqual("Publisher");
	expect(item.find("MultiRowTextField").length).toBe(1);
});

test(`When user changes value of publisher`, async () => {
	const item = shallow(<PublisherRequest {...props} />);
	item.instance().handlePublisherChange({ name: "publisherRequest", value: "test" });
	expect(props.onChange).toHaveBeenCalled();
});
