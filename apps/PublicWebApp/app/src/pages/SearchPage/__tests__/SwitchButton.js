// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import SwitchButton from "../SwitchButton";

let props, mockdoChangeMiscFilter, mockBooksFilterSelected;
function resetAll() {
	mockdoChangeMiscFilter = jest.fn();
	mockBooksFilterSelected = false;
	props = {
		key: "__all__",
		onChange: mockdoChangeMiscFilter,
		checked: false,
		value: "__all__",
	};
}

/**wait for async function */

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

beforeEach(resetAll);
afterEach(resetAll);

/** User has n't switch the book filter  */
test(`User has n't switch the book filter`, async () => {
	const item = shallow(<SwitchButton {...props} />);
	expect(item.find("Switch").length).toBe(1);
});

/** User has switch the copies to book filter */
test(`User has switch the copies to book filter`, async () => {
	props.checked = true;
	const item = shallow(<SwitchButton {...props} />);
	const isChecked = item.find("Slider").props().checked;
	expect(item.find("Slider").length).toBe(1);
	expect(isChecked).toBe(true);
});

/** Use has switch the books to copies fiter */
test(`Use has switch the books to copies fiter`, async () => {
	const item = shallow(<SwitchButton {...props} />);
	const switchCheck = item.find('[type="checkbox"]');
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	switchCheck.simulate("change", { currentTarget: { checked: true } });
	expect(mockdoChangeMiscFilter).toHaveBeenCalled();
});
