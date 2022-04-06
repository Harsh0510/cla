import React from "react";
import styled from "styled-components";
import withAdminAuthRequiredConsumer from "../../common/withAdminAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import Header from "../../widgets/Header";
import queryString from "query-string";
import TableGrid from "../../widgets/TableGrid";
import TableGridFooter from "../../widgets/TableGridFooter";
import Loader from "../../widgets/Loader";
import ClassAddEdit from "./ClassAddEdit";
import UserRole from "../../common/UserRole";
import SearchFilters from "./SearchFilters";
import KeyStages from "../../common/keyStages";
import ExamBoards from "../../common/examBoards";
import userDidChange from "../../common/userDidChange";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import AdminPageWrap from "../../widgets/AdminPageWrap";
import getSearchFilterText from "../../common/getSearchFilterText";
import AdminPageFilterMessage from "../../widgets/AdminPageFilterMessage";
import smoothScrollTo from "../../common/smoothScroll";
import TableEditLink from "../../widgets/TableEditLink";
import { SectionHalf, PageDetail, Button, SearchSectionOne, FilterSectionHalf, WrapperDiv } from "../../widgets/AdminStyleComponents";
import AdminPageMessage from "../../widgets/AdminPageMessage";
//set the defualt behaviour of column header
const COLUMN_ALIGN_LEFT = "left";
const COLUMN_ALIGN_CENTER = "center";

const ACTION_LIST = "list";
const ACTION_NEW = "new";
const ACTION_ADDED = "added";
const ACTION_EDIT = "edit";
const JUMP_TO_CONTENT_ID = "main-content";

const ButtonText = styled.span`
	margin-right: 0.5rem;
`;

/* This constant is used for showing filter text */
const AVAILABLE_FILTERS = [
	{ name: "Exam Board", stateKey: "selectedExamBoard" },
	{ name: "Key Stages", stateKey: "selectedKeyStage" },
	{ name: "Institution", stateKey: "selectedSchools" },
];

export default withAdminAuthRequiredConsumer(
	{ "cla-admin": true, "school-admin": true, teacher: true },
	withApiConsumer(
		class ClassesPage extends React.PureComponent {
			constructor(props) {
				super(props);
				this.state = {
					limit: 10,
					offset: 0,
					sort_field: "title",
					sort_dir: "asc",
					query: "",
					loading: true,
					classesLoaded: false,
					unfiltered_count: 3,
					classesData: null,
					action: ACTION_LIST,
					message: null,
					blockedFields: new Set(),
					fields: {
						oid: "",
						date_created: "",
						title: "",
						key_stage: "",
						year_group: "",
						number_of_students: "",
						exam_board: null,
						extract_count: 0,
						school_id: "",
						is_own: false,
						school_name: "",
						can_edit_blocked_fields: true,
					},
					examBoards: ExamBoards,
					keyStages: KeyStages,
					oid: "",
					currentclassdbdata: null,
					filters: null,
					schoolData: null,
					examBoardData: null,
					keyStagesData: null,
					selectedSchools: [],
					selectedExamBoard: [],
					selectedKeyStage: [],
					setOption: {
						value: "",
						label: "",
						key: "",
					},
					searchFilterText: null,
				};

				this.resetAll = this.resetAll.bind(this);
				this.handlefilterSelection = this.handlefilterSelection.bind(this);
			}

			componentDidMount() {
				this.fetchFilters();
				this.updateState();
				this.props.api(`/admin/class-get-uneditable-fields`).then((result) => {
					this.setState({
						blockedFields: new Set(result.fields),
					});
				});
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
						smoothScrollTo(document.querySelector(".close_btn"));
					}, 500);
				}
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
					let oid = parsed.oid !== undefined ? parsed.oid : this.state.oid;

					let sortField = parsed.sort_field || "title";
					let sortDir = parsed.sort_dir || "asc";
					let query = parsed.query || "";

					const newState = {
						limit: limit,
						offset: offset,
						action: action,
						oid: oid,
						sort_field: sortField,
						sort_dir: sortDir,
						query: query,
						selected: {},
					};

					for (const filter of this.state.filters) {
						newState.selected[filter.id] = [];
					}

					// get filters from query params
					for (const key in parsed) {
						if (key.indexOf("filter_") === 0 && parsed[key]) {
							const filterGroupId = key.slice("filter_".length);
							const selectedValues = parsed[key].split(",");
							const selectedMap = [];
							for (const value of selectedValues) {
								if (filterGroupId === "schools") {
									selectedMap.push(parseInt(value));
								} else {
									selectedMap.push(value);
								}
							}
							newState.selected[filterGroupId] = selectedMap;
						}
					}

					//check the selected exam_board value and if extis then store in state value
					if (
						newState.selected.hasOwnProperty("exam_board") &&
						Array.isArray(newState.selected.exam_board) &&
						newState.selected.exam_board.length > 0
					) {
						let arr = newState.selected.exam_board;
						let bindSelectedExamBoard = this.state.examBoardData.filter((d) => arr.some((s) => s === d.value));
						newState.selectedExamBoard = bindSelectedExamBoard;
					}

					//check the selected key_stage value and if extis then store in state value
					if (newState.selected.hasOwnProperty("key_stage") && Array.isArray(newState.selected.key_stage) && newState.selected.key_stage.length > 0) {
						let arr = newState.selected.key_stage;
						let bindSelectedKeyStage = this.state.keyStagesData.filter((d) => arr.some((s) => s === d.value));
						newState.selectedKeyStage = bindSelectedKeyStage;
					}
					this.setState(newState, this.performQuery);
				}
			}

			/**Get selected filter in array
			 * like [{filter: "class", values: ["class 1", "class 2"]}]
			 */
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
			 * Get Classes information
			 */
			performQuery() {
				this.props
					.api("/admin/class-get-all", {
						limit: this.state.limit,
						offset: this.state.offset,
						sort_field: this.state.sort_field,
						sort_direction: this.state.sort_dir,
						query: this.state.query,
						filter: this.state.selected,
					})
					.then((result) => {
						const fields = Object.assign({}, this.state.fields);
						let classesDetails;
						if (this.state.action == ACTION_NEW || this.state.action == ACTION_ADDED) {
							fields.oid = this.state.action;
							fields.title = "";
							fields.key_stage = "";
							fields.year_group = "";
							fields.number_of_students = "";
							fields.exam_board = null;
							fields.extract_count = 0;
							fields.school_id = "";
							fields.school_name = "";
							fields.is_own = false;
							fields.can_edit_blocked_fields = true;
							this.setState({ fields: fields });
						} else if (
							this.state.action == ACTION_EDIT &&
							this.state.oid &&
							(classesDetails = result.data.find((row) => row.oid === this.state.oid))
						) {
							fields.oid = classesDetails.oid;
							fields.title = classesDetails.title;
							fields.key_stage = classesDetails.key_stage;
							fields.year_group = classesDetails.year_group;
							fields.number_of_students = classesDetails.number_of_students;
							fields.exam_board = classesDetails.exam_board;
							fields.extract_count = classesDetails.extract_count;
							fields.school_id = classesDetails.school_id;
							fields.is_own = classesDetails.is_own;
							fields.school_name = classesDetails.school_name;
							fields.can_edit_blocked_fields = classesDetails.can_edit_blocked_fields;
							this.setState({
								fields: fields,
								currentclassdbdata: fields,
							});
						}
						this.getClasses(result.data, result.unfiltered_count);
						let selected_Filter = this.getSelectedFilters();
						let searchFilterText = getSearchFilterText(
							this.state.limit,
							this.state.offset,
							this.state.query,
							selected_Filter,
							result.unfiltered_count
						);
						this.setState({
							ClassesLoaded: true,
							searchFilterText: searchFilterText,
						});
					})
					.catch((result) => {
						this.setState({ message: result.toString() });
					});
			}

			doOpenEditScreen = (e) => {
				e.preventDefault();
				const oid = e.currentTarget.getAttribute("data-oid");
				this.setState({
					message: null,
				});
				this.pushHistory({
					oid: oid,
					action: ACTION_EDIT,
					selectedSchools: this.state.selectedSchools,
					selectedExamBoard: this.state.selectedExamBoard,
					selectedKeyStage: this.state.selectedKeyStage,
				});
			};

			//** Get Classes binding for display in table grid */
			getClasses = (classesData, unfiltered_count) => {
				//declare columns
				let columns = [
					{ name: "date_created", title: "Date Created" },
					{ name: "title", title: "Name" },
					{ name: "key_stage", title: "Key Stage" },
					{ name: "year_group", title: "Year Group" },
					{ name: "exam_board", title: "Exam Board" },
					// {name: 'number_of_students', title: 'Number of Students'},
					{ name: "action", title: "Edit" },
				];

				if (this.props.withAuthConsumer_myUserDetails.role === UserRole.claAdmin) {
					columns.unshift({ name: "school", title: "Institution" });
				}

				//arrange the column records
				const rows = classesData.map((row) => {
					// duplicate the row object. Do not modify the row object directly
					let newRow = Object.assign({}, row);
					newRow.action = (
						<TableEditLink to="" onClick={this.doOpenEditScreen} data-oid={row.oid}>
							<i className="fa fa-edit"></i>
						</TableEditLink>
					);
					if (this.props.withAuthConsumer_myUserDetails.role === UserRole.claAdmin) {
						newRow.school = row.school_name;
					}
					return newRow;
				});

				//column resizing
				let defaultColumnWidths = [
					{ columnName: "date_created", width: 150 },
					{ columnName: "title", width: 250 },
					{ columnName: "key_stage", width: 200 },
					{ columnName: "year_group", width: 150 },
					{ columnName: "exam_board", width: 200 },
					// {columnName: 'number_of_students', width: 200},
					{ columnName: "action", width: 80 },
				];

				if (this.props.withAuthConsumer_myUserDetails.role === UserRole.claAdmin) {
					defaultColumnWidths.unshift({
						columnName: "school",
						width: 300,
					});
				}

				//default sorting
				const sortDir = this.state.sort_dir && this.state.sort_dir[0].toUpperCase() === "D" ? "desc" : "asc";
				let defaultSorting = [{ columnName: this.state.sort_field, direction: sortDir }];

				//column initilization and alignment
				let tableColumnExtensions = [
					{ columnName: "date_created", align: COLUMN_ALIGN_LEFT },
					{ columnName: "title", align: COLUMN_ALIGN_LEFT },
					{ columnName: "key_stage", align: COLUMN_ALIGN_LEFT },
					{ columnName: "year_group", align: COLUMN_ALIGN_LEFT },
					{ columnName: "exam_board", align: COLUMN_ALIGN_LEFT },
					// {columnName: 'number_of_students', align: COLUMN_ALIGN_LEFT},
					{ columnName: "action", align: COLUMN_ALIGN_CENTER },
				];

				if (this.props.withAuthConsumer_myUserDetails.role === UserRole.claAdmin) {
					tableColumnExtensions.unshift({
						columnName: "school",
						align: COLUMN_ALIGN_LEFT,
					});
				}

				//default disable column for sorting
				let sortingStateColumnExtensions = [{ columnName: "action", sortingEnabled: false }];

				//for set fixed column
				let leftColumns = ["date_created"];
				let rightColumns = ["action"];
				//date type column names
				let dateColumnsName = ["date_created"];

				this.setState({
					unfiltered_count: unfiltered_count,
					columns: columns,
					rows: rows,
					defaultColumnWidths: defaultColumnWidths,
					tableColumnExtensions: tableColumnExtensions,
					defaultSorting: defaultSorting,
					sortingStateColumnExtensions: sortingStateColumnExtensions,
					loading: false,
					leftColumns: leftColumns,
					rightColumns: rightColumns,
					ClassesLoaded: true,
					classesData: classesData,
					dateColumnsName: dateColumnsName,
					// message: null
				});
			};

			/**
			 * get query string
			 */
			getQueryString(extra) {
				const obj = {
					limit: this.state.limit,
					offset: this.state.offset,
					action: this.state.action,
					oid: this.state.oid,
					sort_field: this.state.sort_field,
					sort_dir: this.state.sort_dir,
					query: this.state.query,
				};

				// if selectedSchools extis in the query
				if (extra.hasOwnProperty("selectedSchools") && Array.isArray(extra.selectedSchools) && extra.selectedSchools.length > 0) {
					let schools = [];
					for (const item of extra.selectedSchools) {
						schools.push(item.value);
					}
					obj["filter_schools"] = schools.join(",");
					delete extra.selectedSchools;
				}

				// if selectedExamBoard extis in the query
				if (extra.hasOwnProperty("selectedExamBoard") && Array.isArray(extra.selectedExamBoard) && extra.selectedExamBoard.length > 0) {
					let exam_board = [];
					for (const item of extra.selectedExamBoard) {
						exam_board.push(item.value);
					}
					obj["filter_exam_board"] = exam_board.join(",");
					delete extra.selectedExamBoard;
				}

				// if selectedKeyStage extis in the query
				if (extra.hasOwnProperty("selectedKeyStage") && Array.isArray(extra.selectedKeyStage) && extra.selectedKeyStage.length > 0) {
					let key_stage = [];
					for (const item of extra.selectedKeyStage) {
						key_stage.push(item.value);
					}
					obj["filter_key_stage"] = key_stage.join(",");
					delete extra.selectedKeyStage;
				}

				Object.assign(obj, extra || {});
				return queryString.stringify(obj);
			}

			/**
			 * Push history
			 */
			pushHistory(extra) {
				const url = "/profile/admin/classes?" + this.getQueryString(extra);
				this.props.history.push(url);
			}

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
					query: this.state.query,
					selectedSchools: this.state.selectedSchools,
					selectedExamBoard: this.state.selectedExamBoard,
					selectedKeyStage: this.state.selectedKeyStage,
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
					query: this.state.query,
					selectedSchools: this.state.selectedSchools,
					selectedExamBoard: this.state.selectedExamBoard,
					selectedKeyStage: this.state.selectedKeyStage,
				});
			};

			/**
			 * Create User
			 */
			createClass = () => {
				this.setState(
					{
						query: "",
						selectedSchools: [],
						selectedExamBoard: [],
						selectedKeyStage: [],
						message: null,
					},
					() => {
						this.pushHistory({
							action: ACTION_NEW,
							oid: null,
						});
					}
				);
			};

			/**
			 * Close the User Add/Edit
			 */
			cancelAddEdit = () => {
				this.setState({ message: null }, () => smoothScrollTo(document.querySelector("body")));
				this.pushHistory({
					action: ACTION_LIST,
					oid: null,
				});
			};

			/**
			 * Handles the form submission and attempts to add a new user to the database
			 */
			handleSubmit = (data) => {
				if (this.state.action == ACTION_NEW || this.state.action == ACTION_ADDED) {
					const params = {
						title: data.title.toString().trim().replace(/\s\s+/g, " "),
						key_stage: data.key_stage,
						year_group: data.year_group,
						exam_board: data.exam_board,
						number_of_students: parseInt(data.number_of_students, 10),
					};
					if (this.props.withAuthConsumer_myUserDetails.role === UserRole.claAdmin) {
						params.school_id = parseInt(data.school, 10);
					}

					//TODO: When API done just remove comment
					this.props
						.api("/admin/class-create", params)
						.then((result) => {
							if (result.success) {
								this.setState({
									message: "Successfully added",
								});
								if (this.state.action === ACTION_NEW) {
									this.pushHistory({ action: ACTION_ADDED });
								} else {
									this.pushHistory({ action: ACTION_NEW });
								}
							}
						})
						.catch((result) => {
							this.setState({ message: result.toString() });
						});
				} else if (this.state.action == ACTION_EDIT && this.state.currentclassdbdata) {
					const params = this.getFieldValuesForUpdate(this.state.currentclassdbdata, data);
					if (!this.state.fields.can_edit_blocked_fields) {
						for (const field of this.state.blockedFields) {
							delete params[field];
						}
					}
					this.props
						.api("/admin/class-update", params)
						.then((result) => {
							if (result.result.edited) {
								this.setState({
									message: "Successfully updated",
								});
								this.performQuery();
							} else {
								this.setState({
									message: "Record not updated",
								});
							}
						})
						.catch((result) => {
							this.setState({ message: result.toString() });
						});
				}
			};

			/**
			 * Get fileds which require need to be update
			 * @param {object} currentClassDBData existing class value
			 * @param {object} updatedClassDetail User Updated class Detail values
			 */
			getFieldValuesForUpdate = (currentClassDBData, updatedClassDetail) => {
				let params = Object.create(null);

				if (currentClassDBData.title != (updatedClassDetail.title || "").toString().trim().replace(/\s\s+/g, " ")) {
					params.title = updatedClassDetail.title || "";
				}

				if (currentClassDBData.key_stage != updatedClassDetail.key_stage) {
					params.key_stage = updatedClassDetail.key_stage;
				}

				if ((currentClassDBData.year_group || "") != (updatedClassDetail.year_group || "")) {
					params.year_group = updatedClassDetail.year_group;
					if (!params.year_group) {
						params.year_group = null;
					}
				}

				if ((currentClassDBData.number_of_students || 0) != (updatedClassDetail.number_of_students || 0)) {
					params.number_of_students = parseInt(updatedClassDetail.number_of_students || 0, 10);
				}

				if (updatedClassDetail.exam_board === "") {
					updatedClassDetail.exam_board = null;
				}

				if (currentClassDBData.exam_board != updatedClassDetail.exam_board) {
					params.exam_board = updatedClassDetail.exam_board;
				}

				if (this.props.withAuthConsumer_myUserDetails.role === UserRole.claAdmin) {
					if (currentClassDBData.school_id != updatedClassDetail.school) {
						params.school_id = parseInt(updatedClassDetail.school, 10);
					}
				}

				params.oid = this.state.oid;

				return params;
			};

			/**
			 * Delete the class after confirmation from class
			 */
			deleteClass = () => {
				this.props
					.api("/admin/class-delete", { oid: this.state.oid })
					.then((result) => {
						if (result.result) {
							this.setState({
								message: "Class deleted successfully",
							});
							if (this.state.offset >= this.state.unfiltered_count - 1) {
								this.setState({ offset: 0 });
							}
							if (this.state.action === ACTION_EDIT) {
								this.pushHistory({
									query: this.state.query,
									offset: this.state.offset,
									action: ACTION_LIST,
									oid: null,
									selectedSchools: this.state.selectedSchools,
									selectedExamBoard: this.state.selectedExamBoard,
									selectedKeyStage: this.state.selectedKeyStage,
								});
							} else {
								this.pushHistory({
									action: ACTION_NEW,
									oid: null,
								});
							}
						} else {
							let msg;
							if (this.props.withAuthConsumer_myUserDetails.role === "teacher") {
								msg = `You may not delete a class you did not create`;
							} else {
								msg = `Error deleting class`;
							}

							this.setState({ message: msg });
						}
					})
					.catch((result) => {
						this.setState({ message: result.toString() });
					});
			};

			handleDrpChange = (name, select_school, valid) => {
				this.setState((prevState) => ({
					fields: {
						...prevState.fields,
						school_id: select_school ? select_school.value : "",
						school_name: select_school ? select_school.label : "",
					},
				}));
			};

			handleNameInputField = (inputFieldValue, inputFieldName) => {
				let fields = Object.assign({}, this.state.fields);
				fields[inputFieldName] = inputFieldValue;
				this.setState({ fields: fields });
			};

			doSearch = () => {
				this.setState({ message: null });
				this.pushHistory({
					query: this.state.query,
					offset: 0,
					action: ACTION_LIST,
					oid: null,
					selectedSchools: this.state.selectedSchools,
					selectedExamBoard: this.state.selectedExamBoard,
					selectedKeyStage: this.state.selectedKeyStage,
				});
			};

			fetchFilters() {
				const parsed = queryString.parse(this.props.location.search);
				let filter_schools = parsed.filter_schools;
				this.props
					.api("/admin/class-get-filters", {
						filter_schools: filter_schools ? filter_schools : null,
					})
					.then((result) => {
						let resultFilter = result.result;
						let filters = [];
						let schoolData, examBoardData, keyStagesData, selectedSchools;
						/** bind the filter data */
						for (const item in resultFilter) {
							filters.push(resultFilter[item]);
						}
						//bind filters group data according to user role
						if (filters) {
							let userDetails = this.props.withAuthConsumer_myUserDetails.role;
							let examBoardArray = filters.find((filter) => filter.id === "exam_board");
							examBoardData = examBoardArray ? this.arrayMapping(examBoardArray.data) : null;
							let keyStageArray = filters.find((filter) => filter.id === "key_stage");
							keyStagesData = keyStageArray ? this.arrayMapping(keyStageArray.data) : null;
							if (userDetails && userDetails === UserRole.claAdmin) {
								let schoolArray = filters.find((filter) => filter.id === "schools");
								schoolData = schoolArray ? this.arrayMapping(schoolArray.data) : null;
								selectedSchools = schoolData;
							}
						}
						this.setState(
							{
								filters: filters,
								schoolData: schoolData,
								examBoardData: examBoardData,
								keyStagesData: keyStagesData,
								selectedSchools: selectedSchools,
							},
							this.updateState
						);
					})
					.catch((err) => {
						this.setState({
							message: err,
						});
					});
			}

			/** fill the state new value */
			handlefilterSelection = (selected, filterName) => {
				//bind new filter data of school and examboard
				switch (filterName.toLowerCase()) {
					case "school":
						this.setState({ selectedSchools: selected });
						break;
					case "examboard":
						this.setState({ selectedExamBoard: selected });
						break;
					case "keystage":
						this.setState({ selectedKeyStage: selected });
						break;
					case "query":
						this.setState({ query: selected });
						break;
				}
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
					selectedSchools: [],
					selectedExamBoard: [],
					selectedKeyStage: [],
					message: null,
				});
				this.pushHistory({
					query: "",
					offset: 0,
					action: ACTION_LIST,
					oid: null,
					selectedSchools: [],
					selectedExamBoard: [],
					selectedKeyStage: [],
				});
			}

			render() {
				const { classesData, fields, message, examBoards, keyStages } = this.state;
				const filtersLength = this.state.filters ? this.state.filters.length : 0;
				let classTable = <AdminPageMessage> No results found</AdminPageMessage>;
				let classForm = "";
				let messageNotice = null;

				if (!this.state.ClassesLoaded) {
					classTable = (
						<AdminPageMessage>
							<Loader />
						</AdminPageMessage>
					);
				}

				if (classesData !== null && classesData.length !== 0) {
					classTable = (
						<>
							<TableGrid
								column={this.state.columns}
								row={this.state.rows}
								resize={this.state.defaultColumnWidths}
								tableColumnExtensions={this.state.tableColumnExtensions}
								defaultSorting={this.state.defaultSorting}
								sortingStateColumnExtensions={this.state.sortingStateColumnExtensions}
								doSorting={this.doSorting}
								loading={this.state.loading}
								leftColumns={this.state.leftColumns}
								rightColumns={this.state.rightColumns}
								dateColumnsName={this.state.dateColumnsName}
							/>

							<TableGridFooter
								unfilteredCount={this.state.unfiltered_count}
								limit={this.state.limit}
								pageNeighbours={3}
								doPagination={this.doPagination}
								currentPage={parseInt(this.state.offset) / Number(this.state.limit) + 1}
								loading={this.state.loading}
							/>
						</>
					);
				}

				if (this.state.action === ACTION_NEW || this.state.action === ACTION_EDIT || this.state.action === ACTION_ADDED) {
					classForm = (
						<ClassAddEdit
							key={fields.oid || "__NEW__"}
							handleSubmit={this.handleSubmit}
							cancelAddEdit={this.cancelAddEdit}
							message={message}
							fields={fields}
							keyStages={keyStages}
							examBoards={examBoards}
							action={this.state.action}
							deleteClass={this.deleteClass}
							currentUserRole={this.props.withAuthConsumer_myUserDetails.role}
							handleDrpChange={this.handleDrpChange}
							userRole={this.props.withAuthConsumer_myUserDetails.role}
							handleNameInputField={this.handleNameInputField}
							api={this.props.api}
							blockedFields={this.state.blockedFields}
						/>
					);
				}

				return (
					<>
						<HeadTitle title={PageTitle.classes} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<AdminPageWrap pageTitle={"Class Management"} id={JUMP_TO_CONTENT_ID}>
							<PageDetail>
								<SearchSectionOne>
									<FilterSectionHalf>
										{this.state.filters ? (
											<SearchFilters
												schoolData={this.state.schoolData}
												examBoardData={this.state.examBoardData}
												keyStagesData={this.state.keyStagesData}
												selectedSchools={this.state.selectedSchools}
												selectedExamBoard={this.state.selectedExamBoard}
												selectedKeyStage={this.state.selectedKeyStage}
												currentUserRole={this.props.withAuthConsumer_myUserDetails.role}
												handlefilterSelection={this.handlefilterSelection}
												filterText={this.state.query}
												queryPlaceHolderText={" Search .."}
												doSearch={this.doSearch}
												resetAll={this.resetAll}
												filtersLength={filtersLength}
												api={this.props.api}
											/>
										) : null}
									</FilterSectionHalf>
									<SectionHalf>
										<Button
											title="Create Class"
											name="create-new"
											hide={this.state.action === ACTION_NEW || this.state.action === ACTION_ADDED}
											onClick={this.createClass}
											setBottom={filtersLength === 1 ? "20px" : 0}
										>
											<ButtonText>Create Class</ButtonText>
											{/* <FontAwesomeIcon icon={faPlus} size="sm"/> */}
											<i className="fa fa-plus" size="sm" />
										</Button>
									</SectionHalf>
								</SearchSectionOne>
								<WrapperDiv>
									<AdminPageFilterMessage>{this.state.searchFilterText}</AdminPageFilterMessage>
									{classTable}
									{classForm}
								</WrapperDiv>
							</PageDetail>
						</AdminPageWrap>
					</>
				);
			}
		}
	)
);
