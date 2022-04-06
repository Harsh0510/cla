import React from "react";
import withAdminAuthRequiredConsumer from "../../common/withAdminAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import Header from "../../widgets/Header";
import queryString from "query-string";
import Loader from "../../widgets/Loader";
import UserList from "./UserList";
import UserRole from "../../common/UserRole";
import UserSearchFilters from "../../widgets/UserSearchFilters";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import { SendGeneralEnquiry } from "../../widgets/SendEmailLink";
import AdminPageWrap from "../../widgets/AdminPageWrap";
import AdminPageMessage from "../../widgets/AdminPageMessage";
import AdminPageFilterMessage from "../../widgets/AdminPageFilterMessage";
import getSearchFilterText from "../../common/getSearchFilterText";
import userDidChange from "../../common/userDidChange";
import { PageDetail, SearchSectionOne, FilterSectionHalf, WrapperDiv } from "../../widgets/AdminStyleComponents";
import messageType from "../../common/messageType";
import { ResendVerificationEmailFailMessage, ResendSetPasswordEmailFailMessage } from "../../widgets/SendEmailLink";

const CREATE_USER_PAGE_LINK = "users?action=new";
const JUMP_TO_CONTENT_ID = "main-content";

/* This constant is used for showing filter text */
const AVAILABLE_FILTERS = [
	{ name: "School", stateKey: "selectedSchools" },
	{ name: "Role", stateKey: "selectedRoles" },
	{ name: "Status", stateKey: "selectedStatus" },
];

export default withAdminAuthRequiredConsumer(
	{ "cla-admin": true, "school-admin": true },
	withApiConsumer(
		class RegistrationQueuePage extends React.PureComponent {
			constructor(props) {
				super(props);
				this.state = {
					limit: 10,
					offset: 0,
					sort_field: "email",
					sort_dir: "A",
					query: "",
					loading: true,
					message: null,
					approvingOid: null,

					filters: null,
					schoolData: null,
					rolesData: null,
					statusData: null,
					selectedSchools: [],
					selectedRoles: [],
					selectedStatus: [],
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
			}

			componentDidUpdate(prevProps) {
				//check if userDetails update
				if (userDidChange(this.props, prevProps)) {
					this.fetchFilters();
				}
				if (this.props.location.search !== prevProps.location.search) {
					this.updateState();
				}
			}

			updateState() {
				if (this.state.filters) {
					const parsed = queryString.parse(this.props.location.search);
					const userRole = this.props.withAuthConsumer_myUserDetails.role;
					let limit = parseInt(parsed.limit || this.state.limit, 10);
					if (limit < 1) {
						limit = 1;
					}

					let offset = parseInt(parsed.offset || this.state.offset, 10);
					if (offset < 0) {
						offset = 0;
					}

					let sortField = parsed.sort_field || (userRole === UserRole.claAdmin ? "school" : "email");
					let sortDir = parsed.sort_dir || "A";
					let query = parsed.query || "";

					const newState = {
						limit: limit,
						offset: offset,
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

					//check the selected status value and if extis then store in state value
					if (newState.selected.hasOwnProperty("status") && Array.isArray(newState.selected.status) && newState.selected.status.length > 0) {
						let arr = newState.selected.status;
						let bindSelectedStatus = this.state.statusData.filter((d) => arr.some((s) => s === d.value));
						newState.selectedStatus = bindSelectedStatus;
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
				return new Promise((resolve, reject) => {
					this.props
						.api("/auth/user-get-all", {
							limit: this.state.limit,
							offset: this.state.offset,
							sort_field: this.state.sort_field,
							sort_direction: this.state.sort_dir,
							pending_status: "only_pending",
							query: this.state.query,
							filter: this.state.selected,
						})
						.then((result) => {
							searchFilterText = getSearchFilterText(this.state.limit, this.state.offset, this.state.query, selected_Filter, result.unfiltered_count);
							this.setState(
								{
									loading: false,
									resultData: result.data,
									resultUnfilteredCount: result.unfiltered_count,
									searchFilterText: searchFilterText,
								},
								resolve
							);
						})
						.catch((result) => {
							this.setState({ message: result }, reject);
						});
				});
			}

			doInitApprove = (e) => {
				e.preventDefault();
				const email = e.target.getAttribute("data-email");
				this.setState({ approvingOid: email });
			};

			doCompleteApprove = (e) => {
				e.preventDefault();
				const email = this.state.approvingOid;
				this.setState({ message: "Processing..." });
				this.props
					.api("/auth/user-approve", {
						email: email,
						role: new FormData(e.target).get("role"),
					})
					.then(() => {
						this.setState({ message: "User approved", approvingOid: null });
						this.performQuery();
					})
					.catch((result) => {
						this.setState({ message: result });
					});
			};

			doDismissApprove = (e) => {
				e.preventDefault();
				this.setState({ approvingOid: null });
			};

			doReject = (e) => {
				e.preventDefault();
				const email = e.target.getAttribute("data-email");
				this.setState({ message: "Processing..." });
				this.props
					.api("/auth/user-reject", {
						email: email,
					})
					.then(() => {
						this.performQuery().then(() => {
							this.setState({ message: "User rejected" });
						});
					})
					.catch((result) => {
						let errorMsg = result;
						if (errorMsg.indexOf("[") !== -1) {
							errorMsg = (
								<div>
									We are having trouble with your request. This user is still awaiting approval, they don't have access to your school account. Please{" "}
									<SendGeneralEnquiry myUserDetails={this.props.withAuthConsumer_myUserDetails} />.
								</div>
							);
						}
						this.setState({ message: errorMsg });
					});
			};

			doResendVerify = (e) => {
				e.preventDefault();
				const email = e.target.getAttribute("data-email");
				this.setState({ message: "Processing..." });
				this.props
					.api("/auth/user-resend-registration", {
						email: email,
					})
					.then((result) => {
						if (result.result) {
							this.performQuery().then(() => {
								this.setState({ message: "Verification email resent" });
							});
						} else {
							this.setState({
								message: <ResendVerificationEmailFailMessage user={result.user} as_administrator={true} />,
								messageType: messageType.error,
							});
						}
					})
					.catch((result) => {
						this.setState({ message: result });
					});
			};

			doResendSetPassword = (e) => {
				e.preventDefault();
				const email = e.target.getAttribute("data-email");
				this.setState({ message: "Processing..." });
				this.props
					.api("/auth/user-resend-registration", {
						email: email,
					})
					.then((result) => {
						if (result.result) {
							this.performQuery().then(() => {
								this.setState({ message: `'Set password' email resent` });
							});
						} else {
							this.setState({
								message: <ResendSetPasswordEmailFailMessage user={result.user} as_administrator={true} />,
								messageType: messageType.error,
							});
						}
					})
					.catch((result) => {
						this.setState({ message: result });
					});
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
					query: this.state.query,
					limit: setLimit,
					selectedSchools: this.state.selectedSchools,
					selectedRoles: this.state.selectedRoles,
					selectedStatus: this.state.selectedStatus,
				});
			};

			/**
			 * Handles the sorting data
			 */
			doSorting = (sorting) => {
				const columnSorting = sorting[0];
				const sortDirectionString = columnSorting.direction === "desc" ? "D" : "A";
				this.pushHistory({
					sort_field: columnSorting.columnName,
					sort_dir: sortDirectionString,
					offset: 0,
					loading: true,
					query: this.state.query,
					selectedSchools: this.state.selectedSchools,
					selectedRoles: this.state.selectedRoles,
					selectedStatus: this.state.selectedStatus,
				});
			};

			/**
			 * get query string
			 */
			getQueryString(extra) {
				const obj = {
					limit: this.state.limit,
					offset: this.state.offset,
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

				if (extra.hasOwnProperty("selectedStatus") && Array.isArray(extra.selectedStatus) && extra.selectedStatus.length > 0) {
					let status = [];
					for (const item of extra.selectedStatus) {
						status.push(item.value);
					}
					obj["filter_status"] = status.join(",");
					delete extra.selectedStatus;
				}
				Object.assign(obj, extra || {});
				return queryString.stringify(obj);
			}

			/**
			 * Push history
			 */
			pushHistory(extra) {
				const url = "/profile/admin/registration-queue?" + this.getQueryString(extra);
				this.props.history.push(url);
			}

			doSearch = () => {
				this.setState({ message: null });
				this.pushHistory({
					query: this.state.query,
					offset: 0,
					selectedSchools: this.state.selectedSchools,
					selectedRoles: this.state.selectedRoles,
					selectedStatus: this.state.selectedStatus,
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
						let schoolData,
							rolesData,
							statusData,
							selectedSchools = [];
						/** bind the filter data */
						for (const item in resultFilter) {
							filters.push(resultFilter[item]);
						}
						//bind filters group data according to user role
						if (filters) {
							let userDetails = this.props.withAuthConsumer_myUserDetails.role;
							let rolesArray = filters.find((filter) => filter.id === "roles");
							let statusArray = filters.find((filter) => filter.id === "status");
							rolesData = rolesArray ? this.arrayMapping(rolesArray.data) : null;
							statusData = statusArray ? this.arrayMapping(statusArray.data) : null;
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
								statusData: statusData,
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
				let newSelectedData = [];
				switch (filterName.toLowerCase()) {
					case "school":
						this.setState({ selectedSchools: selected });
						break;
					case "roles":
						this.setState({ selectedRoles: selected });
						break;
					case "status":
						this.setState({ selectedStatus: selected });
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
				this.setState({ query: "", selectedSchools: [], selectedRoles: [], message: null, selectedStatus: [] });
				this.pushHistory({ query: "", offset: 0, selectedSchools: [], selectedRoles: [], selectedStatus: [] });
			}

			/**Get selected filter in array
			 * like [{filter : "class", values: ["class 1", "class 2"]}]
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
				let userTable;
				let messageNotice = null;
				const filtersLength = this.state.filters ? this.state.filters.length : 0;
				if (this.state.message) {
					messageNotice = <AdminPageMessage>{this.state.message}</AdminPageMessage>;
				}

				if (this.state.loading) {
					userTable = (
						<AdminPageMessage>
							<Loader />
						</AdminPageMessage>
					);
				} else if (Array.isArray(this.state.resultData) && this.state.resultUnfilteredCount > 0) {
					userTable = (
						<UserList
							userData={this.state.resultData}
							approvingOid={this.state.approvingOid}
							doCompleteApprove={this.doCompleteApprove}
							doDismissApprove={this.doDismissApprove}
							doInitApprove={this.doInitApprove}
							doReject={this.doReject}
							doResendVerify={this.doResendVerify}
							doResendSetPassword={this.doResendSetPassword}
							sort_field={this.state.sort_field}
							sort_dir={this.state.sort_dir}
							doSorting={this.doSorting}
							unfilteredCount={this.state.resultUnfilteredCount}
							limit={this.state.limit}
							offset={this.state.offset}
							doPagination={this.doPagination}
							userRole={this.props.withAuthConsumer_myUserDetails.role}
						/>
					);
				} else {
					userTable = <AdminPageMessage>No results found</AdminPageMessage>;
				}

				return (
					<>
						<HeadTitle title={PageTitle.registrationQueue} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<AdminPageWrap pageTitle="Registration Queue" id={JUMP_TO_CONTENT_ID}>
							<PageDetail>
								<SearchSectionOne>
									<FilterSectionHalf>
										{this.state.filters ? (
											<UserSearchFilters
												schoolData={this.state.schoolData}
												rolesData={this.state.rolesData}
												statusData={this.state.statusData}
												selectedStatus={this.state.selectedStatus}
												selectedSchools={this.state.selectedSchools}
												selectedRoles={this.state.selectedRoles}
												currentUserRole={this.props.withAuthConsumer_myUserDetails.role}
												handlefilterSelection={this.handlefilterSelection}
												filterText={this.state.query}
												queryPlaceHolderText={" Search .."}
												doSearch={this.doSearch}
												resetAll={this.resetAll}
												hideCreateButton={true}
												createUserPageLink={CREATE_USER_PAGE_LINK}
												filtersLength={filtersLength}
												api={this.props.api}
											/>
										) : null}
									</FilterSectionHalf>
								</SearchSectionOne>
								<WrapperDiv>
									<AdminPageFilterMessage>{this.state.searchFilterText}</AdminPageFilterMessage>
									{messageNotice}
									{userTable}
								</WrapperDiv>
							</PageDetail>
						</AdminPageWrap>
					</>
				);
			}
		}
	)
);
