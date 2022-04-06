// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import TableGridFooter from "../index.js";
import MockMyCopies from "../../../mocks/MockMyCopies";

/**
 * This 'HOC' does nothing but 'pass through' the provided component,
 * so it's not necessary to 'dive()' into rendered results,
 * and so it's possible to mock the 'api' function.
 **/
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

let props, mockFunction;

function resetAll() {
	mockFunction = jest.fn();
	props = {
		unfilteredCount: 10,
		limit: 5,
		pageNeighbours: 3,
		currentPage: 0,
		loading: false,
		isTablePagination: true,
		doPagination: mockFunction,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<TableGridFooter {...props} />);
	expect(item.find("PaginationWrap").length).toBe(1);
	expect(item.find("Pagination").length).toBe(1);
	expect(item.find("DisplayRow").length).toBe(1);
	expect(item.find("CustomSelect").length).toBe(1);
});

/** Component renders without any props */
test("Component renders without any props", async () => {
	const item = shallow(<TableGridFooter />);
	expect(item.find("PaginationWrap").length).toBe(1);
	expect(item.find("Pagination").length).toBe(1);
	expect(item.find("DisplayRow").length).toBe(1);
	expect(item.find("CustomSelect").length).toBe(1);
	const selectPageLimit = item.find("CustomSelect");
	selectPageLimit.simulate("change", {
		preventDefault: jest.fn(),
		target: {
			name: "pageLimit",
			value: "10",
		},
	});
	expect(mockFunction).not.toHaveBeenCalled();
	item.instance().handlePagination(2);
	expect(mockFunction).not.toHaveBeenCalled();
});

/** User change the page limit */
test("User change the page limit", async () => {
	const item = shallow(<TableGridFooter {...props} />);
	const selectPageLimit = item.find("CustomSelect");
	selectPageLimit.simulate("change", {
		preventDefault: jest.fn(),
		target: {
			name: "pageLimit",
			value: "10",
		},
	});
	expect(mockFunction).toHaveBeenCalled();
});

/** User change the pagination page */
test("User change the pagination page", async () => {
	const item = shallow(<TableGridFooter {...props} />);
	item.instance().handlePagination(2);
	expect(mockFunction).toHaveBeenCalled();
});

/** Component renders without any props */
test("User change the pagination page without props function", async () => {
	delete props.doPagination;
	const item = shallow(<TableGridFooter {...props} />);
	expect(item.find("PaginationWrap").length).toBe(1);
	expect(item.find("Pagination").length).toBe(1);
	expect(item.find("DisplayRow").length).toBe(1);
	expect(item.find("CustomSelect").length).toBe(1);
	const selectPageLimit = item.find("CustomSelect");
	selectPageLimit.simulate("change", {
		preventDefault: jest.fn(),
		target: {
			name: "pageLimit",
			value: "10",
		},
	});
	expect(mockFunction).not.toHaveBeenCalled();
	item.instance().handlePagination(2);
	expect(mockFunction).not.toHaveBeenCalled();
});
