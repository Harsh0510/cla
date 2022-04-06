import React from "react";
import styled, { css } from "styled-components";

const Wrapper = styled.div`
	position: relative;
	z-index: 1;
	height: 100%;
`;

const Image = styled.div`
	z-index: -1;
	height: 100%;
	display: -webkit-box;
	display: -ms-flexbox;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	flex-direction: column;
`;

const TransparentImage = styled.img`
	position: absolute;
	top: 0;
	left: 0;
	width: 100% !important;
	height: 100% !important;
	pointer-events: none;
	z-index: 1;
`;

export default class PreventRightClickOnPagePreview extends React.PureComponent {
	handleClick(e) {
		e.preventDefault();
		if (e.type === "contextmenu") {
			return false;
		}
		return true;
	}

	render() {
		return (
			<Wrapper onContextMenu={this.handleClick}>
				<Image {...this.props} />
				<TransparentImage src={require("./1x1.png")} />
			</Wrapper>
		);
	}
}
