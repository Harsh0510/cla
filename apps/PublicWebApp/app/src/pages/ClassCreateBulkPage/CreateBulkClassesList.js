import React from "react";
import TableGrid from "../../widgets/TableGrid";
import styled from "styled-components";
import theme from "../../common/theme";

//set the defualt behaviour of column header
const COLUMN_ALIGN_LEFT = "left";

const WrapperSection = styled.div`
	width: 100%;
	padding-bottom: 3em;
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding-bottom: 2em;
	}
`;

export default class UnlockList extends React.PureComponent {
	getTable = (tableData) => {
		if (!tableData || tableData.length === 0) {
			return "";
		}

		//declare columns
		let columns = [
			{ name: "title", title: "Name" },
			{ name: "year_group", title: "Year group" },
			{ name: "number_of_students", title: "Number of students" },
			{ name: "exam_board", title: "Exam board" },
			{ name: "key_stage", title: "Key stage" },
		];

		//arrange the column records
		const rows = tableData.map((item) => {
			const row = Object.create(null);
			row.title = item.origClass.title;
			row.year_group = item.origClass.year_group;
			row.number_of_students = item.origClass.number_of_students;
			row.exam_board = item.origClass.exam_board;
			row.key_stage = item.origClass.key_stage;
			return row;
		});

		//column resizing
		let defaultColumnWidths = [
			{ columnName: "title", width: 250 },
			{ columnName: "year_group", width: 150 },
			{ columnName: "number_of_students", width: 250 },
			{ columnName: "exam_board", width: 250 },
			{ columnName: "key_stage", width: 150 },
		];

		//default sorting
		let defaultSorting = [];

		//column initilization and alignment
		let tableColumnExtensions = [
			{ columnName: "title", align: COLUMN_ALIGN_LEFT },
			{ columnName: "year_group", align: COLUMN_ALIGN_LEFT },
			{ columnName: "number_of_students", align: COLUMN_ALIGN_LEFT },
			{ columnName: "exam_board", align: COLUMN_ALIGN_LEFT },
			{ columnName: "key_stage", align: COLUMN_ALIGN_LEFT },
		];

		//default disable column for sorting
		let sortingStateColumnExtensions = [
			{ columnName: "title", sortingEnabled: false },
			{ columnName: "year_group", sortingEnabled: false },
			{ columnName: "number_of_students", sortingEnabled: false },
			{ columnName: "exam_board", sortingEnabled: false },
			{ columnName: "key_stage", sortingEnabled: false },
		];

		//for set fixed column
		let leftColumns = ["title"];
		let rightColumns = [];
		//date type column names
		let dateColumnsName = [];

		return (
			<>
				<TableGrid
					column={columns}
					row={rows}
					resize={defaultColumnWidths}
					tableColumnExtensions={tableColumnExtensions}
					defaultSorting={defaultSorting}
					sortingStateColumnExtensions={sortingStateColumnExtensions}
					loading={false}
					leftColumns={leftColumns}
					rightColumns={rightColumns}
					dateColumnsName={dateColumnsName}
				/>
			</>
		);
	};

	render() {
		const props = this.props;
		const table = this.getTable(props.tableData);
		return <WrapperSection>{table}</WrapperSection>;
	}
}
