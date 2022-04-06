import { Link } from "react-router-dom";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import Select from "react-select";
import { colMd3, colMd4, colSm6, row } from "../../common/style";
import { ColSmallHalf } from "../Layout/ColSmallHalf";

/** Index page ***/
const SectionHalf = styled.div`
	position: relative;
`;

const PageDetail = styled.div`
	display: flex;
	flex-direction: column;
	max-width: 100%;
	padding: 0em 0em 3em 0em;
	color: ${theme.colours.bgDarkPurple};

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		padding: 0;
	}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding: 0;
	}
`;

const MessageString = styled.span`
	text-align: center;
	line-height: 1.3;

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		margin-top: 20px;
	}
`;

const Button = styled.button`
	background-color: transparent;
	color: ${theme.colours.primary};
	border: none;
	border-radius: 3px;
	padding: 0.937em 0px;
	margin-top: 23px;
	white-space: nowrap;
	position: absolute;
	top: auto;
	bottom: ${(props) => (props.setBottom ? props.setBottom : 0)};
	right: 0;
	z-index: 9;
	span {
		text-decoration: underline;
	}
	i {
		margin-left: 10px;
	}
	${(p) =>
		p.hide === true &&
		css`
			display: none;
		`}

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		margin-top: 0px;
	}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		margin: 0px 5px 0 5px;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		margin: 0px 0px 0 0px;
		position: relative;
		top: 15px;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) and (min-width: ${theme.breakpoints.mobileSmall}) {
		position: relative;
		top: 15px;
	}

	@media screen and (width: ${theme.breakpoints.mobileLarge}) {
		position: absolute;
		top: auto;
	}
`;

const ButtonLink = styled(Link)`
	background-color: transparent;
	color: ${theme.colours.primary};
	border: none;
	border-radius: 3px;
	padding: 0.625em 0px;
	margin-top: 23px;
	white-space: nowrap;
	position: absolute;
	top: auto;
	bottom: ${(props) => (props.setbottom ? props.setbottom : 0)};
	right: 0;
	z-index: 9;
	span {
		text-decoration: underline;
	}
	i {
		margin-left: 10px;
	}
	${(p) =>
		p.hide === true &&
		css`
			display: none;
		`}

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		margin-top: 0px;
	}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		margin: 0px 5px 0 5px;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		margin: 0px 0px 0 0px;
		position: relative;
		top: 15px;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) and (min-width: ${theme.breakpoints.mobileSmall}) {
		position: relative;
		top: 15px;
	}
`;

const SearchSectionOne = styled.div`
	margin-bottom: 0.5em;

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		flex-direction: column;
	}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		flex-direction: column;
		padding: 0;
		margin-bottom: 0;
	}
`;

const FilterSectionHalf = styled(SectionHalf)``;

/** Search Filters ***/
const WrapForm = styled.form`
	${row}

	display: flex;
	align-items: flex-start;
	width: 100%;
	padding: 0.5em 0;
	margin: 0;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding: 0;
		width: 100%;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) and (min-width: ${theme.breakpoints.mobileSmall}) {
		align-items: center;
	}
`;

const FormContainer = styled.div`
	text-align: left;
	width: 100%;
	padding: 0;
	margin-bottom: 15px;

	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		width: 100%;
	}

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		width: 100%;
	}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		width: 100%;
		margin-top: 0.5em;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		padding: 0;
	}
`;

const StyledInput = styled.input`
	display: block;
	background-color: hsl(0, 0%, 100%);
	border: 1px solid ${theme.colours.inputBorder};
	margin: 0;
	flex-grow: 1;
	font-size: 1em;
	line-height: 2;
	padding: 2px 8px;
	color: ${theme.colours.primary};
	width: 100%;
	min-height: 38px;
	::placeholder {
		color: ${theme.colours.inputText};
		font-weight: 300;
	}
`;

const SubmitButton = styled.button`
	font-size: 0.875em;
	height: 2.6em;
	background-color: ${theme.colours.headerButtonSearch};
	color: ${theme.colours.white};
	border: 0;
	width: 100%;
	margin-top: 0px;

	${(p) =>
		p.marginRight === true &&
		css`
			margin-right: 0.5rem;
		`};

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		margin-top: 0;
	}
`;

const SearchButtonSection = styled(ColSmallHalf)`
	${(props) => (props.numberOfFilters >= 3 ? colMd3 : colMd4)}
	padding-left: 0;
	padding-right: 0;
	display: flex;
	${(props) =>
		(props.numberOfFilters === 1 || props.numberOfFilters === 4) &&
		`
		padding-top: 2em;
	`};

	${(props) =>
		props.numberOfFilters >= 2 &&
		`
		padding-right: 0.5em;
	`};

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		padding-top: 0;
		padding-right: 0.5em;
		${(props) =>
			props.numberOfFilters % 2 === 0 &&
			`
				padding-top: 1em;
		`};
	}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding-top: 0;
		padding-right: 0.5em;
		${(props) =>
			props.numberOfFilters % 2 === 0 &&
			`
				padding-top: 1.5em;
		`};
	}

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		padding-right: 0;
		padding-top: 0;
	}

	@media screen and (width: ${theme.breakpoints.mobileLarge}) {
		padding-top: 1em;
		padding-right: 0.5em;
		${(props) =>
			(props.numberOfFilters === 2 || props.numberOfFilters === 3) &&
			`
				padding-top: 0;
		`};
	}

	@media screen and (width: ${theme.breakpoints.mobileSmall}) {
		padding-right: 0.5em;
		padding-top: 0;
		${(props) =>
			props.numberOfFilters % 2 === 0 &&
			`
			padding-top: 1.5em;
		`};
	}
`;

/** Add/Edit page ***/

/** Form Style component */
const FormWrapAddEdit = styled.form`
	display: flex;
	flex-direction: column;
	max-width: 100%;
	margin: 2em 0;
	${(props) =>
		props.tableList === false &&
		`
		margin: 0em 0em 3em 0em;
	`};
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		padding: 1em 0;
		${(props) =>
			props.tableList === false &&
			`
			margin: 0 0 1em 0;
			padding: 0 0 1em 0;
		`};
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		margin: 1em 0;
		padding: 0em 0 1em;
		${(props) =>
			props.tableList === false &&
			`
			margin: 0 0 1em 0;
		`};
	}
`;

const FormMessage = styled.div`
	text-align: center;
	justify-content: center;
	padding: 1em 2em;
	width: 90%;
	margin: auto;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding: 1em 0em 1em 0em;
		width: 90%;
	}
`;

const FormBodyContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	max-width: 100%;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		.hide {
			display: none;
		}
	}

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		.hide {
			display: none;
		}
	}
`;

const FormContainerFull = styled.div`
	width: calc(100%);
	display: flex;
	box-sizing: border-box;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		width: calc(100%);
		padding: 0;
		flex-direction: column;
	}
`;

const FormContainerButton = styled.div`
	width: 100%;
	display: flex;
	box-sizing: border-box;
	justify-content: center;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		width: 100%;
		padding: 0;
		flex-direction: column;
	}
`;

const FormContainerHalf = styled.div`
	width: calc(50%);
	display: flex;
	flex-direction: column;
	padding: 0 1em;
	box-sizing: border-box;
	color: ${theme.colours.black};
	margin-bottom: ${(props) => (props.marginBottom ? props.marginBottom : `30px`)};

	select::-ms-expand {
		display: none;
	}

	@media screen and (min-width: ${theme.breakpoints.mobile}) {
		padding: 0;
		:first-child {
			padding-right: 10px;
		}
		${(props) =>
			props.marginBottom &&
			`
			margin-bottom: ${props.marginBottom};
		`}
	}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		width: calc(100% - 0.5em);
		padding: 0;
		:first-child {
			padding-right: 0;
		}
		.hide {
			display: none;
		}
		${(p) =>
			p.hideInMobile === true &&
			css`
				display: none;
			`};
	}

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		padding: 0;
		width: 100%;
	}
`;

/** Top Section for Corner link */
const FormTopCornerCancel = styled.button`
	font-weight: regular;
	color: ${theme.colours.primary};
	background: none;
	border: none;
	text-decoration: none;
	i {
		margin-left: 10px;
	}
`;

const FormSectionTopRow = styled.div`
	display: flex;
	margin: 0;
	justify-content: space-between;
`;

const FormSectionHalf = styled.div`
	display: flex;
	flex-direction: column;
	padding: 1em 0;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding: 0.5em 0;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		padding: 0.5em 0;
	}
`;

const FormError = styled.div`
	margin-bottom: 0.5em;
	color: ${theme.colours.errorTextColor};
	font-size: 0.9em;
	font-weight: bold;
`;

/** Form controls */
const FormInput = styled.input`
	margin-right: 0;
	margin-bottom: ${(p) => (p.error ? `0.375em` : `0em`)};
	margin-left: 0;
	background-color: transparent;
	line-height: 2;
	padding: 2px 8px;
	min-height: 38px;
	border-color: ${theme.colours.inputBorder};
	${(p) =>
		p.isLabel === true &&
		`
		width: 85%;
	`};

	::placeholder {
		color: ${theme.colours.primary};
	}

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		${(p) =>
			p.isLabel === true &&
			`
			width: 78%;
		`};
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		margin-bottom: ${(p) => (p.error ? `0.375em` : `0em`)};
		${(p) =>
			p.isLabel === true &&
			`
			width: 100%;
		`};
	}
`;

const FormCustomSelect = styled.select`
	margin: 0;
	border: 0;
	outline: 0;
	background: transparent;
	padding: 2px 8px;
	line-height: 2;
	min-height: 38px;
	appearance: none;
	border: 1px solid ${theme.colours.inputBorder};
	background-image: url(${require("../../assets/icons/up_down.svg")});
	background-size: 20px;
	background-repeat: no-repeat;
	background-position: center right 10px;
	border-radius: 0px;
	width: 100%;
	padding-right: 40px;
	::-ms-expand {
		display: none;
	}
`;

const FormActionButton = styled.button`
	background-color: ${theme.colours.headerButtonSearch};
	color: ${theme.colours.white};
	padding: 1em;
	border: none;
	border-radius: 0;
	margin: 1em;
	width: 200px;
	${(p) =>
		p.hide === true &&
		css`
			display: none;
		`}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		margin: 1em 0;
		width: auto;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		margin: 0 0 1em;
		width: auto;
		padding: 0.6em 1em;
	}
`;

const FormSaveButton = styled(FormActionButton)`
	background-color: ${theme.colours.headerButtonSearch};
	color: ${theme.colours.white};
	${(props) =>
		props.disabled &&
		css`
			opacity: 0.2;
			cursor: default;
			pointer-events: none;
		`};
`;

const FormDeleteButton = styled(FormActionButton)`
	color: ${theme.colours.white};
	${(props) =>
		props.disabled &&
		css`
			opacity: 0.2;
			cursor: default;
			pointer-events: none;
		`};
`;

const FormResetButton = styled(FormActionButton)`
	color: ${theme.colours.white};
`;

//** Confirm Box style components*/
const FormConfirmBox = styled.div`
	width: 60%;
	text-align: center;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		text-align: center;
		width: 100%;
	}
`;

const FormConfirmBoxText = styled.div`
	color: ${theme.colours.red};
	font-weight: bold;
	margin: 1em 0;
`;

const FormConfirmBoxButton = styled.button`
	margin: 0 1em;
	padding: 0.5em;
	width: 100px;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		margin: 0 0.5em;
		padding: 0.5em;
	}
`;

const FormConfirmBoxButtonNo = styled(FormConfirmBoxButton)`
	color: ${theme.colours.white};
	background-color: ${theme.colours.darkGrey};
	border-color: ${theme.colours.darkGrey};
`;

const FormFieldsDisabledMessage = styled.div`
	text-align: center;
	margin: 0 auto 1em auto;
`;

const FormSelectSearch = styled.div`
	margin-right: 0;
	margin-left: 0;
	background-color: transparent;
	border-radius: 3px;
	z-index: 999;
`;

const FormAutoSelect = styled(Select)`
	${(p) =>
		p.fieldsDisabled &&
		css`
			opacity: 0.2;
			cursor: default;
			pointer-events: none;
		`}
	> div {
		color: ${theme.colours.primary};
		padding: 0.14em;
	}
	input::-webkit-contacts-auto-fill-button {
		visibility: hidden;
		display: none !important;
		pointer-events: none;
		position: absolute;
		right: 0;
	}
`;

const FormHiddenSchool = styled.input`
	height: 0;
	opacity: 0;
	margin: 0;
	padding: 0;
	border: 1px solid transparent;
	top: -50px;
	position: relative;
	pointer-events: none;
`;

const formCustomStyles = {
	container: (base, state) => ({
		...base,
		input: {
			textIndent: "-1px",
		},
	}),
	control: (base, state) => ({
		...base,
		borderRadius: "0px",
		"border-color": theme.colours.lightGray,
	}),
	singleValue: (base, state) => ({
		...base,
		color: theme.colours.primary,
	}),
	placeholder: (base, state) => ({
		...base,
		color: theme.colours.primary,
	}),
};

/* This  WrapperDiv is used for Column Selector and Display result */
const WrapperDiv = styled.div`
	position: relative;
	min-height: 50px;
	${(p) =>
		p.paddingTop &&
		`
		padding-top: ${p.paddingTop};
	`}

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		margin-top: 5px;
	}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		margin-top: 25px;
	}
`;

const WrapSearchInputField = styled.div`
	${colSm6}
	${(p) => (p.numberOfFilters >= 3 ? colMd3 : colMd4)}
	padding-left: 0;
	padding-right: 0;
	@media screen and (min-width: ${theme.breakpoints.mobileSmall}) {
		padding-right: 0.5rem;
	}
`;

const WrapSearchSchoolFilter = styled(WrapSearchInputField)`
	margin-bottom: 15px;
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		margin-top: 0.5em;
	}
`;

export { SectionHalf, PageDetail, MessageString, Button, ButtonLink, SearchSectionOne, FilterSectionHalf };
export { WrapForm, FormContainer, StyledInput, SubmitButton, SearchButtonSection, WrapSearchInputField, WrapSearchSchoolFilter };
export {
	FormWrapAddEdit,
	FormMessage,
	FormBodyContainer,
	FormContainerFull,
	FormContainerButton,
	FormContainerHalf,
	FormTopCornerCancel,
	FormSectionTopRow,
	FormSectionHalf,
	FormError,
	FormInput,
	FormCustomSelect,
	FormActionButton,
	FormSaveButton,
	FormDeleteButton,
	FormResetButton,
	FormConfirmBox,
	FormConfirmBoxText,
	FormConfirmBoxButton,
	FormConfirmBoxButtonNo,
	FormFieldsDisabledMessage,
	FormSelectSearch,
	FormAutoSelect,
	FormHiddenSchool,
	formCustomStyles,
};
export { WrapperDiv };
