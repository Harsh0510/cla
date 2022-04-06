import React from "react";
import styled from "styled-components";
import withAdminAuthRequiredConsumer from "../../common/withAdminAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import userDidChange from "../../common/userDidChange";
import Header from "../../widgets/Header";
import queryString from "query-string";
import TableGrid from "../../widgets/TableGrid";
import Loader from "../../widgets/Loader";
import UserAddEdit from "./UserAddEdit";
import UserRole from "../../common/UserRole";
import UserSearchFilters from "../../widgets/UserSearchFilters";
import userTitles from "../../common/userTitles";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import AdminPageWrap from "../../widgets/AdminPageWrap";
import AdminPageMessage from "../../widgets/AdminPageMessage";
import AdminPageFilterMessage from "../../widgets/AdminPageFilterMessage";
import getSearchFilterText from "../../common/getSearchFilterText";
import TableGridFooter from "../../widgets/TableGridFooter";
import TableEditLink from "../../widgets/TableEditLink";
import smoothScrollTo from "../../common/smoothScroll";
import { SectionHalf, PageDetail, MessageString, Button, SearchSectionOne, FilterSectionHalf, WrapperDiv } from "../../widgets/AdminStyleComponents";

//set the defualt behaviour of column header
const COLUMN_ALIGN_LEFT = "left";
const COLUMN_ALIGN_RIGHT = "right";
const COLUMN_ALIGN_CENTER = "center";

const ACTION_LIST = "list";
const ACTION_NEW = "new";
const ACTION_ADDED = "added";
const ACTION_EDIT = "edit";

const ButtonText = styled.span`
	margin-right: 0.5rem;
`;

/* This constant is used for showing filter text */
const AVAILABLE_FILTERS = [
	{ name: "Institution", stateKey: "selectedSchools" },
	{ name: "Role", stateKey: "selectedRoles" },
];
const JUMP_TO_CONTENT_ID = "main-content";
const userRoleMap = {
	"school-admin": "institution-admin",
	teacher: "user",
	"cla-admin": "cla-admin",
};

export default withAdminAuthRequiredConsumer(
	{ "cla-admin": true, "school-admin": true },
	withApiConsumer(
		class UserPage extends React.PureComponent {
			constructor(props) {
				super(props);
				this.state = {
					limit: 10,
					offset: 0,
					sort_field: "email",
					sort_dir: "asc",
					query: "",
					loading: true,
					usersLoaded: false,
					unfiltered_count: 3,
					userData: null,
					action: ACTION_LIST,
					userTitles: userTitles,
					message: null,
					userOid: null,
					userRoles: null,
					blockedFields: new Set(),
					fields: {
						oid: "",
						title: "",
						email: "",
						first_name: "",
						last_name: "",
						role: "",
						school_id: "",
						school_name: "",
						can_edit_blocked_fields: true,
					},
					filters: null,
					schoolData: null,
					rolesData: null,
					selectedSchools: [],
					selectedRoles: [],
					setOption: {
						value: "",
						label: "",
						key: "",
					},
					searchFilterText: null,
					noToggleColumns: null,
				};
				this.resetAll = this.resetAll.bind(this);
				this.handlefilterSelection = this.handlefilterSelection.bind(this);
			}

			componentDidMount() {
				this.fetchFilters();
				this.updateState();
				this.props.api(`/auth/user-get-uneditable-fields`).then((result) => {
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
					let userOid = parsed.userOid !== undefined ? parsed.userOid : this.state.userOid;

					let sortField = parsed.sort_field || "email";
					let sortDir = parsed.sort_dir || "asc";
					let query = parsed.query || "";

					const newState = {
						limit: limit,
						offset: offset,
						action: action,
						userOid: userOid,
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

					//check the selected roles value and if extis then store in state value
					if (newState.selected.hasOwnProperty("roles") && Array.isArray(newState.selected.roles) && newState.selected.roles.length > 0) {
						let arr = newState.selected.roles;
						let bindSelectedRoles = this.state.rolesData.filter((d) => arr.some((s) => s === d.value));
						newState.selectedRoles = bindSelectedRoles;
					}

					this.setState(newState, this.performQuery);
				}
			}

			/**
			 * Get users information
			 */
			performQuery() {
				let searchFilterText = "";
				let selected_Filter = this.getSelectedFilters();
				this.props
					.api("/auth/user-get-all", {
						limit: this.state.limit,
						offset: this.state.offset,
						sort_field: this.state.sort_field,
						sort_direction: this.state.sort_dir,
						query: this.state.query,
						filter: this.state.selected,
					})
					.then((result) => {
						const fields = Object.assign({}, this.state.fields);
						let userDetails;

						if (this.state.action === ACTION_NEW || this.state.action === ACTION_ADDED) {
							fields.oid = this.state.action;
							fields.title = "";
							fields.email = "";
							fields.first_name = "";
							fields.last_name = "";
							fields.role = "";
							fields.school_id = "";
							fields.school_name = "";
							fields.can_edit_blocked_fields = true;
							this.setState({ fields: fields });
						} else if (
							this.state.action == ACTION_EDIT &&
							this.state.userOid &&
							(userDetails = result.data.find((row) => row.email === this.state.userOid))
						) {
							fields.oid = this.state.userOid;
							fields.title = userDetails.title;
							fields.email = userDetails.email;
							fields.first_name = userDetails.first_name.trim();
							fields.last_name = userDetails.last_name.trim();
							fields.role = userDetails.role;
							fields.school_id = userDetails.school_id;
							fields.school_name = userDetails.school_name;
							fields.can_edit_blocked_fields = userDetails.can_edit_blocked_fields;
							this.setState({ fields: fields, currentUser: fields });
						}
						this.getUsers(result.data, result.unfiltered_count);
						searchFilterText = getSearchFilterText(this.state.limit, this.state.offset, this.state.query, selected_Filter, result.unfiltered_count);
						this.setState({ usersLoaded: true, searchFilterText: searchFilterText });
					})
					.catch((result) => {
						this.setState({ message: result.toString() });
					});
			}

			doOpenEditScreen = (e) => {
				e.preventDefault();
				const email = e.currentTarget.getAttribute("data-email");
				this.setState({
					message: null,
				});
				this.pushHistory({
					userOid: email,
					action: ACTION_EDIT,
					selectedSchools: this.state.selectedSchools,
					selectedRoles: this.state.selectedRoles,
				});
			};

			//** Get users binding for display in table grid */
			getUsers = (userData, unfiltered_count) => {
				//declare columns
				let columns = [
					{ name: "email", title: "Email" },
					{ name: "title", title: "Title" },
					{ name: "first_name", title: "First name" },
					{ name: "last_name", title: "Last name" },
					{ name: "role", title: "Role" },
					{ name: "action", title: "Edit" },
				];

				let noToggleColumns = [{ name: "action", title: "Edit" }];

				if (this.props.withAuthConsumer_myUserDetails.role === "cla-admin") {
					columns.unshift(
						{ name: "date_created", title: "Registration/creation" },
						{ name: "id", title: "User ID" },
						{ name: "school_id", title: "Institution ID" },
						{ name: "school", title: "Institution" }
					);
				}

				//arrange the column records
				const rows = userData.map((row) => {
					const newRow = {};
					newRow.email = row.email;
					newRow.title = row.title;
					newRow.first_name = row.first_name;
					newRow.last_name = row.last_name;
					newRow.role = userRoleMap[row.role];
					newRow.action = (
						<TableEditLink to="" onClick={this.doOpenEditScreen} data-email={row.email}>
							<i className="fa fa-edit"></i>
						</TableEditLink>
					);

					if (this.props.withAuthConsumer_myUserDetails.role === "cla-admin") {
						newRow.date_created = row.date_created;
						newRow.id = row.id;
						newRow.school_id = row.school_id;
						newRow.school = row.school_name;
					}

					return newRow;
				});

				let emailColumnWidth = 450;

				if (this.props.withAuthConsumer_myUserDetails.role === "cla-admin") {
					emailColumnWidth = 250;
				}

				//column resizing
				let defaultColumnWidths = [
					{ columnName: "email", width: emailColumnWidth },
					{ columnName: "title", width: 100 },
					{ columnName: "first_name", width: 300 },
					{ columnName: "last_name", width: 300 },
					{ columnName: "role", width: 200 },
					{ columnName: "action", width: 80 },
				];

				if (this.props.withAuthConsumer_myUserDetails.role === "cla-admin") {
					defaultColumnWidths.unshift(
						{ columnName: "date_created", width: 150 },
						{ columnName: "id", width: 100 },
						{ columnName: "school_id", width: 140 },
						{ columnName: "school", width: 150 }
					);
				}

				//default sorting
				let defaultSorting = [
					{
						columnName: this.state.sort_field,
						direction: this.state.sort_dir && this.state.sort_dir.toUpperCase()[0] === "D" ? "desc" : "asc",
					},
				];

				//column initilization and alignment
				let tableColumnExtensions = [
					{ columnName: "email", align: COLUMN_ALIGN_LEFT },
					{ columnName: "title", align: COLUMN_ALIGN_LEFT },
					{ columnName: "first_name", align: COLUMN_ALIGN_LEFT },
					{ columnName: "last_name", align: COLUMN_ALIGN_LEFT },
					{ columnName: "role", align: COLUMN_ALIGN_LEFT },
					{ columnName: "action", align: COLUMN_ALIGN_CENTER },
				];

				if (this.props.withAuthConsumer_myUserDetails.role === "cla-admin") {
					tableColumnExtensions.unshift(
						{ columnName: "date_created", align: COLUMN_ALIGN_LEFT },
						{ columnName: "id", align: COLUMN_ALIGN_LEFT },
						{ columnName: "school_id", align: COLUMN_ALIGN_LEFT },
						{ columnName: "school", align: COLUMN_ALIGN_LEFT }
					);
				}

				//default disable column for sorting
				let sortingStateColumnExtensions = [{ columnName: "action", sortingEnabled: false }];

				//for set fixed column
				let leftColumns = ["email"];
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
					usersLoaded: true,
					userData: userData,
					dateColumnsName: dateColumnsName,
					noToggleColumns: noToggleColumns,
				});
			};

			// getSchools = () => {
			// 	this.props.api(
			// 		'/auth/get-schools'
			// 	).then(result => {
			// 		this.setState({allSchools: result.result});
			// 	}).catch(result => {
			// 		this.setState({message: result.toString()});
			// 	});
			// }

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
					limit: setLimit,
					action: ACTION_LIST,
					query: this.state.query,
					selectedSchools: this.state.selectedSchools,
					selectedRoles: this.state.selectedRoles,
				});
			};

			/**
			 * Handles the sorting data
			 */
			doSorting = (sorting) => {
				const columnSorting = sorting[0];
				const sortDirectionString = columnSorting.direction === "desc" ? "D" : "A";
				this.setState({ loading: true });
				this.pushHistory({
					offset: 0,
					sort_field: columnSorting.columnName,
					sort_dir: sortDirectionString,
					query: this.state.query,
					selectedSchools: this.state.selectedSchools,
					selectedRoles: this.state.selectedRoles,
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
					userOid: this.state.userOid,
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

				// if selectedRoles extis in the query
				if (extra.hasOwnProperty("selectedRoles") && Array.isArray(extra.selectedRoles) && extra.selectedRoles.length > 0) {
					let roles = [];
					for (const item of extra.selectedRoles) {
						roles.push(item.value);
					}
					obj["filter_roles"] = roles.join(",");
					delete extra.selectedRoles;
				}

				Object.assign(obj, extra || {});
				return queryString.stringify(obj);
			}

			/**
			 * Push history
			 */
			pushHistory(extra) {
				const url = "/profile/admin/users?" + this.getQueryString(extra);
				this.props.history.push(url);
			}

			/**
			 * Create User
			 */
			createUser = () => {
				this.setState({ query: "", selectedSchools: [], selectedRoles: [], message: null }, () => {
					this.pushHistory({
						action: ACTION_NEW,
						userOid: null,
					});
				});
			};

			/**
			 * Close the User Add/Edit
			 */
			cancelAddEdit = () => {
				this.setState({ message: null }, () => smoothScrollTo(document.querySelector("body")));
				this.pushHistory({
					action: ACTION_LIST,
					userOid: null,
				});
			};

			/**
			 * Handles the form submission and attempts to add a new user to the database
			 */
			handleSubmit = (data) => {
				if (this.state.action == ACTION_NEW || this.state.action == ACTION_ADDED) {
					const params = {
						title: data.title,
						email: data.email,
						first_name: data.first_name.trim(),
						last_name: data.last_name.trim(),
						role: data.role,
					};

					//
					if (this.props.withAuthConsumer_myUserDetails.role === "cla-admin") {
						//The school_id parameter should only be passed if the user has not selected a role of 'CLA Admin'.
						// If the user has selected a role of 'CLA Admin' then do not pass the school_id parameter.
						if (data.role !== "cla-admin") {
							params.school_id = parseInt(data.school, 10);
						}
					}

					this.props
						.api("/auth/user-create", params)
						.then((result) => {
							this.setState({ message: "Successfully added" });
							if (this.state.action === ACTION_NEW) {
								this.pushHistory({ action: ACTION_ADDED });
							} else {
								this.pushHistory({ action: ACTION_NEW });
							}
						})
						.catch((result) => {
							this.setState({ message: result.toString() });
						});
				} else if (this.state.action == ACTION_EDIT && this.state.currentUser) {
					const params = this.getFieldValuesForUpdate(this.state.currentUser, data);
					if (!this.state.fields.can_edit_blocked_fields) {
						for (const field of this.state.blockedFields) {
							delete params[field];
						}
					}

					this.props
						.api("/auth/user-update", params)
						.then((result) => {
							this.setState({ message: "Successfully updated" });
							this.performQuery();
						})
						.catch((result) => {
							this.setState({ message: result.toString() });
						});
				}
			};

			/**
			 * Get fileds which require need to be update
			 * @param {currentUser} currentUser existing user value
			 * @param {updatedUserDetail} updatedUserDetail User Updated Detail values
			 */
			getFieldValuesForUpdate = (currentUser, updatedUserDetail) => {
				let params = Object.create(null);

				if (currentUser.role != updatedUserDetail.role) {
					params.role = updatedUserDetail.role;
				}

				if (currentUser.title != updatedUserDetail.title) {
					params.title = updatedUserDetail.title;
				}

				if (currentUser.first_name != updatedUserDetail.first_name) {
					params.first_name = (updatedUserDetail.first_name || "").trim();
				}

				if (currentUser.last_name != updatedUserDetail.last_name) {
					params.last_name = (updatedUserDetail.last_name || "").trim();
				}

				if (currentUser.email != updatedUserDetail.email) {
					params.email = updatedUserDetail.email;
				}

				// NB: we don't allow CLA Admins to change a user's school.

				params.current_email = currentUser.email;

				return params;
			};

			/**
			 * Delete the user after confirmation from user
			 */
			deleteUser = () => {
				this.props
					.api("/auth/user-delete", { email: this.state.currentUser.email })
					.then((result) => {
						if (result.result) {
							this.setState({ message: "User deleted successfully." });
							if (this.state.offset >= this.state.unfiltered_count - 1) {
								this.setState({ offset: 0 });
							}
							this.pushHistory({
								query: this.state.query,
								offset: this.state.offset,
								action: ACTION_LIST,
								userOid: null,
								selectedSchools: this.state.selectedSchools,
								selectedRoles: this.state.selectedRoles,
							});
						} else {
							this.setState({ message: `Something went wrong and "${this.state.currentUser.email}" was not deleted. Please try again later.` });
						}
					})
					.catch((result) => {
						this.setState({ message: result.toString() });
					});
			};

			/**
			 * Handles the user reset password
			 */
			resetPassword = () => {
				this.props
					.api("/auth/user-init-password-reset", { email: this.state.currentUser.email })
					.then((result) => {
						if (result.result) {
							this.setState({ message: `This "${this.state.currentUser.email}" password has been reset.` });
						} else if (result.message) {
							this.setState({ message: `This user account is temporarily locked. Please try again in 5 minutes.` });
						} else {
							this.setState({
								message: `Something went wrong and the password for "${this.state.currentUser.email}" was not changed. Please try again later. If the user hasn't activated their account yet, please re-send their activation email to set their password.`,
							});
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

			handleDrpRole = (role) => {
				this.setState((prevState) => ({
					fields: {
						...prevState.fields,
						role: role,
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
					userOid: null,
					selectedSchools: this.state.selectedSchools,
					selectedRoles: this.state.selectedRoles,
				});
			};

			fetchFilters() {
				const parsed = queryString.parse(this.props.location.search);
				let filter_schools = parsed.filter_schools;
				this.props
					.api("/auth/user-get-filters", {
						filter_schools: filter_schools ? filter_schools : null,
					})
					.then((result) => {
						let resultFilter = result.result;
						let filters = [];
						let schoolData, rolesData, rolesArray, selectedSchools;
						/** bind the filter data */
						for (const item in resultFilter) {
							filters.push(resultFilter[item]);
						}
						//bind filters group data according to user role
						if (filters) {
							let userDetails = this.props.withAuthConsumer_myUserDetails.role;
							rolesArray = filters.find((filter) => filter.id === "roles");
							rolesData = rolesArray ? this.arrayMapping(rolesArray.data) : null;
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
								rolesData: rolesData,
								userRoles: rolesArray.data,
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
				//bind new filter data of school and roles
				switch (filterName.toLowerCase()) {
					case "school":
						this.setState({ selectedSchools: selected });
						break;
					case "roles":
						this.setState({ selectedRoles: selected });
						break;
					case "query":
						this.setState({ query: selected });
						break;
				}
			};

			/** Mapping array for filter dropdown */
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
				this.setState({ query: "", selectedSchools: [], selectedRoles: [], message: null });
				this.pushHistory({ query: "", offset: 0, action: ACTION_LIST, userOid: null, selectedSchools: [], selectedRoles: [] });
			}

			/**Get selected filter in array
			 * like [{filter : "school", values: ["test 1", "test 2"]}]
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

			render() {
				const { userData, fields, message } = this.state;
				//We are getting the status filter data but we are not filter with the status Data
				const filtersLength = this.state.filters ? this.state.filters.length - 1 : 0;
				let userTable = <AdminPageMessage> No results found</AdminPageMessage>;
				let userForm = "";

				if (!this.state.usersLoaded) {
					userTable = (
						<AdminPageMessage>
							<Loader />
						</AdminPageMessage>
					);
				}

				if (userData !== null && userData.length !== 0) {
					userTable = (
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
								noToggleColumns={this.state.noToggleColumns}
							/>

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
					userForm = (
						<UserAddEdit
							key={fields.oid || "__NEW__"}
							handleSubmit={this.handleSubmit}
							cancelAddEdit={this.cancelAddEdit}
							message={message}
							fields={fields}
							resetPassword={this.resetPassword}
							action={this.state.action}
							userRoles={this.state.userRoles}
							userTitles={this.state.userTitles}
							deleteUser={this.deleteUser}
							currentUserRole={this.props.withAuthConsumer_myUserDetails.role}
							handleDrpChange={this.handleDrpChange}
							handleDrpRole={this.handleDrpRole}
							handleNameInputField={this.handleNameInputField}
							loginUserEmail={this.props.withAuthConsumer_myUserDetails.email}
							api={this.props.api}
							blockedFields={this.state.blockedFields}
						/>
					);
				}

				return (
					<>
						<HeadTitle title={PageTitle.user} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<AdminPageWrap pageTitle="Users" id={JUMP_TO_CONTENT_ID}>
							<PageDetail>
								<SearchSectionOne>
									<FilterSectionHalf>
										{this.state.filters ? (
											<UserSearchFilters
												schoolData={this.state.schoolData}
												rolesData={this.state.rolesData}
												selectedSchools={this.state.selectedSchools}
												selectedRoles={this.state.selectedRoles}
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
										<SectionHalf>
											<Button
												title="Create User"
												name="create-new"
												hide={this.state.action === ACTION_NEW || this.state.action === ACTION_ADDED}
												onClick={this.createUser}
												setBottom={filtersLength === 1 ? "20px" : 0}
											>
												<ButtonText>Create User</ButtonText>
												<i className="fa fa-plus" size="sm" />
											</Button>
										</SectionHalf>
									</FilterSectionHalf>
								</SearchSectionOne>
								<WrapperDiv>
									<AdminPageFilterMessage>{this.state.searchFilterText}</AdminPageFilterMessage>
									{userTable}
									{userForm}
								</WrapperDiv>
							</PageDetail>
						</AdminPageWrap>
					</>
				);
			}
		}
	)
);
