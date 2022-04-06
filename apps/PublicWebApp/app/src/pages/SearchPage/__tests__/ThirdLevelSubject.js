// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import ThirdLevelSubject from "../ThirdLevelSubject";
import MockSubjectFilter from "../../../mocks/MockSubjectFilter";

let group, subject, selected, selectFilter, breakpoint;
let flyouts_getFirstUnseenIndex, flyouts_setNext, WrappedComponent;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

//jest.mock('../../../common/withPageSize', () => mockPassthruHoc);
jest.mock("../../../common/FlyoutManager", () => {
	return { withFlyoutManager: mockPassthruHoc };
});

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	flyouts_setNext = jest.fn();
	flyouts_getFirstUnseenIndex = jest.fn();
	group = "subject";
	subject = MockSubjectFilter[2];
	selected = { YND: true, ANC: true };
	breakpoint = 10;
	WrappedComponent = mockPassthruHoc;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders load with props*/
test("Component renders load with props", async () => {
	selectFilter = jest.fn();
	const item = shallow(<ThirdLevelSubject group={group} subject={subject} selected={selected} selectFilter={selectFilter} />).dive();
	expect(item.find("Heading").length).toBe(1);
});

/** User click on toggle header button*/
test("User click on toggle header button", async () => {
	selectFilter = jest.fn();
	const item = shallow(<ThirdLevelSubject group={group} subject={subject} selected={selected} selectFilter={selectFilter} />).dive();
	let isOpen = item.state().open;
	const btnHeader = item.find("CollapseArrow");
	btnHeader.simulate("click");
	expect(item.state().open).not.toBe(isOpen);
});

/**User click on third level subject in filter */
test("User click on third level subject in filter", async () => {
	flyouts_getFirstUnseenIndex.mockReturnValue(5);
	selectFilter = jest.fn();
	const item = shallow(
		<ThirdLevelSubject
			group={group}
			subject={subject}
			selected={selected}
			selectFilter={selectFilter}
			flyouts_getFirstUnseenIndex={flyouts_getFirstUnseenIndex}
			flyouts_setNext={flyouts_setNext}
		/>
	).dive();
	item.instance().doChange("YND", true);
	expect(selectFilter).toHaveBeenCalled();
	expect(flyouts_getFirstUnseenIndex).toHaveBeenCalled();
	expect(flyouts_setNext).toHaveBeenCalled();
});

/**User click on third level subject in filter */
test("User click on third level subject in filter", async () => {
	selectFilter = jest.fn();
	const item = shallow(
		<ThirdLevelSubject
			group={group}
			subject={subject}
			selected={selected}
			selectFilter={selectFilter}
			flyouts_getFirstUnseenIndex={flyouts_getFirstUnseenIndex}
		/>
	).dive();
	const checkBox = item.find("CheckBox");
	checkBox.simulate("change");
	expect(flyouts_getFirstUnseenIndex).toHaveBeenCalled();
	expect(selectFilter).toHaveBeenCalled();
});

/**User not getting the child Subjects data */
test("User not getting the child Subjects data", async () => {
	selectFilter = jest.fn();
	subject.child_subjects = [];
	const item = shallow(
		<ThirdLevelSubject
			group={group}
			subject={subject}
			selected={selected}
			selectFilter={selectFilter}
			flyouts_getFirstUnseenIndex={flyouts_getFirstUnseenIndex}
		/>
	).dive();
	expect(item.find("FilterList").length).toBe(0);
});

/** component load with breakpoint value */
test("Component load with breakpoint value 30 ", async () => {
	const toggleSection = jest.fn();
	selectFilter = jest.fn();
	selected = {
		YND: true,
	};
	const item = shallow(<ThirdLevelSubject group={group} subject={subject} selected={selected} selectFilter={selectFilter} breakpoint={30} />).dive();

	item.setProps({ breakpoint: 30 });
	await wait(100);
	item.instance().toggleSection();

	await wait(100);
	//item.update();
	const prevBreakpoint = item.state().breakpoint;
	item.setProps({ breakpoint: "10" });

	await wait(100);

	const nextBreakpoint = item.instance().props.breakpoint;
	expect(prevBreakpoint).not.toBe(nextBreakpoint);
});
