import React from "react";
import styled, { css } from "styled-components";
import ContentEditable from "react-contenteditable";
import Resizer from "../../widgets/Resizer";
import date from "../../common/date";
import theme from "../../common/theme";
import getExtractPosition from "../../common/getExtractPosition";
import reactCreateRef from "../../common/reactCreateRef";

/*
 * We want the font size to be smaller when you zoom out, but not too small.
 * So we scale the font based on the sqrt of the zoom level.
 * 50% zoom means ~71% font size, which is about right.
 */
const getZoomScale = (zoom) => Math.sqrt(Math.max(zoom, 0.1));

const WrapInner = styled.div`
	width: 100%;
	height: calc(100% - ${(p) => (p.zoomLevel * 1.125 + 0.625).toString() + "em"});
	overflow: auto;
	margin-top: 15px;
`;

const StyledContentEditable = styled(ContentEditable)`
	outline: none;
	text-align: left;
	font-size: ${(p) => (getZoomScale(p.zoomLevel) * 1.09375).toString() + "em"};
	line-height: 1.2;
	${(p) =>
		p.disabled &&
		css`
			pointer-events: none;
			cursor: pointer;
		`};
`;

const Subtitle = styled.div`
	position: absolute;
	bottom: 3px;
	font-size: ${(p) => (getZoomScale(p.zoomLevel) * 0.78125).toString() + "em"};
	pointer-events: auto;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	left: 10px;
	right: 10px;
	cursor: default;
`;

const CloseButton = styled.div`
	position: absolute;
	top: 10px;
	right: 12px;
	width: 1.5em;
	height: 1.5em;
	cursor: pointer;
	text-align: right;
	${(p) =>
		p.disabled &&
		css`
			opacity: 0.3;
			pointer-events: none;
			cursor: pointer;
		`}
`;

/**
 * @typedef Props
 * @prop {string} oid OID of the note (saved from database)
 * @prop {any} user_data Custom data passed from above (e.g. this note's index into an array)
 * @prop {number} width
 * @prop {number} height
 * @prop {string} content
 * @prop {string} subtitle
 * @prop {string} color
 * @prop {(userData: any) => void} onClick
 * @prop {(userData: any, content: string) => void} onContentChange
 * @prop {(userData: any, width: number, height: number) => void} onMoveOrResize
 * @prop {(userData: any) => void} onClose
 * @prop {(userData: any, x: number, y: number) => void} onMove
 */

/**
 * @extends {React.PureComponent<Props, {}>}
 */
const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
const makeEventOptions = isIE11 ? () => false : (opts) => opts;

class Note extends React.PureComponent {
	_noteCloseRef = reactCreateRef();
	_contentEditable = reactCreateRef();
	_eventOptions = makeEventOptions({
		capture: false,
		passive: false,
	});
	state = {
		position: null,
	};

	componentDidMount() {
		this.updateState();
	}

	updateState = () => {
		const { width, height, left, top } = this.props;
		const notePosition = this.getNotePosition(width, height, left, top);
		this.setState({
			notePosition: notePosition,
		});
	};

	componentDidUpdate(prevProps) {
		if (this.props !== prevProps) {
			this.updateState();
		}
	}

	isDisabled() {
		return this.props.disabled || !this.props.did_create || this.props.hideContent;
	}

	onChange = (e) => {
		if (!this.isDisabled()) {
			if (e.target.value !== this.props.content) {
				this.props.onContentChange(this.props.oid, e.target.value);
			}
		}
	};

	handleOnClose = (e) => {
		if (!this.isDisabled()) {
			this.props.handleNoteClose(e, this.props.oid);
		}
	};

	onMoveOrResize = (width, height, left, top) => {
		this.props.handleNoteSelection(this.props.oid);
		if (!this.isDisabled()) {
			const newposition = getExtractPosition(left, top, width, height, this.props.wrapWidth, this.props.wrapHeight);
			this.setState({ position: newposition });
			this.props.onMoveOrResize(this.props.oid, newposition.width, newposition.height, newposition.left, newposition.top);
		}
	};

	//handle selection of current click note
	handleOnClick = (e) => {
		e.preventDefault();
		this.props.handleNoteSelection(this.props.oid);
	};

	handleDoubleClick = (e) => {
		e.preventDefault();
		this.focusContentText();
	};

	//focus to content editable area
	focusContentText = () => {
		this._contentEditable.current.focus();
	};

	getNotePosition = () => {
		const { wrapWidth, wrapHeight, width, height, left, top, rotateDegree = 0, did_create, zindex } = this.props;
		let cal_left = left;
		let cal_top = top;
		let cal_width = width;
		let cal_height = height;
		const notePosition = {};
		notePosition.style = {};
		let dimension = did_create ? "px" : "%";
		notePosition.style.position = "absolute";
		notePosition.style.zIndex = zindex;
		notePosition.style.pointerEvents = this.isDisabled() ? "none" : "auto";

		if (did_create) {
			//get in px for resizing it
			cal_left = (left * wrapWidth) / 100;
			cal_top = (top * wrapHeight) / 100;
			cal_width = (width * wrapWidth) / 100;
			cal_height = (height * wrapHeight) / 100;
		}
		if (rotateDegree === 0) {
			notePosition.width = cal_width;
			notePosition.height = cal_height;
			notePosition.top = cal_top;
			notePosition.left = cal_left;
			notePosition.style.top = cal_top + dimension;
			notePosition.style.left = cal_left + dimension;
		} else if (rotateDegree === 90 || rotateDegree === -270) {
			dimension = "px";
			cal_left = (left * wrapHeight) / 100;
			cal_top = (top * wrapWidth) / 100;
			cal_width = (height * wrapWidth) / 100;
			cal_height = (width * wrapHeight) / 100;
			notePosition.right = cal_top;
			notePosition.top = cal_left;
			notePosition.style.right = cal_top + dimension;
			notePosition.style.top = cal_left + dimension;
		} else if (rotateDegree === 180 || rotateDegree === -180) {
			notePosition.bottom = cal_top;
			notePosition.right = cal_left;
			notePosition.style.bottom = cal_top + dimension;
			notePosition.style.right = cal_left + dimension;
		} else if (rotateDegree === 270 || rotateDegree === -90) {
			dimension = "px";
			cal_top = (left * wrapHeight) / 100;
			cal_left = (top * wrapWidth) / 100;
			cal_width = (height * wrapWidth) / 100;
			cal_height = (width * wrapHeight) / 100;
			notePosition.right = cal_left;
			notePosition.top = cal_top;
			notePosition.style.bottom = cal_top + dimension;
			notePosition.style.left = cal_left + dimension;
		}
		notePosition.width = cal_width;
		notePosition.height = cal_height;
		notePosition.style.width = cal_width + dimension;
		notePosition.style.height = cal_height + dimension;
		return notePosition;
	};

	render() {
		const {
			teacher,
			did_create,
			date_created,
			zindex,
			isSelected,
			colour,
			width,
			height,
			left,
			top,
			content,
			rotateDegree,
			zoomLevel = 0,
		} = this.props;
		const notePosition = this.getNotePosition();
		const isDisabled = this.isDisabled();
		const subtitleText = `${teacher} ${date.sqlToNiceDateTimeFormat(date_created)}`;
		return (
			<Resizer
				key={"resizer" + this.props.oid}
				onMoveOrResize={this.onMoveOrResize}
				disabled={isDisabled}
				isSelected={isSelected}
				wrapHeight={this.props.wrapHeight}
				wrapWidth={this.props.wrapWidth}
				onPointerDown={this.props.handleNoteSelection}
				oid={this.props.oid}
				rotateDegree={this.props.rotateDegree}
				notePosition={notePosition}
			>
				<div
					style={{
						width: "100%",
						height: "100%",
						backgroundColor: colour,
						overflow: "auto",
						padding: "10px",
						border: `1px solid ${theme.colours.darkGray}`,
						pointerEvents: this.props.hideContent ? "none" : "auto",
					}}
					onClick={this.handleOnClick}
					onDoubleClick={this.handleDoubleClick}
					id={"note_information_" + this.props.oid}
				>
					<div>
						<CloseButton onClick={this.handleOnClose} disabled={isDisabled} data-type="right_close_button" ref={this._noteCloseRef}>
							<i className="fa fa-times" aria-hidden="true"></i>
						</CloseButton>
					</div>
					{!this.props.hideContent && (
						<>
							<WrapInner zoomLevel={zoomLevel}>
								<StyledContentEditable
									onChange={this.onChange}
									html={content}
									placeholder={!content ? "Enter your note" : ""}
									disabled={isDisabled}
									id={"content_" + this.props.oid}
									innerRef={this._contentEditable}
									tabIndex="0"
									zoomLevel={zoomLevel}
								/>
							</WrapInner>
							<Subtitle title={subtitleText} zoomLevel={zoomLevel}>
								{subtitleText}
							</Subtitle>
						</>
					)}
				</div>
			</Resizer>
		);
	}
}

export default Note;
