import React from "react";
import styled, { css } from "styled-components";

import googleEvent from "../../common/googleEvent";
import Header from "../../widgets/Header";
import theme from "../../common/theme";
import withApiConsumer from "../../common/withApiConsumer";
import validationType from "../../common/validationType";
import { Link } from "react-router-dom";
import TextField from "../../widgets/TextField";
import PasswordField from "../../widgets/PasswordField";
import SelectTitleField from "../../widgets/SelectTitleField";
import CheckBoxField from "../../widgets/CheckBoxField";
import MessageBox from "../../widgets/MessageBox";
import OrSeparator from "../../widgets/OrSeparator";
import HwbButton from "../../widgets/ProminentIconButton/HwbButton";
import messageType from "../../common/messageType";
import RegExPatterns from "../../common/RegExPatterns";
import errorType from "../../common/errorType";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import getUrl from "../../common/getUrl";
import reactCreateRef from "../../common/reactCreateRef";
import debounce from "../../common/debounce";
import staticValues from "../../common/staticValues";
import userTitles from "../../common/userTitles";
import passwordIsStrong from "../../common/validatePassword";
import AjaxSearchableDropdown from "../../widgets/AjaxSearchableDropdown";
import { colMd2 } from "../../common/style";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { PageContentCenter } from "../../widgets/Layout/PageContentCenter";
import { PageContentLarge } from "../../widgets/Layout/PageContentLarge";
import { supportEP } from "../../../../../Controller/app/common/sendEmailList";

const ERROR_MESSAGE = "Please ensure all fields are filled correctly.";
//Static value for display result in school dropdown
const SCHOOL_DROPDOWNDATA_SEARCH_QUERY_LIMIT = 3;
const SCHOOL_DROPDOWNDATA_LIMIT = staticValues.schoolAsyncDropDown.schoolResultLimit;
const SCHOOL_REQUEST_API = staticValues.api.schoolRequestApi;

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
	EMAIL_ERROR: "Please enter valid email",
	INSTITUTION_ERROR: "Please select institution",
	TITLE_ERROR: "Please select title",
};

const JUMP_TO_CONTENT_ID = "main-content";

/** UsageForm Form */
const RegisterPageForm = styled.form`
	max-width: 100%;
	min-height: 550px;
	padding: 1em 0 2em 0;
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		padding: 3em 0;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		min-height: 350px;
		padding: 2em 0;
	}
`;

const Paragraph = styled.p`
	margin: 0 0 3em 0;
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

	.dropDownDesign {
		> div:first-child {
			border: ${(p) => (p.isValid ? "none" : `2px solid ${theme.colours.invalidBorder}`)};
		}

		> div > div {
			padding: 6px 8px;
		}
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

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		width: 100%;
	}
`;

const SmallText = styled.span`
	text-align: left;
	font-weight: normal;
	display: block;
	margin-top: 1em;
	font-size: 16px;
	${(p) =>
		p.extraMargin == true &&
		css`
			margin-top: 1.5em;
		`}
`;

const FormHedaerWrapper = styled.div`
	padding: 20px 0 8px;
	background-color: ${theme.colours.bgDarkPurple};
	color: ${theme.colours.white};
`;

const FormIcon = styled.div`
	height: 63px;
	width: 63px;
	line-height: 60px;
	text-align: center;
	background-color: ${theme.colours.white};
	color: ${theme.colours.bgDarkPurple};
	border-radius: 50%;

	i {
		font-size: 35px;
		vertical-align: middle;
	}
`;

const FormTitle = styled(PageContentLarge)`
	font-size: 16px;

	h1 {
		font-size: 38px;
		line-height: 1.8;
		@media screen and (max-width: ${theme.breakpoints.mobile}) {
			font-size: 25px;
			margin-top: 0.5em;
		}
	}
`;

const BlueLink = styled.a`
	font-weight: bold;
	color: ${theme.colours.primary};
	background: transparent;
	text-decoration: none;
`;

const AnchorLink = styled(Link)`
	font-weight: bold;
	color: ${theme.colours.anchorLinkTextColor};
	background: transparent;
	text-decoration: none;
`;

const MoreLink = styled(AnchorLink)`
	font-weight: normal;
	font-size: 16px;
	display: inline-block;
	span {
		border-bottom: 1px solid #297682;
	}
	i {
		font-size: 14px;
		margin-left: 8px;
		font-weight: 400;
	}
	:hover i {
		transform: translateX(3px);
	}
`;

const FormDescriptionText = styled.div`
	font-size: 16px;
	font-weight: normal;
	width: 100%;
	margin-top: 15px;
`;
const FormDescriptionDiv = styled.div`
	display: inline-block;
	${(props) =>
		props.side === "left" &&
		css`
			width: 50px;
			vertical-align: top;
		`};
	${(props) =>
		props.side === "right" &&
		css`
			width: calc(100% - 50px);
		`};
`;
const SchoolInfoSection = styled.div`
	display: flex;
	width: 100%;
	${(props) =>
		props.topPadding &&
		css`
			margin-top: ${props.topPadding};
		`};
`;

const SchoolInfoSectionLeft = styled.div`
	display: flex;
	width: 50%;
	padding-right: 0.5em;
`;

const SchoolInfoSectionRight = styled.div`
	display: flex;
	width: 50%;
`;
const InformationText = styled.p`
	text-align: justify;
`;
const FormDescriptionIcon = styled.i`
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		font-size: 1.5em;
	}
`;
const LinkButton = styled.button`
	background: transparent;
	border: 0;
	color: ${theme.colours.primary};
	text-decoration: underline;
	width: 100%;
	padding: 0;
	text-align: left;
`;

const GetStartedButton = styled(AnchorLink)`
	font-size: 20px;
	font-weight: 400;
	padding: 0.5rem 0.75rem;
	background-color: ${theme.colours.primary};
	color: ${theme.colours.white};
	:hover {
		color: ${theme.colours.primary};
		background-color: ${theme.colours.white};
		border-color: ${theme.colours.primary};
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		font-size: 16px;
		padding: 0.5rem;
	}
	@media screen and (min-width: ${theme.breakpoints.mobile}) and (max-width: ${theme.breakpoints.tabletPro}) {
		font-size: 19px;
		padding: 0.75rem;
	}
	@media screen and (min-width: ${theme.breakpoints.desktop}) {
		font-size: 20px;
		padding: 0.75rem 4.05rem;
	}
`;

const Label = styled.label`
	margin-bottom: 0px;
	padding-top: 0.5em;
`;

const ContentSection = styled(Row)`
	justify-content: center;
`;

const BackGroundLime = styled.div`
	background-color: ${theme.colours.lime};
`;

const FirstSection = styled.div`
	${colMd2}
`;

const HwbWrap = styled.div`
	width: 100%;
	margin-top: 1.5em;
	margin-bottom: -1em;
`;

const Error = styled.div`
	margin-bottom: 0.2em;
	color: #cc0000;
	font-size: 0.9em;
	font-weight: bold;
	margin-top: -0.5em;
`;

const SchoolValidationError = styled(Error)`
	margin-top: -1.5em;
`;

const TermsValidationError = styled(Error)`
	margin-top: 0;
`;

const GenericErrorMessage = () => (
	<>
		Something went wrong with your registration. If you already have an account but forgot your password, reset it{" "}
		<Link to="/auth/forgot-password">here</Link>.
		<br />
		<br />
		If you do not yet have an account, please <a href={"mailto:" + supportEP + "?subject=Issue%20with%20registration"}>contact support</a>
	</>
);

export default withApiConsumer(
	class RegisterPage extends React.PureComponent {
		constructor(props) {
			super(props);
			this.state = {
				message: null,
				loading: false,
				asyncSelectLoading: false,
				submitted_registration_form: false,
				fields: {
					school: null,
					first_name: "",
					last_name: "",
					email: "",
					title: "",
					job_title: "",
					receive_marketing_emails: false,
					terms_accepted: false,
					password: "",
					password_confirm: "",
				},
				valid: {
					email: { isValid: true, message: "" },
					school: { isValid: true, message: "" },
					title: { isValid: true, message: "" },
					first_name: { isValid: true, message: "" },
					last_name: { isValid: true, message: "" },
					job_title: { isValid: true, message: "" },
					receive_marketing_emails: { isValid: true, message: "" },
					terms_accepted: { isValid: true, message: "" },
					password: { isValid: true, message: "" },
					password_confirm: { isValid: true, message: "" },
				},
				emailDomain: null,
				showInformationText: false,
			};

			this.ref_email = reactCreateRef();
			this.ref_school = reactCreateRef();
			this.ref_title = reactCreateRef();
			this.ref_first_name = reactCreateRef();
			this.ref_last_name = reactCreateRef();
			this.ref_job_title = reactCreateRef();
			this.ref_receive_marketing_emails = reactCreateRef();
			this.ref_terms_accepted = reactCreateRef();
			this.ref_password_confirm = reactCreateRef();
			this.ref_password = reactCreateRef();
		}

		componentDidMount() {
			this._isMounted = true;
			/** loading schooldata at a time of landing on page */
			//this.bindSchoolData();
		}

		componentWillUnmount() {
			if (this._timeout) {
				clearTimeout(this._timeout);
			}
			delete this._timeout;
			delete this._isMounted;
		}

		/*Bind school data initialy*/
		bindSchoolData = () => {
			const apiParams = Object.create(null);
			apiParams.include_extra_data = true;
			apiParams.domainHasChanged = true;
			if (this.state.fields.email && this.state.valid.email.isValid) {
				const emailSplitValues = this.state.fields.email.split("@");
				const emailDomain = emailSplitValues[1];
				apiParams.domain = emailDomain;
			}

			this.props.api(SCHOOL_REQUEST_API, apiParams).then((result) => {
				const resultData = result.result;
				if (resultData.length === 1) {
					if (this.state.fields.email && this.state.valid.email.isValid) {
						this.handleDrpChange(
							"school",
							{
								label: resultData[0].name,
								value: resultData[0].id,
								address1: resultData[0].address1,
								address2: resultData[0].address2,
								city: resultData[0].city,
								post_code: resultData[0].post_code,
							},
							{
								isValid: true,
								errorType: "",
								message: "",
							}
						);
					}
				}
				this.setState({ asyncSelectLoading: false });
			});
		};

		handleSubmit = (e) => {
			e.preventDefault();
			// Prevent accidental double-submission.
			this.setState({ loading: true });

			//check with all form input fields
			let valid = Object.assign({}, this.state.valid);
			Object.keys(valid).forEach((field) => {
				switch (field) {
					case "email":
						valid[field].isValid = this.ref_email.current.isValid();
						break;
					case "school":
						valid[field].isValid = this.ref_school.current.isValid();
						break;
					case "title":
						valid[field].isValid = this.ref_title.current.isValid();
						break;
					case "first_name":
						valid[field].isValid = this.ref_first_name.current.isValid();
						break;
					case "last_name":
						valid[field].isValid = this.ref_last_name.current.isValid();
						break;
					case "job_title":
						valid[field].isValid = this.ref_job_title.current.isValid();
						break;
					case "receive_marketing_emails":
						valid[field].isValid = this.ref_receive_marketing_emails.current.isValid();
						break;
					case "terms_accepted":
						valid[field].isValid = this.ref_terms_accepted.current.isValid();
						break;
					case "password":
						valid[field].isValid = this.ref_password.current.isValid();
						break;
					case "password_confirm":
						valid[field].isValid = this.ref_password_confirm.current.isValid();
						break;
				}
			});
			this.setState({ valid: valid, message: null }, this.submitFormRequest);
		};

		submitFormRequest = () => {
			if (!this.isFormValid().status) {
				googleEvent(
					"register",
					"registration",
					"error",
					Object.keys(this.state.valid)
						.filter((v) => !this.state.valid[v].isValid)
						.join("|")
				);
				this.setState({ loading: false });
				return false;
			}
			this.props
				.api("/auth/register", {
					school: this.state.fields.school.value,
					first_name: this.state.fields.first_name,
					last_name: this.state.fields.last_name,
					email: this.state.fields.email,
					title: this.state.fields.title,
					job_title: this.state.fields.job_title,
					receive_marketing_emails: this.state.fields.receive_marketing_emails,
					terms_accepted: this.state.fields.terms_accepted,
					password: this.state.fields.password,
					password_confirm: this.state.fields.password_confirm,
				})
				.then((result) => {
					googleEvent("register", "registration", "success");
					this.setState({
						message: "Successfully registered.",
						auto_registered: result.auto_registered,
						submitted_registration_form: true,
					});
				})
				.catch((result) => {
					googleEvent("register", "registration", "error", result);
					this.setState({
						message: <GenericErrorMessage />,
						auto_registered: null,
					});
				})
				.finally(() => {
					this._timeout = setTimeout(() => {
						if (this._isMounted) {
							this.setState({ loading: false });
						}
					}, 500);
				});
		};
		confirmedPassword = (password_confirm) => {
			return password_confirm !== "" && this.state.fields.password === password_confirm ? true : false;
		};

		/** check form input validation */
		isFormValid() {
			let status = true;
			let message = "";
			let valid = Object.assign({}, this.state.valid);
			Object.keys(this.state.valid).forEach((field) => {
				const result = this.state.valid[field];
				if (result && !result.isValid) {
					status = false;
					const errorMessage = result.message;
					message = ERROR_MESSAGE;
					switch (field) {
						case "email":
							valid[field].message = MESSAGES.EMAIL_ERROR;
							break;
						case "school":
							valid[field].message = MESSAGES.INSTITUTION_ERROR;
							break;
						case "title":
							valid[field].message = MESSAGES.TITLE_ERROR;
							break;
						case "password":
							if (result.errorType === errorType.passwordNotProvide) {
								valid[field].message = MESSAGES.PASSWORD_NOT_PROVIDED;
							} else if (result.errorType === errorType.passwordLeast8Character) {
								valid[field].message = MESSAGES.PASSWORD_8_CHARACTER;
							} else if (result.errorType === errorType.passwordLowerCharacter) {
								valid[field].message = MESSAGES.PASSWORD_LOWER_CHARACTER;
							} else if (result.errorType === errorType.passwordUpperCharacter) {
								valid[field].message = MESSAGES.PASSWORD_UPPER_CHARACTER;
							} else if (result.errorType === errorType.passwordNumberCharacter) {
								valid[field].message = MESSAGES.PASSWORD_NUMBER_CHARACTER;
							} else if (result.errorType === errorType.passwordSpecialCharacter) {
								valid[field].message = MESSAGES.PASSWORD_SPECIAL_CHARACTER;
							} else {
								valid[field].message = MESSAGES.PASSWORD_NOT_PROVIDED;
							}
							break;
						case "password_confirm":
							if (result.errorType === errorType.passwordNotProvide) {
								valid[field].message = MESSAGES.PASSWORD_NOT_PROVIDED;
							} else if (result.errorType === errorType.passwordLeast8Character) {
								valid[field].message = MESSAGES.PASSWORD_8_CHARACTER;
							} else if (result.errorType === errorType.passwordLowerCharacter) {
								valid[field].message = MESSAGES.PASSWORD_LOWER_CHARACTER;
							} else if (result.errorType === errorType.passwordUpperCharacter) {
								valid[field].message = MESSAGES.PASSWORD_UPPER_CHARACTER;
							} else if (result.errorType === errorType.passwordNumberCharacter) {
								valid[field].message = MESSAGES.PASSWORD_NUMBER_CHARACTER;
							} else if (result.errorType === errorType.passwordSpecialCharacter) {
								valid[field].message = MESSAGES.PASSWORD_SPECIAL_CHARACTER;
							} else if (result.errorType === errorType.confirmPasswordNotMatch) {
								valid[field].message = MESSAGES.confirmPasswordNotMatch;
							} else {
								valid[field].message = MESSAGES.PASSWORD_NOT_PROVIDED;
							}
							break;
						case "first_name":
							if (result.errorType === errorType.length || result.errorType === errorType.required) {
								valid[field].message = "First name not provided.";
							} else {
								valid[field].message = errorMessage ? errorMessage : "First name not provided.";
							}
							break;
						case "last_name":
							if (result.errorType === errorType.length || result.errorType === errorType.required) {
								valid[field].message = "Last name not provided.";
							} else {
								valid[field].message = errorMessage ? errorMessage : "Last name not provided.";
							}
							break;
						case "job_title":
							if (result.errorType === errorType.length) {
								valid[field].message = "Job title must be 150 characters or less.";
							} else {
								message = errorMessage;
								valid[field].message = errorMessage;
							}
							break;
						case "terms_accepted":
							valid[field].message = "We need you to agree to the terms and conditions before you register.";
							break;
					}
				}
			});
			const result = { valid: valid, status: status, message: message };
			return result;
		}

		/** handle text input change event*/
		handleInputChange = (name, value, valid) => {
			// Clone the fields object in state.
			let fields = Object.assign({}, this.state.fields);
			let formValid = Object.assign({}, this.state.valid);
			let message = null;

			fields[name] = value;
			formValid[name] = valid;

			const newState = { fields: fields, valid: formValid, message: message };
			if (name === "email") {
				this.setState(newState, this.handleEmailChange);
			} else {
				this.setState(newState);
			}
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

		handleEmailChange = debounce(() => {
			if (this.state.valid.email.isValid) {
				this.setState(
					{
						asyncSelectLoading: true,
					},
					this.bindSchoolData
				);
			} else {
				// Not binding the data if we dont have valid email id
				//this.bindSchoolData(null, true);
			}
		}, staticValues.debounceTime);

		/** handle school dropdown change event*/
		handleDrpChange = (name, select_school, valid) => {
			let fields = Object.assign({}, this.state.fields);
			let formValid = Object.assign({}, this.state.valid);

			fields[name] = select_school;
			formValid[name] = valid;

			this.setState({ fields: fields, valid: formValid, message: null });
		};

		/** handle checkbox input change event*/
		handleCheckBoxChange = (name, value, isValid) => {
			// Clone the fields object in state.
			let fields = Object.assign({}, this.state.fields);
			let formValid = Object.assign({}, this.state.valid);
			fields[name] = value;
			formValid[name] = isValid;
			this.setState({ fields: fields, valid: formValid, message: null });
		};

		showInformationText = (event) => {
			event.preventDefault();
			this.setState({
				showInformationText: !this.state.showInformationText,
			});
		};

		updateApiCall = (url, params) => {
			let partialPostCode,
				partialMatch,
				fullMatch,
				fullPostCode = null;
			partialMatch = params.query.match(
				/^(([Gg][Ii][Rr] 0[Aa]{2})|(([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?)))))$/
			);
			fullMatch = params.query.match(
				/^(([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2}))$/
			);
			partialPostCode = partialMatch !== null ? true : false;
			fullPostCode = fullMatch !== null ? true : false;

			const newParams = Object.create(null);
			newParams.include_extra_data = true;
			newParams.limit = SCHOOL_DROPDOWNDATA_LIMIT;
			if (partialPostCode) {
				newParams.partial_postcode_search = true;
			}
			if (fullPostCode) {
				newParams.full_postcode_search = true;
			}

			if (params.query) {
				newParams.query = params.query;
			}

			return {
				url: url,
				params: newParams,
			};
		};

		render() {
			const { message } = this.state;
			let shownSchoolDetails = null;
			if (this.state.fields.school) {
				shownSchoolDetails = this.state.fields.school;
			}
			const isShowSchoolInfo = !!shownSchoolDetails;
			const divStyleMarginTop = {
				marginTop: isShowSchoolInfo ? "0px" : "-20px",
				width: `100%`,
			};

			let errorMessage,
				disabled = false;
			errorMessage = message && !this.state.submitted_registration_form ? <MessageBox message={message} /> : null;
			const formValidation = this.isFormValid();
			if (formValidation && !formValidation.status) {
				disabled = true;
				errorMessage = <MessageBox type={messageType.error} title="" message={formValidation.message ? formValidation.message : ERROR_MESSAGE} />;
			}
			const checkBoxText = (
				<div>
					<b>I agree</b> to CLA's{" "}
					<a href={getUrl("/terms-of-use")} target="_blank">
						Terms and Conditions
					</a>{" "}
					and{" "}
					<a href="https://www.cla.co.uk/privacy-policy" target="_blank">
						Privacy Policy
					</a>
				</div>
			);

			const successRegText = this.state.auto_registered ? (
				<>
					<SmallText>
						Please check your email and click the link to confirm your email address is correct.
						<br />
						You will need to do this to be able to continue to use the Education Platform in the future.
						<br />
						The link in the email will expire in three days.
					</SmallText>
					<SmallText>
						You are now registered, so you can start to use the Education Platform.
						<br />
						You can find and <MoreLink to="/unlock">unlock content</MoreLink>, <MoreLink to="/works?filter_misc=unlock_books">make a copy</MoreLink>,
						and share it right away.
					</SmallText>
					<SmallText extraMargin={true}>
						<GetStartedButton to="/">Start using the Education Platform</GetStartedButton>
					</SmallText>
				</>
			) : (
				<>
					<SmallText>
						Please check your email and click the link to confirm your email address is correct.
						<br />
						You will need to do this to be able to continue to use the Education Platform in the future.
						<br />
						The link in the email will expire in three days.
					</SmallText>
					<SmallText>
						You are now registered, so you can start to use the Education Platform.
						<br />
						You can find and <MoreLink to="/unlock">unlock content</MoreLink> right away.
						<br />
						Once we've checked and approved your registration you will also be able to make copies and share them.
					</SmallText>
					<SmallText extraMargin={true}>
						<GetStartedButton to="/">Start using the Education Platform</GetStartedButton>
					</SmallText>
				</>
			);

			const passwordFields = (
				<>
					<div style={divStyleMarginTop}>
						<PasswordField
							ref={this.ref_password}
							isValid={this.state.valid.password.isValid}
							value={this.state.fields.password}
							onChange={this.handleInputChange}
							onBlur={this.handleInputChange}
							inputWidth="290px"
							name="password"
							title="Password"
							isRequired={true}
							validationType={validationType.string}
							validator={passwordIsStrong}
							autoComplete={"new-password"}
						/>
						{!this.state.valid["password"].isValid && <Error>{this.state.valid["password"].message}</Error>}
					</div>
					<PasswordField
						ref={this.ref_password_confirm}
						name="password_confirm"
						title="Confirm password"
						value={this.state.fields.password_confirm}
						isValid={this.state.valid.password_confirm.isValid}
						onChange={this.handleInputChange}
						onBlur={this.handleInputChange}
						isRequired={true}
						validationType={validationType.string}
						inputWidth="290px"
						validator={passwordIsStrong}
						autoComplete={"new-password"}
					/>
					{!this.state.valid["password_confirm"].isValid && <Error>{this.state.valid["password_confirm"].message}</Error>}
					<InformationText>
						Your password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one
						special character (such as !*$ or #).
					</InformationText>
					<SelectTitleField
						ref={this.ref_title}
						name="title"
						title="Title"
						value={this.state.fields.title}
						isValid={this.state.valid.title.isValid}
						onChange={this.handleInputChange}
						onBlur={this.handleInputChange}
						isRequired={true}
						inputWidth="250px"
						options={userTitles}
					/>
					{!this.state.valid["title"].isValid && <Error>{this.state.valid["title"].message}</Error>}
				</>
			);
			const pageTitle = this.state.submitted_registration_form ? "Get started – Education Platform" : PageTitle.register;
			const pageHeading = this.state.submitted_registration_form ? "Get started" : "Register";
			const checkboxFirstText = <div>Please add me to the CLA mailing list. </div>;
			const receiveLink = <LinkButton onClick={this.showInformationText}>What will I receive?</LinkButton>;

			return (
				<>
					<HeadTitle title={pageTitle} />
					<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
					<FormHedaerWrapper id={JUMP_TO_CONTENT_ID}>
						<Container>
							<ContentSection>
								<PageContentCenter>
									<Row>
										<FirstSection>
											<FormIcon>
												<i className="fal fa-user"></i>
											</FormIcon>
										</FirstSection>
										<FormTitle>
											<h1>{pageHeading}</h1>
										</FormTitle>
									</Row>
								</PageContentCenter>
							</ContentSection>
						</Container>
					</FormHedaerWrapper>
					<BackGroundLime>
						<Container>
							<ContentSection>
								<PageContentCenter>
									<Row>
										<FirstSection />
										<PageContentLarge>
											<RegisterPageForm name="registerForm">
												{errorMessage}
												{!this.state.submitted_registration_form ? (
													<>
														<FormDescriptionText>
															<FormDescriptionDiv side="left">
																<FormDescriptionIcon className="fa fa-2x fa-exclamation-circle" aria-hidden="true"></FormDescriptionIcon>
															</FormDescriptionDiv>
															<FormDescriptionDiv side="right">
																<p>
																	You must be a member of staff at a UK school or FE college.
																	<br /> Already have an account?{" "}
																	<MoreLink to="/sign-in">
																		<span> Sign In</span>
																		<i className="fal fa-chevron-right"></i>
																	</MoreLink>
																</p>
															</FormDescriptionDiv>
														</FormDescriptionText>
														<FormBodyContainer isValid={this.state.valid.school.isValid}>
															{/* <HwbWrap>
																<HwbButton />
																<OrSeparator />
															</HwbWrap> */}

															<TextField
																ref={this.ref_email}
																name="email"
																title="Email"
																value={this.state.fields.email}
																isValid={this.state.valid.email.isValid}
																placeHolder={"e.g. your.name@yourschool.sch.uk"}
																onChange={this.handleInputChange}
																onBlur={this.handleInputChange}
																isRequired={true}
																validationType={validationType.email}
															/>
															{!this.state.valid["email"].isValid ? <Error>{this.state.valid["email"].message}</Error> : null}
															<Label htmlFor="school">
																{"Search for your institution's name, town or postcode"}{" "}
																{this.state.asyncSelectLoading ? <i className="fas fa-spinner fa-spin"></i> : ""}
															</Label>
															<AjaxSearchableDropdown
																ref={this.ref_school}
																required={true}
																api={this.props.api}
																requestApi={staticValues.api.schoolRequestApi}
																name="school"
																value={this.state.fields.school}
																placeholder="Select..."
																onChange={this.handleDrpChange}
																onBlur={this.handleInputChange}
																minQueryLength={SCHOOL_DROPDOWNDATA_SEARCH_QUERY_LIMIT}
																labelIsOnTop={true}
																showDefaultToolTipOnError={true}
																updateApiCall={this.updateApiCall}
																asyncSelectLoading={this.state.asyncSelectLoading}
																style={{ width: "100%" }}
															/>
															{!this.state.valid["school"].isValid ? (
																<SchoolValidationError>{this.state.valid["school"].message}</SchoolValidationError>
															) : null}

															<Paragraph>
																If you are unable to find your institution, please send us a <br />{" "}
																<BlueLink href="https://educationplatform.zendesk.com/hc/en-us/requests/new" target="_blank">
																	support&nbsp;request.
																</BlueLink>
															</Paragraph>

															{isShowSchoolInfo ? (
																<>
																	<SchoolInfoSection topPadding={`-20px`}>
																		<SchoolInfoSectionLeft>
																			<TextField name="address1" title="Address 1" value={shownSchoolDetails.address1} isReadonly={true} />
																		</SchoolInfoSectionLeft>
																		<SchoolInfoSectionRight>
																			<TextField name="address2" title="Address 2" value={shownSchoolDetails.address2} isReadonly={true} />
																		</SchoolInfoSectionRight>
																	</SchoolInfoSection>

																	<SchoolInfoSection>
																		<SchoolInfoSectionLeft>
																			<TextField name="city" title="City" value={shownSchoolDetails.city} isReadonly={true} />
																		</SchoolInfoSectionLeft>
																		<SchoolInfoSectionRight>
																			<TextField name="post_code" title="Postcode" value={shownSchoolDetails.post_code} isReadonly={true} />
																		</SchoolInfoSectionRight>
																	</SchoolInfoSection>
																</>
															) : (
																""
															)}
															{passwordFields}
															<TextField
																ref={this.ref_first_name}
																name="first_name"
																title="First name"
																value={this.state.fields.first_name}
																isValid={this.state.valid.first_name.isValid}
																placeHolder={""}
																onChange={this.handleInputChange}
																onBlur={this.handleInputChange}
																isRequired={true}
																inputWidth="290px"
																minLength={1}
																maxLength={100}
																patterns={RegExPatterns.name}
																validationType={validationType.string}
															/>
															{!this.state.valid["first_name"].isValid && <Error>{this.state.valid["first_name"].message}</Error>}

															<TextField
																ref={this.ref_last_name}
																name="last_name"
																title="Last name"
																value={this.state.fields.last_name}
																isValid={this.state.valid.last_name.isValid}
																placeHolder={""}
																onChange={this.handleInputChange}
																onBlur={this.handleInputChange}
																isRequired={true}
																inputWidth="290px"
																minLength={1}
																maxLength={100}
																patterns={RegExPatterns.name}
																validationType={validationType.string}
															/>
															{!this.state.valid["last_name"].isValid && <Error>{this.state.valid["last_name"].message}</Error>}

															<TextField
																ref={this.ref_job_title}
																name="job_title"
																title="Job title"
																value={this.state.fields.job_title}
																isValid={this.state.valid.job_title.isValid}
																placeHolder={""}
																onChange={this.handleInputChange}
																onBlur={this.handleInputChange}
																isRequired={false}
																inputWidth="290px"
																maxLength="150"
																validationType={validationType.string}
															/>
															<CheckBoxField
																ref={this.ref_receive_marketing_emails}
																name="receive_marketing_emails"
																title={checkboxFirstText}
																extraText={receiveLink}
																checked={this.state.fields.receive_marketing_emails}
																isRequired={false}
																isValid={this.state.valid.receive_marketing_emails.isValid}
																onChange={this.handleCheckBoxChange}
															/>

															{this.state.showInformationText && (
																<InformationText>
																	We are keen to let you know about new developments, events, offers, and news about the CLA Education Licence and the
																	Education Platform. We may also contact you to ask for feedback to improve your experience.
																</InformationText>
															)}

															<CheckBoxField
																ref={this.ref_terms_accepted}
																name="terms_accepted"
																title={checkBoxText}
																checked={this.state.fields.terms_accepted}
																isRequired={true}
																isValid={this.state.valid.terms_accepted.isValid}
																onChange={this.handleCheckBoxChange}
															/>
															{!this.state.valid["terms_accepted"].isValid && (
																<TermsValidationError>{this.state.valid["terms_accepted"].message}</TermsValidationError>
															)}
															<FormContainerButton>
																<Button onClick={this.handleSubmit} disabled={disabled || this.state.loading} name="btnRegister">
																	{" "}
																	Register{" "}
																</Button>
															</FormContainerButton>
														</FormBodyContainer>
													</>
												) : (
													<>{successRegText}</>
												)}
											</RegisterPageForm>
										</PageContentLarge>
									</Row>
								</PageContentCenter>
							</ContentSection>
						</Container>
					</BackGroundLime>
				</>
			);
		}
	}
);
