import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";

const Switch = styled.label`
	position: relative;
	display: inline-block;
	width: 3.75em;
	height: 1.6em;
	margin-bottom: 0;

	input {
		opacity: 0;
		width: 0;
		height: 0;
	}
`;

const Slider = styled.span`
	position: absolute;
	cursor: pointer;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: ${theme.colours.bgToggleSwitch};
	-webkit-transition: 0.4s;
	transition: 0.4s;
	border-radius: 34px;

	:before {
		position: absolute;
		content: "";
		height: 1.125em;
		width: 1.125em;
		left: 0.25em;
		bottom: 0.25em;
		background-color: ${theme.colours.white};
		-webkit-transition: 0.4s;
		transition: 0.4s;
		border-radius: 50%;
	}

	${(p) =>
		p.checked === false &&
		css`
			:before {
				-webkit-transform: translateX(1.625em);
				-ms-transform: translateX(1.625em);
				transform: translateX(1.625em);
			}
		`}
`;

const Input = styled.input`
	:focus .slider {
		box-shadow: 0 0 0.07em #2196f3;
	}
`;

export default class SwitchButton extends React.PureComponent {
	doChange = (e) => {
		this.props.onChange(this.props.value, !!e.currentTarget.checked, this.props.exclusive || false);
	};

	render() {
		const props = this.props;
		//For get the check box value for thirdlevel subjects data without li tag
		return (
			<Switch className="switch">
				<Input type="checkbox" checked={props.checked || false} onChange={this.doChange} />
				<Slider className="slider" checked={props.checked || false}></Slider>
			</Switch>
		);
	}
}
