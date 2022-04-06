import React from "react";
import Page from "./Page";
import styled, { css, createGlobalStyle } from "styled-components";
import * as loadPdfJs from "../../common/loadPdfJs";
import Loader from "../Loader";
import theme from "../../common/theme";
import debounce from "../../common/debounce";
import reactCreateRef from "../../common/reactCreateRef";

const DEFAULT_NUMBER_OF_PAGES_TO_DISPLAY = 1;
const MIN_ZOOM_LEVEL = 1;
const MAX_ZOOM_LEVEL = 2.5;
const ZOOM_BUTTON_INCREMENT_SIZE = 0.5;
const ZOOM_WHEEL_MULTIPLIER = 1.2;

const GlobalStyles = createGlobalStyle`
	html {
		overflow: hidden;
	}
`;

const Wrapper = styled.div`
	position: fixed;
	top: 0;
	right: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.85);
	z-index: 100;
	${(p) => p.isScrollingEnabled && "overflow: auto;"}
`;

const WrapFaIcon = styled.i`
	font-size: 36px;
	color: ${theme.colours.white};
`;

const ToolBar = styled.div`
	width: 100%;
	display: flex;
	justify-content: end;
	position: fixed;
	top: 0;
	left: 0;
	background: rgba(0, 0, 0, 0.85);
	z-index: 102;
	padding-right: 20px;
`;

const ToolBarButton = styled.button`
	border: none;
	background: none;
	color: ${theme.colours.white};
	z-index: 101;
	opacity: 0.7;
	display: flex;
	align-items: center;

	:hover {
		opacity: 1;
	}
	:disabled {
		opacity: 0.5;
		cursor: default;
	}
`;

const RotateIcon = styled.i`
	padding: 0px 6px;
	font-size: 19px;
	line-height: 50px;
`;

const ZoomIcon = styled.i`
	font-size: 20px;
	font-weight: 500;
	min-width: 40px;
	line-height: 50px;
`;

const CloseIcon = styled.i`
	font-size: 28px;
	min-width: 40px;
	line-height: 50px;
`;

const NavButton = styled.div`
	border: none;
	position: fixed;
	top: 0;
	bottom: 0;
	width: 20px;
	height: 34px;
	padding: 40px 30px;
	margin: auto;
	cursor: pointer;
	opacity: 0.7;
	z-index: 101;
	background: rgba(0, 0, 0, 0.2);
	display: flex;
	justify-content: space-around;
	align-items: center;
`;

const NavButtonPrev = styled(NavButton)`
	left: 0;
`;

const NavButtonNext = styled(NavButton)`
	right: 0;
	${(p) =>
		p.zoomLevel > MIN_ZOOM_LEVEL &&
		css`
			margin-right: 15px;
		`}
`;

const PageWrapper = styled.div`
	position: absolute;
	top: 0;
	right: 0;
	left: 0;
	bottom: 0;
	margin: auto;
	width: fit-content;
`;

export default class FullScreenReader extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			pdf: null,
			currentPage: this.props.currentPage, // 1-based
			width: window.innerWidth,
			height: window.innerHeight,
			rotateDegree: 0,
			zoomLevel: 1,
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

	componentDidUpdate(prevProps, prevState) {
		if (prevState.currentPage !== this.state.currentPage || prevState.rotateDegree !== this.state.rotateDegree) {
			return true;
		}
		if (prevProps.pdfUrl !== this.props.pdfUrl) {
			loadPdfJs.load().then(() => {
				this.viewPdf();
			});
		}
	}

	componentWillUnmount() {
		window.removeEventListener("keydown", this.onKeyDown);
		window.removeEventListener("resize", this.onChangeWindowSize);
	}

	onChangeWindowSize = debounce(() => {
		this.setState({
			width: window.innerWidth,
			height: window.innerHeight,
		});
	});

	viewPdf() {
		const pdfUrl = this.props.pdfUrl;
		const doc = pdfjsLib.getDocument(pdfUrl);
		doc.promise.then((pdf) => {
			this.setState({ pdf: pdf });
		});
	}

	onClickPrev = () => {
		const { currentPage } = this.state;
		const numberOfPagesToDisplay = this.props.numberOfPagesToDisplay || DEFAULT_NUMBER_OF_PAGES_TO_DISPLAY;
		let nextCurrentPage = currentPage - numberOfPagesToDisplay;
		if (currentPage === 1) {
			nextCurrentPage = this.state.pdf.numPages;
		}
		this.setState({ currentPage: nextCurrentPage, zoomLevel: 1, rotateDegree: 0 }, () => {
			this.props.onMovePrevRequest(nextCurrentPage);
		});
	};

	onClickNext = () => {
		const { currentPage } = this.state;
		const numberOfPagesToDisplay = this.props.numberOfPagesToDisplay || DEFAULT_NUMBER_OF_PAGES_TO_DISPLAY;
		let nextCurrentPage = currentPage + numberOfPagesToDisplay;
		if (nextCurrentPage > this.state.pdf.numPages) {
			nextCurrentPage = 1;
		}
		this.setState({ currentPage: nextCurrentPage, zoomLevel: 1, rotateDegree: 0 }, () => {
			this.props.onMoveNextRequest(nextCurrentPage);
		});
	};

	onKeyDown = (e) => {
		if (e.keyCode == 39) {
			// right arrow
			this.onClickNext();
		} else if (e.keyCode == 37) {
			// left arrow
			this.onClickPrev();
		} else if (e.keyCode == 27) {
			// esc key
			this.props.onClose();
		}
	};

	onRotateLeft = () => {
		let degree;
		if (this.state.rotateDegree === -270) {
			degree = 0;
		} else {
			degree = this.state.rotateDegree - 90;
		}

		this.setState({
			rotateDegree: degree,
			zoomLevel: 1,
		});
	};

	onRotateRight = () => {
		let degree;
		if (this.state.rotateDegree === 270) {
			degree = 0;
		} else {
			degree = this.state.rotateDegree + 90;
		}

		this.setState({
			rotateDegree: degree,
			zoomLevel: 1,
		});
	};

	onZoomIn = () => {
		this.setState({ zoomLevel: Math.min(this.state.zoomLevel + ZOOM_BUTTON_INCREMENT_SIZE, MAX_ZOOM_LEVEL) });
	};

	onZoomOut = () => {
		this.setState({ zoomLevel: Math.max(this.state.zoomLevel - ZOOM_BUTTON_INCREMENT_SIZE, MIN_ZOOM_LEVEL) });
	};

	onChangeMouseWheel = (event) => {
		event.preventDefault();
		let nextZoomLevel;
		if (event.deltaY > 0) {
			nextZoomLevel = Math.max(this.state.zoomLevel / ZOOM_WHEEL_MULTIPLIER, MIN_ZOOM_LEVEL);
		} else {
			nextZoomLevel = Math.min(this.state.zoomLevel * ZOOM_WHEEL_MULTIPLIER, MAX_ZOOM_LEVEL);
		}
		this.setState({ zoomLevel: nextZoomLevel });
	};

	getPreviewPages() {
		const { currentPage } = this.state;
		const numberOfPagesToDisplay = this.props.numberOfPagesToDisplay || DEFAULT_NUMBER_OF_PAGES_TO_DISPLAY;
		const ret = [];
		for (let i = 0; i < numberOfPagesToDisplay && currentPage + i <= this.state.pdf.numPages; i++) {
			ret.push(currentPage + i);
		}
		return ret;
	}

	doCloseFullScreen = (e) => {
		if (e.target === this.wrapperRef.current) {
			this.props.onClose();
		}
	};

	render() {
		const isInAnnotationEditMode = this.props.annotationsData.selectedNote || this.props.annotationsData.selectedHighlight;
		return (
			<Wrapper ref={this.wrapperRef} isScrollingEnabled={!isInAnnotationEditMode} onClick={this.doCloseFullScreen}>
				<GlobalStyles />
				<ToolBar>
					<ToolBarButton disabled={isInAnnotationEditMode} onClick={this.onRotateLeft}>
						<RotateIcon className="fas fa-undo" />
					</ToolBarButton>
					<ToolBarButton disabled={isInAnnotationEditMode} onClick={this.onRotateRight}>
						<RotateIcon className="fas fa-redo" />
					</ToolBarButton>
					<ToolBarButton disabled={this.state.zoomLevel === MAX_ZOOM_LEVEL} onClick={this.onZoomIn}>
						<ZoomIcon className="fas fa-search-plus fa-flip-horizontal" />
					</ToolBarButton>
					<ToolBarButton disabled={this.state.zoomLevel === MIN_ZOOM_LEVEL} onClick={this.onZoomOut}>
						<ZoomIcon className="fas fa-search-minus fa-flip-horizontal" />
					</ToolBarButton>
					<ToolBarButton>
						<CloseIcon className="fal fa-times" onClick={this.props.onClose} />
					</ToolBarButton>
				</ToolBar>
				<NavButtonPrev onClick={this.onClickPrev}>
					<WrapFaIcon className="fal fa-chevron-left" />
				</NavButtonPrev>
				<NavButtonNext onClick={this.onClickNext} zoomLevel={this.state.zoomLevel}>
					<WrapFaIcon className="fal fa-chevron-right" />
				</NavButtonNext>
				<PageWrapper onWheel={this.onChangeMouseWheel}>
					{!this.state.pdf ? (
						<Loader />
					) : (
						this.getPreviewPages().map((page) => {
							return (
								<Page
									key={page}
									pageNumber={page}
									pdf={this.state.pdf}
									width={this.state.width - 100}
									height={this.state.height - 10}
									rotateDegree={this.state.rotateDegree}
									zoomLevel={this.state.zoomLevel}
									annotationsData={this.props.annotationsData}
								/>
							);
						})
					)}
				</PageWrapper>
			</Wrapper>
		);
	}
}
