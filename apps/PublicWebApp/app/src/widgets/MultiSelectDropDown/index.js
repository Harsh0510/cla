import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import Select from "react-select";

const FormContainer = styled.div`
	text-align: left;
	display: flex;
	flex-direction: column;
	width: ${(props) => (props.isWidthFull ? "100%" : "25%")};
	padding: 0;
	${(props) =>
		props.hasZIndex &&
		`
		z-index: 101;
	`}
	${(props) =>
		props.marginBottom &&
		`
		margin-bottom: ${props.marginBottom};
	`}
	${(props) =>
		props.isMarginRequiredInResponsive &&
		`
		margin-right:5px;
	`}
	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		width: ${(props) => (props.isWidthFull ? "100%" : "23%")};
		${(props) =>
			props.isMarginRequiredInResponsive &&
			`
			margin-right:13px;
			padding:0;
		`}
	}
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		width: 100%;
		margin-right: 0;
		${(props) =>
			props.isMarginRequiredInResponsive &&
			`
			padding: 0;
		`}
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		width: 100%;
		margin-top: 0.5em;
		${(props) =>
			props.isMarginRequiredInResponsive &&
			`
			padding: 0px;
		`}
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding: 0;
	}
	${(props) =>
		props.isMarginRequiredInResponsive &&
		`
		@media screen and (max-width: ${theme.breakpoints.mobileLarge}) and (min-width: ${theme.breakpoints.mobileSmall}){
			margin-bottom: 0;
			margin-right: 13px;
			margin-top: 0;
		}
	`}
`;

const AutoSelect = styled(Select)`
	input::-webkit-contacts-auto-fill-button {
		visibility: hidden;
		display: none !important;
		pointer-events: none;
		position: relative;
		right: 0;
	}
`;

export default class MultiSelectDropDown extends React.PureComponent {
	render() {
		let modifiedStyle = new Object();

		const {
			name,
			labelText,
			selectedData,
			options,
			placeholder,
			eventName,
			isLabelRequired = true,
			isMarginRequiredInResponsive = false,
		} = this.props;
		if (this.props.areOptionLinks) {
			modifiedStyle.option = (base, state) =>
				Object.assign(base, {
					":after": {
						content: "'\f178'",
						fontFamily: "'Font Awesome 5 Pro'",
						position: "absolute",
						right: 10,
						color: theme.colours.primaryDark,
					},
				});
		}

		modifiedStyle.control = (base, state) => ({
			...base,
			border: `1px solid ${theme.colours.inputBorder}`,
			borderRadius: "0px",
		});

		if (this.props.isBgDark) {
			modifiedStyle.placeholder = (base, state) => ({
				...base,
				color: theme.colours.white,
			});
			modifiedStyle.singleValue = (base, state) => ({
				...base,
				color: theme.colours.white,
			});
			modifiedStyle.multiValue = (base, state) => ({
				...base,
				color: theme.colours.white,
			});
			modifiedStyle.control = (base, state) => ({
				...base,
				background: theme.colours.primary,
				color: theme.colours.white,
				border: "none",
				borderRadius: "0px",
			});
			modifiedStyle.indicatorSeparator = (base, state) => ({
				...base,
				display: "none",
			});
		} else {
			modifiedStyle.control = (base, state) => ({
				...base,
				borderRadius: 0,
			});
		}

		modifiedStyle.menu = (base, state) => Object.assign(base, { zIndex: 99999999 });

		const isMulti = this.props.isMulti === false ? false : true;
		return (
			<FormContainer
				style={this.props.styles ? this.props.styles : {}}
				isWidthFull={this.props.isWidthFull ? this.props.isWidthFull : null}
				isMarginRequiredInResponsive={isMarginRequiredInResponsive}
				hasZIndex={this.props.flyOutIndex == 0 ? true : false}
				marginBottom={this.props.marginBottom}
			>
				{isLabelRequired ? <label htmlFor={name}> {labelText} </label> : null}
				<AutoSelect
					styles={modifiedStyle} /* { { menu: (styles) => Object.assign(styles, {zIndex: 9999999}) } */
					value={selectedData}
					options={options}
					placeholder={placeholder}
					name={name}
					onChange={eventName}
					isMulti={isMulti}
					isClearable={true}
					isBgDark={this.props.isBgDark ? this.props.isBgDark : null}
					indicatorContainerStyle={{
						color: "#fff",
					}}
				/>
			</FormContainer>
		);
	}
}
