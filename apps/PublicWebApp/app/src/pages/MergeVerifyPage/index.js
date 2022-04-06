import React from "react";
import { Link } from "react-router-dom";
import Header from "../../widgets/Header";
import { getVerificationFailMailto } from "../../widgets/SendEmailLink";
import withApiConsumer from "../../common/withApiConsumer";
import CheckBoxField from "../../widgets/CheckBoxField";
import MessageBox from "../../widgets/MessageBox";
import messageType from "../../common/messageType";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import reactCreateRef from "../../common/reactCreateRef";
import getUrl from "../../common/getUrl";
import customSetTimeout from "../../common/customSetTimeout";
import MainTitle from "../../widgets/MainTitle";
import withAuthConsumer from "../../common/withAuthConsumer";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { PageContentLarge } from "../../widgets/Layout/PageContentLarge";
import { PageLeftIconContent } from "../../widgets/Layout/PageLeftIconContent";
import { PageContentMedium } from "../../widgets/Layout/PageContentMedium";

const JUMP_TO_CONTENT_ID = "main-content";

const FormWrap = styled.form`
	display: flex;
	flex-direction: column;
	max-width: 100%;
	min-height: 600px;
	margin-top: 20px;
`;

const CustomCheckBoxField = styled.div`
	margin-top: 1em;
`;

const LinkButton = styled.a`
	color: ${theme.colours.secondary};
	text-decoration: underline;
`;

const FormContainerButton = styled.div`
	width: 100%;
	padding: 1em 0 1em 0;
`;

const FormSubmit = styled.button`
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
		p.hide == true &&
		css`
			display: none;
		`}
	${(p) =>
		p.isLoading &&
		css`
			pointer-events: none;
			opacity: 0.3;
		`}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		width: 100%;
	}
`;

const ContentSection = styled(Row)`
	justify-content: center;
`;

const BackGroundLime = styled.div`
	background-color: ${theme.colours.lime};
`;

export default withAuthConsumer(
	withApiConsumer(
		class MergeVerifyPage extends React.PureComponent {
			constructor(props) {
				super(props);
				this.state = {
					message: null,
					token: null,
					terms_accepted: false,
					messageType: messageType.error,
					loading: false,
					hide_form: true,
					valid: {
						terms_accepted: { isValid: true, message: "" },
					},
				};
				this.ref_terms_accepted = reactCreateRef();
			}

			componentDidMount() {
				this._isMounted = true;
				this.setState({ token: this.props.match.params.token }, this.checkVerifyStatus);
			}

			componentWillUnmount() {
				if (this._timeout) {
					clearTimeout(this._timeout);
				}
				delete this._timeout;
				delete this._isMounted;
			}

			componentDidUpdate(prevProps) {
				if (this.props.match.params.token !== prevProps.match.params.token) {
					this.setState({ message: null });
				}
			}

			handleSubmit = (e) => {
				e.preventDefault();
				let terms = this.state.terms_accepted;
				if (!terms) {
					this.setState({ valid: { terms_accepted: { isValid: terms, message: "" } }, messageType: messageType.error });
				} else {
					this.doVerify();
				}
			};

			getExpiredMessage() {
				return (
					<div>
						Your verification link has expired. If you would like a new verification email to be sent, please click on the resend link below.
						<br />
						<LinkButton onClick={this.doResendVerify}>Resend Verification</LinkButton>
					</div>
				);
			}

			getNonExistentMessage() {
				return (
					<div>
						This verification link cannot be found. If you believe you are seeing this message in error, please speak to the Education Platform
						administrator for your institution or{" "}
						<LinkButton href={`mailto:${getVerificationFailMailto()}`} title="Contact us">
							contact&nbsp;us
						</LinkButton>
						.
					</div>
				);
			}

			checkVerifyStatus = () => {
				this.props
					.api("/auth/oauth/hwb/merge-account-complete", {
						activation_token: this.state.token,
						check_status_only: true,
					})
					.then(() => {
						if (!this._isMounted) {
							return;
						}
						this.setState({ hide_form: false });
					})
					.catch((result) => {
						if (!this._isMounted) {
							return;
						}
						let msg;
						if (result === "Token Expired") {
							msg = this.getExpiredMessage();
						} else if (result === "Token NonExistent") {
							msg = this.getNonExistentMessage();
						} else {
							msg = <div>Sorry, something has gone wrong. Are you sure you've followed the link correctly?</div>;
						}
						this.setState({
							message: msg,
							messageType: messageType.warning,
						});
					});
			};

			doVerify() {
				// Prevent accidental double-submission...
				this.setState({ loading: true }, () => {
					if (!this._isMounted) {
						return;
					}
					this.props
						.api("/auth/oauth/hwb/merge-account-complete", {
							activation_token: this.state.token,
							terms_accepted: this.state.terms_accepted,
						})
						.then((result) => {
							if (!this._isMounted) {
								return;
							}
							this.setState({
								message: (
									<div>
										<h4>Your accounts were merged successfully.</h4>
										<Link to="/">Return to the home page</Link> and start using the Education Platform
									</div>
								),
								messageType: messageType.success,
							});
							if (result.needsReauth) {
								this.props.withAuthConsumer_attemptReauth();
							}
						})
						.catch((result) => {
							if (!this._isMounted) {
								return;
							}
							if (result === "Token Expired") {
								this.setState({
									message: this.getExpiredMessage(),
									messageType: messageType.warning,
								});
							} else if (result === "Token NonExistent") {
								this.setState({
									message: this.getNonExistentMessage(),
									messageType: messageType.warning,
								});
							} else {
								this.setState({ message: result, messageType: messageType.error });
							}
						})
						.finally(() => {
							if (!this._isMounted) {
								return;
							}
							this._timeout = customSetTimeout(this.setStateTimeOut, 500);
						});
				});
			}

			/* Resend email verfication link */
			doResendVerify = (e) => {
				this.setState({ message: "Processing..." }, () => {
					if (!this._isMounted) {
						return;
					}
					this.props
						.api("/auth/oauth/hwb/merge-account-resend-token", {
							token: this.state.token,
						})
						.then(() => {
							if (!this._isMounted) {
								return;
							}
							this.setState({
								message: "Verification email sent",
								messageType: messageType.success,
							});
						})
						.catch((result) => {
							if (!this._isMounted) {
								return;
							}
							this.setState({ message: result, messageType: messageType.error });
						});
				});
			};

			setStateTimeOut = () => {
				if (this._isMounted) {
					this.setState({
						loading: false,
					});
				}
			};

			/** handle checkbox  input change event*/
			handleCheckBoxChange = (name, value, isValid) => {
				this.setState({ terms_accepted: value, valid: { terms_accepted: { isValid: value, message: "" } }, message: null });
			};

			render() {
				const checkBoxText = (
					<div>
						<b>I Agree</b> to CLA's{" "}
						<a href={getUrl("/terms-of-use")} target="_blank">
							Terms and Conditions
						</a>{" "}
						and{" "}
						<a href="https://www.cla.co.uk/privacy-policy" target="_blank">
							Privacy Policy
						</a>
					</div>
				);
				let message = null,
					show = true,
					message_type = null;
				if (this.state.message) {
					message = this.state.message;
					message_type = this.state.messageType;
				}

				if (!this.state.valid.terms_accepted.isValid) {
					message = "Please accept the terms and conditions.";
					message_type = messageType.error;
				}

				if (this.state.messageType === messageType.success || this.state.hide_form) {
					show = false;
				}

				return (
					<>
						<HeadTitle title={PageTitle.verify} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<MainTitle title="Email verification" icon="fal fa-envelope-open-text" id={JUMP_TO_CONTENT_ID} />
						<BackGroundLime>
							<Container>
								<ContentSection>
									<PageContentMedium>
										<Row>
											<PageLeftIconContent></PageLeftIconContent>
											<PageContentLarge>
												<FormWrap onSubmit={this.handleSubmit}>
													{message ? <MessageBox type={message_type} title="" message={message} /> : ""}

													{show ? (
														<>
															<CustomCheckBoxField>
																<CheckBoxField
																	ref={this.ref_terms_accepted}
																	name="terms_accepted"
																	title={checkBoxText}
																	checked={this.state.terms_accepted}
																	isRequired={true}
																	isValid={this.state.valid.terms_accepted.isValid}
																	onChange={this.handleCheckBoxChange}
																/>
															</CustomCheckBoxField>
															<FormContainerButton>
																<FormSubmit className="submit" type="submit" isLoading={this.state.loading}>
																	Submit
																</FormSubmit>
															</FormContainerButton>
														</>
													) : (
														""
													)}
												</FormWrap>
											</PageContentLarge>
										</Row>
									</PageContentMedium>
								</ContentSection>
							</Container>
						</BackGroundLime>
					</>
				);
			}
		}
	)
);
