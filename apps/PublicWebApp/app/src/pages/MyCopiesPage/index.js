import React from "react";
import withAdminAuthRequiredConsumer from "../../common/withAdminAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import styled from "styled-components";
import Header from "../../widgets/Header";
import queryString from "query-string";
import FavoriteIcon from "../../widgets/FavoriteIcon";
import getThumbnailUrl from "../../common/getThumbnailUrl";
import TableGrid from "../../widgets/TableGrid";
import Loader from "../../widgets/Loader";
import { getShortFormContributors } from "../../common/misc";
import SearchFilters from "./SearchFilters";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import AdminPageWrap from "../../widgets/AdminPageWrap";
import AdminPageMessage from "../../widgets/AdminPageMessage";
import AdminPageFilterMessage from "../../widgets/AdminPageFilterMessage";
import getSearchFilterText from "../../common/getSearchFilterText";
import TableGridFooter from "../../widgets/TableGridFooter";
import mappingExtractStatus from "../../common/mappingExtractStatus";
import TableEditLink from "../../widgets/TableEditLink";
import { FormSaveButton, WrapperDiv } from "../../widgets/AdminStyleComponents";
import MaybeLinkToSingleCopy from "../../widgets/MaybeLinkToSingleCopy";
import CopyCreationAccessDeniedPopup from "../../widgets/CopyCreationAccessDeniedPopup";
import TwoOptionSwitch from "../../widgets/ToggleSwitch/TwoOptionSwitch";
import CheckBoxField from "../../widgets/CheckBoxField";
import theme from "../../common/theme";
import ReactivateActionModal from "./ReactivateActionModal";
import reactCreateRef from "../../common/reactCreateRef";
import customSetTimeout from "../../common/customSetTimeout";
import FlyOutModal from "../../widgets/FlyOutModal";
import Flyout from "../../widgets/Flyout";
import flyOutGuide from "./flyOutGuide";
import FlyOutHandler from "../../common/FlyOutHandler";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import staticValues from "../../common/staticValues";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import setDefaultCoverImage from "../../common/setDefaultCoverImage";

//set the defualt behaviour of column header
const COLUMN_ALIGN = "left";
const ACTION_LIST = "list";
const JUMP_TO_CONTENT_ID = "main-content";
const ACTIVE_ONLY = "active_only";
const REVIEW_ONLY = "review_only";
const SUCCESS_MESSAGE_TIME_LIMIT = 15000;
const FLYOUT_DEFAULT_INDEX = -1; //Default Index -1
const FLYOUT_INDEX_FIRST = 0;
/* This constant is used for showing filter text */
const AVAILABLE_FILTERS = [{ name: "Class", stateKey: "selectedClass" }];
const FLYOUT_DEFAULT_NOTIFICATION = -1; // default notification index
const NOTIFICATION_COUNT_DEFAULT = 0; // default notification count

const homeScreenBox = staticValues.homeScreenBox;
const FLYOUT_SCREEN_REVIEW_COPIES = homeScreenBox.reviewCopies;
const EXTRACT_STATUS_CANCELLED = staticValues.extractStatus.cancelled;

const Wraper = styled.div`
	display: flex;
	align-items: center;
`;
const ItemImage = styled.img`
	display: flex;
	width: 30px;
	height: 40px;
	border: 1px solid #abcad1;
`;

const BookTitle = styled.label`
	margin-left: 8px;
	overflow: hidden;
	text-overflow: ellipsis;
	margin-bottom: 0;
`;

const WrapLink = styled.label`
	text-decoration: underline;
	margin-bottom: 0;
`;

const WrapActionLink = styled.div`
	width: 100%;
	justify-content: flex-end;
	display: flex;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		padding-top: 10px;
		justify-content: flex-start;
	}
`;

const ReviewPageLink = styled.div`
	cursor: pointer;
	text-decoration: underline;
	color: ${theme.colours.primary};
	:hover {
		text-decoration: none;
	}
`;

const WrapCopyHeader = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		flex-direction: column;
	}
`;

const CopySwitch = styled.div`
	min-width: 250px;
`;

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

const ReactivateButton = styled(FormSaveButton)`
	margin-right: 0;
`;

const ReviewPageReadirectNote = styled.div`
	text-align: left;
	color: ${theme.colours.grayTextColor};
`;

const SelectAllCheckBoxInputText = styled.div`
	display: flex;
`;

const WrapHideExpiredCopy = styled.div`
	margin-bottom: 2em;
`;

const TooltipIconWrap = styled.span`
	padding-left: 0.3em;
	font-size: 0.8em;
`;

const ReviewInstructions = styled.div`
	border: 2px solid ${theme.colours.bgDarkPurple};
	padding: 1em;
	margin-top: 1em;
	margin-bottom: 1em;
	& > :last-child {
		margin-bottom: 0;
	}
	a {
		color: #006473;
	}
`;

const EditIcon = styled.div`
	opacity: 0.3;
	color: ${theme.colours.headerButtonSearch};
`;

const InfoIcon = styled.i`
	color: ${theme.colours.primary} !important;
	font-weight: bold !important;
	margin-left: 10px;
`;

const ToolTipLink = styled.a`
	color: ${theme.colours.primary};
	:hover {
		color: ${theme.colours.primary};
		cursor: pointer;
	}
`;
const HeaderInfoLink = styled(ToolTipLink)`
	margin-left: -5px;
`;
const CopyEditInfoLink = styled(ToolTipLink)`
	margin-left: 5px;
`;

/**
 * Component for the 'My Copies Page'
 * @extends React.PureComponent
 */
export default withAdminAuthRequiredConsumer(
	{ teacher: true, "school-admin": true },
	withApiConsumer(
		class MyCopiesPage extends React.PureComponent {
			_selectAllRef = reactCreateRef();
			_showReviewCopyRef = reactCreateRef();
			_flyOutHandlerNotification = new FlyOutHandler(this, this.props.api, "notification");
			_notificationRef = React.createRef(null);

			state = {
				extracts: null,
				f_page_count: "",
				f_title: "",
				f_year: "",
				f_course: "",
				f_mine_only: true,
				limit: 10,
				offset: 0,
				sort_field: "work_title",
				sort_dir: "A",
				loading: true,
				copiesLoaded: false,
				tableRows: null,
				filters: null,
				classData: null,
				selectedClass: [],
				query: "",
				q_mine_only: 0,
				searchFilterText: null,
				showModal: false,
				expiry_status: null,
				isReviewScreen: false,
				isShowReactivateConfirmModal: false,
				oids: [],
				mapOids: Object.create(null),
				hasSelectedAllCopies: false,
				extractRreactivatedResponse: null,
				showReactivateSuccessMessage: false,
				screenFlyOutIndex: null,
				notificationCount: 0,
			};

			componentDidMount() {
				this._isMounted = true;
				this.resetAll = this.resetAll.bind(this);
				this.handlefilterSelection = this.handlefilterSelection.bind(this);
				this.hideExpiredCopies = this.hideExpiredCopies.bind(this);
				this.fetchFilters();
				this.updateState();
			}

			componentWillUnmount() {
				delete this._isMounted;
				if (this._reactivateTimeout) {
					clearTimeout(this._reactivateTimeout);
				}
			}

			componentDidUpdate(prevProps, prevState) {
				if (this.props.location.search !== prevProps.location.search) {
					this.updateState();
				}
				const userDetail = this.props.withAuthConsumer_myUserDetails;
				if (userDetail && userDetail.flyout_enabled && this.state.screenFlyOutIndex != prevState.screenFlyOutIndex) {
					this.updateHomeScreenBoxIndex();
				}
			}

			// Update the HomeScreen Index
			updateHomeScreenBoxIndex() {
				if (this.state.screenFlyOutIndex === FLYOUT_DEFAULT_INDEX) {
					this.props.api("/public/first-time-user-experience-update", {
						screen: FLYOUT_SCREEN_REVIEW_COPIES,
						index: 0,
					});
				}
			}

			fetchFilters() {
				this.props
					.api("/public/extract-get-filters")
					.then((result) => {
						if (!this._isMounted) {
							return;
						}
						let resultFilter = result.result;
						let filters = [];
						let classData;

						/** bind the filter data */
						for (const item in resultFilter) {
							filters.push(resultFilter[item]);
						}

						if (filters) {
							let classArray = filters.find((filter) => filter.id === "class");
							classData = classArray ? this.arrayMapping(classArray.data) : null;
						}

						this.setState(
							{
								filters: filters,
								classData: classData,
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

			updateState() {
				if (this.state.filters) {
					const parsed = queryString.parse(this.props.location.search);
					let limit = parseInt(parsed.limit, 10) || this.state.limit;
					if (limit < 1) {
						limit = 1;
					}
					let offset = parseInt(parsed.offset, 10) || this.state.offset;
					if (offset < 0) {
						offset = 0;
					}
					const mineOnly = parsed.q_mine_only === "1";
					let query = parsed.query || "";
					const isReviewScreen = parsed.review === "1" ? true : false;
					const newState = {
						q_page_count: parsed.q_page_count,
						q_title: parsed.q_title,
						q_year: parsed.q_year,
						q_course: parsed.q_course,
						q_mine_only: mineOnly,
						f_page_count: parsed.q_page_count,
						f_title: parsed.q_title,
						f_year: parsed.q_year,
						f_course: parsed.q_course,
						f_mine_only: mineOnly,
						asset_user_upload_oid: parsed.asset_user_upload_oid,

						limit: limit,
						offset: offset,
						query: query,
						selected: {},
						isReviewScreen: isReviewScreen,
						expiry_status: isReviewScreen ? REVIEW_ONLY : parsed.expiry_status,
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
								if (filterGroupId === "class") {
									selectedMap.push(parseInt(value));
								}
							}
							newState.selected[filterGroupId] = selectedMap;
						}
					}

					//check the selected class value and if extis then store in state value
					if (newState.selected.hasOwnProperty("class") && Array.isArray(newState.selected.class) && newState.selected.class.length > 0) {
						let arr = newState.selected.class;
						let bindSelectedClass = this.state.classData.filter((d) => arr.some((s) => s === d.value));
						newState.selectedClass = bindSelectedClass;
					}

					const userDetail = this.props.withAuthConsumer_myUserDetails;
					if (userDetail && userDetail.flyout_enabled) {
						const screen = isReviewScreen ? FLYOUT_SCREEN_REVIEW_COPIES : "copies";
						this._flyOutHandler = new FlyOutHandler(this, this.props.api, screen);
						this._flyOutHandler.getSeen();
						this._flyOutHandler.getSeenFlyOutIndex(FLYOUT_SCREEN_REVIEW_COPIES);
						this._flyOutHandlerOnCloseBound = this._flyOutHandler.onClose.bind(this._flyOutHandler);
					}
					this.setState(newState, this.performQuery);
				}
			}

			getQueryString(extra) {
				const obj = {
					q_page_count: this.state.q_page_count,
					q_title: this.state.q_title,
					q_year: this.state.q_year,
					q_course: this.state.q_course,
					q_mine_only: Number(this.state.q_mine_only),
					limit: this.state.limit,
					offset: this.state.offset,
					query: this.state.query,
					expiry_status: this.state.expiry_status,
					review: Number(this.state.isReviewScreen),
				};

				// if selectedClass extis in the query
				if (extra.hasOwnProperty("selectedClass") && Array.isArray(extra.selectedClass) && extra.selectedClass.length > 0) {
					let selectedClass = [];
					for (const item of extra.selectedClass) {
						selectedClass.push(item.value);
					}
					obj["filter_class"] = selectedClass.join(",");
					delete extra.selectedClass;
				}

				Object.assign(obj, extra || {});
				return queryString.stringify(obj);
			}

			pushHistory(extra) {
				const url = "/profile/my-copies?" + this.getQueryString(extra);
				this.props.history.push(url);
			}

			/**
			 * Get copies information
			 */
			performQuery() {
				let searchFilterText = "";
				let selected_Filter = this.getSelectedFilters();
				this.props
					.api("/public/extract-search", {
						limit: parseInt(this.state.limit, 10),
						offset: parseInt(this.state.offset, 10),
						page_count: parseInt(this.state.q_page_count, 10),
						title: this.state.q_title,
						year: parseInt(this.state.q_year, 10),
						course_name: this.state.q_course,
						mine_only: this.state.isReviewScreen ? true : this.state.q_mine_only,
						order_by: [this.state.sort_field, this.state.sort_dir],
						query: this.state.query,
						filter: this.state.selected,
						expiry_status: this.state.isReviewScreen ? REVIEW_ONLY : this.state.expiry_status,
						asset_user_upload_oid: this.state.asset_user_upload_oid,
					})
					.then((result) => {
						if (!this._isMounted) {
							return;
						}
						const withStausData = mappingExtractStatus(result.extracts);
						searchFilterText = getSearchFilterText(this.state.limit, this.state.offset, this.state.query, selected_Filter, result.unfiltered_count);
						this.setState(
							{
								copiesLoaded: true,
								searchFilterText: searchFilterText,
							},
							() => {
								this.bindTableData(withStausData, result.unfiltered_count);
							}
						);
					})
					.catch((e) => {
						searchFilterText = getSearchFilterText(this.state.limit, this.state.offset, this.state.query, selected_Filter, 0);
						this.setState({
							extracts: [],
							unfiltered_count: 0,
							searchFilterText: searchFilterText,
						});
					});
			}

			/**resetAll
			 * Toggle showing "My Copies"
			 */
			doMineOnlyToggle = () => {
				this.setState({
					offset: 0,
					loading: true,
				});
				const newHistory = {
					q_page_count: this.state.f_page_count,
					q_title: this.state.f_title,
					q_year: this.state.f_year,
					q_course: this.state.f_course,
					q_mine_only: Number(!this.state.f_mine_only),
					offset: 0,
					query: this.state.query,
					selectedClass: this.state.selectedClass,
					asset_user_upload_oid: this.state.asset_user_upload_oid,
				};

				this.pushHistory(newHistory);
			};

			doPagination = (page, limit) => {
				const currentPage = page == 0 ? 0 : page - 1;
				const setOffset = currentPage * limit;
				const setLimit = limit;

				this.setState({ offset: setOffset, limit: setLimit });
				this.pushHistory({
					offset: setOffset,
					limit: setLimit,
					query: this.state.query,
					selectedClass: this.state.selectedClass,
					asset_user_upload_oid: this.state.asset_user_upload_oid,
				});
			};

			doSorting = (sorting) => {
				const columnSorting = sorting[0];
				if (columnSorting) {
					const sortDirectionString = columnSorting.direction === "desc" ? "D" : "A";
					this.setState({
						sort_field: columnSorting.columnName,
						sort_dir: sortDirectionString,
						offset: 0,
						loading: true,
					});
					this.pushHistory({
						offset: 0,
						query: this.state.query,
						selectedClass: this.state.selectedClass,
						sort_field: columnSorting.columnName,
						sort_dir: sortDirectionString,
						asset_user_upload_oid: this.state.asset_user_upload_oid,
					});
				}
			};

			doToggleFavorite = (index) => {
				const extract = this.state.extracts[index];
				const oid = extract.oid;
				const newFavorite = !extract.is_favorite;
				this.props
					.api(`/public/extract-favorite`, {
						oid: oid,
						is_favorite: newFavorite,
					})
					.then((result) => {
						if (
							this._isMounted &&
							result.success &&
							Array.isArray(this.state.extracts) &&
							this.state.extracts[index] &&
							this.state.extracts[index].oid === oid
						) {
							const extracts = [...this.state.extracts];
							extracts[index] = { ...extracts[index], is_favorite: newFavorite };
							this.setState(
								{
									extracts: extracts,
								},
								() => {
									this.bindTableData(this.state.extracts, this.state.unfiltered_count);
								}
							);
						}
					});
			};

			bindTableData = (withStausData, unfiltered_count) => {
				const myUserDetails = this.props.withAuthConsumer_myUserDetails;
				const canCopy = myUserDetails.can_copy;
				const hasTrialExtractAccess = myUserDetails.has_trial_extract_access;

				//declare columns
				let columns = [
					{
						name: "status",
						title: [
							<>
								Status
								<HeaderInfoLink href="https://educationplatform.zendesk.com/hc/en-us/articles/4404469871505" target="_blank">
									<InfoIcon className="fas fa-info-circle"></InfoIcon>
								</HeaderInfoLink>
							</>,
						],
					},
					{ name: "work_title", title: "Book title" },
					{ name: "work_authors", title: "Authors" },
					{ name: "teacher", title: "User" },
					{ name: "title", title: "Copy name" },
					{ name: "year_group", title: "Year" },
					{ name: "course_name", title: "Class" },
					{ name: "page_count", title: "Page count" },
					{ name: "date_created", title: "Creation date" },
					{ name: "share", title: "View copy" },
				];

				this.state.isReviewScreen &&
					columns.unshift({
						name: "select",
						title: [
							<WrapSelectAllCheckBox>
								{" "}
								<SelectAllCheckBoxText>Select</SelectAllCheckBoxText>
								<SelectAllCheckBoxInputText>
									<SelectAllCheckBoxInput type="checkbox" ref={this._selectAllRef} onChange={this.onChangeSelectedAllCheckbox} />
									<SelectAllCheckBoxSmallText>ALL</SelectAllCheckBoxSmallText>
								</SelectAllCheckBoxInputText>
							</WrapSelectAllCheckBox>,
						],
					});
				this.state.isReviewScreen && columns.unshift({ name: "review", title: "Review" });
				let finalColumns;

				if (this.state.q_mine_only === true) {
					const columnsWithoutTeacher = [];
					for (const col of columns) {
						if (col.name !== "teacher") {
							columnsWithoutTeacher.push(col);
						}
						if (this.state.isReviewScreen && col.name === "course_name") {
							columnsWithoutTeacher.push({ name: "no_of_students", title: "Number of students" });
						}
					}
					finalColumns = columnsWithoutTeacher;
				} else {
					finalColumns = columns;
				}

				//arrange the column records
				const tableRows = withStausData.map((row, index) => {
					const newRow = { ...row };
					newRow.work_title = (
						<Wraper>
							<ItemImage src={getThumbnailUrl(row.work_isbn13)} alt={row._orig_work_title} onError={setDefaultCoverImage} />
							&nbsp;&nbsp;&nbsp;
							<FavoriteIcon data={index} onClick={this.doToggleFavorite} is_favorite={row.is_favorite} />
							<BookTitle>{row._orig_work_title}</BookTitle>
						</Wraper>
					);

					const authorsData = getShortFormContributors(row._orig_work_authors);
					newRow.work_authors = authorsData ? authorsData.authors : null;

					const copyName = row._orig_title;
					if (row.status.toLowerCase() !== EXTRACT_STATUS_CANCELLED) {
						if (canCopy) {
							newRow.title = (
								<WrapLink>
									<TableEditLink to={`/profile/management/${row.oid}`}>{copyName}</TableEditLink>
								</WrapLink>
							);
							newRow.share = (
								<TableEditLink to={`/profile/management/${row.oid}`} title={copyName}>
									<i className="fal fa fa-edit" />
								</TableEditLink>
							);
						} else if (!canCopy && hasTrialExtractAccess) {
							newRow.title = (
								<WrapLink>
									<MaybeLinkToSingleCopy oid={row.oid} doShowModal={this.doShowModal} linkText={copyName} />
								</WrapLink>
							);
							newRow.share = <MaybeLinkToSingleCopy oid={row.oid} doShowModal={this.doShowModal} hovertitle={copyName} />;
						} else {
							newRow.title = (
								<WrapLink>
									<TableEditLink to={`/profile/management/${row.oid}`} disable={true}>
										{copyName}
									</TableEditLink>
								</WrapLink>
							);
							newRow.share = (
								<TableEditLink to={`/profile/management/${row.oid}`} disable={true} title={copyName}>
									<i className="fal fa fa-edit" />
								</TableEditLink>
							);
						}
					} else {
						newRow.title = (
							<div title="This copy has been deleted, and can no longer be accessed.">
								{copyName}
								<CopyEditInfoLink href="https://educationplatform.zendesk.com/hc/en-us/articles/4404469871505" target="_blank">
									<i className="fas fa-info-circle"></i>
								</CopyEditInfoLink>
							</div>
						);
						newRow.share = (
							<EditIcon>
								<i className="fal fa fa-edit" title="This copy has been deleted, and can no longer be accessed." />
							</EditIcon>
						);
					}
					newRow.year = row.year_group;

					if (this.state.isReviewScreen) {
						let pages = row.pages.join("-");
						newRow.review = (
							<TableEditLink to={`/works/${row.work_isbn13}/extract?rollover_review_oid=${row.oid}&course=${row.course_oid}&selected=${pages}`}>
								<i className="fal fa fa-edit"></i>
							</TableEditLink>
						);

						newRow.select = (
							<input
								type="checkbox"
								name={row.oid}
								data-oid={row.oid}
								onChange={this.onChangeExtractCheckBox}
								checked={
									(this.state.hasSelectedAllCopies && !this.state.mapOids[row.oid]) ||
									(!this.state.hasSelectedAllCopies && this.state.mapOids[row.oid])
								}
							/>
						);

						newRow.no_of_students = (
							<span
								title={
									!row.number_of_students
										? "Please make sure this is the correct number of students for this class, as this number cannot be edited after you reinstate or create copies. If you need to change the Class details, go to the Classes page before you reinstate your copies."
										: null
								}
							>
								{row.number_of_students || row.students_in_course}
								{!row.number_of_students ? (
									<TooltipIconWrap>
										<FontAwesomeIcon icon={faQuestionCircle} />
									</TooltipIconWrap>
								) : null}
							</span>
						);
					}
					return newRow;
				});

				//column resizing
				let defaultColumnWidths = [
					{ columnName: "review", width: 100 },
					{ columnName: "select", width: 100 },
					{ columnName: "status", width: 100 },
					{ columnName: "work_title", width: 408 },
					{ columnName: "work_authors", width: 180 },
					{ columnName: "teacher", width: 180 },
					{ columnName: "title", width: 150 },
					{ columnName: "year_group", width: 85 },
					{ columnName: "course_name", width: 180 },
					{ columnName: "no_of_students", width: 180 },
					{ columnName: "page_count", width: 55 },
					{ columnName: "date_created", width: 152 },
					{ columnName: "share", width: 65 },
				];

				//default sorting
				let defaultSorting = [
					{
						columnName: this.state.sort_field,
						direction: this.state.sort_dir === "A" ? "asc" : "desc",
					},
				];

				//column initilization and alignment
				let tableColumnExtensions = [
					{ columnName: "review", align: "center" },
					{ columnName: "select", align: "center" },
					{ columnName: "status", align: COLUMN_ALIGN },
					{ columnName: "work_title", align: COLUMN_ALIGN },
					{ columnName: "work_authors", align: COLUMN_ALIGN },
					{ columnName: "teacher", align: COLUMN_ALIGN },
					{ columnName: "title", align: COLUMN_ALIGN },
					{ columnName: "year_group", align: COLUMN_ALIGN },
					{ columnName: "course_name", align: COLUMN_ALIGN },
					{ columnName: "no_of_students", align: "center" },
					{ columnName: "page_count", align: COLUMN_ALIGN },
					{ columnName: "date_created", align: COLUMN_ALIGN },
					{ columnName: "share", align: "center" },
				];

				//default disable column for sorting
				let sortingStateColumnExtensions = [
					{ columnName: "review", sortingEnabled: false },
					{ columnName: "select", sortingEnabled: false },
					{ columnName: "share", sortingEnabled: false },
					{ columnName: "work_authors", sortingEnabled: false },
					{ columnName: "no_of_students", sortingEnabled: false },
				];

				//for set fixed column
				let leftColumns = this.state.isReviewScreen ? ["review"] : ["status"];
				// let leftColumns = ["select"];
				let rightColumns = ["share"];
				//date type column names
				let dateColumnsName = ["date_created"];

				this.setState({
					unfiltered_count: unfiltered_count,
					extracts: withStausData,
					columns: finalColumns,
					tableRows: tableRows,
					defaultColumnWidths: defaultColumnWidths,
					tableColumnExtensions: tableColumnExtensions,
					defaultSorting: defaultSorting,
					sortingStateColumnExtensions: sortingStateColumnExtensions,
					loading: false,
					leftColumns: leftColumns,
					rightColumns: rightColumns,
					dateColumnsName: dateColumnsName,
				});
			};

			doSearch = () => {
				this.setState({ message: null, offset: 0 });
				this.pushHistory({
					query: this.state.query,
					offset: 0,
					action: ACTION_LIST,
					oid: null,
					selectedClass: this.state.selectedClass,
					asset_user_upload_oid: this.state.asset_user_upload_oid,
				});
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
				this.setState({ query: "", selectedClass: [], message: null, asset_user_upload_oid: null });
				this.pushHistory({
					query: "",
					offset: 0,
					action: ACTION_LIST,
					oid: null,
					selectedClass: [],
					asset_user_upload_oid: null,
				});
			}

			/** fill the state new value */
			handlefilterSelection = (selected, filterName) => {
				//bind new filter data of school and examboard
				switch (filterName.toLowerCase()) {
					case "class":
						this.setState({ selectedClass: selected });
						break;
					case "query":
						this.setState({ query: selected });
						break;
				}
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

			//show the modal for unverfied or un approve user
			doShowModal = (value) => {
				this.setState({ showModal: value });
			};
			//hide the modal for unverfied or un approve user
			hideModal = () => {
				this.setState({ showModal: false });
			};

			hideExpiredCopies = (name, value, isValid) => {
				this.setState({ offset: 0 }, () => {
					this.pushHistory({
						offset: 0,
						query: this.state.query,
						expiry_status: value ? ACTIVE_ONLY : null,
						mine_only: 1,
					});
				});
			};
			showCopyReviewPage = () => {
				this.setState(
					{
						oids: [],
						mapOids: Object.create(null),
						hasSelectedAllCopies: false,
						offset: 0,
						showReactivateSuccessMessage: false,
						extractRreactivatedResponse: null,
					},
					() => {
						this.pushHistory({
							offset: 0,
							query: this.state.query,
							expiry_status: REVIEW_ONLY,
							q_mine_only: 1,
							review: 1,
						});
					}
				);
			};
			showMyCopyPage = () => {
				this.setState({ oids: [], mapOids: Object.create(null), hasSelectedAllCopies: false, offset: 0 }, () => {
					this.pushHistory({
						offset: 0,
						query: this.state.query,
						expiry_status: ACTIVE_ONLY,
						q_mine_only: 1,
						review: 0,
					});
				});
			};

			showReactivateConfirmModal = () => {
				this.setState({ isShowReactivateConfirmModal: true });
			};

			hideReactivateConfirmModel = () => {
				this.setState({ isShowReactivateConfirmModal: false });
			};

			onConfirmReactivateExtract = () => {
				// to do confirm reactivate review copy
				this.setState({ copiesLoaded: false, isShowReactivateConfirmModal: false }, () => {
					this.props
						.api("/public/extract-reactivate", {
							title: this.state.q_title,
							query: this.state.query,
							filter: this.state.selected,
							has_selected_all_copies: this.state.hasSelectedAllCopies,
							oids: this.state.oids,
						})
						.then((result) => {
							const extractRreactivatedResponse = {
								erroredExtract: result.erroredExtract,
								reactivateCount: result.reactivateCount,
								copyTitle: result.title,
								pdf_isbn13: result.pdf_isbn13,
								course_oid: result.course_oid,
								oid: result.oid,
								pages: result.pages,
								leftToReview: this.state.unfiltered_count - this.getSelectedExtractReactivateCount(),
							};

							this.setState(
								{
									copiesLoaded: true,
									extractRreactivatedResponse: extractRreactivatedResponse,
									showReactivateSuccessMessage: result.reactivateCount > 0,
								},
								() => {
									if (result.reactivateCount > 0) {
										this._reactivateSuccessTimeout = customSetTimeout(async () => {
											this.setState({
												showReactivateSuccessMessage: false,
												extractRreactivatedResponse: null,
											});
										}, SUCCESS_MESSAGE_TIME_LIMIT);
										this.showMyCopyPage();
									}
								}
							);
						});
				});
			};

			getSelectedExtractReactivateCount = () => {
				let count = 0;
				if (this.state.hasSelectedAllCopies) {
					count = this.state.unfiltered_count - this.state.oids.length;
				} else {
					count = this.state.oids.length;
				}
				return count;
			};

			onChangeSelectedAllCheckbox = () => {
				this.setState(
					{
						hasSelectedAllCopies: !this.state.hasSelectedAllCopies,
						oids: [],
						mapOids: Object.create(null),
					},
					() => {
						this.bindTableData(this.state.extracts, this.state.unfiltered_count);
					}
				);
			};

			onChangeExtractCheckBox = (e) => {
				const oid = e.currentTarget.getAttribute("data-oid");
				let newMapOids = { ...this.state.mapOids };
				let hasSelectAll = this.state.hasSelectedAllCopies;
				if (this.state.hasSelectedAllCopies) {
					if (newMapOids[oid]) {
						delete newMapOids[oid];
					} else {
						newMapOids[oid] = true;
					}
					if (Object.keys(newMapOids).length === this.state.unfiltered_count) {
						this._selectAllRef.current.checked = false;
						hasSelectAll = false;
						newMapOids = Object.create(null);
					}
				} else {
					if (!newMapOids[oid]) {
						newMapOids[oid] = true;
					} else {
						delete newMapOids[oid];
					}
					if (Object.keys(newMapOids).length === this.state.unfiltered_count) {
						this._selectAllRef.current.checked = true;
						hasSelectAll = true;
						newMapOids = Object.create(null);
					}
				}
				this.setState(
					{
						oids: Object.keys(newMapOids),
						mapOids: newMapOids,
						hasSelectedAllCopies: hasSelectAll,
					},
					() => {
						this.bindTableData(this.state.extracts, this.state.unfiltered_count);
					}
				);
			};

			resetExtractRreactivatedResponse = () => {
				this.setState({
					extractRreactivatedResponse: null,
				});
			};

			render() {
				let copyTable = <AdminPageMessage> No results found </AdminPageMessage>;
				let reactivateButtonText = "Reactivate Copy";
				const selectedReactivateCount = this.getSelectedExtractReactivateCount();
				if (selectedReactivateCount > 1) {
					reactivateButtonText = "Reactivate Copies";
				}
				if (!this.state.copiesLoaded) {
					copyTable = (
						<AdminPageMessage>
							<Loader />
						</AdminPageMessage>
					);
				}
				let hideExpiredCopies = !this.state.isReviewScreen && (
					<>
						<WrapActionLink>
							<CheckBoxField
								name="hideExpiedCopies"
								title="Hide expired copies"
								isRequired={false}
								isValid={true}
								value={false}
								checked={this.state.expiry_status}
								onChange={this.hideExpiredCopies}
							/>
						</WrapActionLink>

						{this.state.expiry_status === ACTIVE_ONLY && (
							<ReviewPageReadirectNote>
								Your copies from last year have now expired, in line with the terms of your CLA Education Licence. To review them, go to the Review
								Copies page via the menu or above link.
							</ReviewPageReadirectNote>
						)}
					</>
				);

				if (this.state.tableRows !== null && this.state.tableRows.length !== 0) {
					copyTable = (
						<>
							<TableGrid
								column={this.state.columns}
								row={this.state.tableRows}
								resize={this.state.defaultColumnWidths}
								tableColumnExtensions={this.state.tableColumnExtensions}
								defaultSorting={this.state.defaultSorting}
								sortingStateColumnExtensions={this.state.sortingStateColumnExtensions}
								doSorting={this.doSorting}
								loading={this.state.loading}
								leftColumns={this.state.leftColumns}
								rightColumns={this.state.rightColumns}
								dateColumnsName={this.state.dateColumnsName}
								isContainImage={true}
							/>
							{this.state.isReviewScreen && (
								<WrapActionLink>
									<ReactivateButton
										type="submit"
										name="reactivate-copy"
										value="update-publisher"
										onClick={this.showReactivateConfirmModal}
										disabled={
											(!this.state.hasSelectedAllCopies && !this.state.oids.length) ||
											(this.state.hasSelectedAllCopies && this.state.oids.length === this.state.unfiltered_count)
										}
									>
										{reactivateButtonText}
									</ReactivateButton>
								</WrapActionLink>
							)}
							{hideExpiredCopies}
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
				let flyOutSection = null;
				const myUserDetails = this.props.withAuthConsumer_myUserDetails;
				if (myUserDetails && myUserDetails.flyout_enabled) {
					let closing =
						this.state.flyOutIndexNotification === FLYOUT_DEFAULT_NOTIFICATION && this.state.notificationCount > NOTIFICATION_COUNT_DEFAULT
							? false
							: true;
					if (this.state.isReviewScreen && this.state.flyOutIndex === FLYOUT_DEFAULT_INDEX) {
						flyOutSection = (
							<FlyOutModal
								key={-1}
								buttonText={flyOutGuide.buttonText}
								handleShowMe={this._flyOutHandlerOnCloseBound}
								title={flyOutGuide.popupTitle}
								subTitle={flyOutGuide.popupSubTitle}
								closeBackgroundImmediately={closing}
							/>
						);
					} else if (!this.state.isReviewScreen && this.state.flyOutIndex === FLYOUT_DEFAULT_INDEX) {
						flyOutSection = (
							<Flyout onClose={this._flyOutHandlerOnCloseBound} target={this._showReviewCopyRef} width={400} height={120}>
								{flyOutGuide.flyOut[0]}
							</Flyout>
						);
					}

					if (
						this.state.flyOutIndex === 0 &&
						this.state.flyOutIndexNotification === FLYOUT_DEFAULT_NOTIFICATION &&
						this.state.notificationCount > NOTIFICATION_COUNT_DEFAULT
					) {
						flyOutSection = (
							<Flyout width={350} height={110} onClose={this._flyOutHandlerOnCloseBound} target={this._notificationRef} side_preference={"bottom"}>
								{flyOutGuide.flyOutNotification}
							</Flyout>
						);
					}
				}
				return (
					<>
						<HeadTitle title={PageTitle.myCopies} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} notificationRef={this._notificationRef} />
						<AdminPageWrap pageTitle={this.state.isReviewScreen ? "Review Copies" : "My copies"} id={JUMP_TO_CONTENT_ID}>
							{!this.state.isReviewScreen ? (
								<WrapCopyHeader>
									<CopySwitch>
										<TwoOptionSwitch
											start_title="My copies"
											end_title="All copies"
											onChange={this.doMineOnlyToggle}
											value={!this.state.f_mine_only}
										/>
									</CopySwitch>
									<WrapActionLink>
										<ReviewPageLink onClick={this.showCopyReviewPage} name="showCopiesToReviw" ref={this._showReviewCopyRef}>
											Go to the Review Copies page
										</ReviewPageLink>
									</WrapActionLink>
								</WrapCopyHeader>
							) : (
								<WrapActionLink>
									<ReviewPageLink onClick={this.showMyCopyPage} name="showMyCopies">
										View My Copies
									</ReviewPageLink>
								</WrapActionLink>
							)}
							{this.state.isReviewScreen ? (
								<ReviewInstructions>
									<p>
										If you want to make use of one or several of your copies from last year also this year, you can reinstate them here. This can be
										done manually or in bulk.
									</p>
									<ul>
										<li>
											If you want to make changes to a copy before reinstating it, use the manual option. Find your copy in the table below and click
											on the 'review' icon to the left. This will let you change the class, page range and copy name if you wish, before activating
											the copy for the new year.
										</li>
										<li>
											To quickly reinstate several copies at once, tick the 'select' box next to all applicable copies and then click to Reactivate.
											Note that this will keep the same page range, class and copy name as last year. If you haven't yet updated your class' student
											numbers on the Classes page, this will also be taken from last year.
										</li>
									</ul>
									<p>
										<strong>Please note:</strong> When you reinstate a copy and keep the page range the same as last year, the link you shared with
										students last year will remain the same also this year. If you create a copy based on a copy from last year, but with a different
										page range, the share link will change so make sure you share the new link with your students.{" "}
									</p>
									<p>
										<a href="https://educationplatform.zendesk.com/hc/en-us/articles/4402451698577" target="_blank">
											Read more about how to review and reinstate your copies in our Knowledgebase article
										</a>
									</p>
								</ReviewInstructions>
							) : null}
							{this.state.filters ? (
								<SearchFilters
									classData={this.state.classData}
									selectedClass={this.state.selectedClass}
									handlefilterSelection={this.handlefilterSelection}
									filterText={this.state.query}
									queryPlaceHolderText={"Search .."}
									doSearch={this.doSearch}
									resetAll={this.resetAll}
									filtersLength={this.state.filters ? this.state.filters.length : 0}
								/>
							) : null}
							<ReactivateActionModal
								isShowReactivateConfirmModal={this.state.isShowReactivateConfirmModal}
								hideReactivateConfirmModel={this.hideReactivateConfirmModel}
								onConfirmReactivateExtract={this.onConfirmReactivateExtract}
								extractRreactivatedResponse={this.state.extractRreactivatedResponse}
								selectedReactivateCount={selectedReactivateCount}
								resetExtractRreactivatedResponse={this.resetExtractRreactivatedResponse}
								showReactivateSuccessMessage={this.state.showReactivateSuccessMessage}
							></ReactivateActionModal>
							<WrapperDiv>
								<AdminPageFilterMessage>{this.state.searchFilterText}</AdminPageFilterMessage>
								{copyTable}
								<WrapHideExpiredCopy>{this.state.tableRows && this.state.tableRows.length === 0 && hideExpiredCopies}</WrapHideExpiredCopy>
								{this.state.showModal && <CopyCreationAccessDeniedPopup handleClose={this.hideModal} />}
							</WrapperDiv>
						</AdminPageWrap>
						{flyOutSection}
					</>
				);
			}
		}
	)
);
