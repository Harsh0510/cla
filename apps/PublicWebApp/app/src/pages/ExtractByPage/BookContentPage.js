import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme.js";
import SliderPage from "./SliderPage";
import reactCreateRef from "../../common/reactCreateRef";
import CustomDocumentClassList from "../../common/customDocumentClassList";
import SliderWrap from "./SliderWrap";
import { rangeExpand } from "../../common/rangeExpand";
import getPageOffsetObject from "../../common/getPageOffsetObject";
import getPageSequenceNumber from "../../common/getPageSequenceNumber";
import ReactScrollWheelHandler from "react-scroll-wheel-handler";
import staticValues from "../../common/staticValues";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";

const FILE_FORMAT_EPUB = staticValues.assetFileFormat.epub;
const FLYOUT_INDEX_ON_ARROW = 0; //  flyout option index
const FLYOUT_INDEX_ON_Slider_Page_Header = 1; // flyout option index

const ACTION = {
	TableOfContent: "TableOfContent",
};

const BookTableContent = styled.div``;

const TableContent = styled.div`
	background-color: ${theme.colours.darkGray};
	width: 270px;
	overflow-y: auto;
	position: absolute;
	left: 0;
	top: 0;
	height: 100%;
	z-index: 21;
	transition: all 0.3s;

	.table-list > * {
		padding: 5px 30px;
		ul {
			list-style-type: none;
			margin-top: 0;
			margin-bottom: 1rem;
			line-height: 1.2;
			text-indent: -0.5em;
			padding-left: 0.5em;
			overflow-x: hidden;
			list-style: none;
		}
		ul > ul {
			list-style-type: none;
			padding-left: 0.5em;
			margin-top: 0.5em;
			margin-bottom: 1rem;
			padding-bottom: 0.3em;
		}
		ul > li > ul {
			padding-bottom: 0.3em;
			line-height: 1.2;
			text-indent: -0.5em;
			padding-left: 0.5em;
			margin-bottom: 1rem;
			width: 100%;
		}
		ul > li {
			padding-bottom: 0.3em;
			line-height: 1.2;
			text-indent: -0.5em;
			padding-left: 0.5em;
			position: relative;
			display: -webkit-box;
			display: -ms-flexbox;
			display: flex;
			-webkit-box-align: flex-end;
			-ms-flex-align: flex-end;
			align-items: flex-end;
			-webkit-box-pack: justify;
			-ms-flex-pack: justify;
			justify-content: space-between;
		}
		ul > li > ul > li {
			display: flex;
			align-items: flex-end;
		}
		.no-page {
			margin-bottom: 9px;
		}
		.label {
			width: auto;
			display: inline-block;
			position: relative;
			max-width: -webkit-calc(100% - 51px);
			max-width: expression(50% - 100px);
			max-width: -moz-calc(100% - 51px);
			max-width: -o-calc(100% - 51px);
			max-width: calc(100% - 51px);
		}
		ul > li > ul > li {
			display: flex;
			align-items: flex-end;
		}
		ul li .label:after {
			content: ". . . . . . . . . . . . . . . . . . . . " ". . . . . . . . . . . . . . . . . . . . " ". . . . . . . . . . . . . . . . . . . . "
				". . . . . . . . . . . . . . . . . . . . ";
			display: inline-block;
			position: absolute;
			white-space: nowrap;
			padding-left: 0.7em;
		}
		.toc > ul > li,
		.toc > ul > li > ul > li {
			-ms-flex-wrap: wrap;
			flex-wrap: wrap;
			display: -webkit-box;
			display: -ms-flexbox;
			display: flex;
			-webkit-box-pack: justify;
			-ms-flex-pack: justify;
			justify-content: space-between;
		}
		.no-page:after {
			content: "" !important;
		}
		.page {
			flex-shrink: 0;
			text-indent: 0;
			display: inline-block;
			text-align: right;
			vertical-align: bottom;
			cursor: pointer;
			position: relative;
			background: ${theme.colours.darkGray};
		}
	}

	.table-list .active {
		background-color: ${theme.colours.tableActiveRowBackGround};
	}

	${(props) =>
		props.hide &&
		css`
			transform: translateX(-270px);
		`}

	::-webkit-scrollbar {
		width: 10px;
	}
	::-webkit-scrollbar-track {
		background: transparent;
	}
	::-webkit-scrollbar-thumb {
		background: ${theme.colours.lightGray};
		border-radius: 0;
	}
	::-webkit-scrollbar-thumb:hover {
		background: ${theme.colours.lightGray};
	}

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		width: 100%;
		position: relative;
	}
`;

const ButtonClose = styled.button`
	background: transparent;
	border: 0;
	color: ${theme.colours.white};
	font-weight: bold;
	font-size: 20px;
	padding: 2px;
`;

const BookView = styled.div`
	transition: all 0.3s;
	position: relative;
	border-left: 1px solid ${theme.colours.lightGray};

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		padding-left: 0px;
	}
	padding-left: ${(p) => (p.hide === true ? "270px" : "0px")};
`;

const BooksScreenshot = styled.div`
	overflow-y: auto;
	overflow-x: hidden;
	height: 525px;
	padding: 30px 30px 0;
	transition: all 0.3s;

	${(props) =>
		props.hide &&
		css`
			padding: 30px 30px 0 60px;
		`}

	::-webkit-scrollbar {
		width: 10px;
	}
	::-webkit-scrollbar-track {
		background: transparent;
	}
	::-webkit-scrollbar-thumb {
		background: ${theme.colours.lightGray};
		border-radius: 0;
	}
	::-webkit-scrollbar-thumb:hover {
		background: ${theme.colours.lightGray};
	}

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		height: 440px;
		padding: 20px 10px 10px 30px;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		height: 440px;
	}
`;

const TabMenu = styled.button`
	position: absolute;
	left: 7px;
	font-size: 22px;
	color: ${theme.colours.white};
	padding: 0;
	border: 0;
	background-color: transparent;

	:hover {
		background-color: transparent;
		color: ${theme.colours.white};
		padding: 0;
		border: 0;
	}
`;

const TableWrapper = styled.div`
	position: relative;
	background-color: ${theme.colours.bgLightDark};
	color: ${theme.colours.white};
`;

const TableContentHeading = styled.span`
	padding-right: 1.5rem;
	padding-left: 1.5rem;
	display: block;
	font-size: 18px;
	font-weight: bold;
	text-transform: uppercase;
`;

const WrapButtonClose = styled.div`
	text-align: right;
	padding-right: 1.5rem;
`;

const TableOfContentItem = styled.div`
	font-size: 14px;
	color: ${theme.colours.white};
`;

const ContentItem = styled.div`
	color: ${theme.colours.white};
`;

const PTag = styled.p`
	padding-right: 1.5rem;
	padding-left: 1.5rem;
	display: block;
	font-size: 0.875em;
`;

const TableOfContentNull = styled.div`
	padding: 0.2rem 1.5rem 1.5rem 1.5rem;
	font-size: 0.875em;
`;

export default class BookContentPage extends React.PureComponent {
	checkBox = reactCreateRef();

	constructor(props) {
		super(props);
		this._tocRef = reactCreateRef();
		this.bookScreenRef = reactCreateRef();
		this.state = {
			focused: false,
		};
	}

	_cursorPosition = { x: 0, y: 0 };

	componentDidMount() {
		if (this._tocRef.current) {
			this._tocRef.current.addEventListener("click", this.doTocClick, false);
		}

		let elements = document.querySelectorAll("ul > li .page");
		for (let elem of elements) {
			if (elem.innerText === "") {
				elem.parentElement.querySelector(".label").classList.add("no-page");
			}
		}
		document.addEventListener("keydown", this._onKeyDown, false);
		document.addEventListener("mousemove", this._updateMousePosition, false);
	}

	componentWillUnmount() {
		document.removeEventListener("mousemove", this._updateMousePosition, false);
		document.removeEventListener("keydown", this._onKeyDown, false);
		if (this._tocRef.current) {
			this._tocRef.current.removeEventListener("click", this.doTocClick, false);
		}
	}

	_updateMousePosition = (e) => {
		this._cursorPosition = {
			x: e.clientX,
			y: e.clientY,
		};
	};

	_onKeyDown = (e) => {
		if (this.bookScreenRef.current) {
			if (this.bookScreenRef.current.parentElement.contains(e.target)) {
				e.preventDefault();
			} else {
				const bb = this.bookScreenRef.current.getBoundingClientRect();
				if (
					this._cursorPosition.x >= bb.left &&
					this._cursorPosition.x <= bb.right &&
					this._cursorPosition.y >= bb.top &&
					this._cursorPosition.y <= bb.bottom
				) {
					e.preventDefault();
				}
			}
		}
	};

	onFocusBookScreen = () => {
		this.setState({ focused: true });
	};

	onBlurBookScreen = () => {
		this.setState({ focused: false });
	};

	doTocClick = (e) => {
		const data = this.props.workData;
		const pageOffsetObject = getPageOffsetObject(data);
		const page_offset_roman = pageOffsetObject.roman;
		const page_offset_arabic = pageOffsetObject.arabic;
		const pageCount = parseInt(data.page_count, 10);
		let pageNumber = null;
		if (CustomDocumentClassList(e, "page")) {
			pageNumber = getPageSequenceNumber(e.target.innerText, page_offset_roman, page_offset_arabic);
		} else if (CustomDocumentClassList(e, "label")) {
			const pageEl = e.target.nextElementSibling;
			if (pageEl && pageEl.matches("span.page")) {
				pageNumber = getPageSequenceNumber(pageEl.innerText, page_offset_roman, page_offset_arabic);
			}
		}
		if (pageNumber) {
			let isValid = true;
			const data = rangeExpand(pageNumber.toString(), page_offset_roman, page_offset_arabic, pageCount);
			data.map((item, index) => {
				if (item === 0) {
					isValid = false;
				}
				if (item >= pageCount + 1) {
					isValid = false;
				}
			});
			if (isValid) {
				this.goToPage(e, pageNumber);
			}
		}
	};

	goToPage = (e, pageNumber) => {
		if (pageNumber > 0) {
			e.preventDefault();
			this.props.goToPageNumber(pageNumber);
		}
	};

	handleChange = (page) => {
		setTimeout(() => {
			this.props.addSelectedPage(page + 1);
		}, 20);
	};

	onPressPage = (page) => {
		setTimeout(() => {
			this.props.highlightPage(page);
		}, 20);
	};

	on_highlighted_page_change = (page) => {
		setTimeout(() => {
			this.props.highlightPage(page);
		}, 20);
	};

	render() {
		const { isTableOfContent, workData } = this.props;

		const contentForm = workData.content_form;
		const totalItems = parseInt(this.props.workData.page_count, 10);
		let currentHighlightedPage = parseInt(this.props.highlighted, 10);
		let selectStartPage = currentHighlightedPage;
		let selectEndPage = currentHighlightedPage;

		if (this.props.numColumns === 2) {
			selectStartPage = currentHighlightedPage <= totalItems ? currentHighlightedPage : totalItems;
			selectEndPage = currentHighlightedPage + 1 <= totalItems ? currentHighlightedPage + 1 : totalItems;
		}
		selectEndPage = selectEndPage + 1;
		const pageOffsetObject = getPageOffsetObject(this.props.workData);
		const previewPages = Array(selectEndPage - selectStartPage)
			.fill(0)
			.map((item, index) => {
				const currentPage = index + selectStartPage;
				const highlighted = parseInt(this.props.highlighted) === currentPage;
				const checked = !!this.props.selectedPagesMap[currentPage];
				return (
					<SliderPage
						key={Number(currentPage)}
						sasToken={this.props.sasToken}
						isbn={this.props.isbn}
						pageNumber={currentPage}
						highlighted={highlighted}
						checked={checked}
						numColumns={this.props.numColumns}
						highlightPage={this.props.highlightPage}
						addSelectedPage={this.props.addSelectedPage}
						setNumColumns={this.props.setNumColumns}
						currentIndex={index}
						page_offset_roman={pageOffsetObject.roman}
						page_offset_arabic={pageOffsetObject.arabic}
						doShowFlyout={this.props.flyOutIndex === FLYOUT_INDEX_ON_Slider_Page_Header}
						onFlyoutClose={this.props.onFlyoutClose}
						onOpen={this.props.onOpen}
						contentForm={contentForm}
						imageSrc={this.props.images[currentPage - 1]}
						copyExcludedPagesMap={this.props.copyExcludedPagesMap}
					/>
				);
			});

		return (
			<>
				<Container>
					<BookTableContent>
						<TableWrapper>
							{isTableOfContent ? (
								<TableContent className="table-content" hide={!isTableOfContent}>
									<WrapButtonClose>
										<ButtonClose onClick={(e) => this.props.handleEvents(e, ACTION.TableOfContent)}>×</ButtonClose>
									</WrapButtonClose>
									{workData.file_format === FILE_FORMAT_EPUB && <PTag>{staticValues.messages.assetFileFormatEpubMessage}</PTag>}
									<TableContentHeading>Table of contents</TableContentHeading>
									{workData.table_of_contents ? (
										<TableOfContentItem className="table-list">
											<ContentItem>
												<div ref={this._tocRef} dangerouslySetInnerHTML={{ __html: workData.table_of_contents }} className="toc" />
											</ContentItem>
										</TableOfContentItem>
									) : (
										<TableOfContentNull>{staticValues.messages.assetTableOfContentNull}</TableOfContentNull>
									)}
								</TableContent>
							) : (
								""
							)}
							<BookView
								onMouseOver={this.onFocusBookScreen}
								onMouseOut={this.onBlurBookScreen}
								onFocus={this.onFocusBookScreen}
								onBlur={this.onBlurBookScreen}
								hide={isTableOfContent}
							>
								<TabMenu onClick={(e) => this.props.handleEvents(e, ACTION.TableOfContent)} title="Open">
									{" "}
									<i className="fal fa-caret-square-right"></i>
								</TabMenu>
								<ReactScrollWheelHandler
									upHandler={this.props.upHandler}
									downHandler={this.props.downHandler}
									rightHandler={this.props.downHandler}
									leftHandler={this.props.upHandler}
									timeout={300}
									preventScroll={true}
									pauseListeners={!this.state.focused}
								>
									<BooksScreenshot ref={this.bookScreenRef} hide={isTableOfContent} column={this.props.numColumns} id="SliderBody">
										<Row>{previewPages}</Row>
									</BooksScreenshot>
								</ReactScrollWheelHandler>
								<SliderWrap
									items={this.props.sliderItems}
									highlighted_count={this.props.numColumns}
									highlighted_first_index={this.props.highlighted}
									on_press_page={this.onPressPage}
									on_press_checkbox={this.handleChange}
									on_highlighted_page_change={this.on_highlighted_page_change}
									page_offset_roman={pageOffsetObject.roman}
									page_offset_arabic={pageOffsetObject.arabic}
									doShowFlyout={this.props.flyOutIndex === FLYOUT_INDEX_ON_ARROW}
									onFlyoutClose={this.props.onFlyoutClose}
									highlighted={this.props.highlighted}
									copyExcludedPagesMap={this.props.copyExcludedPagesMap}
								/>
							</BookView>
						</TableWrapper>
					</BookTableContent>
				</Container>
			</>
		);
	}
}
