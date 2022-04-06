import React from "react";
import { Link } from "react-router-dom";
import Header from "../../widgets/Header";
import styled from "styled-components";
import withApiConsumer from "../../common/withApiConsumer";
import PasswordPage from "../../widgets/PasswordPage";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import customSetTimeout from "../../common/customSetTimeout";
import messageType from "../../common/messageType";
import theme from "../../common/theme";
import MainTitle from "../../widgets/MainTitle";
import { ResendSetPasswordEmailFailMessage } from "../../widgets/SendEmailLink";
import { withRouter } from "react-router-dom";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { PageContentMedium } from "../../widgets/Layout/PageContentMedium";
import { PageContentLarge } from "../../widgets/Layout/PageContentLarge";
import { PageLeftIconContent } from "../../widgets/Layout/PageLeftIconContent";

const JUMP_TO_CONTENT_ID = "main-content";

const SmallText = styled.span`
	text-align: center;
	font-weight: normal;
	display: inline-block;
	margin-top: 1em;
`;
const LinkButton = styled.button`
	display: inline-block;
	background: none;
	border: navajowhite;
	color: ${theme.colours.secondary};
	text-decoration: underline;
	padding: 0;
`;

const PageWrap = styled.div`
	min-height: 544px;
	max-width: 500px;
`;

const AnchorLink = styled(Link)`
	font-weight: bold;
	color: ${theme.colours.primary};
	background: transparent;
	text-decoration: none;
	:hover {
		cursor: pointer;
	}
`;

const ContentSection = styled(Row)`
	justify-content: center;
`;

const BackGroundLime = styled.div`
	background-color: ${theme.colours.lime};
`;

const PasswordSection = styled(PageContentLarge)`
	padding-top: 1.5rem;
`;

export default withApiConsumer(
	withRouter(
		class ResetPasswordPage extends React.PureComponent {
			state = {
				token: "",
				message: null,
				loading: false,
				hide: true,
				showLink: false,
			};

			componentDidMount() {
				this._isMounted = true;
				this.setState({ token: this.props.match.params.token, loading: true }, this.validateTokenOnLanding);
			}

			componentWillUnmount() {
				delete this._isMounted;
			}

			getPageType() {
				return this.props.match.path.indexOf("/set-password/") >= 0 ? "set-pwd" : "reset-pwd";
			}

			getPrefix() {
				return this.getPageType() === "set-pwd" ? "Set" : "Reset";
			}

			getExpiryMessage() {
				const v = this.getPageType() === "set-pwd" ? "set" : "reset";
				return (
					<div>
						It appears that the {this.getPrefix()} Password Link you have clicked is expired. Please click{" "}
						<LinkButton onClick={this.doResendSetPassword}>this link</LinkButton> again in order to {v} your password.
					</div>
				);
			}

			validateTokenOnLanding = () => {
				this.props
					.api("/auth/user-complete-password-reset", {
						token: this.state.token,
						validateToken: true,
					})
					.then((result) => {
						if (!this._isMounted) {
							return;
						}
						if (result) {
							this.setState({
								hide: false,
								isTokenValid: true,
							});
						}
					})
					.catch((result) => {
						if (!this._isMounted) {
							return;
						}
						let msg;
						if (result === "Token Expired") {
							msg = this.getExpiryMessage();
						} else {
							msg = `Could not complete request. Are you sure you followed the link correctly?`;
						}
						this.setState({
							message: msg,
							messageType: messageType.warning,
							isTokenValid: false,
						});
					})
					.finally(() => {
						if (!this._isMounted) {
							return;
						}
						this._timeout = customSetTimeout(this.setStateTimeOut, 500);
					});
			};
			/**
			 * Handles the submission
			 */
			handleSubmit = (params) => {
				// Prevent accidental double-submission...
				this.setState({
					loading: true,
				});
				this.props
					.api("/auth/user-complete-password-reset", {
						token: this.state.token,
						password: params.password,
						password_confirm: params.password_confirm,
					})
					.then((result) => {
						if (!this._isMounted) {
							return;
						}
						if (result.result) {
							this.setState({ message: `Your password has been set successfully.`, messageType: messageType.success, hide: true, showLink: true });
						} else {
							this.setState({ message: `Something went wrong. Please try again later.`, messageType: messageType.error, hide: false });
						}
					})
					.catch((result) => {
						if (!this._isMounted) {
							return;
						}
						if (result === "Token Expired") {
							this.setState({
								message: this.getExpiryMessage(),
								messageType: messageType.warning,
								hide: true,
								isTokenValid: false,
							});
						} else {
							this.setState({ message: result, messageType: messageType.error, hide: false });
						}
					})
					.finally(() => {
						if (!this._isMounted) {
							return;
						}
						this._timeout = customSetTimeout(this.setStateTimeOut, 500);
					});
			};

			doResendSetPassword = (e) => {
				e.preventDefault();
				if (this.getPageType() === "set-pwd") {
					this.setState({ message: "Processing..." }, () => {
						if (!this._isMounted) {
							return;
						}
						this.props
							.api("/auth/user-resend-set-password", {
								setPasswordPage: true,
								token: this.state.token,
							})
							.then((result) => {
								if (!this._isMounted) {
									return;
								}
								if (result.result) {
									this.setState({
										message: `'${this.getPrefix()} password' email sent`,
										messageType: messageType.success,
										hide: true,
										showLink: true,
									});
								} else {
									this.setState({
										message: <ResendSetPasswordEmailFailMessage user={result.user} />,
										messageType: messageType.error,
										hide: true,
									});
								}
							})
							.catch((result) => {
								if (!this._isMounted) {
									return;
								}

								this.setState({ message: result, messageType: messageType.error, hide: false });
							});
					});
				} else {
					this.props.history.push(`/auth/forgot-password`);
				}
			};

			setStateTimeOut = () => {
				if (this._isMounted) {
					this.setState({
						loading: false,
					});
				}
			};

			render() {
				const type = this.getPageType();
				const pageTitle = this.getPrefix() + " Password";
				const isTCRequired = type === "set-pwd";
				return (
					<>
						<HeadTitle title={PageTitle.myDetails} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<MainTitle title={pageTitle} icon="fal fa-key" id={JUMP_TO_CONTENT_ID} />
						<BackGroundLime>
							<Container>
								<ContentSection>
									<PageContentMedium>
										<Row>
											<PageLeftIconContent />
											<PasswordSection>
												<PageWrap>
													<PasswordPage
														key={type}
														hide={this.state.hide}
														message={this.state.message}
														handleSubmit={this.handleSubmit}
														loading={this.state.loading}
														messageType={this.state.messageType}
														isTCRequired={isTCRequired}
													/>
													{this.state.showLink ? (
														<SmallText>
															Please <AnchorLink to="/"> click here </AnchorLink> to return home.
														</SmallText>
													) : (
														""
													)}
												</PageWrap>
											</PasswordSection>
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
