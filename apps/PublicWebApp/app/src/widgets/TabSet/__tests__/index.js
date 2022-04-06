import React from "react";
import { shallow } from "enzyme";
import TabSet from "../index";
import staticValues from "../../../common/staticValues";

let mockProps;

function resetAll() {
	mockProps = {
		tabs: [
			{
				title: "Book request",
				name: staticValues.contentRequestType.bookRequest,
				content: <>Book Request</>,
				toolTipText: "Please enter as much information about the book you wish to see on the Platform as you have available.",
			},
			{
				title: "Author request",
				name: staticValues.contentRequestType.authorRequest,
				content: <>Author Request</>,
				toolTipText: "Please add up to 5 authors here.",
			},
		],
		selectedIndex: 0,
		maxTabsPerRow: 1,
		onSelect: jest.fn(),
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = shallow(<TabSet {...mockProps} />);
	expect(item.find("TabTitleWrapper").length).toBe(1);
	expect(item.find("BoxContainer").length).toBe(mockProps.tabs.length);
});

test(`Component renders correctly when max tabs per row is not provided`, async () => {
	mockProps.maxTabsPerRow = null;
	const item = shallow(<TabSet {...mockProps} />);
	expect(item.find("TabTitleWrapper").length).toBe(1);
	expect(item.find("BoxContainer").length).toBe(mockProps.tabs.length);
});

test(`When user clicks on tab which is not selected`, async () => {
	const item = shallow(<TabSet {...mockProps} />);
	const tab = item.find("BoxContainer").at(mockProps.tabs.length - 1);
	tab.simulate("click", {
		preventDefault: jest.fn(),
		currentTarget: {
			getAttribute: () => {
				return mockProps.tabs.length - 1;
			},
		},
		target: { name: "request" },
	});
	expect(mockProps.onSelect).toHaveBeenCalled();
});

test(`When user selects value from dropdown in mobile`, async () => {
	const item = shallow(<TabSet {...mockProps} />);
	const dropdown = item.find("FormCustomSelect");
	dropdown.simulate("change", {
		preventDefault: jest.fn(),
		currentTarget: {
			getAttribute: jest.fn(),
		},
		target: { name: "request type", value: mockProps.tabs.length - 1 },
	});
	expect(mockProps.onSelect).toHaveBeenCalled();
});
