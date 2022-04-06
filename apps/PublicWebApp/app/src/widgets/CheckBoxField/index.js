import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import CheckBox from "./CheckBox";
import errorType from "../../common/errorType";

const BorderStyled = {
	border: `2px solid ${theme.colours.invalidBorder}`,
	color: theme.colours.invalidBorder,
};

const WrapperAgreeSection = styled.div`
	padding: ${(p) => (p.isValid ? "1em 0 0 0" : "1em 1em 0 1em")};
	display: inline-flex;
`;

const Label = styled.label`
	color: ${theme.colours.black};
	a {
		color: ${theme.colours.anchorLinkTextColor};
		text-decoration: underline;
	}
	${(p) =>
		p.link == true &&
		css`
			font-size: 0.9em;
			margin-top: 16px;
			@media (min-width: ${theme.breakpoints.desktop2}) {
				margin-left: 0px;
				margin-top: 16px;
			}
			@media screen and (min-width: ${theme.breakpoints.mobileLarge}) and (max-width: 1050px) {
				margin-left: 27px;
				margin-top: -1rem;
			}
			@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
				margin-left: 0px;
				margin-top: 16px;
			}
			@media screen and (max-width: ${theme.breakpoints.mobile6}) {
				margin-left: 27px;
				margin-top: -1rem;
			}
		`}
`;

export default class CheckBoxField extends React.PureComponent {
	el = React.createRef();

	onChange = (value) => {
		const valid = this.fieldIsValid(value);
		if (this.props.onChange) {
			this.props.onChange(this.props.name, value, valid);
		}
	};

	onBlur = (value) => {
		const valid = this.fieldIsValid(value);
		if (this.props.onChange) {
			this.props.onChange(this.props.name, value, valid);
		}
	};

	fieldIsValid = (field) => {
		let returnValue = true;
		let fieldTitle = this.props.title;
		let isRequired = this.props.isRequired || false;
		returnValue = field ? true : isRequired ? false : true;
		let result = {
			isValid: returnValue,
			errorType: !returnValue ? errorType.required : "",
			message: !returnValue ? fieldTitle + " is required." : "",
		};
		return result;
	};

	isValid() {
		let field = this.props.checked;
		let returnValue = true;
		let isRequired = this.props.isRequired || false;
		returnValue = field ? true : isRequired ? false : true;
		return returnValue;
	}

	render() {
		const { name, title, extraText, checked, readOnly, isValid, disabled, gaAttribute } = this.props;
		return (
			<>
				<WrapperAgreeSection isValid={isValid} style={isValid ? {} : BorderStyled} className="checkbox">
					<Label htmlFor={name}>
						<CheckBox
							name={name}
							onChange={this.onChange}
							onBlur={this.onBlur}
							checked={checked}
							value={checked}
							isDisabled={disabled || false}
							extraText={extraText}
							readOnly={readOnly}
							gaAttribute={gaAttribute}
						>
							{title}
						</CheckBox>
					</Label>
				</WrapperAgreeSection>
			</>
		);
	}
}
