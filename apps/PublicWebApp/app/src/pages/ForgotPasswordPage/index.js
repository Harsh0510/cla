import React from "react";
import Header from "../../widgets/Header";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import withApiConsumer from "../../common/withApiConsumer";
import { Link } from "react-router-dom";
import TextField from "../../widgets/TextField";
import reactCreateRef from "../../common/reactCreateRef";
import validationType from "../../common/validationType";
import MessageBox from "../../widgets/MessageBox";
import messageType from "../../common/messageType";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import customSetTimeout from "../../common/customSetTimeout";
import { colMd2 } from "../../common/style";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { PageContentCenter } from "../../widgets/Layout/PageContentCenter";
import { PageContentLarge } from "../../widgets/Layout/PageContentLarge";
import sendEmailList from "../../common/sendEmailList";

const ERROR_MESSAGE = "Please enter a valid email address.";
const JUMP_TO_CONTENT_ID = "main-content";
const PageWrap = styled.div`
	background-color: ${theme.colours.lime};
	min-height: 517px;
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		min-height: 300px;
	}
`;
const ForgotForm = styled.form`
	max-width: 100%;
	padding-top: 1em;
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		padding: 3em 0;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding: 0.5em;
	}
`;

const FormInput = styled.div`
	width: 100%;
	padding-top: 0.5em;
	padding-bottom: 0.5em;

	label {
		display: block;
	}

	input {
		width: 100%;
		margin-right: 0;
		margin-left: 0;
		background-color: ${theme.colours.white};
		border-radius: 0;
		border: 0;
		padding: 0.6254em;
		color: ${theme.colours.primary};
	}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		label {
			margin-bottom: 0px;
		}
	}
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

	${(p) =>
		p.hide === false &&
		css`
			background-image: url(${require("../../assets/icons/Refresh.svg")});
			background-position: center;
			background-repeat: no-repeat;
		`}

	${(p) =>
		p.hide === true &&
		css`
			i {
				font-size: 35px;
				vertical-align: middle;
			}
		`}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		margin-bottom: 1em;
	}
`;

const FormTitle = styled(PageContentLarge)`
	font-size: 16px;
	h1 {
		font-size: 38px;
		line-height: 1.2;
		margin-top: 9px;
	}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		h1 {
			font-size: 25px;
		}
		p {
			font-size: 17px;
		}
	}
`;

const FormBodyContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	max-width: 100%;
	margin-top: 2em;

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

const FormContainerButton = styled.div`
	width: calc(100%);
	padding: 1em 0;

	display: flex;
	box-sizing: border-box;
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		width: 100%;
		padding: 0;
		flex-direction: column;
	}
`;

const Button = styled.button`
	background-color: ${theme.colours.primaryLight};
	color: ${theme.colours.white};
	padding: 0.5em;
	margin-top: 0em;
	border: none;
	border-radius: 0;
	font-size: 24px;
	width: 302px;
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
		margin-top: 1em;
		font-size: 22px;
	}
`;

const SmallText = styled.span`
	text-align: center;
	font-weight: normal;
	display: inline-block;
	text-decoration: underline;
`;

const MoreLink = styled(Link)`
	color: ${theme.colours.primary};
	background: transparent;
	text-decoration: none;
	font-weight: normal;
	font-size: 16px;
	display: inline-block;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding-left: 0.5em;
	}
`;

const WrapRow = styled(Row)`
	justify-content: center;
`;

const WrapDiv = styled.div`
	${colMd2}
`;

const StyledLink = styled.a`
	color: ${theme.colours.white};
	font-weight: bold;
	text-decoration: underline;
`;

export default withApiConsumer(
	class ForgotPasswordPage extends React.PureComponent {
		constructor(props) {
			super(props);
			this.ref_email = reactCreateRef();

			this.state = {
				hide: false,
				loading: false,
				fields: {
					email: "",
				},
				valid: {
					email: { isValid: true, message: "" },
				},
			};

			this.handleSubmit = this.handleSubmit.bind(this);
		}

		componentDidMount() {
			this._isMounted = true;
		}

		componentWillUnmount() {
			if (this._timeout) {
				clearTimeout(this._timeout);
			}
			delete this._timeout;
			delete this._isMounted;
		}

		/**
		 * Handles the submission
		 */
		handleSubmit = (e) => {
			e.preventDefault();
			// Prevent accidental double-submission.
			this.setState({ loading: true });

			//check with all form input  fields
			let valid = Object.assign({}, this.state.valid);
			valid["email"].isValid = this.ref_email.current.isValid();
			this.setState({ valid: valid }, this.submitFormRequest);
		};

		submitFormRequest = () => {
			if (!this.isFormValid().status) {
				this.setState({ loading: false });
				return false;
			} else {
				const finish = (result) => {
					this.setState({ message: result.message ? result.message : "" });
					this.resetForm(!this.state.hide);
					this._timeout = customSetTimeout(this.setStateTimeOut, 500);
				};
				this.props.api("/auth/user-init-password-reset", { email: this.state.fields.email }).then(finish, finish);
			}
		};

		setStateTimeOut = () => {
			if (this._isMounted) {
				this.setState({
					loading: false,
				});
			}
		};

		/**
		 * Handles the change event
		 */
		/** handle text input change event*/
		handleChange = (name, value, valid) => {
			// Clone the fields object in state.
			let fields = Object.assign({}, this.state.fields);
			let formValid = Object.assign({}, this.state.valid);

			fields[name] = value;
			formValid[name] = valid;

			this.setState({ fields: fields, valid: formValid });
			if (this.state.hide) {
				this.setState({ hide: false });
			}
		};

		resetForm = (hide) => {
			let newState = Object.assign({}, this.state);
			newState.fields.email = "";
			newState.hide = hide;
			this.setState(newState);
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
						case "email":
							message = ERROR_MESSAGE;
							break;
					}
				}
			});

			const result = { status: status, message: message };
			return result;
		}

		render() {
			let message,
				pageTitle,
				inputValidationMessage,
				disabled = false;

			/** Page header section text */
			if (this.state.message) {
				pageTitle = this.state.message;
				message = (
					<p>
						You have reached the maximum number of incorrect login attempts permitted. If there is an account on the Education Platform linked to this
						email address, this has now been locked. Please wait 5 minutes before attempting to login or reset your password, or{" "}
						<StyledLink href={"mailto:" + sendEmailList.supportCLA} target="_blank">
							contact support
						</StyledLink>
						.
					</p>
				);
			} else {
				if (!this.state.hide) {
					pageTitle = `Forgotten Password`;
					message = `Please enter your registered email address and we will send a link to reset your password`;
				} else {
					pageTitle = `Your password reset email has been sent`;
					message = `Check your email for a link to reset your password. The link will be valid for 24 hours.`;
				}
			}

			/** button disabled */
			const formValidation = this.isFormValid();
			if (!formValidation.status) {
				disabled = true;
				inputValidationMessage = <MessageBox type={messageType.error} title="" message={ERROR_MESSAGE} />;
			}

			return (
				<>
					<HeadTitle title={PageTitle.forgotPassword} />
					<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
					<FormHedaerWrapper id={JUMP_TO_CONTENT_ID}>
						<Container>
							<WrapRow>
								<PageContentCenter>
									<Row>
										<WrapDiv>
											<FormIcon hide={this.state.hide}>{this.state.hide ? <i className="far fa-envelope"></i> : ""}</FormIcon>
										</WrapDiv>
										<FormTitle>
											<h1> {pageTitle} </h1>
											<p className="Description">{message}</p>
										</FormTitle>
									</Row>
								</PageContentCenter>
							</WrapRow>
						</Container>
					</FormHedaerWrapper>
					<PageWrap>
						<Container>
							<WrapRow>
								<PageContentCenter>
									<Row>
										<WrapDiv></WrapDiv>
										<PageContentLarge>
											<ForgotForm onSubmit={this.handleSubmit}>
												{inputValidationMessage ? inputValidationMessage : ""}
												<FormBodyContainer>
													<TextField
														ref={this.ref_email}
														name="email"
														title="Registered email address"
														value={this.state.fields.email}
														isValid={this.state.valid.email.isValid}
														placeHolder={"Email address"}
														onChange={this.handleChange}
														onBlur={this.handleChange}
														isRequired={true}
														validationType={validationType.email}
													/>
													{/* <FormInput>
											<label htmlFor="email">Registered email address</label>
											<input type="email" name="email" value={this.state.email || ''} onChange={e => this.handleChange(e)} style={this.state.valid.email ? borderStyled : {}} required/>
										</FormInput> */}
													<FormContainerButton>
														<Button type="submit" disabled={disabled || this.state.loading}>
															{" "}
															Send Password Reset{" "}
														</Button>
													</FormContainerButton>
												</FormBodyContainer>
											</ForgotForm>
											<MoreLink to="/sign-in">
												{" "}
												<SmallText> Back to sign in </SmallText>{" "}
											</MoreLink>
										</PageContentLarge>
									</Row>
								</PageContentCenter>
							</WrapRow>
						</Container>
					</PageWrap>
				</>
			);
		}
	}
);
