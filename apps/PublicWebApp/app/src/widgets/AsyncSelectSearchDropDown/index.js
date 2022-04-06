import React, { Component } from "react";
import AsyncSelect from "react-select/async";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import errorType from "../../common/errorType";
import debounce from "../../common/debounce";
import staticValues from "../../common/staticValues";

const NO_RECORDS_OPTION_MESSAGE = staticValues.schoolAsyncDropDown.noRecordsOptionMessage;
const DEFAULT_SEARCH_INPUT_MESSAGE = staticValues.schoolAsyncDropDown.defaultSearchInputMessage;
const CONTINUE_SEARCH_INPUT_MESSAGE = staticValues.schoolAsyncDropDown.continueSearchInputMessage;

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

const AutoSelect = styled(AsyncSelect)`
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

export default class AsyncSelectSearchDropDown extends React.PureComponent {
	state = { inputValue: "" };

	handleInputChange = (newValue) => {
		this.setState({ inputValue: newValue });
		if (this.props.handleSearchInputChange) {
			this.props.handleSearchInputChange(newValue);
		}
		return newValue;
	};

	filterData = (inputValue) => {
		const dataoptions = this.props.dropdownData.filter((i) => {
			return true;
		});
		return dataoptions;
	};

	onChange = (select_school) => {
		const valid = this.fieldIsValid(select_school);
		if (this.props.onChange) {
			this.props.onChange(this.props.name, select_school, valid);
		}
	};

	fieldIsValid = (field) => {
		let isValid = null;
		let isRequired = this.props.isRequired || false;
		isValid = field && field !== "" ? true : isRequired ? false : true;

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
		isValid = field && field !== "" ? true : isRequired ? false : true;
		return isValid;
	}

	loadOptions = (inputValue, callback) => {
		this.setState(
			{
				inputValue: inputValue,
			},
			debounce(() => {
				callback(this.filterData(inputValue));
			}, parseInt(staticValues.debounceTime) + 400)
		);
	};

	noOptionsMessage = (inputString) => {
		const query = inputString.inputValue;
		if (query && query.length >= 3) {
			return NO_RECORDS_OPTION_MESSAGE;
		} else {
			const queryLength = query && query.length ? query.length : 0;
			if (queryLength > 0 && queryLength < 3) {
				return CONTINUE_SEARCH_INPUT_MESSAGE;
			}
			return DEFAULT_SEARCH_INPUT_MESSAGE;
		}
	};

	render() {
		const {
			name = "selectDropdown",
			title = "Select ",
			value = "",
			isValid,
			dropdownData,
			isRequired,
			validationType,
			isClearable = true,
			asyncSelectLoading = false,
			isDisabled = false,
		} = this.props;
		let modifiedStyle = new Object();
		modifiedStyle.control = (base, state) => ({
			...base,
			border: `1px solid ${theme.colours.inputBorder}`,
			borderRadius: "0px",
			minHeight: this.props.minHeight ? this.props.minHeight : "auto",
		});
		modifiedStyle.menu = (base, state) => Object.assign(base, { zIndex: 99999999 });

		if (this.state.inputValue.length < 3) {
			modifiedStyle.loadingIndicator = () => {
				return {
					display: "none",
				};
			};
			modifiedStyle.loadingMessage = () => {
				return {
					display: "none",
				};
			};
		}

		return (
			<>
				<FormInput>
					<label htmlFor={name}>
						{title} {asyncSelectLoading ? <i className="fas fa-spinner fa-spin"></i> : ""}
					</label>
					<SelectSearch isValid={isValid}>
						<AutoSelect
							styles={modifiedStyle}
							value={value}
							options={dropdownData}
							name={name}
							onChange={this.onChange}
							inputProps={{ name: name }}
							onBlurResetsInput={false}
							className="selectschool"
							loadOptions={this.loadOptions}
							defaultOptions={dropdownData}
							onInputChange={this.handleInputChange}
							isSearchable={true}
							isClearable={true}
							indicatorContainerStyle={{
								color: "#fff",
							}}
							isDisabled={isDisabled}
							noOptionsMessage={this.noOptionsMessage}
						/>
						<HiddenSchool ref={this.el} type="text" name="hiddenSchool" defaultValue={value} key={0} />
					</SelectSearch>
				</FormInput>
			</>
		);
	}
}
