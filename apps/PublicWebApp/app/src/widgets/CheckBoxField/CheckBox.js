import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const Label = styled.label`
	display: flex;
`;

const Input = styled.input`
	margin-top: 0;
	flex-shrink: 0;
	display: none;
`;

const FakeInput = styled.div`
	border: 2px solid ${theme.colours.primaryLight};
	width: 1.25em;
	height: 1.25em;
	flex-shrink: 0;
	box-sizing: border-box;
	margin-right: 0.4em;
	border-radius: 0.1em;
	position: relative;
	${(p) =>
		p.selected &&
		css`
		border: 2px solid ${theme.colours.primaryLight};
		color:${theme.colours.white},
		&:before {
			display: block;
			content: "";
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: ${theme.colours.primaryLight};
			opacity: 0.3;
		}
	`}
	${(p) =>
		p.disabled &&
		css`
			opacity: 0.3;
		`}
`;

const IconWrap = styled.div`
	height: 1.25em;
	width: 1.25em;
	position: absolute;
	top: -0.12em;
	left: -0.14em;
	color: ${theme.colours.white};
	background-color: ${theme.colours.primaryLight};
	border: 0.1em solid ${theme.colours.primaryLight};
	border-radius: 0.1em;
`;

const Span = styled.div`
	font-size: 0.9em;
	${(p) => p.selected && css``}
`;

/**
 * Checkbox component
 */
export default class CheckBox extends React.PureComponent {
	doChange = (e) => {
		// e.preventDefault();
		this.props.onChange(!!e.currentTarget.checked);
	};

	render() {
		const props = this.props;
		const isDisabled = props.isDisabled || false;
		//For get the check box value for thirdlevel subjects data without li tag
		return (
			<Label {...this.props.gaAttribute}>
				<Input
					type="checkbox"
					onChange={this.doChange}
					checked={props.checked || false}
					name={this.props.name}
					disabled={isDisabled}
					readOnly={props.readOnly}
				/>
				<FakeInput selected={props.checked} disabled={isDisabled}>
					{props.checked && (
						<IconWrap>
							<FontAwesomeIcon icon={faCheck} />
						</IconWrap>
					)}
				</FakeInput>
				<Span selected={props.checked} style={isDisabled ? { opacity: 0.3 } : {}}>
					{props.children}
					{this.props.extraText ? <>{this.props.extraText}</> : ""}
				</Span>
			</Label>
		);
	}
}
