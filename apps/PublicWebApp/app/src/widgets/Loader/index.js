import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";

const border = 10;

const StyledLoader = styled.div`
	height: 100%;
	min-height: 400px;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;

	${(p) =>
		p.full &&
		css`
			height: 100vh;
			width: 100vw;
		`}
`;

const Spinner = styled.div`
	display: block;
	border: ${border}px solid ${theme.colours.cla};
	width: ${9 * border}px;
	height: ${9 * border}px;
	border-radius: 50%;
	position: relative;
	border-right-color: transparent;
	animation: clockwise 1s linear infinite;

	&:after {
		position: absolute;
		display: block;
		content: "";
		border: ${border}px solid ${theme.colours.cla};
		border-right-color: transparent;
		width: ${4.8 * border}px;
		height: ${4.8 * border}px;
		border-radius: 50%;
		top: ${1.1 * border}px;
		left: ${1.1 * border}px;
		animation: anti-clockwise 1s linear infinite;
	}

	@keyframes clockwise {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes anti-clockwise {
		to {
			transform: rotate(-360deg);
		}
	}
`;

const Loader = (props) => (
	<StyledLoader full={props.full}>
		<Spinner />
	</StyledLoader>
);

export default Loader;
