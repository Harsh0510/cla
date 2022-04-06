import React from "react";
//import withAuthRequiredConsumer from '../../common/withAuthRequiredConsumer';
import withAuthConsumer from "../../common/withAuthConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import Presentation from "./Presentation";
import getHighQualityCopyrightFooterTextFromExtract from "../../common/getHighQualityCopyrightFooterTextFromExtract";
import getUrl from "../../common/getUrl";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import GenerateCopyRightImage from "../../widgets/GenerateCopyRightImage";
import ImageLightBoxWithNote from "../../widgets/ImageLightBoxWithNote";
import ContentAccess from "./ContentAccess";
import FullScreenReader from "../../widgets/PdfReader/FullScreenReader";

const ACCESS_CODE_VALIDATION_MESSSAGE = "Please enter a five digit access code";
const INVALID_ACCESSCODE = "invalidaccesscode";
const REQUIRE_ACCESSCODE = "requireaccesscode";

const ExpiredMessage = styled.div`
	a {
		color: ${theme.colours.primaryDark};
		:hover {
			color: ${theme.colours.primaryLight};
		}
	}
`;

/**
 * Component for the 'Copy Management Page'
 * @extends React.PureComponent
 */
export default withAuthConsumer(
	withApiConsumer(
		class ExtractView extends React.PureComponent {
			state = {
				resultData: null,
				extractPages: [],
				sidebar: true,
				loading: true,
				isTitleFull: false,
				isAuthorFull: false,
				isPublisherFull: false,
				isEditorFull: false,
				isTranslatorFull: false,
				isOpen: false,
				photoIndex: 0,
				access_code: null,
				access_validation_message: null,
				is_watermarked: false,
				pageNumberToNoteMap: Object.create(null),
				pageNumberToHighlightMap: Object.create(null),
				pageNumberToHighlightPageJoinMap: Object.create(null),
				excludedPages: [],
				extractPagesWithoutNull: [],
				photoIndexFullScreen: 0,
				uploadedPdfUrl: null,
				isOpenUserUploadedAsset: false,
			};

			componentDidMount() {
				this.updateState();
			}

			componentDidUpdate(prevProps) {
				if (
					this.props.match.params.extractOid !== prevProps.match.params.extractOid ||
					this.props.match.params.shareOid !== prevProps.match.params.shareOid
				) {
					this.updateState();
				}
			}

			updateState() {
				//this.getExtractPages();
				this.getCopiesData();
				this.getExtractAllNotes();
				this.getExtractAllHighlight();
				this.getExtractAllPageJoinAll();
			}

			/** API Methods */
			getExtractPages = () => {
				this.props
					.api("/public/extract-view-one", {
						extract_oid: this.props.match.params.extractOid,
						extract_share_oid: this.props.match.params.shareOid,
					})
					.then((result) => {
						let excludedPages = [];
						const extractPages = result.urls;
						const extractPagesWithoutNull = [];
						if (extractPages) {
							extractPages.map((url, index) => {
								if (!url) {
									excludedPages.push(index);
								} else {
									extractPagesWithoutNull.push(url);
								}
							});
						}
						this.setState({
							extractPages: extractPages,
							is_watermarked: result.is_watermarked,
							error: null,
							resultData: result,
							loading: false,
							excludedPages: excludedPages,
							extractPagesWithoutNull: extractPagesWithoutNull,
							uploadedPdfUrl: result.asset,
						});
					})
					.catch((result) => {
						let errorMsg = result;
						if (errorMsg.indexOf("Extract Share") !== -1 && !this.props.match.params.shareOid) {
							errorMsg = "Could not view extract. Are you sure you followed the link correctly?";
						} else if (errorMsg.indexOf("The link to this content has expired") !== -1) {
							errorMsg = (
								<ExpiredMessage>
									The link to this content has expired. If you made the copy, please regenerate the link{" "}
									<a href={getUrl("/profile/management/" + this.props.match.params.extractOid)}>here</a>.{" "}
								</ExpiredMessage>
							);
						}
						this.setState({
							extractPages: [],
							error: errorMsg,
							resultData: null,
							loading: false,
						});
					});
			};

			getCopiesData = () => {
				let params = Object.create(null);
				params.extract_oid = this.props.match.params.extractOid;
				if (this.props.match.params.shareOid) {
					params.extract_share_oid = this.props.match.params.shareOid;
				}

				if (this.state.access_code && this.state.access_validation_message === null) {
					params.access_code = this.state.access_code;
				}

				this.props
					.api("/public/extract-search", params)
					.then((result) => {
						if (result.error === null) {
							this.setState(
								{
									access_code_error: null,
									copy: result.extracts && result.extracts.length > 0 ? result.extracts[0] : null,
								},
								this.getExtractPages()
							);
						} else {
							this.setState({
								access_code_error: result.error,
								copy: result.extracts && result.extracts.length > 0 ? result.extracts[0] : null,
							});
						}
					})
					.catch(() => {
						this.setState({
							extractPages: [],
							error: "Could not view extract. Something has gone wrong",
							resultData: null,
							loading: false,
							access_code_error: null,
							copy: null,
						});
					});
			};

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
					let pageFooterText = this.getPageFooterText();
					let copyRightTextImage = GenerateCopyRightImage(pageFooterText);
					this.state.extractPages.map((page, index) => {
						pages.push(
							<div key={"printPage" + index} className="belowPages">
								<div className="inlineBlock">
									<img src={page} className="topImage" />
									<img src={copyRightTextImage} className="bottom-right-image" />
								</div>
							</div>
						);
					});
					return pages;
				} else {
					return "";
				}
			};

			/** Generate a page Footer Text for display text at bottom-right cornder on Image */
			getPageFooterText = () => {
				if (this.state.copy) {
					const data = this.state.copy;
					if (data) {
						return getHighQualityCopyrightFooterTextFromExtract(data);
					}
				}
				return "";
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
				const originalIndex = this.state.extractPages ? this.state.extractPages.findIndex((item) => item === currentUrl) : -1;
				return originalIndex;
			};

			onOpen = (currentIndex) => {
				if (this.state.uploadedPdfUrl) {
					this.setState({
						photoIndex: currentIndex || 1,
						isOpenUserUploadedAsset: true,
						isOpen: false,
					});
				} else {
					const photoIndex = currentIndex ? currentIndex : 0;
					const photoIndexFullScreen = this.getIndexForViewFullScreen(photoIndex);
					this.setState({
						isOpen: true,
						photoIndex: photoIndex,
						photoIndexFullScreen: photoIndexFullScreen,
					});
				}
			};

			onClose = () => {
				this.setState({
					isOpen: false,
					photoIndex: null,
					isOpenUserUploadedAsset: false,
				});
			};

			//Image move prev button event from lightbox
			onMovePrevRequest = (prevIndex) => {
				const actualIndex = this.getActualIndex(prevIndex);
				this.setState({
					photoIndex: this.state.uploadedPdfUrl ? prevIndex : actualIndex,
					photoIndexFullScreen: prevIndex,
				});
			};

			//Image move next button event from lightbox
			onMoveNextRequest = (nextIndex) => {
				const actualIndex = this.getActualIndex(nextIndex);
				this.setState({
					photoIndex: this.state.uploadedPdfUrl ? nextIndex : actualIndex,
					photoIndexFullScreen: nextIndex,
				});
			};

			onChangeAccessCode = (value) => {
				if (value) {
					const access_code = value;
					let access_validation_message = null;
					if (access_code.length === 5) {
						access_validation_message = null;
					} else {
						access_validation_message = ACCESS_CODE_VALIDATION_MESSSAGE;
					}
					this.setState({
						access_code: access_code,
						access_code_error: REQUIRE_ACCESSCODE,
						access_validation_message: access_validation_message,
					});
				}
			};

			submitAccessCode = () => {
				const access_code = this.state.access_code || "";
				if (access_code.length === 5) {
					this.getCopiesData();
				} else {
					this.setState({
						access_validation_message: ACCESS_CODE_VALIDATION_MESSSAGE,
					});
				}
			};

			//Get all extract noted by extract oid (copy oid) on pages
			getExtractAllNotes = () => {
				const extractOid = this.props.match.params.extractOid;
				this.props
					.api("/public/extract-note-get-all", {
						extract_oid: extractOid,
					})
					.then((result) => {
						const pageNumberToNoteMap = Object.create(null);
						const extractNotes = result.result;
						for (const note of extractNotes) {
							if (!pageNumberToNoteMap[note.page]) {
								pageNumberToNoteMap[note.page] = [];
							}
							pageNumberToNoteMap[note.page].push(note);
						}
						this.setState({
							pageNumberToNoteMap: pageNumberToNoteMap,
						});
					});
			};

			//Get all extract highlight by extract oid (copy oid) on pages
			getExtractAllHighlight = () => {
				this.props
					.api("/public/extract-highlight-get-all", {
						extract_oid: this.props.match.params.extractOid,
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
						extract_oid: this.props.match.params.extractOid,
						page: copy_page,
					})
					.then((result) => {
						const pageNumberToHighlightPageJoinMap = Object.create(null);
						const extractHighlightPageJoin = result.result;
						for (const highlightPageInfo of extractHighlightPageJoin) {
							if (!pageNumberToHighlightPageJoinMap[highlightPageInfo.page]) {
								pageNumberToHighlightPageJoinMap[highlightPageInfo.page] = [];
							}
							pageNumberToHighlightPageJoinMap[highlightPageInfo.page].push(highlightPageInfo);
						}
						this.setState({
							pageNumberToHighlightPageJoinMap: pageNumberToHighlightPageJoinMap,
						});
					});
			};

			handleNoteSelection = (oid) => {
				this.setState({
					selectedNoteOid: oid,
				});
				let newData = { ...this.state.pageNumberToNoteMap };
				if (newData[this.state.photoIndex]) {
					let newArray = [...newData[this.state.photoIndex]];
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
					newData[this.state.photoIndex] = newArray;
				} else {
					newData[this.state.photoIndex] = resultData;
				}
				this.setState({
					pageNumberToNoteMap: newData,
				});
			};

			getPageFromPageindex = () => {
				if (this.state.uploadedPdfUrl) {
					return this.state.photoIndex;
				} else if (this.state.copy && Array.isArray(this.state.copy.pages)) {
					return this.state.copy.pages[this.state.photoIndex];
				}
				return null;
			};

			render() {
				const pageTitle = this.state.copy ? this.state.copy.title : PageTitle.extractBy;
				const page = this.getPageFromPageindex();
				if (this.state.copy && this.state.access_code_error) {
					return (
						<>
							<ContentAccess
								pageTitle={pageTitle}
								data={this.state.copy}
								error={this.state.access_code_error}
								access_validation_message={this.state.access_validation_message}
								onChangeAccessCode={this.onChangeAccessCode}
								submitAccessCode={this.submitAccessCode}
							/>
						</>
					);
				}

				let data = {};
				let teacher = null;
				if (this.state.copy) {
					data = this.state.copy;
					teacher = data ? data.teacher : "";
				}
				const annotationsData = Object.create(null);
				annotationsData["teacher"] = teacher;
				annotationsData["did_create"] = false;
				annotationsData["allHighlights"] = this.state.pageNumberToHighlightMap;
				annotationsData["allHighlightPageInfo"] = this.state.pageNumberToHighlightPageJoinMap;
				annotationsData["allNotes"] = this.state.pageNumberToNoteMap;
				annotationsData["page_index"] = this.state.photoIndexFullScreen;
				annotationsData["isNoteDisplay"] = true;
				annotationsData["selectedNoteOid"] = this.state.selectedNoteOid;
				annotationsData["handleNoteSelection"] = this.handleNoteSelection;

				return (
					<>
						<HeadTitle title={pageTitle} />
						<Presentation
							extractPages={this.state.extractPages}
							copy={this.state.copy}
							toggleSidebar={this.toggleSidebar}
							sidebar={this.state.sidebar}
							getPagesForPrint={this.getPagesForPrint}
							pageFooterText={this.getPageFooterText()}
							error={this.state.error}
							loading={this.state.loading}
							toggleWidth={this.toggleWidth}
							isTitleFull={this.state.isTitleFull}
							isAuthorFull={this.state.isAuthorFull}
							isPublisherFull={this.state.isPublisherFull}
							isEditorFull={this.state.isEditorFull}
							isTranslatorFull={this.state.isTranslatorFull}
							onOpen={this.onOpen}
							is_watermarked={this.state.is_watermarked}
							pageNumberToNoteMap={this.state.pageNumberToNoteMap}
							teacher={teacher}
							pageNumberToHighlightMap={this.state.pageNumberToHighlightMap}
							pageNumberToHighlightPageJoinMap={this.state.pageNumberToHighlightPageJoinMap}
							uploadedPdfUrl={this.state.uploadedPdfUrl}
							isViewingFullScreen={this.state.isOpen || this.state.isOpenUserUploadedAsset}
							annotationsData={annotationsData}
						/>
						{this.state.isOpen && (
							<ImageLightBoxWithNote
								photoIndex={this.state.photoIndexFullScreen}
								images={this.state.extractPagesWithoutNull}
								onClose={this.onClose}
								imageCaption={this.getPageFooterText()}
								onMovePrevRequest={this.onMovePrevRequest}
								onMoveNextRequest={this.onMoveNextRequest}
								notes={this.state.pageNumberToNoteMap[page]}
								did_create={false}
								isNoteDisplay={true}
								teacher={teacher}
								highlights={this.state.pageNumberToHighlightMap[page]}
								highlightPageInfo={this.state.pageNumberToHighlightPageJoinMap[page]}
								handleNoteSelection={this.handleNoteSelection}
								selectedNoteOid={this.state.selectedNoteOid}
							/>
						)}
						{this.state.isOpenUserUploadedAsset && (
							<FullScreenReader
								pdfUrl={this.state.uploadedPdfUrl}
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
);
