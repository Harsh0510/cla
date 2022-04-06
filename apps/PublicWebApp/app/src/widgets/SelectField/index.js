import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import reactCreateRef from "../../common/reactCreateRef";

const FormInput = styled.div`
	width: 100%;
	padding-top: 0.5em;
	padding-bottom: 0.5em;

	label {
		display: block;
		margin: 0;
	}

	select {
		padding: 0.625em;
		border: 0;
		outline: 0;
		background: ${theme.colours.white};
		appearance: none;
		background-image: url(${require("../../assets/icons/up_down.svg")});
		background-size: 11px;
		background-repeat: no-repeat;
		background-position: right 10px bottom 18px;
		min-height: 25px;
		border-radius: 0;
		border: none;
		color: ${theme.colours.primary};
		width: ${(p) => (p.inputWidth ? p.inputWidth : "100%")};

		::-ms-expand {
			display: none;
		}

		@media screen and (max-width: ${theme.breakpoints.mobile}) {
			width: 100%;
		}
	}
`;

const BorderStyled = {
	border: `2px solid ${theme.colours.invalidBorder}`,
	color: theme.colours.invalidBorder,
};

export default class SelectField extends React.PureComponent {
	el = reactCreateRef();

	onChange = (e) => {
		const valid = this.fieldIsValid(e.target);
		if (this.props.onChange) {
			this.props.onChange(e.target.name, e.target.value, valid);
		}
	};

	onBlur = (e) => {
		const valid = this.fieldIsValid(e.target);
		if (this.props.onChange) {
			this.props.onChange(e.target.name, e.target.value, valid);
		}
	};

	fieldIsValid = (field) => {
		let isValid = null;
		let isRequired = this.props.isRequired || false;
		let raw = field.value;
		isValid = raw ? true : isRequired ? false : true;
		let result = { isValid: isValid, errorType: "", message: "" };
		if (!isValid) {
			result.errorType = errorType.required;
			result.message = "The " + fieldName + " is required.";
		}
		return result;
	};

	isValid() {
		const result = this.fieldIsValid(this.el.current);
		return result.isValid;
	}

	render() {
		const { name, title, value, options, isRequired, isValid, inputWidth = "100%", isDefaultSelectText } = this.props;
		const defaultSelectText = isDefaultSelectText ? "Select" : "Select " + title;
		return (
			<>
				<FormInput inputWidth={inputWidth}>
					<label htmlFor={name}>{title}</label>

					<select ref={this.el} name={name} value={value || ""} onChange={this.onChange} onBlur={this.onBlur} style={isValid ? {} : BorderStyled}>
						<option key="_select" value="">
							{defaultSelectText}
						</option>
						{options.map((item) => (
							<option key={item} value={item}>
								{item}
							</option>
						))}
					</select>
				</FormInput>
			</>
		);
	}
}
