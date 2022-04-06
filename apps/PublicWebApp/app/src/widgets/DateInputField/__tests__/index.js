// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import DateInputField from "../index";

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

let props;

/**
 * Reset function
 */
function resetAll() {
	props = {
		name: "date",
		placeholder: "date",
		defaultValue: 1627734600,
		onChange: jest.fn(),
		disableUpcomingDates: 8,
		showPreviousDates: true,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(<DateInputField {...props} />);

	await wait(50);
	expect(item.find("WrapDatePicker").length).toBe(1);
});

/** When isValid function called to test value*/
test("When isValid function called to test value", async () => {
	delete props.disableUpcomingDates;

	const item = shallow(<DateInputField {...props} />);

	const inputItem = item.find("[name='date']");
	inputItem.simulate("change");
	expect(props.onChange).toHaveBeenCalled();
});

test("When user hide privoues dates  ", async () => {
	props.showPreviousDates = false;
	const item = mount(<DateInputField {...props} />);

	await wait(50);
	expect(item.find("WrapDatePicker").length).toBe(1);
});
