import React from "react";
import styled, { css } from "styled-components";
import reactCreateRef from "../../common/reactCreateRef";

const Wrap = styled.div`
	position: relative;
`;

const Handle = styled.div`
	position: absolute;
	width: 10px;
	height: 10px;
	background: black;
	cursor: pointer;
	user-select: none;
	${(p) =>
		p.disabled &&
		css`
			display: none;
		`};
	${(p) =>
		!p.isSelected &&
		css`
			display: none;
		`};
	${(p) => {
		switch (p["data-type"]) {
			case "top_left": {
				return `top: -5px; left: -5px;`;
			}
			case "top_right": {
				return `top: -5px; right: -5px;`;
			}
			case "bottom_right": {
				return `bottom: -5px; right: -5px;`;
			}
			case "bottom_left": {
				return `bottom: -5px; left: -5px;`;
			}
		}
	}}
`;

const DragBar = styled.div`
	position: absolute;
	height: 20px;
	background: transparent;
	cursor: move;
	user-select: none;
	top: 0px;
	left: 20px;
	right: 26px;
	z-index: 1;
	${(p) =>
		p.disabled &&
		css`
			pointer-events: none;
			cursor: pointer;
		`};
`;

const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
const makeEventOptions = isIE11 ? () => false : (opts) => opts;
export default class Resizer extends React.PureComponent {
	_draggingCorner = null;
	_wrapRef = reactCreateRef();
	_handleTopLeft = reactCreateRef();
	_handleTopRight = reactCreateRef();
	_handleBottomRight = reactCreateRef();
	_handleBottomLeft = reactCreateRef();
	_dragBarRef = reactCreateRef();
	_eventOptions = makeEventOptions({
		capture: false,
		passive: false,
	});
	_fetchHandleFromType(type) {
		let ref;
		switch (type) {
			case "top_left": {
				ref = this._handleTopLeft;
				break;
			}
			case "top_right": {
				ref = this._handleTopRight;
				break;
			}
			case "bottom_right": {
				ref = this._handleBottomRight;
				break;
			}
			case "bottom_left": {
				ref = this._handleBottomLeft;
				break;
			}
		}
		return ref.current;
	}
	_onPointerUp = (e) => {
		e.preventDefault();
		this._draggingCorner = null;
		this._dragStart = null;
	};
	_onPointerMove(clientX, clientY) {
		if (this._draggingCorner && this._wrapRef.current) {
			// We're resizing
			const handleEl = this._fetchHandleFromType(this._draggingCorner);
			const bb = handleEl.getBoundingClientRect();
			let deltaWidth = 0;
			let deltaHeight = 0;
			if (clientX < bb.x) {
				deltaWidth = clientX - bb.x;
			} else if (clientX > bb.x + bb.width) {
				deltaWidth = clientX - (bb.x + bb.width);
			}
			if (clientY < bb.y) {
				deltaHeight = clientY - bb.y;
			} else if (clientY > bb.y + bb.height) {
				deltaHeight = clientY - (bb.y + bb.height);
			}
			let newWidth;
			let newHeight;
			let newLeft;
			let newTop;
			if (this._draggingCorner === "bottom_right") {
				newWidth = this.props.notePosition.width + deltaWidth;
				newHeight = this.props.notePosition.height + deltaHeight;
				newLeft = this.props.notePosition.left;
				newTop = this.props.notePosition.top;
			} else if (this._draggingCorner === "top_left") {
				newWidth = this.props.notePosition.width - deltaWidth;
				newHeight = this.props.notePosition.height - deltaHeight;
				newLeft = this.props.notePosition.left + deltaWidth;
				newTop = this.props.notePosition.top + deltaHeight;
			} else if (this._draggingCorner === "top_right") {
				newWidth = this.props.notePosition.width + deltaWidth;
				newHeight = this.props.notePosition.height - deltaHeight;
				newLeft = this.props.notePosition.left;
				newTop = this.props.notePosition.top + deltaHeight;
			} else if (this._draggingCorner === "bottom_left") {
				newWidth = this.props.notePosition.width - deltaWidth;
				newHeight = this.props.notePosition.height + deltaHeight;
				newLeft = this.props.notePosition.left + deltaWidth;
				newTop = this.props.notePosition.top;
			}
			this.props.onMoveOrResize(newWidth, newHeight, newLeft, newTop);
		} else if (this._dragStart) {
			// We're dragging
			this.props.onMoveOrResize(
				this.props.notePosition.width,
				this.props.notePosition.height,
				this.props.notePosition.left + clientX - this._dragStart.x,
				this.props.notePosition.top + clientY - this._dragStart.y
			);
			this._dragStart.x = clientX;
			this._dragStart.y = clientY;
		}
	}
	onMouseMove = (e) => {
		e.preventDefault();
		this._onPointerMove(e.clientX, e.clientY);
	};
	onTouchMove = (e) => {
		e.preventDefault();
		const touch = e.touches[0];
		this._onPointerMove(touch.clientX, touch.clientY);
	};
	onMoveOrResizeHandlePointerDown = (e) => {
		e.preventDefault();
		this._draggingCorner = e.target.getAttribute("data-type");
		if (typeof this.props.onPointerDown === "function") {
			this.props.onPointerDown(this.props.oid);
		}
	};
	onDragPointerDown(clientX, clientY) {
		this._dragStart = {
			x: clientX,
			y: clientY,
		};
		if (typeof this.props.onPointerDown === "function") {
			this.props.onPointerDown(this.props.oid);
		}
	}
	onDragMouseDown = (e) => {
		e.preventDefault();
		this.onDragPointerDown(e.clientX, e.clientY);
	};
	onDragTouchStart = (e) => {
		e.preventDefault();
		const touch = e.touches[0];
		this.onDragPointerDown(touch.clientX, touch.clientY);
	};
	componentDidMount() {
		if (!this.props.disabled) {
			document.addEventListener("mouseup", this._onPointerUp, this._eventOptions);
			document.addEventListener("touchend", this._onPointerUp, this._eventOptions);
			document.addEventListener("mousemove", this.onMouseMove, this._eventOptions);
			document.addEventListener("touchmove", this.onTouchMove, this._eventOptions);
			// Can't attach event listeners as JSX because React has no way of specifying event options (namely, passive: false)
			this._handleTopLeft.current.addEventListener("mousedown", this.onMoveOrResizeHandlePointerDown, this._eventOptions);
			this._handleTopLeft.current.addEventListener("touchstart", this.onMoveOrResizeHandlePointerDown, this._eventOptions);
			this._handleTopRight.current.addEventListener("mousedown", this.onMoveOrResizeHandlePointerDown, this._eventOptions);
			this._handleTopRight.current.addEventListener("touchstart", this.onMoveOrResizeHandlePointerDown, this._eventOptions);
			this._handleBottomRight.current.addEventListener("mousedown", this.onMoveOrResizeHandlePointerDown, this._eventOptions);
			this._handleBottomRight.current.addEventListener("touchstart", this.onMoveOrResizeHandlePointerDown, this._eventOptions);
			this._handleBottomLeft.current.addEventListener("mousedown", this.onMoveOrResizeHandlePointerDown, this._eventOptions);
			this._handleBottomLeft.current.addEventListener("touchstart", this.onMoveOrResizeHandlePointerDown, this._eventOptions);
			this._dragBarRef.current.addEventListener("mousedown", this.onDragMouseDown, this._eventOptions);
			this._dragBarRef.current.addEventListener("touchstart", this.onDragTouchStart, this._eventOptions);
		}
	}
	componentWillUnmount() {
		if (!this.props.disabled) {
			document.removeEventListener("mouseup", this._onPointerUp, this._eventOptions);
			document.removeEventListener("touchend", this._onPointerUp, this._eventOptions);
			document.removeEventListener("mousemove", this.onMouseMove, this._eventOptions);
			document.removeEventListener("touchmove", this.onTouchMove, this._eventOptions);
			this._handleTopLeft.current.removeEventListener("mousedown", this.onMoveOrResizeHandlePointerDown, this._eventOptions);
			this._handleTopLeft.current.removeEventListener("touchstart", this.onMoveOrResizeHandlePointerDown, this._eventOptions);
			this._handleTopRight.current.removeEventListener("mousedown", this.onMoveOrResizeHandlePointerDown, this._eventOptions);
			this._handleTopRight.current.removeEventListener("touchstart", this.onMoveOrResizeHandlePointerDown, this._eventOptions);
			this._handleBottomRight.current.removeEventListener("mousedown", this.onMoveOrResizeHandlePointerDown, this._eventOptions);
			this._handleBottomRight.current.removeEventListener("touchstart", this.onMoveOrResizeHandlePointerDown, this._eventOptions);
			this._handleBottomLeft.current.removeEventListener("mousedown", this.onMoveOrResizeHandlePointerDown, this._eventOptions);
			this._handleBottomLeft.current.removeEventListener("touchstart", this.onMoveOrResizeHandlePointerDown, this._eventOptions);
			this._dragBarRef.current.removeEventListener("mousedown", this.onDragMouseDown, this._eventOptions);
			this._dragBarRef.current.removeEventListener("touchstart", this.onDragTouchStart, this._eventOptions);
		}
	}

	getPositionBasedOnRotation = () => {
		const { rotateDegree, notePosition } = this.props;
		const position = {
			width: "100%",
			height: "100%",
		};

		if (rotateDegree === 90 || rotateDegree === -270) {
			position.transformOrigin = "bottom left";
			position.transform = `translateY(-100%) rotate(${rotateDegree}deg)`;
			position.width = notePosition.style.height;
			position.height = notePosition.style.width;
		} else if (rotateDegree === 270 || rotateDegree === -90) {
			position.transformOrigin = "right top";
			position.transform = `translateX(-100%) rotate(${rotateDegree}deg)`;
			position.width = notePosition.style.height;
			position.height = notePosition.style.width;
		} else if (rotateDegree === 180 || rotateDegree === -180) {
			position.transform = `rotate(${rotateDegree}deg)`;
		}
		return position;
	};
	render() {
		const { notePosition } = this.props;
		const positionBasedOnRotation = this.getPositionBasedOnRotation();
		return (
			<Wrap style={notePosition.style} ref={this._wrapRef}>
				<div style={positionBasedOnRotation}>
					<DragBar ref={this._dragBarRef} disabled={this.props.disabled} />
					<Handle ref={this._handleTopLeft} data-type="top_left" disabled={this.props.disabled} isSelected={this.props.isSelected} />
					<Handle ref={this._handleTopRight} data-type="top_right" disabled={this.props.disabled} isSelected={this.props.isSelected} />
					<Handle ref={this._handleBottomRight} data-type="bottom_right" disabled={this.props.disabled} isSelected={this.props.isSelected} />
					<Handle ref={this._handleBottomLeft} data-type="bottom_left" disabled={this.props.disabled} isSelected={this.props.isSelected} />
					<DragBar ref={this._dragBarRef} disabled={this.props.disabled} />
					<div style={{ width: "100%", height: "100%" }}>{this.props.children}</div>
				</div>
			</Wrap>
		);
	}
}
