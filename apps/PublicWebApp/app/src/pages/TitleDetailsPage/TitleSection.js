import React from "react";
import styled, { css } from "styled-components";
import googleEvent from "../../common/googleEvent";
import theme from "../../common/theme";
import withPageSize from "../../common/withPageSize";
import getThumbnailUrl from "../../common/getThumbnailUrl";
import FavoriteIcon from "../../widgets/FavoriteIcon";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import WorkResultDescription from "./WorkResultDescription";
import CreateCopyForm from "./CreateCopyForm.js";
import staticValues from "../../common/staticValues";
import { btn, colLg5, colLg7, colMd6, h1 } from "../../common/style";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { Button } from "../../widgets/Layout/Button";
import { ColSmall } from "../../widgets/Layout/ColSmall";
import { Link } from "react-router-dom";
import setDefaultCoverImage from "../../common/setDefaultCoverImage";

library.add(faStar, faShoppingCart);

const StudentBook = styled.div`
	background-color: ${theme.colours.lime};
	background: linear-gradient(
		to right,
		${theme.colours.lime} 0%,
		${theme.colours.lime} 50%,
		${theme.colours.limeLight} 50%,
		${theme.colours.limeLight} 100%
	);
	${(p) =>
		p.isMarginBottom == true &&
		css`
			margin-bottom: 35px;
		`}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		background: ${theme.colours.limeLight};
	}

	@media screen and (width: ${theme.breakpoints.mobileLarge}) {
		background: ${theme.colours.limeLight};
		background: linear-gradient(
			to right,
			${theme.colours.lime} 0%,
			${theme.colours.lime} 50%,
			${theme.colours.limeLight} 50%,
			${theme.colours.limeLight} 100%
		);
	}
`;

const AssetTitleImage = styled.img`
	position: relative;
	display: block;
	top: -35px;
	box-shadow: 0px 4px 7px 0px rgba(0, 0, 0, 0.5);
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		top: 0;
	}
`;

const CustomBookWidth = styled.div`
	height: 100px;
	${(p) =>
		p.isMarginBottom == true &&
		css`
			margin-bottom: 10px;
		`}
	@media screen and (min-width: ${theme.breakpoints.mobile}) {
		width: 99px;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		width: 50px;
	}
`;

const DescriptionWrap = styled.div`
	flex: 1;
	z-index: 10;
`;

const FavoriteIconWrap = styled.div`
	z-index: 0;
	min-width: 40px;
	padding-left: 5px;
	display: flex;
	justify-content: center;
	flex-shrink: 0;
	margin-top: 0.25em;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		min-width: 30px;
		padding-left: 2px;
	}
`;

const LockBook = styled.div`
	padding-left: 50px;
	padding-right: 20px;
	width: calc(100% - 240px);
	position: relative;

	@media screen and (min-width: ${theme.breakpoints.desktop2}) {
		display: flex;
	}
	@media (max-width: ${theme.breakpoints.desktop1}) {
		width: auto;
	}
	@media (max-width: ${theme.breakpoints.mobileLarge}) {
		max-width: 310px;
	}
	@media (max-width: ${theme.breakpoints.mobileSmall}) {
		max-width: 100%;
	}

	.lock_unlock_book {
		position: absolute;
		top: 0;
		left: 0;
	}
`;

const UnlockButtonWrap = styled.div`
	position: relative;
	overflow: visible;
	box-sizing: content-box;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		margin-top: 20px;
	}

	button.btn:hover {
		background-color: transparent;
		color: ${theme.colours.white};
		border-color: transparent;
	}

	:before {
		content: "";
		background: #226373;
		width: 90%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
	}

	:after {
		content: "";
		width: 0;
		height: 0;
		position: absolute;
		border-top: 25px solid transparent;
		border-left: 23px solid #226473;
		border-bottom: 23px solid transparent;
		overflow: visible;
		left: 90%;
	}

	button {
		position: relative;
		background: transparent;
		z-index: 1;
		padding: 13px 30px 14px 15px;
		cursor: pointer;
	}

	i {
		margin-right: 10px;
	}
`;

const BuyBookWrap = styled.div`
	margin-top: 0.5rem;
	a.btn:hover {
		color: ${theme.colours.white};
		background-color: ${theme.colours.primaryLight};
	}
`;

const BuyBook = styled.a`
	${btn}
	text-decoration: none;
	color: ${theme.colours.white};
	padding: 5px;
	background-color: ${theme.colours.primaryLight};
	:hover {
		color: ${theme.colours.white};
		background-color: ${theme.colours.primaryLight};
	}

	${(p) =>
		p.disabled == true &&
		css`
			pointer-events: none;
			opacity: 0.3;
		`}
`;

const TitleDeets = styled(ColSmall)`
	${colLg7}
	${colMd6}
	@media screen and (min-width: ${theme.breakpoints.tabletPro}) {
		flex-basis: 55.3333%;
		max-width: 55.3333%;
	}
`;

const LockUnlockSection = styled(ColSmall)`
	${colLg5}
	${colMd6}
	-ms-flex-pack: justify;
	justify-content: space-between;
	flex-wrap: wrap;
	padding-left: 60px;
	display: flex;
	align-items: center;
	left: -1px; /* needed to remove a weird 1px gap to the left of this section */
	@media screen and (min-width: ${theme.breakpoints.tabletPro}) {
		flex-basis: 44.666667%;
		max-width: 44.666667%;
	}

	:before {
		content: "";
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
		@media screen and (width: ${theme.breakpoints.mobileLarge}) {
			display: inline-block;
		}
	}

	@media screen and (max-width: ${theme.breakpoints.desktop1}) {
		justify-content: flex-start;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		padding: 1em;
		justify-content: center;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		justify-content: flex-start;
	}

	@media screen and (width: ${theme.breakpoints.mobileLarge}) {
		padding-left: 70px;
		justify-content: flex-start;
	}
`;

const LockUnlockSectionRaw = styled.div`
	align-items: center;
	padding: 1em 0;
	width: 100%;
`;

const BookImageRaw = styled.div`
	padding: 1em 0;
	display: flex;
	justify-content: space-between;
	background-color: ${theme.colours.lime};
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		:before {
			content: "";
			position: absolute;
			height: 100%;
			width: calc(100% + 30px);
			left: -15px;
			top: 0;
			background-color: ${theme.colours.lime};
		}
	}
	@media screen and (width: ${theme.breakpoints.mobileLarge}) {
		background-color: transparent;
		position: relative;
		:before {
			display: none;
		}
	}
`;

const MobBuyBook = styled(BuyBook)`
	width: auto;
`;

const AssetLinkIcon = styled(FontAwesomeIcon)`
	margin-right: 0.5rem;
`;

const UnlockButton = styled(Button)`
	border: none;
	:hover {
		color: ${theme.colours.white};
		background-color: transparent;
		border-color: transparent;
	}
	background-color: ${theme.colours.primary};
	color: ${theme.colours.white};
`;

const AssetContentLockMessageForSpan = styled.span`
	font-size: 14px;
	line-height: 1.3;
`;

const UnlockMessageLink = styled(Link)`
	display: block;
	margin-top: 0.4em;
`;

const CameraIcon = styled.i`
	font-size: 14px;
	margin-left: 0.5rem;
`;

const LockBookIcon = styled.i`
	${h1}
	font-weight: normal;
	margin-right: 1rem;
`;

const WrapRow = styled(Row)``;

export default withPageSize(
	class TitleSection extends React.PureComponent {
		onBuyBookClick = (e) => {
			// do not prevent default
			const asset = this.props.resultData;
			const isbn13 = this.props.isbn13;
			googleEvent("buyBook", "buy this book", asset.is_unlocked ? "unlocked" : "locked", isbn13);
		};
		render() {
			const props = this.props;
			const asset = props.resultData;
			const isMobile = props.breakpoint <= withPageSize.TINY_MOBILE;
			const jumpToContentId = props.jumpToContentId;
			const contentForm = asset.content_form;
			const buyBookClass = !asset.is_unlocked
				? asset.buy_book_link
					? "ga-buy-book-locked btn"
					: ""
				: asset.buy_book_link
				? "ga-buy-book-unlocked btn"
				: "btn";
			const subscribeMagazineClass = !asset.is_unlocked
				? asset.buy_book_link
					? "ga-subscribe-magazine-locked btn"
					: "btn"
				: asset.buy_book_link
				? "ga-subscribe-magazine-unlocked btn"
				: "btn";
			const workResultDescription = (
				<WorkResultDescription
					asset={asset}
					isbn13={props.isbn13}
					isMobile={isMobile}
					toggleWidth={props.toggleWidth}
					isAuthorFull={props.isAuthorFull}
					isEditorFull={props.isEditorFull}
					isTranslatorFull={props.isTranslatorFull}
					isPublisherFull={props.isPublisherFull}
					isTitleFull={props.isTitleFull}
				/>
			);

			const assetContentLockMessage =
				contentForm == staticValues.assetContentForm.mi ? (
					<AssetContentLockMessageForSpan>
						This issue is currently locked.
						<br /> If your institution has a copy, you can unlock it.
					</AssetContentLockMessageForSpan>
				) : (
					<AssetContentLockMessageForSpan>
						This book is currently locked.
						<br /> If your institution has a copy, you can unlock it.
						{props.resultData.temp_unlock_opt_in && (
							<>
								<br />
								<UnlockMessageLink to={"/unlock?isbn=" + props.isbn13} onClick={props.unlockWithoutPhysicalCopy}>
									What if you don't have the book with you?
								</UnlockMessageLink>
							</>
						)}
					</AssetContentLockMessageForSpan>
				);

			const assetContentLink = (
				<>
					{isMobile && contentForm == staticValues.assetContentForm.mi && (
						<MobBuyBook
							href={asset.buy_book_link}
							rel="nofollow"
							target="_blank"
							className={subscribeMagazineClass}
							title="Subscribe to this magazine"
							disabled={!asset.buy_book_link}
							onClick={this.onBuyBookClick}
						>
							<AssetLinkIcon icon={faShoppingCart} />
							Subscribe to this magazine
						</MobBuyBook>
					)}
					{isMobile && contentForm == staticValues.assetContentForm.bo && (
						<MobBuyBook
							href={asset.buy_book_link}
							rel="nofollow"
							target="_blank"
							className={buyBookClass}
							title="Buy this book"
							disabled={!asset.buy_book_link}
							onClick={this.onBuyBookClick}
						>
							<AssetLinkIcon icon={faShoppingCart} />
							Buy this book
						</MobBuyBook>
					)}
					{!isMobile && contentForm == staticValues.assetContentForm.mi && (
						<BuyBook
							href={asset.buy_book_link}
							target="_blank"
							rel="nofollow"
							className={subscribeMagazineClass}
							title="Subscribe to this magazine"
							disabled={!asset.buy_book_link}
							onClick={this.onBuyBookClick}
						>
							<AssetLinkIcon icon={faShoppingCart} />
							Subscribe to this magazine
						</BuyBook>
					)}
					{!isMobile && contentForm == staticValues.assetContentForm.bo && (
						<BuyBook
							href={asset.buy_book_link}
							target="_blank"
							rel="nofollow"
							className={buyBookClass}
							title="Buy this book"
							disabled={!asset.buy_book_link}
							onClick={this.onBuyBookClick}
						>
							<AssetLinkIcon icon={faShoppingCart} />
							Buy this book
						</BuyBook>
					)}
				</>
			);

			const createCopyForm = asset.is_unlocked ? (
				<CreateCopyForm
					coursesData={props.coursesData}
					onCreateCopySubmit={props.onCreateCopySubmit}
					step={props.step}
					width={props.width}
					isMobile={isMobile}
					{...props}
				/>
			) : (
				""
			);
			return (
				<>
					<StudentBook id={jumpToContentId} is_unlocked={!asset.is_unlocked} isMarginBottom={!props.isAvailableAccordianSection}>
						<Container>
							<WrapRow>
								<TitleDeets>
									<BookImageRaw>
										<CustomBookWidth isMarginBottom={contentForm == staticValues.assetContentForm.mi}>
											<AssetTitleImage
												src={getThumbnailUrl(props.isbn13)}
												alt={asset.title}
												title={asset.title}
												width="113"
												height="143"
												onError={setDefaultCoverImage}
											/>
										</CustomBookWidth>
										<FavoriteIconWrap>
											{!!props.userData && <FavoriteIcon onClick={props.onToggleFavorite} is_favorite={props.is_favorite} />}
										</FavoriteIconWrap>
										<DescriptionWrap>
											{workResultDescription}
											<BuyBookWrap>{assetContentLink}</BuyBookWrap>
										</DescriptionWrap>
									</BookImageRaw>
								</TitleDeets>
								<LockUnlockSection>
									{!asset.is_unlocked ? (
										<>
											<LockBook>
												<LockBookIcon className="far fa-lock-alt lock_unlock_book"></LockBookIcon>
												{assetContentLockMessage}
											</LockBook>
											<UnlockButtonWrap>
												<UnlockButton onClick={props.goToUnlockPage}>
													<CameraIcon className="fal fa-camera-alt"></CameraIcon>Scan Barcode to Unlock
												</UnlockButton>
											</UnlockButtonWrap>
										</>
									) : (
										<>
											<LockUnlockSectionRaw>{createCopyForm}</LockUnlockSectionRaw>
										</>
									)}
								</LockUnlockSection>
							</WrapRow>
						</Container>
					</StudentBook>
				</>
			);
		}
	}
);
