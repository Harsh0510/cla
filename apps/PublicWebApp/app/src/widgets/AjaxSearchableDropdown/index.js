import React from "react";
import AsyncSelect from "react-select/async";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import debounce from "../../common/debounce";
import debounceAsync from "../../common/debounceAsync";
import errorType from "../../common/errorType";
import staticValues from "../../common/staticValues";
import * as cacher from "../../common/cacher";

const LIMIT = staticValues.ajaxSearchableDropDown.resultLimit;
const NO_RECORDS_OPTION_MESSAGE = staticValues.ajaxSearchableDropDown.noRecordsOptionMessage;
const DEFAULT_SEARCH_INPUT_MESSAGE = staticValues.ajaxSearchableDropDown.defaultSearchInputMessage;

const FormContainer = styled.div`
	text-align: left;
	display: flex;
	z-index: 201;
	align-items: ${(p) => (!p.labelIsOnTop ? "center" : "left")};
	justify-content: center;
	flex-direction: ${(p) => (p.labelIsOnTop ? "column" : "row")};
	width: 100%;
`;

const AutoSelect = styled(AsyncSelect)`
	width: 100%;

	.dropDownDesign__value-container:nth-child(1) {
		display: -ms-grid;
		display: grid;
	}
	.dropDownDesign__input-container {
		display: -ms-inline-grid;
		display: inline-grid;
		-ms-grid-row: 1;
		-ms-grid-row-span: 1;
		-ms-grid-column: 1;
		-ms-grid-column-span: 2;
		grid-area: 1/1/2/3;
		grid-row: 1;
		grid-column: 1;
	}
	.dropDownDesign__placeholder {
		-ms-grid-row: 1;
		-ms-grid-row-span: 1;
		-ms-grid-column: 1;
		-ms-grid-column-span: 2;
		grid-area: 1/1/2/3;
		grid-row: 1;
		grid-column: 1;
	}

	input::-webkit-contacts-auto-fill-button {
		visibility: hidden;
		display: none !important;
		pointer-events: none;
		position: relative;
		right: 0;
	}
`;

const HiddenInput = styled.input`
	height: 0;
	opacity: 0;
	margin: 0;
	padding: 0;
	border: 1px solid transparent;
	top: 0px;
	position: relative;
	pointer-events: none;
`;

const ToolTipContent = styled.div`
	position: absolute;
	bottom: 50px;
	background: white;
	color: ${theme.colours.black};
	padding: 5px 10px;
	border-radius: 5px;
	border: 2px solid ${theme.colours.toolTipBorder};
	max-width: 170px;
	::after {
		content: "";
		height: 10px;
		width: 10px;
		position: absolute;
		background-color: ${theme.colours.white};
		bottom: -7px;
		left: 20px;
		border-top: ${theme.colours.toolTipBorder} solid 2px;
		border-left: ${theme.colours.toolTipBorder} solid 2px;
		transform: rotate(225deg);
	}
`;

const InputLabel = styled.label`
	padding-right: 10px;
	margin-bottom: ${(p) => (p.labelIsOnTop ? "0.5em" : "0")};
`;

const WrapSelect = styled.div`
	position: relative;
	width: 100%;
	background-color: transparent;

	> div:first-child {
		color: ${theme.colours.primary};
	}
`;

const augmentData = (arrayData) => {
	for (const item of arrayData) {
		item.value = item.id;
		item.label = item.title ? item.title : item.name;
		item.key = item.id;
		item.address1 = item.address1;
		item.address2 = item.address2;
		item.city = item.city;
		item.post_code = item.post_code;
	}
};

class AjaxSearchableDropdown extends React.PureComponent {
	state = {
		isLoading: false,
		inputValue: "",
		dropDownData: [],
	};

	componentDidMount() {
		this._isMounted = true;
		if (!this.props.value && this.props.performApiCallWhenEmpty) {
			this.updateState();
		}
	}

	componentDidUpdate(prevProps) {
		if (!this.props.value && this.props.value != prevProps.value && this.props.performApiCallWhenEmpty) {
			this.updateState();
		}
	}

	componentWillUnmount() {
		delete this._isMounted;
	}

	handleInputChange = async (newValue) => {
		this.setState({ inputValue: newValue });
		if (!newValue) {
			await this.onValueChange(newValue);
		}
	};

	updateState = async () => {
		const dropDownData = await this.makeDebouncedApiCall();
		this.setState({
			isLoading: false,
			dropDownData: dropDownData,
		});
	};

	getLimit() {
		const limit = this.props.limit ? this.props.limit : LIMIT;
		return limit > LIMIT ? LIMIT : limit;
	}

	onValueChange = async (query) => {
		const minQueryLength = this.props.minQueryLength ? this.props.minQueryLength : 2;
		const params = { limit: this.getLimit() };
		if (this.props.extractOid) {
			params.extractOid = this.props.extractOid;
		}
		if (query && query.length >= minQueryLength) {
			params.query = query;
			const dropDownData = await this.makeDebouncedApiCall(params);
			this.setState({
				isLoading: false,
				dropDownData: dropDownData,
			});
			return dropDownData;
		} else {
			if (!query && this.props.performApiCallWhenEmpty) {
				const dropDownData = await this.makeDebouncedApiCall(params);
				this.setState({
					isLoading: false,
					dropDownData: dropDownData,
				});
				return dropDownData;
			}
		}
		return [];
	};

	makeApiCall = cacher.createCachedAsyncFn(async (params) => {
		let apiParams;
		if (typeof this.props.updateApiCall === "function") {
			apiParams = this.props.updateApiCall(this.props.requestApi, params);
		} else {
			apiParams = {
				url: this.props.requestApi,
				params: params,
			};
		}
		return await this.props.api(apiParams.url, apiParams.params).then((result) => {
			if (!this._isMounted) {
				return;
			}
			augmentData(result.result);
			return result.result;
		});
	});

	makeDebouncedApiCall = debounceAsync(this.makeApiCall, 20);

	debouncedValueChange = debounce((callback) => {
		this.onValueChange(this.state.inputValue).then(callback);
	}, staticValues.debounceTime);

	loadOptions = (inputValue, callback) => {
		this.setState({
			inputValue: inputValue,
		});
		this.debouncedValueChange(callback);
	};

	noOptionsMessage = (inputString) => {
		const query = inputString.inputValue;
		const minQueryLength = this.props.minQueryLength ? this.props.minQueryLength : 2;
		if (query && query.length >= minQueryLength) {
			return NO_RECORDS_OPTION_MESSAGE;
		} else {
			const queryLength = query && query.length ? query.length : 0;
			if (queryLength > 0 && queryLength < minQueryLength) {
				return `Type at least ${minQueryLength} characters to view results`;
			}
			return DEFAULT_SEARCH_INPUT_MESSAGE;
		}
	};

	onChange = (selectedItem) => {
		const valid = this.fieldIsValid(selectedItem);
		if (!selectedItem || (Array.isArray(selectedItem) && !selectedItem.length)) {
			this.setState({
				dropDownData: [],
			});
		}
		if (this.props.onChange) {
			this.props.onChange(this.props.name, selectedItem, valid);
		}
	};

	onBlur = (event) => {
		const { inputValue } = this.state;
		const { value } = this.props;
		const valid = this.fieldIsValid(value);

		if (!inputValue) {
			this.setState({
				inputValue: "",
			});
			if (this.props.onBlur) {
				this.props.onBlur(this.props.name, value, valid);
			}
		}
	};

	fieldIsValid = (value) => {
		const isValid = this.isValid(value);
		const fieldTitle = this.props.title;
		return {
			isValid: isValid,
			errorType: !isValid ? errorType.required : "",
			message: !isValid ? fieldTitle + " is required." : "",
		};
	};

	isValid(value = this.props.value) {
		return value ? true : this.props.required ? false : true;
	}

	render() {
		const {
			name,
			title,
			value,
			placeholder,
			valid = true,
			disabled = false,
			multiple = false,
			toolTipText,
			style, //for wrapper div
			className, //for wrapper div
			minQueryLength = 2,
			required = false,
			labelIsOnTop,
			highlightOnError = false,
			showDefaultToolTipOnError,
			customControlStyle = {}, //for styling textbox
		} = this.props;
		const modifiedStyle = {};
		modifiedStyle.control = (base, state) => ({
			...base,
			border: (toolTipText || !valid) && highlightOnError ? `2px solid ${theme.colours.red}` : `1px solid ${theme.colours.inputBorder}`,
			borderRadius: "0px",
			backgroundColor: disabled ? "" : "#ffffff",
			opacity: disabled ? "0.3" : "1",
			width: "100%",
			...customControlStyle,
		});
		modifiedStyle.menu = (base, state) => Object.assign(base, { zIndex: 99999999 });
		modifiedStyle.option = (base, state) => Object.assign(base, { lineHeight: "normal" });
		modifiedStyle.singleValue = (base, state) => ({
			...base,
			color: theme.colours.primary,
		});

		if (this.state.inputValue.length < minQueryLength) {
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

		const asyncSelect = (
			<AutoSelect
				styles={modifiedStyle}
				value={value}
				placeholder={placeholder}
				name={name}
				onChange={this.onChange}
				onBlur={this.onBlur}
				isMulti={multiple}
				isClearable={true}
				indicatorContainerStyle={{
					color: "red",
				}}
				defaultOptions={this.state.dropDownData}
				options={this.state.dropDownData}
				loadOptions={this.loadOptions}
				noOptionsMessage={this.noOptionsMessage}
				isDisabled={disabled}
				onInputChange={this.handleInputChange}
				className="dropDownDesign"
				classNamePrefix="dropDownDesign"
			/>
		);
		const label = title ? (
			<InputLabel htmlFor={name} labelIsOnTop={labelIsOnTop}>
				{" "}
				{title}{" "}
			</InputLabel>
		) : (
			""
		);
		const showToolTip = toolTipText ? <ToolTipContent>{toolTipText}</ToolTipContent> : null;
		const showHiddenInput = showDefaultToolTipOnError && (
			<HiddenInput
				type="text"
				name="hiddenInput"
				defaultValue={value ? value.value : ""}
				required={required}
				key={"item_id_" + (value ? value.school_id : "")}
			/>
		);
		let returnResult = (
			<>
				{label}
				<WrapSelect valid={valid} {...this.props.gaAttribute}>
					{showToolTip}
					{asyncSelect}
					{showHiddenInput}
				</WrapSelect>
			</>
		);

		return (
			<div className={className} style={style}>
				<FormContainer className="smoothScrollTarget" labelIsOnTop={labelIsOnTop}>
					{returnResult}
				</FormContainer>
			</div>
		);
	}
}

export default AjaxSearchableDropdown;
