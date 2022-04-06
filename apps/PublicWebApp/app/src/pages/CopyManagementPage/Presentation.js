import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import Header from "../../widgets/Header";
import withPageSize from "../../common/withPageSize";
import Loading from "../../widgets/Loader";
import { Link } from "react-router-dom";
import CoverPage from "../../widgets/CoverPage";
import GenerateCopyRightImage from "../../widgets/GenerateCopyRightImage";
import WizardExtract from "../../widgets/WizardExtract";
import BookCoverPage from "./BookCoverPage";
import CopyContentPage from "./CopyContentPage";
import FlyoutModal from "../../widgets/FlyOutModal";
import Flyout from "../../widgets/Flyout";
import flyOutGuide from "./flyOutGuide";
import { col12 } from "../../common/style";
import { Container } from "../../widgets/Layout/Container";

const FLYOUT_DEFAULT_INDEX = -1; // user not seen any flyout for this screen
const FLYOUT_INDEX_SHARE_LINK = 0; // display flyout option 1 as per flyoutguide.flyout array
const FLYOUT_INDEX_COPY_READY = 2; // display flyout option 2 as per flyoutguide.flyout array
const FLYOUT_INDEX_FINAL_NOTIFICATION = 3; // display  flyout  notification
const FLYOUT_DEFAULT_NOTIFICATION = -1; // default notification index
const NOTIFICATION_COUNT_DEFAULT = 0; // default notification count

const IS_IECSS = window.navigator.userAgent.indexOf("Trident/") > 0 || window.navigator.userAgent.indexOf("MSIE") > 0 ? true : false;

const JUMP_TO_CONTENT_ID = "main-content";

const NoPrint = styled.div`
	@media print and (min-width: 480px) {
		display: none;
	}
`;

const Print = styled.div`
	display: none;
	@media print and (min-width: 480px) {
		display: block;
		-webkit-print-color-adjust: exact;

		html {
		}

		body {
			margin: 0;
			padding: 0;
			width: 100%;
			page-break-after: avoid;
			page-break-before: avoid;
		}

		@page {
			margin: 0;
			padding: 0;
		}
		.align-self-end img {
			width: 3em !important;
			padding-top: ${(p) => (p.isIE ? "1em" : "0")};
		}

		.cover-page-wrap {
			display: block;
			width: 100%;
			height: 100%;
			max-height: 100vh;
			padding: ${(p) => (p.isIE === true ? "1em 2em" : "1em 2em")};
		}

		.print-cover-page {
			margin: auto;
			height: 100%;
			width: 100%;
		}

		.belowPages {
			page-break-before: always;
			display: block;
			text-align: center;
			.inlineBlock {
				display: inline-block;
				vertical-align: middle;
				position: relative;
				height: 100%;
				width: 100%;
			}
			.topImage {
				width: 100%;
				max-width: 100%;
				max-height: 100vh;
				page-break-inside: avoid;
			}
		}
		.bottom-right-image {
			bottom: ${(p) => (p.isIE === true ? "10px" : "10px")};
			z-index: 99;
			position: absolute;
			right: 10px;
			page-break-inside: avoid;
		}
	}

	@media print and (orientation: landscape) {
		.print-cover-page {
			margin: auto;
			max-height: 98vh !important;
			page-break-inside: avoid;
		}
		.belowPages {
			page-break-inside: avoid;
			text-align: center;
			.inlineBlock {
				margin-top: ${(p) => (p.isIE ? "10px" : "0")};
				page-break-inside: avoid;
				display: inline-block;
				position: relative;
				max-width: ${(p) => (p.isIE ? "550px" : "560px")};
				max-height: ${(p) => (p.isIE ? "90%" : "100%")};
			}
			.topImage {
				height: auto;
				page-break-inside: avoid;
			}
		}
	}
`;

const CoverPageWrap = styled.div`
	padding: ${(p) => (p.isIE === true ? "1em 2em" : "2em")};
	page-break-inside: avoid;
	page-break-after: auto;
`;

const NewCopyMessage = styled.div`
	display: inline-flex;
	background: ${theme.colours.darkGray};
	color: ${theme.colours.white};
	padding: 0.5em 0.5em 0.5em 1em;
	border-radius: 20px;
	vertical-align: middle;
	margin: 1em 0.5em;

	span {
		float: left;
	}

	@media only screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		margin: 2em 0.5em 0.5em 0.5em;
		line-height: 1;
	}
`;

const WrapNewCopyMessage = styled.div`
	${col12}
	padding-top: 1rem;
	text-align: center;
	@media screen and (min-width: ${theme.breakpoints.tabletPro}) {
		padding-top: 0;
	}
`;

const CloseButton = styled.button`
	background-color: transparent;
	border: 0;
	margin-left: 0.5em;
	display: inline-block;
	padding: 0;
	font-weight: bold;
	color: ${theme.colours.white};
	i {
		font-weight: bold;
		font-size: 12px;
	}
`;

const CloseIcon = styled.i`
	margin-right: 0.5rem;
`;

export default withPageSize(
	class Presentation extends React.PureComponent {
		constructor(props) {
			super(props);
			this.createLinkRef = React.createRef(null);
			this.createShareLinkRef = React.createRef(null);
			this.notificationRef = React.createRef(null);
		}

		onCloseNewCopyMessage = (e) => {
			e.preventDefault();
			this.props.hideNewCopyMessage();
		};

		onDoPrint = (e) => {
			if (e) {
				e.preventDefault();
			}
			//In future if Windows freezes with a 'script is unresponsive' popup appear then coment out the setTimeout function
			window.print();
			//setTimeout(() => {
			// //We have to add a timeout because otherwise Chrome 72 on Windows freezes with a 'script is unresponsive' popup after 20s of inactivity.
			//window.print();
			// //We have added a reload the page for avoid to redirect to wrong places
			// //window.location.reload();
			//}, 100);
		};

		render() {
			const props = this.props;
			let copyRightTextImage = GenerateCopyRightImage(props.pageFooterText);
			if (props.copiesData && props.copiesData.length) {
				const data = props.copiesData.find((item) => item.oid === props.copyOid);
				const urlEncodeAsset = data ? data.work_isbn13 + "-" + data.work_title.replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase() : "";

				let closing =
					props.flyOutIndex === FLYOUT_INDEX_COPY_READY &&
					props.flyOutIndexNotification === FLYOUT_DEFAULT_NOTIFICATION &&
					props.notificationCount > NOTIFICATION_COUNT_DEFAULT
						? false
						: true;

				return (
					<>
						<Print isIE={IS_IECSS}>
							<CoverPageWrap isIE={IS_IECSS} className="cover-page-wrap">
								<CoverPage data={data} />
							</CoverPageWrap>
							{props.getPagesForPrint()}
						</Print>
						<NoPrint>
							<Header
								flyOutIndexNotification={props.flyOutIndexNotification}
								setNotificationCount={props.setNotificationCount}
								onClose={props.onCloseNotification}
								notificationRef={this.notificationRef}
								jumpToContentId={JUMP_TO_CONTENT_ID}
							/>
							<WizardExtract step={5} unlocked={true} />
							{props.action && (
								<WrapNewCopyMessage>
									<NewCopyMessage>
										<span>{props.action === "created" ? "Congratulations! " : ""}Your copy is now saved. </span>
										<CloseButton onClick={this.onCloseNewCopyMessage}>
											<CloseIcon className="fal fa-times"></CloseIcon>
										</CloseButton>
									</NewCopyMessage>
								</WrapNewCopyMessage>
							)}

							{data ? (
								<BookCoverPage
									isShowBookInfo={props.isShowBookInfo}
									resultData={data}
									urlEncodeAsset={urlEncodeAsset}
									handleEvents={props.handleEvents}
									toggleWidth={props.toggleWidth}
									isTitleFull={props.isTitleFull}
									isAuthorFull={props.isAuthorFull}
									isPublisherFull={props.isPublisherFull}
									isEditorFull={props.isEditorFull}
									isTranslatorFull={props.isTranslatorFull}
									jumpToContentId={JUMP_TO_CONTENT_ID}
									onNoteSelect={props.onNoteSelect}
									onHighlightSelect={props.onHighlightSelect}
									selectedNote={props.selectedNote}
									selectedHighlight={props.selectedHighlight}
									isNoteDisplay={props.isNoteDisplay}
									onToggleFavorite={props.onToggleFavorite}
									showViewModal={props.showViewModal}
									action={props.action}
								/>
							) : (
								""
							)}

							<CopyContentPage
								isSidebar={props.sidebar}
								extractPages={props.extractPages}
								loading={props.loading}
								toggleSidebar={props.toggleSidebar}
								onDoPrint={this.onDoPrint}
								data={data}
								copyRightTextImage={copyRightTextImage}
								shareLinks={props.shareLinks}
								copyOid={props.copyOid}
								deactivateShare={props.deactivateShare}
								getShareLink={props.getShareLink}
								isCopyTitleEditable={props.isCopyTitleEditable}
								submitCopyTitleEditable={props.submitCopyTitleEditable}
								isDisplayCopyTitleEditable={props.isDisplayCopyTitleEditable}
								isLinkShare={props.isLinkShare}
								setStateForLinkShare={props.setStateForLinkShare}
								isLinkDeactivate={props.isLinkDeactivate}
								setStateForDeactivateLink={props.setStateForDeactivateLink}
								deactivateLinkId={props.deactivateLinkId}
								latestCreatedShareLinks={props.latestCreatedShareLinks}
								copiesData={props.copiesData}
								createLinkRef={this.createLinkRef}
								createShareLinkRef={this.createShareLinkRef}
								flyOutIndex={props.flyOutIndex}
								onCloseFlyOut={props.onCloseFlyOut}
								onOpen={props.onOpen}
								resetAccessCode={props.resetAccessCode}
								is_watermarked={props.is_watermarked}
								pageNumberToNoteMap={this.props.pageNumberToNoteMap}
								pageNumberToHighlightMap={this.props.pageNumberToHighlightMap}
								teacher={this.props.teacher}
								pageNumberToHighlightPageJoinMap={props.pageNumberToHighlightPageJoinMap}
								getCopiesData={props.getCopiesData}
								isViewingFullScreen={props.isViewingFullScreen}
								annotationsData={this.props.annotationsData}
							/>
						</NoPrint>
						{props.action === "created" && props.flyOutIndex === FLYOUT_DEFAULT_INDEX && (
							<FlyoutModal
								key={FLYOUT_DEFAULT_INDEX}
								handleShowMe={props.onCloseFlyOut}
								showButton={false}
								title={flyOutGuide.popupTitle}
								subTitle={flyOutGuide.popupSubTitle}
							/>
						)}
						{props.flyOutIndex === FLYOUT_INDEX_SHARE_LINK && (
							<Flyout key={FLYOUT_INDEX_SHARE_LINK} width={350} height={150} onClose={props.onCloseFlyOut} target={this.createLinkRef}>
								{flyOutGuide.flyOut[FLYOUT_INDEX_SHARE_LINK]}
							</Flyout>
						)}
						{props.flyOutIndex === FLYOUT_INDEX_COPY_READY && (
							<FlyoutModal
								key={FLYOUT_INDEX_SHARE_LINK}
								buttonText={flyOutGuide.buttonText}
								handleShowMe={props.onCloseFlyOut}
								showButton={true}
								closeBackgroundImmediately={closing}
								title={flyOutGuide.endPopupTitle}
							/>
						)}
						{props.flyOutIndex === FLYOUT_INDEX_FINAL_NOTIFICATION &&
						props.flyOutIndexNotification === FLYOUT_DEFAULT_NOTIFICATION &&
						props.notificationCount > NOTIFICATION_COUNT_DEFAULT ? (
							<Flyout width={350} height={110} onClose={props.onCloseNotification} target={this.notificationRef} side_preference={"bottom"}>
								{flyOutGuide.flyOutNotification}
							</Flyout>
						) : null}
					</>
				);
			}
			return (
				<>
					<Header />
					<Container>{props.loading ? <Loading /> : <div>{props.error}</div>}</Container>
				</>
			);
		}
	}
);
