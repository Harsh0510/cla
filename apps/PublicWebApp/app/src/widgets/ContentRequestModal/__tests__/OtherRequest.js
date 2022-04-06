import React from "react";
import { shallow } from "enzyme";
import OtherRequest from "../OtherRequest";

let props;

function resetAll() {
	props = {
		data: "test other request info",
		onChange: jest.fn(),
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Component renders correctly`, async () => {
	const item = shallow(<OtherRequest {...props} />);
	expect(item.find("Label").text()).toEqual("Other request or feedback");
	expect(item.find("TextArea").length).toEqual(1);
});

test(`When user changes value`, async () => {
	const item = shallow(<OtherRequest {...props} />);
	item.instance().onChange({ target: { name: "otherRequest", value: "test" } });
	expect(props.onChange).toHaveBeenCalled();
});
