import React from "react";
import { Link, Redirect } from "react-router-dom";
import withAuthRequiredConsumer from "../../common/withAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import googleEvent from "../../common/googleEvent";
import queryString from "query-string";
import styled, { css } from "styled-components";
import Header from "../../widgets/Header";
import theme from "../../common/theme";
import extractIsbn from "../../common/extractIsbn";
import Loader from "../../widgets/Loader";
import WizardExtract from "../../widgets/WizardExtract";
import BookCoverPage from "./BookCoverPage";
import BookContentPage from "./BookContentPage";
import getPagePreviewUrl from "../../common/getPagePreviewUrl";
import { rangeExpand } from "../../common/rangeExpand";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import CopiesTable from "../../widgets/CopiesTable";
import mappingExtractStatus from "../../common/mappingExtractStatus";
import getPageSequenceNumber from "../../common/getPageSequenceNumber";
import getPageOffsetString from "../../common/getPageOffsetString";
import getPageOffsetObject from "../../common/getPageOffsetObject";
import FlyoutModal from "../../widgets/FlyOutModal";
import Flyout from "../../widgets/Flyout";
import flyOutGuide from "./flyoutGuide";
import FlyOutHandler from "../../common/FlyOutHandler";
import getPageOffset from "../../common/getPageOffset";
import isTouchDevice from "../../common/isTouchDevice";
import CopyCreationAccessDeniedPopup from "../../widgets/CopyCreationAccessDeniedPopup";
import ImageLightBoxWithNote from "../../widgets/ImageLightBoxWithNote";
import smoothScrollTo from "../../common/smoothScroll";
import UserAssetAccessMessage from "../../widgets/UserAssetAccessMessage";
import staticValues from "../../common/staticValues";
import { col12, colLg3, colLg6, colMd12, colMd4, colSm12, formControl, moreLink } from "../../common/style";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { PageContentMedium } from "../../widgets/Layout/PageContentMedium";
import { Button } from "../../widgets/Layout/Button";
import { ButtonLink } from "../../widgets/Layout/ButtonLink";
import { ColSmall } from "../../widgets/Layout/ColSmall";
import UserRole from "../../common/UserRole";

const FILE_FORMAT_EPUB = staticValues.assetFileFormat.epub;
const ACTION = {
	BookTableContent: "BookTableContent",
	TableOfContent: "TableOfContent",
};

const SCREEN = flyOutGuide.screen;
const FLYOUT_INDEX_DEFAULT = -1; // user not seen any flyout for this screen
const FLYOUT_INDEX_ON_HELPTEXT = 2; // flyout option index
const FLYOUT_INDEX_ON_NEXT = 3; // flyout option index
const FLYOUT_INDEX_ON_EPUB = 4; // flyout option index
const FLYOUT_INDEX_ON_LAST_EPUB = 7; // flyout last index when asset file format is epub
const FLYOUT_INDEX_ON_LAST_PDF = 4; // flyout last index when asset file format is pdf
const FLYOUT_DEFAULT_NOTIFICATION = -1; // default notification index
const NOTIFICATION_COUNT_DEFAULT = 0; // default notification count
const JUMP_TO_CONTENT_ID = "book-info"; //html element id for jump to specific main content

const NoWorks = styled.div`
	height: 300px;
	width: 100%;
	padding: 0 1em;
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;
`;

const BookBottom = styled.section`
	padding: 30px 0px;
	margin-bottom: 50px;
	background-color: ${theme.colours.lime};
`;

const CustomInput = styled.div`
	background-color: ${theme.colours.white};
	margin-bottom: 0;
	.form-control {
		border: 1px solid ${theme.colours.primary};
		padding-left: 15px;
		font-size: 16px;

		:focus {
			box-shadow: none;
		}

		::placeholder {
			color: ${theme.colours.darkGrey};
		}
	}
`;

const ResetButton = styled.button`
	${moreLink}
	color: ${theme.colours.primary};
	font-weight: normal;
	font-size: 14px;
	display: inline-block;
	padding-right: 1rem;
	background: none !important;
	border: none;
	cursor: pointer;
`;

const BorderStyled = {
	border: `2px solid ${theme.colours.invalidBorder}`,
	color: theme.colours.invalidBorder,
};

const HelpText = styled.div`
	text-align: center;
	line-height: 1.3;
	margin-bottom: 0;
	font-size: 18px;
`;

const KnowledgeBaseIcon = styled.i`
	color: ${theme.colours.primary};
`;

const WrapUserAssetAccessMessage = styled.div`
	font-size: 18px;
`;

const NextIconButton = styled.i`
	margin-left: 0.5rem;
`;

const KnowledgeBaseLink = styled.a``;

const CancelButtonLink = styled(Link)`
	${moreLink}
	padding-right: 1.5rem;
`;

const CustomInputWrap = styled(PageContentMedium, ColSmall)`
	${colLg3}

	padding-top: 1rem;
	@media screen and (min-width: ${theme.breakpoints.tabletPro}) {
		padding-top: 0;
	}
`;

const ButtonWrap = styled.div`
	${col12}
	${colMd4}
	${colLg3}

	padding-top: 1rem;
	text-align: center;
	@media screen and (min-width: ${theme.breakpoints.tabletPro}) {
		padding-top: 0;
	}
`;

const CopiesHeading = styled.h2`
	color: ${theme.colours.primary};
	font-weight: bold;
	font-size: 22px;
`;

const WrapRow = styled(Row)`
	align-items: center;
`;

const WrapFormInput = styled.input`
	${formControl}
	border: 1px solid ${theme.colours.primary};
	padding-left: 15px;
	font-size: 16px;

	:focus {
		box-shadow: none;
	}

	::placeholder {
		color: ${theme.colours.darkGrey};
	}
`;

const WrapHelpText = styled(ColSmall)`
	${colMd12}
	${colLg6}
`;

const ReviewWrap = styled.div`
	background-color: ${theme.colours.bgDarkPurple};
	color: ${theme.colours.white};
	padding: 20px;
	position: relative;
	//max-width: 1150px;
	margin: 30px auto;
	//width: 96%;
	box-shadow: ${theme.shadow};
	text-align: center;
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		width: 90%;
	}
`;

const PromptIcon = styled.i`
	width: 45px;
	height: 45px;
	color: ${theme.colours.messageError};
	border: 4px solid ${theme.colours.messageError};
	background: ${theme.colours.white};
	border-radius: 100%;
	text-align: center;
	line-height: 40px;
	font-size: 20px;
	position: absolute;
	left: -16px;
	top: -22px;
`;

function getPageWord(count) {
	return count === 1 ? "page" : "pages";
}

function getVerb(count) {
	return count === 1 ? "is" : "are";
}

const getPagesRemaining = (state) => {
	if (!state.extractLimitForSchool) {
		return null;
	}
	if (!state.extractLimitForCourse) {
		return null;
	}
	return Math.min(state.pagesLeftForSchool, state.pagesLeftForCourse);
};

export default withAuthRequiredConsumer(
	withApiConsumer(
		class ExtractByPage extends React.PureComponent {
			constructor(props) {
				super(props);
				this.state = {
					resultData: null,
					highlighted: 1,
					paginationPage: 1,
					selectedPagesMap: Object.create(null),
					copyExcludedPagesMap: Object.create(null),
					extractedPages: Object.create(null),
					pageCopyLimit: 0,
					selectedString: "",
					canExtract: false,
					coursesData: [],
					course: "",
					numColumns: 2,
					itemsCountPerPage: 12,
					loading: true,
					isBookTableContent: false,
					isTableOfContent: true,
					copiesData: [],
					sortField: "date_created",
					sortDir: "A",
					limit: 10,
					offset: 0,
					currentPage: 1,
					unfilteredCountForCopies: 0,
					tableIsVisible: true,
					sliderItems: [],
					isSelectPageFromInput: false,
					isInputValid: true,
					userSelectedString: "",
					isTitleFull: false,
					isAuthorFull: false,
					isPublisherFull: false,
					isEditorFull: false,
					isTranslatorFull: false,
					flyOutIndex: null,
					sasToken: null,
					gotoPageValue: "",
					isGoToInputValid: true,
					isOpen: false,
					defaultPhotoIndex: null,
					images: [],
					notificationCount: 0,
					showModal: false,
					excludedImagesIndex: [],
					imagesWithoutNull: [],
					photoIndex: 0,
					photoIndexFullScreen: 0,
					selectedClass: null,
					isShowTooltip: false,
					rolloverReviewOid: null,
					cloneFromExtractOid: null,
				};
				this.onBlur = this.onBlur.bind(this);
				this.limitMessageRef = React.createRef(null);
				this.nextButtonRef = React.createRef(null);
				this.notificationRef = React.createRef(null);
				this._flyOutHandler = new FlyOutHandler(this, this.props.api, SCREEN);
				this._flyOutHandlerNotification = new FlyOutHandler(this, this.props.api, "notification");
				this._flyOutHandlerOnCloseBound = this._flyOutHandler.onClose.bind(this._flyOutHandler);
				this._flyOutNotificationOnCloseBound = this._flyOutHandlerNotification.onCloseNotification.bind(this._flyOutHandlerNotification);
			}

			/* Get data for a single work from the database */
			fetchWork = (isbn) => {
				const isbn13 = extractIsbn(isbn);
				this.props.api("/public/asset-get-one", { isbn13: isbn13, fetch_sas_token: true }).then((result) => {
					const resultData = result.result;
					if (resultData && result.sas_token) {
						const pageOffsetObject = getPageOffsetObject(resultData);
						const pageOffsetString = getPageOffsetString(Object.keys(this.state.selectedPagesMap), pageOffsetObject.roman, pageOffsetObject.arabic);
						const userSelectedString = this.state.isSelectPageFromInput ? this.state.userSelectedString : pageOffsetString;
						const copy_excluded_pages = resultData.copy_excluded_pages;
						const copyExcludedPagesMap = Object.create(null);
						if (Array.isArray(copy_excluded_pages)) {
							for (const page of copy_excluded_pages) {
								copyExcludedPagesMap[page] = true;
							}
						}
						const images = this.getImages(isbn13, resultData.page_count, result.sas_token, copyExcludedPagesMap);
						let excludedImagesIndex = [];
						const imagesWithoutNull = [];
						images.map((url, index) => {
							if (!url) {
								excludedImagesIndex.push(index);
							} else {
								imagesWithoutNull.push(url);
							}
						});

						this.setState(
							{
								resultData: resultData,
								sasToken: result.sas_token,
								loading: false,
								userSelectedString: userSelectedString,
								images: images,
								copyExcludedPagesMap: copyExcludedPagesMap,
								excludedImagesIndex: excludedImagesIndex,
								imagesWithoutNull: imagesWithoutNull,
							},
							this.updateState
						);
						this.updateSliderItems(isbn);
					} else {
						this.setState({
							loading: false,
						});
					}
				});
			};

			getImages = (isbn13, pageCount, sasToken, copyExcludedPagesMap) => {
				const images = [];
				let actualPageCount = 1;
				for (let i = 1; i <= pageCount; i++) {
					if (copyExcludedPagesMap[i]) {
						images.push(null);
					} else {
						images.push(getPagePreviewUrl(isbn13, actualPageCount, sasToken));
						actualPageCount++;
					}
				}
				return images;
			};

			updateSliderItems = (isbn) => {
				if (this.state.resultData && this.state.sasToken) {
					const pageCount = parseInt(this.state.resultData.page_count, 10);
					let sliderItems = [];
					let actualPageCount = 1;
					const copyExcludedPagesMap = this.state.copyExcludedPagesMap;
					for (let i = 0; i < pageCount; i++) {
						const pageNumber = i + 1;
						const selected = this.state.selectedPagesMap[pageNumber];
						if (copyExcludedPagesMap[pageNumber]) {
							sliderItems.push({
								src: null,
								selected: selected,
							});
						} else {
							sliderItems.push({
								src: getPagePreviewUrl(isbn, actualPageCount, this.state.sasToken),
								selected: selected,
							});
							actualPageCount++;
						}
					}
					this.setState({
						sliderItems: sliderItems,
					});
				}
			};

			updateSelectedCourse = () => {
				const courseOid = this.state.course;
				const extractOid = this.state.extractOid || null;
				this.props.api("/public/course-search", { oid: courseOid, extractOid: extractOid }).then((result) => {
					const selectedClass = this.getSelectedClass(result.result);
					this.setState({ selectedClass: selectedClass });
				});
			};

			updateExtractPageLimit = (_) => {
				const isbn13 = this.props.match.params.isbn;
				const extractedPages = this.state.extractedPages;
				const courseOid = this.state.course;
				const extractOid = this.state.extractOid || null;
				if (courseOid != null && courseOid != undefined && courseOid != "") {
					this.props
						.api("/public/get-extract-limits", {
							course_oid: courseOid,
							work_isbn13: isbn13,
							extract_oid: extractOid,
						})
						.then((result) => {
							const extractedPagesForCourseMap = Object.create(null);
							for (const page of result.course.extracted) {
								extractedPagesForCourseMap[page] = true;
							}
							const extractedPagesForSchoolMap = Object.create(null);
							for (const page of result.school.extracted) {
								extractedPagesForSchoolMap[page] = true;
							}
							let extractPageForCourseAttemptCount = result.course.extracted.length;
							let extractPageForSchoolAttemptCount = result.school.extracted.length;
							for (const page in extractedPages) {
								if (extractedPages[page]) {
									if (!extractedPagesForCourseMap[page]) {
										extractPageForCourseAttemptCount++;
									}
									if (!extractedPagesForSchoolMap[page]) {
										extractPageForSchoolAttemptCount++;
									}
								}
							}
							const pagesLeftForCourse = result.course.limit - extractPageForCourseAttemptCount;
							const pagesLeftForSchool = result.school.limit - extractPageForSchoolAttemptCount;

							const newState = {
								extractedPagesForCourseMap: extractedPagesForCourseMap,
								extractedPagesForSchoolMap: extractedPagesForSchoolMap,

								pagesLeftForCourse: pagesLeftForCourse,
								pagesLeftForSchool: pagesLeftForSchool,

								extractLimitForCourse: result.course.limit,
								extractLimitForSchool: result.school.limit,

								extractPageForCourseAttemptCount: extractPageForCourseAttemptCount,
								extractPageForSchoolAttemptCount: extractPageForSchoolAttemptCount,
							};

							if (pagesLeftForCourse < 0 || pagesLeftForSchool < 0) {
								newState.canExtract = false;
							} else {
								newState.canExtract = true;
							}
							this.setState(newState, this.updateSelectedCourse);
						});
				}
			};

			componentDidMount() {
				this._isMounted = true;
				const isbn = this.props.match.params.isbn;
				this.fetchWork(isbn);

				/* -- Check if User has selected for Flyout --- */
				const userDetail = this.props.withAuthConsumer_myUserDetails;
				if (userDetail && userDetail.flyout_enabled) {
					this._flyOutHandler.getSeen();
					this._flyOutHandlerNotification.getSeenNotification();
				}
			}

			componentDidUpdate(prevProps, prevState) {
				const isbn = this.props.match.params.isbn;
				if (isbn !== prevProps.match.params.isbn) {
					this.fetchWork(isbn);
				}
				if (this.props.location.search !== prevProps.location.search) {
					this.updateState(() => {
						this.updateSliderItems(isbn);
					});
				}
				if (prevState.resultData !== this.state.resultData) {
					this.fetchCopies(isbn);
				}
				if (this.state.resultData) {
					const pagesLeft = getPagesRemaining(this.state);
					if (pagesLeft !== null && pagesLeft <= 0) {
						const prevPagesLeft = getPagesRemaining(prevState);
						if (prevPagesLeft !== null && pagesLeft !== prevPagesLeft) {
							if (pagesLeft === 0) {
								const assetTitle = this.state.resultData.title;
								googleEvent("exceedAllowance", "create a copy", "error", `reached copying allowance - ${assetTitle}`);
							} else {
								googleEvent("exceedAllowance", "create a copy", "error", `exceeded copying allowance - ${-pagesLeft} pages`);
							}
						}
					}
				}
			}

			componentWillUnmount() {
				this._flyOutHandler.destroy();
				this._flyOutHandlerNotification.destroy();
				delete this._flyOutHandler;
				delete this._flyOutHandlerNotification;
				delete this._isMounted;
			}

			getCurrentStep() {
				return this.state.selectedClass ? 2 : 1;
			}

			doScrollOnSearchableDropdown() {
				smoothScrollTo(document.querySelector(".smoothScrollTarget"));
			}

			/** Update component state to match query string */
			updateState = (callback) => {
				const parsed = queryString.parse(this.props.location.search);
				const selectedPagesMap = Object.create(null);
				const course = (parsed.course === "undefined" ? "" : parsed.course) || "";
				const extractedPages = Object.create(null);
				if (parsed.selected) {
					const selectedPagesArray = this.pruneOutOfRangeNumbers(parsed.selected);
					for (const key of selectedPagesArray) {
						selectedPagesMap[key] = true;
						if (!this.state.copyExcludedPagesMap[key]) {
							extractedPages[key] = true;
						}
					}
					/**Commented due to highlighted page getting wrong */
					//parsed.highlighted = selectedPagesArray[selectedPagesArray.length - 1];
				}

				const highlightedPaginationPage = Math.ceil(parseInt(parsed.highlighted || 1, 10) / this.state.itemsCountPerPage);
				const numColumns = Math.min(2, Math.max(1, parseInt(parsed.numColumns, 10) || 2));

				let highlightedRaw = parseInt(parsed.highlighted || 1, 10);
				if (parsed.startPage && parsed.startPage > 0) {
					highlightedRaw = parsed.startPage;
				}
				const highlighted = numColumns === 1 ? highlightedRaw : Math.floor(highlightedRaw / 2) * 2;
				// if state containts the value then get from it, otherwise get from the selectedPagesMap
				const pageOffsetObject = getPageOffsetObject(this.state.resultData);
				const pageOffsetString = getPageOffsetString(Object.keys(selectedPagesMap), pageOffsetObject.roman, pageOffsetObject.arabic);
				let userSelectedString = this.state.isSelectPageFromInput ? this.state.userSelectedString : pageOffsetString;

				this.setState(
					{
						highlighted: highlighted || 1,
						selectedPagesMap: selectedPagesMap,
						paginationPage: parsed.p || highlightedPaginationPage,
						course: course,
						numColumns: numColumns,
						userSelectedString: userSelectedString,
						isInputValid: this.state.isSelectPageFromInput ? this.state.isInputValid : true,
						extractedPages: extractedPages,
						rolloverReviewOid: parsed.rollover_review_oid,
						extractOid: parsed.extract_oid,
						cloneFromExtractOid: parsed.clone_from_copy_oid,
					},
					() => {
						if (typeof callback === "function") {
							callback();
						}
						this.updateExtractPageLimit();
					}
				);
			};

			/**
			 * Generate a query string from the component state
			 * @param {object} extra Parameter(s) to be updated
			 *
			 * @returns {string} The generated query string
			 */
			getQueryString(extra) {
				const obj = {
					highlighted: this.state.highlighted,
					selected: Object.keys(this.state.selectedPagesMap).join("-"),
					//Don't use pagination with new ui
					//p: this.state.paginationPage,
					course: this.state.course,
					numColumns: this.state.numColumns,
					rollover_review_oid: this.state.rolloverReviewOid,
					extract_oid: this.state.extractOid,
					clone_from_copy_oid: this.state.cloneFromExtractOid,
				};
				Object.assign(obj, extra || {});
				return queryString.stringify(obj);
			}

			/**
			 * Update the query string
			 * @param {object} extra Query string params to be added/updated
			 */
			pushHistory(extra) {
				const isbn = this.props.match.params.isbn;
				this.props.history.push(`/works/${isbn}/extract?` + this.getQueryString(extra));
			}

			/**
			 * Highlight a page for it to appear in the slider
			 * @param {number} pageNumber
			 */
			highlightPage = (pageIndex) => {
				if (pageIndex >= 0 && pageIndex < this.state.resultData.page_count) {
					this.resetGoToPageText();
					this.pushHistory({ highlighted: pageIndex + 1 });
				}
			};

			goToPageNumber = (pageIndex) => {
				if (pageIndex >= 0 && pageIndex < this.state.resultData.page_count) {
					this.resetGoToPageText();
					this.pushHistory({ highlighted: pageIndex });
				}
			};

			setGoToPageValue = (e) => {
				this.setState({ gotoPageValue: e.target.value });
			};

			resetGoToPageText = () => {
				this.setState({ gotoPageValue: "" });
			};

			handleGotoPageSubmit = (gotoValue) => {
				const cleaned = gotoValue.replace(/[^0-9,-mdclxvi]+/gi, "");
				const pageCount = parseInt(this.state.resultData.page_count, 10);
				const pageOffsetObject = getPageOffsetObject(this.state.resultData);
				const page_offset_roman = pageOffsetObject.roman;
				const page_offset_arabic = pageOffsetObject.arabic;
				let isValid = true;
				//check if any invalid filed return with 0
				if (gotoValue) {
					const data = rangeExpand(gotoValue.toLowerCase(), page_offset_roman, page_offset_arabic, pageCount);
					data.map((item, index) => {
						if (item === 0) {
							isValid = false;
						}
						if (item >= pageCount + 1) {
							isValid = false;
						}
					});
				}
				this.setState({ isGoToInputValid: isValid }, () => {
					//it perform when the string is valid
					if (this.state.isGoToInputValid) {
						const parts = Object.create(null);
						// create an array of numbers and number ranges (e.g. 2-6)
						const rawParts = cleaned.toLowerCase().split(",");
						for (const part of rawParts) {
							// if part is an empty string e.g. if invalid characters were removed
							if (!part) {
								continue;
							}
							if (part.match(/^mdclxvi[-]+$/i)) {
								continue;
							}
							// part only contains digits
							if (part.match(/^[0-9mdclxvi\[\]]+$/i)) {
								let partNum = getPageSequenceNumber(part, page_offset_roman, page_offset_arabic);
								// throw error if part is larger than 5000 or smaller than 1
								if (partNum > 5000 || partNum < 1) {
									this.setState({ errorMessage: true });
									return;
								}
								parts[partNum] = true;
							}
						}
						const selectedPages = Object.keys(parts)
							.map((num) => parseInt(num, 10))
							.sort((a, b) => (a > b ? 1 : b > a ? -1 : 0));
						if (selectedPages.length === 1) {
							this.pushHistory({ highlighted: selectedPages[0] });
						}
					}
				});
			};

			upHandler = (e) => {
				if (!isTouchDevice()) {
					let highlightedPage = this.state.highlighted;
					highlightedPage = parseInt(highlightedPage) + 1;
					if (highlightedPage < this.state.resultData.page_count) {
						this.pushHistory({ highlighted: highlightedPage });
						this.setState({ highlighted: highlightedPage });
					}
				}
			};

			downHandler = (e) => {
				if (!isTouchDevice()) {
					let highlightedPage = this.state.highlighted;
					highlightedPage = highlightedPage - 1;
					if (highlightedPage >= 1) {
						this.pushHistory({ highlighted: highlightedPage });
						this.setState({ highlighted: highlightedPage });
					}
				}
			};

			/**
			 * Add a page to the list of selected pages
			 * @param {number} pageNumber
			 */
			addSelectedPage = (pageNumber) => {
				// user not allowing to select pages when user can't create copy
				if (this.props.withAuthConsumer_myUserDetails && this.props.withAuthConsumer_myUserDetails.can_copy) {
					if (!this.state.selectedClass) {
						this.setState({ isShowTooltip: true }, this.doScrollOnSearchableDropdown());
					} else {
						this.resetGoToPageText();
						let selectedPagesMap = Object.assign(Object.create(null), this.state.selectedPagesMap);
						const newHistory = {};
						if (!selectedPagesMap[pageNumber]) {
							selectedPagesMap[pageNumber] = true;
							newHistory.highlighted = pageNumber;
						} else {
							delete selectedPagesMap[pageNumber];
						}
						const selected = Object.keys(selectedPagesMap)
							.sort((a, b) => a - b)
							.join("-");
						newHistory.selected = selected;
						newHistory.isSelectPageFromInput = false;
						this.pushHistory(newHistory);
					}
				} else {
					const newHistory = {};
					newHistory.highlighted = pageNumber;
					this.pushHistory(newHistory);
				}
			};

			/** Clear selected pages/empty basket */
			clearSelection = () => {
				this.setState({ isInputValid: true });
				this.pushHistory({ selected: "", course: this.state.course });
			};

			/** Set preview pages columns */
			setNumColumns = (column) => {
				this.pushHistory({ numColumns: column });
			};

			/** prune page numbers below 1 and above 5000 */
			pruneOutOfRangeNumbers = (selected) => {
				const ary = [];
				let pagesArray = selected.split("-");
				for (var i = 0; i < pagesArray.length; i++) {
					if (Number(pagesArray[i]) < 1 || Number(pagesArray[i]) > 5000) {
						continue;
					}
					ary.push(pagesArray[i]);
				}
				return ary;
			};

			fetchCopies = (isbn) => {
				if (this.props.withAuthConsumer_myUserDetails) {
					const isbn13 = extractIsbn(isbn);
					this.props
						.api("/public/extract-search", {
							work_isbn13: isbn13,
							order_by: [this.state.sortField, this.state.sortDir],
							limit: this.state.limit,
							offset: this.state.offset,
						})
						.then((result) => {
							const extracts = mappingExtractStatus(result.extracts);
							this.setState({ copiesData: extracts, unfilteredCountForCopies: result.unfiltered_count });
						});
				}
			};

			handleEvents = (e, toggleName) => {
				switch (toggleName) {
					case ACTION.BookTableContent:
						e.preventDefault();
						this.setState({ isBookTableContent: !this.state.isBookTableContent });
						break;
					case ACTION.TableOfContent:
						e.preventDefault();
						this.setState({ isTableOfContent: !this.state.isTableOfContent });
						break;
				}
			};

			getSelectedClass = (coursesData) => {
				if (!Array.isArray(coursesData)) {
					return "";
				}
				if (!coursesData.length) {
					return "";
				}
				if (!this.state.course) {
					return "";
				}
				const item = coursesData[0];
				if (!item) {
					return "";
				}
				return { value: item.id, label: item.name, key: item.id };
			};

			/** sorting data based on fields*/
			doSorting = (sorting) => {
				const columnSorting = sorting[0];
				if (columnSorting) {
					const sortDirectionString = columnSorting.direction === "desc" ? "D" : "A";
					this.setState(
						{
							sortField: columnSorting.columnName,
							sortDir: sortDirectionString,
							offset: 0,
						},
						() => {
							this.fetchCopies(this.props.match.params.isbn);
						}
					);
				}
			};

			/**Pagination page select and row limit handle change event for fetch data */
			doPagination = (page, limit) => {
				const currentPage = page == 0 ? 0 : page - 1;
				const setOffset = currentPage * limit;
				this.setState(
					{
						offset: setOffset,
						limit: limit,
					},
					() => {
						this.fetchCopies(this.props.match.params.isbn);
					}
				);
			};

			setNotificationCount = (count) => {
				this.setState({
					notificationCount: count,
				});
			};

			handlePagesChange = (e) => {
				if (!this.state.selectedClass) {
					this.setState({ isShowTooltip: true }, this.doScrollOnSearchableDropdown());
				} else {
					e.preventDefault();
					const raw = e.target.value;
					const cleaned = raw.replace(/[^0-9,-mdclxvi]+/gi, "");
					const pageCount = parseInt(this.state.resultData.page_count, 10);
					const pageOffsetObject = getPageOffsetObject(this.state.resultData);
					const page_offset_roman = pageOffsetObject.roman;
					const page_offset_arabic = pageOffsetObject.arabic;

					e.target.value = cleaned.toLowerCase();
					let isValid = true;
					//set the userSelectedString value which user enter
					this.setState({ userSelectedString: cleaned, isSelectPageFromInput: true });
					//check if any invalid filed return with 0
					if (raw) {
						const data = rangeExpand(raw.toLowerCase(), page_offset_roman, page_offset_arabic, pageCount);
						data.map((item, index) => {
							if (item === 0) {
								isValid = false;
							}
							if (item >= pageCount + 1) {
								isValid = false;
							}
						});
					}
					if (isValid) {
						this.resetGoToPageText();
					}
					this.setState({ isInputValid: isValid }, () => {
						//it perform when the string is valid
						if (this.state.isInputValid) {
							const parts = Object.create(null);
							// create an array of numbers and number ranges (e.g. 2-6)
							const rawParts = cleaned.toLowerCase().split(",");

							for (const part of rawParts) {
								// if part is an empty string e.g. if invalid characters were removed
								if (!part) {
									continue;
								}
								if (part.match(/^mdclxvi[-]+$/i)) {
									continue;
								}

								// part only contains digits
								if (part.match(/^[0-9mdclxvi\[\]]+$/i)) {
									let partNum = getPageSequenceNumber(part, page_offset_roman, page_offset_arabic);
									// throw error if part is larger than 5000 or smaller than 1
									if (partNum > 5000 || partNum < 1) {
										this.setState({ errorMessage: true });
										return;
									}
									parts[partNum] = true;
								} else {
									const subParts = part.split("-");
									// 1-2-3
									if (subParts.length !== 2) {
										continue;
									}

									let first = getPageSequenceNumber(subParts[0], page_offset_roman, page_offset_arabic);
									let second = getPageSequenceNumber(subParts[1], page_offset_roman, page_offset_arabic);

									if (first >= second) {
										continue;
									}
									// limit selection to 2000 pages
									if (first + 2000 < second) {
										continue;
									}
									for (let i = first; i <= second; ++i) {
										if (i > 5000 || i < 1) {
											this.setState({ errorMessage: true });
											return;
										}
										parts[i] = true;
									}
								}
							}
							const selectedPages = Object.keys(parts)
								.map((num) => parseInt(num, 10))
								.sort((a, b) => (a > b ? 1 : b > a ? -1 : 0));
							this.pushHistory({ selected: selectedPages.join("-") });
						}
					});
				}
			};

			onBlur(e) {
				e.preventDefault();
				this.setState({ isSelectPageFromInput: false });
			}

			toggleWidth = (clickedElement) => {
				let updateStateKey;
				switch (clickedElement) {
					case "author":
						updateStateKey = "isAuthorFull";
						break;
					case "editor":
						updateStateKey = "isEditorFull";
						break;
					case "translator":
						updateStateKey = "isTranslatorFull";
						break;
					case "publisher":
						updateStateKey = "isPublisherFull";
						break;
					default:
						updateStateKey = "isTitleFull";
						break;
				}
				this.setState({
					[updateStateKey]: !this.state[updateStateKey],
				});
			};

			onOpen = (currentIndex) => {
				const defaultPhotoIndex = currentIndex ? currentIndex - 1 : 0;
				const photoIndexFullScreen = this.getIndexForViewFullScreen(defaultPhotoIndex);
				this.setState({
					isOpen: true,
					photoIndex: defaultPhotoIndex,
					photoIndexFullScreen: photoIndexFullScreen,
				});
			};

			onClose = (currentIndex) => {
				const photoIndex = currentIndex;
				this.setState({
					isOpen: false,
					photoIndex: this.state.photoIndex,
					photoIndexFullScreen: 0,
				});
				this.highlightPage(this.state.photoIndex);
			};

			getImageTitle = (currentIndex) => {
				const pageNumber = this.state.photoIndexFullScreen;
				const pageNumber_1 = this.getMoveIndexForFullScreen(pageNumber);
				const pageOffsetObject = getPageOffsetObject(this.state.resultData);
				const imageTitle = getPageOffset(pageNumber_1 + 1, pageOffsetObject.roman, pageOffsetObject.arabic);
				return imageTitle;
			};

			getImageURL = (pagenumber) => {
				return pagenumber;
			};

			//show the modal for unverfied or un approve user
			doShowModal = (value) => {
				this.setState({ showModal: value });
			};

			//hide the modal for unverfied or un approve user
			hideModal = () => {
				this.setState({ showModal: false });
			};

			doToggleFavorite = () => {
				const pdfIsbn13 = extractIsbn(this.props.match.params.isbn);
				const newFavorite = !this.state.resultData.is_favorite;
				this.props
					.api(`/public/asset-favorite`, {
						pdf_isbn13: pdfIsbn13,
						is_favorite: newFavorite,
					})
					.then((result) => {
						if (this._isMounted && result.success && this.state.resultData) {
							const newAsset = { ...this.state.resultData, is_favorite: newFavorite };
							this.setState({
								resultData: newAsset,
							});
						}
					});
			};

			getIndexForViewFullScreen = (currentIndex) => {
				const currentUrl = this.state.images[currentIndex];
				const actualIndex = this.state.imagesWithoutNull.findIndex((item) => item === currentUrl);
				return actualIndex;
			};

			getMoveIndexForFullScreen = (currentIndex) => {
				const currentUrl = this.state.imagesWithoutNull[currentIndex];
				const actualIndex = this.state.images.findIndex((item) => item === currentUrl);
				return actualIndex;
			};

			getActualIndex = (currentIndex) => {
				const currentUrl = this.state.imagesWithoutNull[currentIndex];
				const originalIndex = this.state.images.findIndex((item) => item === currentUrl);
				return originalIndex;
			};

			//Image move prev button event from lightbox
			onMovePrevRequest = (prevIndex) => {
				const actualIndex = this.getActualIndex(prevIndex);
				this.setState({
					photoIndex: actualIndex,
					photoIndexFullScreen: prevIndex,
				});
			};

			//Image move next button event from lightbox
			onMoveNextRequest = (nextIndex) => {
				const actualIndex = this.getActualIndex(nextIndex);
				this.setState({
					photoIndex: actualIndex,
					photoIndexFullScreen: nextIndex,
				});
			};

			handleDrpChange = (name, select_class, valid) => {
				this.setState({ isShowTooltip: false });
				const course = select_class ? select_class.value : null;
				this.setState({ isInputValid: true, selectedClass: select_class });
				if (course) {
					this.pushHistory({ course: course });
				} else {
					this.setState({ selectedClass: null });
				}
			};

			getCountSelectedExcludedPages = () => {
				let countSelectedExcludedPage = 0;
				Object.keys(this.state.selectedPagesMap).forEach((key) => {
					if (this.state.copyExcludedPagesMap[key]) {
						countSelectedExcludedPage++;
					}
				});
				return countSelectedExcludedPage;
			};

			getExtractNextRedirectUrl = (isbn13) => {
				const url =
					"/works/" + isbn13 + "/extract/form?course=" + this.state.course + "&selected=" + Object.keys(this.state.extractedPages).join("-");
				if (this.state.rolloverReviewOid) {
					return url + "&rollover_review_oid=" + this.state.rolloverReviewOid;
				}
				if (this.state.cloneFromExtractOid) {
					return url + "&clone_from_copy_oid=" + this.state.cloneFromExtractOid;
				}

				if (this.state.extractOid) {
					return url + "&extract_oid=" + this.state.extractOid;
				}

				return url;
			};

			render() {
				const highlighted = parseInt(this.state.highlighted, 10);
				const selectedPagesMap = this.state.selectedPagesMap;
				//const paginationPage = this.state.paginationPage;
				const isbn = this.props.match.params.isbn;
				const isbn13 = extractIsbn(isbn);
				const resultData = this.state.resultData;
				const urlEncodeAsset = resultData ? "/works/" + isbn13 + "-" + resultData.title.replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase() : "";
				const extractTitle = resultData ? PageTitle.extractMake + " - " + resultData.title : PageTitle.extractMake;
				const extractedPagesLength = Object.keys(this.state.extractedPages).length;
				const urlExtractConfirmPage = this.getExtractNextRedirectUrl(isbn13);
				const myUserDetails = this.props.withAuthConsumer_myUserDetails;
				// If no results match the supplied isbn
				if (!resultData || !this.state.sasToken) {
					return (
						<>
							<Header />
							{this.state.loading ? <Loader /> : <NoWorks>No works found with ISBN "{isbn13}".</NoWorks>}
						</>
					);
				}

				// Redirect back to the work details page if the work is not unlocked
				if (!resultData.is_unlocked && myUserDetails.role !== UserRole.claAdmin) {
					return <Redirect to={`/works/${isbn13}/`} />;
				}

				/**
				 * A comma separated string generated from the selected pages
				 * @constant
				 *
				 * @type {string}
				 */
				const selectedString = Object.keys(this.state.selectedPagesMap).join(", ") || "none";

				/**
				 * A consecutive string from selectedPagesMap
				 */
				const pageOffsetObject = getPageOffsetObject(resultData);
				const pageOffsetString = getPageOffsetString(Object.keys(this.state.selectedPagesMap), pageOffsetObject.roman, pageOffsetObject.arabic);

				const userData = this.props.withAuthConsumer_myUserDetails;
				const copiesData = this.state.copiesData;
				const flyoutIndexOnLast = resultData.file_format === FILE_FORMAT_EPUB ? FLYOUT_INDEX_ON_LAST_EPUB : FLYOUT_INDEX_ON_LAST_PDF;
				let copiesSection;
				let limitMessage;

				if (userData && userData.school) {
					copiesSection =
						resultData.is_unlocked && copiesData && copiesData.length > 0 ? (
							<Container>
								<WrapRow>
									<ColSmall>
										<CopiesHeading>Copies created at {userData.school}</CopiesHeading>
									</ColSmall>
								</WrapRow>
								{this.state.tableIsVisible && userData ? (
									<>
										<CopiesTable
											copiesData={copiesData}
											unfilteredCount={this.state.unfilteredCountForCopies}
											sortField={this.state.sortField}
											sortDir={this.state.sortDir}
											doSorting={this.doSorting}
											doPagination={this.doPagination}
											limit={this.state.limit}
											offset={this.state.offset}
											loading={this.state.loading}
											doShowModal={this.doShowModal}
										/>
									</>
								) : null}
							</Container>
						) : (
							""
						);
				} else {
					copiesSection = null;
				}

				let tableContent = resultData.is_unlocked ? copiesSection : "";
				const knowledgeBaseLink = (
					<KnowledgeBaseLink href="https://educationplatform.zendesk.com/hc/en-us/articles/360015659618" target="_blank">
						<KnowledgeBaseIcon className="fas fa-info-circle"></KnowledgeBaseIcon>
					</KnowledgeBaseLink>
				);

				if (!this.props.withAuthConsumer_myUserDetails.can_copy) {
					limitMessage = (
						<WrapUserAssetAccessMessage>
							<UserAssetAccessMessage />
						</WrapUserAssetAccessMessage>
					);
				} else if (this.state.selectedClass) {
					const selectedPagesLength = Object.keys(this.state.selectedPagesMap).length;
					const countSelectedExcludedPage = this.getCountSelectedExcludedPages();
					const copyableSelectedPageCount = selectedPagesLength - countSelectedExcludedPage;
					if (selectedPagesLength && !copyableSelectedPageCount) {
						limitMessage = (
							<span>The pages you have selected are all unavailable for copying from this issue – please select alternative pages.</span>
						);
					} else if (this.state.resultData.can_copy_in_full) {
						limitMessage = (
							<span>
								You have selected {copyableSelectedPageCount} page{copyableSelectedPageCount !== 1 ? "s" : ""}; the other pages are available for
								copy.&nbsp;
								{knowledgeBaseLink}
							</span>
						);
					} else if (this.state.pagesLeftForCourse > this.state.pagesLeftForSchool) {
						//When a school has reached the limit.
						const pageMaxCount = this.state.extractLimitForSchool;
						const leftAllowance = this.state.pagesLeftForSchool;
						if (leftAllowance === 0) {
							limitMessage = (
								<span>
									You have reached the copying allowance for this book&nbsp;(<strong>{pageMaxCount}</strong> {getPageWord(pageMaxCount)}).
								</span>
							);
						} else if (leftAllowance > 0) {
							limitMessage = (
								<span>
									There {getVerb(leftAllowance)} <strong>{leftAllowance}</strong>&nbsp;{getPageWord(leftAllowance)} left of the copying
									allowance&nbsp;(
									<strong>{pageMaxCount}</strong>&nbsp;pp) of this book
								</span>
							);
						} else {
							limitMessage = (
								<span>
									You have exceeded the copying allowance for this book. Please deselect <strong>{this.state.pagesLeftForSchool * -1}</strong>
									&nbsp;{getPageWord(this.state.pagesLeftForSchool * -1)} before continuing.
								</span>
							);
						}
					} else if (this.state.extractPageForCourseAttemptCount > this.state.extractLimitForCourse) {
						//When a class has reached the limit.
						limitMessage = (
							<span>
								You have exceeded the copying allowance for this class. Please deselect <strong>{this.state.pagesLeftForCourse * -1}</strong>&nbsp;
								{getPageWord(this.state.pagesLeftForCourse * -1)}&nbsp;before continuing.
							</span>
						);
					} else if (this.state.extractPageForSchoolAttemptCount > this.state.extractLimitForSchool) {
						const pageMaxCount = this.state.pagesLeftForSchool * -1;
						limitMessage = (
							<span>
								You have exceeded the copying allowance for this book. Please deselect <strong>{pageMaxCount}</strong>&nbsp;
								{getPageWord(pageMaxCount)} before continuing.
							</span>
						);
					} else if (this.state.pagesLeftForCourse <= this.state.pagesLeftForSchool) {
						const pageMaxCount = this.state.extractLimitForCourse;
						let leftAllowance = this.state.pagesLeftForCourse;
						if (pageMaxCount === 1) {
							if (leftAllowance === 1) {
								limitMessage = <span>There is only one page available in the copying allowance of this book for this class.</span>;
							} else {
								limitMessage = (
									<span>
										You have reached the copying allowance for this book&nbsp;(<strong>{pageMaxCount}</strong>&nbsp;{getPageWord(pageMaxCount)}).
									</span>
								);
							}
						} else {
							if (leftAllowance > 0) {
								limitMessage = (
									<span>
										There {getVerb(leftAllowance)} <strong>{leftAllowance}</strong>&nbsp;{getPageWord(leftAllowance)} left of the copying
										allowance&nbsp;(<strong>{pageMaxCount}</strong>&nbsp;pp) of this book for this class&nbsp;
										{knowledgeBaseLink}
									</span>
								);
							} else {
								limitMessage = (
									<span>
										You have reached the copying allowance for this book&nbsp;(<strong>{pageMaxCount}</strong>&nbsp;{getPageWord(pageMaxCount)}).
									</span>
								);
							}
						}
					} else {
						const pageMaxCount = this.state.extractLimitForSchool;
						let leftAllowance = this.state.pagesLeftForSchool;

						limitMessage = (
							<span>
								There {getVerb(leftAllowance)} <strong>{leftAllowance}</strong>&nbsp;{getPageWord(leftAllowance)} left of the copying allowance&nbsp;(
								<strong>{pageMaxCount}</strong>&nbsp;pp) of this book.
							</span>
						);
					}
				} else {
					limitMessage = <span>Please select a class</span>;
				}
				return (
					<>
						<HeadTitle title={extractTitle} />
						<Header
							flyOutIndexNotification={this.state.flyOutIndexNotification}
							setNotificationCount={this.setNotificationCount}
							onClose={this._flyOutNotificationOnCloseBound}
							notificationRef={this.notificationRef}
							jumpToContentId={JUMP_TO_CONTENT_ID}
						/>

						<WizardExtract step={this.getCurrentStep()} unlocked={resultData.is_unlocked} />
						{this.state.rolloverReviewOid && (
							<Container>
								<ReviewWrap>
									<PromptIcon className="fa fa-exclamation" />
									Last year's class and pages have been selected automatically. Please take care to check that these are still correct. If they
									aren't, update them here before saving your copy. <br /> Remember that the link for sharing this copy with your students will stay
									the same as last year unless you change the page range used.
								</ReviewWrap>
							</Container>
						)}
						{this.state.cloneFromExtractOid && (
							<Container>
								<ReviewWrap>
									<PromptIcon className="fa fa-exclamation" />
									The class and page range are selected automatically. Please take care to check that these apply also to this copy. If they don't,
									update them here before saving your new copy.
								</ReviewWrap>
							</Container>
						)}
						<BookCoverPage
							isBookTableContent={this.state.isBookTableContent}
							isbn={isbn}
							resultData={resultData}
							urlEncodeAsset={urlEncodeAsset}
							handleEvents={this.handleEvents}
							selectedClass={this.state.selectedClass}
							toggleWidth={this.toggleWidth}
							isTitleFull={this.state.isTitleFull}
							isAuthorFull={this.state.isAuthorFull}
							isPublisherFull={this.state.isPublisherFull}
							isEditorFull={this.state.isEditorFull}
							isTranslatorFull={this.state.isTranslatorFull}
							setGoToPageValue={this.setGoToPageValue}
							gotoPageValue={this.state.gotoPageValue}
							handleGotoPageSubmit={this.handleGotoPageSubmit}
							jumpToContentId={JUMP_TO_CONTENT_ID}
							onToggleFavorite={this.doToggleFavorite}
							handleDrpChange={this.handleDrpChange}
							isShowTooltip={this.state.isShowTooltip}
							api={this.props.api}
							canCopy={this.props.withAuthConsumer_myUserDetails && this.props.withAuthConsumer_myUserDetails.can_copy}
							flyOutIndex={this.state.flyOutIndex}
							onFlyoutClose={this._flyOutHandlerOnCloseBound}
							extractOid={this.state.extractOid || null}
						/>

						<BookContentPage
							sasToken={this.state.sasToken}
							isTableOfContent={this.state.isTableOfContent}
							highlighted={highlighted}
							selectedPagesMap={selectedPagesMap}
							isbn={isbn13}
							workData={this.state.resultData}
							highlightPage={this.highlightPage}
							addSelectedPage={this.addSelectedPage}
							itemsCountPerPage={this.state.itemsCountPerPage}
							loading={this.state.loading}
							handleEvents={this.handleEvents}
							numColumns={this.state.numColumns}
							setNumColumns={this.setNumColumns}
							sliderItems={this.state.sliderItems}
							goToPageNumber={this.goToPageNumber}
							flyOutIndex={this.state.flyOutIndex}
							onFlyoutClose={this._flyOutHandlerOnCloseBound}
							upHandler={this.upHandler}
							downHandler={this.downHandler}
							onOpen={this.onOpen}
							images={this.state.images}
							copyExcludedPagesMap={this.state.copyExcludedPagesMap}
						/>

						<BookBottom>
							<Container>
								<WrapRow>
									<WrapHelpText>
										<HelpText ref={this.state.flyOutIndex === FLYOUT_INDEX_ON_HELPTEXT ? this.limitMessageRef : ""}>{limitMessage}</HelpText>
									</WrapHelpText>
									<CustomInputWrap>
										<CustomInput>
											<WrapFormInput
												style={this.state.isInputValid ? {} : BorderStyled}
												type="text"
												name="pages"
												id={"pages" + this.state.userSelectedString || 0}
												value={this.state.userSelectedString}
												onChange={this.handlePagesChange}
												onBlur={this.onBlur}
												placeholder="Type to edit"
												disabled={!this.props.withAuthConsumer_myUserDetails || !this.props.withAuthConsumer_myUserDetails.can_copy}
											/>
										</CustomInput>
									</CustomInputWrap>
									<ButtonWrap>
										{(selectedString === "none") | (this.state.course === "") ? (
											""
										) : (
											<ResetButton
												type="button"
												className="more-link page-link"
												onClick={this.clearSelection}
												title="Reset selected pages"
												name="btnReset"
												data-ga-create-copy="reset"
											>
												<span>Reset</span>
											</ResetButton>
										)}
										<CancelButtonLink
											data-ga-create-copy="cancel"
											className="more-link page-link"
											textalign={"right"}
											title="Cancel"
											to={"/works/" + isbn13}
										>
											<span>Cancel</span>
										</CancelButtonLink>
										{this.state.flyOutIndex === FLYOUT_INDEX_ON_NEXT ? (
											<Button
												onClick={() => {
													this._flyOutHandlerOnCloseBound(null, urlExtractConfirmPage);
												}}
												disabled={
													pageOffsetString === "" ||
													this.state.extractPageForCourseAttemptCount > this.state.extractLimitForCourse ||
													this.state.extractPageForSchoolAttemptCount > this.state.extractLimitForSchool ||
													!this.state.isInputValid ||
													this.state.isShowTooltip ||
													this.state.selectedClass === null ||
													!extractedPagesLength
												}
												ref={this.nextButtonRef}
											>
												Next <NextIconButton className="fal fa-chevron-right"></NextIconButton>
											</Button>
										) : (
											<ButtonLink
												to={urlExtractConfirmPage}
												disabled={
													pageOffsetString === "" ||
													this.state.extractPageForCourseAttemptCount > this.state.extractLimitForCourse ||
													this.state.extractPageForSchoolAttemptCount > this.state.extractLimitForSchool ||
													!this.state.isInputValid ||
													this.state.isShowTooltip ||
													this.state.selectedClass === null ||
													!extractedPagesLength
												}
											>
												Next <NextIconButton className="fal fa-chevron-right"></NextIconButton>
											</ButtonLink>
										)}
									</ButtonWrap>
								</WrapRow>
							</Container>
						</BookBottom>
						{tableContent}
						{this.state.flyOutIndex === FLYOUT_INDEX_ON_EPUB && resultData.file_format === FILE_FORMAT_EPUB && (
							<FlyoutModal
								handleShowMe={this._flyOutHandlerOnCloseBound}
								width={theme.flyOutWidth}
								height={130}
								title={flyOutGuide.ePubPopupTitle}
								subTitle={flyOutGuide.ePubPopupSubTitle}
							/>
						)}
						{this.state.flyOutIndex === FLYOUT_INDEX_DEFAULT && (
							<FlyoutModal
								handleShowMe={this._flyOutHandlerOnCloseBound}
								title={flyOutGuide.popupTitle}
								width={theme.flyOutWidth}
								height={130}
								subTitle={flyOutGuide.popupSubTitle}
							/>
						)}
						{this.state.flyOutIndex === FLYOUT_INDEX_ON_HELPTEXT && (
							<Flyout
								key={FLYOUT_INDEX_ON_HELPTEXT}
								width={300}
								height={140}
								side_preference={"top"}
								onClose={this._flyOutHandlerOnCloseBound}
								target={this.limitMessageRef}
							>
								{flyOutGuide.flyout[FLYOUT_INDEX_ON_HELPTEXT]}
							</Flyout>
						)}
						{this.state.flyOutIndex === FLYOUT_INDEX_ON_NEXT && (
							<Flyout
								key={FLYOUT_INDEX_ON_NEXT}
								width={400}
								height={220}
								side_preference={"left"}
								onClose={this._flyOutHandlerOnCloseBound}
								target={this.nextButtonRef}
							>
								{flyOutGuide.flyout[FLYOUT_INDEX_ON_NEXT]}
							</Flyout>
						)}
						{this.state.flyOutIndex === flyoutIndexOnLast &&
						this.state.flyOutIndexNotification === FLYOUT_DEFAULT_NOTIFICATION &&
						this.state.notificationCount > NOTIFICATION_COUNT_DEFAULT ? (
							<Flyout
								width={350}
								height={110}
								onClose={this._flyOutNotificationOnCloseBound}
								target={this.notificationRef}
								side_preference={"bottom"}
							>
								{flyOutGuide.flyOutNotification}
							</Flyout>
						) : null}
						{this.state.isOpen && (
							<ImageLightBoxWithNote
								key={"key_image_light_box_with_note"}
								photoIndex={this.state.photoIndexFullScreen}
								images={this.state.imagesWithoutNull}
								onClose={this.onClose}
								imageCaption={null}
								onMovePrevRequest={this.onMovePrevRequest}
								onMoveNextRequest={this.onMoveNextRequest}
								imageTitle={this.getImageTitle}
							/>
						)}
						{this.state.showModal && <CopyCreationAccessDeniedPopup handleClose={this.hideModal} />}
					</>
				);
			}
		}
	)
);
