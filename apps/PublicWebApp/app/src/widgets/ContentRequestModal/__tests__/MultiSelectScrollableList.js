import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow } from "enzyme";
import MultiSelectScrollableList from "../MultiSelectScrollableList";
import CheckboxField from "../../../widgets/Form/fields/CheckboxField";

let props;

function resetAll() {
	props = {
		onChange: jest.fn(),
		options: [
			{ id: 1, title: "Biographies and Autobiographies" },
			{ id: 2, title: "Beauty and Complementary Therapies" },
			{ id: 3, title: "Building Services" },
			{ id: 4, title: "Business" },
			{ id: 5, title: "Childcare and Teaching" },
		],
		value: [1],
		refGroup: {
			current: {
				querySelectorAll: function (query) {
					if (query) {
						return [
							{
								getAttribute: function () {
									return 1;
								},
							},
						];
					}
					return [];
				},
			},
		},
		placeholder: "test",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Component renders correctly`, async () => {
	const item = shallow(<MultiSelectScrollableList {...props} />);
	expect(item.containsMatchingElement(<CheckboxField />)).toBe(true);
	expect(item.find("Label").text()).toEqual(props.placeholder);
});

test(`User checked the item from the list`, async () => {
	const item = shallow(<MultiSelectScrollableList {...props} />);
	item.instance().onChange([1, 2]);
	expect(props.onChange).toHaveBeenCalled();
});

test(`User unchecked the item from the list`, async () => {
	const item = shallow(<MultiSelectScrollableList {...props} />);
	item.instance().onChange();
	expect(props.onChange).toHaveBeenCalled();
});
