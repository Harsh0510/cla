import React from "react";
import TableGrid from "../../widgets/TableGrid";
import styled, { css } from "styled-components";
import theme from "../../common/theme";

//set the defualt behaviour of column header
const COLUMN_ALIGN_LEFT = "left";
const COLUMN_ALIGN_CENTER = "center";

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
			{ name: "email", title: "Email" },
			{ name: "title", title: "Title" },
			{ name: "first_name", title: "First Name" },
			{ name: "last_name", title: "Last Name" },
			{ name: "job_title", title: "Job Title" },
		];

		//arrange the column records
		const rows = tableData.map((item) => {
			const row = Object.create(null);
			row.email = item.origUser.email;
			row.title = item.origUser.title;
			row.first_name = item.origUser.first_name;
			row.last_name = item.origUser.last_name;
			row.job_title = item.origUser.job_title;
			return row;
		});

		//column resizing
		let defaultColumnWidths = [
			{ columnName: "email", width: 250 },
			{ columnName: "title", width: 150 },
			{ columnName: "first_name", width: 250 },
			{ columnName: "last_name", width: 250 },
			{ columnName: "job_title", width: 150 },
		];

		//default sorting
		let defaultSorting = [];

		//column initilization and alignment
		let tableColumnExtensions = [
			{ columnName: "email", align: COLUMN_ALIGN_LEFT },
			{ columnName: "title", align: COLUMN_ALIGN_LEFT },
			{ columnName: "first_name", align: COLUMN_ALIGN_LEFT },
			{ columnName: "last_name", align: COLUMN_ALIGN_LEFT },
			{ columnName: "job_title", align: COLUMN_ALIGN_LEFT },
		];

		//default disable column for sorting
		let sortingStateColumnExtensions = [
			{ columnName: "email", sortingEnabled: false },
			{ columnName: "title", sortingEnabled: false },
			{ columnName: "first_name", sortingEnabled: false },
			{ columnName: "last_name", sortingEnabled: false },
			{ columnName: "job_title", sortingEnabled: false },
		];

		//for set fixed column
		let leftColumns = ["email"];
		let rightColumns = ["job_title"];
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
