import React from "react";
import UserActions from "./UserActions";
import TableGrid from "../../widgets/TableGrid";
import Pagination from "../../widgets/Pagination";
import styled, { css } from "styled-components";
import UserRole from "../../common/UserRole";
import TableGridFooter from "../../widgets/TableGridFooter";

//set the defualt behaviour of column header
const COLUMN_ALIGN_LEFT = "left";
const COLUMN_ALIGN_CENTER = "center";

/* --- This is Userstatus constant to display it's value --- */
const userStatus = Object.create(null);
userStatus.approved = "Approved";
userStatus.pending = "Pending";
userStatus.unverified = "Unverified";

export default function UserList(props) {
	//declare columns
	const columns = [
		{ name: "email", title: "Email" },
		{ name: "first_name", title: "First name" },
		{ name: "last_name", title: "Last name" },
		{ name: "status", title: "Status" },
		{ name: "date", title: "Date" },
		{ name: "action", title: "Actions" },
	];

	//Add school column for cla-admin user
	if (props.userRole === UserRole.claAdmin) {
		columns.unshift({ name: "school_id", title: "Institution ID" }, { name: "school", title: "Institution" });
		columns.splice(
			columns.findIndex((c) => c.name === "status"),
			0,
			{
				name: "trusted_domain",
				title: "Trusted domain?",
			}
		);
	}
	//arrange the column records
	const rows = props.userData.map((item) => {
		const row = {};
		row.email = item.email;
		row.first_name = item.first_name;
		row.last_name = item.last_name;
		if (item.status) {
			row.status = userStatus[item.status];
		} else {
			row.status = "";
		}
		if (props.userRole === UserRole.claAdmin) {
			row.trusted_domain = item.trusted_domain ? "Y" : "N";
		}
		row.date = item.date ? item.date : null;
		if (props.userRole === UserRole.claAdmin) {
			row.school_id = item.school_id;
			row.school = item.school_name;
		}

		row.action = (
			<UserActions
				approvingOid={props.approvingOid}
				email={item.email}
				status={row.status}
				isPasswordSet={item.is_password_set}
				doCompleteApprove={props.doCompleteApprove}
				doDismissApprove={props.doDismissApprove}
				doInitApprove={props.doInitApprove}
				doReject={props.doReject}
				doResendVerify={props.doResendVerify}
				doResendSetPassword={props.doResendSetPassword}
				userRole={props.UserRole}
			/>
		);

		return row;
	});

	//column resizing
	const DATE_COLUMN_INDEX = 4; // Modify this column index when no of column changes for table
	let defaultColumnWidths = [
		{ columnName: "email", width: 350 },
		{ columnName: "first_name", width: 150 },
		{ columnName: "last_name", width: 150 },
		{ columnName: "status", width: 150 },
		{ columnName: "date", width: 150 },
		{ columnName: "action", width: 300 },
	];

	//Add school column for cla-admin user
	if (props.userRole === UserRole.claAdmin) {
		defaultColumnWidths[0].width = 300;
		defaultColumnWidths[DATE_COLUMN_INDEX].width = 400;
		defaultColumnWidths.unshift({ columnName: "school_id", width: 150 }, { columnName: "school", width: 200 });
		defaultColumnWidths.splice(
			defaultColumnWidths.findIndex((c) => c.name === "status"),
			0,
			{
				columnName: "trusted_domain",
				width: 150,
			}
		);
	}

	//default sorting
	let defaultSorting = [
		{
			columnName: props.sort_field,
			direction: props.sort_dir === "A" ? "asc" : "desc",
		},
	];

	//column initilization and alignment
	let tableColumnExtensions = [
		{ columnName: "email", align: COLUMN_ALIGN_LEFT },
		{ columnName: "first_name", align: COLUMN_ALIGN_LEFT },
		{ columnName: "last_name", align: COLUMN_ALIGN_LEFT },
		{ columnName: "status", align: COLUMN_ALIGN_LEFT },
		{ columnName: "date", align: COLUMN_ALIGN_LEFT },
		{ columnName: "action", align: COLUMN_ALIGN_CENTER },
	];

	//Add school column for cla-admin user
	if (props.userRole === UserRole.claAdmin) {
		tableColumnExtensions.unshift({ columnName: "school_id", align: COLUMN_ALIGN_LEFT }, { columnName: "school", align: COLUMN_ALIGN_LEFT });
		tableColumnExtensions.splice(
			tableColumnExtensions.findIndex((c) => c.name === "status"),
			0,
			{
				columnName: "trusted_domain",
				align: COLUMN_ALIGN_LEFT,
			}
		);
	}

	//default disable column for sorting
	let sortingStateColumnExtensions = [{ columnName: "action", sortingEnabled: false }];

	//date type column names
	let dateColumnsName = ["date"];

	return (
		<>
			<TableGrid
				column={columns}
				row={rows}
				resize={defaultColumnWidths}
				tableColumnExtensions={tableColumnExtensions}
				defaultSorting={defaultSorting}
				sortingStateColumnExtensions={sortingStateColumnExtensions}
				doSorting={props.doSorting}
				loading={false}
				dateColumnsName={dateColumnsName}
			/>
			<TableGridFooter
				unfilteredCount={props.unfilteredCount}
				limit={props.limit}
				pageNeighbours={3}
				doPagination={props.doPagination}
				currentPage={parseInt(props.offset) / Number(props.limit) + 1}
				loading={false}
			/>
		</>
	);
}
