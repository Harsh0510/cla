import React from "react";
import OnTop from "../OnTop";

const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
const makeEventOptions = isIE11 ? () => false : (opts) => opts;
const eventOptions = makeEventOptions({
	capture: false,
	passive: false,
});
export default class HighlightDrawer extends React.PureComponent {
	_pointerStartPosition = null;
	state = {
		width: 0,
		height: 0,
		left: 0,
		top: 0,
	};
	_onPointerUp = () => {
		if (this._pointerStartPosition && this.state.width > 0 && this.state.height > 0) {
			this._pointerStartPosition = null;
			const bb = this.props.imageBb;
			const left = (this.state.left - bb.left) / bb.width;
			const top = (this.state.top - bb.top) / bb.height;
			const width = this.state.width / bb.width;
			const height = this.state.height / bb.height;
			this.setState(
				{
					width: 0,
					height: 0,
					left: 0,
					top: 0,
				},
				() => {
					this.props.onHighlightDraw(left * 100, top * 100, width * 100, height * 100);
				}
			);
		} else {
			this._pointerStartPosition = null;
		}
	};

	_onPointerMove = (clientX, clientY) => {
		if (this._pointerStartPosition) {
			const bb = this.props.imageBb;
			const startX = Math.min(bb.right, Math.max(bb.left, this._pointerStartPosition.x));
			const startY = Math.min(bb.bottom, Math.max(bb.top, this._pointerStartPosition.y));

			clientX = Math.min(bb.right, Math.max(bb.left, clientX));
			clientY = Math.min(bb.bottom, Math.max(bb.top, clientY));

			const newLeft = Math.min(startX, clientX);
			const newWidth = Math.abs(clientX - startX);
			const newTop = Math.min(startY, clientY);
			const newHeight = Math.abs(clientY - startY);

			this.setState({ width: newWidth, height: newHeight, left: newLeft, top: newTop });
		}
	};

	onMouseMove = (e) => {
		this._onPointerMove(e.clientX, e.clientY);
	};
	onTouchMove = (e) => {
		const touch = e.touches[0];
		this._onPointerMove(touch.clientX, touch.clientY);
	};
	onPointerDown = (clientX, clientY) => {
		this._pointerStartPosition = {
			x: clientX,
			y: clientY,
		};
	};
	_onMouseDown = (e) => {
		e.preventDefault();
		e.stopPropagation();
		this.onPointerDown(e.clientX, e.clientY);
	};
	_onPointerDown = (e) => {
		e.preventDefault();
		e.stopPropagation();
		const touch = e.touches[0];
		this.onPointerDown(touch.clientX, touch.clientY);
	};
	componentDidMount() {
		document.addEventListener("mouseup", this._onPointerUp, eventOptions);
		document.addEventListener("touchend", this._onPointerUp, eventOptions);
		document.addEventListener("mousemove", this.onMouseMove, eventOptions);
		document.addEventListener("touchmove", this.onTouchMove, eventOptions);
	}
	componentWillUnmount() {
		document.removeEventListener("mouseup", this._onPointerUp, eventOptions);
		document.removeEventListener("touchend", this._onPointerUp, eventOptions);
		document.removeEventListener("mousemove", this.onMouseMove, eventOptions);
		document.removeEventListener("touchmove", this.onTouchMove, eventOptions);
	}
	render() {
		const { width, height, top, left } = this.state;
		return (
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
				}}
				onMouseDown={this._onMouseDown}
				onTouchStart={this._onPointerDown}
			>
				{width && height ? (
					<div
						style={{
							position: "fixed",
							opacity: 0.5,
							backgroundColor: this.props.bgColour,
							top: top,
							left: left,
							width: width,
							height: height,
						}}
					/>
				) : null}
			</div>
		);
	}
}
