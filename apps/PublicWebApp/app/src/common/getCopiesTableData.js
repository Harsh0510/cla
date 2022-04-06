import React from "react";
import TableEditLink from "../widgets/TableEditLink";
//set the defualt behaviour of column header
const COLUMN_ALIGN_LEFT_LEFT = "left";
const COLUMN_ALIGN_CENTER = "center";

/**
 * getCopiesTableData return the object with props for dispaly the content in GridTable
 * This used for display the copies detail on Title Details page, PopUp and Page selection option page
 * @param {copiesData} data
 * @param {copies data page_count} unfiltered_count
 */
export default function (data, unfiltered_count, sortField, sort_dir) {
	let tableProps = null;
	if (data && data.length > 0 && unfiltered_count > 0) {
		//declare columns
		let columns = [
			{ name: "teacher", title: "User" },
			{ name: "title", title: "Copy name" },
			{ name: "course_name", title: "Class" },
			{ name: "year_group", title: "Year" },
			{ name: "page_count", title: "Pages" },
			{ name: "date_created", title: "Created on" },
			{ name: "date_expired", title: "Expiry date" },
			{ name: "status", title: "Status" },
			{ name: "share", title: "Edit / Share" },
		];

		//arrange the column records
		const tableRows = data.map((row) => {
			row.teacher = row.teacher;
			row.title = row.title;
			row.course_name = row.course_name;
			row.year_group = row.year_group;
			row.page_count = row.page_count;
			row.date_created = row.date_created;
			row.date_expired = row.date_expired;
			row.status = row.status;
			row.share = (
				<TableEditLink to={`/profile/management/${row.oid}`}>
					<i className="fal fa fa-edit" />
				</TableEditLink>
			);
			return row;
		});

		//column resizing
		let defaultColumnWidths = [
			{ columnName: "teacher", width: 200 },
			{ columnName: "title", width: 350 },
			{ columnName: "course_name", width: 100 },
			{ columnName: "year_group", width: 85 },
			{ columnName: "page_count", width: 55 },
			{ columnName: "date_created", width: 120 },
			{ columnName: "date_expired", width: 120 },
			{ columnName: "status", width: 100 },
			{ columnName: "share", width: 80 },
		];

		//default sorting
		let defaultSorting = [{ columnName: sortField, direction: sort_dir === "A" ? "asc" : "desc" }];

		//column initilization and alignment
		let tableColumnExtensions = [
			{ columnName: "teacher", align: COLUMN_ALIGN_LEFT_LEFT },
			{ columnName: "title", align: COLUMN_ALIGN_LEFT_LEFT },
			{ columnName: "course_name", align: COLUMN_ALIGN_LEFT_LEFT },
			{ columnName: "year_group", align: COLUMN_ALIGN_LEFT_LEFT },
			{ columnName: "page_count", align: COLUMN_ALIGN_LEFT_LEFT },
			{ columnName: "date_created", align: COLUMN_ALIGN_LEFT_LEFT },
			{ columnName: "date_expired", align: COLUMN_ALIGN_LEFT_LEFT },
			{ columnName: "status", align: COLUMN_ALIGN_LEFT_LEFT },
			{ columnName: "share", align: COLUMN_ALIGN_CENTER },
		];

		//default disable column for sorting
		let sortingStateColumnExtensions = [
			{ columnName: "status", sortingEnabled: false },
			{ columnName: "share", sortingEnabled: false },
		];
		//for set fixed column
		let leftColumns = ["teacher"];
		let rightColumns = ["share"];
		//date type column names
		let dateColumnsName = ["date_created", "date_expired"];

		tableProps = {
			unfiltered_count: unfiltered_count,
			columns: columns,
			tableRows: tableRows,
			defaultColumnWidths: defaultColumnWidths,
			tableColumnExtensions: tableColumnExtensions,
			defaultSorting: defaultSorting,
			sortingStateColumnExtensions: sortingStateColumnExtensions,
			loading: false,
			leftColumns: leftColumns,
			rightColumns: rightColumns,
			dateColumnsName: dateColumnsName,
		};
	}
	return tableProps;
}
