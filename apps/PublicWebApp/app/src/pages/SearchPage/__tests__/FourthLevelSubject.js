import React from "react";
import { shallow, mount } from "enzyme";
import FourthLevelSubject from "../FourthLevelSubject";
import MockSubjectFilter from "../../../mocks/MockSubjectFilter";

let group, childSubject, selected, selectFilter, WrappedComponent, flyouts_getFirstUnseenIndex, flyouts_setNext;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withPageSize", () => mockPassthruHoc);
jest.mock("../../../common/FlyoutManager", () => {
	return { withFlyoutManager: mockPassthruHoc };
});

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	selectFilter = jest.fn();
	flyouts_setNext = jest.fn();
	flyouts_getFirstUnseenIndex = jest.fn();
	group = "subject";
	childSubject = MockSubjectFilter[2].child_subjects[0];
	selected = true;
	WrappedComponent = mockPassthruHoc;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders load with props*/
test(`Component renders load with props`, async () => {
	const item = mount(<FourthLevelSubject childSubject={childSubject} selected={selected} selectFilter={selectFilter} group={group} />);
	expect(item.find("CheckBox").length).toBe(1);
});

/**User click on third level subject in filter */
test(`User click on third level subject in filter`, async () => {
	flyouts_getFirstUnseenIndex.mockReturnValue(5);
	const item = shallow(
		<FourthLevelSubject
			childSubject={childSubject}
			selected={selected}
			selectFilter={selectFilter}
			flyouts_getFirstUnseenIndex={flyouts_getFirstUnseenIndex}
			group={group}
			flyouts_setNext={flyouts_setNext}
		/>
	);
	item.instance().doChange("YND", true);
	expect(selectFilter).toHaveBeenCalled();
	expect(flyouts_getFirstUnseenIndex).toHaveBeenCalled();
	expect(flyouts_setNext).toHaveBeenCalled();
});

/**Simulate Onchange when User click on third level subject in filter */
test(`User click on third level subject in filter`, async () => {
	const item = shallow(
		<FourthLevelSubject
			childSubject={childSubject}
			selected={selected}
			selectFilter={selectFilter}
			flyouts_getFirstUnseenIndex={flyouts_getFirstUnseenIndex}
			group={group}
		/>
	);
	const checkBox = item.find("CheckBox");
	checkBox.simulate("change");
	expect(selectFilter).toHaveBeenCalled();
	expect(flyouts_getFirstUnseenIndex).toHaveBeenCalled();
});
