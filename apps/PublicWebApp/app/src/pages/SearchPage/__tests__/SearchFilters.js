// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import SearchFilters from "../SearchFilters";
import MockSubjects from "../../../mocks/MockSubjects";
import withPageSize from "../../../common/withPageSize";

let props, mockFunction, WrappedComponent, flyouts_getFirstUnseenIndex, flyouts_setNext;

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return;
	};
});
jest.mock("../../../common/withPageSize", () => mockPassthruHoc);
jest.mock("../../../common/FlyoutManager", () => {
	return { withFlyoutManager: mockPassthruHoc };
});

function resetAll() {
	mockFunction = jest.fn();
	flyouts_getFirstUnseenIndex = jest.fn();
	WrappedComponent = mockPassthruHoc;
	props = {
		filters: [
			{
				id: "misc",
				title: "My Library",
				data: [
					{ id: "my_copies", title: "My Copies" },
					{ id: "my_school_library", title: "My School Library" },
				],
			},
			{
				id: "subject",
				title: "Subject",
				data: MockSubjects,
			},
		],
		selected: {
			misc: {},
			subject: {},
		},
		selectFilter: mockFunction,
		ajaxLoaded: false,
		allCount: 100,
		openSubject: true,
		setOpenSubjectFlag: mockFunction,
		onMenuClick: mockFunction,
		open: true,
		isMobile: false,
		breakpoint: 30,
		flyOutIndex: null,
		flyouts_getFirstUnseenIndex: flyouts_getFirstUnseenIndex,
		flyouts_setNext: mockFunction,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders load with props*/
test(`Component renders load with props`, async () => {
	const item = shallow(<SearchFilters {...props} />);
	await wait(10);
	expect(item.find("span").text()).toEqual("Refine search");
});

/** Component renders load with loading when ajaxLoaded values fasle */
test(`Component renders load with loading`, async () => {
	const item = shallow(<SearchFilters {...props} />);
	await wait(10);
	item.setProps({ ajaxLoaded: false });
	item.update();
	item.instance().forceUpdate();
	expect(item.props().ajaxLoaded).not.toBe(true);
});

/** User not see the "Refin search" title in mobile screen */
test(`User not see the "Refin search" title in mobile screen`, async () => {
	props.isMobile = true;
	const item = shallow(<SearchFilters {...props} />);
	await wait(10);
	expect(item.find("Header").length).toEqual(0);
});

/** User not see the "Refine search" title in mobile screen */
test(`User not see the "Refine search" title in mobile screen`, async () => {
	props.isMobile = true;
	const item = shallow(<SearchFilters {...props} />);
	await wait(10);
	expect(item.find("Header").length).toEqual(0);
});

/** User see the "Refine search" title in desktop screen */
test(`User see the "Refine search" title in desktop screen`, async () => {
	props.isMobile = false;
	const item = shallow(<SearchFilters {...props} />);
	await wait(10);
	expect(item.find("Header").length).toEqual(1);
	expect(item.find("Header").props().children).toEqual(<span>Refine search</span>);
});

/** User collapsed/expand the filter content in mobile screen */
test(`User collapsed/expand the filter content in mobile screen`, async () => {
	props.isMobile = true;
	props.breakpoint = 10;
	withPageSize.TABLET = 20;
	props.open = false;
	const item = shallow(<SearchFilters {...props} />);
	await wait(10);
	expect(item.find("FilterGroupWrapper").length).toEqual(0);

	//now user expand the filter section
	item.setProps({ open: true });
	expect(item.find("FilterGroupWrapper").length).toEqual(1);
});

/** Component renders load with props*/
test(`User click on search filter button`, async () => {
	props.breakpoint = 10;
	const item = shallow(<SearchFilters {...props} />);
	const btnSearchFiter = item.find("[name='searchFilter']");
	btnSearchFiter.simulate("click", { preventDefault: jest.fn() });
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(props.onMenuClick).toHaveBeenCalled();
});

/** Component renders without filters */
test(`Component renders without filters`, async () => {
	props.filters = null;
	const item = shallow(<SearchFilters {...props} />);
	await wait(10);
	expect(item.html()).toEqual("");
});

test(`When Not render in small devices`, async () => {
	withPageSize.TABLET = 20;
	props.breakpoint = 10;
	props.open = false;
	const item = shallow(<SearchFilters {...props} />);
	await wait(10);
	expect(item.find("FilterGroupWrapper").length).toBe(0);
});
