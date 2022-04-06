import React from "react";
import { Redirect } from "react-router-dom";
import withAuthConsumer from "../../common/withAuthConsumer";
import { Link } from "react-router-dom";
import Header from "../../widgets/Header";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import TextField from "../../widgets/TextField";
import MessageBox from "../../widgets/MessageBox";
import OrSeparator from "../../widgets/OrSeparator";
import HwbButton from "../../widgets/ProminentIconButton/HwbButton";
import messageType from "../../common/messageType";
import validationType from "../../common/validationType";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import reactCreateRef from "../../common/reactCreateRef";
import { colMd2 } from "../../common/style";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { PageContentCenter } from "../../widgets/Layout/PageContentCenter";
import { PageContentLarge } from "../../widgets/Layout/PageContentLarge";
import queryString from "query-string";
import Loader from "../../widgets/Loader";
import PasswordField from "../../widgets/PasswordField";
import userDidChange from "../../common/userDidChange";

const ERROR_MESSAGE = "Please ensure all fields are filled correctly.";
const JUMP_TO_CONTENT_ID = "main-content";
const REQUEST_TIMEOUT_LIMIT_ERROR = "timeout";
const PageWrapper = styled.div`
	position: relative;
	min-height: 540px;
	background-color: ${theme.colours.lime};
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		min-height: 0px;
	}
`;

const WrapperLoader = styled.div`
	position: absolute;
	margin: 0 auto;
	width: 100%;
	height: 100%;
	z-index: 1;
`;

const WarperContainer = styled(Container)`
	${(p) =>
		p.disabled === true &&
		css`
			opacity: 0.3;
			pointer-events: none;
		`};
`;

const SignInForm = styled.form`
	display: flex;
	flex-direction: column;
	width: 26em;
	max-width: 100%;
	padding: 1em 0 2em 0;
`;

const SmallBlueText = styled.span`
	font-weight: normal;
	display: inline-block;
`;

const BlueLink = styled(Link)`
	font-weight: normal;
	color: ${theme.colours.primary};
`;

const FormHeaderWrapper = styled.div`
	padding: 20px 0 8px;
	background-color: ${theme.colours.bgDarkPurple};
	color: ${theme.colours.white};
`;

const FormIcon = styled.div`
	height: 63px;
	width: 63px;
	line-height: 60px;
	text-align: center;
	background-color: white;
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
		line-height: 1.2;
		@media screen and (max-width: ${theme.breakpoints.mobile}) {
			font-size: 25px;
			margin-top: 0.5em;
		}
	}
`;

const FormDescriptionText = styled.p`
	font-size: 16px;
	font-weight: normal;
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
	transition: opacity 100ms;

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

const ContentSection = styled(Row)`
	justify-content: center;
`;

const FirstSection = styled.div`
	${colMd2}
`;

const ArticleLink = styled.a`
	font-size: 17px;
	font-weight: normal;
	text-decoration: underline;
`;

const getInitialErrorMessage = () => {
	if (window.location.search.match(/\boauth_login_error=1\b/)) {
		return "We couldn't log you in. Please try again.";
	}
	return null;
};

const doesUrlRequireAuth = (url) => {
	if (!url) {
		return false;
	}
	if (url.indexOf("/profile") === 0) {
		return true;
	}
	if (url.match(/^\/works\/[^/]+\/extract$/)) {
		return true;
	}
	return false;
};

export default withAuthConsumer(
	class SignInPage extends React.PureComponent {
		constructor(props) {
			super(props);
			this.state = {
				message: getInitialErrorMessage(),
				hide: false,
				loading: false,
				fields: {
					email: "",
					password: "",
				},
				valid: {
					email: { isValid: true, message: "" },
					password: { isValid: true, message: "" },
				},
				redirect_url: null,
			};

			this.ref_email = reactCreateRef();
			this.ref_password = reactCreateRef();
		}

		componentDidMount() {
			this._isMounted = true;
			const parsed = queryString.parse(this.props.location.search);
			const backurl = parsed.backurl || this.state.backurl;
			this.setState({ back_url: backurl }, () => {
				this.setMessage();
				this.maybeRedirectUser();
			});
		}

		componentWillUnmount() {
			if (this._timeout) {
				clearTimeout(this._timeout);
			}
			delete this._timeout;
			delete this._isMounted;
		}

		componentDidUpdate(prevProps) {
			if (userDidChange(this.props, prevProps)) {
				this.maybeRedirectUser();
			}
			this.setMessage();
		}

		// Called when and ONLY when the current user changes (or on initial mount)
		maybeRedirectUser = () => {
			let redirectUrl = null;
			// If there is a logged in user
			if (this.props.withAuthConsumer_myUserDetails) {
				if (
					this.state.back_url &&
					this.state.back_url !== "/sign-in" &&
					/**
					 * Only redirect the user if it's the same user that
					 * previously logged out (or there wasn't a previous user).
					 * Why? Because if a different user logs in, we don't want
					 * to redirect to the previous user's last page - that
					 * would be strange for the new user.
					 */
					(!this.props.withAuthConsumer_prevEmail || this.props.withAuthConsumer_prevEmail === this.props.withAuthConsumer_myUserDetails.email)
				) {
					redirectUrl = this.state.back_url;
				} else {
					redirectUrl = "/";
				}
			}
			this.setState({
				redirect_url: redirectUrl,
			});
		};

		setMessage = () => {
			if (!this.state.message && this.state.back_url && doesUrlRequireAuth(this.state.back_url)) {
				this.setState({ message: "You must be logged in to access that page." });
			}
		};

		/**
		 * Handles the submission
		 */
		handleSubmit = (e) => {
			e.preventDefault();
			// Prevent accidental double-submission.
			this.setState({ loading: true });
			//check with all form input  fields
			let valid = Object.assign({}, this.state.valid);
			Object.keys(valid).forEach((field) => {
				switch (field) {
					case "email":
						valid[field].isValid = this.ref_email.current.isValid();
						break;
					case "password":
						valid[field].isValid = this.ref_password.current.isValid();
						break;
				}
			});
			this.setState({ valid: valid, message: null, loading: false }, this.submitFormRequest);
		};

		submitFormRequest = () => {
			if (!this.isFormValid().status) {
				return false;
			} else {
				this.setState({ loading: true }, () => {
					this.props.withAuthConsumer_attemptAuth(this.state.fields.email, this.state.fields.password).then((res) => {
						if (!this._isMounted) {
							return;
						}
						this.setState({
							message: res,
							loading: false,
						});
					});
				});
			}
		};

		/** handle text input change event*/
		handleInputChange = (name, value, valid) => {
			// Clone the fields object in state.
			let fields = Object.assign({}, this.state.fields);
			let formValid = Object.assign({}, this.state.valid);
			let message = null;

			fields[name] = value;
			formValid[name] = valid;

			this.setState({ fields: fields, valid: formValid, message: message });
		};

		/** check form input validation */
		isFormValid() {
			let status = true;
			let message = "";

			Object.keys(this.state.valid).forEach((field) => {
				const result = this.state.valid[field];
				if (result && !result.isValid && status) {
					status = false;
					switch (field) {
						case "email":
							message = ERROR_MESSAGE;
							break;
						case "password":
							message = ERROR_MESSAGE;
							break;
					}
				}
			});
			const result = { status: status, message: message };
			return result;
		}

		render() {
			let errorMessage,
				disabled = false;
			const { message, hide } = this.state;

			if (this.state.redirect_url) {
				return <Redirect to={this.state.redirect_url} />;
			}

			errorMessage = message && !hide ? <MessageBox message={message} type={messageType.error} /> : null;
			const formValidation = this.isFormValid();
			if (formValidation && !formValidation.status) {
				disabled = true;
				errorMessage = <MessageBox type={messageType.error} title="" message={formValidation.message} />;
			}
			if (message === REQUEST_TIMEOUT_LIMIT_ERROR) {
				errorMessage = (
					<MessageBox type={messageType.error} title="" message={null}>
						We're sorry, we're having some trouble with our systems at the moment. Please try again later.{" "}
						<ArticleLink href="https://educationplatform.zendesk.com/hc/en-us/articles/4403385092113" target="_blank">
							See here for more information
						</ArticleLink>
						.
					</MessageBox>
				);
			}
			return (
				<>
					<HeadTitle title={PageTitle.signIn} />
					<Header hide_search={false} jumpToContentId={JUMP_TO_CONTENT_ID} />
					<FormHeaderWrapper id={JUMP_TO_CONTENT_ID}>
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
											<h1>Sign In</h1>
											<FormDescriptionText>Please enter your registered email address and password</FormDescriptionText>
										</FormTitle>
									</Row>
								</PageContentCenter>
							</ContentSection>
						</Container>
					</FormHeaderWrapper>
					<PageWrapper>
						{this.state.loading && (
							<WrapperLoader>
								<Loader />
							</WrapperLoader>
						)}
						<WarperContainer disabled={this.state.loading}>
							<ContentSection>
								<PageContentCenter>
									<Row>
										<FirstSection />
										<PageContentLarge>
											<SignInForm onSubmit={this.handleSubmit}>
												{errorMessage}

												<FormBodyContainer>
													<TextField
														ref={this.ref_email}
														name="email"
														title="Registered email address"
														value={this.state.fields.email}
														isValid={this.state.valid.email.isValid}
														placeHolder={"Email address"}
														onChange={this.handleInputChange}
														onBlur={this.handleInputChange}
														isRequired={true}
														validationType={validationType.email}
													/>

													<PasswordField
														ref={this.ref_password}
														validationType={validationType.string}
														name="password"
														title="Password"
														value={this.state.fields.password}
														isValid={this.state.valid.password.isValid}
														placeHolder={"Password"}
														onChange={this.handleInputChange}
														onBlur={this.handleInputChange}
														isRequired={true}
													/>

													<FormContainerButton>
														<Button onClick={this.handleSubmit} disabled={disabled || this.state.loading}>
															{" "}
															Sign In{" "}
														</Button>
													</FormContainerButton>
												</FormBodyContainer>

												<SmallBlueText>
													Don't have an account? <BlueLink to="/register">Register</BlueLink>
												</SmallBlueText>
												<SmallBlueText>
													<BlueLink to="/auth/forgot-password">Forgot password?</BlueLink>
												</SmallBlueText>

												{/* <OrSeparator />
												<HwbButton /> */}
											</SignInForm>
										</PageContentLarge>
									</Row>
								</PageContentCenter>
							</ContentSection>
						</WarperContainer>
					</PageWrapper>
				</>
			);
		}
	}
);
