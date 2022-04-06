import React from "react";
import styled from "styled-components";
import WhiteOutContext from "./WhiteOutContext";

const WhiteOut = styled.div`
	position: fixed;
	background: rgba(255, 255, 255, 0.8);
	z-index: 100;
	transition: opacity 200ms;
	${(p) => {
		if (p.is_visible) {
			return `
					opacity:1;
				`;
		} else {
			return `
					opacity:0;
					pointer-events: none;
				`;
		}
	}}
`;

export default class WhiteOutProvider extends React.PureComponent {
	state = {
		current_bounding_box: null,
		is_visible: false,
		highlight_gutter: 0,
	};

	updateBoundingBox = (bb, isVisible, highlight_gutter = 0) => {
		if (this._timeout) {
			clearTimeout(this._timeout);
		}
		if (this.state.is_visible !== isVisible) {
			if ((!this.state.current_bounding_box && bb) || (this.state.current_bounding_box && !bb)) {
				this.setState({
					current_bounding_box: bb,
				});
			}
			this._timeout = setTimeout(() => {
				this.setState({
					current_bounding_box: bb,
					is_visible: isVisible,
					highlight_gutter: highlight_gutter,
				});
			}, 75);
		} else {
			this.setState({
				current_bounding_box: bb,
				highlight_gutter: highlight_gutter,
			});
		}
	};

	render() {
		const whiteoutDivs = [];
		if (this.state.current_bounding_box) {
			const deets = this.state.current_bounding_box;
			const highlight_gutter = this.state.highlight_gutter || 0;

			whiteoutDivs.push(
				// left
				<WhiteOut
					style={{ left: 0, width: deets.bb.left - highlight_gutter + "px", top: 0, bottom: 0 }}
					is_visible={this.state.is_visible}
					key={"a"}
				/>,

				// right
				<WhiteOut
					style={{ left: deets.bb.right + highlight_gutter + "px", right: 0, top: 0, bottom: 0 }}
					is_visible={this.state.is_visible}
					key={"b"}
				/>,

				// bottom
				<WhiteOut
					style={{
						left: deets.bb.left - highlight_gutter + "px",
						width: deets.bb.width + highlight_gutter + highlight_gutter + "px",
						top: deets.bb.bottom + highlight_gutter + "px",
						bottom: 0,
					}}
					is_visible={this.state.is_visible}
					key={"c"}
				/>,

				// top
				<WhiteOut
					style={{
						left: deets.bb.left - highlight_gutter + "px",
						width: deets.bb.width + highlight_gutter + highlight_gutter + "px",
						top: 0,
						height: deets.bb.top - highlight_gutter + "px",
						display: deets.bb.top > highlight_gutter ? "block" : "none",
					}}
					is_visible={this.state.is_visible}
					key={"d"}
				/>
			);
		} else {
			whiteoutDivs.push(
				<WhiteOut
					style={{
						width: "100%",
						height: "100%",
						top: "0",
						left: "0",
					}}
					is_visible={this.state.is_visible}
					key={"aa"}
				/>,
				<WhiteOut
					style={{
						width: "100%",
						height: "100%",
						top: "0",
						left: "0",
						display: "none",
					}}
					is_visible={this.state.is_visible}
					key={"bb"}
				/>,
				<WhiteOut
					style={{
						width: "100%",
						height: "100%",
						top: "0",
						left: "0",
						display: "none",
					}}
					is_visible={this.state.is_visible}
					key={"cc"}
				/>,
				<WhiteOut
					style={{
						width: "100%",
						height: "100%",
						top: "0",
						left: "0",
						display: "none",
					}}
					is_visible={this.state.is_visible}
					key={"dd"}
				/>
			);
		}
		return (
			<WhiteOutContext.Provider
				value={{
					updateBoundingBox: this.updateBoundingBox,
				}}
			>
				{this.props.children}
				{whiteoutDivs}
			</WhiteOutContext.Provider>
		);
	}
}
