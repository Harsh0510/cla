import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import withPageSize from "../../common/withPageSize";
import getThumbnailUrl from "../../common/getThumbnailUrl";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faStar, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import WorkResultDescription from "./WorkResultDescription";
import { withResizeDetector } from "react-resize-detector/build/withPolyfill";
library.add(faStar, faShoppingCart);
import SocialMedia from "../../widgets/SocialMedia";
import getUrl from "../../common/getUrl";
import staticValues from "../../common/staticValues";
import { col, col12, colAuto, colMd6, colMd9, colSm12, colXs12, noGuttersMargin, noGuttersPadding } from "../../common/style";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { ColMedium } from "../../widgets/Layout/ColMedium";
import setDefaultCoverImage from "../../common/setDefaultCoverImage";

const FILE_FORMAT_EPUB = staticValues.assetFileFormat.epub;
const CONTENT_FORM_MI = staticValues.assetContentForm.mi;

const StudentBook = styled.div`
	background: linear-gradient(
		to right,
		${theme.colours.lime} 0%,
		${theme.colours.lime} 50%,
		${theme.colours.limeLight} 50%,
		${theme.colours.limeLight} 100%
	);

	.book img {
		position: absolute;
		top: -40px;
		left: 20px;
		right: 0;
		box-shadow: 0px 4px 7px 0px rgba(0, 0, 0, 0.5);
		@media screen and (max-width: ${theme.breakpoints.tabletPro}) {
			max-width: 85px;
			bottom: 60px;
		}
		@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
			left: 10px;
			bottom: 30px;
		}
		@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
			left: 0;
			bottom: 20px;
			position: relative;
			max-width: 75px;
		}
	}

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		background: ${theme.colours.limeLight};
	}
`;

const CustomBookWidth = styled.div`
	${colAuto}

	width: 99px;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		width: 96px;
	}
`;

const ShareContentSection = styled.div`
	${col12}
	${colSm12}
	${colMd6}

	text-align: right;
	flex-wrap: wrap;
	justify-content: space-between;
	padding-left: 60px !important;
	overflow: hidden;
	display: flex;
	align-items: center;
	left: -1px; /* needed to remove a weird 1px gap to the left of this section */

	:before {
		content: "";
		z-index: 9;
		display: inline-block;
		position: absolute;
		left: -48px;
		z-index: 9;
		width: 80px;
		height: 100%;
		top: 0;
		background: ${theme.colours.lime};
		-webkit-transform: skew(-10deg);
		-ms-transform: skew(-10deg);
		-webkit-transform: skew(-10deg);
		-ms-transform: skew(-10deg);
		transform: skew(-10deg);

		@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
			display: none;
		}
	}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		padding-left: 20px !important;
		padding-top: 20px;
		padding-bottom: 20px;
	}
`;

const WrapRow = styled(Row)`
	align-items: center;
	padding: 1em 0;
	width: 100%;
`;

const BookImageRaw = styled(Row)`
	justify-content: space-between;
	padding: 1em 0;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		padding: 10px 0 20px;
		background-color: ${theme.colours.lime};
	}
`;

const MobBook = styled.div`
	width: 79px;
	height: 104px;
	img {
		box-shadow: 0 4px 7px;
		max-width: 90%;
		position: relative;
		bottom: 10px;
	}
`;

const MobRow = styled(Row)`
	${noGuttersMargin}
	flex-wrap: nowrap;
`;

const HeaderSectionRaw = styled(Row)`
	${noGuttersMargin}

	min-height: 140px;
	margin-top: 3rem;
`;

const BackGroundLime = styled.div`
	background-color: ${theme.colours.lime};
`;

const MobSection = styled.div`
	padding-top: 0.5rem;
`;

const IconWrapper = styled.div`
	margin-top: 5px;
`;

const WrapWorkResultDescription = styled.div`
	${col}
	${colMd9}
	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) and (max-width: ${theme.breakpoints.tablet3}) {
		max-width: 74%;
	}
`;

const WrapResult = styled.div`
	${colXs12}
`;

const WrapContent = styled.div`
	${col12}
	${colSm12}
	${colMd6}
	${noGuttersMargin}
	${noGuttersPadding}
`;

export default withPageSize(
	withResizeDetector(function TitleSection(props) {
		const asset = props.resultData;
		const customWidth = props.width ? Math.floor(props.width) : window.innerWidth;
		const isMobile = customWidth <= theme.breakpoints.mobileSmall.substring(0, theme.breakpoints.mobileSmall.length - 2) ? true : false;
		const workTitle = asset && asset.work_title ? asset.work_title : "";

		const urlEncodeAsset = asset ? asset.work_isbn13 + "-" + asset.work_title.replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase() : "";
		const pageUrl = getUrl(`/works/` + urlEncodeAsset + `?c=1`);
		const fbText = "Education Platform - I created a copy of " + workTitle;
		const twitterText = "I just shared a copy of " + workTitle + " on the #educationplatform";

		return (
			<>
				{isMobile ? (
					<BackGroundLime id={props.jumpToContentId}>
						<Container isTextDisplay={props.isTextDisplay}>
							<MobRow>
								<div>
									<MobBook className="book">
										<img
											src={getThumbnailUrl(props.isbn13)}
											alt={asset.title}
											title={asset.title}
											width="113"
											height="143"
											onError={setDefaultCoverImage}
										/>
									</MobBook>
								</div>
								<MobSection></MobSection>
							</MobRow>
							<MobRow>
								<WrapResult>
									<WorkResultDescription
										asset={props.resultData}
										isShowBookInfo={true}
										toggleWidth={props.toggleWidth}
										isTitleFull={props.isTitleFull}
										isAuthorFull={props.isAuthorFull}
										isPublisherFull={props.isPublisherFull}
										isEditorFull={props.isEditorFull}
										isTranslatorFull={props.isTranslatorFull}
									/>
								</WrapResult>
							</MobRow>
						</Container>
						<Container>
							<SocialMedia resultData={props.resultData} url={pageUrl} fbText={fbText} twitterText={twitterText} />
						</Container>
					</BackGroundLime>
				) : (
					<StudentBook id={props.jumpToContentId}>
						<Container>
							<HeaderSectionRaw>
								<WrapContent>
									<BookImageRaw>
										<CustomBookWidth>
											<div className="book">
												<img
													src={getThumbnailUrl(props.isbn13)}
													alt={asset.title}
													title={asset.title}
													width="113"
													height="143"
													onError={setDefaultCoverImage}
												/>
											</div>
										</CustomBookWidth>
										<WrapWorkResultDescription>
											<WorkResultDescription
												asset={props.resultData}
												isShowBookInfo={true}
												toggleWidth={props.toggleWidth}
												isTitleFull={props.isTitleFull}
												isAuthorFull={props.isAuthorFull}
												isPublisherFull={props.isPublisherFull}
												isEditorFull={props.isEditorFull}
												isTranslatorFull={props.isTranslatorFull}
											/>
											{props.resultData.file_format === FILE_FORMAT_EPUB ? (
												<IconWrapper>
													<i className={staticValues.icons.assetFileFormatEpub} title={staticValues.hoverTitle.assetFileFormatEpub}></i>
												</IconWrapper>
											) : props.resultData.work_content_form === CONTENT_FORM_MI ? (
												<IconWrapper>
													<i className={staticValues.icons.assetContentFormMagazine} title={staticValues.hoverTitle.assetContentFormMagazine}></i>
												</IconWrapper>
											) : (
												<IconWrapper>
													<i className={staticValues.icons.assetContentFormBook} title={staticValues.hoverTitle.assetContentFormBook}></i>
												</IconWrapper>
											)}
										</WrapWorkResultDescription>
									</BookImageRaw>
								</WrapContent>
								<ShareContentSection>
									<WrapRow>
										<ColMedium>
											<SocialMedia resultData={props.resultData} url={pageUrl} fbText={fbText} twitterText={twitterText} />
										</ColMedium>
									</WrapRow>
								</ShareContentSection>
							</HeaderSectionRaw>
						</Container>
					</StudentBook>
				)}
			</>
		);
	})
);
