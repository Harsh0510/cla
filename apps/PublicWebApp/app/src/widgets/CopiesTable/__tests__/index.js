import React from "react";
import { shallow } from "enzyme";
import CopiesTable from "../index";
import MockExtract from "../../../mocks/MockCopyManagementPage";

/**
 * This 'HOC' does nothing but 'pass through' the provided component,
 * so it's not necessary to 'dive()' into rendered results,
 * and so it's possible to mock the 'api' function.
 **/
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

// Mock import
jest.mock("../../../common/withAuthConsumer", () => mockPassthruHoc);

let props, mockFunction;

beforeEach(resetAll);
afterEach(resetAll);

function resetAll() {
	mockFunction = jest.fn();
	props = {
		copiesData: MockExtract.ExtractSearch.extracts,
		unfilteredCount: 2,
		sortField: "title",
		sortDir: "A",
		doSorting: mockFunction,
		doPagination: mockFunction,
		limit: 10,
		offset: 0,
		currentPage: 1,
		withAuthConsumer_myUserDetails: { can_copy: true },
		loading: false,
	};
}

test(`Component renders correctly with all props`, async () => {
	const item = shallow(<CopiesTable {...props} />);
	expect(item.find("Presentation").length).toBe(1);
});

test(`Component renders correctly without user details`, async () => {
	props.withAuthConsumer_myUserDetails = null;
	const item = shallow(<CopiesTable {...props} />);
	expect(item.find("Presentation").length).toBe(1);
});

test(`Component renders correctly with user is able to do copy`, async () => {
	props.sortDir = "D";
	props.withAuthConsumer_myUserDetails = {
		can_copy: true,
		has_trial_extract_access: false,
	};
	const item = shallow(<CopiesTable {...props} />);
	expect(item.find("Presentation").length).toBe(1);
});

test(`Component renders correctly with user is not able to do copy but in trail period`, async () => {
	props.sortDir = "D";
	props.withAuthConsumer_myUserDetails = {
		can_copy: false,
		has_trial_extract_access: true,
	};
	const item = shallow(<CopiesTable {...props} />);
	expect(item.find("Presentation").length).toBe(1);
});

test(`Component renders correctly with user is not able to do copy as well as not in trial period`, async () => {
	props.sortDir = "D";
	props.withAuthConsumer_myUserDetails = {
		can_copy: false,
		has_trial_extract_access: false,
	};
	const item = shallow(<CopiesTable {...props} />);
	expect(item.find("Presentation").length).toBe(1);
});

test(`Component renders correctly when status of extract is cancelled`, async () => {
	props.sortDir = "D";
	props.copiesData.map((extract) => {
		extract.status = "cancelled";
	});
	const item = shallow(<CopiesTable {...props} />);
	expect(item.find("Presentation").length).toBe(1);
});
