import React from "react";
import styled from "styled-components";
import theme from "../../common/theme";
import Modal from "../../widgets/Modal";
import { TitleNotAvailableForNotification } from "../../widgets/SendEmailLink";
import withAuthRequiredConsumer from "../../common/withAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import { Button } from "../Layout/Button";

const Wrap = styled.div`
	font-size: 1em;
`;

const ModalBody = styled.div``;

const ModalFooter = styled.div`
	padding: 2em;
	width: 100%;
	background-color: ${theme.colours.lime};
`;

const FooterContent = styled.div`
	margin-bottom: 0.5em;
`;

const ConfirmText = styled.div`
	margin-top: 0.75em;
	margin-bottom: 0.75em;
	font-size: 1.2em;
	font-weight: bold;
`;

const FooterButtonSection = styled.div`
	display: flex;
	justify-content: space-between;
`;

const ModalContent = styled.div`
	color: ${theme.colours.black};
`;

const StyledButton = styled(Button)`
	justify-content: space-between;
	align-items: center;
	display: flex;
	text-decoration: none;
	color: ${theme.colours.white};
	background-color: ${theme.colours.primary};

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		margin-top: 15px;
	}
	i {
		font-size: 22px;
		line-height: 15px;
		margin-left: 20px;
	}
	opacity: ${(p) => (p.disabled ? "0.5" : "1")};
	cursor: ${(p) => (p.disabled ? "none" : "pointer")};
`;

const DisplayMessage = styled.div`
	color: ${theme.colours.white};
	background-color: ${(p) => (p.bgColor ? p.bgColor : theme.colours.lightRed)};
	padding: 1em;
	border-radius: 10px;
	font-size: ${(p) => (p.isShowUploadOwnExtract ? "16px" : "18px")};
	text-align: center;
	a {
		color: ${theme.colours.white} !important;
		font-weight: bolder;
		cursor: pointer;
	}
`;

const IconWrapper = styled.div`
	color: ${(p) => (p.color ? p.color : theme.colours.black)};
	i {
		font-size: ${(p) => (p.iconSize ? p.iconSize : "16em")};
		@media screen and (max-width: ${theme.breakpoints.mobile}) {
			font-size: 10em;
		}
	}
`;

const Icon = styled.i`
	pointer-events: none;
`;

const BoxArea = styled.div`
	width: 100%;
	height: 300px;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		height: 280px;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile4}) {
		height: 250px;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile1}) {
		height: 190px;
	}
`;

const BoxAreaInner = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	background-image: url(${require("../../assets/images/unlock_bg.svg")});
	background-size: 99%;
	background-repeat: no-repeat;
	background-position: center;
	@keyframes popCorner {
		100% {
		}
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		order: 1;
	}
`;

const BoxAreaOne = styled(BoxAreaInner)`
	padding: 0.4em;
	text-align: center;
`;

const BoxTextArea = styled(BoxAreaInner)`
	padding: 2em;
	text-align: left;
	font-size: 1.2em;
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding: 1em;
		font-size: 1em;
	}
`;
const WrapModalContent = styled.div`
	margin: 2em;
	${(p) => p.isRemovedTopMargin && `margin-top: 0`}
`;

const AnchorLink = styled.a`
	background: transparent;
	color: ${theme.colours.primary};
	text-decoration: underline;
	width: 100%;
	text-align: left;
`;

const Span = styled.span`
	font-weight: bold;
	color: ${theme.colours.white};
	background: transparent;
	text-decoration: underline;
	cursor: pointer;
`;

const FooterButtonWrapper = styled.div`
	margin-top: 2.5em;
`;

/**
 * isUnlock	==> if {true} component used by the unlock work page, if {false} than component not used by the unlock work page,
 * onCloseIntentToCopy ==> pop up close event which update the floag for not show popup {this.onCloseIntentToCopy}
 * unlock_attempt_oid ==> unlock_attempt_oid uniquw identity id of unlock attempt raw
 * isbn ==> isbn from unlock_attempt table fetched raw
 * notification_oid ==> require when component used by the notification tab
 * has_replied ==> require when component used by the notification tab, for display the intentcopy form or not
 */
export default withAuthRequiredConsumer(
	withApiConsumer(
		class IntentToCopyForm extends React.PureComponent {
			state = {
				isLoading: false,
				loadingType: null,
				didSubmitIntentCopyForm: false,
				unlock_attempt_oid: null,
				errorIntentCopyForm: null,
				isShowUploadOwnExtract: true,
			};

			onAcceptIntentToCopy = () => {
				this.setState(
					{
						isLoading: true,
						loadingType: "accept",
					},
					() => this.updateIntentToCopy(true)
				);
			};

			onDenyIntentToCopy = () => {
				this.setState(
					{
						isLoading: true,
						loadingType: "deny",
					},
					() => this.updateIntentToCopy(false)
				);
			};

			updateIntentToCopy = (value) => {
				const params = {
					intent: value,
					oid: this.props.unlock_attempt_oid,
				};
				if (!this.props.isUnlock) {
					params.notification_oid = this.props.notification_oid || null;
				}

				this.props
					.api("/public/intent-to-copy-update", params)
					.then((result) => {
						const newState = {
							didSubmitIntentCopyForm: true,
							isLoading: false,
							loadingType: null,
						};
						if (result.updated) {
							newState.errorIntentCopyForm = null;
						} else {
							newState.errorIntentCopyForm = "Error: Something went wrong!";
						}
						this.setState(newState);
						if (typeof this.props.calledAfterSubmit === "function") {
							this.props.calledAfterSubmit();
						}
					})
					.catch((err) => {
						this.setState({
							didSubmitIntentCopyForm: true,
							isLoading: false,
							loadingType: null,
							errorIntentCopyForm: "Error: Something went wrong!",
						});
					});
			};

			onClose = (value) => {
				this.setState({ errorIntentCopyForm: null, didSubmitIntentCopyForm: false });
				this.props.onCloseIntentToCopy();
			};

			openContentRequestModal = () => {
				this.props.onCloseIntentToCopy();
				this.props.openContentRequestModal();
			};

			onAcceptUploadOwnExtract = () => {
				this.props.onCloseIntentToCopy();
				this.props.history.push("/asset-upload/before-we-start");
			};

			onDenyUploadOwnExtract = () => {
				this.setState({ isShowUploadOwnExtract: false });
			};

			render() {
				const { isbn = null, isUnlock, has_replied = false, isTemp } = this.props;
				const { didSubmitIntentCopyForm, errorIntentCopyForm, isLoading, loadingType, isShowUploadOwnExtract } = this.state;
				const myUserDetails = this.props.withAuthConsumer_myUserDetails;
				const displayMessage = !isUnlock ? (
					<TitleNotAvailableForNotification myUserDetails={myUserDetails} isbn={isbn || ""} />
				) : isTemp ? (
					<>
						It looks like that book ({isbn || ""}) either isn't on the Education Platform, or isn't available for temporary unlocking. But don't
						worry, we've logged this and will unlock it if it becomes available.
						<br />
						<Span onClick={this.openContentRequestModal}>Tell us about it</Span>
					</>
				) : (
					<>
						It looks like the book ({isbn || ""}) isn't on the Education Platform. But don't worry, we've logged this and will unlock it if it becomes
						available.
						<br />
						<br />
						You will receive an email from us when we add a book you have previously tried to unlock.
					</>
				);
				return (
					<Wrap>
						<Modal
							show={true}
							handleClose={this.onClose}
							modalWidth={"440px"}
							isApplyMobileLarge={true}
							showCloseLink={didSubmitIntentCopyForm || has_replied || (isUnlock && !isTemp)}
							defaultPadding={false}
						>
							<ModalContent id="ModalContent">
								<ModalBody id="ModalBody">
									{errorIntentCopyForm ? (
										<>
											<WrapModalContent isRemovedTopMargin={true}>
												<BoxArea>
													<BoxTextArea>
														<span>Error: Something went wrong!</span>
													</BoxTextArea>
												</BoxArea>
											</WrapModalContent>
										</>
									) : (
										<>
											{!didSubmitIntentCopyForm && !has_replied && (
												<>
													{isUnlock && (
														<WrapModalContent>
															<BoxArea>
																<BoxAreaOne>
																	<IconWrapper color={theme.colours.messageError} iconSize={"16em"}>
																		<Icon className="fa fa-exclamation-circle"></Icon>
																	</IconWrapper>
																</BoxAreaOne>
															</BoxArea>
														</WrapModalContent>
													)}

													<WrapModalContent>
														<DisplayMessage bgColor={theme.colours.bgDarkPurple} isShowUploadOwnExtract={isShowUploadOwnExtract}>
															{displayMessage}
														</DisplayMessage>
													</WrapModalContent>

													<ModalFooter>
														{isShowUploadOwnExtract ? (
															<>
																<FooterContent>
																	Would you like to upload your own PDF extract which can be used to create a copy for your students?
																</FooterContent>

																<FooterButtonWrapper>
																	<FooterButtonSection>
																		<StyledButton
																			onClick={this.onAcceptUploadOwnExtract}
																			disabled={isLoading}
																			data-ga-user-extract="entry-title-not-on-ep"
																		>
																			Yes&nbsp; <Icon className="fa fa-check" aria-hidden="true"></Icon>
																		</StyledButton>
																		<StyledButton onClick={this.onDenyUploadOwnExtract} disabled={isLoading}>
																			No&nbsp; <i className="fa fa-times" aria-hidden="true"></i>
																		</StyledButton>
																	</FooterButtonSection>
																</FooterButtonWrapper>
															</>
														) : (
															<>
																<FooterContent>
																	Did you know that you can also photocopy or make a digital scan of this book under the terms of the Education
																	Licence?
																</FooterContent>

																<FooterContent>
																	<AnchorLink href="https://www.cla.co.uk/licencetocopy" target="_blank">
																		More&nbsp;information
																	</AnchorLink>
																</FooterContent>

																<ConfirmText>Are you planning to do this now?</ConfirmText>

																<FooterButtonSection>
																	<StyledButton onClick={this.onAcceptIntentToCopy} disabled={isLoading}>
																		Yes&nbsp;{" "}
																		{loadingType === "accept" ? (
																			<i className="fa fa-spinner fa-spin" aria-hidden="true"></i>
																		) : (
																			<i className="fa fa-check" aria-hidden="true"></i>
																		)}
																	</StyledButton>
																	<StyledButton onClick={this.onDenyIntentToCopy} disabled={isLoading}>
																		No&nbsp;{" "}
																		{loadingType === "deny" ? (
																			<i className="fa fa-spinner fa-spin" aria-hidden="true"></i>
																		) : (
																			<i className="fa fa-times" aria-hidden="true"></i>
																		)}
																	</StyledButton>
																</FooterButtonSection>
															</>
														)}
													</ModalFooter>
												</>
											)}

											{didSubmitIntentCopyForm && (
												<>
													<WrapModalContent isRemovedTopMargin={true}>
														<BoxArea>
															<BoxTextArea>
																<span>
																	<b>Thank you</b> for letting us know. This information helps us monitor how the Education Licence is being used by
																	schools so that we can distribute revenue back to publishers and authors.
																</span>
															</BoxTextArea>
														</BoxArea>
													</WrapModalContent>
												</>
											)}
											{!isUnlock && !didSubmitIntentCopyForm && has_replied && (
												<>
													<WrapModalContent isRemovedTopMargin={true}>
														<BoxArea>
															<BoxTextArea>
																<span>This book is not on the Platform but we will let you know if it does become available.</span>
															</BoxTextArea>
														</BoxArea>
													</WrapModalContent>
												</>
											)}
										</>
									)}
								</ModalBody>
							</ModalContent>
						</Modal>
					</Wrap>
				);
			}
		}
	)
);
