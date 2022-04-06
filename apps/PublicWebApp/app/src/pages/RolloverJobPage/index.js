import React from "react";
import styled from "styled-components";
import moment from "moment";
import withAdminAuthRequiredConsumer from "../../common/withAdminAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import Header from "../../widgets/Header";
import queryString from "query-string";
import TableGrid from "../../widgets/TableGrid";
import TableGridFooter from "../../widgets/TableGridFooter";
import Loader from "../../widgets/Loader";
import userDidChange from "../../common/userDidChange";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import AdminPageWrap from "../../widgets/AdminPageWrap";
import smoothScrollTo from "../../common/smoothScroll";
import TableEditLink from "../../widgets/TableEditLink";
import { PageDetail, Button, SearchSectionOne, SectionHalf, WrapperDiv } from "../../widgets/AdminStyleComponents";
import AdminPageMessage from "../../widgets/AdminPageMessage";
import SearchFilters from "./SearchFilters";
import getSearchFilterText from "../../common/getSearchFilterText";
import AdminPageFilterMessage from "../../widgets/AdminPageFilterMessage";
import RolloverJobAddEdit from "./RolloverJobAddEdit";
import date from "../../common/date";
import reactCreateRef from "../../common/reactCreateRef";

//set the defualt behaviour of column header
const COLUMN_ALIGN_LEFT = "left";

const ACTION_LIST = "list";
const ACTION_NEW = "new";
const ACTION_ADDED = "added";
const ACTION_EDIT = "edit";
const JUMP_TO_CONTENT_ID = "main-content";
const URL_ROLLOVER_JOB = "/profile/admin/rollover-management?";

const ButtonText = styled.span`
	margin-left: 0.5rem;
`;

const getDateFormat = (dt) => {
	return moment(dt).format("YYYY-MM-DD HH:mm");
};

/* This constant is used for showing filter text */
const AVAILABLE_FILTERS = [
	{ name: "Status", stateKey: "selectedStatus" },
	{ name: "Date created (begin)", stateKey: "selectedDateCreatedBegin", format: getDateFormat },
	{ name: "Date created (end)", stateKey: "selectedDateCreatedEnd", format: getDateFormat },
];

const areArraysIdentical = (arrA, arrB) => {
	const len = arrA.length;
	if (len !== arrB.length) {
		return false;
	}
	for (let i = 0; i < len; ++i) {
		if (arrA[i] !== arrB[i]) {
			return false;
		}
	}
	return true;
};

export default withAdminAuthRequiredConsumer(
	{ "cla-admin": true },
	withApiConsumer(
		class RolloverJobPage extends React.PureComponent {
			constructor(props) {
				super(props);
				this.state = {
					limit: 10,
					offset: 0,
					sort_field: "target_execution_date",
					sort_dir: "desc",
					query: "",
					loading: true,
					rolloverJobLoaded: false,
					unfiltered_count: 0,
					rolloverJobData: [],
					action: ACTION_LIST,
					message: null,
					filters: null,
					fields: {
						id: 0,
						target_execution_date: null,
						name: "",
						status: "",
					},
					statusData: null,
					selectedStatus: [],
					selectedDateCreatedBegin: null,
					selectedDateCreatedEnd: null,
					hasSelectedAllSchools: false,
					selectedSchoolIds: [],
					selectedSchoolIdMap: Object.create(null),
					school_query: "",
					school_filter: {},
					id: "",
					currentSelectedRolloverJobData: null,
					setOption: {
						value: "",
						label: "",
						key: "",
					},
					searchFilterText: null,
					loadingRolloverJob: false,
					isResetSchoolFilter: false,
				};
				this.resetAll = this.resetAll.bind(this);
				this.handlefilterSelection = this.handlefilterSelection.bind(this);
				this.onChangeSchoolCheckBox = this.onChangeSchoolCheckBox.bind(this);
				this.onChangeSelectedAllCheckbox = this.onChangeSelectedAllCheckbox.bind(this);
				this._selectAllRef = reactCreateRef();
				this._refForm = reactCreateRef();
				this._refCreateNew = reactCreateRef();
			}

			componentDidMount() {
				this.fetchFilters();
				this.updateState();
			}

			componentDidUpdate(prevProps, prevState) {
				//check if userDetails update
				if (userDidChange(this.props, prevProps)) {
					this.fetchFilters();
				}

				if (this.props.location.search !== prevProps.location.search) {
					this.updateState();
				}

				if ((this.state.action === ACTION_NEW || this.state.action === ACTION_EDIT) && prevState.action !== this.state.action) {
					setTimeout(() => {
						this._refForm.current.scrollIntoView();
					}, 500);
				}
			}

			resetFields() {
				const fields = {
					id: 0,
					target_execution_date: null,
					name: "",
					status: "",
				};
				this.setState({ fields: fields, selectedSchoolIds: [], selectedSchoolIdMap: {}, hasSelectedAllSchools: false, message: null });
			}

			updateState() {
				if (this.state.filters) {
					const parsed = queryString.parse(this.props.location.search);
					let limit = parseInt(parsed.limit || this.state.limit, 10);
					if (limit < 1) {
						limit = 1;
					}
					let offset = parseInt(parsed.offset || this.state.offset, 10);
					if (offset < 0) {
						offset = 0;
					}
					let action = parsed.action || this.state.action;
					let id = parsed.id !== undefined ? parsed.id : this.state.id;
					let sortField = parsed.sort_field || this.state.sort_field;
					let sortDir = parsed.sort_dir || this.state.sort_dir;
					let query = parsed.query || "";

					const newState = {
						limit: limit,
						offset: offset,
						action: action,
						id: id,
						sort_field: sortField,
						sort_dir: sortDir,
						query: query,
						selected: {},
					};

					for (const filter of this.state.filters) {
						newState.selected[filter.id] = [];
					}

					if (parsed.filter_status) {
						newState.selected.status = parsed.filter_status.split(",");
						delete parsed.filter_status;
					}
					if (parsed.filter_date_created_begin) {
						newState.selected.date_created_begin = parseInt(parsed.filter_date_created_begin, 10);
						newState.selectedDateCreatedBegin = newState.selected.date_created_begin;
						delete parsed.filter_date_created_begin;
					}
					if (parsed.filter_date_created_end) {
						newState.selected.date_created_end = parseInt(parsed.filter_date_created_end, 10);
						newState.selectedDateCreatedEnd = newState.selected.date_created_end;
						delete parsed.filter_date_created_end;
					}

					//check the selected status value and if extis then store in state value
					if (newState.selected.hasOwnProperty("status") && Array.isArray(newState.selected.status) && newState.selected.status.length > 0) {
						let arr = newState.selected.status;
						let bindSelectedStatus = this.state.statusData.filter((d) => arr.some((s) => s === d.value));
						newState.selectedStatus = bindSelectedStatus;
					}

					this.setState(newState, this.performQuery);
				}
			}

			getSelectedFilters = () => {
				let selected_filters = [];
				AVAILABLE_FILTERS.map((filter) => {
					if (this.state[filter.stateKey] && this.state[filter.stateKey].length) {
						let obj = Object.create(null);
						obj.filter = filter.name;
						obj.values = this.state[filter.stateKey].map((filterState) => {
							return filterState.label;
						});
						selected_filters.push(obj);
					}
				});
				return selected_filters;
			};

			/**
			 * Get Rollover Job information
			 */
			performQuery() {
				this.props
					.api("/admin/rollover-job-get-all", {
						limit: this.state.limit,
						offset: this.state.offset,
						sort_field: this.state.sort_field,
						sort_direction: this.state.sort_dir,
						query: this.state.query,
						filter: this.state.selected,
					})
					.then((result) => {
						let selected_Filter = this.getSelectedFilters();
						let searchFilterText = getSearchFilterText(
							this.state.limit,
							this.state.offset,
							this.state.query,
							selected_Filter,
							result.unfiltered_count
						);
						this.setState({
							rolloverJobLoaded: true,
							searchFilterText: searchFilterText,
							rolloverJobData: result.data,
							unfiltered_count: result.unfiltered_count,
							loading: false,
						});
						const fields = Object.assign({}, this.state.fields);
						let rolloverJobDetails;
						if (this.state.action == ACTION_NEW || this.state.action == ACTION_ADDED) {
							this.setState({
								fields: fields,
								loadingRolloverJob: false,
							});
						} else if (
							this.state.action == ACTION_EDIT &&
							this.state.id &&
							(rolloverJobDetails = result.data.find((row) => row.id === parseInt(this.state.id)))
						) {
							fields.id = rolloverJobDetails.id;
							fields.name = rolloverJobDetails.name;
							const date1 = new Date(rolloverJobDetails.target_execution_date);
							fields.target_execution_date = date.getEncodedDate(date1);
							fields.status = rolloverJobDetails.status;
							let newSelectedSchoolIdMap = { ...this.state.selectedSchoolIdMap };
							const selectedSchoolIds = rolloverJobDetails.rollover_job_school_ids;
							for (const schoolId of selectedSchoolIds) {
								if (!newSelectedSchoolIdMap[schoolId]) {
									newSelectedSchoolIdMap[schoolId] = true;
								}
							}
							fields.selectedSchoolIds = selectedSchoolIds;
							this.setState({
								loadingRolloverJob: false,
								fields: fields,
								selectedSchoolIds: selectedSchoolIds,
								currentSelectedRolloverJobData: fields,
								selectedSchoolIdMap: newSelectedSchoolIdMap,
							});
						}
					})
					.catch((err) => {
						this.setState({ message: err.toString(), rolloverJobLoaded: true });
					});
			}

			doOpenEditScreen = (e) => {
				e.preventDefault();
				const id = e.currentTarget.getAttribute("data-id");
				if (this.state.fields.id != id) {
					this.resetFields();
					this.setState(
						{
							loadingRolloverJob: true,
						},
						() => {
							this.pushHistory({
								id: id,
								action: ACTION_EDIT,
							});
						}
					);
				} else {
					this.setState({
						message: null,
					});
				}
			};

			rolloverJobTableData = (rolloverJobData, unfiltered_count) => {
				//declare columns
				const columns = [
					{ name: "id", title: "ID" },
					{ name: "name", title: "Name" },
					{ name: "target_execution_date", title: "Rollover date" },
					{ name: "status", title: "Status" },
					{ name: "school_count", title: "Institution count" },
				];

				//arrange the column records
				const rows = rolloverJobData.map((row) => {
					// duplicate the row object. Do not modify the row object directly
					const newRow = Object.assign({}, row);
					newRow.name = (
						<TableEditLink to="" onClick={this.doOpenEditScreen} data-id={row.id}>
							{row.name}
						</TableEditLink>
					);
					newRow.school_count = row.rollover_job_school_ids.length;
					return newRow;
				});
				//column resizing
				const defaultColumnWidths = [
					{ columnName: "id", width: 100 },
					{ columnName: "name", width: 350 },
					{ columnName: "target_execution_date", width: 200 },
					{ columnName: "status", width: 200 },
					{ columnName: "school_count", width: 200 },
				];

				//default sorting
				const defaultSorting = [
					{
						columnName: this.state.sort_field,
						direction: this.state.sort_dir && this.state.sort_dir.toUpperCase()[0] === "D" ? "desc" : "asc",
					},
				];

				//column initilization and alignment
				const tableColumnExtensions = [
					{ columnName: "id", align: COLUMN_ALIGN_LEFT },
					{ columnName: "name", align: COLUMN_ALIGN_LEFT },
					{ columnName: "target_execution_date", align: COLUMN_ALIGN_LEFT },
					{ columnName: "status", align: COLUMN_ALIGN_LEFT },
					{ columnName: "school_count", align: COLUMN_ALIGN_LEFT },
				];
				const rightColumns = ["status"];
				//date type column names
				const dateColumnsName = ["target_execution_date"];

				const sortingStateColumnExtensions = [{ columnName: "school_count", sortingEnabled: false }];

				return {
					unfiltered_count: unfiltered_count,
					column: columns,
					row: rows,
					resize: defaultColumnWidths,
					tableColumnExtensions: tableColumnExtensions,
					sortingStateColumnExtensions: sortingStateColumnExtensions,
					defaultSorting: defaultSorting,
					rightColumns: rightColumns,
					datetimeColumnsName: dateColumnsName,
					loading: this.state.loading,
				};
			};

			/**
			 * get query string
			 */
			getQueryString(extra) {
				const obj = {
					limit: this.state.limit,
					offset: this.state.offset,
					action: this.state.action,
					id: this.state.id,
					sort_field: this.state.sort_field,
					sort_dir: this.state.sort_dir,
					query: this.state.query,
				};

				// if selectedStatus extis in the query
				if (extra.hasOwnProperty("selectedStatus") && Array.isArray(extra.selectedStatus) && extra.selectedStatus.length > 0) {
					let status = [];
					for (const item of extra.selectedStatus) {
						status.push(item.value);
					}
					obj["filter_status"] = status.join(",");
					delete extra.selectedStatus;
				}
				if (extra.hasOwnProperty("selectedDateCreatedBegin")) {
					obj.filter_date_created_begin = extra.selectedDateCreatedBegin;
					delete extra.selectedDateCreatedBegin;
				}
				if (extra.hasOwnProperty("selectedDateCreatedEnd")) {
					obj.filter_date_created_end = extra.selectedDateCreatedEnd;
					delete extra.selectedDateCreatedEnd;
				}

				Object.assign(obj, extra || {});
				return queryString.stringify(obj);
			}

			/**
			 * Push history
			 */
			pushHistory(extra) {
				const url = URL_ROLLOVER_JOB + this.getQueryString(extra);
				this.props.history.push(url);
			}

			pushQueryString = (queryUrl, hasSelectedAll) => {
				this.setState(
					{
						hasSelectedAllSchools: hasSelectedAll,
						isResetSchoolFilter: false,
					},
					() => {
						const url = URL_ROLLOVER_JOB + this.getQueryString({}) + "&" + queryUrl;
						this.props.history.push(url);
					}
				);
			};

			/**
			 * Handles the pagination page
			 */

			doPagination = (page, limit) => {
				const currentPage = page == 0 ? 0 : page - 1;
				const setOffset = currentPage * limit;
				const setLimit = limit;

				this.setState({ offset: setOffset, limit: setLimit });
				this.pushHistory({
					offset: setOffset,
					action: ACTION_LIST,
					limit: setLimit,
					id: null,
				});
			};

			/**
			 * Handles the sorting data
			 */
			doSorting = (sorting) => {
				const columnSorting = sorting[0];
				const sortDirectionString = columnSorting.direction[0].toUpperCase();
				this.setState({ loading: true });
				this.pushHistory({
					sort_field: columnSorting.columnName,
					sort_dir: sortDirectionString,
					offset: 0,
				});
			};

			createRolloverJob = () => {
				this.resetFields();
				this.setState(
					{
						query: "",
						selectedStatus: [],
						selectedDateCreatedBegin: null,
						selectedDateCreatedEnd: null,
					},
					() => {
						this.pushHistory({
							action: ACTION_NEW,
							id: null,
						});
					}
				);
			};

			handleNameInputField = (inputFieldValue, inputFieldName) => {
				let fields = Object.assign({}, this.state.fields);
				fields[inputFieldName] = inputFieldValue;
				this.setState({ fields: fields });
			};

			saveSchoolSearchFiter = (data) => {
				this.setState(
					{
						school_query: data.school_query,
						school_filter: data.school_filter,
					},
					() => {
						if (this._selectAllRef.current) {
							this._selectAllRef.current.checked = this.state.hasSelectedAllSchools;
						}
					}
				);
			};

			doSearch = () => {
				this.setState({ message: null });
				this.pushHistory({
					query: this.state.query,
					offset: 0,
					action: ACTION_LIST,
					id: null,
					selectedStatus: this.state.selectedStatus,
					selectedDateCreatedBegin: this.state.selectedDateCreatedBegin,
					selectedDateCreatedEnd: this.state.selectedDateCreatedEnd,
				});
			};

			deleteRolloverJob = () => {
				this.setState({ loadingRolloverJob: true });
				this.props
					.api("/admin/rollover-job-delete", { id: parseInt(this.state.id) })
					.then((result) => {
						if (result.result) {
							this.setState({
								message: "Rollover Job deleted successfully",
								loadingRolloverJob: false,
							});
							if (this.state.offset >= this.state.unfiltered_count - 1) {
								this.setState({ offset: 0 });
							}
							if (this.state.action === ACTION_EDIT) {
								this.pushHistory({
									query: this.state.query,
									offset: this.state.offset,
									action: ACTION_LIST,
									id: null,
									selectedStatus: this.state.selectedStatus,
									selectedDateCreatedBegin: this.state.selectedDateCreatedBegin,
									selectedDateCreatedEnd: this.state.selectedDateCreatedEnd,
								});
							} else {
								this.pushHistory({
									action: ACTION_NEW,
									id: null,
								});
							}
						}
					})
					.catch((result) => {
						this.setState({ message: result.toString() });
					});
			};

			/**
			 * Close the User Add/Edit
			 */
			cancelAddEdit = () => {
				this.resetFields();
				smoothScrollTo(document.querySelector("body"));
				this.pushHistory({
					action: ACTION_LIST,
					id: null,
				});
			};

			fetchFilters() {
				this.props
					.api("/admin/rollover-job-get-filters")
					.then((result) => {
						let resultFilter = result.result;
						let filters = [];
						let statusData;
						/** bind the filter data */
						for (const item in resultFilter) {
							filters.push(resultFilter[item]);
						}
						//bind filters group data according to user role
						if (filters) {
							let statusArray = filters.find((filter) => filter.id === "status");
							statusData = statusArray ? this.arrayMapping(statusArray.data) : null;
						}
						this.setState(
							{
								filters: filters,
								statusData: statusData,
							},
							this.updateState
						);
					})
					.catch((err) => {
						this.setState({
							message: err.toString(),
						});
					});
			}

			handleSubmit = (data) => {
				const targetExecutionDate = new Date(data.target_execution_date);
				const rolloverDate = date.jsDateTimeToNiceFormat(targetExecutionDate);
				const rolloverJobName = data.name.toString().trim().replace(/\s\s+/g, " ");
				this.setState({ loadingRolloverJob: true });
				if (this.state.action == ACTION_NEW || this.state.action == ACTION_ADDED) {
					const params = {
						name: rolloverJobName,
						rollover_job_selected_schools: this.state.selectedSchoolIds,
						target_execution_date: date.getEncodedDate(targetExecutionDate),
					};

					//TODO: When API done just remove comment
					this.props
						.api("/admin/rollover-job-create", params)
						.then((result) => {
							if (result.success) {
								this.setState({
									message: "Rollover for '" + rolloverJobName + "' has been scheduled. Rollover will happen on " + rolloverDate + ".",
									loadingRolloverJob: false,
									fields: {
										id: 0,
										target_execution_date: null,
										name: "",
										status: "",
									},
									selectedSchoolIdMap: {},
									selectedSchoolIds: [],
									hasSelectedAllSchools: false,
								});
								if (this.state.action === ACTION_NEW) {
									this.setState({ isResetSchoolFilter: true, action: ACTION_ADDED });
								} else {
									this.setState({ isResetSchoolFilter: true, action: ACTION_NEW });
								}
							}
						})
						.catch((result) => {
							this.setState({ message: result.toString(), loadingRolloverJob: false });
						});
				} else if (this.state.action == ACTION_EDIT && this.state.currentSelectedRolloverJobData) {
					const params = this.getFieldValuesForUpdate(this.state.currentSelectedRolloverJobData, data);
					this.props
						.api("/admin/rollover-job-update", params)
						.then((result) => {
							if (result.result) {
								this.setState({
									message: "Successfully updated",
									loadingRolloverJob: false,
								});
								this.performQuery();
							} else {
								this.setState({
									message: "Record not updated",
								});
							}
						})
						.catch((result) => {
							this.setState({ message: result.toString(), loadingRolloverJob: false });
						});
				}
			};

			/**
			 * Get fileds which require need to be update
			 * @param {object} currentSelectedRolloverJobData existing class value
			 * @param {object} updatedRolloverJobDetail User Updated class Detail values
			 */
			getFieldValuesForUpdate = (currentSelectedRolloverJobData, updatedRolloverJobDetail) => {
				let params = Object.create(null);

				if (currentSelectedRolloverJobData.name != (updatedRolloverJobDetail.name || "").toString().trim().replace(/\s\s+/g, " ")) {
					params.name = updatedRolloverJobDetail.name || "";
				}

				const targetExecutionDate = new Date(updatedRolloverJobDetail.target_execution_date);
				const encodedTargetExecutionDate = date.getEncodedDate(targetExecutionDate);
				if (currentSelectedRolloverJobData.target_execution_date != encodedTargetExecutionDate) {
					params.target_execution_date = encodedTargetExecutionDate;
				}

				const selectedSchoolIds = this.state.selectedSchoolIds.map((s) => parseInt(s, 10)).sort((a, b) => a - b);
				const currentSchoolIds = currentSelectedRolloverJobData.selectedSchoolIds.sort((a, b) => a - b);

				if (!areArraysIdentical(currentSchoolIds, selectedSchoolIds)) {
					params.rollover_job_selected_schools = selectedSchoolIds;
				}

				params.id = parseInt(this.state.id, 10);

				return params;
			};

			/** fill the state new value */
			handlefilterSelection = (selected, filterName) => {
				//bind new filter data of school and examboard
				switch (filterName.toLowerCase()) {
					case "status":
						this.setState({ selectedStatus: selected });
						break;
					case "date_created_begin":
						this.setState({ selectedDateCreatedBegin: selected });
						break;
					case "date_created_end":
						this.setState({ selectedDateCreatedEnd: selected });
						break;
					case "query":
						this.setState({ query: selected });
						break;
				}
			};

			onChangeSelectedAllCheckbox = () => {
				const params = {
					query: this.state.school_query,
					filter: this.state.school_filter,
					rollover_job_id: this.state.fields.id || 0,
				};
				let hasSelectAll = this.state.hasSelectedAllSchools;
				this.props.api("/admin/school-get-ids", params).then((result) => {
					const searchedSchoolIds = result || [];
					let newSelectedSchoolIdMap = { ...this.state.selectedSchoolIdMap };
					if (!hasSelectAll) {
						for (const schoolId of searchedSchoolIds) {
							if (!newSelectedSchoolIdMap[schoolId]) {
								newSelectedSchoolIdMap[schoolId] = true;
							}
						}
					} else {
						for (const schoolId of searchedSchoolIds) {
							if (newSelectedSchoolIdMap[schoolId]) {
								delete newSelectedSchoolIdMap[schoolId];
							}
						}
					}
					this.updateSelectSchoolState(newSelectedSchoolIdMap, !this.state.hasSelectedAllSchools);
				});
			};

			onChangeSchoolCheckBox = (e) => {
				const schoolId = e.currentTarget.getAttribute("data-school-id");
				let newSelectedSchoolIdMap = { ...this.state.selectedSchoolIdMap };
				if (newSelectedSchoolIdMap[schoolId]) {
					delete newSelectedSchoolIdMap[schoolId];
				} else {
					newSelectedSchoolIdMap[schoolId] = true;
				}
				this.updateSelectSchoolState(newSelectedSchoolIdMap, this.state.hasSelectedAllSchools);
			};

			updateSelectSchoolState = (newSelectedSchoolIdMap, hasSelectedAll) => {
				const selectedSchools = Object.keys(newSelectedSchoolIdMap);
				this.setState(
					{
						selectedSchoolIds: selectedSchools,
						selectedSchoolIdMap: newSelectedSchoolIdMap,
						hasSelectedAllSchools: hasSelectedAll,
					},
					() => {
						this._selectAllRef.current.checked = this.state.hasSelectedAllSchools;
					}
				);
			};

			/** Mapping array for filter dropdown  */
			arrayMapping(arrayData) {
				let arr = [];
				arrayData.map((item) => {
					const data = Object.assign({}, this.state.setOption);
					data.value = item.id;
					data.label = item.title;
					data.key = item.id;
					arr.push(data);
				});
				return arr;
			}

			resetAll() {
				this.setState({
					query: "",
					selectedStatus: [],
					selectedDateCreatedBegin: null,
					selectedDateCreatedEnd: null,
					message: null,
				});
				this.pushHistory({
					query: "",
					offset: 0,
					action: ACTION_LIST,
					id: null,
					selectedStatus: [],
					selectedDateCreatedBegin: null,
					selectedDateCreatedEnd: null,
				});
			}

			setLoadingRolloverJob = (isLoader) => {
				this.setState({ loadingRolloverJob: isLoader });
			};

			render() {
				const { fields, message } = this.state;
				const filtersLength = this.state.filters ? this.state.filters.length : 0;
				let rolloverJobTable = <AdminPageMessage> No results found</AdminPageMessage>;
				let rolloverJobForm = "";
				if (!this.state.rolloverJobLoaded) {
					rolloverJobTable = (
						<AdminPageMessage>
							<Loader />
						</AdminPageMessage>
					);
				}
				if (this.state.rolloverJobData !== null && this.state.rolloverJobData.length !== 0) {
					let rolloverJobProps = this.rolloverJobTableData(this.state.rolloverJobData, this.state.unfiltered_count);

					rolloverJobTable = (
						<>
							<TableGrid {...rolloverJobProps} doSorting={this.doSorting} showColumnSelector={true} />

							<TableGridFooter
								unfilteredCount={this.state.unfiltered_count}
								limit={this.state.limit}
								pageNeighbours={3}
								doPagination={this.doPagination}
								currentPage={parseInt(this.state.offset) / Number(this.state.limit) + 1}
							/>
						</>
					);
				}

				if (this.state.action === ACTION_NEW || this.state.action === ACTION_EDIT || this.state.action === ACTION_ADDED) {
					rolloverJobForm = (
						<RolloverJobAddEdit
							key={fields.id || "__NEW__"}
							cancelAddEdit={this.cancelAddEdit}
							message={message}
							fields={fields}
							action={this.state.action}
							currentUserRole={this.props.withAuthConsumer_myUserDetails.role}
							userRole={this.props.withAuthConsumer_myUserDetails.role}
							handleNameInputField={this.handleNameInputField}
							api={this.props.api}
							handleSubmit={this.handleSubmit}
							location={this.props.location}
							history={this.props.history}
							onChangeSchoolCheckBox={this.onChangeSchoolCheckBox}
							onChangeSelectedAllCheckbox={this.onChangeSelectedAllCheckbox}
							hasSelectedAllSchools={this.state.hasSelectedAllSchools}
							selectedSchoolIdMap={this.state.selectedSchoolIdMap}
							saveSchoolSearchFiter={this.saveSchoolSearchFiter}
							pushQueryString={this.pushQueryString}
							isHideSelect={this.state.fields.status !== "scheduled" && this.state.action === ACTION_EDIT}
							deleteRolloverJob={this.deleteRolloverJob}
							_selectAllRef={this._selectAllRef}
							loadingRolloverJob={this.state.loadingRolloverJob}
							setLoadingRolloverJob={this.setLoadingRolloverJob}
							isResetSchoolFilter={this.state.isResetSchoolFilter}
							_refForm={this._refForm}
						/>
					);
				}

				return (
					<>
						<HeadTitle title={PageTitle.rolloverJob} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<AdminPageWrap pageTitle={"Rollover Management"} id={JUMP_TO_CONTENT_ID}>
							<PageDetail>
								<SearchSectionOne>
									<SectionHalf>
										{this.state.filters ? (
											<SearchFilters
												statusData={this.state.statusData}
												selectedStatus={this.state.selectedStatus}
												selectedDateCreatedBegin={this.state.selectedDateCreatedBegin}
												selectedDateCreatedEnd={this.state.selectedDateCreatedEnd}
												handlefilterSelection={this.handlefilterSelection}
												filterText={this.state.query}
												queryPlaceHolderText={" Search .."}
												doSearch={this.doSearch}
												resetAll={this.resetAll}
												filtersLength={filtersLength}
												api={this.props.api}
											/>
										) : null}
									</SectionHalf>
									<SectionHalf>
										<Button
											title="Schedule New Rollover"
											name="create-new"
											hide={this.state.action === ACTION_NEW || this.state.action === ACTION_ADDED}
											onClick={this.createRolloverJob}
											setBottom={filtersLength === 1 ? "20px" : 0}
										>
											<i className="fa fa-plus" size="sm" />
											<ButtonText>Schedule New Rollover</ButtonText>
										</Button>
									</SectionHalf>
								</SearchSectionOne>
								<WrapperDiv>
									<AdminPageFilterMessage>{this.state.searchFilterText}</AdminPageFilterMessage>
									{rolloverJobTable}
									{rolloverJobForm}
								</WrapperDiv>
							</PageDetail>
						</AdminPageWrap>
					</>
				);
			}
		}
	)
);
