import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow } from "enzyme";
import CheckboxSetField from "../CheckboxSetField";
import MockNotification from "../../../mocks/MockNotification";
import CheckboxField from "../../../widgets/Form/fields/CheckboxField";

let mockFunction, props;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

// Mock import
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAuthRequiredConsumer", () => mockPassthruHoc);

function resetAll() {
	mockFunction = jest.mock();
	props = {
		onChange: mockFunction,
		options: MockNotification.notificationCategories.items,
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
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = shallow(<CheckboxSetField {...props} />);
	expect(item.containsMatchingElement(<CheckboxField />)).toBe(true);
});

/** User unchecked the item from the list */
test(`User unchecked the item from the list`, async () => {
	let selectedValue = null;
	props.onChange = (value) => {
		selectedValue = value;
	};
	const item = shallow(<CheckboxSetField {...props} />);
	item.instance().onChange();
	expect(selectedValue).toEqual([1]);
});

test(`User unchecked the item from the list when props dont have onChange event`, async () => {
	let selectedValue = null;
	props.onChange = null;
	const item = shallow(<CheckboxSetField {...props} />);
	item.instance().onChange();
	expect(selectedValue).toEqual(null);
});
