/**
 * Toogle Switch
 */
import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";

/* The switch - the box around the slider */
const Switch = styled.label`
	position: relative;
	display: inline-block;
	width: 2.75em;
	height: 1.5em;
	margin-bottom: 0;
`;

/* Hide default HTML checkbox */
const Input = styled.input`
	opacity: 0;
	width: 0;
	height: 0;
	:checked {
		background-color: ${theme.colours.bgCheckbox};
	}
	:focus {
		box-shadow: 0 0 1px #2196f3;
	}
	${(p) =>
		p.checked &&
		css`
			transform: translateX(1em);
		`}
`;

const Slider = styled.span`
	position: absolute;
	cursor: pointer;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: ${theme.colours.bgToggleSwitch};
	transition: 0.4s;
	border-radius: 34px;

	:before {
		position: absolute;
		content: "";
		height: 1em;
		width: 1em;
		left: 6px;
		bottom: 4px;
		background-color: white;
		transition: 0.4s;
	}
	:before {
		border-radius: 50%;
		${(p) =>
			p.checked &&
			css`
				transform: translateX(1em);
				background-color: white;
			`}
	}
`;

export default class ToggleSwitch extends React.PureComponent {
	doChange = (e) => {
		if (this.props.onChange) {
			this.props.onChange(!!e.currentTarget.checked);
		}
	};

	render() {
		const { value = false } = this.props;
		return (
			<>
				<Switch>
					<Input type="checkbox" onChange={this.doChange} checked={value} />
					<Slider checked={value}></Slider>
				</Switch>
			</>
		);
	}
}
