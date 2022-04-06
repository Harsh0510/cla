import React from "react";
import withAuthConsumer from "../../common/withAuthConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import styled, { css } from "styled-components";
import Header from "../../widgets/Header";
import theme from "../../common/theme";
import MyCopiesSection from "./MyCopiesSection";
import Video from "./Video";
import { Link, withRouter } from "react-router-dom";
import withPageSize from "../../common/withPageSize";
import UserRole from "../../common/UserRole";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import FlyOutHandler from "../../common/FlyOutHandler";
import FlyoutBoxes from "./FlyoutBoxes";
import Flyout from "../../widgets/Flyout";
import flyOutGuide from "./flyoutGuide";
import BlogPost from "../../widgets/BlogPost";
import userDidChange from "../../common/userDidChange";
import CarouselSlider from "./CarouselSlider";
import { colXl5, colXl6, embedResponsiveItem } from "../../common/style";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { HomePageContainer } from "../../widgets/Layout/HomePageContainer";
import { ColMedium } from "../../widgets/Layout/ColMedium";
import staticValues from "../../common/staticValues";

const FLYOUT_DEFAULT_INDEX = -1; //Default Index -1
const FLYOUT_DEFAULT_NOTIFICATION = -1; // default notification index
const NOTIFICATION_COUNT_DEFAULT = 0; // default notification count
//const FLYOUT_INDEX_ROLLOVER = 6

const homeScreenBox = staticValues.homeScreenBox;
const FLYOUT_SCREEN_SEARCH = homeScreenBox.search;
const FLYOUT_SCREEN_UNLOCK = homeScreenBox.unlock;
const FLYOUT_SCREEN_REVIEW_COPIES = homeScreenBox.reviewCopies;
const FLYOUT_SCREEN_REVIEW_ROLLOVER = homeScreenBox.reviewRollover;
const EXTRACT_STATUS_CANCELLED = staticValues.extractStatus.cancelled;

const VideoSection = styled.div`
	margin: 1em 0 0;
	max-width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;

	@media screen and (min-width: ${theme.breakpoints.tablet}) {
		margin: 0;
	}
`;

const TextLink = styled.a`
	text-decoration: underline;
	color: ${theme.colours.primary};
	font-size: 1.2em;
`;

const SliderHeader = styled.h3`
	font-size: 18pt;
	font-weight: bold;
	margin-bottom: 4px;
	line-height: 1.2;
`;

const SliderNote = styled.p`
	font-size: 10pt;
`;

const Warning = styled.div`
	padding: 20px;
	border: 2px solid ${theme.colours.warning};
	margin-bottom: 2em;
	display: flex;
	justify-content: space-between;
	align-items: center;

	@media screen and (max-width: ${theme.breakpoints.tablet4}) {
		flex-direction: column;
	}
`;

const WarningImg = styled.div`
	img {
		width: 114px;
		max-width: none;
	}

	@media screen and (max-width: ${theme.breakpoints.tablet4}) {
		display: none;
	}
`;

const WarningLeftText = styled.div`
	color: ${theme.colours.warning};
	font-size: 3em;
	line-height: 1.2;
	text-align: right;
	text-transform: uppercase;
	font-weight: bold;
	margin-right: 0.5em;
	@media screen and (max-width: ${theme.breakpoints.laptop}) {
		font-size: 2.5em;
	}
	@media screen and (max-width: ${theme.breakpoints.tablet4}) {
		margin-right: 0;
		text-align: center;
	}
`;

const WarningRightText = styled.div`
	line-height: 1.2;
	@media screen and (max-width: ${theme.breakpoints.tablet4}) {
		text-align: center;
	}
`;

const WarningRightTextParaGraph = styled.p`
	margin-bottom: 0.75em;
	a {
		color: ${theme.colours.warning};
		text-decoration: underline;
	}
	a:hover {
		color: ${theme.colours.warning};
		text-decoration: none;
	}
	&:last-of-type {
		margin-bottom: 0;
	}
`;

const NoticeSection = styled.div`
	padding-top: 3rem;
	padding-bottom: 3rem;
`;

const BlogPostWrap = styled(ColMedium)`
	${colXl5}

	@media (min-width: 576px) {
		padding-top: 1.5rem;
	}
`;

const WrapRow = styled(Row)`
	justify-content: center;
`;

const WrapContent = styled(HomePageContainer)`
	text-align: center;
`;
const WrapVideoSection = styled(WrapContent)`
	${colXl6}
`;

const WrapVideo = styled(Video)`
	${embedResponsiveItem}
`;
const EductionCardWrap = styled.div`
	width: 90%;
	display: flex;

	@media screen and (max-width: ${theme.breakpoints.laptop}) {
		padding: 2rem;
		width: 100%;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		width: 100%;
		flex-direction: column;
	}
`;

const EductionCard = styled.div`
	width: 50%;
	margin-bottom: 20px;
	box-shadow: 3px 4px 7px rgba(0, 0, 0, 0.4);
	display: flex;
	margin-right: 10px;
	padding: 35px;
	font-size: 20px;
	font-weight: bold;
	color: ${theme.colours.blogAnchorLink};
	transition: all 0.5s ease;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		width: 100%;
	}
	&:hover {
		background-color: ${theme.colours.primary};
		color: ${theme.colours.white};
	}
`;

const AboutContent = styled(Link)`
	max-width: 62%;
	text-align: center;
	margin: auto;
	&:hover {
		color: ${theme.colours.white};
	}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		max-width: 100%;
	}
`;
export default withPageSize(
	withAuthConsumer(
		withApiConsumer(
			withRouter(
				class HomePage extends React.PureComponent {
					constructor(props) {
						super(props);
						this.state = {
							copies: [],
							flyOutIndex: null,
							notificationCount: 0,
							carouselSlideData: null,
							rolloverData: null,
							flyoutSeenData: {},
							isFlyoutDataLoaded: false,
						};
						this._flyOutHandlerNotification = new FlyOutHandler(this, this.props.api, "notification");
						this.notificationRef = React.createRef(null);
						this._flyOutHandlerOnCloseBound = this._flyOutHandlerNotification.onCloseNotification.bind(this._flyOutHandlerNotification);
						this._shouldShowRollOverBox = this.shouldShowRollOverBox.bind(this);
						this._confirmRolloverInfo = this.confirmRolloverInfo.bind(this);
					}

					componentDidMount() {
						this.updateState();
						this.getSlideData();
						// Get the Current Index of the User
						const userDetail = this.props.withAuthConsumer_myUserDetails;
						if (userDetail && userDetail.flyout_enabled) {
							this.getHomeFlyoutScreenInfo();
						}
					}

					componentDidUpdate(prevProps) {
						if (userDidChange(this.props, prevProps)) {
							this.updateState();
							const userDetail = this.props.withAuthConsumer_myUserDetails;
							if (userDetail && userDetail.flyout_enabled) {
								this.getHomeFlyoutScreenInfo();
							} else {
								this.setState({ flyoutSeenData: {} });
							}
						}
					}

					componentWillUnmount() {
						this._flyOutHandlerNotification.destroy();
						delete this._flyOutHandlerNotification;
					}

					setNotificationCount = (count) => {
						this.setState({
							notificationCount: count,
						});
					};

					shouldShowRollOverBox = () => {
						if (this.state.rolloverData && this.state.rolloverData.rollover_completed) {
							//return this.props.flyouts_getSeenIndex("home_review") === -1 || this.props.flyouts_getSeenIndex("home") === -1;
							if (this.getSeenIndex(FLYOUT_SCREEN_REVIEW_COPIES) === -1 && this.state.rolloverData.extract_expiry_count > 0) {
								return true;
							}
							if (this.getSeenIndex(FLYOUT_SCREEN_REVIEW_ROLLOVER) === -1 && !this.state.rolloverData.extract_expiry_count) {
								return true;
							}
						}
						return false;
					};

					// Click on the I already know Link
					doDisableFlyout = (e) => {
						e.preventDefault();
						// set flyout_enabled false
						this.props
							.api("/auth/update-my-details", { email: this.props.withAuthConsumer_myUserDetails.email, flyout_enabled: false })
							.then((result) => {
								if (result.result) {
									this.props.withAuthConsumer_attemptReauth();
								}
							});
					};

					updateState() {
						if (this.props.withAuthConsumer_myUserDetails && this.props.withAuthConsumer_myUserDetails.role !== UserRole.claAdmin) {
							this.props
								.api("/public/extract-search", {
									limit: 50,
									offset: 0,
									mine_only: true,
								})
								.then((result) => {
									const myActiveExtracts = result.extracts.filter((r) => r.status.toLowerCase() !== EXTRACT_STATUS_CANCELLED);
									this.setState({
										copies: myActiveExtracts,
										error: null,
									});
								})
								.catch((e) => {
									this.setState({
										copies: [],
										error: e,
									});
								});
						} else {
							this.setState({
								copies: [],
								error: null,
							});
						}
					}

					getSlideData = () => {
						this.props.api("/public/carousel-slide-get-all").then((result) => {
							this.setState({ carouselSlideData: result.result });
						});
					};

					getHomeFlyoutScreenInfo = () => {
						this.props.api("/public/get-home-flyout-info").then((result) => {
							if (result) {
								this.setState({
									rolloverData: result.rollover_data,
									flyoutSeenData: result.flyout_seen_data,
									isFlyoutDataLoaded: true,
								});
							}
						});
					};

					getSeenIndex = (screen) => {
						const myUserDetails = this.props.withAuthConsumer_myUserDetails;
						if (!this.state.isFlyoutDataLoaded) {
							return -2;
						}
						if (myUserDetails && myUserDetails.flyout_enabled && this.state.flyoutSeenData.hasOwnProperty(screen)) {
							return this.state.flyoutSeenData[screen];
						}
						return -1;
					};

					confirmRolloverInfo() {
						this.props
							.api("/public/first-time-user-experience-update", {
								screen: FLYOUT_SCREEN_REVIEW_ROLLOVER,
								index: 0,
							})
							.then((result) => {
								this.getHomeFlyoutScreenInfo();
							});
					}

					render() {
						const myUserDetails = this.props.withAuthConsumer_myUserDetails;
						const isShowUnlockBox = this.getSeenIndex(FLYOUT_SCREEN_UNLOCK) === -1;
						const isShowSearchBox = this.getSeenIndex(FLYOUT_SCREEN_SEARCH) === -1;
						const isShowRolloverBox = this._shouldShowRollOverBox();
						const showScreenOriginal = !(isShowUnlockBox || isShowSearchBox || isShowRolloverBox) || (myUserDetails && !myUserDetails.flyout_enabled);

						const videoElement = (
							<WrapVideo
								src={process.env.ASSET_ORIGIN + "/videos/cla-schools-licence-to-copy.mp4"}
								poster={require("./../../assets/images/about-platform.jpg")}
							/>
						);
						return (
							<>
								<HeadTitle title={PageTitle.home} />
								<Header
									flyOutIndexNotification={this.state.flyOutIndexNotification}
									setNotificationCount={this.setNotificationCount}
									onClose={this._flyOutHandlerOnCloseBound}
									notificationRef={this.notificationRef}
									hide_search={false}
								/>
								{(showScreenOriginal || !this.props.withAuthConsumer_myUserDetails) && (
									<>
										<Container>
											<SliderHeader>Digital resources to copy and share for learning and teaching.</SliderHeader>
											<SliderNote>
												Provided for use by institutions covered by the{" "}
												<TextLink href="https://cla.co.uk/licencetocopy" target="_blank">
													CLA Education Licence.
												</TextLink>
											</SliderNote>
										</Container>
										<CarouselSlider slideData={this.state.carouselSlideData} />
									</>
								)}
								{this.props.withAuthConsumer_myUserDetails &&
								this.props.withAuthConsumer_myUserDetails.role !== UserRole.claAdmin &&
								showScreenOriginal &&
								this.state.copies.length > 0 ? (
									<MyCopiesSection data={this.state.copies} error={this.state.error} />
								) : (
									""
								)}
								{!this.props.withAuthConsumer_myUserDetails ? (
									<Container>
										<WrapRow>
											<EductionCardWrap>
												<EductionCard>
													<AboutContent to="/about-for-fe">About the Education Platform for Further Education &gt;&gt;</AboutContent>
												</EductionCard>
												<EductionCard>
													<AboutContent to="/about-for-school">About the Education Platform for Schools &gt;&gt; </AboutContent>
												</EductionCard>
											</EductionCardWrap>
										</WrapRow>
									</Container>
								) : null}
								{!this.props.withAuthConsumer_myUserDetails || showScreenOriginal ? (
									<Container>
										<NoticeSection>
											{/* <Warning>
												<WarningImg>
													<img src={require("../../assets/images/warning.svg")} />
												</WarningImg>
												<WarningLeftText>
													important
													<br />
													notice
												</WarningLeftText>
												<WarningRightText>
													<WarningRightTextParaGraph>
														To support remote working during the covid 19 crisis, we have made temporary changes to our{" "}
														<a href="https://www.cla.co.uk/cla-schools-licence" target="_blank">
															Education Licence
														</a>{" "}
														to enable teachers to copy up to 20% of a book until the 31st of March.
													</WarningRightTextParaGraph>
													<WarningRightTextParaGraph>
														<em>
															"This puts even more resources at teachers' fingertips to help them deliver the education all pupils deserve while they
															are at home."
														</em>
														<br />
														<strong>- Schools Standards Minister Nick Gibb</strong>
													</WarningRightTextParaGraph>
													<WarningRightTextParaGraph>
														Read full details at:{" "}
														<a href="https://cla.co.uk/uk-schools-covid19" target="_blank">
															https://cla.co.uk/uk-schools-covid19
														</a>
													</WarningRightTextParaGraph>
												</WarningRightText>
											</Warning> */}
											<WrapRow>
												<WrapVideoSection>
													{/* <img src={require('./../../assets/images/about-platform.jpg')} alt="about the plateform" width="551" height="368" /> */}
													<VideoSection className="embed-responsive embed-responsive-16by9">{videoElement}</VideoSection>
												</WrapVideoSection>
												<BlogPostWrap>
													<BlogPost></BlogPost>
												</BlogPostWrap>
											</WrapRow>
										</NoticeSection>
									</Container>
								) : (
									""
								)}
								{this.props.withAuthConsumer_myUserDetails && this.props.withAuthConsumer_myUserDetails.flyout_enabled && !showScreenOriginal && (
									<FlyoutBoxes
										myUserDetails={this.props.withAuthConsumer_myUserDetails}
										flyoutSeenData={this.state.flyoutSeenData}
										getHomeFlyoutScreenInfo={this.getHomeFlyoutScreenInfo}
										getSeenIndex={this.getSeenIndex}
										shouldShowRollOverBox={this._shouldShowRollOverBox}
										rolloverData={this.state.rolloverData}
										confirmRolloverInfo={this._confirmRolloverInfo}
										doDisableFlyout={this.doDisableFlyout}
									/>
								)}
								{this.state.flyOutIndexNotification === FLYOUT_DEFAULT_NOTIFICATION && this.state.notificationCount > NOTIFICATION_COUNT_DEFAULT ? (
									<Flyout width={350} height={110} onClose={this._flyOutHandlerOnCloseBound} target={this.notificationRef} side_preference={"bottom"}>
										{flyOutGuide.flyOutNotification}
									</Flyout>
								) : null}
							</>
						);
					}
				}
			)
		)
	)
);
