import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import ContentBox from "./ContentBox";
import staticValues from "../../common/staticValues";
import { Row } from "../../widgets/Layout/Row";
import { HomePageContainer } from "../../widgets/Layout/HomePageContainer";
import { Link, withRouter } from "react-router-dom";
import date from "../../common/date";

const homeScreenBox = staticValues.homeScreenBox;
const FLYOUT_SCREEN_SEARCH = homeScreenBox.search;
const FLYOUT_SCREEN_UNLOCK = homeScreenBox.unlock;
const FLYOUT_SCREEN_REVIEW_COPIES = homeScreenBox.reviewCopies;
const FLYOUT_SCREEN_REVIEW_ROLLOVER = homeScreenBox.reviewRollover;

const unlockHtmlAtts = {
	"data-ga-overlay": "unlock",
};

const searchHtmlAtts = {
	"data-ga-overlay": "search",
};

const PopUpContainer = styled.div`
	background-image: url(${require("./../../assets/images/searchUnlockBackground.png")});
	background-repeat: no-repeat;
	background-position: left top;
	background-size: 90% 840px;
	min-height: 660px;
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		background-size: 100% 810px;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		background-size: cover;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		background-size: cover;
	}
`;

const WrapperPopUp = styled.div`
	padding-top: 3rem;
	padding-bottom: 3rem;
`;

const WrapRow = styled(Row)`
	justify-content: center;
`;

const WrapContent = styled(HomePageContainer)`
	text-align: center;
`;

const PopUpScreen = styled.div`
	position: relative;
	max-width: ${(p) => (p.maxWidth ? p.maxWidth : "887px")};
	margin-left: auto;
	margin-right: auto;
	padding-left: 1em;
	padding-right: 1em;
	h1 {
		font-size: 36px;
		line-height: 40px;
		margin-top: 45px;
	}
	p {
		font-size: 16px;
		line-height: 20px;
	}
`;

const ContentBoxWrap = styled.div`
	display: flex;
	margin-left: -1em;
	margin-right: -1em;
	& > div {
		flex: 1;
		margin-left: 1em;
		margin-right: 1em;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		display: block;
		margin-left: 0;
		margin-right: 0;
		& > div {
			margin-left: 0;
			margin-right: 0;
		}
		& > :not(:first-child) {
			margin-top: 4em;
		}
	}
`;

const WrapKnow = styled.div`
	margin-top: 50px;
	width: 100%;
	text-align: center;
`;

const AlreadyKnowLink = styled.a`
	font-size: 0.875em;
	text-decoration: underline;
	color: ${theme.colours.bgDarkPurple};
`;

const PopUpScreenBody = styled.div`
	font-size: 1em;
`;

const PopUpScreenTitle = styled.div`
	font-size: 2.25em;

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		font-size: 2em;
		line-height: 1.8em;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		font-size: 1.8em;
		line-height: 1.2em;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		font-size: 1.6em;
		line-height: 1.2em;
	}
`;

const PopUpScreenSubTitle = styled.div`
	padding: 0.8em 0 2em 0;
`;

export default withRouter(
	class FlyoutBoxes extends React.PureComponent {
		redirectToUnlock = (e) => {
			e.preventDefault();
			this.props.history.push("/unlock");
		};

		redirectToSearch = (e) => {
			e.preventDefault();
			this.props.history.push("/works");
		};

		redirectToReviewCopies = (e) => {
			e.preventDefault();
			this.props.history.push("/profile/my-copies/?q_mine_only=1&review=1&expiry_status=review_only&mine_only=1");
		};

		render() {
			const { myUserDetails, getHomeFlyoutScreenInfo, getSeenIndex, shouldShowRollOverBox, rolloverData, confirmRolloverInfo, doDisableFlyout } =
				this.props;
			if (!myUserDetails || !myUserDetails.flyout_enabled) {
				return "";
			}
			const isShowUnlockBox = getSeenIndex(FLYOUT_SCREEN_UNLOCK) === -1;
			const isShowSearchBox = getSeenIndex(FLYOUT_SCREEN_SEARCH) === -1;
			const isShowRolloverBox = shouldShowRollOverBox();
			const isShowFlyoutBoxes = isShowUnlockBox || isShowSearchBox || isShowRolloverBox;
			let flyoutBoxMaxWidth = "900px;";

			const searchBox = (
				<ContentBox
					primary_icon={require("./../../assets/images/SearchImage.png")}
					onPress={this.redirectToSearch}
					button_text="Search for a book"
					buttonHtmlAtts={searchHtmlAtts}
				>
					Some books have already been unlocked for your institution and some are still locked.
					<br />
					Let's see what books are available.
				</ContentBox>
			);

			let boxes = null;
			const heading = (
				<>
					<PopUpScreenTitle>Welcome to the Education Platform</PopUpScreenTitle>
					<PopUpScreenSubTitle>You can make copies from your institution's books.</PopUpScreenSubTitle>
				</>
			);
			let rollOverBox = null;
			if (isShowRolloverBox) {
				if (rolloverData.extract_expiry_count > 0) {
					rollOverBox = (
						<ContentBox
							primary_icon={require("./../../assets/images/RefreshIcon.png")}
							onPress={this.redirectToReviewCopies}
							button_text="Review last year's copies"
							buttonHtmlAtts={searchHtmlAtts}
						>
							Rollover was completed for your institution on {date.sqlToNiceFormat(rolloverData.target_execution_date)}
							<br />
							Your copies from last year have expired, and copy limits and student numbers have been reset. <br />
							You can always review and reinstate last year's copies via the menu by clicking on your name.
						</ContentBox>
					);
				} else {
					rollOverBox = (
						<ContentBox
							primary_icon={require("./../../assets/images/RefreshIcon.png")}
							onPress={confirmRolloverInfo}
							button_text="I understand"
							buttonHtmlAtts={searchHtmlAtts}
						>
							Rollover was completed for your institution on {date.sqlToNiceFormat(rolloverData.target_execution_date)}
							<br />
							Last year's copy limits and student numbers have been reset, and you can now review and edit your classes before creating your copies
							for the new year.
						</ContentBox>
					);
				}
			}

			if (isShowUnlockBox && isShowSearchBox && isShowRolloverBox) {
				flyoutBoxMaxWidth = "1300px;";
				boxes = (
					<>
						{heading}
						<ContentBoxWrap>
							{rollOverBox}
							<ContentBox
								primary_icon={require("./../../assets/images/UnlockImage.png")}
								onPress={this.redirectToUnlock}
								button_text="Unlock my first book"
								buttonHtmlAtts={unlockHtmlAtts}
							>
								To use a book on the Platform you have to unlock it.
								<br />
								Let's do that!
							</ContentBox>
							{searchBox}
						</ContentBoxWrap>
					</>
				);
			} else if (!isShowUnlockBox && isShowSearchBox && isShowRolloverBox) {
				boxes = (
					<>
						{heading}
						<ContentBoxWrap>
							{rollOverBox}
							{searchBox}
						</ContentBoxWrap>
					</>
				);
			} else if (isShowUnlockBox && !isShowSearchBox && isShowRolloverBox) {
				boxes = (
					<>
						{heading}
						<ContentBoxWrap>
							{rollOverBox}
							<ContentBox
								primary_icon={require("./../../assets/images/UnlockImage.png")}
								onPress={this.redirectToUnlock}
								button_text="Unlock my first book"
								buttonHtmlAtts={unlockHtmlAtts}
							>
								To use a book on the Platform you have to unlock it.
								<br />
								Let's do that!
							</ContentBox>
						</ContentBoxWrap>
					</>
				);
			} else if (isShowUnlockBox && isShowSearchBox && !isShowRolloverBox) {
				boxes = (
					<>
						{heading}
						<ContentBoxWrap>
							<ContentBox
								primary_icon={require("./../../assets/images/UnlockImage.png")}
								onPress={this.redirectToUnlock}
								button_text="Unlock my first book"
								buttonHtmlAtts={unlockHtmlAtts}
							>
								To use a book on the Platform you have to unlock it.
								<br />
								Let's do that!
							</ContentBox>
							{searchBox}
						</ContentBoxWrap>
					</>
				);
			} else if (isShowRolloverBox) {
				boxes = (
					<>
						{heading}
						{rollOverBox}
					</>
				);
			} else if (isShowUnlockBox) {
				boxes = (
					<>
						<br />
						<br />
						<ContentBox
							show_decorations={true}
							title="Welcome to the Education Platform"
							button_text="Unlock my first book"
							onPress={this.redirectToUnlock}
							buttonHtmlAtts={unlockHtmlAtts}
						>
							You can make copies from your institution's books.
							<br />
							<br />
							Let's get started!
						</ContentBox>
					</>
				);
			} else if (isShowSearchBox) {
				boxes = (
					<>
						{heading}
						{searchBox}
					</>
				);
			}
			return isShowFlyoutBoxes && boxes ? (
				<PopUpContainer>
					<WrapperPopUp>
						<WrapRow>
							<WrapContent>
								<PopUpScreen data-ga-overlay="welcome" maxWidth={flyoutBoxMaxWidth}>
									<PopUpScreenBody>{boxes}</PopUpScreenBody>
								</PopUpScreen>
							</WrapContent>
							<WrapContent>
								<WrapKnow>
									<AlreadyKnowLink href="#" onClick={doDisableFlyout}>
										I don't need the guided tour <br />
										(Please note that this will turn the entire guided tour off. You can switch the guided tour to the Platform back on at any time in
										My Details)
									</AlreadyKnowLink>
								</WrapKnow>
							</WrapContent>
						</WrapRow>
					</WrapperPopUp>
				</PopUpContainer>
			) : (
				""
			);
		}
	}
);
