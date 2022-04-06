import React from "react";
import withAdminAuthRequiredConsumer from "../../common/withAdminAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import queryString from "query-string";
import SchoolSearchFilters from "../../widgets/SchoolSearchFilters";
import UserRole from "../../common/UserRole";
import userDidChange from "../../common/userDidChange";
import AdminPageFilterMessage from "../../widgets/AdminPageFilterMessage";
import getSearchFilterText from "../../common/getSearchFilterText";
import SchoolTableGrid from "../../widgets/SchoolTableGrid";
import { SearchSectionOne, FilterSectionHalf, WrapperDiv } from "../../widgets/AdminStyleComponents";

//get data from controller/app/common
const TERRITORIES = require("../../../../../Controller/app/common/territories");
const SCHOOLLEVELS = require("../../../../../Controller/app/common/school-levels");
const SCHOOLTYPES = require("../../../../../Controller/app/common/school-types");

/* This constant is used for showing filter text */
const AVAILABLE_FILTERS = [
	{ name: "Territory", stateKey: "selectedTerritory" },
	{ name: "Institution Level", stateKey: "selectedSchoolLevel" },
	{ name: "Institution", stateKey: "selectedSchools" },
	{ name: "Institution Type", stateKey: "selectedSchoolType" },
];

export default withAdminAuthRequiredConsumer(
	{ "cla-admin": true },
	withApiConsumer(
		class SelectSchoolWithSearchFilter extends React.PureComponent {
			constructor(props) {
				super(props);
				this.state = {
					school_limit: 10,
					school_offset: 0,
					school_sort_field: "name",
					school_sort_dir: "A",
					school_query: "",
					loading: true,
					schoolsLoaded: false,
					unfiltered_count: 3,
					schoolsData: [],
					message: null,
					territories: TERRITORIES,
					schoolLevels: SCHOOLLEVELS,
					schoolTypes: SCHOOLTYPES,
					id: "",
					schoolFilters: null,
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
					searchFilterText: null,
					withRollover: false,
					hasSelectedAllSchools: false,
					schoolIds: [],
					selectedSchoolIdMap: Object.create(null),
				};
				this._resetSchoolSearchFilter = this.resetSchoolSearchFilter.bind(this);
				this._handlefilterSelection = this.handlefilterSelection.bind(this);
				this._doSortingForSchool = this.doSortingForSchool.bind(this);
				this._doPaginationForSchool = this.doPaginationForSchool.bind(this);
				this._doSchoolSearch = this.doSchoolSearch.bind(this);
			}

			componentDidMount() {
				this._isMounted = true;
				this.fetchFilters();
				this.updateState();
			}

			componentWillUnmount() {
				delete this._isMounted;
			}

			safeSetState(newState, cb) {
				if (!this._isMounted) {
					return;
				}
				if (cb) {
					this.setState(newState, () => {
						if (this._isMounted) {
							cb.call(this);
						}
					});
				} else {
					this.setState(newState);
				}
			}

			componentDidUpdate(prevProps, prevState) {
				//check if userDetails update
				if (userDidChange(this.props, prevProps)) {
					if (!this.state.schoolFilters) {
						this.fetchFilters();
					}
				}
				if (this.props.isResetSchoolFilter != prevProps.isResetSchoolFilter && this.props.isResetSchoolFilter) {
					this.resetSchoolSearchFilter();
				} else {
					if (JSON.stringify(this.props.queryLocationSearch) !== JSON.stringify(prevProps.queryLocationSearch)) {
						this.updateState();
					}
				}
			}

			updateState() {
				if (this.state.schoolFilters) {
					// const parsed = queryString.parse(this.props.location.search);
					const parsed = this.props.queryLocationSearch;

					let schoolLimit = parseInt(parsed.school_limit || 10, 10);
					if (schoolLimit < 1) {
						schoolLimit = 1;
					}

					let school_offset = parseInt(parsed.school_offset || 0, 10);
					if (school_offset < 0) {
						school_offset = 0;
					}

					let sortField = parsed.school_sort_field || "name";
					let sortDir = parsed.school_sort_dir || "A";
					let query = parsed.school_query || "";

					const newState = {
						school_limit: schoolLimit,
						school_offset: school_offset,
						school_sort_field: sortField,
						school_sort_dir: sortDir,
						school_query: query,
						selected: {},
					};

					for (const filter of this.state.schoolFilters) {
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

					this.safeSetState(newState, this.performQuery);
				}
			}

			/**
			 * Get selected filter in array
			 * like [{filter: "class", values: ["class 1", "class 2"]}]
			 */
			getSelectedSchoolFilters = () => {
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
						limit: this.state.school_limit,
						offset: this.state.school_offset,
						sort_field: this.state.school_sort_field,
						sort_direction: this.state.school_sort_dir,
						query: this.state.school_query,
						filter: this.state.selected,
						rollover_job_id: this.props.rolloverJobId || 0,
						with_rollover_job: this.props.withRollover,
					})
					.then((result) => {
						if (!this._isMounted) {
							return;
						}
						let selected_Filter = this.getSelectedSchoolFilters();
						let searchFilterText = getSearchFilterText(
							this.state.school_limit,
							this.state.school_offset,
							this.state.school_query,
							selected_Filter,
							result.unfiltered_count
						);
						this.safeSetState(
							{
								schoolsLoaded: true,
								searchFilterText: searchFilterText,
								schoolsData: result.data,
								unfiltered_count: result.unfiltered_count,
							},
							() => {
								const saveFilterData = {
									school_query: this.state.school_query,
									school_filter: this.state.selected,
								};
								this.props.saveSchoolSearchFiter(saveFilterData);
							}
						);
					});
			}

			/**
			 * get query string
			 */
			getQueryString(extra) {
				const obj = {
					school_limit: this.state.school_limit,
					school_offset: this.state.school_offset,
					school_sort_field: this.state.school_sort_field,
					school_sort_dir: this.state.school_sort_dir,
					school_query: this.state.school_query,
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
			pushHistory(extra, hasSelectedAll) {
				this.props.pushQueryString(this.getQueryString(extra), hasSelectedAll);
			}

			doPaginationForSchool = (page, school_limit) => {
				const currentPage = page == 0 ? 0 : page - 1;
				const setOffset = currentPage * school_limit;

				this.safeSetState({ school_offset: setOffset, school_limit: school_limit });
				this.pushHistory(
					{
						school_offset: setOffset,
						school_limit: school_limit,
						school_query: this.state.school_query,
						selectedSchools: this.state.selectedSchools,
						selectedTerritory: this.state.selectedTerritory,
						selectedSchoolLevel: this.state.selectedSchoolLevel,
						selectedSchoolType: this.state.selectedSchoolType,
					},
					this.props.hasSelectedAllSchools
				);
			};

			/**
			 * Handles the sorting data
			 */
			doSortingForSchool = (sorting) => {
				const columnSorting = sorting[0];
				const sortDirectionString = columnSorting.direction[0].toUpperCase();
				this.safeSetState({ loading: true });
				this.pushHistory(
					{
						school_sort_field: columnSorting.columnName,
						school_sort_dir: sortDirectionString,
						school_offset: 0,
						school_query: this.state.school_query,
						selectedSchools: this.state.selectedSchools,
						selectedTerritory: this.state.selectedTerritory,
						selectedSchoolLevel: this.state.selectedSchoolLevel,
						selectedSchoolType: this.state.selectedSchoolType,
					},
					this.props.hasSelectedAllSchools
				);
			};

			fetchFilters() {
				//const parsed = queryString.parse(this.props.location.search);
				const parsed = this.props.queryLocationSearch;
				let filter_schools = parsed.filter_schools;
				this.props
					.api("/admin/school-get-filters", {
						filter_schools: filter_schools ? filter_schools : null,
					})
					.then((result) => {
						let resultFilter = result.result;
						let schoolFilters = [];
						let territoryData, levelData, typeData, schoolData, selectedSchools;
						/** bind the filter data */
						for (const item in resultFilter) {
							schoolFilters.push(resultFilter[item]);
						}
						//bind filters group data
						if (schoolFilters) {
							let userDetails = this.props.withAuthConsumer_myUserDetails.role;
							let territoryArray = schoolFilters.find((filter) => filter.id === "territory");
							territoryData = territoryArray ? this.arrayMapping(territoryArray.data) : null;
							let levelArray = schoolFilters.find((filter) => filter.id === "school_level");
							levelData = levelArray ? this.arrayMapping(levelArray.data) : null;
							let typeArray = schoolFilters.find((filter) => filter.id === "school_type");
							typeData = typeArray ? this.arrayMapping(typeArray.data) : null;
							if (userDetails && userDetails === UserRole.claAdmin) {
								let schoolArray = schoolFilters.find((filter) => filter.id === "schools");
								schoolData = schoolArray ? this.arrayMapping(schoolArray.data) : null;
								//check the selected school value and if extis then store in state value
								if (schoolData) {
									selectedSchools = schoolData;
								}
							}
						}
						this.safeSetState(
							{
								schoolFilters: schoolFilters,
								territoryData: territoryData,
								levelData: levelData,
								typeData: typeData,
								schoolData: schoolData,
								selectedSchools: selectedSchools,
							},
							this.updateState
						);
					});
			}

			/** fill the state new value */
			handlefilterSelection = (selected, filterName) => {
				//bind new filter data of territory, school_level and school_type
				switch (filterName.toLowerCase()) {
					case "territory":
						this.safeSetState({ selectedTerritory: selected });
						break;
					case "school_level":
						this.safeSetState({ selectedSchoolLevel: selected });
						break;
					case "school_type":
						this.safeSetState({ selectedSchoolType: selected });
						break;
					case "query":
						this.safeSetState({ school_query: selected });
						break;
					case "school":
						this.safeSetState({ selectedSchools: selected });
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

			/**set indeterminate on select all checkbox */
			manageSelectAllCheckBox() {
				if (this.props._selectAllRef.current && this.props.selectedSchoolIdMap) {
					if (Object.keys(this.props.selectedSchoolIdMap).length > 0) {
						this.props._selectAllRef.current.indeterminate = true;
					} else {
						this.props._selectAllRef.current.indeterminate = false;
					}
				}
			}

			resetSchoolSearchFilter() {
				this.safeSetState(
					{
						school_query: "",
						selectedTerritory: [],
						selectedSchoolLevel: [],
						selectedSchoolType: [],
						selectedSchools: [],
					},
					() => {
						this.manageSelectAllCheckBox();
						this.pushHistory(
							{
								school_query: "",
								school_offset: 0,
								selectedTerritory: [],
								selectedSchoolLevel: [],
								selectedSchoolType: [],
								selectedSchools: [],
							},
							false
						);
					}
				);
			}

			doSchoolSearch = () => {
				this.manageSelectAllCheckBox();
				this.pushHistory(
					{
						school_query: this.state.school_query,
						school_offset: 0,
						selectedSchools: this.state.selectedSchools,
						selectedTerritory: this.state.selectedTerritory,
						selectedSchoolLevel: this.state.selectedSchoolLevel,
						selectedSchoolType: this.state.selectedSchoolType,
					},
					false
				);
			};

			render() {
				const { withRollover, hasSelectedAllSchools, selectedSchoolIdMap, onChangeSelectedAllCheckbox, onChangeSchoolCheckBox } = this.props;
				const {
					schoolFilters,
					schoolData,
					territoryData,
					levelData,
					typeData,
					selectedSchools,
					selectedTerritory,
					selectedSchoolLevel,
					selectedSchoolType,
					school_query,
					schoolsData,
					unfiltered_count,
					school_limit,
					school_offset,
					loading,
					schoolsLoaded,
					school_sort_field,
					school_sort_dir,
				} = this.state;
				const schoolFiltersLength = this.state.schoolFilters ? this.state.schoolFilters.length : 0;

				return (
					<>
						<SearchSectionOne>
							<FilterSectionHalf>
								{schoolFilters ? (
									<SchoolSearchFilters
										schoolData={schoolData}
										territoryData={territoryData}
										levelData={levelData}
										typeData={typeData}
										selectedSchools={selectedSchools}
										selectedTerritory={selectedTerritory}
										selectedSchoolLevel={selectedSchoolLevel}
										selectedSchoolType={selectedSchoolType}
										handlefilterSelection={this._handlefilterSelection}
										filterText={school_query}
										queryPlaceHolderText={" Search .."}
										doSearch={this._doSchoolSearch}
										resetAll={this._resetSchoolSearchFilter}
										filtersLength={schoolFiltersLength}
										currentUserRole={this.props.withAuthConsumer_myUserDetails.role}
										api={this.props.api}
									/>
								) : null}
							</FilterSectionHalf>
						</SearchSectionOne>
						<WrapperDiv>
							<AdminPageFilterMessage>{this.state.searchFilterText}</AdminPageFilterMessage>
							<SchoolTableGrid
								schoolsData={schoolsData}
								unfilteredCount={unfiltered_count}
								schoolLimit={school_limit}
								schoolOffset={school_offset}
								loading={loading}
								schoolsLoaded={schoolsLoaded}
								sortField={school_sort_field}
								sortDir={school_sort_dir}
								hasSelectedAllSchools={hasSelectedAllSchools}
								selectedSchoolIdMap={selectedSchoolIdMap}
								doSorting={this._doSortingForSchool}
								doPagination={this._doPaginationForSchool}
								withRollover={withRollover}
								onChangeSelectedAllCheckbox={onChangeSelectedAllCheckbox}
								onChangeSchoolCheckBox={onChangeSchoolCheckBox}
								_selectAllRef={this.props._selectAllRef}
								isHideSelect={this.props.isHideSelect}
							/>
						</WrapperDiv>
					</>
				);
			}
		}
	)
);
