import React from "react";
import styled from "styled-components";
import reactCreateRef from "../../common/reactCreateRef";
import ImageWrapComponent from "../../widgets/ImageLightBoxWithNote/ImageWrapComponent";

const Wrap = styled.div`
	position: relative;
	display: inline-block;
`;

const Canvas = styled.canvas`
	position: relative;
	z-index: -1;
`;

const TextLayer = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
`;
export default class Page extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			canvasWidth: 0,
			canvasHeight: 0,
		};
		this.textElement = reactCreateRef();
		this.refPdfPage = reactCreateRef();
	}

	componentDidMount() {
		this._isMounted = true;
		this.viewPdf();
	}

	componentWillUnmount() {
		delete this._isMounted;
	}

	componentDidUpdate(prevProps) {
		if (
			prevProps.width !== this.props.width ||
			prevProps.height !== this.props.height ||
			prevProps.zoomLevel !== this.props.zoomLevel ||
			prevProps.rotateDegree !== this.props.rotateDegree
		) {
			this.viewPdf();
			return true;
		}
	}

	viewPdf() {
		const rotation = this.props.rotateDegree || 0;
		const zoomLevel = this.props.zoomLevel || 1;

		this.props.pdf.getPage(this.props.pageNumber).then((page) => {
			if (!this._isMounted) {
				return;
			}
			const viewport = (() => {
				const v = page.getViewport({ scale: 1, rotation: rotation });
				const scaleX = (this.props.width || 9999999) / v.width;
				const scaleY = (this.props.height || 9999999) / v.height;
				const scale = Math.min(scaleX, scaleY) * zoomLevel;
				return page.getViewport({ scale: scale, rotation: rotation });
			})();

			const canvas = this.refPdfPage.current;
			const textEl = this.textElement.current;
			textEl.innerText = "";

			this.setState(
				{
					canvasWidth: viewport.width,
					canvasHeight: viewport.height,
				},
				() => {
					if (!this._isMounted) {
						return;
					}
					const transform = [1, 0, 0, 1, 0, 0];

					page.getTextContent().then((pageContent) => {
						if (!this._isMounted) {
							return;
						}
						pdfjsLib.renderTextLayer({
							textContent: pageContent,
							container: textEl,
							viewport: viewport,
							textDivs: [],
						});
						page.render({
							canvasContext: canvas.getContext("2d"),
							transform: transform,
							viewport: viewport,
						});
					});
				}
			);
		});
	}

	onOpen = () => {
		if (this.props.onOpen) {
			this.props.onOpen(this.props.pageNumber);
		}
	};

	render() {
		const { annotationsData, pageNumber, rotateDegree } = this.props;
		let annotationsEl = null;
		if (annotationsData) {
			const extraData = {
				...annotationsData,
				highlights: annotationsData.allHighlights[pageNumber] ? annotationsData.allHighlights[pageNumber] : [],
				notes: annotationsData.allNotes[pageNumber] ? annotationsData.allNotes[pageNumber] : [],
				highlightPageInfo: annotationsData.allHighlightPageInfo[pageNumber] ? annotationsData.allHighlightPageInfo[pageNumber] : [],
				rotateDegree: rotateDegree || 0,
			};
			annotationsEl = <ImageWrapComponent key={pageNumber} extraData={extraData} pageEl={this.refPdfPage.current} />;
		}
		return (
			<Wrap onClick={this.onOpen}>
				<Canvas
					width={this.state.canvasWidth}
					height={this.state.canvasHeight}
					style={{ width: this.state.canvasWidth + "px", height: this.state.canvasHeight + "px" }}
					ref={this.refPdfPage}
				/>
				<TextLayer className="textLayer" ref={this.textElement} />
				{annotationsEl}
			</Wrap>
		);
	}
}
