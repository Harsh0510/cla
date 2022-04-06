import React from "react";
import ResizeObserver from "resize-observer-polyfill";
import NoteManager from "../../widgets/ExtractNote/Manager";
import HighlightDrawer from "../HighlightDrawer";
import HighlightManger from "../../widgets/ExtractHighlight/Manager";
import ExtractPageHighlighterInfo from "../../widgets/ExtractPageHighlighterInfo";
import reactCreateRef from "../../common/reactCreateRef";
import imgIsReady from "../../common/imgIsReady";

const DEFAULT_HEIGHT = 200;
const DEFAULT_WIDTH = 200;

const mutationObserverOptions = {
	attributes: true,
	attributeFilter: ["class", "style"],
};

export default class ImageWrapComponent extends React.PureComponent {
	_wrapRef = reactCreateRef();
	state = {
		pageBb: null,
		pageNaturalDimensions: null,
	};
	_updateImageBoundingBox = () => {
		this.setState({
			pageBb: this.props.pageEl.getBoundingClientRect(),
		});
	};
	_updateImageNaturalDimensions() {
		this.setState({
			pageNaturalDimensions: {
				width: this.props.pageEl.naturalWidth,
				height: this.props.pageEl.naturalHeight,
			},
		});
	}
	_onImageLoad = () => {
		this._updateImageBoundingBox();
		this._updateImageNaturalDimensions();
	};
	attachObservers() {
		const page = this.props.pageEl;
		if (!page) {
			return;
		}
		this._mutationObserver = new MutationObserver(this._updateImageBoundingBox);
		this._mutationObserver.observe(page, mutationObserverOptions);
		this._resizeObserver = new ResizeObserver(this._updateImageBoundingBox);
		this._resizeObserver.observe(page);
		window.addEventListener("resize", this._updateImageBoundingBox, false);
	}
	initImageElement() {
		const page = this.props.pageEl;
		if (imgIsReady(page)) {
			this._onImageLoad();
		} else if (page) {
			page.addEventListener("load", this._onImageLoad, false);
		}
		this.attachObservers();
	}
	detachObservers() {
		if (this.props.pageEl) {
			this.props.pageEl.removeEventListener("load", this._onImageLoad, false);
		}
		if (this._mutationObserver) {
			this._mutationObserver.disconnect();
			delete this._mutationObserver;
		}
		if (this._resizeObserver) {
			this._resizeObserver.disconnect();
			delete this._resizeObserver;
		}
		window.removeEventListener("resize", this._updateImageBoundingBox, false);
	}
	componentDidMount() {
		this.initImageElement();
		document.addEventListener("mousedown", this._onImageMouseDown, false);
		document.addEventListener("touchstart", this._onImageTouchStart, false);
	}
	componentDidUpdate(prevProps) {
		if (this.props.pageEl !== prevProps.pageEl) {
			this.detachObservers();
			this.initImageElement();
		}
	}
	componentWillUnmount() {
		document.removeEventListener("mousedown", this._onImageMouseDown, false);
		document.removeEventListener("touchstart", this._onImageTouchStart, false);
		this.detachObservers();
	}

	_onImagePointerDown = (x, y) => {
		this._lastPointerDown = { x, y };
	};

	_onImageMouseDown = (e) => {
		this._onImagePointerDown(e.clientX, e.clientY);
	};

	_onImageTouchStart = (e) => {
		const t = e.touches[0];
		this._onImagePointerDown(t.clientX, t.clientY);
	};

	getZoomLevel = () => {
		return Math.max(
			1,
			Math.min(
				this.state.pageBb.width / (this.state.pageNaturalDimensions.width || this.props.pageEl.width),
				this.state.pageBb.height / (this.state.pageNaturalDimensions.height || this.props.pageEl.height)
			)
		);
	};

	handleCreateNoteClick = (e) => {
		if (
			e.target === this._wrapRef.current &&
			this.props.extraData.did_create &&
			this.props.extraData.selectedNote &&
			this.state.pageBb &&
			this._lastPointerDown &&
			e.clientX === this._lastPointerDown.x &&
			e.clientY === this._lastPointerDown.y
		) {
			delete this._lastPointerDown;
			const pageBb = this.state.pageBb;
			const zoom = this.getZoomLevel();
			const widthPx = DEFAULT_WIDTH * zoom;
			const heightPx = DEFAULT_HEIGHT * zoom;
			const leftPx = Math.max(pageBb.left, Math.min(pageBb.left + pageBb.width - widthPx, e.clientX));
			const topPx = Math.max(pageBb.top, Math.min(pageBb.top + pageBb.height - heightPx, e.clientY));

			const width = (widthPx / pageBb.width) * 100;
			const height = (heightPx / pageBb.height) * 100;
			const top = (topPx - pageBb.top) / pageBb.height;
			const left = (leftPx - pageBb.left) / pageBb.width;
			this.props.extraData.handleNoteClick(width, height, left * 100, top * 100);
		}
	};

	render() {
		const pageBb = this.state.pageBb;
		if (!pageBb || !this.state.pageNaturalDimensions) {
			return null;
		}
		const page_data = this.props.extraData;
		const rotateDegree = page_data.rotateDegree;
		const highlighterInfo = page_data.highlightPageInfo ? page_data.highlightPageInfo : [];
		const zoomLevel = this.getZoomLevel();
		const isCanvasEl = this.props.pageEl && this.props.pageEl.tagName === "CANVAS";
		return (
			<div
				style={{
					position: "absolute",
					top: isCanvasEl ? 0 : pageBb.top + "px",
					left: isCanvasEl ? 0 : pageBb.left + "px",
					width: pageBb.width + "px",
					height: pageBb.height + "px",
					zIndex: 0,
					pointerEvents: page_data.did_create && (page_data.selectedNote || page_data.selectedHighlight) ? "auto" : "none",
				}}
				ref={this._wrapRef}
				onClick={this.handleCreateNoteClick}
			>
				{page_data.isNoteDisplay && (
					<NoteManager
						key="noteManager"
						notes={page_data.notes}
						onContentChange={page_data.handleNoteContentChange}
						handleNoteClose={page_data.handleNoteClose}
						onMoveOrResize={page_data.handleNoteOnMoveOrResize}
						onResize={this.handleNoteResize}
						onMove={this.handleNoteOnMove}
						teacher={page_data.teacher}
						did_create={page_data.did_create}
						wrapWidth={pageBb.width}
						wrapHeight={pageBb.height}
						recentlyCreatedNoteId={page_data.recentlyCreatedNoteId}
						selectedNoteOid={page_data.selectedNoteOid}
						handleNoteSelection={page_data.handleNoteSelection}
						hideContent={false}
						disabled={!page_data.selectedNote}
						rotateDegree={rotateDegree}
						zoomLevel={zoomLevel}
					/>
				)}
				{page_data.did_create && page_data.selectedHighlight && page_data.selectedHighlight.value != "Delete" ? (
					<HighlightDrawer
						key={"key_HighlightDrawer"}
						onHighlightDraw={page_data.onHighlightDraw}
						bgColour={page_data.selectedHighlight.colour}
						imageBb={pageBb}
						imageElement={this.props.pageEl}
						rotateDegree={rotateDegree}
					/>
				) : (
					""
				)}

				{page_data.highlights.length ? (
					<>
						<ExtractPageHighlighterInfo highlighterInfo={highlighterInfo} rotateDegree={rotateDegree} zoomLevel={zoomLevel} />
						<HighlightManger
							highlights={page_data.highlights}
							wrapWidth={pageBb.width}
							wrapHeight={pageBb.height}
							handleHiglightDelete={page_data.handleHiglightDelete}
							selectedHighlight={page_data.selectedHighlight}
							rotateDegree={rotateDegree}
						/>
					</>
				) : (
					""
				)}
			</div>
		);
	}
}
