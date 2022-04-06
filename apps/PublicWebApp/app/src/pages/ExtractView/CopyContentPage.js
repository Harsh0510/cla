import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme.js";
import SliderPage from "./SliderPage";
import CopyDetails from "./CopyDetails";
import withPageSize from "../../common/withPageSize";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import PdfReader from "../../widgets/PdfReader";

const BookTableContent = styled.div`
	padding-bottom: 2em;
`;

const CopyContent = styled.div`
	background-color: ${theme.colours.darkGray};
	padding-top: 1rem;
	left: 0;
	top: 0;
	height: auto;
	z-index: 5;
	transition: all 0.3s;
	padding-bottom: 1rem;
	color: ${theme.colours.white};

	.table-list > * {
		padding: 5px 30px;
		ul {
			list-style-type: none;
			padding-left: 0;
			margin-top: 0;
			margin-bottom: 1rem;
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
		}
		ul > li {
			padding-bottom: 0.3em;
			line-height: 1.2;
			text-indent: -0.5em;
			padding-left: 0.5em;
		}
		.label {
			width: calc(100% - 50px);
			display: inline-block;
		}
		.page {
			width: 48px;
			display: inline-block;
			text-align: right;
			vertical-align: top;
			cursor: pointer;
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
	line-height: 1em;
	margin-left: 0.5rem;

	span {
		font-size: 12px;
		font-weight: normal;
		text-decoration: underline;
	}
`;

const BookView = styled.div`
	height: auto;
	transition: all 0.3s;
	position: relative;
	background-color: ${theme.colours.bgLightDark};

	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		flex: 2;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		padding-left: 0px;
	}
`;

const BooksScreenshot = styled.div`
	overflow-y: auto;
	overflow-x: hidden;
	height: auto;
	padding: 30px 30px 30px;
	transition: all 0.3s;

	${(props) =>
		props.hide &&
		css`
			padding: 30px 30px 30px 40px;
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
		padding: 20px 10px 10px 30px;
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

	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		${(props) =>
			props.hide &&
			css`
				display: none;
			`}
		width: 10px;
	}
`;

const InnerSection = styled.div`
	padding-left: 1em;
	padding-right: 1em;
`;

const TableWrapper = styled.div`
	position: relative;
	color: ${theme.colours.white};
	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		display: flex;
	}
`;

const WrapButtonClose = styled.div`
	text-align: right;
`;

const WrapContent = styled.div`
	background-color: ${theme.colours.darkGray};
	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		height: auto;
		width: 320px;
	}
`;

export default withPageSize(
	class CopyContentPage extends React.PureComponent {
		_handleOnOpenBound = this.handleOnOpen.bind(this);

		handleOnOpen() {
			this.props.onOpen(0);
		}

		render() {
			const { isSidebar, extractPages, loading, data, copyRightTextImage, uploadedPdfUrl, annotationsData, onOpen, isViewingFullScreen } = this.props;
			const previewPages = uploadedPdfUrl ? (
				<PdfReader annotationsData={annotationsData} pdfUrl={uploadedPdfUrl} onOpen={onOpen} enableKeyNavigation={!isViewingFullScreen} data={data} />
			) : (
				extractPages.map((item, index) => {
					const currentPage = index + 1;
					const pageIndex = index;
					const page = data.pages[pageIndex];
					const notes = this.props.pageNumberToNoteMap[page] ? this.props.pageNumberToNoteMap[page] : [];
					const highlights = this.props.pageNumberToHighlightMap[page] ? this.props.pageNumberToHighlightMap[page] : [];
					const highlighterInfo = this.props.pageNumberToHighlightPageJoinMap[page] ? this.props.pageNumberToHighlightPageJoinMap[page] : [];
					return (
						<SliderPage
							key={Number(currentPage)}
							pageNumber={currentPage}
							currentIndex={index}
							pageImageUrl={item}
							copyRightTextImage={copyRightTextImage}
							imageRef={this.imgRef}
							isCoverPage={false}
							onOpen={this.props.onOpen}
							is_watermarked={this.props.is_watermarked}
							notes={notes}
							teacher={this.props.teacher}
							highlights={highlights}
							highlighterInfo={highlighterInfo}
						/>
					);
				})
			);

			return (
				<>
					<Container>
						<BookTableContent>
							<TableWrapper>
								{isSidebar ? (
									<WrapContent>
										<CopyContent className="table-content" hide={!isSidebar}>
											<InnerSection>
												<WrapButtonClose>
													<ButtonClose onClick={this._handleOnOpenBound} title={"Fullscreen"}>
														<i className="fal fa-expand"></i>
														<br />
														<span>Fullscreen</span>
													</ButtonClose>
												</WrapButtonClose>
												<CopyDetails data={data} />
											</InnerSection>
										</CopyContent>
									</WrapContent>
								) : (
									""
								)}
								<BookView hide={isSidebar}>
									<TabMenu onClick={this.props.toggleSidebar} hide={isSidebar} title="Open">
										{" "}
										<i className="fal fa-compress"></i>
									</TabMenu>
									<BooksScreenshot hide={isSidebar} column={this.props.numColumns} id="SliderBody">
										<Row>
											{!uploadedPdfUrl && <SliderPage key={"CoverPage"} isCoverPage={true} data={data} />}
											{previewPages}
										</Row>
									</BooksScreenshot>
								</BookView>
							</TableWrapper>
						</BookTableContent>
					</Container>
				</>
			);
		}
	}
);
