import styled, { css } from "styled-components";
import theme from "../../common/theme";
import React from "react";
import { Link } from "react-router-dom";
import BarcodeSection from "./BarcodeSection";
import HelpLink from "./HelpLink";
import BarcodeTextMessage from "./BarcodeTextMessage";
import CapturedImagePreview from "./CapturedImagePreview";
import { colLg4, colMd6, colSm12 } from "../../common/style";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import Loader from "../../widgets/Loader";
import { Button } from "../../widgets/Layout/Button";
import staticValues from "../../common/staticValues";
import TempUnlockAsset from "../../widgets/TempUnlockAsset";
import { ButtonLink } from "../../widgets/Layout/ButtonLink";
import queryString from "query-string";
import { ButtonSmallWithIcon } from "../../widgets/Layout/ButtonSmallWithIcon";
import { WrapSmallButton } from "../../widgets/Layout/WrapSmallButton";

const WrapContainerOuter = styled.div`
	position: relative;
`;

const WrapContainer = styled.div`
	width: 100%;
	height: 100%;
	padding: 2em;
	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		display: flex;
		flex-wrap: wrap;
		padding: 3em;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		display: flex;
		flex-direction: column;
		padding: 2em 1.5em;
	}
	min-height: 300px;
	${(p) =>
		p.isLoading &&
		css`
			pointer-events: none;
			opacity: 0.1;
			position: absolute;
			z-index: 0;
		`}
`;

const StyledHelpLink = styled.div`
	a {
		font-size: 15px;
		text-decoration: underline;
		color: ${theme.colours.primaryDark};
		font-weight: 500;
	}
`;

const StyledCancel = styled(Link)`
	display: block;
	justify-content: center;
	flex-direction: column;
	text-align: right;
	color: ${theme.colours.primaryDark};
	text-decoration: underline;
	font-weight: 500;
	padding: 1em 0 0.5em 0;
	span {
		font-size: 1.2em;
		font-weight: bold;
	}
`;

const BarcodeMessageSection = styled.div`
	margin-top: 1em;
	width: 375px;
`;

const WrapperButtonSection = styled(Row)`
	margin-top: 15px;
	justify-content: center;
`;

// const StyledButton = styled(Button)`
// 	margin-right: 1rem;
// 	width: 100%;
// 	justify-content: space-between;
// 	align-items: center;
// 	display: flex;
// 	line-height: 1.2;
// 	margin-bottom: 15px;
// 	background-color: ${theme.colours.primary};
// 	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
// 		margin-top: 15px;
// 	}
// 	i {
// 		font-size: 22px;
// 		line-height: 15px;
// 		color: ${(p) => (p.iconColor ? p.iconColor : theme.colours.white)};
// 	}
// 	:hover {
// 		i {
// 			color: ${(p) => (p.iconColor ? p.iconColor : theme.colours.primary)};
// 		}
// 	}
// `;

const MessageBlock = styled.div`
	margin-top: 0em;
`;

const HelpTextMessage = styled.div`
	width: 375px;
	max-width: 100%;
	margin: 0 auto;
`;

const FormHeaderWrapper = styled.div`
	padding: 20px 0 20px;
	background-color: ${theme.colours.bgDarkPurple};
	color: ${theme.colours.white};
`;

const WrapRow = styled.div`
	display: flex;
	align-items: center;
	flex-direction: row;
`;

const FormIcon = styled.div`
	height: 63px;
	width: 63px;
	line-height: 60px;
	text-align: center;
	background-color: ${theme.colours.white};
	color: ${theme.colours.bgDarkPurple};
	border-radius: 50%;
	flex-shrink: 0;
	margin-right: 0.75em;

	i {
		font-size: 35px;
		vertical-align: middle;
	}
`;

const FormTitle = styled.h1`
	font-size: 36px;
	line-height: 1;
	margin: 0;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		font-size: 32px;
	}
`;

const ContentSection = styled(Row)`
	justify-content: center;
`;

const SectionWidth = styled.div`
	${colMd6}
	${colSm12}
	${colLg4}
`;

const HelpText = styled(SectionWidth)`
	font-weight: normal;
	font-size: 16px;
	text-align: left;
	margin-bottom: 1em;
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		margin-top: -0.5em;
		margin-bottom: 1em;
	}
`;

const WrapForm = styled.div`
	background-color: ${theme.colours.white};
	display: inline;
	margin-left: 15px;
	form {
		display: inline;
	}
`;

const SubmitButton = styled(Button)`
	color: ${theme.colours.white};
	background-color: ${theme.colours.primary};
	padding: 2px 10px;
	white-space: nowrap;
	.btn:hover {
		background-color: ${theme.colours.primary};
	}

	@media screen and (max-width: ${theme.breakpoints.laptop}) {
		margin-left: 0px;
	}
`;

const BackButton = styled(ButtonLink)`
	background-color: ${theme.colours.primary};
	color: ${theme.colours.white};
	padding: 2px 10px;
	margin-left: 10px;
	:hover {
		text-decoration: none;
		color: ${theme.colours.primary};
		background-color: ${theme.colours.white};
	}
`;

const WrapButtonClose = styled.div`
	text-align: right;
	width: 375px;
`;

const ErrorMessage = styled.p`
	color: ${theme.colours.red};
	margin-top: 2px;
`;

const TempUnlockWrap = styled.div`
	position: absolute;
	right: -90%;
	width: 360px;
	padding: 20px;
	top: 16%;
	box-shadow: ${theme.shadow};
	background-color: ${theme.colours.bgDarkPurple};
	color: ${theme.colours.white};

	@media screen and (max-width: ${theme.breakpoints.desktop3}) {
		right: -100%;
		width: 320px;
	}
	@media screen and (max-width: ${theme.breakpoints.desktop1}) {
		width: 275px;
	}
	@media screen and (max-width: ${theme.breakpoints.laptop}) {
		right: -100%;
		width: 260px;
	}

	@media screen and (max-width: ${theme.breakpoints.tabletPro}) {
		right: 0;
		left: 0;
		width: 375px;
		position: relative;
		margin-top: 50px;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile3}) {
		margin-top: 20px;
	}
`;

const TempUnlock = styled.div`
	overflow-y: auto;
	max-height: 200px;
	::-webkit-scrollbar {
		width: 10px;
	}
	::-webkit-scrollbar-track {
		background: transparent;
	}
	::-webkit-scrollbar-thumb {
		background: ${theme.colours.lightGray};
		border-radius: 0;
	}
	::-webkit-scrollbar-thumb:hover {
		background: ${theme.colours.lightGray};
	}
`;

const IsbnInput = styled.input`
	width: 160px;
	border: 1px solid #006473;
	padding: 8px 5px;
	font-size: 16px;
	background-color: ${theme.colours.white};
	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		width: 100%;
		margin-bottom: 15px;
	}
`;

const TempararyUnlockFormTitle = styled.div`
	margin-bottom: 5px;
`;

const WrapTempararyUnlockForm = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		flex-direction: column;
	}
`;

const TempararyUnlockInputWrap = styled.div`
	width: 160px;
	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		width: 100%;
	}
`;

const TempararyUnlockButtonWrap = styled.div`
	width: calc(100% - 170px);
	margin-left: 10px;
	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		width: 100%;
		margin-left: 0;
		margin-bottom: 15px;
	}
`;
const Span = styled.span`
	font-weight: bold;
	color: ${theme.colours.white};
	background: transparent;
	text-decoration: underline;
	cursor: pointer;
`;

const AssetUnlockButton = styled(Link)`
	margin-right: 1rem;
	width: 100%;
	justify-content: space-between;
	align-items: center;
	display: flex;
	text-decoration: none;
	color: ${theme.colours.white};
	line-height: 1.3;
	background-color: ${theme.colours.primary};
	border: 1px solid ${theme.colours.primary};
	padding: 0.45rem 1.26rem;
	font-size: 14px;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		margin-top: 15px;
	}
	i {
		font-size: 22px;
		line-height: 15px;
		color: ${(p) => (p.iconColor ? p.iconColor : theme.colours.white)};
	}
	:hover {
		background-color: ${theme.colours.white};
		color: ${theme.colours.primary};
		i {
			color: ${(p) => (p.iconColor ? p.iconColor : theme.colours.primary)};
		}
	}
`;

const UnlockAgainButton = styled(ButtonSmallWithIcon)`
	padding: 16px;
	@media screen and (max-width: ${theme.breakpoints.laptop}) {
		padding: 8px;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		padding: 16px;
	}
`;

const CloudIcon = styled.i`
	pointer-events: none;
`;
export default class Overview extends React.PureComponent {
	doUnlockMore = (e) => {
		e.preventDefault();
		this.props.unlockMore(e.currentTarget.getAttribute("data-type"));
	};

	render() {
		const props = this.props;
		const loading = props.loading ? true : false;
		const barcodeTextMessageBody = BarcodeTextMessage(props);
		const parsed = queryString.parse(this.props.location.search);
		const closeLink =
			(props.unlockStatus === staticValues.unlockAttemptStatus.tempUnlocked ||
				(props.unlockStatus === staticValues.unlockAttemptStatus.notOwnedBySchool && parsed.isbn)) &&
			props.isbnTitle
				? `/works/${props.isbnTitle} `
				: "/unlock";
		return (
			<>
				<FormHeaderWrapper id={props.id ? props.id : "unlockAssetForm"}>
					<Container>
						<ContentSection>
							<SectionWidth>
								<WrapRow>
									<FormIcon>
										<i className="far fa-unlock"></i>
									</FormIcon>
									<FormTitle>Unlock Content</FormTitle>
								</WrapRow>
							</SectionWidth>
						</ContentSection>
					</Container>
				</FormHeaderWrapper>
				<WrapContainerOuter>
					<WrapContainer isLoading={loading ? true : false}>
						{!parsed.isbn && (
							<Container>
								<ContentSection>
									<HelpText>
										<HelpTextMessage>
											{/* If {props.school} owns a copy of the book, scan the barcode on it's back cover to unlock this title for copying. */}
											To make a copy, scan the barcode on the back cover. Your institution must own a copy of this content.
											<br />
											<StyledHelpLink>
												<HelpLink title="Need help?" link="/faq" isInfoIcon={true} />
											</StyledHelpLink>
											<StyledHelpLink>
												<a onClick={props.unlockWithoutPhysicalCopy}>What if you don't have the book with you?</a>
											</StyledHelpLink>
										</HelpTextMessage>
									</HelpText>
								</ContentSection>
							</Container>
						)}
						<Container>
							<ContentSection>
								<SectionWidth>
									<ContentSection>
										<BarcodeMessageSection>
											{!props.show ? (
												<StyledCancel to="/">
													Cancel <span>X</span>
												</StyledCancel>
											) : (
												""
											)}
										</BarcodeMessageSection>
									</ContentSection>

									<ContentSection>
										{props.isTemp && props.unlockStatus !== null && props.unlockStatus !== staticValues.unlockAttemptStatus.tempUnlockedMustConfirm && (
											<WrapButtonClose>
												<StyledHelpLink>
													<HelpLink title="Close X" link={closeLink} isInfoIcon={false}></HelpLink>
												</StyledHelpLink>
											</WrapButtonClose>
										)}
									</ContentSection>
									<ContentSection>
										<BarcodeSection {...props} />
									</ContentSection>

									<ContentSection>
										<BarcodeMessageSection>
											{props.unlockStatus === staticValues.unlockAttemptStatus.doesNotExist ? (
												props.isTemp ? (
													<>
														It looks like that book ({props.resultCode ? props.resultCode : ""}) either isn't on the Education Platform, or isn't
														available for temporary unlocking. But don't worry, we've logged this and will unlock it if it becomes available.
														<br />
														<Span onClick={props.openContentRequestModal}>Tell us about it</Span>
													</>
												) : (
													<>
														It looks like that book ({props.resultCode ? props.resultCode : ""}) isn't on the Education Platform. But don't worry,
														we've logged this and will unlock it if it becomes available.
														<br />
														<Span onClick={props.openContentRequestModal}>Tell us about it</Span>
													</>
												)
											) : (
												barcodeTextMessageBody != null && (
													<MessageBlock className="" isUnlocked={props.unlocked}>
														{barcodeTextMessageBody}
													</MessageBlock>
												)
											)}
											<MessageBlock>
												{props.isTemp && (props.unlockStatus === null || props.unlockStatus === staticValues.unlockAttemptStatus.alreadyUnlocked) && (
													<>
														<WrapForm>
															<TempararyUnlockFormTitle>Carefully type the ISBN of the book</TempararyUnlockFormTitle>
															<WrapTempararyUnlockForm>
																<TempararyUnlockInputWrap>
																	<IsbnInput type="text" ref={props.findBookInputRef}></IsbnInput>
																</TempararyUnlockInputWrap>
																<TempararyUnlockButtonWrap>
																	<SubmitButton type="submit" onClick={props.findBookOnClick}>
																		Find Book
																	</SubmitButton>
																	<BackButton title="Back" to={"/unlock"} onClick={props.backFromTempUnlock}>
																		Back
																	</BackButton>
																</TempararyUnlockButtonWrap>
															</WrapTempararyUnlockForm>
														</WrapForm>
														{props.isbnValidationMsg ? <ErrorMessage>{props.isbnValidationMsg}</ErrorMessage> : null}
													</>
												)}
											</MessageBlock>

											{!props.isTemp && props.unlocked && !props.didCaputre ? (
												<WrapperButtonSection>
													<WrapSmallButton isPaddingRight={true}>
														<ButtonSmallWithIcon onClick={this.doUnlockMore} data-type="unlock-more">
															Unlock more <i className="fal fa-unlock-alt"></i>
														</ButtonSmallWithIcon>
													</WrapSmallButton>
													<WrapSmallButton isPaddingLeft={true}>
														<ButtonSmallWithIcon onClick={props.setStateForRedirection}>
															Take me to my book <i className="fal fa fa-caret-right"></i>
														</ButtonSmallWithIcon>
													</WrapSmallButton>
												</WrapperButtonSection>
											) : (
												<>
													{props.showUnlockMore ? (
														<WrapperButtonSection>
															<WrapSmallButton>
																<ButtonSmallWithIcon onClick={this.doUnlockMore} data-type="unlock-more">
																	Unlock more <i className="fal fa-unlock-alt"></i>
																</ButtonSmallWithIcon>
															</WrapSmallButton>
														</WrapperButtonSection>
													) : (
														""
													)}
												</>
											)}
											{!props.isTemp && props.doDisplayTakePictureOptions ? (
												<>
													<WrapperButtonSection>
														<WrapSmallButton isPaddingRight={true}>
															<ButtonSmallWithIcon onClick={props.onAcceptTakePicture} iconColor={theme.colours.lightGreen}>
																Yes <i className="fa fa-check" aria-hidden="true"></i>
															</ButtonSmallWithIcon>
														</WrapSmallButton>
														<WrapSmallButton isPaddingLeft={true}>
															<ButtonSmallWithIcon onClick={props.onDenyTakePicture} iconColor={theme.colours.lightRed}>
																No <i className="fa fa-times" aria-hidden="true"></i>
															</ButtonSmallWithIcon>
														</WrapSmallButton>
													</WrapperButtonSection>
													<WrapperButtonSection>
														{this.props.myUserDetails && this.props.myUserDetails.role === "cla-admin" ? (
															<WrapSmallButton>
																<ButtonSmallWithIcon onClick={this.doUnlockMore} data-type="try-unlocking-again">
																	Try unlocking again <i className="fal fa-unlock-alt"></i>
																</ButtonSmallWithIcon>
															</WrapSmallButton>
														) : (
															<>
																<WrapSmallButton isPaddingRight={true}>
																	<UnlockAgainButton onClick={this.doUnlockMore} data-type="try-unlocking-again">
																		Try unlocking again <i className="fal fa-unlock-alt"></i>
																	</UnlockAgainButton>
																</WrapSmallButton>
																<WrapSmallButton isPaddingLeft={true}>
																	<AssetUnlockButton to="/asset-upload" data-ga-user-extract="entry-barcode-not-detected">
																		Upload your own content<CloudIcon className="far fa-cloud-upload"></CloudIcon>
																	</AssetUnlockButton>
																</WrapSmallButton>
															</>
														)}
													</WrapperButtonSection>
												</>
											) : props.doDisplayTakePictureButton ? (
												<WrapperButtonSection>
													<WrapSmallButton>
														<ButtonSmallWithIcon onClick={props.onClickCapture} title="Capture Image">
															OK <i className="fa fa-camera" aria-hidden="true"></i>
														</ButtonSmallWithIcon>
													</WrapSmallButton>
												</WrapperButtonSection>
											) : (
												""
											)}
										</BarcodeMessageSection>
									</ContentSection>
									{!!props.previewImageDataUrl && (
										<CapturedImagePreview
											onDenyPreview={props.onDenyPreview}
											onAcceptPreview={props.onAcceptPreview}
											isSending={props.isSending}
											previewImageDataUrl={props.previewImageDataUrl}
										/>
									)}

									{props.myUserDetails && props.tempUnlockAssetTitles && props.tempUnlockAssetTitles.length > 0 && (
										<ContentSection>
											<TempUnlockWrap>
												<TempUnlock>
													<TempUnlockAsset multiple={true} data={props.tempUnlockAssetTitles} />
												</TempUnlock>
											</TempUnlockWrap>
										</ContentSection>
									)}
								</SectionWidth>
							</ContentSection>
						</Container>
					</WrapContainer>
					{loading && <Loader />}
				</WrapContainerOuter>
			</>
		);
	}
}
