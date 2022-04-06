import React from "react";
import TableGrid from "../TableGrid";
import TableGridFooter from "../TableGridFooter";
import PropTypes from "prop-types";

const PAGE_NEIGHBOUR_LIMIT = 3;

class Presentation extends React.PureComponent {
	//** Get data for display in table grid */
	getData = () => {
		const columns = [];
		const defaultColumnWidths = [];
		const tableColumnExtensions = [];
		const dateColumnsName = [];
		const sortingStateColumnExtensions = [];

		for (const field of this.props.fields) {
			columns.push({
				name: field.id,
				title: field.title,
			});
			defaultColumnWidths.push({
				columnName: field.id,
				width: field.width,
			});
			tableColumnExtensions.push({
				columnName: field.id,
				align: field.align,
			});
			sortingStateColumnExtensions.push({
				columnName: field.id,
				sortingEnabled: field.sortingEnabled,
			});
			if (field.type === "date") {
				dateColumnsName.push(field.id);
			}
		}

		//default sorting
		const defaultSorting = [
			{
				columnName: this.props.sortField,
				direction: this.props.sortDir && this.props.sortDir.toUpperCase()[0] === "D" ? "desc" : "asc",
			},
		];

		return {
			column: columns,
			resize: defaultColumnWidths,
			tableColumnExtensions: tableColumnExtensions,
			defaultSorting: defaultSorting,
			dateColumnsName: dateColumnsName,
			sortingStateColumnExtensions: sortingStateColumnExtensions,
		};
	};

	render() {
		const { data, unfilteredCount, doSorting, doPagination, showColumnSelector, limit, offset, loading } = this.props;
		const bindData = this.getData();

		return (
			<>
				<TableGrid {...bindData} row={data} doSorting={doSorting} showColumnSelector={showColumnSelector} />
				<TableGridFooter
					unfilteredCount={unfilteredCount}
					limit={limit}
					pageNeighbours={PAGE_NEIGHBOUR_LIMIT}
					doPagination={doPagination}
					currentPage={parseInt(offset) / Number(limit) + 1}
					loading={loading}
				/>
			</>
		);
	}
}

Presentation.propTypes = {
	data: PropTypes.array.isRequired, // rows data
	fields: PropTypes.array.isRequired, // column fields
	unfilteredCount: PropTypes.number.isRequired, // number of unfiltered data
	doSorting: PropTypes.func.isRequired, // function for sorting
	doPagination: PropTypes.func.isRequired, // function for pagination
	showColumnSelector: PropTypes.bool.isRequired, // for showing column selector
	limit: PropTypes.number.isRequired, // limit
	offset: PropTypes.number.isRequired, // offset
	loading: PropTypes.bool.isRequired, // loading
	sortField: PropTypes.string, // sort field
	sortDir: PropTypes.string, // sort direction
};

export default Presentation;
