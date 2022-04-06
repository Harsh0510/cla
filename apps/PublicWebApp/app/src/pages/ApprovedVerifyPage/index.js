import React from "react";
import Header from "../../widgets/Header";
import withApiConsumer from "../../common/withApiConsumer";
import MessageBox from "../../widgets/MessageBox";
import messageType from "../../common/messageType";
import styled, { css } from "styled-components";
import { Link } from "react-router-dom";
import theme from "../../common/theme";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import MainTitle from "../../widgets/MainTitle";
import { ResendVerificationEmailFailMessage } from "../../widgets/SendEmailLink";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { PageContentMedium } from "../../widgets/Layout/PageContentMedium";
import { PageContentLarge } from "../../widgets/Layout/PageContentLarge";
import { PageLeftIconContent } from "../../widgets/Layout/PageLeftIconContent";

const JUMP_TO_CONTENT_ID = "main-content";

const FormWrap = styled.div`
	display: flex;
	flex-direction: column;
	max-width: 100%;
	min-height: 600px;
	margin-top: 20px;
`;

const LinkButton = styled.a`
	color: ${theme.colours.secondary};
	text-decoration: underline;
`;

const SmallText = styled.span`
	text-align: left;
	font-weight: normal;
	display: block;
	margin-top: 1em;
	font-size: 16px;
`;

const AnchorLink = styled(Link)`
	font-weight: bold;
	color: ${theme.colours.anchorLinkTextColor};
	background: transparent;
	text-decoration: none;
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

const BlueLink = styled.a`
	font-weight: bold;
	color: ${theme.colours.primary};
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

const BackGroungLime = styled.div`
	background-color: ${theme.colours.lime};
`;

const WrapRow = styled(Row)`
	justify-content: center;
`;

export default withApiConsumer(
	class ApprovedVerifyPage extends React.PureComponent {
		constructor(props) {
			super(props);
			this.state = {
				message: null,
				token: null,
				messageType: messageType.error,
				loading: false,
				isVerified: false,
			};
		}

		componentDidMount() {
			this._isMounted = true;
			this.setState({ token: this.props.match.params.token }, this.doVerification);
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

		getExpiredMessage() {
			return (
				<div>
					It appears that the verification link you have clicked is expired. Please click{" "}
					<LinkButton onClick={this.doResendVerify}>this link</LinkButton> again in order to regenerate your registration.
				</div>
			);
		}

		// To Register approved domain user check the activation token and verify
		doVerification = () => {
			this.props
				.api("/auth/approved-verify", {
					activation_token: this.state.token,
				})
				.then((result) => {
					if (!this._isMounted) {
						return;
					}
					if (result.result) {
						this.setState({ isVerified: true, verifyUpdateType: result.update_type });
					} else {
						msg = <div>Sorry, something has gone wrong. Are you sure you've followed the link correctly?</div>;
						this.setState({
							isVerified: false,
							message: msg,
							messageType: messageType.warning,
						});
					}
					this.setState({ isVerified: true });
				})
				.catch((result) => {
					if (!this._isMounted) {
						return;
					}
					let msg;
					if (result === "Token Expired") {
						msg = this.getExpiredMessage();
					} else {
						msg = <div>Sorry, something has gone wrong. Are you sure you've followed the link correctly?</div>;
					}
					this.setState({
						message: msg,
						messageType: messageType.warning,
					});
				});
		};

		/* Resend email verification link */
		doResendVerify = (e) => {
			this.setState({ message: "Processing..." }, () => {
				if (!this._isMounted) {
					return;
				}
				this.props
					.api("/auth/user-resend-registration", {
						token: this.state.token,
					})
					.then((result) => {
						if (!this._isMounted) {
							return;
						}
						if (result.result) {
							this.setState({
								message: "Verification email sent",
								messageType: messageType.success,
							});
						} else {
							this.setState({
								message: <ResendVerificationEmailFailMessage user={result.user} />,
								messageType: messageType.error,
							});
						}
					})
					.catch((result) => {
						if (!this._isMounted) {
							return;
						}
						this.setState({ message: result, messageType: messageType.error });
					});
			});
		};

		render() {
			let message = null,
				message_type = null;
			if (this.state.message) {
				message = this.state.message;
				message_type = this.state.messageType;
			}
			return (
				<>
					<HeadTitle title={PageTitle.approvedVerifyPage} />
					<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
					<MainTitle title={this.state.isVerified ? "Email verified" : "Get started"} icon="fal fa-shield-check" id={JUMP_TO_CONTENT_ID} />
					<BackGroungLime>
						<Container>
							<WrapRow>
								<PageContentMedium>
									<Row>
										<PageLeftIconContent />
										<PageContentLarge>
											<FormWrap>
												{this.state.isVerified && message === null ? (
													this.state.verifyUpdateType === "ue-unverified" ? (
														<>
															<h3>Your email address was verified successfully.</h3>
															<SmallText>
																You will not be able to make copies until your account request has been approved by the Education Platform
																administrator at your institution or the CLA. If you need help with this, please send us a{" "}
																<BlueLink href="https://educationplatform.zendesk.com/hc/en-us/requests/new" rel="nofollow" target="_blank">
																	support request
																</BlueLink>
																.
															</SmallText>
															<SmallText>
																Please feel free to search, browse, and <BlueLink href="/">start to get familiar with the Platform</BlueLink>.
															</SmallText>
														</>
													) : (
														<>
															<SmallText>Thank you for verifying your email address.</SmallText>
															<SmallText>
																You can find and <MoreLink to="/unlock">unlock content</MoreLink>,{" "}
																<MoreLink to="/works?filter_misc=unlock_books">make a copy</MoreLink>, and share it right away.
															</SmallText>
															<SmallText>
																<GetStartedButton to="/">Start using the Education Platform</GetStartedButton>
															</SmallText>
														</>
													)
												) : (
													<MessageBox type={message_type} title="" message={message} />
												)}
											</FormWrap>
										</PageContentLarge>
									</Row>
								</PageContentMedium>
							</WrapRow>
						</Container>
					</BackGroungLime>
				</>
			);
		}
	}
);
