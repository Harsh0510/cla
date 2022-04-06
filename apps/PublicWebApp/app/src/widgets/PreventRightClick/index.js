import React from "react";
import styled, { css } from "styled-components";

const Wrapper = styled.div`
	position: relative;
	z-index: 1;
`;

const Image = styled.div`
	z-index: -1;
	:hover {
		cursor: pointer;
		${(props) =>
			props.isCursorAuto &&
			css`
				cursor: auto;
			`};
	}
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

export default class PreventRightClick extends React.PureComponent {
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
