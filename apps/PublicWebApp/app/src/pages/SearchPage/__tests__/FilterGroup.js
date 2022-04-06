import React from "react";
import { shallow, mount } from "enzyme";
import FilterGroup from "../FilterGroup";

let breakpoint, data, exclusive, group, hasAll, selectFilter, selected, title, WrappedComponent;
let flyouts_getFirstUnseenIndex;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withPageSize", () => mockPassthruHoc);
jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return;
	};
});
jest.mock("../../../common/FlyoutManager", () => {
	return { withFlyoutManager: mockPassthruHoc };
});

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	flyouts_getFirstUnseenIndex = jest.fn();
	breakpoint = 0;
	data = [
		{ id: "all_copies", title: "All Copies", count: 15 },
		{ id: "unlock_books", title: "Unlocked Books", count: 43 },
		{ id: "my_copies", title: "My copies only", count: 4 },
		{ id: "all_extracts", title: "All extracts", count: 4 },
	];
	exclusive = true;
	group = "misc";
	hasAll = true;
	selected = {};
	title = "My Library";
	WrappedComponent = mockPassthruHoc;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders load with props*/
test("Component renders load with props", async () => {
	selectFilter = jest.fn();
	breakpoint = 30;
	const item = mount(
		<FilterGroup
			data={data}
			exclusive={exclusive}
			group={group}
			hasAll={hasAll}
			selected={selected}
			selectFilter={selectFilter}
			title={title}
			breakpoint={breakpoint}
			open={true}
			flyouts_getFirstUnseenIndex={flyouts_getFirstUnseenIndex}
		/>
	);

	await wait(50);
	expect(item.find("Heading").length).toBe(1);
});

/** User click on toggle header button */
test("User click on toggle header button", async () => {
	selectFilter = jest.fn();
	selected = {
		unlock_books: true,
	};
	const toggleSection = jest.fn();
	const item = shallow(
		<FilterGroup
			data={data}
			exclusive={exclusive}
			group={group}
			hasAll={hasAll}
			selected={selected}
			selectFilter={selectFilter}
			title={title}
			toggleSection={toggleSection}
			flyouts_getFirstUnseenIndex={flyouts_getFirstUnseenIndex}
		/>
	);

	let isOpen = item.state().open;
	const btnHeader = item.find("Heading");
	btnHeader.simulate("click");

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().open).not.toBe(isOpen);
});

/** User click on my_school_library filter vice a versa*/
test("User click on my_school_library filter", async () => {
	const toggleSection = jest.fn();
	selectFilter = jest.fn();
	selected = {
		my_copies: true,
	};
	const item = shallow(
		<FilterGroup
			data={data}
			exclusive={exclusive}
			group={group}
			hasAll={hasAll}
			selected={selected}
			selectFilter={selectFilter}
			title={title}
			toggleSection={toggleSection}
			flyouts_getFirstUnseenIndex={flyouts_getFirstUnseenIndex}
		/>
	);

	item.instance().doChange("my_school_library", true, true);

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(selectFilter).toHaveBeenCalled();
});

/** User click on all in filter */
test("User click on all in filter", async () => {
	const toggleSection = jest.fn();
	selectFilter = jest.fn();
	selected = {
		my_copies: true,
	};
	const item = shallow(
		<FilterGroup
			data={data}
			exclusive={exclusive}
			group={group}
			hasAll={hasAll}
			selected={selected}
			selectFilter={selectFilter}
			title={title}
			toggleSection={toggleSection}
			flyouts_getFirstUnseenIndex={flyouts_getFirstUnseenIndex}
		/>
	);

	item.instance().doChange("__all__", true, true);

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(selectFilter).toHaveBeenCalled();
});

/** User click on any other filter except my library filter */
test("User click on any other filter except my library filter", async () => {
	const toggleSection = jest.fn();
	selectFilter = jest.fn();
	selected = {
		my_copies: true,
	};
	const item = shallow(
		<FilterGroup
			data={data}
			exclusive={exclusive}
			group={group}
			hasAll={hasAll}
			selected={selected}
			selectFilter={selectFilter}
			title={title}
			toggleSection={toggleSection}
			flyouts_getFirstUnseenIndex={flyouts_getFirstUnseenIndex}
		/>
	);

	item.instance().doChange("Y", true, false);

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(selectFilter).toHaveBeenCalled();
});

/** component load with breakpoint value */
test("Component load with breakpoint value 30 ", async () => {
	const toggleSection = jest.fn();
	selectFilter = jest.fn();
	selected = {
		all_copies: true,
	};

	const item = mount(
		<FilterGroup
			data={data}
			exclusive={exclusive}
			group={group}
			hasAll={hasAll}
			selected={selected}
			selectFilter={selectFilter}
			title={title}
			toggleSection={toggleSection}
			breakpoint={30}
			flyouts_getFirstUnseenIndex={flyouts_getFirstUnseenIndex}
		/>
	);

	await wait(100);
	const prevBreakpoint = item.state().breakpoint;
	item.setProps({ breakpoint: "10" });

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	const nextBreakpoint = item.instance().props.breakpoint;
	expect(prevBreakpoint).not.toBe(nextBreakpoint);
});

/** User has selected filter in misc filter section */
test(`User has selected filter in misc filter section`, async () => {
	const toggleSection = jest.fn();
	selectFilter = jest.fn();
	selected = {
		my_copies: true,
	};
	const mockFilterId = "__all__";
	const item = mount(
		<FilterGroup
			data={data}
			exclusive={exclusive}
			group={group}
			hasAll={hasAll}
			selected={selected}
			selectFilter={selectFilter}
			title={title}
			toggleSection={toggleSection}
			breakpoint={30}
			flyouts_getFirstUnseenIndex={flyouts_getFirstUnseenIndex}
		/>
	);

	await wait(50);
	item.instance().doChangeMiscFilter(mockFilterId, true);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(selectFilter).toHaveBeenCalled();
});

/** User has selected filter in misc 'all_copies' filter section */
test(`User has selected filter in misc 'all_copies' filter section`, async () => {
	const toggleSection = jest.fn();
	selectFilter = jest.fn();
	selected = {
		my_copies: true,
	};
	const mockFilterId = "__all__";
	const item = mount(
		<FilterGroup
			data={data}
			exclusive={exclusive}
			group={group}
			hasAll={hasAll}
			selected={selected}
			selectFilter={selectFilter}
			title={title}
			toggleSection={toggleSection}
			breakpoint={30}
			flyouts_getFirstUnseenIndex={flyouts_getFirstUnseenIndex}
		/>
	);

	await wait(50);
	item.instance().doChangeMiscFilter(mockFilterId, false);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(selectFilter).toHaveBeenCalled();
});

// /** User has selected filter in misc `__allbooks__` filter section */
test(`User has selected filter in misc '__allbooks__' filter section`, async () => {
	const toggleSection = jest.fn();
	selectFilter = jest.fn();
	selected = {
		my_copies: true,
	};
	const mockFilterId = "__allbooks__";
	const item = mount(
		<FilterGroup
			data={data}
			exclusive={exclusive}
			group={group}
			hasAll={hasAll}
			selected={selected}
			selectFilter={selectFilter}
			title={title}
			toggleSection={toggleSection}
			breakpoint={30}
			flyouts_getFirstUnseenIndex={flyouts_getFirstUnseenIndex}
		/>
	);

	await wait(50);
	item.instance().doChangeMiscFilter(mockFilterId, true);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(selectFilter).toHaveBeenCalled();
});

// /** User has selected filter in misc `all_copies` filter section */
test(`User has selected filter in misc 'all_copies' filter section`, async () => {
	const toggleSection = jest.fn();
	selectFilter = jest.fn();
	selected = {
		my_copies: true,
	};
	const mockFilterId = "__allbooks__";
	const item = mount(
		<FilterGroup
			data={data}
			exclusive={exclusive}
			group={group}
			hasAll={hasAll}
			selected={selected}
			selectFilter={selectFilter}
			title={title}
			toggleSection={toggleSection}
			breakpoint={30}
			flyouts_getFirstUnseenIndex={flyouts_getFirstUnseenIndex}
		/>
	);

	await wait(50);
	item.instance().doChangeMiscFilter(mockFilterId, true);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(selectFilter).toHaveBeenCalled();
});

/** User has selected filter in misc `unlock_books` filter section on  flyOutIndex 2 */
test(`User has selected filter in misc 'unlock_books' filter section`, async () => {
	const toggleSection = jest.fn();
	let flyOutIndex = 2;
	selectFilter = jest.fn();
	selected = {
		unlock_books: true,
	};
	const mockFilterId = "unlock_books";
	const item = shallow(
		<FilterGroup
			data={data}
			exclusive={exclusive}
			group={group}
			hasAll={hasAll}
			selected={selected}
			selectFilter={selectFilter}
			title={title}
			toggleSection={toggleSection}
			breakpoint={30}
			flyOutIndex={2}
			flyouts_getFirstUnseenIndex={flyouts_getFirstUnseenIndex}
		/>
	);

	await wait(50);
	item.instance().doChangeMiscFilter(mockFilterId, true);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(selectFilter).toHaveBeenCalled();
});

/** User has selected filter in misc `unlock_books` filter section on flyOutIndex 3 */
test(`User has selected filter in misc 'unlock_books' filter section on flyOutIndex 3`, async () => {
	const toggleSection = jest.fn();
	selectFilter = jest.fn();
	selected = {
		unlock_books: true,
	};
	const mockFunction = jest.fn();
	const mockFilterId = "unlock_books";
	const item = shallow(
		<FilterGroup
			data={data}
			exclusive={exclusive}
			group={group}
			hasAll={false}
			selected={selected}
			selectFilter={selectFilter}
			title={title}
			toggleSection={toggleSection}
			breakpoint={30}
			flyOutIndex={3}
			itemIndex={1}
			flyouts_getFirstUnseenIndex={flyouts_getFirstUnseenIndex}
		/>
	);

	await wait(50);
	item.instance().doChangeMiscFilter(mockFilterId, true);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(selectFilter).toHaveBeenCalled();
});

/** When myCopiesOnlyFilter is not set */
test(`User has selected filter in misc '__all__' filter section when myCopiesOnlyFilter is not set`, async () => {
	const toggleSection = jest.fn();
	selectFilter = jest.fn();
	selected = {
		my_copies: true,
	};
	data = [
		{ id: "all_copies", title: "All Copies", count: 15 },
		{ id: "unlock_books", title: "Unlocked Books", count: 43 },
	];
	const mockFilterId = "__all__";
	const item = mount(
		<FilterGroup
			data={data}
			exclusive={exclusive}
			group={group}
			hasAll={hasAll}
			selected={selected}
			selectFilter={selectFilter}
			title={title}
			toggleSection={toggleSection}
			breakpoint={30}
			flyouts_getFirstUnseenIndex={flyouts_getFirstUnseenIndex}
		/>
	);

	await wait(50);
	item.instance().doChangeMiscFilter(mockFilterId, false);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(selectFilter).toHaveBeenCalled();
});

/** User has selected filter in misc 'all_copies' filter section when hasAll prop is false */
test(`User has selected filter in misc 'all_copies' filter section when hasAll prop is false`, async () => {
	const toggleSection = jest.fn();
	selectFilter = jest.fn();
	selected = {
		my_copies: true,
	};
	const mockFilterId = "__all__";
	const item = mount(
		<FilterGroup
			data={data}
			exclusive={exclusive}
			group={group}
			hasAll={false}
			selected={selected}
			selectFilter={selectFilter}
			title={title}
			toggleSection={toggleSection}
			breakpoint={30}
			flyouts_getFirstUnseenIndex={flyouts_getFirstUnseenIndex}
		/>
	);

	await wait(50);
	item.instance().doChangeMiscFilter(mockFilterId, false);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(selectFilter).toHaveBeenCalled();
});

/** User has selected User Uploads filter */
test(`User has selected User Uploads filter`, async () => {
	const toggleSection = jest.fn();
	selectFilter = jest.fn();
	const mockFilterId = "all_extracts";
	const item = mount(
		<FilterGroup
			data={data}
			exclusive={exclusive}
			group={group}
			hasAll={true}
			selected={selected}
			selectFilter={selectFilter}
			title={title}
			toggleSection={toggleSection}
			breakpoint={30}
			flyouts_getFirstUnseenIndex={flyouts_getFirstUnseenIndex}
		/>
	);

	await wait(50);
	item.instance().onChangeTab(mockFilterId);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.find("TableToggle").length).toBe(1);
	expect(selectFilter).toHaveBeenCalled();
});

/** User has selected All copies filter */
test(`User has selected All copies filter`, async () => {
	const toggleSection = jest.fn();
	selectFilter = jest.fn();
	const mockFilterId = "all_copies";
	const item = mount(
		<FilterGroup
			data={data}
			exclusive={exclusive}
			group={group}
			hasAll={true}
			selected={selected}
			selectFilter={selectFilter}
			title={title}
			toggleSection={toggleSection}
			breakpoint={30}
			flyouts_getFirstUnseenIndex={flyouts_getFirstUnseenIndex}
		/>
	);

	await wait(50);
	item.instance().onChangeTab(mockFilterId);
	await wait(50);
	item.update();
	expect(item.find("TableToggle").length).toBe(1);
	expect(selectFilter).toHaveBeenCalled();
});
