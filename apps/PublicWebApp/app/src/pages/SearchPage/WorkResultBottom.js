import React from "react";
import styled from "styled-components";
import { Link, withRouter } from "react-router-dom";
import theme from "../../common/theme";
import ShowAllCopies from "./ShowAllCopies";
import PoupInfo from "../../widgets/PoupInfo";
import getUrl from "../../common/getUrl";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { ShareWorkResult } from "../../widgets/SendEmailLink";
import Flyout from "../../widgets/Flyout";
import flyOutGuide from "./flyOutGuide";
import { withFlyoutManager } from "../../common/FlyoutManager";
import withAuthConsumer from "../../common/withAuthConsumer";
import staticValues from "../../common/staticValues";
import { col12, col5, colLg3, colLg4 } from "../../common/style";
import { Row } from "../../widgets/Layout/Row";
import { ButtonLink } from "../../widgets/Layout/ButtonLink";
import getPageOffsetString from "../../common/getPageOffsetString";

const WrapWorkResultBottom = styled.div`
	display: flex;
	justify-content: flex-start;
	margin-top: 0.5em;
`;

const WorkResultLink = styled(Link)`
	display: block;
	margin-right: 1em;
	font-size: 0.875em;
	color: ${theme.colours.primaryLight};
	word-break: keep-all;
	white-space: nowrap;

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		margin-right: 0.5em;
	}
`;

const WorkResultShareLink = styled.a`
	display: block;
	margin: 0 1em;
	font-size: 0.875em;
	color: ${theme.colours.headerButtonSearch};
	pointer-events: cursor;
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		margin-right: 0.5em;
	}
`;

const WorkResultButton = styled.button`
	border: 0;
	outline: 0;
	display: block;
	background-color: transparent;
	margin-right: 1em;
	font-size: 0.875em;
	color: ${theme.colours.primaryLight};

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		margin-right: 0.5em;
	}

	@media screen and (max-width: ${theme.breakpoints.mobile2}) {
		margin-right: 0;
		font-size: 12px;
	}
`;

const StyledUnlock = styled(ButtonLink)`
	text-decoration: none;
	color: ${theme.colours.white};
	background-color: ${theme.colours.primary};
`;

const PopUpTitle = styled.div`
	font-size: 0.875em;
	color: black;
	margin-bottom: 0.4em;
`;

const WrapShareBody = styled.div`
	display: flex;
	justify-content: flex-start;
	align-items: center;
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		display: block;
	}
`;

const InputSection = styled.div`
	min-width: 65%;
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		min-width: 100%;
	}
`;

const Input = styled.input`
	width: 100%;
	background-color: ${theme.colours.bgLightGray};
	border: 1px solid #848484;
	color: ${theme.colours.darkGray};
	overflow: hidden;
	text-overflow: ellipsis;
	margin-right: 1em;
	padding: 0.5em;
`;

const LinkWrap = styled.div`
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		width: 50%;
		float: left;
		padding-top: 0.5em;
	}
`;
const FragmentWrap = styled.div`
	padding-top: 1rem;
	line-height: 1.2em;
	font-size: 0.875em;
	word-break: keep-all;
	white-space: pre-wrap;
`;
const IconWrap = styled.div`
	color: ${theme.colours.primaryLight};
	margin-right: 1em;
	padding: 7px 6px 7px 0px;
`;

const FragmentTitleWrap = styled.div`
	margin-right: 1em;
	margin-bottom: 6px;
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		margin-right: 0.5em;
		padding-right: 0;
		max-width: none;
	}
	${(p) => (p.isMobile ? col12 : col5)}
`;

const FragmentLinkWrap = styled.div`
	margin-right: 1em;
	margin-bottom: 6px;
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		margin-right: 0.5em;
		padding-right: 0;
		max-width: none;
	}
	${col12}
`;
const FragmentLink = styled(Link)`
	display: block;
	color: ${theme.colours.primaryLight};
	${col5}
`;

const UnlockIcon = styled.i`
	margin-right: 0.5rem;
`;

const ExtractWrap = styled.div`
	padding-top: 1rem;
	line-height: 1.2em;
	font-size: 0.875em;
`;

const CloudIcon = styled.i`
	color: ${theme.colours.primary};
	padding-right: 10px;
`;

const ExtractTitle = styled.div`
	padding-right: 10px;
	${colLg4}
`;

const PageRange = styled.div`
	${colLg3}
`;

const ShowExtractLink = styled.div`
	cursor: pointer;
	color: ${theme.colours.primary};
	margin-top: 1em;
`;

const Icon = styled.i`
	pointer-events: none;
`;

function urlEncodeAsset(isbn13, title) {
	title = title.replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase();
	return isbn13 + "-" + title;
}

function urlEncodeFragment(isbn13, start_page) {
	return "works/" + isbn13 + "/extract?startPage=" + start_page;
}

const FragmentDescription = ({ description }) => {
	if (!description) {
		return null;
	}
	return <div dangerouslySetInnerHTML={{ __html: description }} />;
};

export default withAuthConsumer(
	withFlyoutManager(
		withRouter(
			class WorkResultBottom extends React.PureComponent {
				state = {
					show: false,
					showPopUpInfo: false,
					showFullExtract: false,
				};

				unlockedButtonRef = React.createRef(null);

				urlEncodeAsset = (asset) => {
					asset = asset || this.props.asset;
					return urlEncodeAsset(asset.pdf_isbn13, asset.title);
				};

				urlEncodeFragment = (asset, start_page) => {
					asset = asset || this.props.asset;
					return urlEncodeFragment(asset.pdf_isbn13, start_page);
				};

				showModal = () => {
					this.setState({ show: true });
				};

				hideModal = () => {
					this.setState({ show: false });
				};

				showPopUpInfo = () => {
					this.setState({ showPopUpInfo: true });
				};

				hidePopUpInfo = () => {
					this.setState({ showPopUpInfo: false });
				};

				handleUnlockClick = () => {
					this.props.flyouts_setNext("search");
				};

				showFullExtracts = () => {
					this.setState({ showFullExtract: !this.state.showFullExtract });
				};

				render() {
					const props = this.props;
					const asset = props.asset;
					const assetRelativeUrl = `/works/${this.urlEncodeAsset(asset)}`;
					const extractRelativeUrl = `/works/${asset.pdf_isbn13}/extract?`;
					const assetAbsoluteUrl = getUrl(assetRelativeUrl);
					const myUserDetails = this.props.withAuthConsumer_myUserDetails;
					const canCopy = myUserDetails ? myUserDetails.can_copy : false;
					const showFlyout = props.isFirstLockedAsset && props.flyouts_getFirstUnseenIndex("search") === 2;
					const uploadedExtracts = this.state.showFullExtract
						? props.asset.uploadedExtracts
						: props.asset.uploadedExtracts && props.asset.uploadedExtracts.length && props.asset.uploadedExtracts.slice(0, 3);

					return (
						<>
							{asset.is_unlocked && props.isLoggedIn ? (
								<>
									<WrapWorkResultBottom>
										{props.asset.content_form === staticValues.assetContentForm.bo ? (
											<IconWrap style={{ padding: "0px" }}>
												<i className="fal fa-book" title="This title is a book"></i>
											</IconWrap>
										) : (
											<IconWrap style={{ padding: "0px" }}>
												<i className="fal fa-newspaper" title="This title is a magazine"></i>
											</IconWrap>
										)}

										{!props.isMobile && canCopy && (!props.asset.fragments || props.asset.fragments.length === 1) && props.asset.is_system_asset ? (
											<WorkResultLink to={extractRelativeUrl} data-ga-user-extract="search-make-copy-publisher-asset">
												<Icon className="fal fa-plus"></Icon> &nbsp; Make a new Copy
											</WorkResultLink>
										) : (
											""
										)}
										{asset.copies_count && asset.copies_count > 0 ? (
											<div>
												<WorkResultButton onClick={this.showModal}>
													<i className="fal fa-copy"></i> &nbsp; See Copies
												</WorkResultButton>

												{this.state.show ? <ShowAllCopies show={this.state.show} hideModal={this.hideModal} pdf_isbn13={asset.pdf_isbn13} /> : ""}
											</div>
										) : (
											""
										)}
										<div>
											<WorkResultButton onClick={this.showPopUpInfo}>
												<i className="fal fa-share"></i> &nbsp; Share this search result
											</WorkResultButton>
											{
												<PoupInfo show={this.state.showPopUpInfo} handleClose={this.hidePopUpInfo}>
													<div>
														<div>
															<PopUpTitle>
																<i className="fal fa-share"></i> &nbsp; Share this search result
															</PopUpTitle>
														</div>
														<WrapShareBody>
															<InputSection>
																<Input type="text" value={assetAbsoluteUrl} readOnly />
															</InputSection>
															<LinkWrap>
																<CopyToClipboard text={assetAbsoluteUrl}>
																	<WorkResultShareLink>
																		<i className="fal fa-clipboard"></i> Copy Link
																	</WorkResultShareLink>
																</CopyToClipboard>
															</LinkWrap>
															<LinkWrap>
																{/* <WorkResultShareLink href="#"> Email</WorkResultShareLink> */}
																<ShareWorkResult title={asset.title} shareLink={assetAbsoluteUrl} />
															</LinkWrap>
														</WrapShareBody>
													</div>
												</PoupInfo>
											}
										</div>
									</WrapWorkResultBottom>
									{props.asset.fragments && props.asset.fragments.length > 1 ? (
										<FragmentWrap>
											{props.asset.fragments.map((fragment, index) => (
												<Row key={index}>
													<FragmentTitleWrap isMobile={props.isMobile}>
														<FragmentLink to={this.urlEncodeFragment(asset, fragment.start_page)}>{fragment.title}</FragmentLink>
														<FragmentDescription description={fragment.description} />
													</FragmentTitleWrap>
													{!props.isMobile && (
														<FragmentLink to={this.urlEncodeFragment(asset, fragment.start_page)}>
															<i className="fal fa-plus"></i> &nbsp; Make a new Copy
														</FragmentLink>
													)}
												</Row>
											))}
										</FragmentWrap>
									) : (
										""
									)}
									{props.asset.uploadedExtracts && props.asset.uploadedExtracts.length ? (
										<ExtractWrap>
											{uploadedExtracts.map((extract, index) => (
												<Row key={index}>
													<ExtractTitle>
														<CloudIcon className="far fa-cloud-upload"></CloudIcon>
														{extract.title}
													</ExtractTitle>
													<PageRange>page range: {getPageOffsetString(extract.page_range)}</PageRange>
													<FragmentLink
														to={`/asset-upload/copy-confirm?isbn13=${props.asset.isbn13}&asset_user_upload_oid=${extract.oid}&course=${
															props.courseOid
														}&selected=${extract.page_range.join("-")}&upload_name=${encodeURIComponent(extract.title)}&back_url=${encodeURIComponent(
															window.location.pathname + window.location.search
														)}`}
														data-ga-user-extract="search-make-copy-user-asset"
													>
														<Icon className="fal fa-plus"></Icon> &nbsp; Make a new Copy
													</FragmentLink>
												</Row>
											))}
											{props.asset.uploadedExtracts && props.asset.uploadedExtracts.length > 3 ? (
												<ShowExtractLink onClick={this.showFullExtracts}>{this.state.showFullExtract ? "Less" : "More"}</ShowExtractLink>
											) : (
												""
											)}
										</ExtractWrap>
									) : (
										""
									)}
								</>
							) : (
								<>
									{props.asset.fragments && props.asset.fragments.length > 1 ? (
										<FragmentWrap>
											{props.asset.fragments.map((fragment, index) => (
												<Row key={index}>
													<FragmentLinkWrap>
														<FragmentLink to={assetRelativeUrl}>{fragment.title}</FragmentLink>
														<FragmentDescription description={fragment.description} />
													</FragmentLinkWrap>
												</Row>
											))}
										</FragmentWrap>
									) : (
										""
									)}
									<WrapWorkResultBottom>
										{props.asset.content_form === staticValues.assetContentForm.bo ? (
											<IconWrap>
												<i className="fal fa-book" title="This title is a book"></i>
											</IconWrap>
										) : (
											<IconWrap>
												<i className="fal fa-newspaper" title="This title is a magazine"></i>
											</IconWrap>
										)}
										{showFlyout ? (
											<>
												<StyledUnlock to="/unlock" onClick={this.handleUnlockClick} title="Unlock now" ref={this.unlockedButtonRef}>
													<UnlockIcon className="fal fa-unlock-alt"></UnlockIcon>
													Unlock now
												</StyledUnlock>
												<Flyout onClose={this.handleUnlockClick} target={this.unlockedButtonRef} width={theme.flyOutWidth} height={160}>
													{flyOutGuide.flyOut[1]}
												</Flyout>
											</>
										) : (
											<>
												<StyledUnlock to="/unlock" title="Unlock now">
													<UnlockIcon className="fal fa-unlock-alt"></UnlockIcon>
													Unlock now
												</StyledUnlock>
											</>
										)}
									</WrapWorkResultBottom>
								</>
							)}
						</>
					);
				}
			}
		)
	)
);
