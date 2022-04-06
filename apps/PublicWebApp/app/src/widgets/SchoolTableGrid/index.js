import React from "react";
import styled from "styled-components";
import TableGrid from "../TableGrid";
import TableGridFooter from "../TableGridFooter";
import AdminPageMessage from "../AdminPageMessage";
import Loader from "../Loader";
import TableEditLink from "../../widgets/TableEditLink";

const PAGE_NEIGHBOUR_LIMIT = 3;

//set the defualt behaviour of column header
const COLUMN_ALIGN_LEFT = "left";
const COLUMN_ALIGN_RIGHT = "right";
const COLUMN_ALIGN_CENTER = "center";
const byId = require("../../common/byId");

//get data from controller/app/common
const TERRITORIES = require("../../../../../Controller/app/common/territories");
const SCHOOLLEVELS = require("../../../../../Controller/app/common/school-levels");
const SCHOOLTYPES = require("../../../../../Controller/app/common/school-types");

const SCHOOL_LEVELS_BY_ID = byId(SCHOOLLEVELS);
const SCHOOL_TYPES_BY_ID = byId(SCHOOLTYPES);

const WrapSelectAllCheckBox = styled.div`
	display: flex;
	align-items: center;
	display: block;
`;

const SelectAllCheckBoxInput = styled.input`
	margin-right: 5px;
`;

const SelectAllCheckBoxSmallText = styled.div`
	display: inline;
	font-size: 0.7rem;
	line-height: 1rem;
`;

const SelectAllCheckBoxText = styled.div`
	margin-right: 5px;
`;

const SelectAllCheckBoxInputText = styled.div`
	display: flex;
`;

export default class SchoolTableGrid extends React.PureComponent {
	//** Get Schools binding for display in table grid */
	getSchoolsTableData = (schoolsData) => {
		//declare columns
		const columns = [
			{ name: "name", title: "Name" },
			{ name: "school_level", title: "Level" },
			{ name: "school_type", title: "Type" },
		];

		if (this.props.withRollover || this.props.showIdColumn) {
			columns.unshift({
				name: "id",
				title: "ID",
			});
		}

		if (this.props.withRollover) {
			if (!this.props.isHideSelect) {
				columns.unshift({
					name: "select",
					title: [
						<WrapSelectAllCheckBox>
							{" "}
							<SelectAllCheckBoxText>Select</SelectAllCheckBoxText>
							<SelectAllCheckBoxInputText>
								<SelectAllCheckBoxInput type="checkbox" ref={this.props._selectAllRef} onChange={this.props.onChangeSelectedAllCheckbox} />
								<SelectAllCheckBoxSmallText>ALL</SelectAllCheckBoxSmallText>
							</SelectAllCheckBoxInputText>
						</WrapSelectAllCheckBox>,
					],
				});
			}
			//To do: when we have the territory and last_rollover_date from school-get-all api
			columns.push({ name: "territory", title: "Territory" }, { name: "last_rollover_date", title: "Last rollover date" });
		}
		if (!this.props.withRollover && !this.props.isHideSelect) {
			columns.push({ name: "number_of_students", title: "Number of Students" }, { name: "city", title: "City" }, { name: "action", title: "Edit" });
		}
		const finalColumns = [...columns];

		//arrange the column records
		const rows = schoolsData.map((row) => {
			// duplicate the row object. Do not modify the row object directly
			let newRow = Object.assign({}, row);
			if (newRow.school_level && SCHOOL_LEVELS_BY_ID[newRow.school_level]) {
				newRow.school_level = SCHOOL_LEVELS_BY_ID[newRow.school_level];
			}
			if (newRow.school_type && SCHOOL_TYPES_BY_ID[newRow.school_type]) {
				newRow.school_type = SCHOOL_TYPES_BY_ID[newRow.school_type];
			}

			if (this.props.withRollover && !this.props.isHideSelect) {
				newRow.select = (
					<input
						type="checkbox"
						name={row.id}
						data-school-id={row.id}
						onChange={this.props.onChangeSchoolCheckBox}
						checked={this.props.selectedSchoolIdMap[row.id]}
					/>
				);
				newRow.school_id = row.id;
				newRow.name = (
					<TableEditLink to={`/profile/admin/institutions?action=edit&filter_schools=${row.id}&id=${row.id}`} key={"data_school_id_" + row.id}>
						{newRow.name}
					</TableEditLink>
				);
			} else {
				newRow.action = (
					<TableEditLink to="" onClick={this.props.doOpenEditScreen} data-id={row.id} key={row.id}>
						<i className="fa fa-edit"></i>
					</TableEditLink>
				);
			}
			return newRow;
		});

		//column resizing
		let defaultColumnWidths = [
			{ columnName: "name", width: 630 },
			{ columnName: "school_level", width: 200 },
			{ columnName: "school_type", width: 200 },
			{ columnName: "number_of_students", width: 170 },
			{ columnName: "city", width: 150 },
			{ columnName: "action", width: 150 },
			{ columnName: "select", width: 150 },
			{ columnName: "id", width: 100 },
			{ columnName: "territory", width: 150 },
			{ columnName: "last_rollover_date", width: 300 },
		];

		//default sorting
		const sortDir = this.props.sortDir && this.props.sortDir[0].toUpperCase() === "D" ? "desc" : "asc";
		let defaultSorting = [{ columnName: this.props.sortField, direction: sortDir }];

		//column initilization and alignment
		let tableColumnExtensions = [
			{ columnName: "name", align: COLUMN_ALIGN_LEFT },
			{ columnName: "school_level", align: COLUMN_ALIGN_LEFT },
			{ columnName: "school_type", align: COLUMN_ALIGN_LEFT },
			{ columnName: "number_of_students", align: COLUMN_ALIGN_LEFT },
			{ columnName: "city", align: COLUMN_ALIGN_LEFT },
			{ columnName: "action", align: COLUMN_ALIGN_CENTER },
			{ columnName: "select", align: COLUMN_ALIGN_CENTER },
			{ columnName: "id", align: COLUMN_ALIGN_CENTER },
			{ columnName: "territory", align: COLUMN_ALIGN_LEFT },
			{ columnName: "last_rollover_date", align: COLUMN_ALIGN_LEFT },
		];

		//default disable column for sorting
		let sortingStateColumnExtensions = [
			{ columnName: "action", sortingEnabled: false },
			{ columnName: "select", sortingEnabled: false },
		];

		//for set fixed column
		let leftColumns = this.props.withRollover ? ["select"] : ["name"];
		let rightColumns = this.props.withRollover ? ["school_type"] : ["action"];
		//date type column names
		let dateColumnsName = ["last_rollover_date"];

		return {
			column: finalColumns,
			row: rows,
			resize: defaultColumnWidths,
			tableColumnExtensions: tableColumnExtensions,
			defaultSorting: defaultSorting,
			sortingStateColumnExtensions: sortingStateColumnExtensions,
			loading: false,
			leftColumns: leftColumns,
			rightColumns: rightColumns,
			schoolsLoaded: true,
			schoolsData: schoolsData,
			datetimeColumnsName: dateColumnsName,
		};
	};

	render() {
		const { schoolsData, unfilteredCount, schoolLimit, schoolOffset, loading, schoolsLoaded, doSorting, doPagination } = this.props;
		const selectedSchoolCount = this.props.selectedSchoolIdMap ? Object.keys(this.props.selectedSchoolIdMap).length : 0;
		let schoolTable = <AdminPageMessage> No results found</AdminPageMessage>;
		if (!schoolsLoaded) {
			schoolTable = (
				<AdminPageMessage>
					<Loader />
				</AdminPageMessage>
			);
		}
		const bindSchoolData = this.getSchoolsTableData(schoolsData);
		if (schoolsData !== null && schoolsData.length !== 0) {
			schoolTable = (
				<>
					<TableGrid {...bindSchoolData} doSorting={doSorting} />
					{this.props.selectedSchoolIdMap ? (
						<div>
							You have selected {selectedSchoolCount} {selectedSchoolCount === 1 ? "institution" : "institutions"}
						</div>
					) : null}
					<TableGridFooter
						unfilteredCount={unfilteredCount}
						limit={schoolLimit}
						pageNeighbours={PAGE_NEIGHBOUR_LIMIT}
						doPagination={doPagination}
						currentPage={parseInt(schoolOffset) / Number(schoolLimit) + 1}
						loading={loading}
					/>
				</>
			);
		}
		return schoolTable;
	}
}
