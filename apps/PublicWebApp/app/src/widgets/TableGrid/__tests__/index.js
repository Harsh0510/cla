// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import TableGrid from "../index";
import MockTableGrid from "../../../mocks/MockTableGrid";
import { SortingState, IntegratedSorting, DataTypeProvider } from "@devexpress/dx-react-grid";
import { Grid, VirtualTable, Table, TableHeaderRow, TableColumnResizing, TableFixedColumns } from "@devexpress/dx-react-grid-bootstrap4";
import date from "../../../common/date";
import { watchFile } from "fs";

let column, row, resize, tableColumnExtensions, defaultSorting, sortingStateColumnExtensions, loading, leftColumns, rightColumns, dateColumnsName;
/**
 * This 'HOC' does nothing but 'pass through' the provided component,
 * so it's not necessary to 'dive()' into rendered results,
 * and so it's possible to mock the 'api' function.
 **/
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	column = MockTableGrid.column;
	row = MockTableGrid.row;
	resize = MockTableGrid.resize;
	tableColumnExtensions = MockTableGrid.tableColumnExtensions;
	defaultSorting = MockTableGrid.defaultSorting;
	sortingStateColumnExtensions = MockTableGrid.sortingStateColumnExtensions;
	loading = MockTableGrid.loading;
	leftColumns = MockTableGrid.leftColumns;
	rightColumns = MockTableGrid.rightColumns;
	dateColumnsName = MockTableGrid.dateColumnsName;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly with props dateColumnsName */
test("Component renders correctly with props data", async () => {
	const item = shallow(
		<TableGrid
			column={column}
			row={row}
			resize={resize}
			tableColumnExtensions={tableColumnExtensions}
			defaultSorting={defaultSorting}
			sortingStateColumnExtensions={sortingStateColumnExtensions}
			loading={loading}
			leftColumns={leftColumns}
			rightColumns={rightColumns}
		/>
	);

	/** devexpress always return the Grid which is component in index.js file*/
	expect(item.text()).toEqual("<Grid />");
});

test("tableComponent renders Successfully", async () => {
	const item = shallow(
		<TableGrid
			column={column}
			row={row}
			resize={resize}
			tableColumnExtensions={tableColumnExtensions}
			defaultSorting={defaultSorting}
			sortingStateColumnExtensions={sortingStateColumnExtensions}
			loading={loading}
			leftColumns={leftColumns}
			rightColumns={rightColumns}
		/>
	);
	const params = {
		tableRef: {},
		children: <th> Header </th>,
	};
	const component = item.find("TableWrap").props().tableComponent(params);
	expect(component.props.children.type).toEqual("th");
});

/** Pass Date column name with props dateColumnsName data */
test("Pass Date column name with data", async () => {
	dateColumnsName = ["createdDate"];
	const item = shallow(
		<TableGrid
			column={column}
			row={row}
			resize={resize}
			tableColumnExtensions={tableColumnExtensions}
			defaultSorting={defaultSorting}
			sortingStateColumnExtensions={sortingStateColumnExtensions}
			loading={loading}
			leftColumns={leftColumns}
			rightColumns={rightColumns}
			dateColumnsName={dateColumnsName}
		/>
	);

	/** devexpress always return the Grid which is component in index.js file*/
	expect(item.text()).toEqual("<Grid />");
});

/** Component renders correctly */
test("User click on sorting", async () => {
	const mcckdoSorting = jest.fn();
	const item = shallow(
		<TableGrid
			column={column}
			row={row}
			resize={resize}
			tableColumnExtensions={tableColumnExtensions}
			defaultSorting={defaultSorting}
			sortingStateColumnExtensions={sortingStateColumnExtensions}
			loading={loading}
			leftColumns={leftColumns}
			rightColumns={rightColumns}
			dateColumnsName={dateColumnsName}
			doSorting={mcckdoSorting}
		/>
	);
	item.instance().handleClick({
		columnName: "title",
		direction: "desc",
	});

	/** Called doSorting method*/
	expect(mcckdoSorting).toHaveBeenCalled();
});

/** Component style component renders correctly */
test("Render Style Component", async () => {
	const mcckdoSorting = jest.fn();
	const item = mount(
		<TableGrid
			column={column}
			row={row}
			resize={resize}
			tableColumnExtensions={tableColumnExtensions}
			defaultSorting={defaultSorting}
			sortingStateColumnExtensions={sortingStateColumnExtensions}
			loading={loading}
			leftColumns={leftColumns}
			rightColumns={rightColumns}
			dateColumnsName={dateColumnsName}
			doSorting={mcckdoSorting}
		/>
	);

	/** Find length of table row filled by Grid component*/
	expect(item.find("tr").length).toBe(3);
});

test("Change column visibility from parent", async () => {
	const mcckdoSorting = jest.fn();
	const item = shallow(
		<TableGrid
			column={column}
			row={row}
			resize={resize}
			tableColumnExtensions={tableColumnExtensions}
			defaultSorting={defaultSorting}
			sortingStateColumnExtensions={sortingStateColumnExtensions}
			loading={loading}
			leftColumns={leftColumns}
			rightColumns={rightColumns}
			dateColumnsName={dateColumnsName}
			doSorting={mcckdoSorting}
		/>
	);
	item.setProps({
		column: [{ name: "test_name", title: "Test name" }],
	});
	expect(item.state("columns").length).toBe(1);
});

test(`column visibility is toggled properly`, async () => {
	const mcckdoSorting = jest.fn();
	const item = shallow(
		<TableGrid
			column={column}
			row={row}
			resize={resize}
			tableColumnExtensions={tableColumnExtensions}
			defaultSorting={defaultSorting}
			sortingStateColumnExtensions={sortingStateColumnExtensions}
			loading={loading}
			leftColumns={leftColumns}
			rightColumns={rightColumns}
			dateColumnsName={dateColumnsName}
			doSorting={mcckdoSorting}
		/>
	);
	expect(item.state().defaultHiddenColumns).toBe("");
	item.instance().handleColumnVisibilityChange(["techer"]);
	expect(item.state().defaultHiddenColumns.length).toBe(1);
});

test(`add hover listener on row`, async () => {
	const mcckdoSorting = jest.fn();
	let isClassAdded = 0;
	document.querySelectorAll = () => {
		return [
			{
				children: [
					{
						classList: {
							add: () => {
								isClassAdded++;
								return true;
							},
						},
					},
				],
				addEventListener:
					("mouseenter",
					(e) => {
						return {
							target: {
								classList: {
									add: (arg) => {
										return true;
									},
								},
							},
						};
					}),
				removeEventListener:
					("mouseleave",
					(e) => {
						return {
							target: {
								classList: {
									remove: (arg) => {
										return true;
									},
								},
							},
						};
					}),
			},
			{
				children: [
					{
						classList: {
							add: () => {
								isClassAdded++;
								return true;
							},
						},
					},
				],
				addEventListener:
					("mouseenter",
					(e) => {
						return {
							target: {
								classList: {
									add: (arg) => {
										return true;
									},
								},
							},
						};
					}),
				removeEventListener:
					("mouseleave",
					(e) => {
						return {
							target: {
								classList: {
									remove: (arg) => {
										return true;
									},
								},
							},
						};
					}),
			},
		];
	};
	const element = {
		target: {
			parentNode: () => {
				return {
					children: () => {
						return true;
					},
				};
			},
		},
	};
	const item = shallow(
		<TableGrid
			column={column}
			row={row}
			resize={resize}
			tableColumnExtensions={tableColumnExtensions}
			defaultSorting={defaultSorting}
			sortingStateColumnExtensions={sortingStateColumnExtensions}
			loading={loading}
			leftColumns={leftColumns}
			rightColumns={rightColumns}
			dateColumnsName={dateColumnsName}
			doSorting={mcckdoSorting}
		/>
	);
	await wait(1000);
	item.unmount();
	expect(item.instance()).toBe(null);
});
