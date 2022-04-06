import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const Li = styled.li`
	display: block;
	margin-bottom: 0.7em;
`;

const Label = styled.label`
	display: flex;
	${(p) =>
		p.disabled &&
		css`
			pointer-events: none;
			opacity: 0.3;
		`}
`;

const Input = styled.input`
	margin-top: 0;
	flex-shrink: 0;
	display: none;
`;

const FakeInput = styled.div`
	border: 0.0625em solid ${theme.colours.white};
	width: 1em;
	height: 1em;
	flex-shrink: 0;
	box-sizing: border-box;
	margin-right: 0.4em;
	border-radius: 0.1em;
	position: relative;

	${(p) =>
		p.selected &&
		css`
			border: 0.0625em solid ${theme.colours.white};
			&:before {
				display: block;
				content: "";
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background: ${theme.colours.white};
				opacity: 0.3;
			}
			${(p) =>
				p.isradio &&
				css`
					border-radius: 50%;
					&:before {
						display: block;
						content: "";
						width: 50%;
						height: 50%;
						background: transparent;
						border-radius: 50%;
					}
				`}
		`}
	${(p) =>
		p.isradio &&
		css`
			border-radius: 50%;
		`}
`;

const IconWrap = styled.div`
	position: absolute;
	top: -0.05em;
	left: -0.09em;
	background-color: ${theme.colours.white};
	border-radius: 0.1em;
	width: 1em;
	height: 1em;

	${(p) =>
		p.isradio &&
		css`
			position: absolute;
			top: 0.12em;
			left: 0.15em;
			background-color: ${theme.colours.white};
			border-radius: 0.1em;
			width: 0.57em;
			height: 0.57em;
			border-radius: 50%;
			@media screen and (max-width: ${theme.breakpoints.mobile}) {
				top: 0.16em;
				left: 0.17em;
			}
		`}
`;

const Span = styled.span`
	${(p) =>
		p.selected &&
		css`
			color: ${theme.colours.white};
		`}
`;

/**
 * Checkbox component
 */
export default class CheckBox extends React.PureComponent {
	doChange = (e) => {
		this.props.onChange(this.props.value, !!e.currentTarget.checked, this.props.exclusive || false);
	};

	render() {
		const props = this.props;
		//For get the check box value for thirdlevel subjects data without li tag
		const isLabel = props.isLabel || false;
		const isDisable = props.isDisable || false;
		const isradio = props.isRadioButton || false; //if `true` than apply radio button style

		return isLabel ? (
			<Label disabled={isDisable}>
				<Input type="checkbox" onChange={this.doChange} checked={props.checked || false} disabled={isDisable} />
				<FakeInput selected={props.checked} isradio={isradio}>
					{props.checked && <IconWrap isradio={isradio}></IconWrap>}
				</FakeInput>
				<Span selected={props.checked}>{props.children}</Span>
			</Label>
		) : (
			<Li>
				<Label disabled={isDisable}>
					<Input type="checkbox" onChange={this.doChange} checked={props.checked || false} disabled={isDisable} />
					<FakeInput selected={props.checked} isradio={isradio}>
						{props.checked && <IconWrap isradio={isradio}></IconWrap>}
					</FakeInput>
					<Span selected={props.checked}>{props.children}</Span>
				</Label>
			</Li>
		);
	}
}
