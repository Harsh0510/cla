import React from "react";
import withAdminAuthRequiredConsumer from "../../common/withAdminAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Header from "../../widgets/Header";
import queryString from "query-string";
import theme from "../../common/theme";
import SchoolAddEdit from "./SchoolAddEdit";
import SchoolSearchFilters from "../../widgets/SchoolSearchFilters";
import UserRole from "../../common/UserRole";
import userDidChange from "../../common/userDidChange";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import AdminPageWrap from "../../widgets/AdminPageWrap";
import AdminPageFilterMessage from "../../widgets/AdminPageFilterMessage";
import getSearchFilterText from "../../common/getSearchFilterText";
import smoothScrollTo from "../../common/smoothScroll";
import SchoolTableGrid from "../../widgets/SchoolTableGrid";
import { SectionHalf, PageDetail, Button, SearchSectionOne, FilterSectionHalf, WrapperDiv } from "../../widgets/AdminStyleComponents";

const byId = require("../../common/byId");

//get data from controller/app/common
const TERRITORIES = require("../../../../../Controller/app/common/territories");
const SCHOOLLEVELS = require("../../../../../Controller/app/common/school-levels");
const SCHOOLTYPES = require("../../../../../Controller/app/common/school-types");

const ACTION_LIST = "list";
const ACTION_NEW = "new";
const ACTION_ADDED = "added";
const ACTION_EDIT = "edit";

/* This constant is used for showing filter text */
const AVAILABLE_FILTERS = [
	{ name: "Territory", stateKey: "selectedTerritory" },
	{ name: "Institution Level", stateKey: "selectedSchoolLevel" },
	{ name: "Institution", stateKey: "selectedSchools" },
	{ name: "Institution Type", stateKey: "selectedSchoolType" },
];

const JUMP_TO_CONTENT_ID = "main-content";

const UsersLink = styled(Link)`
	color: ${theme.colours.primary};
	text-decoration: underline;
`;

const ButtonText = styled.span`
	margin-right: 0.5rem;
`;

export default withAdminAuthRequiredConsumer(
	{ "cla-admin": true },
	withApiConsumer(
		class SchoolsPage extends React.PureComponent {
			constructor(props) {
				super(props);
				this.state = {
					limit: 10,
					offset: 0,
					sort_field: "name",
					sort_dir: "A",
					query: "",
					loading: true,
					schoolsLoaded: false,
					unfiltered_count: 3,
					schoolsData: [],
					action: ACTION_LIST,
					message: null,
					fields: {
						id: "",
						identifier: "",
						name: "",
						address1: "",
						address2: "",
						city: "",
						county: "",
						post_code: "",
						territory: "",
						local_authority: "",
						school_level: "",
						school_type: "",
						school_home_page: "",
						number_of_students: "",
						wonde_approved: "",
						enable_wonde_user_sync: false,
						enable_wonde_class_sync: false,
						can_edit_blocked_fields: true,
						gsg: "",
						dfe: "",
						seed: "",
						nide: "",
						hwb_identifier: "",
					},
					territories: TERRITORIES,
					schoolLevels: SCHOOLLEVELS,
					schoolTypes: SCHOOLTYPES,
					id: "",
					currentschooldbdata: null,
					filters: null,
					territoryData: null,
					levelData: null,
					typeData: null,
					selectedTerritory: [],
					selectedSchoolLevel: [],
					selectedSchoolType: [],
					selectedSchools: [],
					schoolData: null,
					setOption: {
						value: "",
						label: "",
						key: "",
					},
					blockedFields: new Set(),
					searchFilterText: null,
				};
				this.resetAll = this.resetAll.bind(this);
				this._handlefilterSelection = this.handlefilterSelection.bind(this);
				this._doPagination = this.doPagination.bind(this);
				this._doSorting = this.doSorting.bind(this);
				this._doOpenEditScreen = this.doOpenEditScreen.bind(this);
			}

			componentDidMount() {
				this.fetchFilters();
				this.updateState();
				this.props.api(`/admin/school-get-uneditable-fields`).then((result) => {
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
					let id = parsed.id !== undefined ? parsed.id : this.state.id;

					let sortField = parsed.sort_field || "name";
					let sortDir = parsed.sort_dir || "A";
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

					// get filters from query params
					for (const key in parsed) {
						if (key.indexOf("filter_") === 0 && parsed[key]) {
							const filterGroupId = key.slice("filter_".length);
							const selectedValues = parsed[key].split(",");
							const selectedMap = [];
							for (const value of selectedValues) {
								if (filterGroupId === "schools") {
									selectedMap.push(parseInt(value));
								} else if (filterGroupId === "territory") {
									selectedMap.push(value);
								} else if (filterGroupId === "school_level") {
									selectedMap.push(value);
								} else {
									selectedMap.push(value);
								}
							}
							newState.selected[filterGroupId] = selectedMap;
						}
					}
					//check the selected territory value and if extis then store in state value
					if (newState.selected.hasOwnProperty("territory") && Array.isArray(newState.selected.territory) && newState.selected.territory.length > 0) {
						let arr = newState.selected.territory;
						let bindSelectedTerritory = this.state.territoryData.filter((d) => arr.some((s) => s === d.value));
						newState.selectedTerritory = bindSelectedTerritory;
					}

					//check the selected school_level value and if extis then store in state value
					if (
						newState.selected.hasOwnProperty("school_level") &&
						Array.isArray(newState.selected.school_level) &&
						newState.selected.school_level.length > 0
					) {
						let arr = newState.selected.school_level;
						let bindSelectedSchoolLevel = this.state.levelData.filter((d) => arr.some((s) => s === d.value));
						newState.selectedSchoolLevel = bindSelectedSchoolLevel;
					}

					//check the selected school_type value and if extis then store in state value
					if (
						newState.selected.hasOwnProperty("school_type") &&
						Array.isArray(newState.selected.school_type) &&
						newState.selected.school_type.length > 0
					) {
						let arr = newState.selected.school_type;
						let bindSelectedSchoolType = this.state.typeData.filter((d) => arr.some((s) => s === d.value));
						newState.selectedSchoolType = [];
						newState.selectedSchoolType = bindSelectedSchoolType;
					}

					this.setState(newState, this.performQuery);
				}
			}

			/**
			 * Get selected filter in array
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
			 * Get Schools information
			 */
			performQuery() {
				this.props
					.api("/admin/school-get-all", {
						limit: this.state.limit,
						offset: this.state.offset,
						sort_field: this.state.sort_field,
						sort_direction: this.state.sort_dir,
						query: this.state.query,
						filter: this.state.selected,
					})
					.then((result) => {
						const fields = Object.assign({}, this.state.fields);
						let schoolDetails = [];

						if (this.state.action === ACTION_NEW || this.state.action === ACTION_ADDED) {
							fields.id = this.state.action;
							fields.identifier = "";
							fields.name = "";
							fields.address1 = "";
							fields.address2 = "";
							fields.city = "";
							fields.county = "";
							fields.post_code = "";
							fields.territory = "";
							fields.local_authority = "";
							fields.school_level = "";
							fields.school_type = "";
							fields.school_home_page = "";
							fields.number_of_students = "";
							fields.wonde_approved = "";
							fields.can_edit_blocked_fields = true;
							fields.gsg = "";
							fields.dfe = "";
							fields.seed = "";
							fields.nide = "";
							fields.hwb_identifier = "";
						} else if (this.state.action == ACTION_EDIT && this.state.id && (schoolDetails = result.data.find((row) => row.id == this.state.id))) {
							fields.id = schoolDetails.id;
							fields.identifier = schoolDetails.identifier;
							fields.name = schoolDetails.name;
							fields.address1 = schoolDetails.address1;
							fields.address2 = schoolDetails.address2;
							fields.city = schoolDetails.city;
							fields.county = schoolDetails.county;
							fields.post_code = schoolDetails.post_code;
							fields.territory = schoolDetails.territory;
							fields.local_authority = schoolDetails.local_authority;
							fields.school_level = schoolDetails.school_level;
							fields.school_type = schoolDetails.school_type;
							fields.school_home_page = schoolDetails.school_home_page;
							fields.number_of_students = schoolDetails.number_of_students;
							fields.wonde_approved = schoolDetails.wonde_approved;
							fields.enable_wonde_user_sync = schoolDetails.enable_wonde_user_sync;
							fields.enable_wonde_class_sync = schoolDetails.enable_wonde_class_sync;
							fields.can_edit_blocked_fields = schoolDetails.can_edit_blocked_fields;
							fields.gsg = schoolDetails.gsg;
							fields.dfe = schoolDetails.dfe;
							fields.seed = schoolDetails.seed;
							fields.nide = schoolDetails.nide;
							fields.hwb_identifier = schoolDetails.hwb_identifier;
						}
						let selected_Filter = this.getSelectedFilters();
						let searchFilterText = getSearchFilterText(
							this.state.limit,
							this.state.offset,
							this.state.query,
							selected_Filter,
							result.unfiltered_count
						);
						this.setState({
							schoolsLoaded: true,
							searchFilterText: searchFilterText,
							schoolsData: result.data,
							unfiltered_count: result.unfiltered_count,
							fields: fields,
							currentschooldbdata: fields,
						});
					})
					.catch((result) => {
						this.setState({ message: result.toString() });
					});
			}

			doOpenEditScreen = (e) => {
				e.preventDefault();
				const id = e.currentTarget.getAttribute("data-id");
				this.setState({
					/* reset all filters and query */
					query: "",
					selectedTerritory: [],
					selectedSchoolLevel: [],
					selectedSchoolType: [],
					selectedSchools: [],
					message: null,
				});
				this.pushHistory({
					id: id,
					action: ACTION_EDIT,
					selectedSchools: this.state.selectedSchools,
					selectedTerritory: this.state.selectedTerritory,
					selectedSchoolLevel: this.state.selectedSchoolLevel,
					selectedSchoolType: this.state.selectedSchoolType,
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
					id: this.state.id,
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

				// if selectedTerritory extis in the query
				if (extra.hasOwnProperty("selectedTerritory") && Array.isArray(extra.selectedTerritory) && extra.selectedTerritory.length > 0) {
					let territory = [];
					for (const item of extra.selectedTerritory) {
						territory.push(item.value);
					}
					obj["filter_territory"] = territory.join(",");
					delete extra.selectedTerritory;
				}

				// if selectedSchoolLevel extis in the query
				if (extra.hasOwnProperty("selectedSchoolLevel") && Array.isArray(extra.selectedSchoolLevel) && extra.selectedSchoolLevel.length > 0) {
					let schoollevel = [];
					for (const item of extra.selectedSchoolLevel) {
						schoollevel.push(item.value);
					}
					obj["filter_school_level"] = schoollevel.join(",");
					delete extra.selectedSchoolLevel;
				}

				// if selectedSchoolType extis in the query
				if (extra.hasOwnProperty("selectedSchoolType") && Array.isArray(extra.selectedSchoolType) && extra.selectedSchoolType.length > 0) {
					let schoolType = [];
					for (const item of extra.selectedSchoolType) {
						schoolType.push(item.value);
					}
					obj["filter_school_type"] = schoolType.join(",");
					delete extra.selectedSchoolType;
				}

				Object.assign(obj, extra || {});
				return queryString.stringify(obj);
			}

			/**
			 * Push history
			 */
			pushHistory(extra) {
				const url = "/profile/admin/institutions?" + this.getQueryString(extra);
				this.props.history.push(url);
			}

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
					selectedTerritory: this.state.selectedTerritory,
					selectedSchoolLevel: this.state.selectedSchoolLevel,
					selectedSchoolType: this.state.selectedSchoolType,
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
					selectedTerritory: this.state.selectedTerritory,
					selectedSchoolLevel: this.state.selectedSchoolLevel,
					selectedSchoolType: this.state.selectedSchoolType,
				});
			};

			/**
			 * Create User
			 */
			createSchool = () => {
				this.setState(
					{
						query: "",
						selectedTerritory: [],
						selectedSchoolLevel: [],
						selectedSchoolType: [],
						selectedSchools: [],
						message: null,
					},
					() => {
						this.pushHistory({
							action: ACTION_NEW,
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
					id: null,
				});
			};

			/**
			 * Handles the form submission and attempts to add a new user to the database
			 */
			handleSubmit = (data) => {
				if (this.state.action == ACTION_NEW || this.state.action == ACTION_ADDED) {
					const params = {
						identifier: data.identifier,
						name: data.name,
						address1: data.address1,
						address2: data.address2,
						city: data.city,
						county: data.county,
						post_code: data.post_code,
						territory: data.territory,
						local_authority: data.local_authority,
						school_level: data.school_level,
						school_type: data.school_type,
						school_home_page: data.school_home_page,
						number_of_students: parseInt(data.number_of_students, 10),
					};

					this.props
						.api("/admin/school-create", params)
						.then((result) => {
							if (result.success) {
								this.setState({
									message: (
										<>
											Institution created successfully. Please <UsersLink to="/profile/admin/users">click here</UsersLink> to create an institution
											admin for this institution.
										</>
									),
								});
								if (this.state.action === ACTION_NEW) {
									this.pushHistory({ action: ACTION_ADDED });
								}
							}
						})
						.catch((result) => {
							this.setState({ message: result.toString() });
						});
				} else if (this.state.action == ACTION_EDIT && this.state.currentschooldbdata) {
					const params = this.getFieldValuesForUpdate(this.state.currentschooldbdata, data);
					if (!this.state.fields.can_edit_blocked_fields) {
						for (const field of this.state.blockedFields) {
							delete params[field];
						}
					}
					this.props
						.api("/admin/school-update", params)
						.then((result) => {
							if (result) {
								this.setState({ message: "Successfully updated." });
								this.performQuery();
							}
						})
						.catch((result) => {
							this.setState({ message: result.toString() });
						});
				}
			};

			/**
			 * Get fileds which require need to be update
			 * @param {object} currentSchoolDBData existing school details
			 * @param {object} updatedSchoolDetail User Updated school details
			 */
			getFieldValuesForUpdate = (currentSchoolDBData, updatedSchoolDetail) => {
				let params = Object.create(null);

				if (currentSchoolDBData.identifier != updatedSchoolDetail.identifier) {
					params.identifier = updatedSchoolDetail.identifier;
				}

				if (currentSchoolDBData.name != updatedSchoolDetail.name) {
					params.name = updatedSchoolDetail.name;
				}

				if (currentSchoolDBData.address1 != updatedSchoolDetail.address1) {
					params.address1 = updatedSchoolDetail.address1;
				}

				if (currentSchoolDBData.address2 != updatedSchoolDetail.address2) {
					params.address2 = updatedSchoolDetail.address2;
				}

				if (currentSchoolDBData.city != updatedSchoolDetail.city) {
					params.city = updatedSchoolDetail.city;
				}

				if (updatedSchoolDetail.county === "") {
					updatedSchoolDetail.county = null;
				}

				if (currentSchoolDBData.county != updatedSchoolDetail.county) {
					params.county = updatedSchoolDetail.county;
				}

				if (currentSchoolDBData.post_code != updatedSchoolDetail.post_code) {
					params.post_code = updatedSchoolDetail.post_code;
				}

				if (currentSchoolDBData.territory != updatedSchoolDetail.territory) {
					params.territory = updatedSchoolDetail.territory;
				}

				if (currentSchoolDBData.local_authority != updatedSchoolDetail.local_authority) {
					params.local_authority = updatedSchoolDetail.local_authority;
				}

				if (updatedSchoolDetail.school_level === "") {
					updatedSchoolDetail.school_level = null;
				}

				if (currentSchoolDBData.school_level != updatedSchoolDetail.school_level) {
					params.school_level = updatedSchoolDetail.school_level;
				}

				if (updatedSchoolDetail.school_type === "") {
					updatedSchoolDetail.school_type = null;
				}

				if (currentSchoolDBData.school_type != updatedSchoolDetail.school_type) {
					params.school_type = updatedSchoolDetail.school_type;
				}

				if (updatedSchoolDetail.school_home_page === "") {
					updatedSchoolDetail.school_home_page = null;
				}

				if (currentSchoolDBData.school_home_page != updatedSchoolDetail.school_home_page) {
					params.school_home_page = updatedSchoolDetail.school_home_page;
				}

				if (updatedSchoolDetail.number_of_students === "") {
					updatedSchoolDetail.number_of_students = null;
				}

				if (currentSchoolDBData.number_of_students != updatedSchoolDetail.number_of_students) {
					params.number_of_students = parseInt(updatedSchoolDetail.number_of_students, 10);
				}

				if (currentSchoolDBData.enable_wonde_class_sync != updatedSchoolDetail.enable_wonde_class_sync) {
					params.enable_wonde_class_sync = updatedSchoolDetail.enable_wonde_class_sync;
				}

				if (currentSchoolDBData.enable_wonde_user_sync != updatedSchoolDetail.enable_wonde_user_sync) {
					params.enable_wonde_user_sync = updatedSchoolDetail.enable_wonde_user_sync;
				}

				if (updatedSchoolDetail.gsg === "") {
					updatedSchoolDetail.gsg = null;
				}
				if (currentSchoolDBData.gsg != updatedSchoolDetail.gsg) {
					params.gsg = updatedSchoolDetail.gsg;
				}
				if (updatedSchoolDetail.dfe === "") {
					updatedSchoolDetail.dfe = null;
				}
				if (currentSchoolDBData.dfe != updatedSchoolDetail.dfe) {
					params.dfe = updatedSchoolDetail.dfe;
				}
				if (updatedSchoolDetail.seed === "") {
					updatedSchoolDetail.seed = null;
				}
				if (currentSchoolDBData.seed != updatedSchoolDetail.seed) {
					params.seed = updatedSchoolDetail.seed;
				}
				if (updatedSchoolDetail.nide === "") {
					updatedSchoolDetail.nide = null;
				}
				if (currentSchoolDBData.nide != updatedSchoolDetail.nide) {
					params.nide = updatedSchoolDetail.nide;
				}
				if (updatedSchoolDetail.hwb_identifier === "") {
					updatedSchoolDetail.hwb_identifier = null;
				}
				if (currentSchoolDBData.hwb_identifier != updatedSchoolDetail.hwb_identifier) {
					params.hwb_identifier = updatedSchoolDetail.hwb_identifier;
				}

				params.id = parseInt(this.state.id);

				return params;
			};

			/**
			 * Delete the school after confirmation from class
			 */
			deleteSchool = () => {
				this.props
					.api("/admin/school-delete", { id: parseInt(this.state.id) })
					.then((result) => {
						if (result.result) {
							this.setState({ message: "Institution deleted successfully." });
							if (this.state.offset >= this.state.unfiltered_count - 1) {
								this.setState({ offset: 0 });
							}
							this.pushHistory({ action: ACTION_LIST, id: null });
						} else {
							this.setState({ message: "Error deleting institution" });
						}
					})
					.catch((result) => {
						this.setState({ message: result.toString() });
					});
			};

			doSearch = () => {
				this.setState({ message: null });
				this.pushHistory({
					query: this.state.query,
					offset: 0,
					action: ACTION_LIST,
					id: null,
					selectedSchools: this.state.selectedSchools,
					selectedTerritory: this.state.selectedTerritory,
					selectedSchoolLevel: this.state.selectedSchoolLevel,
					selectedSchoolType: this.state.selectedSchoolType,
				});
			};

			fetchFilters() {
				const parsed = queryString.parse(this.props.location.search);
				let filter_schools = parsed.filter_schools;
				this.props
					.api("/admin/school-get-filters", {
						filter_schools: filter_schools ? filter_schools : null,
					})
					.then((result) => {
						let resultFilter = result.result;
						let filters = [];
						let territoryData, levelData, typeData, schoolData, selectedSchools;
						/** bind the filter data */
						for (const item in resultFilter) {
							filters.push(resultFilter[item]);
						}
						//bind filters group data
						if (filters) {
							let userDetails = this.props.withAuthConsumer_myUserDetails.role;
							let territoryArray = filters.find((filter) => filter.id === "territory");
							territoryData = territoryArray ? this.arrayMapping(territoryArray.data) : null;
							let levelArray = filters.find((filter) => filter.id === "school_level");
							levelData = levelArray ? this.arrayMapping(levelArray.data) : null;
							let typeArray = filters.find((filter) => filter.id === "school_type");
							typeData = typeArray ? this.arrayMapping(typeArray.data) : null;
							if (userDetails && userDetails === UserRole.claAdmin) {
								let schoolArray = filters.find((filter) => filter.id === "schools");
								schoolData = schoolArray ? this.arrayMapping(schoolArray.data) : null;
								//check the selected school value and if extis then store in state value
								if (schoolData) {
									selectedSchools = schoolData;
								}
							}
						}
						this.setState(
							{
								filters: filters,
								territoryData: territoryData,
								levelData: levelData,
								typeData: typeData,
								schoolData: schoolData,
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
				//bind new filter data of territory, school_level and school_type
				let newSelectedData = [];
				switch (filterName.toLowerCase()) {
					case "territory":
						this.setState({ selectedTerritory: selected });
						break;
					case "school_level":
						this.setState({ selectedSchoolLevel: selected });
						break;
					case "school_type":
						this.setState({ selectedSchoolType: selected });
						break;
					case "query":
						this.setState({ query: selected });
						break;
					case "school":
						this.setState({ selectedSchools: selected });
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
				this.setState({ query: "", selectedTerritory: [], selectedSchoolLevel: [], selectedSchoolType: [], selectedSchools: [], message: null });
				this.pushHistory({
					query: "",
					offset: 0,
					action: ACTION_LIST,
					userOid: null,
					selectedTerritory: [],
					selectedSchoolLevel: [],
					selectedSchoolType: [],
					selectedSchools: [],
				});
			}

			handleNameInputField = (inputFieldValue, inputFieldName) => {
				let fields = Object.assign({}, this.state.fields);
				fields[inputFieldName] = inputFieldValue;
				this.setState({ fields: fields });
			};

			render() {
				const { schoolsData, fields, message, examBoards } = this.state;
				const filtersLength = this.state.filters ? this.state.filters.length : 0;
				const schoolIdentifier = this.state.currentschooldbdata ? this.state.currentschooldbdata.identifier : "__new_school_identifier__";
				let schoolForm = "";

				const isClaAdmin = this.props.withAuthConsumer_myUserDetails.role === UserRole.claAdmin;

				if (this.state.action === ACTION_NEW || this.state.action === ACTION_EDIT || this.state.action === ACTION_ADDED) {
					schoolForm = (
						<SchoolAddEdit
							key={fields.id + "_" + schoolIdentifier || "__NEW__"}
							handleSubmit={this.handleSubmit}
							cancelAddEdit={this.cancelAddEdit}
							message={message}
							fields={fields}
							examBoards={examBoards}
							action={this.state.action}
							deleteSchool={this.deleteSchool}
							territories={this.state.territories}
							schoolLevels={this.state.schoolLevels}
							schoolTypes={this.state.schoolTypes}
							handleNameInputField={this.handleNameInputField}
							schoolData={schoolsData}
							currentUserRole={this.props.withAuthConsumer_myUserDetails.role}
							blockedFields={this.state.blockedFields}
						/>
					);
				}

				return (
					<>
						<HeadTitle title={PageTitle.schools} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<AdminPageWrap pageTitle={"Institutions"} id={JUMP_TO_CONTENT_ID}>
							<PageDetail>
								<SearchSectionOne>
									<FilterSectionHalf>
										{this.state.filters ? (
											<SchoolSearchFilters
												schoolData={this.state.schoolData}
												territoryData={this.state.territoryData}
												levelData={this.state.levelData}
												typeData={this.state.typeData}
												selectedSchools={this.state.selectedSchools}
												selectedTerritory={this.state.selectedTerritory}
												selectedSchoolLevel={this.state.selectedSchoolLevel}
												selectedSchoolType={this.state.selectedSchoolType}
												handlefilterSelection={this._handlefilterSelection}
												filterText={this.state.query}
												queryPlaceHolderText={" Search .."}
												doSearch={this.doSearch}
												resetAll={this.resetAll}
												filtersLength={filtersLength}
												currentUserRole={this.props.withAuthConsumer_myUserDetails.role}
												api={this.props.api}
											/>
										) : null}
									</FilterSectionHalf>
									<SectionHalf>
										<Button
											title="Create Institution"
											name="create-new"
											hide={this.state.action === ACTION_NEW || this.state.action === ACTION_ADDED}
											onClick={this.createSchool}
											setBottom={filtersLength >= 4 ? "20px" : 0}
										>
											<ButtonText>Create Institution</ButtonText>
											<i className="fa fa-plus" size="sm" />
										</Button>
									</SectionHalf>
								</SearchSectionOne>
								<WrapperDiv>
									<AdminPageFilterMessage>{this.state.searchFilterText}</AdminPageFilterMessage>
									<SchoolTableGrid
										schoolsData={this.state.schoolsData}
										unfilteredCount={this.state.unfiltered_count}
										schoolLimit={this.state.limit}
										schoolOffset={this.state.offset}
										loading={this.state.loading}
										schoolsLoaded={this.state.schoolsLoaded}
										sortField={this.state.sort_field}
										sortDir={this.state.sort_dir}
										doSorting={this._doSorting}
										doPagination={this._doPagination}
										withRollover={false}
										doOpenEditScreen={this._doOpenEditScreen}
										showIdColumn={isClaAdmin}
									/>
									{schoolForm}
								</WrapperDiv>
							</PageDetail>
						</AdminPageWrap>
					</>
				);
			}
		}
	)
);
