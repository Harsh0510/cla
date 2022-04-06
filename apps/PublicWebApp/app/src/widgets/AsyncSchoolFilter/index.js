import React, { Component } from "react";
import AsyncSelect from "react-select/async";
import styled from "styled-components";
import theme from "../../common/theme";
import debounce from "../../common/debounce";
import errorType from "../../common/errorType";
import staticValues from "../../common/staticValues";

const SCHOOL_REQUEST_API = staticValues.api.schoolRequestApi;
const SCHOOLS_DATA_LIMIT = staticValues.schoolAsyncDropDown.schoolResultLimit;
const NO_RECORDS_OPTION_MESSAGE = staticValues.schoolAsyncDropDown.noRecordsOptionMessage;
const DEFAULT_SEARCH_INPUT_MESSAGE = staticValues.schoolAsyncDropDown.defaultSearchInputMessage;
const CONTINUE_SEARCH_INPUT_MESSAGE = staticValues.schoolAsyncDropDown.continueSearchInputMessage;

const FormContainer = styled.div`
	text-align: left;
	display: flex;
	flex-direction: column;
	width: ${(props) => (props.customWidth ? props.customWidth : "25%")};
	padding: 0;
	${(props) =>
		props.marginBottom &&
		`
		margin-bottom: ${props.marginBottom};
	`}
	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		width: ${(props) => (props.customWidth ? props.customWidth : "23%")};
	}
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		width: 100%;
		margin-right: 0;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		width: 100%;
		margin-top: 0.5em;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding: 0;
	}
`;

const AutoSelect = styled(AsyncSelect)`
	input::-webkit-contacts-auto-fill-button {
		visibility: hidden;
		display: none !important;
		pointer-events: none;
		position: relative;
		right: 0;
	}
`;

const SelectSearch = styled.div`
	border: 1px solid ${theme.colours.inputBorder};
	margin-right: 0;
	margin-left: 0;
	background-color: transparent;
	margin: 0 0 1em 0;
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

const FormHiddenSchool = styled.input`
	height: 0;
	opacity: 0;
	margin: 0;
	padding: 0;
	border: 1px solid transparent;
	top: 0px;
	position: relative;
	pointer-events: none;
`;

const FormSelectSearch = styled.div`
	margin-right: 0;
	margin-left: 0;
	background-color: transparent;
	border-radius: 3px;
	z-index: 999;
`;

class AsyncSchoolFilter extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			inputValue: "",
			dropDownData: [],
		};
	}

	onSelectInputChange = async (query) => {
		if (query && query.length >= 3) {
			let params = Object.create(null);
			params.limit = this.props.limit ? this.props.limit : SCHOOLS_DATA_LIMIT;
			if (params.limit > SCHOOLS_DATA_LIMIT) {
				params.limit = SCHOOLS_DATA_LIMIT;
			}
			params.query = query;
			let URL = SCHOOL_REQUEST_API;
			let dropDownData = await this.makeApiCall(URL, params);
			this.setState({
				isLoading: false,
				dropDownData: dropDownData,
			});
			return dropDownData;
		} else {
			return [];
		}
	};

	makeApiCall = async (request_URL, params) => {
		return await this.props.api(request_URL, params).then((result) => {
			let dropDownData = this.arrayMapping(result.result);
			return dropDownData;
		});
	};

	arrayMapping(arrayData) {
		let arr = [];
		arrayData.map((item) => {
			const data = Object.create(null);
			data.value = item.id;
			data.label = item.title ? item.title : item.name;
			data.key = item.id;
			arr.push(data);
		});
		return arr;
	}

	loadOptions = (inputValue, callback) => {
		this.setState(
			{
				inputValue: inputValue,
			},
			debounce(async () => {
				return callback(await this.onSelectInputChange(inputValue));
			}, staticValues.debounceTime)
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

	onChange = (select_school) => {
		const valid = this.fieldIsValid(select_school);
		if (!select_school || (Array.isArray(select_school) && !select_school.length)) {
			this.setState({
				dropDownData: [],
			});
		}
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

	render() {
		const {
			name,
			labelText,
			selectedData,
			placeholder,
			isLabelRequired = true,
			customWidth,
			isValid = true,
			isUsedInAddEditForm = false,
			isDisabled = false,
			singleValueFieldColor = false,
		} = this.props;
		//This flag is used for select the school for bulk selection by cla-admin user
		const isUsedInForm = this.props.isUsedInForm ? this.props.isUsedInForm : false;

		let modifiedStyle = new Object();
		modifiedStyle.control = (base, state) => ({
			...base,
			border: `1px solid ${theme.colours.inputBorder}`,
			borderRadius: "0px",
			minHeight: this.props.minHeight ? this.props.minHeight : "auto",
			backgroundColor: isDisabled ? "transparent" : "",
			opacity: isDisabled ? "0.3" : "1",
		});

		modifiedStyle.menu = (base, state) => Object.assign(base, { zIndex: 99999999 });

		if (singleValueFieldColor) {
			modifiedStyle.singleValue = (base, state) => ({
				...base,
				color: singleValueFieldColor,
			});
		}

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

		if (singleValueFieldColor) {
			modifiedStyle.singleValue = (base, state) => ({
				...base,
				color: singleValueFieldColor,
			});
		}

		const isMulti = this.props.isMulti === false ? false : true;
		const asyncSelect = (
			<AutoSelect
				styles={modifiedStyle}
				value={selectedData}
				placeholder={placeholder}
				name={name}
				onChange={this.onChange}
				isMulti={isMulti}
				isClearable={true}
				isBgDark={this.props.isBgDark ? this.props.isBgDark : null}
				indicatorContainerStyle={{
					color: "#fff",
				}}
				defaultOptions={this.state.dropDownData}
				options={this.state.dropDownData}
				loadOptions={this.loadOptions}
				noOptionsMessage={this.noOptionsMessage}
				isUsedInForm={isUsedInForm}
				isDisabled={isDisabled}
			/>
		);
		const label = isLabelRequired ? <label htmlFor={name}> {labelText} </label> : null;

		let componentSelect = null;
		if (isUsedInForm) {
			componentSelect = (
				<>
					{label}
					<SelectSearch isValid={isValid}>{asyncSelect}</SelectSearch>
				</>
			);
		} else if (isUsedInAddEditForm) {
			componentSelect = (
				<>
					<FormSelectSearch>
						{label}
						{asyncSelect}
						<FormHiddenSchool
							type="text"
							name="hiddenSchool"
							defaultValue={selectedData ? selectedData.value : ""}
							required
							key={"school_id_" + (selectedData ? selectedData.school_id : "")}
						/>
					</FormSelectSearch>
				</>
			);
		} else {
			componentSelect = (
				<>
					{label}
					{asyncSelect}
				</>
			);
		}
		return (
			<FormContainer style={this.props.styles ? this.props.styles : {}} customWidth={customWidth} marginBottom={this.props.marginBottom}>
				{componentSelect}
			</FormContainer>
		);
	}
}

export default AsyncSchoolFilter;
