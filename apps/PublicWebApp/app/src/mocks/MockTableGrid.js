import date from "../common/date";

/**
 * Mock Table Grid
 */
export default {
	column: [
		{
			name: "email",
			title: "Email",
		},
		{
			name: "title",
			title: "Title",
		},
		{
			name: "first_name",
			title: "First name",
		},
		{
			name: "last_name",
			title: "Last name",
		},
		{
			name: "role",
			title: "Role",
		},
		{
			name: "createdDate",
			title: "created Date",
		},
	],
	row: [
		{
			school_id: 1,
			school_name: "CLA School A",
			title: "Mr",
			first_name: "tfa5name",
			last_name: "tla5name",
			email: "teachera5@email.com",
			is_pending_approval: false,
			is_activated: true,
			role: "teacher",
			createdDate: "2019-01-03T17:42:10.011Z",
			has_read: true,
		},
		{
			school_id: 1,
			school_name: "CLA School A",
			title: "Mr",
			first_name: "tfa5name",
			last_name: "tla5name",
			email: "teachera5@email.com",
			is_pending_approval: false,
			is_activated: true,
			role: "teacher",
			createdDate: "2019-01-03T17:42:10.011Z",
		},
	],
	resize: [
		{
			columnName: "email",
			width: 450,
		},
		{
			columnName: "title",
			width: 100,
		},
		{
			columnName: "first_name",
			width: 300,
		},
		{
			columnName: "last_name",
			width: 300,
		},
		{
			columnName: "role",
			width: 200,
		},
		{
			columnName: "createdDate",
			width: 200,
		},
	],
	tableColumnExtensions: [
		{
			columnName: "email",
			align: "left",
		},
		{
			columnName: "title",
			align: "left",
		},
		{
			columnName: "first_name",
			align: "left",
		},
		{
			columnName: "last_name",
			align: "left",
		},
		{
			columnName: "role",
			align: "left",
		},
		{
			columnName: "createdDate",
			align: "left",
		},
	],
	defaultSorting: [
		{
			columnName: "email",
			direction: "asc",
		},
	],
	sortingStateColumnExtensions: [
		{
			columnName: "role",
			sortingEnabled: false,
		},
	],
	loading: false,
	leftColumns: ["email"],
	rightColumns: ["role"],
	dateColumnsName: [],
};
