import React from "react";
import queryString from "query-string";
import addedDiff from "../../common/addedDiff";

import withApiConsumer from "../../common/withApiConsumer";
import withAuthConsumer from "../../common/withAuthConsumer";
import WorkResults from "./WorkResults";
import SearchFilters from "./SearchFilters";
import SelectedFilter from "./SelectedFilter";
import Header from "../../widgets/Header";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import withPageSize from "../../common/withPageSize";
import Loader from "../../widgets/Loader";
import eanIsValid from "../../common/eanIsValid";
import userDidChange from "../../common/userDidChange";
import googleEvent from "../../common/googleEvent";
//User role details
import UserRole from "../../common/UserRole";
import Pagination from "../../widgets/Pagination";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import FlyOutModal from "../../widgets/FlyOutModal";
import Flyout from "../../widgets/Flyout";
import flyOutGuide from "./flyOutGuide";
import { withFlyoutManager } from "../../common/FlyoutManager";
import {
	col12,
	colLg3,
	colLg9,
	colMd4,
	colMd6,
	colSm4,
	colSm8,
	customSelect,
	inputGroup,
	noGuttersMargin,
	noGuttersPadding,
} from "../../common/style";
import TempUnlockAsset from "../../widgets/TempUnlockAsset";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { PageContentMedium } from "../../widgets/Layout/PageContentMedium";
import staticValues from "../../common/staticValues";
import { Link } from "react-router-dom";
import ContentRequestModal from "../../widgets/ContentRequestModal";
import extractIsbn from "../../common/extractIsbn";
import { ButtonLink } from "../../widgets/Layout/ButtonLink";

const DEFAULT_LIMIT = 10;
const FLYOUT_DEFAULT_INDEX = -1; //Default Index -1
const FLYOUT_DEFAULT_NOTIFICATION = -1; // default notification index
const NOTIFICATION_COUNT_DEFAULT = 0; // default notification count
const JUMP_TO_CONTENT_ID = "search-result-info";

const homeScreenBox = staticValues.homeScreenBox;
const FLYOUT_SCREEN_SEARCH = homeScreenBox.search;

const SearchResultList = styled.section`
	padding: 1.5em 0 1em 2em;
	background-color: ${theme.colours.white};
	width: 100%;
	box-sizing: border-box;
`;

const SearchHeader = styled.div`
	width: 100%;
	font-size: 2.25em;
	padding: 0;
	color: ${theme.colours.bgDarkPurple};
	display: flex;
	align-items: center;
	flex-wrap: wrap;

	@media screen and (max-width: ${theme.breakpoints.tabletPro}) {
		padding: 1em;
	}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		line-height: 28px;
		font-size: 1.125em;
		i {
			font-weight: 300;
			font-size: 2em;
		}
	}
`;

const SearchNotFoundWrap = styled.div`
	margin-top: 1em;
	font-size: 1.5em;
`;

const SearchHeaderHighlighted = styled.span``;

const FormIcon = styled.div`
	height: 63px;
	width: 63px;
	line-height: 60px;
	text-align: center;
	background-color: ${theme.colours.bgDarkPurple};
	color: ${theme.colours.white};
	border-radius: 50%;
	margin-right: 0.6em;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		height: 57px;
		width: 57px;
		line-height: 57px;
		margin-bottom: 16px;
	}

	i {
		font-size: 35px;
		vertical-align: middle;

		@media screen and (max-width: ${theme.breakpoints.mobile}) {
			font-size: 28px;
		}
	}
`;

const WrapSelectedFilter = styled.div`
	width: 100%;
	display: flex;
	justify-content: flex-start;
	align-items: center;
	flex-flow: wrap;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding: 0;
	}
`;

const Display = styled.div`
	.section-text .custom-select {
		position: relative;
		-ms-flex: 1 1 auto;
		flex: 1 1 auto;
		width: 1%;
		margin-bottom: 0;
		max-width: 70px;
		margin-left: 8px;
		border-color: ${theme.colours.primary};
		color: ${theme.colours.headerButtonSearch};
	}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		padding: 0 2em 1em 2em;
	}
	${col12}
`;

const DisplayRow = styled(Display)`
	${colSm4}
	${colMd6}
`;

const CustomSelect = styled.select`
	${customSelect}
	-webkit-appearance: none;
	border-color: ${theme.colours.darkGray};
	background-size: 10px 16px;
	position: relative;
	-ms-flex: 1 1 auto;
	flex: 1 1 auto;
	width: 1%;
	margin-bottom: 0;
	max-width: 70px;
	margin-left: 8px;
	border-color: ${theme.colours.primary};
	color: ${theme.colours.primary};
	padding-bottom: 0px;
	padding-top: 0px;
	background-image: url(${require("../../assets/images/primary-drop-arrow.svg")});

	::-ms-expand {
		display: none;
	}
`;

const MobSearchPagination = styled.section`
	padding: 0 2em;
	ul {
		margin-bottom: 0;
	}
	${col12}
`;

const DesktopSearchPagination = styled.section`
	ul {
		margin-bottom: 0;
	}
	${col12}
	${colSm8}
	${colMd6}
`;

const MobSearch = styled.section`
	padding: 1em 2em 0 2em;
	background-color: ${theme.colours.white};
	width: 100%;
	box-sizing: border-box;
	${col12}
`;
const MobTags = styled.section`
	background-color: ${theme.colours.white};
	width: 100%;
	box-sizing: border-box;
	padding: 1em 2em 0 2em;
`;

const SearchLabel = styled.div`
	font-size: 1.125em;
	font-weight: bold;
	color: ${theme.colours.white};
	position: relative;
	display: flex;
	justify-content: space-between;
	align-items: center;
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		cursor: pointer;
		background-color: transparent;
		padding: 1em;
		&:after {
			display: block;
			content: "";
			position: absolute;
			bottom: -1px;
			left: 0.5em;
			right: 0.5em;
			height: 1px;
			background: transparent;
		}
	}

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		line-height: 1.75em;
		font-weight: bold;

		i {
			line-height: 31px;
		}
	}
`;

const SearchLabelText = styled.div`
	width: calc(100% - 16px);
`;

const DisplayLabel = styled.label`
	display: flex;
	margin-bottom: 0;
	align-items: center;
	color: ${theme.colours.primary};
`;

const TotalUnfilteredItems = styled(Row)`
	align-items: center;
`;

const SearchSection = styled.div`
	position: relative;
	color: ${theme.colours.white};
	background-color: ${theme.colours.bgDarkPurple};
	padding-right: 0;
	padding-left: 0;
	${col12}
	${(p) =>
		!p.isMobile &&
		css`
			${colMd4}
			${colLg3}
			${noGuttersPadding}
		`}
`;

const DisplayInputGroup = styled.div`
	@media screen and (min-width: ${theme.breakpoints.mobileSmall}) {
		justify-content: flex-end;
	}
	${inputGroup}
`;

const DisplayInputPrepend = styled.div`
	display: flex;
`;

const WrapWorkResult = styled.div`
	padding: 0;
	${col12}
	${noGuttersPadding}
`;

const WrapRow = styled(Row)`
	${(p) => !p.isMobile && noGuttersMargin}
`;

const DisplayInputWrap = styled.div`
	${inputGroup}
`;

const Section = styled(PageContentMedium)`
	${col12}
	${colLg9}
	${noGuttersPadding}
`;

const TempUnlockWrap = styled.div`
	background-color: ${theme.colours.bgDarkPurple};
	color: ${theme.colours.white};
	padding: 20px;
	margin-left: 32px;
	margin-top: 25px;
	position: relative;
	box-shadow: ${theme.shadow};
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		margin-right: 32px;
		margin-top: 35px;
	}
`;

const StyledLink = styled(Link)`
	vertical-align: middle;
	text-decoration: underline;
	color: ${theme.colours.primary};
	margin-right: 1em;
	margin-top: 1em;

	:hover {
		text-decoration: underline;
	}
`;

const Span = styled.span`
	vertical-align: middle;
	text-decoration: underline;
	color: ${theme.colours.primary};
	:hover {
		cursor: pointer;
	}
`;

const AssetUploadButtonLink = styled.div`
	display: flex;
	justify-content: center;
	margin: 0 auto;
`;

export default withAuthConsumer(
	withPageSize(
		withApiConsumer(
			withFlyoutManager(
				class SearchPage extends React.PureComponent {
					_isMounted = false;
					constructor(props) {
						super(props);
						this.state = {
							data: [],
							queryString: "",
							inputString: "",
							totalUnfilteredCount: 0,
							offset: 0,
							limit: DEFAULT_LIMIT,
							currentPage: 1,
							filters: null,
							selected: null,
							ajaxLoaded: false,
							searchWasMaybeIsbn: null,
							searchWasIsbn: null,
							resultFilterCount: 0,
							openSubject: true,
							open: false,
							isUpdateHome: false,
							unLockedBook_ISBN: null,
							lockedBook_ISBN: null,
							tempUnlockAssetTitles: [],
							assetFilterData: [],
							isShowContentRequestModal: false,
							courseOid: null,
						};
						this.otherFilterOptionRef = React.createRef(null);
						this.notificationRef = React.createRef(null);
					}

					componentDidMount() {
						this._isMounted = true;
						// if the url has search parameters, perform a search
						this.updateSearchState(null);
						this.fetchAllFilers();
						// Get the latest flyout indexes.
						this.props.flyout_getLatestFlyoutIndex();
						setTimeout(this.updateHomeScreenIndex, 300);
						this.getTempUnlockedAssetTitles();
						if (this.props.withAuthConsumer_myUserDetails) {
							this.getCourseForSchool();
						}
					}

					componentWillUnmount() {
						delete this._isMounted;
					}

					componentDidUpdate(prevProps, prevState) {
						// checks if the search parameters in the url have been updated and performs a search if that's the case or check if userDetails update
						if (this.props.location.search !== prevProps.location.search || userDidChange(this.props, prevProps)) {
							this.updateSearchState(prevState);
						}
					}

					updateHomeScreenIndex = () => {
						const seenIndexHome = this.props.flyouts_getSeenIndex(FLYOUT_SCREEN_SEARCH);
						if (seenIndexHome === FLYOUT_DEFAULT_INDEX) {
							this.props.flyouts_setIndex(FLYOUT_SCREEN_SEARCH, 0);
						}
					};

					// gets updated search parameters from the url, updates applications' state and performs a search
					updateSearchState = (prevState) => {
						const parsed = queryString.parse(this.props.location.search);
						let limit = Number(parsed.limit) || DEFAULT_LIMIT;
						let currentPage = Number(parsed.page) || 1;
						let offset = currentPage * limit - limit;
						if (!parsed.q) {
							parsed.q = "";
						}
						const newState = {
							inputString: parsed.q,
							queryString: parsed.q,
							limit: limit,
							currentPage: currentPage,
							offset: offset,
							selected: {},
						};

						if (this.state.filters) {
							for (const filter of this.state.filters) {
								newState.selected[filter.id] = {};
							}
							for (const key in parsed) {
								if (key.indexOf("filter_") === 0 && parsed[key]) {
									const filterGroupId = key.slice("filter_".length);
									const selectedValues = parsed[key].split(",");
									const selectedMap = {};
									for (const value of selectedValues) {
										selectedMap[value] = true;
									}
									newState.selected[filterGroupId] = selectedMap;
								}
							}
						} else {
							for (const key in parsed) {
								if (key.indexOf("filter_") === 0 && parsed[key]) {
									const filterGroupId = key.slice("filter_".length);
									const selectedValues = parsed[key].split(",");
									const selectedMap = {};
									for (const value of selectedValues) {
										selectedMap[value] = true;
									}
									if (!newState.selected[filterGroupId]) {
										newState.selected[filterGroupId] = {};
									}
									newState.selected[filterGroupId] = selectedMap;
								}
							}
						}

						/**
						 * Send Google Events when someone changes their filter settings.
						 * Only send when the filter is CHANGED (i.e. not when the page first loads)
						 * And only send when a filter is added (not when it's removed)
						 */
						if (prevState && newState.selected) {
							const added = addedDiff(prevState.selected || {}, newState.selected);
							for (const key in added) {
								if (added[key]) {
									const valueKeys = Object.keys(added[key]);
									if (valueKeys.length > 0) {
										googleEvent("refineSearch", "refine search", key, valueKeys[0]);
									}
								}
							}
						}
						this.setState(newState, this.onSearch);
					};

					getQueryStringRaw(data) {
						const obj = {};
						if (data.queryString) {
							obj.q = data.queryString;
						}
						if (data.currentPage > 1) {
							obj.page = data.currentPage;
						}
						if (data.limit != DEFAULT_LIMIT) {
							obj.limit = data.limit;
						}
						for (const key in data.selected) {
							if (data.selected.hasOwnProperty(key) && data.selected[key]) {
								const selectedString = Object.keys(data.selected[key]).join(",");
								if (selectedString) {
									obj["filter_" + key] = selectedString;
								}
							}
						}
						return queryString.stringify(obj);
					}

					getQueryString(extra) {
						const data = JSON.parse(JSON.stringify(this.state));
						Object.assign(data, extra || {});
						return this.getQueryStringRaw(data);
					}

					pushHistory(extra) {
						this.props.history.push("/works?" + this.getQueryString(extra));
					}

					pushHistoryRaw(data) {
						this.props.history.push("/works?" + this.getQueryStringRaw(data));
					}
					getTempUnlockedAssetTitles = () => {
						if (this.props.withAuthConsumer_myUserDetails) {
							this.props.api("/public/get-temp-unlocked-assets").then((result) => {
								if (this._isMounted && result) {
									this.setState({
										tempUnlockAssetTitles: result.result,
									});
								}
							});
						}
					};
					onSearch = (_) => {
						//get user details
						const userDetails = this.props.withAuthConsumer_myUserDetails;
						let queryString = this.state.queryString;
						let wasMaybeIsbn = false;
						let wasIsbn = false;

						// using a temp string to check if the inputted value is an ISBN with additional non-numeric characters
						if (queryString) {
							// create a temporary query string to check if it is an ISBN
							const tempString = this.getIsbnFromQuery(queryString);
							wasMaybeIsbn = tempString !== null ? true : false;
							wasIsbn = wasMaybeIsbn ? eanIsValid(tempString) : false;
							this.setState({
								searchWasMaybeIsbn: wasMaybeIsbn,
								searchWasIsbn: wasIsbn,
							});
						} else {
							this.setState({
								searchWasMaybeIsbn: wasMaybeIsbn,
								searchWasIsbn: wasIsbn,
							});
						}

						// api call to the search endpoint to get search results given the query string, limit and offset
						const params = {
							query: queryString,
							limit: this.state.limit,
							offset: this.state.offset,
							filter: {},
						};
						for (const groupId in this.state.selected) {
							const items = Object.keys(this.state.selected[groupId]);

							if (items.length > 0) {
								if (userDetails) {
									//check groupid is misc
									if (groupId === "misc") {
										//allowed to add filter if user have role as 'school-admin' or 'teacher'
										if (userDetails.role === UserRole.schoolAdmin || userDetails.role === UserRole.teacher) {
											params.filter[groupId] = items;
										}
									} else {
										params.filter[groupId] = items;
									}
								} else {
									//add filter for public user
									if (groupId != "misc") {
										params.filter[groupId] = items;
									}
								}
							}
						}

						this.setState({ ajaxLoaded: false }, () => {});
						this.props
							.api("/search/search", params)
							.then((result) => {
								if (!this._isMounted) {
									return;
								}
								let subjects = null;
								let resultFilter = result.resultFilter;
								let resultFilterCount = result.resultFilterCount;

								//Set filters data according the User-role
								let filters = [];
								//get userdetails
								const userDetails = this.props.withAuthConsumer_myUserDetails;

								//Bind subjects
								for (const filter of resultFilter) {
									if (filter.id === "subject") {
										subjects = Object.create(null);
										for (const subject of filter.data) {
											subjects[subject.id] = subject.title;
										}
									}
								}

								//bind filters group data according to user role
								for (const item in resultFilter) {
									if (userDetails) {
										//check groupid is misc
										if (resultFilter[item].id === "misc") {
											//allowed to add filter if user have role as 'school-admin' or 'teacher'
											if (userDetails.role === UserRole.schoolAdmin || userDetails.role === UserRole.teacher) {
												filters.push(resultFilter[item]);
											}
										} else {
											filters.push(resultFilter[item]);
										}
									} else {
										//add filter for public user
										if (resultFilter[item].id !== "misc") {
											filters.push(resultFilter[item]);
										}
									}
								}

								let selected = this.state.selected || {};
								for (const filter of filters) {
									if (!selected[filter.id]) {
										selected[filter.id] = {};
									}
								}

								this.setState({
									data: result.results,
									totalUnfilteredCount: result.unfiltered_count,
									ajaxLoaded: true,
									searchWasMaybeIsbn: wasMaybeIsbn,
									searchWasIsbn: wasIsbn,
									subjects: subjects,
									filters: filters,
									selected: selected,
									resultFilterCount: resultFilterCount,
								});
							})
							.catch((err) => {
								this.setState({
									login: err,
									ajaxLoaded: true,
								});
							});
					};

					// when user changes the number of results displayed per page
					onResultsPerPageChange = (e) => {
						e.preventDefault();
						this.pushHistory({
							currentPage: 1,
							// limit: parseInt(e.target.getAttribute('data-limit'), 10),
							limit: parseInt(e.target.value, 10),
						});
						window.scrollTo(0, 0);
					};

					setOpenSubjectFlag = (open) => {
						this.setState({ openSubject: open });
					};

					selectFilter = (items) => {
						const data = JSON.parse(JSON.stringify(this.state));
						for (const item of items) {
							if (item.isChecked) {
								data.selected[item.filterGroup][item.filterId] = true;
							} else {
								delete data.selected[item.filterGroup][item.filterId];
							}
						}
						delete data.currentPage;
						this.pushHistoryRaw(data);
					};

					// If this function returns something other than NULL, then the search was maybe an ISBN.
					getIsbnFromQuery(searchString) {
						let tempString = searchString.replace(/\D/g, "");
						if (tempString.length === 13) {
							return tempString;
						}
						return null;
					}

					fetchAllFilers() {
						this.props.api("/search/get-filters").then((result) => {
							if (!this._isMounted) {
								return;
							}
							this.setState({ assetFilterData: result.resultFilter });
						});
					}

					getSelectedFilterData() {
						const filterData = [];
						const selectedFilter = this.state.selected;
						const assetFilterData = this.state.assetFilterData ? this.state.assetFilterData : [];
						const parsed = queryString.parse(this.props.location.search);
						//map query filter data
						let queryFilterMap = Object.create(null);
						for (const queryFilterKey of Object.values(parsed)) {
							if (!queryFilterMap[queryFilterKey]) {
								queryFilterMap[queryFilterKey] = queryFilterKey;
							}
						}
						if (selectedFilter && Object.keys(selectedFilter) && assetFilterData.length) {
							let assetFilterDataMap = Object.create(null);
							for (const filter of assetFilterData) {
								if (filter.id != "misc") {
									const filterMap = {};
									for (const parentfilterItem of filter.data) {
										filterMap[parentfilterItem.id] = parentfilterItem.title;
										if (parentfilterItem.child_subjects) {
											for (const childfilterItem of parentfilterItem.child_subjects) {
												filterMap[childfilterItem.id] = childfilterItem.title;
											}
										}
									}
									if (!assetFilterDataMap[filter.id]) {
										assetFilterDataMap[filter.id] = {};
									}
									assetFilterDataMap[filter.id] = filterMap;
								}
							}
							for (const key in selectedFilter) {
								if (key != "misc") {
									if (selectedFilter.hasOwnProperty(key) && selectedFilter[key]) {
										const filtersKeys = selectedFilter[key];

										let selecteFilterItem = {};
										for (const filterKey in filtersKeys) {
											if (filtersKeys[filterKey]) {
												selecteFilterItem = Object.create(null);
												selecteFilterItem.filterId = filterKey;
												selecteFilterItem.filterGroup = key;
												selecteFilterItem.isChecked = true;
												selecteFilterItem.title = assetFilterDataMap[key][filterKey] ? assetFilterDataMap[key][filterKey] : queryFilterMap[filterKey];
												filterData.push(selecteFilterItem);
											}
										}
									}
								}
							}
						}
						return filterData;
					}

					/**handle pagination selected page*/
					handlePagination = (page) => {
						this.pushHistory({ currentPage: page });
						window.scrollTo(0, 0);
					};

					onMenuClick = (e) => {
						const showFlyout = this.props.flyouts_getFirstUnseenIndex("search") === 5;
						if (showFlyout) {
							this.props.flyouts_setNext("search");
							if (this.state.open) {
								this.setState({ open: !this.state.open });
							}
						}
						if (this.props.breakpoint < withPageSize.TABLET) {
							e.preventDefault();
							this.setState({ open: !this.state.open });
						}
					};

					doCloseFlyout = () => {
						this.props.flyouts_setNext("search");
					};

					doCloseFlyoutNotification = () => {
						this.props.flyouts_setNext("notification");
					};

					doToggleFavorite = (pdfIsbn13, currentIsFavorite) => {
						const newFavorite = !currentIsFavorite;
						this.props
							.api(`/public/asset-favorite`, {
								pdf_isbn13: pdfIsbn13,
								is_favorite: newFavorite,
							})
							.then((result) => {
								if (this._isMounted && result.success && this.state.data) {
									const assetIdx = this.state.data.findIndex((asset) => asset.pdf_isbn13 === pdfIsbn13);
									if (assetIdx >= 0) {
										const newAsset = { ...this.state.data[assetIdx], is_favorite: newFavorite };
										const newData = [...this.state.data];
										newData[assetIdx] = newAsset;
										this.setState({
											data: newData,
										});
									}
								}
							});
					};

					openContentRequestModal = () => {
						this.setState({ isShowContentRequestModal: true });
					};

					hideContentRequestModal = () => {
						this.setState({ isShowContentRequestModal: false });
					};

					getCourseForSchool() {
						this.props.api("/public/course-get-one-for-school").then((result) => {
							if (!this._isMounted) {
								return;
							}
							this.setState({ courseOid: result.courseOid });
						});
					}

					render() {
						const notificationIndex = this.props.flyouts_getSeenIndex("notification");
						const {
							filters,
							selected,
							totalUnfilteredCount,
							limit,
							queryString,
							ajaxLoaded,
							data,
							currentPage,
							searchWasIsbn,
							searchWasMaybeIsbn,
							isShowContentRequestModal,
						} = this.state;
						const SelectedFilterData = this.getSelectedFilterData();
						const isMobile = this.props.breakpoint < withPageSize.TABLET;
						const isOpen =
							isMobile &&
							(this.props.flyouts_getFirstUnseenIndex("search") === 5 ||
								(this.props.withAuthConsumer_myUserDetails &&
									this.props.withAuthConsumer_myUserDetails.role !== UserRole.claAdmin &&
									this.props.flyouts_getFirstUnseenIndex("search") === 3));

						const showAllSearchOptionFlyout = this.props.flyouts_getFirstUnseenIndex("search") === 5;
						const showNotificationFlyout = this.props.flyouts_getFirstUnseenIndex("search") === 6;
						let caretIcon;
						let open = this.state.open;
						if (isMobile) {
							if (this.state.open) {
								caretIcon = <i className="fal fa-chevron-up"></i>;
							} else {
								caretIcon = <i className="fal fa-chevron-down"></i>;
							}
						} else {
							open = true;
						}

						const defaultValues = {
							isbn: extractIsbn(queryString) || "",
							title: extractIsbn(queryString) ? "" : queryString,
						};

						return (
							<>
								<HeadTitle title={queryString ? `Search term '` + queryString + `' on the Education Platform` : PageTitle.search} hideSuffix={true} />
								<Header
									flyOutIndexNotification={notificationIndex}
									onClose={this.doCloseFlyoutNotification}
									notificationRef={this.notificationRef}
									jumpToContentId={JUMP_TO_CONTENT_ID}
								/>
								<Container>
									<WrapRow id={JUMP_TO_CONTENT_ID} isMobile={isMobile} open={this.state.open}>
										<SearchSection isMobile={isMobile} ref={showAllSearchOptionFlyout ? this.otherFilterOptionRef : ""}>
											{filters && selected && (
												<>
													{isMobile ? (
														<SearchLabel name="searchFilter" onClick={this.onMenuClick}>
															<SearchLabelText>Refine search</SearchLabelText>
															{caretIcon}
														</SearchLabel>
													) : (
														""
													)}
													<SearchFilters
														filters={filters}
														selected={selected}
														selectFilter={this.selectFilter}
														ajaxLoaded={ajaxLoaded}
														allCount={this.state.resultFilterCount}
														openSubject={this.state.openSubject}
														setOpenSubjectFlag={this.setOpenSubjectFlag}
														onMenuClick={this.onMenuClick}
														open={open || isOpen}
														isMobile={isMobile}
													/>
												</>
											)}
										</SearchSection>

										{isMobile ? (
											<>
												{this.props.withAuthConsumer_myUserDetails &&
													this.state.tempUnlockAssetTitles &&
													this.state.tempUnlockAssetTitles.length > 0 && (
														<TempUnlockWrap>
															<TempUnlockAsset multiple={true} data={this.state.tempUnlockAssetTitles} />
														</TempUnlockWrap>
													)}
												{/** display Header result text id query string not null*/}
												{!!queryString && ajaxLoaded && (
													<MobSearch>
														<SearchHeader>
															<FormIcon>
																<i className="fal fa-search"></i>
															</FormIcon>
															<SearchHeaderHighlighted>
																{totalUnfilteredCount} Result{totalUnfilteredCount !== 1 ? "s" : ""}
															</SearchHeaderHighlighted>
															&nbsp;for &ldquo; {queryString} &rdquo;
														</SearchHeader>
													</MobSearch>
												)}

												{/** display selected filter result text id query string not null*/}
												{SelectedFilterData && ajaxLoaded && SelectedFilterData.length > 0 ? (
													<>
														<MobTags>
															<WrapSelectedFilter>
																{SelectedFilterData.map((filter) => (
																	<SelectedFilter filter={filter} onClose={this.selectFilter} key={filter.filterId}></SelectedFilter>
																))}
																<StyledLink to={"/works?q=" + encodeURIComponent(this.state.queryString)}>
																	Remove filters to expand search results
																</StyledLink>
															</WrapSelectedFilter>
														</MobTags>
													</>
												) : null}

												<WrapWorkResult open={this.state.open} isMobile={isMobile}>
													{totalUnfilteredCount > 0 ? (
														<WorkResults
															ajaxLoaded={ajaxLoaded}
															items={data}
															searchWasIsbn={searchWasIsbn}
															searchWasMaybeIsbn={searchWasMaybeIsbn}
															isMobile={isMobile}
															lockedBook_ISBN={this.state.lockedBook_ISBN}
															unLockedBook_ISBN={this.state.unLockedBook_ISBN}
															onToggleFavorite={this.doToggleFavorite}
															isLoggedIn={!!this.props.withAuthConsumer_myUserDetails}
															courseOid={this.state.courseOid}
														/>
													) : (
														""
													)}
												</WrapWorkResult>
												{totalUnfilteredCount > 0 ? (
													<>
														<MobSearchPagination>
															<Pagination
																totalRecords={totalUnfilteredCount}
																pageLimit={limit}
																pageNeighbours={3}
																onPageChanged={this.handlePagination}
																currentPage={currentPage}
																loading={!ajaxLoaded}
																isTablePagination={true}
															/>
														</MobSearchPagination>

														<Display>
															<div className="section-text">
																<DisplayInputWrap>
																	<DisplayInputPrepend>
																		<DisplayLabel htmlFor="inputGroupSelect01">Display</DisplayLabel>
																	</DisplayInputPrepend>
																	<CustomSelect
																		id="inputGroupSelect01"
																		value={limit}
																		data-limit={limit}
																		onChange={this.onResultsPerPageChange}
																		htmlFor="pageRows"
																	>
																		<option value="5">5 rows</option>
																		<option value="10">10 rows</option>
																		<option value="25">25 rows</option>
																	</CustomSelect>
																</DisplayInputWrap>
															</div>
														</Display>
													</>
												) : ajaxLoaded ? (
													<SearchHeader>
														<p>
															No results found. If you were looking for a specific title, please{" "}
															<Span onClick={this.openContentRequestModal}>tell us</Span>
															about it, and we will check its future availability for the Platform.
														</p>
														<p>
															You can also upload an extract (scan) of a title owned by your school or colleague yourself, and share this with your
															students. Would you like to do this now?
														</p>
														<AssetUploadButtonLink>
															<ButtonLink to="/asset-upload" data-ga-user-extract="entry-0-search-results">
																Yes, let me upload my own extract
															</ButtonLink>
														</AssetUploadButtonLink>
													</SearchHeader>
												) : (
													<Loader />
												)}
											</>
										) : (
											<Section>
												{this.state.tempUnlockAssetTitles &&
													this.state.tempUnlockAssetTitles.length > 0 &&
													this.props.withAuthConsumer_myUserDetails && (
														<TempUnlockWrap>
															<TempUnlockAsset multiple={true} data={this.state.tempUnlockAssetTitles} />
														</TempUnlockWrap>
													)}
												<SearchResultList>
													{/** display Header result text id query string not null*/}
													{!!queryString && ajaxLoaded && (
														<SearchHeader>
															<FormIcon>
																<i className="fal fa-search"></i>
															</FormIcon>
															<SearchHeaderHighlighted>
																{totalUnfilteredCount} Result{totalUnfilteredCount !== 1 ? "s" : ""}
															</SearchHeaderHighlighted>
															&nbsp;for &ldquo; {queryString} &rdquo;
														</SearchHeader>
													)}

													{/** display selected filter result text id query string not null*/}
													{SelectedFilterData && ajaxLoaded && SelectedFilterData.length > 0 ? (
														<>
															<WrapSelectedFilter>
																{SelectedFilterData.map((filter) => (
																	<SelectedFilter filter={filter} onClose={this.selectFilter} key={filter.filterId}></SelectedFilter>
																))}
																<StyledLink to={"/works?q=" + encodeURIComponent(this.state.queryString)}>
																	Remove filters to expand search results
																</StyledLink>
															</WrapSelectedFilter>
														</>
													) : null}

													{totalUnfilteredCount > 0 ? (
														<WorkResults
															ajaxLoaded={ajaxLoaded}
															items={data}
															searchWasIsbn={searchWasIsbn}
															searchWasMaybeIsbn={searchWasMaybeIsbn}
															isMobile={isMobile}
															lockedBook_ISBN={this.state.lockedBook_ISBN}
															unLockedBook_ISBN={this.state.unLockedBook_ISBN}
															onToggleFavorite={this.doToggleFavorite}
															isLoggedIn={!!this.props.withAuthConsumer_myUserDetails}
															courseOid={this.state.courseOid}
														/>
													) : (
														""
													)}

													{totalUnfilteredCount > 0 ? (
														<TotalUnfilteredItems>
															<DesktopSearchPagination>
																<Pagination
																	totalRecords={totalUnfilteredCount}
																	pageLimit={limit}
																	pageNeighbours={5}
																	onPageChanged={this.handlePagination}
																	currentPage={currentPage}
																	loading={!ajaxLoaded}
																	isTablePagination={true}
																/>
															</DesktopSearchPagination>
															<DisplayRow>
																<div className="section-text">
																	<DisplayInputGroup>
																		<DisplayInputPrepend>
																			<DisplayLabel htmlFor="inputGroupSelect01">Display</DisplayLabel>
																		</DisplayInputPrepend>
																		<CustomSelect
																			id="inputGroupSelect01"
																			value={limit}
																			data-limit={limit}
																			onChange={this.onResultsPerPageChange}
																			htmlFor="pageRows"
																		>
																			<option value="5">5 rows</option>
																			<option value="10">10 rows</option>
																			<option value="25">25 rows</option>
																		</CustomSelect>
																	</DisplayInputGroup>
																</div>
															</DisplayRow>
														</TotalUnfilteredItems>
													) : ajaxLoaded ? (
														<SearchNotFoundWrap>
															<p>
																No results found. If you were looking for a specific title, please{" "}
																<Span onClick={this.openContentRequestModal}>tell us</Span> about it, and we will check its future availability for
																the Platform.
															</p>
															<p>
																You can also upload an extract (scan) of a title owned by your school or colleague yourself, and share this with your
																students. Would you like to do this now?
															</p>
															<AssetUploadButtonLink>
																<ButtonLink to="/asset-upload" data-ga-user-extract="entry-0-search-results">
																	Yes, let me upload my own extract
																</ButtonLink>
															</AssetUploadButtonLink>
														</SearchNotFoundWrap>
													) : (
														<Loader />
													)}
												</SearchResultList>
											</Section>
										)}
									</WrapRow>
								</Container>
								{this.props.flyouts_getFirstUnseenIndex("search") === 0 ? (
									<FlyOutModal
										buttonText={"Show me"}
										handleShowMe={() => {
											this.props.flyouts_setNext("search");
										}}
										title={flyOutGuide.popupTitle}
										subTitle={flyOutGuide.popupSubTitle}
									></FlyOutModal>
								) : (
									""
								)}
								{showAllSearchOptionFlyout && (
									<Flyout onClose={this.doCloseFlyout} target={this.otherFilterOptionRef} width={320} height={120}>
										{flyOutGuide.flyOut[4]}
									</Flyout>
								)}
								{showNotificationFlyout &&
									this.props.flyout_getNotificationIndex === FLYOUT_DEFAULT_NOTIFICATION &&
									this.props.flyout_getNotificationCount > NOTIFICATION_COUNT_DEFAULT && (
										<Flyout
											width={350}
											height={110}
											onClose={this.doCloseFlyoutNotification}
											target={this.notificationRef}
											side_preference={"bottom"}
										>
											{flyOutGuide.flyOutNotification}
										</Flyout>
									)}
								{isShowContentRequestModal && (
									<ContentRequestModal
										defaultValues={defaultValues}
										api={this.props.api}
										handleClose={this.hideContentRequestModal}
									></ContentRequestModal>
								)}
							</>
						);
					}
				}
			)
		)
	)
);
