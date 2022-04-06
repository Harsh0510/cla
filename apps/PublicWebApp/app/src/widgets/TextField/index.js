import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import validationType from "../../common/validationType";
const emailIsValid = require("../../common/emailIsValid");
const numberIsValid = require("../../common/numberIsValid");
import { matchRegEx, checkStringLength } from "../../common/inputStringIsValid";
import errorType from "../../common/errorType";

const FormInput = styled.div`
	width: 100%;
	padding-top: 0.5em;
	padding-bottom: 0.5em;

	label {
		display: block;
		margin: 0;
	}

	input {
		width: ${(p) => (p.inputWidth ? p.inputWidth : "100%")};
		margin: 0;
		background-color: white;
		border-radius: 0;
		border: 0;
		padding: 0.6254em;
		color: ${theme.colours.primary};
		border: ${(p) => (p.isError === true ? "2px solid red" : "0")};

		@media screen and (max-width: ${theme.breakpoints.mobile}) {
			width: 100%;
		}
	}
`;

const BorderStyled = {
	border: `2px solid ${theme.colours.invalidBorder}`,
	color: theme.colours.invalidBorder,
};

const Input = styled.input`
	${(props) =>
		props.readOnly &&
		css`
			opacity: 0.6;
			cursor: default;
			pointer-events: none;
		`};
`;

export default class TextField extends React.PureComponent {
	el = React.createRef();

	onChange = (e) => {
		const valid = this.fieldIsValid(e.target);
		if (this.props.onChange) {
			this.props.onChange(e.target.name, e.target.value, valid);
		}
	};

	onBlur = (e) => {
		const valid = this.fieldIsValid(e.target);
		if (this.props.onBlur) {
			this.props.onBlur(e.target.name, e.target.value, valid);
		}
	};

	onKeyUp = (e) => {
		const valid = this.fieldIsValid(e.target);
		if (this.props.onKeyUp) {
			this.props.onKeyUp(e.target.name, e.target.value, valid);
		}
	};

	fieldIsValid = (field) => {
		let isValid = null;
		let result = { isValid: true, message: "" };
		let isRequired = this.props.isRequired || false;
		let raw = field.value;
		let fieldName = field.name;
		let fieldTitle = this.props.title;
		switch (this.props.validationType) {
			case validationType.email:
				isValid = raw ? emailIsValid(raw) : isRequired ? false : true;
				result = { isValid: isValid, errorType: errorType.validation, message: "" };
				break;
			case validationType.string:
				if (typeof this.props.validator === "function") {
					let errorType = this.props.validator(raw);
					result.isValid = errorType !== null ? false : true;
					result.message = "";
					result.errorType = errorType;
				} else if (raw) {
					if (this.props.patterns && raw) {
						result = matchRegEx(raw, this.props.patterns);
						if (result.isValid) {
							result = checkStringLength(raw, this.props.minLength, this.props.maxLength);
							result.errorType = !result.isValid ? errorType.length : "";
						} else {
							result.errorType = errorType.validation;
						}
					} else {
						result = checkStringLength(raw, this.props.minLength, this.props.maxLength);
						result.errorType = !result.isValid ? errorType.length : "";
					}
				} else {
					isValid = raw ? result.isValid : isRequired ? false : true;
					result = { isValid: isValid, errorType: "", message: "" };
					if (!isValid) {
						result.errorType = errorType.required;
						result.message = fieldTitle + " is required.";
					}
				}
				break;
			case validationType.number:
				const minValue = this.props.minValue || null;
				const maxValue = this.props.maxValue || null;
				if (raw) {
					result = numberIsValid(raw, minValue, maxValue, fieldTitle);
					result.errorType = errorType.validation;
				} else {
					isValid = isRequired ? false : true;
					result = { isValid: isValid, errorType: "", message: "" };
					if (!isValid) {
						result.errorType = errorType.required;
						result.message = fieldTitle + " is required.";
					}
				}
				break;
		}
		return result;
	};

	isValid = (_) => {
		const result = this.fieldIsValid(this.el.current);
		return result.isValid;
	};

	render() {
		const {
			name,
			title,
			value,
			validationType,
			placeHolder,
			isRequired = false,
			isValid = true,
			inputWidth = "100%",
			inputType = "text",
			isReadonly = false,
			autoComplete = "off",
		} = this.props;
		return (
			<>
				<FormInput inputWidth={inputWidth}>
					<label htmlFor={name}>{title}</label>
					<Input
						ref={this.el}
						type={inputType}
						name={name}
						placeholder={placeHolder}
						value={value}
						onChange={this.onChange}
						onBlur={this.onBlur}
						style={isValid ? {} : BorderStyled}
						maxLength={this.props.maxLength}
						minLength={this.props.minLength}
						readOnly={isReadonly}
						onKeyUp={this.onKeyUp}
						autoComplete={autoComplete}
						disabled={this.props.disabled}
					/>
				</FormInput>
			</>
		);
	}
}
