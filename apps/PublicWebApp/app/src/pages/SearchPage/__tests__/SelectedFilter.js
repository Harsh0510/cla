// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import SelectedFilter from "../SelectedFilter";

let props,
	mockfun = jest.fn();

props = {
	filter: {
		filterGroup: "subject",
		filterId: "KFC",
		isChecked: true,
		title: "Accounting",
	},
	onClose: jest.fn(),
	key: "KFC",
};

/** Component renders correctly with props*/
test("Component renders correctly with props", async () => {
	const item = shallow(<SelectedFilter {...props} />).dive();
	expect(item.find("DisSelectFilterButton").length).toBe(1);
});

/** When user click on filter checkbox*/
test("When user click on filter checkbox", async () => {
	const item = shallow(<SelectedFilter {...props} onClick={mockfun} />).dive();
	item.find("DisSelectFilterButton").simulate("click", { preventDefault: mockfun });
	expect(mockfun).toHaveBeenCalled();
});

/** Component renders without title*/
test("Component renders without title", async () => {
	props.filter.title = "";
	const item = shallow(<SelectedFilter {...props} />).dive();
	expect(item.props().children[0]).toEqual("");
});

/** Component renders without title*/
test("Show flyout on Flyout on left hand side search bar", async () => {
	props.filter.title = "";
	const item = shallow(<SelectedFilter {...props} />).dive();
	expect(item.props().children[0]).toEqual("");
});
