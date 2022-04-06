import React from "react";
import { Link } from "react-router-dom";
import Header from "../../widgets/Header";
import styled from "styled-components";
import withApiConsumer from "../../common/withApiConsumer";
import PasswordPage from "../../widgets/PasswordPage";
import messageType from "../../common/messageType";
import theme from "../../common/theme";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import customSetTimeout from "../../common/customSetTimeout";
import MainTitle from "../../widgets/MainTitle";
import { ResendVerificationEmailFailMessage, getLegacyActivationFailMailto } from "../../widgets/SendEmailLink";
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

const LinkButton = styled.a`
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

const BackGroundLime = styled.div`
	background-color: ${theme.colours.lime};
`;
const PasswordSection = styled(PageContentLarge)`
	padding-top: 1.5rem;
`;

const WrapRow = styled(Row)`
	justify-content: center;
`;

const getNonExistentMessage = () => {
	return (
		<div>
			This activation link cannot be found. If you believe you are seeing this message in error, please speak to the Education Platform administrator
			for your institution or{" "}
			<LinkButton href={`mailto:${getLegacyActivationFailMailto()}`} title="Contact us">
				contact&nbsp;us
			</LinkButton>
			.
		</div>
	);
};

export default withApiConsumer(
	class ActivatePasswordPage extends React.PureComponent {
		state = {
			token: "",
			page_title: "Activate",
			message: null,
			hide: false,
			messageType: messageType.error,
			loading: false,
		};

		componentDidMount() {
			this._isMounted = true;
			this.setState({ token: this.props.match.params.token });
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
		handleSubmit = (params) => {
			// Prevent accidental double-submission...
			this.setState({
				loading: true,
			});
			this.props
				.api("/auth/activate", {
					activation_token: this.state.token,
					password: params.password,
					terms_accepted: params.terms_accepted,
				})
				.then((result) => {
					if (!this._isMounted) {
						return;
					}
					if (result.result) {
						this.setState({ message: `Your account has been verified.`, hide: true, messageType: messageType.success });
					} else {
						this.setState({
							message: `Your account was not verified. Are you sure you followed the link correctly?`,
							messageType: messageType.error,
						});
					}
				})
				.catch((result) => {
					if (!this._isMounted) {
						return;
					}
					if (result === "Token Expired") {
						this.setState({
							message: (
								<div>
									It appears that the Set Password Link you have clicked is expired. Please click{" "}
									<LinkButton onClick={this.doResendVerify}>this link</LinkButton> again in order to set your password.
								</div>
							),
							messageType: messageType.warning,
						});
					} else if (result === "Token NonExistent") {
						this.setState({
							message: getNonExistentMessage(),
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
		};

		/* Resend email verfication link */
		doResendVerify = (e) => {
			e.preventDefault();
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
								message: `'Set password' email sent`,
								messageType: messageType.success,
								hide: true,
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

		setStateTimeOut = () => {
			if (this._isMounted) {
				this.setState({
					loading: false,
				});
			}
		};

		render() {
			return (
				<>
					<HeadTitle title={PageTitle.activatePassword} />
					<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
					<MainTitle title="Activate" icon="fal fa-shield-check" id={JUMP_TO_CONTENT_ID} />
					<BackGroundLime>
						<Container>
							<WrapRow>
								<PageContentMedium>
									<Row>
										<PageLeftIconContent />
										<PasswordSection>
											<PageWrap>
												<PasswordPage
													hide={this.state.hide}
													title={this.state.page_title}
													message={this.state.message}
													handleSubmit={this.handleSubmit}
													loading={this.state.loading}
													messageType={this.state.messageType}
													isTCRequired={true}
												/>
												{this.state.hide ? (
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
							</WrapRow>
						</Container>
					</BackGroundLime>
				</>
			);
		}
	}
);
