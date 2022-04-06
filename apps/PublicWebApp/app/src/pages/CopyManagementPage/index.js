import React from "react";
import withAuthRequiredConsumer from "../../common/withAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import Presentation from "./Presentation";
import queryString from "query-string";
import cloneDeep from "clone-deep";
import getHighQualityCopyrightFooterTextFromExtract from "../../common/getHighQualityCopyrightFooterTextFromExtract";
import GenerateCopyRightImage from "../../widgets/GenerateCopyRightImage";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import flyOutGuide from "./flyOutGuide";
import FlyOutHandler from "../../common/FlyOutHandler";
import ImageLightBoxWithNote from "../../widgets/ImageLightBoxWithNote";
import { Redirect } from "react-router-dom";
import withPageSize from "../../common/withPageSize";
import googleEvent from "../../common/googleEvent";
import getUrl from "../../common/getUrl";
import staticValues from "../../common/staticValues";
import FullScreenReader from "../../widgets/PdfReader/FullScreenReader";

const SCREEN = flyOutGuide.screen;
const FLYOUT_INDEX_SHARE_LINK = 0; // display flyout option 1 as per flyoutguide.flyout array
const SELECTED_HIGHLIGHT_DELETE_FLAG = "Delete";
const ACTION = {
	BookCopyContent: "BookCopyContent",
	TableOfContent: "TableOfContent",
};
const EXTRACT_STATUS_CANCELLED = staticValues.extractStatus.cancelled;

let oidCounter = 0;

export default withPageSize(
	withAuthRequiredConsumer(
		withApiConsumer(
			class CopyManangementPage extends React.PureComponent {
				state = {
					highlighted: null,
					resultData: null,
					highlighted: "",
					copiesData: null,
					coursesData: null,
					course: "",
					extractPages: [],
					shareOid: "",
					sidebar: true,
					shareLinks: [],
					loading: true,
					isShowBookInfo: false,
					isCopyTitleEditable: false,
					isLinkShare: false,
					isTitleFull: false,
					isAuthorFull: false,
					isPublisherFull: false,
					isEditorFull: false,
					isTranslatorFull: false,
					deactivateLinkId: null,
					latestCreatedShareLinks: Object.create(null),
					isOpen: false,
					photoIndex: 0,
					notificationCount: 0,
					is_watermarked: false,
					selectedNote: null,
					selectedHighlight: null,
					pageNumberToNoteMap: Object.create(null),
					pageNumberToHighlightMap: Object.create(null),
					pageNumberToHighlightPageJoinMap: Object.create(null),
					selectedNoteOid: null,
					excludedPages: [],
					extractPagesWithoutNull: [],
					photoIndexFullScreen: 0,
					action: null,
					userUploadedAssetUrl: null,
					isOpenUserUploadedAsset: false,
				};
				_lastUpdatedPageNumberToNoteMap = Object.create(null);
				_nextExecuteNoteUpdate = 0;
				_isUpdatingNotes = false;

				constructor(props) {
					super(props);
					this._flyOutHandler = new FlyOutHandler(this, this.props.api, SCREEN);
					this._flyOutHandlerOnCloseBound = this._flyOutHandler.onClose.bind(this._flyOutHandler);
					this._flyOutHandlerNotification = new FlyOutHandler(this, this.props.api, "notification");
					this._flyOutNotificationOnCloseBound = this._flyOutHandlerNotification.onCloseNotification.bind(this._flyOutHandlerNotification);
					this._getCopiesData = this.getCopiesData.bind(this);
				}

				componentDidMount() {
					this._isMounted = true;
					this.updateState();
					this.getExtractPages();
					this.getCopiesData();
					this.getShareLinks();
					this.getExtractAllNotes();
					this.getExtractAllHighlight();
					this.getExtractAllPageJoinAll();
					/* -- Check if User has selected for Flyout --- */
					const userDetail = this.props.withAuthConsumer_myUserDetails;
					if (userDetail && userDetail.flyout_enabled) {
						this._flyOutHandler.getSeen();
						this._flyOutHandlerNotification.getSeenNotification();
					}
					document.body.addEventListener("keydown", this.handleKeyDown, false);
				}

				setNotificationCount = (count) => {
					this.setState({
						notificationCount: count,
					});
				};

				/** API Methods */
				getExtractPages = () => {
					const copyOid = this.props.match.params.copyOid;
					const shareOid = this.state.shareOid;

					this.props
						.api("/public/extract-view-one", {
							extract_oid: copyOid,
							extract_share_oid: shareOid,
						})
						.then((result) => {
							let excludedPages = [];
							const extractPages = result.urls;
							const extractPagesWithoutNull = [];
							extractPages.map((url, index) => {
								if (!url) {
									excludedPages.push(index);
								} else {
									extractPagesWithoutNull.push(url);
								}
							});
							this.setState({
								extractPages: extractPages,
								is_watermarked: result.is_watermarked,
								error: null,
								result: result,
								loading: false,
								excludedPages: excludedPages,
								extractPagesWithoutNull: extractPagesWithoutNull,
							});
						})
						.catch((result) => {
							let errorMsg = result;
							if (errorMsg.indexOf("Extract Share") !== -1 && !shareOid) {
								errorMsg = "Could not view extract. Are you sure you followed the link correctly?";
							}
							this.setState({
								extractPages: [],
								error: errorMsg,
								loading: false,
							});
						});
				};

				getCopiesData = () => {
					this.props
						.api("/public/extract-search", {
							mine_only: false,
							extract_oid: this.props.match.params.copyOid,
						})
						.then((result) => {
							this.setState({ copiesData: result.extracts, userUploadedAssetUrl: result.extracts[0]["asset_url"] });
						});
				};

				getShareLinks = () => {
					const copyOid = this.props.match.params.copyOid;

					this.props
						.api("/public/extract-get-share-links", {
							extract_oid: copyOid,
						})
						.then((result) => {
							let latestCreatedShareLinks = Object.assign({}, this.state.latestCreatedShareLinks);
							const shreLinksData = result.result;
							if (shreLinksData && shreLinksData.length > 0 && this.state.isLinkShare) {
								latestCreatedShareLinks[shreLinksData[0].oid] = true;
							}
							this.setState({
								shareLinks: shreLinksData,
								latestCreatedShareLinks: latestCreatedShareLinks,
							});
						});
				};

				getShareLink = (e) => {
					e.preventDefault();
					const copyOid = this.props.match.params.copyOid;
					this.props
						.api("/public/extract-share-add", {
							extract_oid: copyOid,
							title: "unnamed share link",
						})
						.then((result) => {
							//Set state isLinkShare flag as true and after 5 seconds flag value set as false
							this.setState({
								isLinkShare: true,
							});
							this.getShareLinks();
						});
					//move to next flyout
					if (this.state.flyOutIndex === FLYOUT_INDEX_SHARE_LINK) {
						this._flyOutHandler.onClose();
					}
				};

				setStateForLinkShare = () => {
					this.setState({ isLinkShare: false });
				};

				setStateForDeactivateLink = (oId) => {
					this.setState({ deactivateLinkId: oId });
				};

				deactivateShare = (shareOid) => {
					this.props.api("/public/extract-share-deactivate", { share_oid: shareOid }).then((result) => {
						this.setState({ deactivateLinkId: null }, this.getShareLinks());
					});
				};

				componentDidUpdate(prevProps, prevState) {
					const isbn = this.props.match.params.isbn;
					if (this.props.location.search !== prevProps.location.search) {
						this.updateState();
					}
					if (this.props.match.params.copyOid !== prevProps.match.params.copyOid) {
						this.getExtractPages();
						this.getExtractAllNotes();
						this.getExtractAllHighlight();
						this.getExtractAllPageJoinAll();
					}
				}

				componentWillUnmount() {
					delete this._isMounted;
					document.body.removeEventListener("keydown", this.handleKeyDown, false);
					this._flyOutHandler.destroy();
					this._flyOutHandlerNotification.destroy();
					delete this._flyOutHandler;
					delete this._flyOutHandlerNotification;
					delete this._lastUpdatedPageNumberToNoteMap;
					clearTimeout(this._noteUpdateTimeout);
					delete this._noteUpdateTimeout;
				}

				/** Update component state to match query string */
				updateState = () => {
					const parsed = queryString.parse(this.props.location.search);
					this.setState({
						highlighted: parsed.highlighted || 1,
						shareOid: parsed.shareOid,
						action: parsed.action || null,
					});
				};

				/**
				 * Generate a query string from the component state
				 * @param {object} extra Parameter(s) to be updated
				 * @returns {string} The generated query string
				 * * Commented due to unused
				 */
				// getQueryString(extra) {
				//  const obj = {
				//      highlighted: this.state.highlighted,
				//      shareOid: this.state.shareOid,
				//  };
				//  Object.assign(obj, extra || {});
				//  return queryString.stringify(obj);
				// }

				/**
				 * Update the query string
				 * @param {object} extra Query string params to be added/updated
				 * Commented due to unused
				 */
				// pushHistory(extra) {
				//  const copyOid = this.props.match.params.copyOid;
				//  this.props.history.push(`/profile/management/${copyOid}/?` + this.getQueryString(extra));
				// }

				/**
				 * Show or hide the sidebar
				 */
				toggleSidebar = () => {
					this.setState({ sidebar: !this.state.sidebar });
				};

				/** Generate a list of page image tags for printing */
				getPagesForPrint = () => {
					if (this.state.extractPages && this.state.extractPages.length) {
						const pages = [];
						let pageFooterText = "";
						let copyRightTextImage = "";
						let footerImage = "";

						if (!this.state.is_watermarked) {
							pageFooterText = this.getPageFooterText();
							copyRightTextImage = GenerateCopyRightImage(pageFooterText);
							footerImage = <img src={copyRightTextImage} className="bottom-right-image" />;
						}
						this.state.extractPages.map((page, index) => {
							if (page) {
								pages.push(
									<div key={"printPage" + index} className="belowPages">
										<div className="inlineBlock">
											<img src={page} className="topImage" />
											{footerImage}
										</div>
									</div>
								);
							}
						});
						return pages;
					} else {
						return "";
					}
				};

				/** Generate a page Footer Text for display text at bottom-right cornder on Image */
				getPageFooterText = () => {
					if (this.state.copiesData && this.state.copiesData.length) {
						const data = this.state.copiesData.find((item) => item.oid === this.props.match.params.copyOid);
						if (data) {
							return getHighQualityCopyrightFooterTextFromExtract(data);
						}
					}
					return "";
				};

				/**
				 * Show or hide the New Copy created message
				 */
				hideNewCopyMessage = () => {
					this.setState({ action: null });
				};

				/** Show/hide book authos/publisher information */
				handleEvents = (e, toggleName) => {
					e.preventDefault();
					switch (toggleName) {
						case ACTION.BookCopyContent:
							e.preventDefault();
							this.setState({ isShowBookInfo: !this.state.isShowBookInfo });
							break;
					}
				};

				/**Update copy Title name */
				submitCopyTitleEditable = (e, title) => {
					e.preventDefault();
					const copyOid = this.props.match.params.copyOid;
					this.props
						.api("/public/extract-title-update", {
							title: title,
							extract_oid: copyOid,
						})
						.then((result) => {
							if (result.result) {
								this.setState({ isCopyTitleEditable: false }, this.getCopiesData());
							}
						});
				};

				/**Hide or show Copy title input text box */
				isDisplayCopyTitleEditable = (e) => {
					e.preventDefault();
					this.setState({ isCopyTitleEditable: !this.state.isCopyTitleEditable });
				};

				/** Disabled ctrl + p eventes */
				handleKeyDown = (e) => {
					if (
						(e.ctrlKey || e.metaKey) &&
						(e.key == "p" || e.key == "Control" || e.charCode == 16 || e.charCode == 112 || e.keyCode == 80 || e.keyCode == 17)
					) {
						//alert("Please use the Print PDF button below for a better rendering on the document");
						e.cancelBubble = true;
						e.preventDefault();
						e.stopImmediatePropagation();
					} else if (e.key === "Delete" && this.state.selectedNoteOid && e.target.id != `${"content_" + this.state.selectedNoteOid}`) {
						const oid = this.state.selectedNoteOid;
						this.handleNoteClose(e, oid);
						e.cancelBubble = true;
						e.preventDefault();
						e.stopImmediatePropagation();
					}
				};

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

				getIndexForViewFullScreen = (currentIndex) => {
					const currentUrl = this.state.extractPages[currentIndex];
					const actualIndex = this.state.extractPagesWithoutNull.findIndex((item) => item === currentUrl);
					return actualIndex;
				};

				getActualIndex = (currentIndex) => {
					const currentUrl = this.state.extractPagesWithoutNull[currentIndex];
					const originalIndex = this.state.extractPages.findIndex((item) => item === currentUrl);
					return originalIndex;
				};

				//Open image lightbox full screen view
				onOpen = (photoIndex) => {
					if (this.state.userUploadedAssetUrl) {
						this.setState({
							photoIndex: photoIndex || 1,
							isOpenUserUploadedAsset: true,
							isOpen: false,
						});
					} else {
						const photoIndexFullScreen = this.getIndexForViewFullScreen(photoIndex);
						this.setState({
							isOpen: true,
							isOpenUserUploadedAsset: false,
							photoIndex: photoIndex || 0,
							selectedNoteOid: null,
							photoIndexFullScreen: photoIndexFullScreen,
						});
					}
				};

				//Close image lightbox full screen view
				onClose = () => {
					this.setState({
						isOpen: false,
						photoIndex: 0,
						selectedNoteOid: null,
						isOpenUserUploadedAsset: false,
					});
				};

				//Image move prev button event from lightbox
				onMovePrevRequest = (prevIndex) => {
					const actualIndex = this.getActualIndex(prevIndex);
					this.setState({
						photoIndex: this.state.userUploadedAssetUrl ? prevIndex : actualIndex,
						photoIndexFullScreen: prevIndex,
					});
				};

				//Image move next button event from lightbox
				onMoveNextRequest = (nextIndex) => {
					const actualIndex = this.getActualIndex(nextIndex);
					this.setState({
						photoIndex: this.state.userUploadedAssetUrl ? nextIndex : actualIndex,
						photoIndexFullScreen: nextIndex,
					});
				};

				resetAccessCode = (shareOid) => {
					this.props.api("/public/extract-share-reset-accesscode", { share_oid: shareOid }).then((result) => {
						this.getShareLinks();
					});
				};

				//Add note dropdown change event
				onNoteSelect = (option) => {
					this.setState({
						selectedNote: option,
						selectedHighlight: null,
					});
				};

				//Add highlight dropdown change event
				onHighlightSelect = (option) => {
					this.setState({
						selectedHighlight: option,
						selectedNote: null,
					});
				};

				//Get all extract noted by extract oid (copy oid) on pages
				getExtractAllNotes = () => {
					this.props
						.api("/public/extract-note-get-all", {
							extract_oid: this.props.match.params.copyOid,
						})
						.then((result) => {
							const pageNumberToNoteMap = Object.create(null);
							const extractNotes = result.result; //array of extract notes  pageNumberToNoteMapOBJ==> extractNotes
							for (const note of extractNotes) {
								if (!pageNumberToNoteMap[note.page]) {
									pageNumberToNoteMap[note.page] = [];
								}
								pageNumberToNoteMap[note.page].push(note);
							}
							this.setState(
								{
									pageNumberToNoteMap: pageNumberToNoteMap,
								},
								() => {
									if (this._isMounted) {
										this._lastUpdatedPageNumberToNoteMap = cloneDeep(this.state.pageNumberToNoteMap);
									}
								}
							);
						});
				};

				//create note
				handleNoteClick = (width, height, left, top) => {
					if (this.shouldUpdateNote()) {
						const newData = { ...this.state.pageNumberToNoteMap };
						const page = this.getPageFromPageindex();
						const totalPageNotes = newData[page] ? newData[page].length : 0;
						++oidCounter;
						const newNote = {
							oid: "PLACEHOLDER_OID_" + oidCounter,
							extract_oid: this.props.match.params.copyOid,
							content: "",
							colour: this.state.selectedNote.value,
							position_x: parseFloat(left),
							position_y: parseFloat(top),
							width: parseFloat(width),
							height: parseFloat(height),
							zindex: totalPageNotes + 1,
							date_created: new Date().toISOString(),
							page: page,
						};
						const recentlyCreatedNoteId = newNote.oid;
						if (totalPageNotes) {
							const pageNotesData = [...newData[page]];
							pageNotesData.push(newNote);
							newData[page] = pageNotesData;
						} else {
							newData[page] = [newNote];
						}
						this.setState(
							{
								pageNumberToNoteMap: newData,
								selectedNoteOid: recentlyCreatedNoteId,
							},
							this._doNoteUpdatesDebounced
						);
					}
				};

				handleNoteContentChange = (oid, content) => {
					if (this.shouldUpdateNote()) {
						const newData = { ...this.state.pageNumberToNoteMap };
						const page = this.getPageFromPageindex();
						if (newData[page]) {
							const pageNotesData = newData[page];
							const newArray = [...pageNotesData];
							const elementsIndex = newArray.findIndex((r) => r.oid === oid);
							//auto select the note for th content chngaes when content is editing
							if (oid != this.state.selectedNoteOid) {
								const currentNote = newArray[elementsIndex];
								for (const index in newArray) {
									newArray[index] = {
										...newArray[index],
										zindex: newArray[index].zindex > currentNote.zindex ? newArray[index].zindex - 1 : newArray[index].zindex,
									};
								}
							}
							newArray[elementsIndex] = {
								...newArray[elementsIndex],
								content: content,
								zindex: newArray.length,
							};
							newData[page] = newArray;
						}
						this.setState(
							{
								pageNumberToNoteMap: newData,
								selectedNoteOid: oid,
							},
							this._doNoteUpdatesDebounced
						);
					}
				};

				handleNoteClose = (e, oid) => {
					e.cancelBubble = true;
					e.preventDefault();
					e.stopPropagation();
					if (this.shouldUpdateNote() && oid) {
						let newData = { ...this.state.pageNumberToNoteMap };
						const page = this.getPageFromPageindex();
						if (newData[page]) {
							const pageNotesData = newData[page];
							let newArray = [...pageNotesData];
							const elementsIndex = newArray.findIndex((r) => r.oid === oid);
							const currentNote = newArray[elementsIndex];
							const currentNoteZindex = currentNote.zindex;
							newArray.splice(elementsIndex, 1);
							//Need to be update the zindex which note have greator than the current index
							for (const index in newArray) {
								const pagenoteDetail = newArray[index];
								if (pagenoteDetail.zindex > currentNoteZindex) {
									newArray[index] = {
										...newArray[index],
										zindex: newArray[index].zindex - 1,
									};
								}
							}
							newData[page] = newArray;
						}
						this.setState(
							{
								pageNumberToNoteMap: newData,
								selectedNoteOid: null,
							},
							this._doNoteUpdatesDebounced
						);
					}
				};

				_doNoteUpdates = () => {
					if (!this._isMounted) {
						return;
					}
					const clonedPageNumberToNoteMap = cloneDeep(this.state.pageNumberToNoteMap);
					const changedNotes = [];
					const deletedNoteOids = [];
					const newNotes = [];
					for (const pageIndex in clonedPageNumberToNoteMap) {
						const oldNotesForPage = this._lastUpdatedPageNumberToNoteMap[pageIndex];
						const currNotesForPage = clonedPageNumberToNoteMap[pageIndex];
						if (oldNotesForPage && oldNotesForPage.length) {
							// We have some old notes for this page...
							if (!currNotesForPage || !currNotesForPage.length) {
								// But no current notes for the page!
								// That means all the notes for this page have been deleted!
								for (const note of oldNotesForPage) {
									deletedNoteOids.push(note.oid);
								}
							} else {
								// We have some old notes and some current notes.
								// Let's figure out the ones that have actually changed.
								const oldNotesForPageOidMap = Object.create(null);
								for (const note of oldNotesForPage) {
									oldNotesForPageOidMap[note.oid] = note;
								}
								const currNotesForPageOidMap = Object.create(null);
								for (const note of currNotesForPage) {
									currNotesForPageOidMap[note.oid] = note;
								}
								for (const note of oldNotesForPage) {
									if (!currNotesForPageOidMap[note.oid]) {
										// Note was there before, but is not there now.
										// I.e. note has been deleted.
										// Note has been deleted.
										deletedNoteOids.push(note.oid);
									}
								}
								for (const note of currNotesForPage) {
									const oldNote = oldNotesForPageOidMap[note.oid];
									if (!oldNote) {
										// We have a new note, but this note didn't exist previously. It's a new note!
										newNotes.push(note);
									} else {
										// This note existed before, and it exists now. Has it changed?
										const changedNote = {};
										let hasChanged = false;
										for (const field in note) {
											if (note[field] !== oldNote[field]) {
												hasChanged = true;
												changedNote[field] = note[field];
											}
										}
										if (hasChanged) {
											// Yes it has! Only update the changed fields.
											changedNote.oid = note.oid;
											changedNotes.push(changedNote);
										}
									}
								}
							}
						} else {
							// No old notes at all for this page, so all current notes for this page are new
							for (const note of currNotesForPage) {
								newNotes.push(note);
							}
						}
					}
					let numQueriesToGo = changedNotes.length + deletedNoteOids.length + newNotes.length;
					this._isUpdatingNotes = numQueriesToGo > 0;
					const onComplete = () => {
						if (!this._isMounted) {
							return;
						}
						numQueriesToGo--;
						if (numQueriesToGo !== 0) {
							return;
						}
						this._lastUpdatedPageNumberToNoteMap = clonedPageNumberToNoteMap;
						delete this._isUpdatingNotes;
					};

					this._lastUpdatedPageNumberToNoteMap = clonedPageNumberToNoteMap;

					for (const note of changedNotes) {
						this.props.api("/public/extract-note-update", note).finally(onComplete);
					}
					for (const oid of deletedNoteOids) {
						this.props.api("/public/extract-note-delete", { oid: oid }).finally(onComplete);
					}
					if (newNotes.length) {
						for (const note of newNotes) {
							const placeholderOid = note.oid;
							const params = { ...note };
							delete params.oid;
							this.props
								.api("/public/extract-note-create", params)
								.then((result) => {
									if (!this._isMounted) {
										return;
									}
									googleEvent("editCopy", "create a copy", "edit", "add a note");
									const newPageNumberToNoteMap = { ...this.state.pageNumberToNoteMap };
									const idx = newPageNumberToNoteMap[note.page].findIndex((nt) => nt.oid === placeholderOid);
									const newNote = { ...newPageNumberToNoteMap[note.page][idx] };
									newNote.oid = result.result[0].oid;
									newPageNumberToNoteMap[note.page][idx] = newNote;
									const newState = {
										pageNumberToNoteMap: newPageNumberToNoteMap,
									};
									if (this.state.selectedNoteOid === placeholderOid) {
										newState.selectedNoteOid = newNote.oid;
									}
									if (clonedPageNumberToNoteMap[note.page]) {
										const oldNote = clonedPageNumberToNoteMap[note.page].find((nt) => nt.oid === placeholderOid);
										if (oldNote) {
											oldNote.oid = newNote.oid;
										}
									}
									this.setState(newState, onComplete);
								})
								.catch(onComplete);
						}
					}
				};
				_doNoteUpdatesDebounced = () => {
					if (!this._isMounted) {
						return;
					}
					if (this._nextExecuteNoteUpdate <= Date.now() && !this._isUpdatingNotes) {
						this._nextExecuteNoteUpdate = Date.now() + 2000;
						this._doNoteUpdates();
						return;
					}
					clearTimeout(this._noteUpdateTimeout);
					if (this._nextExecuteNoteUpdate > Date.now()) {
						this._noteUpdateTimeout = setTimeout(this._doNoteUpdatesDebounced, this._nextExecuteNoteUpdate - Date.now());
						return;
					}
					this._noteUpdateTimeout = setTimeout(this._doNoteUpdatesDebounced, 500);
				};

				handleNoteOnMoveOrResize = (oid, width, height, left, top) => {
					if (this.shouldUpdateNote()) {
						const newData = { ...this.state.pageNumberToNoteMap };
						const page = this.getPageFromPageindex();
						if (newData[this.getPageFromPageindex()]) {
							const newArray = [...newData[page]];
							const elementsIndex = newArray.findIndex((r) => r.oid === oid);
							newArray[elementsIndex] = {
								...newArray[elementsIndex],
								position_x: parseFloat(left),
								position_y: parseFloat(top),
								width: parseFloat(width),
								height: parseFloat(height),
							};
							newData[page] = newArray;
						}
						this.setState(
							{
								pageNumberToNoteMap: newData,
							},
							this._doNoteUpdatesDebounced
						);
					}
				};

				didCreateCopy = () => {
					if (this.state.copiesData) {
						const data = this.state.copiesData.find((item) => item.oid === this.props.match.params.copyOid);
						return data && data.did_create;
					}
					return false;
				};

				shouldUpdateNote = () => {
					if (!(this.state.selectedNote && this.state.selectedNote.value)) {
						return false;
					}
					return this.didCreateCopy();
				};

				//create highlight area
				onHighlightDraw = (left, top, width, height) => {
					if (this.didCreateCopy() && this.state.selectedHighlight && this.state.selectedHighlight.value !== SELECTED_HIGHLIGHT_DELETE_FLAG) {
						googleEvent("editCopy", "create a copy", "edit", "add a highlight");
						const page = this.getPageFromPageindex();
						this.props
							.api("/public/extract-highlight-create", {
								extract_oid: this.props.match.params.copyOid,
								width: parseFloat(width),
								height: parseFloat(height),
								position_x: parseFloat(left),
								position_y: parseFloat(top),
								colour: this.state.selectedHighlight.colour,
								page: page,
							})
							.then((result) => {
								let newData = { ...this.state.pageNumberToHighlightMap };
								let newDataPageNumberToHighlightPageJoinMap = { ...this.state.pageNumberToHighlightPageJoinMap };
								if (newData[page]) {
									const pageHighlightData = [...newData[page]];
									pageHighlightData.push(result.result[0]);
									newData[page] = pageHighlightData;

									//update the pageNumberToHighlightPageJoinMap if not exists and we are getting the result_extract_page_join.length
									const highlightPageJoinData = [...newDataPageNumberToHighlightPageJoinMap[page]];
									if (result.result_extract_page_join.length && !highlightPageJoinData.length) {
										newDataPageNumberToHighlightPageJoinMap[page] = [...result.result_extract_page_join];
									}
								} else {
									newData[page] = [...result.result];
									newDataPageNumberToHighlightPageJoinMap[page] = [...result.result_extract_page_join];
								}

								this.setState({
									pageNumberToHighlightMap: newData,
									pageNumberToHighlightPageJoinMap: newDataPageNumberToHighlightPageJoinMap,
								});
							});
					}
				};

				handleNoteSelection = (oid) => {
					const newData = { ...this.state.pageNumberToNoteMap };
					const page = this.getPageFromPageindex();
					if (newData[page]) {
						const newArray = [...newData[page]];
						const elementsIndex = newArray.findIndex((r) => r.oid === oid);
						const currentNote = newArray[elementsIndex];
						for (const index in newArray) {
							newArray[index] = {
								...newArray[index],
								zindex: newArray[index].zindex > currentNote.zindex ? newArray[index].zindex - 1 : newArray[index].zindex,
							};
						}
						newArray[elementsIndex] = {
							...newArray[elementsIndex],
							zindex: newArray.length,
						};
						newData[page] = newArray;
					}
					this.setState(
						{
							pageNumberToNoteMap: newData,
							selectedNoteOid: oid,
						},
						() => {
							if (this.shouldUpdateNote()) {
								this._doNoteUpdatesDebounced();
							}
						}
					);
				};

				//Get all extract highlight by extract oid (copy oid) on pages
				getExtractAllHighlight = () => {
					this.props
						.api("/public/extract-highlight-get-all", {
							extract_oid: this.props.match.params.copyOid,
						})
						.then((result) => {
							const pageNumberToHighlightMap = Object.create(null);
							const extractHighlights = result.result;
							for (const highlight of extractHighlights) {
								if (!pageNumberToHighlightMap[highlight.page]) {
									pageNumberToHighlightMap[highlight.page] = [];
								}
								pageNumberToHighlightMap[highlight.page].push(highlight);
							}
							this.setState({
								pageNumberToHighlightMap: pageNumberToHighlightMap,
							});
						});
				};

				//Get extract page join by extract oid (copy oid)
				getExtractAllPageJoinAll = (copy_page) => {
					this.props
						.api("/public/extract-page-join-get-all", {
							extract_oid: this.props.match.params.copyOid,
							page: copy_page,
						})
						.then((result) => {
							let pageNumberToHighlightPageJoinMap = Object.create(null);
							let highlightPageJoins = result.result;
							for (const highlightPageJoinInfo of highlightPageJoins) {
								if (!pageNumberToHighlightPageJoinMap[highlightPageJoinInfo.page]) {
									pageNumberToHighlightPageJoinMap[highlightPageJoinInfo.page] = [];
								}
								pageNumberToHighlightPageJoinMap[highlightPageJoinInfo.page].push(highlightPageJoinInfo);
							}
							this.setState({
								pageNumberToHighlightPageJoinMap: pageNumberToHighlightPageJoinMap,
							});
						});
				};

				handleHiglightDelete = (oid) => {
					if (this.didCreateCopy() && oid && this.state.selectedHighlight && this.state.selectedHighlight.value === SELECTED_HIGHLIGHT_DELETE_FLAG) {
						let newData = { ...this.state.pageNumberToHighlightMap };
						const page = this.getPageFromPageindex();
						let newDataPageNumberToHighlightPageJoinMap = { ...this.state.pageNumberToHighlightPageJoinMap };
						if (newData[page]) {
							const pageHighlights = [...newData[page]];
							const elementsIndex = pageHighlights.findIndex((r) => r.oid === oid);
							pageHighlights.splice(elementsIndex, 1);
							newData[page] = pageHighlights;

							//remove from the pageNumberToHighlightPageJoinMap for current page if there is not any highlights
							if (newDataPageNumberToHighlightPageJoinMap[page] && !pageHighlights.length) {
								const highlightsPageJoin = [...newDataPageNumberToHighlightPageJoinMap[page]];
								const elementHighlightPageIndex = highlightsPageJoin.findIndex((r) => r.page === page);
								highlightsPageJoin.splice(elementHighlightPageIndex, 1);
								newDataPageNumberToHighlightPageJoinMap[page] = highlightsPageJoin;
							}
						}

						this.setState(
							{
								pageNumberToHighlightMap: newData,
								pageNumberToHighlightPageJoinMap: newDataPageNumberToHighlightPageJoinMap,
							},
							() => {
								this.props
									.api("/public/extract-highlight-delete", {
										oid: oid,
									})
									.then((result) => {});
							}
						);
					}
				};

				doToggleFavorite = () => {
					const oid = this.props.match.params.copyOid;
					if (!Array.isArray(this.state.copiesData)) {
						return;
					}
					const idx = this.state.copiesData.findIndex((copy) => copy.oid === oid);
					if (idx < 0) {
						return;
					}
					const newFavorite = !this.state.copiesData[idx].is_favorite;
					this.props
						.api(`/public/extract-favorite`, {
							oid: oid,
							is_favorite: newFavorite,
						})
						.then((result) => {
							if (
								this._isMounted &&
								result.success &&
								Array.isArray(this.state.copiesData) &&
								this.state.copiesData[idx] &&
								this.state.copiesData[idx].oid === oid
							) {
								const copiesData = [...this.state.copiesData];
								copiesData[idx] = { ...copiesData[idx], is_favorite: newFavorite };
								this.setState({
									copiesData: copiesData,
								});
							}
						});
				};

				showViewModal = (e) => {
					let width;
					let height;
					const windowURL = getUrl("/extract/" + this.props.match.params.copyOid + "/share");
					if (e.target.className === "fas fa-mobile-alt") {
						width = Math.min(window.innerWidth - 20, 360);
						height = Math.min(window.innerHeight - 20, 740);
					} else {
						width = Math.min(window.innerWidth - 20, 768);
						height = Math.min(window.innerHeight - 20, 1024);
					}
					window.open(windowURL, "", `width=${width},height=${height},scrollbars = yes`);
				};

				getPageFromPageindex = () => {
					if (this.state.userUploadedAssetUrl) {
						return this.state.photoIndex;
					} else if (this.state.copiesData && this.state.copiesData.length > 0) {
						return this.state.copiesData[0].pages[this.state.photoIndex];
					}
					return null;
				};

				render() {
					const page = this.getPageFromPageindex();
					const copy_oid = this.props.match.params.copyOid;
					let data = {};
					let teacher = null;
					let did_create = false;
					if (this.state.copiesData) {
						data = this.state.copiesData.find((item) => item.oid === this.props.match.params.copyOid);
						teacher = data ? data.teacher : "";
						did_create = data ? data.did_create : "";
					}
					//redirect to home page when user can not able to create copy OR extract status is cancelled OR extract not found
					if (
						(this.props.withAuthConsumer_myUserDetails && !this.props.withAuthConsumer_myUserDetails.can_copy) ||
						(data && data.status === EXTRACT_STATUS_CANCELLED) ||
						!data
					) {
						return (
							<Redirect
								to={{
									to: "/",
									state: { redirected_from_extract_page: true },
								}}
							/>
						);
					}

					const isNoteDisplay = this.props.breakpoint < withPageSize.TABLET ? false : true;
					const annotationsData = Object.create(null);
					annotationsData["teacher"] = teacher;
					annotationsData["did_create"] = did_create;
					annotationsData["onHighlightDraw"] = this.onHighlightDraw;
					annotationsData["allHighlights"] = this.state.pageNumberToHighlightMap;
					annotationsData["selectedHighlight"] = this.state.selectedHighlight;
					annotationsData["handleHiglightDelete"] = this.handleHiglightDelete;
					annotationsData["allHighlightPageInfo"] = this.state.pageNumberToHighlightPageJoinMap;
					annotationsData["allNotes"] = this.state.pageNumberToNoteMap;
					annotationsData["page_index"] = this.state.photoIndexFullScreen;
					annotationsData["handleNoteClick"] = this.handleNoteClick;
					annotationsData["handleNoteContentChange"] = this.handleNoteContentChange;
					annotationsData["handleNoteOnMoveOrResize"] = this.handleNoteOnMoveOrResize;
					annotationsData["handleNoteClose"] = this.handleNoteClose;
					annotationsData["isNoteDisplay"] = isNoteDisplay;
					annotationsData["selectedNote"] = this.state.selectedNote;
					annotationsData["selectedNoteOid"] = this.state.selectedNoteOid;
					annotationsData["handleNoteSelection"] = this.handleNoteSelection;
					return (
						<>
							<HeadTitle title={PageTitle.copyManagement} />
							<Presentation
								copiesData={this.state.copiesData}
								extractPages={this.state.extractPages}
								copyOid={copy_oid}
								toggleSidebar={this.toggleSidebar}
								shareLinks={this.state.shareLinks}
								sidebar={this.state.sidebar}
								getPagesForPrint={this.getPagesForPrint}
								getShareLink={this.getShareLink}
								deactivateShare={this.deactivateShare}
								loading={this.state.loading}
								pageFooterText={this.getPageFooterText()}
								error={this.state.error}
								hideNewCopyMessage={this.hideNewCopyMessage}
								isShowBookInfo={this.state.isShowBookInfo}
								handleEvents={this.handleEvents}
								isCopyTitleEditable={this.state.isCopyTitleEditable}
								submitCopyTitleEditable={this.submitCopyTitleEditable}
								isDisplayCopyTitleEditable={this.isDisplayCopyTitleEditable}
								isLinkShare={this.state.isLinkShare}
								toggleWidth={this.toggleWidth}
								isTitleFull={this.state.isTitleFull}
								isAuthorFull={this.state.isAuthorFull}
								isPublisherFull={this.state.isPublisherFull}
								isEditorFull={this.state.isEditorFull}
								isTranslatorFull={this.state.isTranslatorFull}
								setStateForLinkShare={this.setStateForLinkShare}
								setStateForDeactivateLink={this.setStateForDeactivateLink}
								deactivateLinkId={this.state.deactivateLinkId}
								latestCreatedShareLinks={this.state.latestCreatedShareLinks}
								onCloseFlyOut={this._flyOutHandlerOnCloseBound}
								flyOutIndex={this.state.flyOutIndex}
								onOpen={this.onOpen}
								notificationCount={this.state.notificationCount}
								setNotificationCount={this.setNotificationCount}
								flyOutIndexNotification={this.state.flyOutIndexNotification}
								onCloseNotification={this._flyOutNotificationOnCloseBound}
								resetAccessCode={this.resetAccessCode}
								is_watermarked={this.state.is_watermarked}
								onNoteSelect={this.onNoteSelect}
								onHighlightSelect={this.onHighlightSelect}
								selectedNote={this.state.selectedNote}
								selectedHighlight={this.state.selectedHighlight}
								isNoteDisplay={isNoteDisplay}
								pageNumberToNoteMap={this.state.pageNumberToNoteMap} // to do pageNumberToNoteMap
								pageNumberToHighlightMap={this.state.pageNumberToHighlightMap} // to do pageNumberToHighlightMap
								teacher={teacher}
								pageNumberToHighlightPageJoinMap={this.state.pageNumberToHighlightPageJoinMap}
								onToggleFavorite={this.doToggleFavorite}
								showViewModal={this.showViewModal}
								getCopiesData={this._getCopiesData}
								action={this.state.action}
								isViewingFullScreen={this.state.isOpen || this.state.isOpenUserUploadedAsset}
								annotationsData={annotationsData}
							/>

							{this.state.isOpen && !data.expired && (
								<ImageLightBoxWithNote
									key={"key_image_light_box_with_note"}
									photoIndex={this.state.photoIndexFullScreen}
									images={this.state.extractPagesWithoutNull}
									onClose={this.onClose}
									imageCaption={this.getPageFooterText()}
									copyOid={copy_oid}
									onMovePrevRequest={this.onMovePrevRequest}
									onMoveNextRequest={this.onMoveNextRequest}
									notes={this.state.pageNumberToNoteMap[page]}
									highlights={this.state.pageNumberToHighlightMap[page]}
									handleNoteClick={this.handleNoteClick}
									handleNoteContentChange={this.handleNoteContentChange}
									handleNoteClose={this.handleNoteClose}
									handleNoteOnMoveOrResize={this.handleNoteOnMoveOrResize}
									teacher={teacher}
									did_create={did_create}
									isNoteDisplay={isNoteDisplay}
									onHighlightDraw={this.onHighlightDraw}
									selectedHighlight={this.state.selectedHighlight}
									highlightPageInfo={this.state.pageNumberToHighlightPageJoinMap[page]}
									selectedNote={this.state.selectedNote}
									selectedNoteOid={this.state.selectedNoteOid}
									handleNoteSelection={this.handleNoteSelection}
									handleHiglightDelete={this.handleHiglightDelete}
									enableZoom={!this.state.selectedHighlight}
								/>
							)}

							{this.state.isOpenUserUploadedAsset && (
								<FullScreenReader
									pdfUrl={this.state.userUploadedAssetUrl}
									numberOfPagesToDisplay={1}
									currentPage={this.state.photoIndex || 1}
									onClose={this.onClose}
									annotationsData={annotationsData}
									onMovePrevRequest={this.onMovePrevRequest}
									onMoveNextRequest={this.onMoveNextRequest}
								/>
							)}
						</>
					);
				}
			}
		)
	)
);
