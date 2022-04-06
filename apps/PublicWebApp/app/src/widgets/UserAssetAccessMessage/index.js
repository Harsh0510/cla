import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import withAuthConsumer from "../../common/withAuthConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import messageType from "../../common/messageType";
import Modal from "../../widgets/Modal";
import ContactSupportLink from "../../widgets/ContactSupportLink";

const CopyEditLinkButton = styled.span`
	background: none;
	font-weight: bold;
	border: 0;
	color: ${theme.colours.headerButtonSearch};
	cursor: pointer;
	${(p) =>
		p.disable &&
		css`
			opacity: 0.3;
			pointer-events: none;
		`};
`;

const ModalContent = styled.div`
	padding: 0.5em 0 2em;
	color: ${theme.colours.black};
`;

const ModalHeader = styled.div`
	font-size: 1.5em;
	margin-bottom: 0.8em;
	font-weight: 400;
	line-height: 20px;
`;

const ModalHeaderDescription = styled.div`
	font-size: 0.875em;
	font-weight: 400;
	line-height: 1.4em;
	margin-bottom: 0.4em;

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		line-height: 17px;
	}
`;

export default withApiConsumer(
	withAuthConsumer(
		class UserAssetAccessMessage extends React.PureComponent {
			state = {
				isLoading: false,
				doShowModal: false,
				messageType: null,
			};

			componentDidMount() {
				this._isMounted = true;
			}

			componentWillUnmount() {
				delete this._isMounted;
			}

			onClickEventLink = () => {
				if (!this.props.withAuthConsumer_myUserDetails.can_copy && !this.props.withAuthConsumer_myUserDetails.has_verified) {
					this.setState({ isLoading: true });
					let resultMessageType = null;
					this.props
						.api("/auth/user-resend-registration")
						.then((response) => {
							if (!this._isMounted) {
								return;
							}
							if (response.result) {
								resultMessageType = messageType.success;
							} else {
								resultMessageType = messageType.error;
							}
						})
						.catch((error) => {
							if (!this._isMounted) {
								return;
							}
							resultMessageType = messageType.error;
						})
						.finally(() => {
							if (!this._isMounted) {
								return;
							}
							this.setState({ messageType: resultMessageType, doShowModal: true, isLoading: false });
						});
				}
			};

			handleCloseModal = () => {
				this.setState({ doShowModal: false });
			};

			render() {
				const myUserDetails = this.props.withAuthConsumer_myUserDetails;
				if (myUserDetails && myUserDetails.can_copy) {
					return null;
				}
				const hasVerified = myUserDetails && myUserDetails.has_verified;

				return (
					<>
						{hasVerified ? (
							<span className={this.props.className}>
								This book is unlocked.
								<br />
								You will not be able to make copies until your account request has been approved by the Education Platform administrator at your
								institution or the CLA. If you need help with this, please send us a <ContactSupportLink linkText="support request" />.
							</span>
						) : (
							<span className={this.props.className}>
								This book is unlocked.
								<br />
								You will not be able to make copies until you confirm your email address.
								<br />
								Re-send the{" "}
								<CopyEditLinkButton onClick={this.onClickEventLink} disable={this.state.isLoading}>
									verification email
									{this.state.isLoading && (
										<>
											&nbsp;
											<i className="fa fa-spinner fa-spin" />
										</>
									)}
								</CopyEditLinkButton>
								.
								<br />
								If you need help with this, please send us a <ContactSupportLink linkText="support request" />.
							</span>
						)}
						{this.state.doShowModal ? (
							<Modal show={true} handleClose={this.handleCloseModal} modalWidth="670px">
								<ModalContent>
									<ModalHeader>
										{this.state.messageType === messageType.success ? (
											<span>
												<i className="fa fa-check"></i> Success
											</span>
										) : (
											<span>
												<i className="fal fa-exclamation-triangle"></i> Error
											</span>
										)}
									</ModalHeader>
									<ModalHeaderDescription>
										{this.state.messageType === messageType.success ? (
											<span>Verification email sent. Please check your email and click the link to confirm your email address is correct.</span>
										) : (
											<span>
												Email could not be sent. If you believe you are seeing this message in error, please speak to the Education Platform
												administrator for your institution or <ContactSupportLink linkText="contact us" />.
											</span>
										)}
									</ModalHeaderDescription>
								</ModalContent>
							</Modal>
						) : (
							""
						)}
					</>
				);
			}
		}
	)
);
