import React, { Component } from "react";
import Header from "../../widgets/Header";
import queryString from "query-string";
import withApiConsumer from "../../common/withApiConsumer";
import withAuthRequiredConsumer from "../../common/withAdminAuthRequiredConsumer";
import { withRouter, Link } from "react-router-dom";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import Loader from "../../widgets/Loader";
import AdminPageWrap from "../../widgets/AdminPageWrap";
import SearchFilters from "./SearchFilters";
import userDidChange from "../../common/userDidChange";
import { PageDetail, SearchSectionOne, FilterSectionHalf, WrapperDiv } from "../../widgets/AdminStyleComponents";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import notificationLinks from "../../common/notificationLinks";
import TableGridFooter from "../../widgets/TableGridFooter";
import TableGrid from "../../widgets/TableGrid";
import AdminPageFilterMessage from "../../widgets/AdminPageFilterMessage";
import getSearchFilterText from "../../common/getSearchFilterText";
import AdminPageMessage from "../../widgets/AdminPageMessage";
import withEventEmitterConsumer from "../../common/EventEmitter/withEventEmitterConsumer";
import notificationNeedToBeUpdate from "../../common/EventEmitter/events/notificationNeedToBeUpdate/index";
import constants from "../../common/EventEmitter/events/notificationNeedToBeUpdate/constants";
import IntentToCopyForm from "../../widgets/IntentToCopyForm";

const COLUMN_ALIGN_LEFT = "left";
const COLUMN_ALIGN_RIGHT = "right";
const COLUMN_ALIGN_CENTER = "center";

/* This constant is used for showing filter text */
const AVAILABLE_FILTERS = [{ name: "Status", stateKey: "selectedStatus" }];
const JUMP_TO_CONTENT_ID = "main-content";

const RowEventoptions = styled.div`
	position: relative;
	text-align: right;
`;

const SubmenuDropDown = styled.div`
	cursor: pointer;
	display: inline-block;
	padding: 0 0.5em;
	vertical-align: middle;
`;

const HasReadUnread = styled.span`
	cursor: pointer;
	padding-right: 0.5rem;
`;

const NotificationSubMenu = styled.ul`
	position: absolute;
	background: ${theme.colours.primaryLight};
	list-style: none;
	text-align: left;
	padding: 2px 6px;
	color: ${theme.colours.white};
	top: -8px;
	right: 20px;
	box-shadow: 0px 4px 7px 0px rgba(0, 0, 0, 0.5);
	font-size: 13px;
	z-index: 1;
	${(p) =>
		!p.isDisplay &&
		css`
			display: none;
		`};
	li {
		cursor: pointer;
	}
`;

const NotificationSubMenuDropdown = styled.i`
	font-size: 22px;
`;

const RedirectNotificationLink = styled(Link)`
	color: ${theme.colours.primary};
	text-decoration: underline;
`;

const NotificationLinkButton = styled.button`
	color: ${theme.colours.primary};
	text-decoration: underline;
	padding: 0;
	margin: 0;
	background-color: transparent;
	border: 0;
`;

export default withEventEmitterConsumer(
	withApiConsumer(
		withAuthRequiredConsumer(
			withRouter(
				class AllNotifications extends Component {
					constructor(props) {
						super(props);
						this.state = {
							limit: 10,
							offset: 0,
							sort_field: "date_created",
							sort_dir: "D",
							query: "",
							selectedStatus: [],
							notificationStatusData: null,
							filters: null,
							setOption: {
								value: "",
								label: "",
								key: "",
							},
							openNotificationOid: null,
							notifications: [],
							notificationCount: 0,
							lastListFetchedTime: 0,
							sort_direction: "D",
							totalNotificationCount: 0,
							loading: true,
							searchFilterText: null,
							NotificationsLoaded: false,
							showIntentToCopyForm: false,
							currentNotif: null,
						};
					}

					componentDidMount() {
						this.fetchFilters();
						// Subscribe to an event in componentDidMount
						this.props.eventEmitter_on(notificationNeedToBeUpdate, this.onEmit);
					}

					componentDidUpdate(prevProps, prevState) {
						//check if userDetails update
						if (userDidChange(this.props, prevProps)) {
							this.fetchFilters();
						}

						if (this.props.location.search !== prevProps.location.search) {
							this.updateState();
						}
					}

					componentWillUnmount() {
						// Unsubscribe to events in componentWillUnmount - always unsubscribe from events to avoid memory leaks!
						this.props.eventEmitter_off(notificationNeedToBeUpdate, this.onEmit);
						document.removeEventListener("click", this.handleOutsideClick, false);
					}

					getAllNotifications = async () => {
						await this.props
							.api("/auth/get-notification", {
								offset: this.state.offset,
								limit: this.state.limit,
								filter: this.state.selected,
								sort_direction: this.state.sort_direction,
								sort_field: this.state.sort_field,
								query: this.state.query,
							})
							.then((result) => {
								const res = result.data;
								let selected_filters = this.getSelectedFilters();
								let searchFilterText = getSearchFilterText(
									this.state.limit,
									this.state.offset,
									this.state.query,
									selected_filters,
									result.totalNotificationCount
								);
								if (res) {
									this.setState({
										notifications: res,
										notificationCount: result.totalNotificationCount,
										lastListFetchedTime: new Date().getTime(),
										totalNotificationCount: result.totalNotificationCount,
										loading: false,
										searchFilterText: searchFilterText,
									});
								}
							})
							.catch((err) => {})
							.finally(() => {
								this.setState({
									NotificationsLoaded: true,
								});
							});
					};

					markNotificationReadUnread = async (read = false, notificationOid) => {
						this.props
							.api("/auth/update-notification", {
								has_read: read,
								oid: notificationOid,
							})
							.then(async (res) => {
								if (res.result) {
									const newNotifications = this.state.notifications.map((notification) => {
										if (notification.oid === notificationOid) {
											notification.has_read = read;
											return notification;
										}
										return notification;
									});
									let notificationCount = parseInt(res.unread_count, 10);
									this.setState({
										notifications: [].concat(newNotifications),
										notificationCount: notificationCount,
									});
									if (this.state.offset >= this.state.totalNotificationCount - 1) {
										this.setState({ offset: 0 });
									}
									await this.getAllNotifications();
									this.props.eventEmitter_emit(notificationNeedToBeUpdate, constants.Notification_Update_From_Notification_List);
								}
							})
							.catch((err) => {});
					};

					deleteNotification = async (notificationOid, categoryId = 0) => {
						this.props
							.api("/auth/delete-notification", {
								oid: notificationOid,
								categoryId: categoryId,
							})
							.then(async (res) => {
								if (res.result) {
									if (this.state.offset >= this.state.totalNotificationCount - 1) {
										this.setState({ offset: 0 });
									}
									await this.getAllNotifications();
									this.props.eventEmitter_emit(notificationNeedToBeUpdate, constants.Notification_Update_From_Notification_List);
								}
							})
							.catch((err) => {});
					};

					onToggleNotificationItem = (e, oid) => {
						e.stopPropagation();
						if (this.state.openNotificationOid === oid) {
							document.removeEventListener("click", this.handleOutsideClick, false);
							this.setState({
								openNotificationOid: null,
							});
						} else {
							document.addEventListener("click", this.handleOutsideClick, false);
							this.setState({
								openNotificationOid: oid,
							});
						}
					};

					handleOutsideClick = (e) => {
						if (this.node && this.node.contains(e.target)) {
							return;
						}
						this.onToggleNotificationItem(e, this.state.openNotificationOid);
					};

					resetSubmenuToggle = () => {
						this.setState({
							openNotificationOid: null,
						});
					};

					fetchFilters() {
						const parsed = queryString.parse(this.props.location.search);
						let filter_notification = parsed.filter_status;
						this.props
							.api("/auth/notification-get-filters", {
								filter_notification: filter_notification ? filter_notification : null,
							})
							.then((result) => {
								let resultFilter = result.result;
								let filters = [],
									notificationStatusData;
								/** bind the filter data */
								for (const item in resultFilter) {
									filters.push(resultFilter[item]);
								}
								//bind filters group data according to user role
								if (filters) {
									let statusArray = filters.find((filter) => filter.id === "status");
									notificationStatusData = statusArray ? this.arrayMapping(statusArray.data) : null;
								}
								this.setState(
									{
										filters: filters,
										notificationStatusData: notificationStatusData,
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

					/** Mapping array for filter dropdown */
					arrayMapping(arrayData) {
						let arr = [];
						arrayData.map((item) => {
							const data = Object.assign({}, this.state.setOption);
							data.value = item.value;
							data.label = item.title;
							data.key = item.id;
							arr.push(data);
						});
						return arr;
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

							let sortField = parsed.sort_field || "date_created";
							let sortDir = parsed.sort_dir || "D";
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
										selectedMap.push(value);
									}
									newState.selected[filterGroupId] = selectedMap;
								}
							}
							//check the selected status value and if extis then store in state value
							if (newState.selected.hasOwnProperty("status") && Array.isArray(newState.selected.status) && newState.selected.status.length > 0) {
								let arr = newState.selected.status;

								let bindSelectedStatus = this.state.notificationStatusData.filter((d) => arr.some((s) => parseInt(s, 10) === d.value));
								newState.selectedStatus = bindSelectedStatus;
							}
							this.setState(newState, () => {
								this.getAllNotifications();
							});
						}
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
							query: this.state.query,
							limit: setLimit,
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

					/** fill the state new value */
					handlefilterSelection = (selected, filterName) => {
						//bind new filter data of school and roles
						let newSelectedData = [];
						switch (filterName.toLowerCase()) {
							case "status":
								this.setState({ selectedStatus: selected });
								break;
							case "query":
								this.setState({ query: selected });
								break;
						}
					};

					resetAll = () => {
						this.setState({ query: "", selectedStatus: [] });
						this.pushHistory({ query: "", offset: 0, selectedStatus: [] });
					};

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

					pushHistory(extra) {
						const url = "/see-all-notifications?" + this.getQueryString(extra);
						this.props.history.push(url);
					}

					doSearch = async () => {
						this.setState({ message: null });
						this.pushHistory({
							sort_field: this.state.sort_field,
							sort_dir: this.state.sort_direction,
							offset: 0,
							loading: this.state.loading,
							query: this.state.query,
							selectedStatus: this.state.selectedStatus,
						});
					};

					notificationTableData = (notifications, unfiltered_count) => {
						//declare columns
						let columns = [
							{ name: "title", title: "Notification Title" },
							{ name: "description", title: "Notification Message" },
							{ name: "date_created", title: "Date of Notification" },
							{ name: "action", title: "Action" },
						];

						let noToggleColumns = [{ name: "action", title: "Action" }];

						//arrange the column records
						const rows = notifications.map((notif) => {
							let notificationLink;
							if (notif.link.static) {
								notificationLink = notif.link.value;
							} else {
								notificationLink = notificationLinks[notif.link.type] ? notificationLinks[notif.link.type].url : "/";
								if (notif.link.value) {
									notificationLink += "?query=" + encodeURIComponent(notif.link.value);
								}
							}
							const newRow = {};
							if (notif.link && notif.link.type === "book-unlock" && notif.link.unlock_attempt_oid && notif.link.value === false) {
								newRow.title = (
									<NotificationLinkButton
										onClick={() => {
											this.openIntentToCopyForm(notif);
										}}
									>
										{" "}
										{notif.title}{" "}
									</NotificationLinkButton>
								);
							} else {
								newRow.title = <RedirectNotificationLink to={notificationLink}> {notif.title} </RedirectNotificationLink>;
							}
							newRow.description = notif.description;
							newRow.date_created = notif.date_created;
							newRow.action = (
								<RowEventoptions>
									{
										//Redirect link with icon
										/* 	<Link className="pr-2" to={notificationLink}>
									<i className="fas fa-external-link-alt" title="Redirect to Page"></i>
								</Link> */
									}
									<HasReadUnread
										className="notificationStatus"
										onClick={() => {
											this.markNotificationReadUnread(!notif.has_read, notif.oid);
										}}
									>
										<i className={notif.has_read ? "far fa-dot-circle" : "far fa-circle"} />
									</HasReadUnread>
									<SubmenuDropDown
										onClick={(e) => {
											this.onToggleNotificationItem(e, notif.oid);
										}}
									>
										<NotificationSubMenuDropdown className="far fa-ellipsis-v"></NotificationSubMenuDropdown>
									</SubmenuDropDown>
									<NotificationSubMenu isDisplay={this.state.openNotificationOid === notif.oid}>
										<li
											onClick={(e) => {
												this.deleteNotification(notif.oid);
											}}
										>
											Delete
										</li>
										{notif.hideable_log ? (
											<li
												onClick={(e) => {
													this.deleteNotification(0, notif.category_id);
												}}
											>
												Don't Show Again
											</li>
										) : (
											""
										)}
									</NotificationSubMenu>
								</RowEventoptions>
							);
							newRow.has_read = notif.has_read;
							return newRow;
						});
						//column resizing
						let defaultColumnWidths = [
							{ columnName: "title", width: 300 },
							{ columnName: "description", width: 300 },
							{ columnName: "date_created", width: 200 },
							{ columnName: "action", width: 200 },
						];

						//default sorting
						let defaultSorting = [
							{
								columnName: this.state.sort_field,
								direction: this.state.sort_dir && this.state.sort_dir.toUpperCase()[0] === "D" ? "desc" : "asc",
							},
						];

						//column initilization and alignment
						let tableColumnExtensions = [
							{ columnName: "title", align: COLUMN_ALIGN_LEFT },
							{ columnName: "description", align: COLUMN_ALIGN_LEFT },
							{ columnName: "date_created", align: COLUMN_ALIGN_LEFT },
							{ columnName: "action", align: COLUMN_ALIGN_RIGHT },
						];

						//default disable column for sorting
						let sortingStateColumnExtensions = [{ columnName: "action", sortingEnabled: false }];
						let rightColumns = ["action"];
						//date type column names
						let dateColumnsName = ["date_created"];

						return {
							unfiltered_count: unfiltered_count,
							column: columns,
							row: rows,
							resize: defaultColumnWidths,
							tableColumnExtensions: tableColumnExtensions,
							defaultSorting: defaultSorting,
							sortingStateColumnExtensions: sortingStateColumnExtensions,
							rightColumns: rightColumns,
							dateColumnsName: dateColumnsName,
							noToggleColumns: noToggleColumns,
							loading: this.state.loading,
						};
					};

					onEmit = (source) => {
						// This method is called whenever the SomeEvent event is emitted because it was registered in `componentDidMount`.
						// Even if another Component emits the SomeEvent event, this method will be called.
						// Be careful not to emit the SomeEvent event from within this function otherwise you'll get an infinite loop.
						if (source !== constants.Notification_Update_From_Notification_List) {
							this.getAllNotifications();
						}
					};

					openIntentToCopyForm = (notif) => {
						if (notif.link && notif.link.type === "book-unlock" && notif.link.unlock_attempt_oid) {
							this.setState({ showIntentToCopyForm: true, currentNotif: notif });
						}
					};

					onCloseIntentToCopy = () => {
						const currentNotif = this.state.currentNotif;
						if (currentNotif && currentNotif.oid && !currentNotif.has_replied) {
							this.markNotificationReadUnread(true, currentNotif.oid);
						}
						this.setState({ currentNotif: null, showIntentToCopyForm: false });
					};

					render() {
						let Notifications = <AdminPageMessage> No results found</AdminPageMessage>;
						if (!this.state.NotificationsLoaded) {
							Notifications = (
								<AdminPageMessage>
									<Loader />
								</AdminPageMessage>
							);
						}
						if (this.state.notifications !== null && this.state.notifications.length !== 0) {
							let notificationProps = this.notificationTableData(this.state.notifications, this.state.totalNotificationCount);

							Notifications = (
								<>
									<TableGrid {...notificationProps} doSorting={this.doSorting} showColumnSelector={true} />

									<TableGridFooter
										unfilteredCount={this.state.totalNotificationCount}
										limit={this.state.limit}
										pageNeighbours={3}
										doPagination={this.doPagination}
										currentPage={parseInt(this.state.offset) / Number(this.state.limit) + 1}
									/>
								</>
							);
						}
						return (
							<>
								<HeadTitle title={PageTitle.showAllNotification} />
								<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
								<AdminPageWrap pageTitle="Notifications" id={JUMP_TO_CONTENT_ID}>
									<PageDetail>
										<SearchSectionOne>
											<FilterSectionHalf>
												{this.state.filters ? (
													<SearchFilters
														statusData={this.state.notificationStatusData}
														selectedStatus={this.state.selectedStatus}
														handlefilterSelection={this.handlefilterSelection}
														filterText={this.state.query}
														queryPlaceHolderText={" Search .."}
														doSearch={this.doSearch}
														resetAll={this.resetAll}
														hideCreateButton={true}
														filterLength={this.state.filters.length}
													/>
												) : null}
											</FilterSectionHalf>
										</SearchSectionOne>

										<WrapperDiv>
											<AdminPageFilterMessage>{this.state.searchFilterText}</AdminPageFilterMessage>
											{Notifications}
										</WrapperDiv>
									</PageDetail>
								</AdminPageWrap>
								{this.state.currentNotif && this.state.showIntentToCopyForm ? (
									<IntentToCopyForm
										onCloseIntentToCopy={this.onCloseIntentToCopy}
										unlock_attempt_oid={this.state.currentNotif.link.unlock_attempt_oid}
										isbn={this.state.currentNotif.link.isbn}
										notification_oid={this.state.currentNotif.oid}
										isUnlock={false}
										has_replied={!!this.state.currentNotif.link.has_replied}
										history={this.props.history}
									/>
								) : (
									""
								)}
							</>
						);
					}
				}
			)
		)
	)
);
