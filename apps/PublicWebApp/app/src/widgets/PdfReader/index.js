import React from "react";
import Page from "./Page";
import styled from "styled-components";
import * as loadPdfJs from "../../common/loadPdfJs";
import Loader from "../Loader";
import theme from "../../common/theme";
import reactCreateRef from "../../common/reactCreateRef";
import debounce from "../../common/debounce";
import NoteManager from "../../widgets/ExtractNote/Manager";
import HighlightManager from "../../widgets/ExtractHighlight/Manager";
import ExtractPageHighlighterInfo from "../../widgets/ExtractPageHighlighterInfo";
import CoverPageWrapper from "../CoverPage/CoverPageWrapper";

const DEFAULT_NUMBER_OF_PAGES_TO_DISPLAY = 2;

const Wrapper = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const PagesWrapper = styled.div`
	display: flex;
	flex: 1;
	justify-content: center;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		flex-direction: column;
	}
`;

const WrapCanvas = styled.div`
	padding: 0 10px;
	display: flex;
	justify-content: center;
`;

const WrapFaIcon = styled.div`
	font-size: 28px;
	cursor: pointer;
	padding: 2px;
	color: ${theme.colours.white};
`;

const RightFaIcon = styled(WrapFaIcon)`
	margin-right: 10px;
`;

const WrapperCoverPage = styled.div`
	margin: 0px 10px;
`;

export default class PdfViewer extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			pdf: null,
			currentPage: 1, // 1-based
			width: 100,
			numberOfPagesToDisplay: 1,
		};
		this.wrapperRef = reactCreateRef();
	}

	componentDidMount() {
		loadPdfJs.load().then(() => {
			this.onChangeWindowSize();
			this.viewPdf();
		});
		window.addEventListener("resize", this.onChangeWindowSize);
		window.addEventListener("keydown", this.onKeyDown);
	}

	componentWillUnmount() {
		window.removeEventListener("keydown", this.onKeyDown);
		window.removeEventListener("resize", this.onChangeWindowSize);
	}

	onKeyDown = (e) => {
		if (this.props.enableKeyNavigation) {
			if (e.keyCode == 39) {
				// right arrow
				this.onClickNext();
			} else if (e.keyCode == 37) {
				// left arrow
				this.onClickPrev();
			}
		}
	};

	onChangeWindowSize = debounce(() => {
		const wrapperWidth = this.wrapperRef.current.getBoundingClientRect().width;
		const numDisplayPages = wrapperWidth <= 480 ? 1 : this.props.numberOfPagesToDisplay || DEFAULT_NUMBER_OF_PAGES_TO_DISPLAY;
		this.setState({
			width: (wrapperWidth - 100) / numDisplayPages,
			numberOfPagesToDisplay: numDisplayPages,
		});
	});

	componentDidUpdate(prevProps, prevState) {
		if (prevState.currentPage !== this.state.currentPage || prevState.numberOfPagesToDisplay !== this.state.numberOfPagesToDisplay) {
			return true;
		}
		if (prevProps.pdfUrl !== this.props.pdfUrl) {
			loadPdfJs.load().then(() => {
				this.viewPdf();
			});
		}
	}

	viewPdf() {
		const pdfUrl = this.props.pdfUrl;
		const doc = pdfjsLib.getDocument(pdfUrl);
		doc.promise.then((pdf) => {
			this.setState({ pdf: pdf });
		});
	}

	onClickPrev = () => {
		const { currentPage, numberOfPagesToDisplay } = this.state;
		let nextCurrentPage;
		if (currentPage === 1) {
			nextCurrentPage = this.state.pdf.numPages - numberOfPagesToDisplay + 1;
		} else {
			nextCurrentPage = currentPage - numberOfPagesToDisplay;
		}
		this.setState({ currentPage: Math.max(1, nextCurrentPage) });
	};

	onClickNext = () => {
		const { currentPage, numberOfPagesToDisplay } = this.state;
		let nextCurrentPage = currentPage + numberOfPagesToDisplay;
		if (nextCurrentPage > this.state.pdf.numPages) {
			nextCurrentPage = 1;
		}
		this.setState({ currentPage: nextCurrentPage });
	};

	getPreviewPages() {
		const { currentPage } = this.state;
		const numberOfPagesToDisplay =
			this.wrapperRef.current.getBoundingClientRect().width >= 480 && currentPage === 1 && this.props.data
				? this.state.numberOfPagesToDisplay - 1
				: this.state.numberOfPagesToDisplay;
		const ret = [];
		for (let i = 0; i < numberOfPagesToDisplay && currentPage + i <= this.state.pdf.numPages; i++) {
			ret.push(currentPage + i);
		}
		return ret;
	}

	render() {
		const annotationsData = this.props.annotationsData;
		const coverPage =
			this.state.currentPage === 1 && this.props.data ? (
				<WrapperCoverPage>
					<CoverPageWrapper data={this.props.data} />
				</WrapperCoverPage>
			) : null;
		return (
			<Wrapper ref={this.wrapperRef}>
				<WrapFaIcon onClick={this.onClickPrev}>
					<i className="far fa-chevron-left"></i>
				</WrapFaIcon>
				<PagesWrapper>
					{!this.state.pdf ? (
						<Loader />
					) : (
						<>
							{this.wrapperRef.current.getBoundingClientRect().width >= 480 && coverPage}
							{this.wrapperRef.current.getBoundingClientRect().width <= 480 && coverPage
								? coverPage
								: this.getPreviewPages().map((page) => {
										return (
											<WrapCanvas key={page}>
												<div style={{ position: "relative", color: "black", zIndex: 1 }}>
													<NoteManager
														notes={annotationsData.allNotes[page] ? annotationsData.allNotes[page] : []}
														hideContent={true}
														teacher={annotationsData.teacher}
														did_create={false}
													/>
													{annotationsData.allHighlights[page] && annotationsData.allHighlights[page].length ? (
														<>
															<ExtractPageHighlighterInfo
																highlighterInfo={annotationsData.allHighlightPageInfo[page] ? annotationsData.allHighlightPageInfo[page] : []}
															/>
															<HighlightManager
																highlights={annotationsData.allHighlights[page] ? annotationsData.allHighlights[page] : []}
																teacher={annotationsData.teacher}
																did_create={false}
															/>
														</>
													) : (
														""
													)}

													<Page pageNumber={page} pdf={this.state.pdf} onOpen={this.props.onOpen} width={this.state.width} />
												</div>
											</WrapCanvas>
										);
								  })}
						</>
					)}
				</PagesWrapper>
				<RightFaIcon onClick={this.onClickNext}>
					<i className="far fa-chevron-right"></i>
				</RightFaIcon>
			</Wrapper>
		);
	}
}
