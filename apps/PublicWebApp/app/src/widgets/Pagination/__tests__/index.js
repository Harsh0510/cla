// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import Pagination from "../index";

let totalRecords, pageLimit, currentPage, pageNeighbours;

function resetAll() {
	totalRecords = 100;
	pageLimit = 5;
	currentPage = 1;
	pageNeighbours = 2;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<Pagination totalRecords={totalRecords} pageLimit={pageLimit} currentPage={currentPage} pageNeighbours={pageNeighbours} />);
	expect(item.find("Wrap").length).toBe(1);
});

/** Component renders correctly */
test("Component renders correctly with currentPage value", async () => {
	currentPage = 0;
	const item = mount(<Pagination totalRecords={totalRecords} pageLimit={pageLimit} currentPage={currentPage} pageNeighbours={pageNeighbours} />);
	expect(item.find("Wrap").length).toBe(1);
});

/** Component renders correctly */
test("Component renders with currentPage value more than Neighbours value", async () => {
	currentPage = 100;
	pageNeighbours = 1;
	const item = mount(<Pagination totalRecords={totalRecords} pageLimit={pageLimit} currentPage={currentPage} pageNeighbours={pageNeighbours} />);
	expect(item.find("Wrap").length).toBe(1);
});

/** User click for page change */
test("User click for page change", async () => {
	const mockOnPageChanged = jest.fn();
	const item = shallow(
		<Pagination
			totalRecords={totalRecords}
			pageLimit={pageLimit}
			currentPage={currentPage}
			pageNeighbours={pageNeighbours}
			onPageChanged={mockOnPageChanged}
		/>
	);

	const attrs = { "data-page": "2" };
	item.instance().onClick({ preventDefault: jest.fn(), currentTarget: { getAttribute: (name) => attrs[name], ...attrs } });

	expect(mockOnPageChanged).toHaveBeenCalled();
});

/** When page index and page count both are equal */
test("When page index and page count both are equal", async () => {
	currentPage = 5;
	totalRecords = 50;
	pageLimit = 10;
	const item = shallow(<Pagination totalRecords={totalRecords} pageLimit={pageLimit} currentPage={currentPage} pageNeighbours={pageNeighbours} />);
	expect(item.find("FirstLastWrap").at(1).length).toBe(1);
});

/** When table type pagination is display */
test("When table type pagination is display", async () => {
	const item = shallow(<Pagination totalRecords={totalRecords} pageLimit={pageLimit} currentPage={currentPage} pageNeighbours={pageNeighbours} />);
	item.setProps({ isTablePagination: true });
	expect(item.find("TablePagination").length).toBe(1);
});
