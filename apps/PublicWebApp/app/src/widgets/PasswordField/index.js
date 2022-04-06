import React from "react";
import validationType from "../../common/validationType";
import errorType from "../../common/errorType";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import reactCreateRef from "../../common/reactCreateRef";
import IsCapsLockActive from "../IsCapsLockActive";

// Password Min Length and Max Length
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 32;

const FormInput = styled.div`
	width: 100%;
	padding-top: 0.5em;
	padding-bottom: 0.5em;

	label {
		display: block;
		margin: 0;
	}

	input {
		position: relative;
		width: ${(p) => (p.inputWidth ? p.inputWidth : "100%")};
		margin: 0;
		background-color: white;
		border-radius: 0;
		border: 0;
		padding: 0.6254em;
		padding-right: 70px;
		color: ${theme.colours.primary};
		border: ${(p) => (p.isError === true ? "2px solid red" : "0")};

		@media screen and (max-width: ${theme.breakpoints.mobile}) {
			width: 100%;
		}

		&::-ms-reveal {
			display: none;
		}
	}
`;

const WrapEyeIcon = styled.i`
	position: absolute;
	margin: 14px 0px 0px -55px;
	cursor: pointer;
	color: ${theme.colours.primary};
`;

const WrapCapsLockIcon = styled.img`
	position: absolute;
	margin: 12px 0px 0px -30px;
	height: 20px;
	width: 20px;
`;

const Input = styled.input`
	${(props) =>
		props.readOnly &&
		css`
			opacity: 0.6;
			cursor: default;
			pointer-events: none;
		`};
`;

const BorderStyled = {
	border: `2px solid ${theme.colours.invalidBorder}`,
	color: theme.colours.invalidBorder,
};

export default class PasswordField extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			valid: {
				password: { isValid: true, message: "" },
			},
			icon: "fas fa-eye",
			message: "",
			type: "password",
			title: "View password",
		};
		this.el = reactCreateRef();
		this.iconRef = reactCreateRef();
	}

	componentDidMount() {
		if (document.msCapsLockWarningOff == false) {
			document.msCapsLockWarningOff = true;
		}
	}

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

	fieldIsValid = (field) => {
		let isValid = null;
		let result = { isValid: true, message: "" };
		let isRequired = this.props.isRequired || false;
		let raw = field.value;
		let fieldTitle = this.props.title;
		switch (this.props.validationType) {
			case validationType.string:
				if (typeof this.props.validator === "function") {
					let errorType = this.props.validator(raw);
					result.isValid = errorType !== null ? false : true;
					result.message = "";
					result.errorType = errorType;
				} else {
					isValid = raw ? result.isValid : isRequired ? false : true;
					result = { isValid: isValid, errorType: "", message: "" };
					if (!isValid) {
						result.errorType = errorType.required;
						result.message = fieldTitle + " is required.";
					}
				}
		}

		return result;
	};

	isValid = (_) => {
		const result = this.fieldIsValid(this.el.current);
		return result.isValid;
	};
	togglePassword = (e) => {
		let type;
		let icon;
		let title;
		const password = this.el.current;
		const inputType = password.getAttribute("type");
		if (inputType === "password") {
			type = "text";
			icon = "fas fa-eye-slash";
			title = "Hide password";
		} else {
			type = "password";
			icon = "fas fa-eye";
			title = "View password";
		}

		this.setState({ icon: icon, type: type, title: title });
	};

	render() {
		const { name, title, value, inputWidth = "100%", autoComplete = "off", placeHolder = "", isValid = true } = this.props;
		return (
			<>
				<FormInput inputWidth={inputWidth}>
					<label htmlFor={name}>{title}</label>
					<Input
						ref={this.el}
						type={this.state.type}
						name={name}
						value={value}
						onChange={this.onChange}
						onBlur={this.onBlur}
						minLength={PASSWORD_MIN_LENGTH}
						maxLength={PASSWORD_MAX_LENGTH}
						autoComplete={autoComplete}
						placeholder={placeHolder}
						style={isValid ? {} : BorderStyled}
					/>
					<WrapEyeIcon ref={this.iconRef} className={value ? this.state.icon : null} onClick={this.togglePassword} title={this.state.title} />
					<IsCapsLockActive inputRef={this.el}>
						{(active) => (
							<WrapCapsLockIcon
								src={require(active ? "../../assets/icons/capslock_on.svg" : "../../assets/icons/capslock_off.svg")}
								title={active ? "Caps lock is on" : "Caps lock is off"}
							/>
						)}
					</IsCapsLockActive>
				</FormInput>
			</>
		);
	}
}
