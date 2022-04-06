import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import Select from "react-select";
import errorType from "../../common/errorType";

const SelectSearch = styled.div`
	margin-right: 0;
	margin-left: 0;
	background-color: transparent;

	div {
		border: none;
		border-radius: 0;
	}

	> div:first-child {
		color: ${theme.colours.primary};
		border: ${(p) => (p.isValid ? "none" : `2px solid ${theme.colours.invalidBorder}`)};
		border-radius: 0;
	}
	> div > div > div {
		padding: 6px 8px;
	}
`;

const AutoSelect = styled(Select)`
	input::-webkit-contacts-auto-fill-button {
		visibility: hidden;
		display: none !important;
		pointer-events: none;
		position: absolute;
		right: 0;
	}
`;

const customStyles = {
	container: (base, state) => ({
		...base,
		input: {
			textIndent: "-1px",
		},
	}),
};

const HiddenSchool = styled.input`
	height: 0;
	opacity: 0;
	margin: 0;
	padding: 0;
	border: 1px solid transparent;
	top: -50px;
	position: relative;
	pointer-events: none;
`;

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
		background-size: 20px;
		background-repeat: no-repeat;
		background-position: right 10px bottom 10px;
		min-height: 25px;
		border-radius: 0;
		border: none;
		color: ${theme.colours.primary};
		width: ${(p) => (p.inputWidth ? p.inputWidth : "100%")};

		@media screen and (max-width: ${theme.breakpoints.mobile}) {
			width: 100%;
		}
	}
`;

export default class SelectSchoolField extends React.PureComponent {
	schoolsDropdown(schools) {
		let arr = [];
		const setOption = {
			value: "",
			label: "",
		};
		schools.map((item) => {
			const data = Object.assign({}, setOption);
			data.value = item.id;
			data.label = item.name;
			arr.push(data);
		});

		return (
			<SelectSearch isValid={this.props.isValid}>
				<AutoSelect
					styles={customStyles}
					value={this.props.value}
					options={arr}
					placeholder={this.props.placeholder}
					name={this.props.name}
					onChange={this.onChange}
					inputProps={{ name: this.props.name }}
					onBlurResetsInput={false}
					onBlur={() => this.onBlur(this.props.value)}
					className="selectschool"
				></AutoSelect>
				<HiddenSchool ref={this.el} type="text" name="hiddenSchool" defaultValue={this.props.value} key={0} />
			</SelectSearch>
		);
	}

	onChange = (select_school) => {
		const valid = this.fieldIsValid(select_school);
		if (this.props.onChange) {
			this.props.onChange(this.props.name, select_school, valid);
		}
	};

	onBlur = (select_school) => {
		const valid = this.fieldIsValid(select_school);
		if (this.props.onChange) {
			this.props.onChange(this.props.name, select_school, valid);
		}
	};

	fieldIsValid = (field) => {
		let isValid = null;
		let isRequired = this.props.isRequired || false;
		isValid = field !== "" ? true : isRequired ? false : true;
		let fieldTitle = this.props.title;
		let result = {
			isValid: isValid,
			errorType: !isValid ? errorType.required : "",
			message: !isValid ? fieldTitle + " is required." : "",
		};
		return result;
	};

	isValid() {
		let field = this.props.value;
		let isValid = null;
		let isRequired = this.props.isRequired || false;
		isValid = field !== "" ? true : isRequired ? false : true;
		return isValid;
	}

	render() {
		const { name, title, value, isRequired, isValid, inputWidth = "100%", schoolData } = this.props;

		return (
			<>
				<FormInput>
					<label htmlFor={name}>{title} </label>
					{this.schoolsDropdown(schoolData)}
				</FormInput>
			</>
		);
	}
}
