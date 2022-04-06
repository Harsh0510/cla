import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import { matchRegEx, checkStringLength } from "../../common/inputStringIsValid";
import errorType from "../../common/errorType";
import getSingular from "../../common/getSingular";
import reactCreateRef from "../../common/reactCreateRef";

/** Form controls */
const Input = styled.input`
	margin-right: 0;
	margin-left: 0;
	background-color: transparent;
	border-radius: 0px;
	padding: 0.4em;
	line-height: 2;
	padding: 2px 8px;
	min-height: 38px;
	border-color: ${theme.colours.inputBorder};
	::placeholder {
		color: ${theme.colours.primary};
	}
`;

const Error = styled.div`
	margin-bottom: 0.2em;
	color: ${theme.colours.errorTextColor};
	font-size: 0.9em;
	font-weight: bold;
`;

export default class NameInputField extends React.PureComponent {
	el = reactCreateRef();

	constructor(props) {
		super(props);
		this.state = {
			field_error: null,
		};
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(e) {
		e.preventDefault();
		const raw = e.target.value;
		const newState = this.fieldisValid(raw);
		this.setState(newState, () => {
			this.props.doNameInputFieldChange(raw, this.props.name, newState.flag);
		});
	}

	isValid() {
		const value = this.el.current.value;
		const newState = this.fieldisValid(value);
		this.setState(newState, () => {
			this.props.doNameInputFieldChange(value, this.props.name, newState.flag);
		});
		return newState.flag;
	}

	/**
	 * get newState value with flag and message
	 * @param {*} value
	 */
	fieldisValid(value) {
		let result = { isValid: true, errorType: "", message: "" };
		let isRequired = this.props.hasOwnProperty(`isRequired`) ? this.props.isRequired : true;
		let isValid = null;
		let fieldName = this.props.hasOwnProperty(`fieldName`) ? this.props.fieldName : "value";
		let placeHolderText = this.props.hasOwnProperty(`placeholder`) ? this.props.placeholder : "";

		if (value) {
			if (this.props.patterns && value) {
				result = matchRegEx(value, this.props.patterns);
				if (result.isValid) {
					result = checkStringLength(value, this.props.minLength, this.props.maxLength);
					result.errorType = !result.isValid ? errorType.length : "";
				} else {
					result.errorType = errorType.validation;
				}
			} else {
				result = checkStringLength(value, this.props.minLength, this.props.maxLength);
				result.errorType = !result.isValid ? errorType.length : "";
			}
		} else {
			isValid = value ? result.isValid : isRequired ? false : true;
			result = { isValid: isValid, errorType: "", message: "" };
			if (!isValid) {
				result.errorType = errorType.required;
			}
		}

		if (result.errorType === errorType.required) {
			let sigular = getSingular(fieldName.toString());
			result.message = "Please add " + sigular.toLowerCase() + " " + fieldName.toLowerCase() + " in this field.";
		} else if (result.errorType === errorType.validation) {
			let valFieldName = placeHolderText !== "" ? placeHolderText : "This field";
			result.message = valFieldName + " should not contain special characters.";
		} else if (result.errorType === errorType.length) {
			let sigular = getSingular(placeHolderText.toString());
			let valFieldName = placeHolderText !== "" ? sigular + " " + placeHolderText.toLowerCase() : "This field";
			result.message = valFieldName + " must be " + this.props.maxLength + " characters or less.";
		}

		const newState = {
			field_error: null,
			flag: false,
		};
		if (result.isValid) {
			newState.field_error = null;
			newState.flag = true;
		} else {
			newState.field_error = result.message;
			newState.flag = false;
		}
		return newState;
	}

	render() {
		const { name, placeholder, disabled = false, isRequired = true, error = null } = this.props;
		return (
			<>
				<Input
					id={this.props.id}
					type="text"
					ref={this.el}
					name={name}
					placeholder={placeholder}
					value={this.props.value}
					defaultValue={this.props.defaultValue}
					onChange={this.handleChange}
					onBlur={this.handleChange}
					required={isRequired}
					disabled={disabled}
				/>
				{this.state.field_error ? <Error>{this.state.field_error}</Error> : null}
				{error && !this.state.field_error ? <Error>{error}</Error> : null}
			</>
		);
	}
}
