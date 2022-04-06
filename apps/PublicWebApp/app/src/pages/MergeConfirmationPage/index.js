import React from "react";
import styled, { css } from "styled-components";

import withAuthRequiredConsumer from "../../common/withAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import theme from "../../common/theme";
import { HeadTitle } from "../../widgets/HeadTitle";
import MainTitle from "../../widgets/MainTitle";
import Header from "../../widgets/Header";
import TextField from "../../widgets/TextField";
import { Link } from "react-router-dom";
import ValidationType from "../../common/validationType";
import MessageBox from "../../widgets/MessageBox";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { PageContentMedium } from "../../widgets/Layout/PageContentMedium";
import { PageContentLarge } from "../../widgets/Layout/PageContentLarge";
import { PageLeftIconContent } from "../../widgets/Layout/PageLeftIconContent";
import { getHwbVerificationFailMailto } from "../../widgets/SendEmailLink";

const JUMP_TO_CONTENT_ID = "main-content";

const BackGroundLime = styled.div`
	background-color: ${theme.colours.lime};
	padding: 1em 0;
`;

const ContentSection = styled(Row)`
	justify-content: center;
	min-height: 600px;
	${(p) =>
		p.loading &&
		css`
			pointer-events: none;
			opacity: 0.3;
		`}
`;

const Button = styled.button`
	background: ${theme.colours.primaryLight};
	color: ${theme.colours.white};
	border: 0;
	outline: 0;
	padding: 0.5em 2em;
	text-align: center;
`;

const Form = styled.form`
	display: flex;
	flex-direction: row;
	margin-bottom: 1.5em;
`;

const FieldsWrap = styled.div`
	flex: 1;
	& > * {
		padding-top: 0;
		padding-bottom: 0;
	}
`;

const HtmlLink = styled.a`
	font-weight: bold;
	color: ${theme.colours.primaryLight};
`;

export default withAuthRequiredConsumer(
	withApiConsumer(
		class MergeConfirmationPage extends React.PureComponent {
			constructor(...args) {
				super(...args);
				this.state = {
					overrideTarget: false,
					overrideEmail: "",
					overrideFormValid: { isValid: true, message: "" },
					error: null,
					loading: false,
					success: false,
					verificationResendSuccess: false,
				};
				this._isMounted = false;
			}

			componentDidMount() {
				this._isMounted = true;
			}

			componentWillUnmount() {
				delete this._isMounted;
			}

			onEmailChange = (name, value, valid) => {
				this.setState({
					overrideEmail: value,
					overrideFormValid: valid,
				});
			};

			doToggleOverrideTarget = (e) => {
				e.preventDefault();
				this.setState({
					overrideTarget: !this.state.overrideTarget,
				});
			};

			doConfirmMergeAccounts = (e) => {
				e.preventDefault();
				const conf = this.props.withAuthConsumer_myUserDetails.requires_merge_confirmation;
				const hasSpecifiedEmail = this.state.overrideTarget || conf.type === "none";
				if (hasSpecifiedEmail && (!this.state.overrideEmail || !this.state.overrideFormValid.isValid)) {
					this.setState({
						error: "Please enter a valid address",
					});
					return;
				}
				this.setState({
					loading: true,
					error: null,
				});
				this.props
					.api("/auth/oauth/hwb/merge-account-init", {
						email: hasSpecifiedEmail ? this.state.overrideEmail : null,
					})
					.then(() => {
						if (!this._isMounted) {
							return;
						}
						if (hasSpecifiedEmail) {
							this.props.withAuthConsumer_attemptReauth();
						}
						this.setState({
							success: true,
						});
					})
					.catch((err) => {
						if (!this._isMounted) {
							return;
						}
						this.setState({
							error: err.toString(),
						});
					})
					.finally(() => {
						if (!this._isMounted) {
							return;
						}
						this.setState({
							loading: false,
						});
					});
			};

			doCreateNewAccount = (e) => {
				e.preventDefault();
				this.setState({
					loading: true,
					error: null,
				});
				this.props
					.api("/auth/oauth/hwb/promote-account")
					.then(() => {
						if (!this._isMounted) {
							return;
						}
						this.props.withAuthConsumer_attemptReauth();
					})
					.catch((e) => {
						if (!this._isMounted) {
							return;
						}
						this.setState({
							error: e,
						});
					})
					.finally(() => {
						if (!this._isMounted) {
							return;
						}
						this.setState({
							loading: false,
						});
					});
			};

			doResendMergeEmail = (e) => {
				e.preventDefault();
				this.setState(
					{
						loading: true,
					},
					() => {
						if (!this._isMounted) {
							return;
						}
						this.props
							.api("/auth/oauth/hwb/merge-account-resend-token")
							.then(() => {
								if (!this._isMounted) {
									return;
								}
								this.setState({
									verificationResendSuccess: true,
								});
							})
							.catch((e) => {
								if (!this._isMounted) {
									return;
								}
								this.setState({
									error: e,
								});
							})
							.finally(() => {
								if (!this._isMounted) {
									return;
								}
								this.setState({
									loading: false,
								});
							});
					}
				);
			};

			render() {
				const props = this.props;
				const conf = props.withAuthConsumer_myUserDetails.requires_merge_confirmation;
				return (
					<>
						<HeadTitle title="Hwb account setup" />
						<Header hide_search={false} />
						<MainTitle id={JUMP_TO_CONTENT_ID} title="Hwb account setup" icon="fa-info-circle" />
						<BackGroundLime>
							<Container>
								<ContentSection loading={this.state.loading}>
									<PageContentMedium>
										<Row>
											<PageLeftIconContent />
											<PageContentLarge>
												{conf ? (
													<>
														{this.state.error ? (
															<>
																<MessageBox type="error" message={this.state.error} />
																<br />
															</>
														) : null}
														{this.state.success ? (
															<MessageBox
																type="success"
																message={
																	this.state.overrideTarget || conf.type === "none"
																		? `If your email address exists in the system we will send you a verification email. Please verify your email address by clicking on the verification link that has been sent to the provided email address.`
																		: `Please verify your email address by clicking on the verification link that has been emailed to ${conf.target_value}.`
																}
															/>
														) : (
															<>
																{conf.verification_sent ? (
																	<>
																		{this.state.verificationResendSuccess ? (
																			<>
																				<MessageBox type="success" message="Verification email resent" />
																				<br />
																			</>
																		) : null}
																		<p>
																			<strong>
																				A verification email has recently been sent to you. If you didn't receive it, we can{" "}
																				<HtmlLink onClick={this.doResendMergeEmail}>resend it</HtmlLink>, or please{" "}
																				<HtmlLink href={`mailto:${getHwbVerificationFailMailto({ user: props.withAuthConsumer_myUserDetails })}`}>
																					contact customer support
																				</HtmlLink>
																				.
																			</strong>
																		</p>
																		<hr />
																	</>
																) : null}
																{this.state.overrideTarget || conf.type === "none" ? (
																	<div>
																		<p>
																			Do you already have an Education Platform account? If so, enter the email address you used to sign up so we can
																			link it to your Hwb account.
																		</p>
																		<Form onSubmit={this.doConfirmMergeAccounts}>
																			<FieldsWrap>
																				<TextField
																					name="email"
																					value={this.state.overrideEmail}
																					isValid={this.state.overrideFormValid.isValid}
																					placeHolder={"Email address"}
																					onChange={this.onEmailChange}
																					isRequired={true}
																					validationType={ValidationType.email}
																				/>
																			</FieldsWrap>
																			<Button type="submit" disabled={!this.state.overrideFormValid.isValid}>
																				Submit
																			</Button>
																		</Form>
																		<Button type="button" onClick={this.doCreateNewAccount}>
																			No
																		</Button>
																		{conf.type !== "none" && (
																			<>
																				&nbsp;
																				<Button type="button" onClick={this.doToggleOverrideTarget}>
																					Go back
																				</Button>
																			</>
																		)}
																	</div>
																) : conf.type === "email" ? (
																	<div>
																		<p>
																			The email address, {conf.target_value}, already exists in the Education Platform. Would you like to synchronise
																			your Education Platform and Hwb accounts?
																		</p>
																		<Button type="button" onClick={this.doConfirmMergeAccounts}>
																			Yes
																		</Button>
																		&nbsp;
																		<Button type="button" onClick={this.doToggleOverrideTarget}>
																			No
																		</Button>
																	</div>
																) : conf.type === "fuzzy" ? (
																	<div>
																		<p>We have detected an account that might be you. Is this your email address? {conf.target_value}</p>
																		<Button type="button" onClick={this.doConfirmMergeAccounts}>
																			Yes, merge my accounts
																		</Button>
																		&nbsp;
																		<Button type="button" onClick={this.doToggleOverrideTarget}>
																			No, this isn't me
																		</Button>
																	</div>
																) : null}
															</>
														)}
													</>
												) : (
													<>
														<MessageBox
															type="success"
															message={
																<>
																	You have successfully setup your Hwb account.
																	<br />
																	<Link to="/">Return to the home page</Link> and start using the Education Platform.
																</>
															}
														/>
													</>
												)}
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
