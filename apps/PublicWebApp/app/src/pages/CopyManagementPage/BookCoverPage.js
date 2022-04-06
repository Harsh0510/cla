import React from "react";
import styled, { css } from "styled-components";
import { Link } from "react-router-dom";
import getThumbnailUrl from "../../common/getThumbnailUrl.js";
import theme from "../../common/theme.js";
import WorkResultDescription from "./WorkResultDescription";
import FavoriteIcon from "../../widgets/FavoriteIcon";
import SocialMedia from "../../widgets/SocialMedia";
import getUrl from "../../common/getUrl";
import staticValues from "../../common/staticValues";
import { colMd2, colMd3, colMd7 } from "../../common/style.js";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import ScreenView from "./ScreenView";
import setDefaultCoverImage from "../../common/setDefaultCoverImage.js";

const FILE_FORMAT_EPUB = staticValues.assetFileFormat.epub;
const CONTENT_FORM_MI = staticValues.assetContentForm.mi;

const BookInfo = styled.section`
	margin-top: 80px;
	padding: 20px 0 12px;
	position: relative;
	background-color: ${theme.colours.lime};

	img {
		margin-top: -75px;
	}

	@media screen and (max-width: ${theme.breakpoints.desktop2}) {
		margin-top: 90px;
		.book button {
			padding: 0.45rem 20px;
		}
	}
	@media only screen and (max-width: ${theme.breakpoints.tabletPro}) {
		img {
			left: 75px;
		}
	}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		margin-top: 80px;
		.book button {
			padding: 0.45rem 19px;
		}
		img {
			left: 60px;
		}
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		margin-top: ${(p) => (p.action ? "30px" : "60px")};
		.book {
			display: -webkit-box;
			display: -ms-flexbox;
			display: flex;
			-webkit-box-align: end;
			-ms-flex-align: end;
			align-items: flex-end;
		}
		img {
			position: static;
		}
	}
`;

const BookImageContainer = styled.div`
	${colMd2}

	width: 113px;
	margin-bottom: 1rem;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		width: 100%;
	}
`;

const BookImage = styled.img`
	box-shadow: 0px 4px 7px 0px rgba(0, 0, 0, 0.5);

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		top: 0;
		right: 0;
	}
`;

const Arrow = styled.button`
	color: ${theme.colours.blueMagenta};
	background: transparent !important;
	border: 0;
	padding: 0.45rem 45px;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		padding: 15px;
	}
`;

const Book = styled.div`
	position: relative;
	padding-bottom: 1rem;
	text-align: right;
	@media (min-width: ${theme.breakpoints.mobileSmall}) {
		padding-bottom: 0;
	}
`;

const DescriptionAndIconWrap = styled.div`
	${colMd7}
	display: flex;
`;

const FavoriteIconWrap = styled.div`
	flex-shrink: 0;
	margin-right: 15px;
	margin-top: 5px;
`;

const DescriptionWrap = styled.div`
	flex: 1;
`;

const WrapRow = styled(Row)`
	justify-content: space-between;
`;

const WrapSocialMedia = styled.div`
	${colMd3}
	text-align: right;
	padding-top: 0.5rem;
`;

const CloneCopyView = styled(Link)`
	text-decoration: underline;

	${(p) =>
		p.isExpiredCopy &&
		css`
			opacity: 0.3;
			pointer-events: none;
			cursor: default;
		`}
`;

const CloneIcon = styled.i`
	margin-right: 5px;
`;

export default class BookCoverPage extends React.PureComponent {
	render() {
		const { isShowBookInfo, resultData, urlEncodeAsset, action, showViewModal } = this.props;
		const isbn = resultData && resultData.work_isbn13 ? resultData.work_isbn13 : "";
		const workTitle = resultData && resultData.work_title ? resultData.work_title : "";
		const pageUrl = getUrl(`/works/` + urlEncodeAsset + `?c=1`);
		const fbText = "Education Platform - I created a copy of " + workTitle;
		const twitterText = "I just shared a copy of " + workTitle + " on the #educationplatform";
		return (
			<>
				<BookInfo id={this.props.jumpToContentId} action={action}>
					<Container>
						<WrapRow>
							<BookImageContainer>
								<Book className="book">
									<BookImage
										src={getThumbnailUrl(isbn)}
										alt={workTitle}
										width="113"
										height="143"
										isShowBookInfo={isShowBookInfo}
										onError={setDefaultCoverImage}
									/>
								</Book>
							</BookImageContainer>
							<DescriptionAndIconWrap>
								<FavoriteIconWrap>
									<FavoriteIcon onClick={this.props.onToggleFavorite} is_favorite={resultData.is_favorite} />
								</FavoriteIconWrap>
								<DescriptionWrap>
									<WorkResultDescription
										asset={resultData}
										isShowBookInfo={isShowBookInfo}
										toggleWidth={this.props.toggleWidth}
										isTitleFull={this.props.isTitleFull}
										isAuthorFull={this.props.isAuthorFull}
										isPublisherFull={this.props.isPublisherFull}
										isEditorFull={this.props.isEditorFull}
										isTranslatorFull={this.props.isTranslatorFull}
										onNoteSelect={this.props.onNoteSelect}
										selectedNote={this.props.selectedNote}
										isNoteDisplay={this.props.isNoteDisplay}
										selectedHighlight={this.props.selectedHighlight}
										onHighlightSelect={this.props.onHighlightSelect}
										urlEncodeAsset={urlEncodeAsset}
									/>
									{resultData.file_format === FILE_FORMAT_EPUB ? (
										<div>
											<i className={staticValues.icons.assetFileFormatEpub} title={staticValues.hoverTitle.assetFileFormatEpub}></i>
										</div>
									) : resultData.work_content_form === CONTENT_FORM_MI ? (
										<div>
											<i className={staticValues.icons.assetContentFormMagazine} title={staticValues.hoverTitle.assetContentFormMagazine}></i>
										</div>
									) : (
										<div>
											<i className={staticValues.icons.assetContentFormBook} title={staticValues.hoverTitle.assetContentFormBook}></i>
										</div>
									)}
								</DescriptionWrap>
							</DescriptionAndIconWrap>

							<WrapSocialMedia>
								<SocialMedia
									url={pageUrl}
									fbText={fbText}
									twitterText={twitterText}
									selectedHighlight={this.props.selectedHighlight}
									resultData={resultData}
								/>
								<ScreenView showViewModal={showViewModal} isExpiredCopy={resultData.expired} />
								{(resultData.status === staticValues.extractStatus.editable || resultData.status === staticValues.extractStatus.active) && (
									<CloneCopyView
										isExpiredCopy={resultData.expired}
										to={`/works/${resultData.work_isbn13}/extract?clone_from_copy_oid=${resultData.oid}&course=${resultData.course_oid}&selected=${
											resultData.pages && resultData.pages.join("-")
										}`}
									>
										<CloneIcon className="fal fa-clone"></CloneIcon>Clone this copy
									</CloneCopyView>
								)}
							</WrapSocialMedia>
						</WrapRow>
					</Container>
				</BookInfo>
			</>
		);
	}
}
