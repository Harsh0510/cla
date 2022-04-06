import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import passwordIsStrong from "../../common/validatePassword";
import CheckBoxField from "../../widgets/CheckBoxField";
import MessageBox from "../MessageBox";
import messageType from "../../common/messageType";
import getUrl from "../../common/getUrl";
import errorType from "../../common/errorType";
import validationType from "../../common/validationType";
import { Link } from "react-router-dom";
import reactCreateRef from "../../common/reactCreateRef";
import PasswordField from "../PasswordField";

const ERROR_MESSAGE = "Please ensure all fields are filled correctly.";
// Display message based on event
const MESSAGES = {
	confirmPasswordNotMatch: "You have not entered a matching password, please try again.",
	passwordValidationMessage: `Your password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character.`,
	passwordLengthMessage: "Your password must be between 8 to 16 characters.",
	acceptTermsConditions: "Please accept the terms & conditions.",
	PASSWORD_NOT_PROVIDED: "Password not provided",
	PASSWORD_8_CHARACTER: "Password must be at least 8 characters.",
	PASSWORD_LOWER_CHARACTER: "Password must contain at least one lowercase letter.",
	PASSWORD_UPPER_CHARACTER: "Password must contain at least one uppercase letter.",
	PASSWORD_NUMBER_CHARACTER: "Password must contain at least one number.",
	PASSWORD_SPECIAL_CHARACTER: "Password must contain at least one special character.",
};

const CustomCheckBoxField = styled.div`
	margin-top: 1em;
`;

/** UsageForm Form */
const PageForm = styled.form`
	max-width: 100%;
	min-height: 490px;
	padding: 1em 0 2em 0;
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		padding: 3em 0;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		min-height: 200px;
		padding: 2em 0;
	}
`;

const FormContainerButton = styled.div`
	width: 100%;
	padding: 1em 0 1em 0;
`;

const Button = styled.button`
	background-color: ${theme.colours.primaryLight};
	color: ${theme.colours.white};
	padding: 0.5em;
	margin-top: 0em;
	border: none;
	border-radius: 0;
	font-size: 24px;
	min-width: 220px;
	display: block;
	transform: opacity 100ms;

	${(p) =>
		p.disabled == true &&
		css`
			pointer-events: none;
			opacity: 0.3;
		`}

	${(p) =>
		p.hide == true &&
		css`
			display: none;
		`}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		width: 100%;
	}
`;

const AnchorLink = styled(Link)`
	font-weight: bold;
	color: ${theme.colours.white};
	background: transparent;
	text-decoration: none;
`;

export default class PasswordPage extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			message: props.message,
			messageType: props.messageType,
			fields: {
				password: "",
				password_confirm: "",
				terms_accepted: false,
			},
			valid: {
				password: { isValid: true, message: "" },
				password_confirm: { isValid: true, message: "" },
				terms_accepted: { isValid: true, message: "" },
			},
			loading: props.loading,
		};
		this.ref_password = reactCreateRef();
		this.ref_password_confirm = reactCreateRef();
		this.ref_terms_accepted = reactCreateRef();
	}

	confirmedPassword = (password_confirm) => {
		return password_confirm !== "" && this.state.fields.password === password_confirm ? true : false;
	};

	/**
	 * Handles the submission
	 */
	submitFormRequest = () => {
		if (!this.isFormValid().status) {
			this.setState({ loading: false });
			return false;
		} else {
			const params = {
				password: this.state.fields.password,
				password_confirm: this.state.fields.password_confirm,
				terms_accepted: !this.props.isTCRequired ? true : this.state.fields.terms_accepted,
			};
			this.props.handleSubmit(params);
		}
	};

	/** handle input change event*/
	handleInputChange = (name, value, valid) => {
		// Clone the fields object in state.
		let fields = Object.assign({}, this.state.fields);
		let formValid = Object.assign({}, this.state.valid);

		fields[name] = value;
		formValid[name] = valid;
		this.setState({ fields: fields, valid: formValid, message: null });
	};

	/** handle checkbox  input change event*/
	handleCheckBoxChange = (name, value, isValid) => {
		// Clone the fields object in state.
		let fields = Object.assign({}, this.state.fields);
		let formValid = Object.assign({}, this.state.valid);
		fields[name] = value;
		formValid[name] = isValid;
		this.setState({ fields: fields, valid: formValid, message: null });
	};

	handleInputBlur = (name, value, valid) => {
		if (name === "password_confirm" && this.state.fields.password !== "" && valid.isValid) {
			let formValid = Object.assign({}, this.state.valid);
			var result = this.confirmedPassword(value);
			if (!result) {
				formValid[name] = {
					isValid: false,
					errorType: errorType.confirmPasswordNotMatch,
					message: MESSAGES.confirmPasswordNotMatch,
					messageType: messageType.error,
				};
			} else {
				formValid[name] = {
					isValid: valid.isValid,
					errorType: "",
					message: "",
					messageType: "",
				};
			}
			this.setState({ valid: formValid });
		}
	};

	/** check form input validation */
	isFormValid() {
		let status = true;
		let message = "";
		Object.keys(this.state.valid).forEach((field) => {
			const result = this.state.valid[field];
			if (result && !result.isValid && status) {
				status = false;
				const errorMessage = result.message;
				switch (field) {
					case "password":
						if (result.errorType === errorType.passwordNotProvide) {
							message = MESSAGES.PASSWORD_NOT_PROVIDED;
						} else if (result.errorType === errorType.passwordLeast8Character) {
							message = MESSAGES.PASSWORD_8_CHARACTER;
						} else if (result.errorType === errorType.passwordLowerCharacter) {
							message = MESSAGES.PASSWORD_LOWER_CHARACTER;
						} else if (result.errorType === errorType.passwordUpperCharacter) {
							message = MESSAGES.PASSWORD_UPPER_CHARACTER;
						} else if (result.errorType === errorType.passwordNumberCharacter) {
							message = MESSAGES.PASSWORD_NUMBER_CHARACTER;
						} else if (result.errorType === errorType.passwordSpecialCharacter) {
							message = MESSAGES.PASSWORD_SPECIAL_CHARACTER;
						} else {
							message = ERROR_MESSAGE;
						}
						break;
					case "password_confirm":
						if (result.errorType === errorType.passwordNotProvide) {
							message = MESSAGES.PASSWORD_NOT_PROVIDED;
						} else if (result.errorType === errorType.passwordLeast8Character) {
							message = MESSAGES.PASSWORD_8_CHARACTER;
						} else if (result.errorType === errorType.passwordLowerCharacter) {
							message = MESSAGES.PASSWORD_LOWER_CHARACTER;
						} else if (result.errorType === errorType.passwordUpperCharacter) {
							message = MESSAGES.PASSWORD_UPPER_CHARACTER;
						} else if (result.errorType === errorType.passwordNumberCharacter) {
							message = MESSAGES.PASSWORD_NUMBER_CHARACTER;
						} else if (result.errorType === errorType.passwordSpecialCharacter) {
							message = MESSAGES.PASSWORD_SPECIAL_CHARACTER;
						} else if (result.errorType === errorType.confirmPasswordNotMatch) {
							message = MESSAGES.confirmPasswordNotMatch;
						} else {
							message = ERROR_MESSAGE;
						}
						break;
					case "terms_accepted":
						message = MESSAGES.acceptTermsConditions;
						break;
				}
			}
		});
		const result = { status: status, message: message, messageType: messageType.error };
		return result;
	}

	handleSubmit = (e) => {
		e.preventDefault();
		// Prevent accidental double-submission.
		this.setState({ loading: true });

		//check with all form input  fields
		let valid = Object.assign({}, this.state.valid);

		/* if TandC is not required delete it from validation object */
		if (!this.props.isTCRequired) {
			delete valid.terms_accepted;
		}
		Object.keys(valid).forEach((field) => {
			switch (field) {
				case "password":
					valid[field].isValid = this.ref_password.current.isValid();
					break;
				case "password_confirm":
					valid[field].isValid = this.ref_password_confirm.current.isValid();
					break;
				case "terms_accepted":
					valid[field].isValid = this.ref_terms_accepted.current.isValid();
					break;
			}
		});
		this.setState({ valid: valid, message: null }, this.submitFormRequest);
	};

	render() {
		const { hide, message, messageType, isTCRequired = true } = this.props;
		const checkBoxText = (
			<div>
				<b>I Agree</b> to CLA's{" "}
				<a href={getUrl(`/terms-of-use`)} target="_blank">
					Terms and Conditions
				</a>{" "}
				and{" "}
				<a href="https://www.cla.co.uk/privacy-policy" target="_blank">
					Privacy Policy
				</a>
			</div>
		);

		//const message= this.state.message;
		let errorMessage,
			disabled = false;
		let loading = this.state.loading;
		const formValidation = this.isFormValid();
		if (formValidation && !formValidation.status) {
			disabled = true;
			errorMessage = (
				<MessageBox type={formValidation.messageType} title="" message={formValidation.message ? formValidation.message : ERROR_MESSAGE} />
			);
		} else {
			loading = this.props.loading;
			errorMessage = message ? <MessageBox message={message} type={messageType} /> : null;
		}

		return (
			<>
				{errorMessage}
				{!hide ? (
					<PageForm name="pageInputForm">
						<PasswordField
							ref={this.ref_password}
							name="password"
							title="New password"
							value={this.state.fields.password}
							isValid={this.state.valid.password.isValid}
							onChange={this.handleInputChange}
							isRequired={true}
							validationType={validationType.string}
							validator={passwordIsStrong}
						/>
						<PasswordField
							ref={this.ref_password_confirm}
							name="password_confirm"
							title="Confirm password"
							value={this.state.fields.password_confirm}
							isValid={this.state.valid.password_confirm.isValid}
							onChange={this.handleInputChange}
							onBlur={this.handleInputBlur}
							isRequired={true}
							validationType={validationType.string}
							validator={passwordIsStrong}
						/>
						{isTCRequired ? (
							<CustomCheckBoxField>
								<CheckBoxField
									ref={this.ref_terms_accepted}
									name="terms_accepted"
									title={checkBoxText}
									checked={this.state.fields.terms_accepted}
									isRequired={true}
									isValid={this.state.valid.terms_accepted.isValid}
									onChange={this.handleCheckBoxChange}
								/>
							</CustomCheckBoxField>
						) : null}
						<FormContainerButton>
							<Button onClick={this.handleSubmit} disabled={disabled || loading} name="btnSubmit">
								Submit
							</Button>
						</FormContainerButton>
					</PageForm>
				) : (
					""
				)}
			</>
		);
	}
}
