import React from "react";
import { shallow } from "enzyme";
import ContentTypeRequest from "../ContentTypeRequest";

let props;

function resetAll() {
	props = {
		dropDownData: [
			{ id: 1, name: "content type1" },
			{ id: 1, name: "content type2" },
		],
		data: { contentTypes: [1, 2], additionalComments: "test other request info" },
		onChange: jest.fn(),
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = shallow(<ContentTypeRequest {...props} />);
	expect(item.find("Label").at(0).text()).toEqual("Select the content types you'd like to see on the Platform");
	expect(item.find("MultiSelectScrollableList").length).toEqual(1);
	expect(item.find("Label").at(1).text()).toEqual("Additional comments");
	expect(item.find("TextArea").length).toEqual(1);
});

test(`When user changes value of additional comments`, async () => {
	const item = shallow(<ContentTypeRequest {...props} />);
	item.instance().onChange({ target: { name: "additionalComments", value: "test" } });
	expect(props.onChange).toHaveBeenCalled();
});

test(`When user selects value from content types`, async () => {
	const item = shallow(<ContentTypeRequest {...props} />);
	item.instance().handleDropdownChange([1]);
	expect(props.onChange).toHaveBeenCalled();
});
