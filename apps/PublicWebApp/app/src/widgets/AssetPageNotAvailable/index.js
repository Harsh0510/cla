import React from "react";
import theme from "../../common/theme";
import styled, { css } from "styled-components";

const PageNotAvailable = styled.div`
	background-color: ${theme.colours.white};
	color: ${theme.colours.pageNotAvailableTextColor};
	font-size: 3em;
	width: 100%;
	text-align: center;
	height: 100%;
	padding: 1em 0;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 700;
	line-height: 1.2em;
	cursor: auto !important;
	${(p) =>
		p.isPointerEventNone &&
		css`
			pointer-events: none;
		`}
	${(p) =>
		p.fontSize &&
		css`
			font-size: ${p.fontSize};
		`};
	${(p) =>
		p.maxHeight &&
		css`
			max-height: ${p.maxHeight};
		`};
	@media screen and (max-width: ${theme.breakpoints.tablet1}) {
		${(p) =>
			p.maxHeight &&
			css`
				max-height: 80px;
			`};
	}

	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		font-size: 2em;
		${(p) =>
			p.fontSize &&
			css`
				font-size: ${p.fontSize};
			`};
	}
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		font-size: 1.5em;
		${(p) =>
			p.fontSize &&
			css`
				font-size: ${p.fontSize};
			`};
	}
	p {
		margin-bottom: 0;
		cursor: auto !important;
	}
`;
/**Pass font size if you need to fix the fontsize for all view */
export default function AssetPageNotAvailable(props) {
	const { isPointerEventNone = true } = props;
	return (
		<PageNotAvailable
			ref={props.handleRef}
			onClick={props.handleClick}
			fontSize={props.fontSize}
			maxHeight={props.maxHeight}
			data-index={props.dataIndex}
			isPointerEventNone={isPointerEventNone}
		>
			<p>
				PAGE
				<br />
				NOT
				<br />
				AVAILABLE
				<br /> FOR
				<br />
				COPY
			</p>
		</PageNotAvailable>
	);
}
