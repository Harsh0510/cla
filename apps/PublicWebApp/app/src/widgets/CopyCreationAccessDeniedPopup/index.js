/**Edit Link style component that applied in table as edit link */
import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import withAuthConsumer from "../../common/withAuthConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import date from "../../common/date";
import Modal from "../../widgets/Modal";
import messageType from "../../common/messageType";
import MessageBox from "../../widgets/MessageBox";
import ContactSupportLink from "../../widgets/ContactSupportLink";
import userDidChange from "../../common/userDidChange";
import customSetTimeout from "../../common/customSetTimeout";

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
		`}
`;

const Wrap = styled.div`
	font-size: 14px;
	. {
		padding: 1em;
	}
`;

const ModalHeader = styled.h2`
	font-size: 1.5em;
	margin-bottom: 0.8em;
	font-weight: 400;
	line-height: 20px;
`;

const ModalHeaderDescription = styled.div`
	margin-bottom: 0.8em;
`;

const ModalBody = styled.div`
	margin-bottom: 1em;
`;

const ModalContent = styled.div`
	padding: 0.5em 0 2em;
	color: ${theme.colours.black};
`;

export default withApiConsumer(
	withAuthConsumer(
		class CopyCreationAccessDeniedPopup extends React.PureComponent {
			state = {
				doShowMessage: false,
				isLoading: false,
				resultMessageType: null,
			};

			onEventClick = () => {
				const myUserDetails = this.props.withAuthConsumer_myUserDetails;
				if (!myUserDetails.can_copy && !myUserDetails.has_verified && myUserDetails.has_trial_extract_access) {
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
							this.setState({ resultMessageType: resultMessageType, doShowMessage: true, isLoading: false });
							this._timeout = customSetTimeout(() => {
								if (this._isMounted) {
									this.setState({ resultMessageType: null, doShowMessage: false });
								}
							}, 5000);
						});
				}
			};

			componentDidMount() {
				this._isMounted = true;
				this.updateState();
			}

			componentDidUpdate(prevProps) {
				if (userDidChange(this.props, prevProps)) {
					this.updateState();
				}
			}

			componentWillUnmount() {
				if (this._timeout) {
					clearTimeout(this._timeout);
				}
				delete this._timeout;
				delete this._isMounted;
			}

			updateState = () => {
				this.setState({
					doShowMessage: false,
					resultMessageType: null,
					isActive: true,
				});
			};

			handleClose = () => {
				if (typeof this.props.handleClose === "function") {
					this.props.handleClose();
				}
			};

			render() {
				const myUserDetails = this.props.withAuthConsumer_myUserDetails;
				if (!myUserDetails || myUserDetails.can_copy || !myUserDetails.has_trial_extract_access) {
					return;
				}
				const dateCreated = date.rawToNiceDate(myUserDetails.date_created);
				const successMessage = "Email sent.";
				const errorMessage = (
					<div>
						Email could not be sent. If you believe you are seeing this message in error, please speak to the Education Platform administrator for
						your institution or <ContactSupportLink linkText="contact us" />.
					</div>
				);

				return (
					<>
						<Wrap>
							<Modal show={true} handleClose={this.handleClose} modalWidth={"670px"} isApplyMobileLarge={true}>
								<ModalContent>
									{myUserDetails.has_verified ? (
										<>
											<ModalHeader>Wait a moment!</ModalHeader>
											<ModalBody>
												<span>
													Thank you for previously confirming your email address. However, we still need your account to be approved either by the
													Education Platform administrator at your institution or at CLA. If you have problems with your access please{" "}
													<ContactSupportLink linkText="contact support" />.
												</span>
											</ModalBody>
										</>
									) : (
										<>
											<ModalHeader>We've not heard from you</ModalHeader>
											<ModalBody>
												<ModalHeaderDescription>
													On {dateCreated} we sent you an email asking you to confirm your email address, which we need you to do so that you can
													continue to make and use copies.
												</ModalHeaderDescription>
												<span>
													To complete your email confirmation,{" "}
													<CopyEditLinkButton onClick={this.onEventClick} disable={this.state.isLoading}>
														request a new email{" "}
													</CopyEditLinkButton>
													{this.state.isLoading && (
														<span>
															<i className="fa fa-spinner fa-spin" />
															{"  "}
														</span>
													)}
													to be sent to you.
												</span>
												<br />
												<span>
													If you have problems with your access please <ContactSupportLink linkText="contact support" />.
												</span>
											</ModalBody>
										</>
									)}
									{this.state.doShowMessage && this.state.resultMessageType === messageType.success && (
										<>
											<MessageBox type={this.state.resultMessageType} message={successMessage} displayIcon={true}></MessageBox>
										</>
									)}
									{this.state.doShowMessage && this.state.resultMessageType === messageType.error ? (
										<>
											<MessageBox type={this.state.resultMessageType} message={errorMessage} displayIcon={true}></MessageBox>
										</>
									) : (
										""
									)}
								</ModalContent>
							</Modal>
						</Wrap>
					</>
				);
			}
		}
	)
);
