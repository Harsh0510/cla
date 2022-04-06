import React from "react";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";
import theme from "../../common/theme.js";
import SliderPage from "./SliderPage";
import SharedLinksTable from "./SharedLinksTable";
import CopyDetails from "./CopyDetails";
import getUrl from "../../common/getUrl";
import ShowCreatedShareLinkPopUp from "./ShowCreatedShareLinkPopUp";
import ConfirmModal from "../../widgets/ConfirmModal";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import CopyContentActions from "./CopyContentActions";
import PdfReader from "../../widgets/PdfReader";

const CONFIRM_TITLE = "Are you sure you want to deactivate URL?";
const BookTableContent = styled.div`
	padding-bottom: 2em;
`;

const CopyContent = styled.div`
	background-color: ${theme.colours.darkGray};
	padding-top: 1rem;
	left: 0;
	top: 0;
	height: auto;
	z-index: 5;
	transition: all 0.3s;
	padding-bottom: 1rem;
	color: ${theme.colours.white};

	${(props) =>
		props.hide &&
		css`
			transform: translateX(-270px);
		`}

	overflow:auto;
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

	${(props) =>
		props.isHideScrollBar &&
		css`
			overflow: auto;
			::-webkit-scrollbar {
				width: 10px;
			}
			::-webkit-scrollbar-track {
				background: transparent;
			}
			::-webkit-scrollbar-thumb {
				background: transparent;
				border-radius: 0;
			}
			::-webkit-scrollbar-thumb:hover {
				background: transparent;
			}
		`}

	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		flex: 1;
		height: auto;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		width: 100%;
		position: relative;
	}
`;

const BookView = styled.div`
	height: auto;
	transition: all 0.3s;
	position: relative;
	background-color: ${theme.colours.bgLightDark};

	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		flex: 2;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		padding-left: 0px;
	}
`;

const BooksScreenshot = styled.div`
	overflow-y: auto;
	overflow-x: hidden;
	height: auto;
	padding: 30px 30px 0;
	transition: all 0.3s;

	${(props) =>
		props.hide &&
		css`
			padding: 30px 30px 0 60px;
		`}

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

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		padding: 20px 10px 10px 30px;
	}
`;

const TabMenu = styled.button`
	position: absolute;
	left: 7px;
	font-size: 22px;
	color: ${theme.colours.white};
	padding: 0;
	border: 0;
	background-color: transparent;

	:hover {
		background-color: transparent;
		color: ${theme.colours.white};
		padding: 0;
		border: 0;
	}

	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		${(props) =>
			props.hide &&
			css`
				display: none;
			`}
		width: 10px;
	}
`;

const InnerSection = styled.div`
	padding-left: 1em;
	padding-right: 1em;
`;

const FullLimeBGSection = styled.div`
	background: ${theme.colours.limeLight};
	padding: 1em;
	color: #111;
`;

const Button = styled.button`
	font-size: 1.125em;
	line-height: 1.5em;
	font-weight: 600;
	padding: 0.7em;
	background-color: ${theme.colours.primary};
	color: ${theme.colours.white};
	border: none;
	display: block;
	width: 100%;
	${(p) =>
		p.disabled &&
		css`
			pointer-events: none;
			opacity: 0.3;
		`}
	i {
		font-size: 24px;
		line-height: 28px;
		vertical-align: bottom;
	}
`;

const CopyLabelSection = styled.div`
	font-size: 1.125em;
	line-height: 1.3;
	padding-top: 1.5rem;
`;

const ExpiredMessage = styled.div`
	font-size: 0.75em;
	font-style: italic;
	line-height: 1.2;
	margin-top: 0.75em;
	color: ${theme.colours.black};
`;

const TableContent = styled.div`
	position: relative;
	color: ${theme.colours.white};
	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		display: flex;
	}
`;

const WrapContent = styled.div`
	background-color: ${theme.colours.darkGray};
	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		max-width: 370px;
	}
`;

const StyledLink = styled(Link)`
	color: ${theme.colours.primary};
`;

export default class CopyContentPage extends React.PureComponent {
	hideConfirmModel = () => {
		this.props.setStateForDeactivateLink(null);
	};

	onConfirm = (shareOId) => {
		this.props.deactivateShare(shareOId);
	};

	render() {
		const {
			isSidebar,
			extractPages,
			loading,
			data,
			copyRightTextImage,
			shareLinks,
			copyOid,
			deactivateShare,
			getShareLink,
			isCopyTitleEditable,
			submitCopyTitleEditable,
			isDisplayCopyTitleEditable,
			isLinkShare,
			setStateForLinkShare,
			deactivateLinkId,
			setStateForDeactivateLink,
			latestCreatedShareLinks,
			copiesData,
			createLinkRef,
			createShareLinkRef,
			onCloseFlyOut,
			flyOutIndex,
			resetAccessCode,
			getCopiesData,
			annotationsData,
			isViewingFullScreen,
			onOpen,
		} = this.props;

		const lastGeneratedLink_Oid = Array.isArray(shareLinks) && shareLinks.length > 0 ? shareLinks[0].oid : null;
		const lastCreatedShareLink = lastGeneratedLink_Oid != null ? getUrl("/extract/" + copyOid + "/" + lastGeneratedLink_Oid) : "";
		const previewPages =
			copiesData && copiesData[0].asset_url ? (
				<PdfReader annotationsData={annotationsData} pdfUrl={copiesData[0].asset_url} onOpen={onOpen} enableKeyNavigation={!isViewingFullScreen} />
			) : (
				extractPages.map((item, index) => {
					const currentPage = index + 1;
					const pageIndex = index;
					const page = data.pages[pageIndex];

					const notes = this.props.pageNumberToNoteMap[page] ? this.props.pageNumberToNoteMap[page] : [];
					const highlights = this.props.pageNumberToHighlightMap[page] ? this.props.pageNumberToHighlightMap[page] : [];
					const highlighterInfo = this.props.pageNumberToHighlightPageJoinMap[page] ? this.props.pageNumberToHighlightPageJoinMap[page] : [];
					return (
						<SliderPage
							key={Number(currentPage)}
							pageNumber={currentPage}
							currentIndex={index}
							pageImageUrl={item}
							copyRightTextImage={copyRightTextImage}
							onOpen={this.props.onOpen}
							is_watermarked={this.props.is_watermarked}
							disabled={data.expired}
							notes={notes}
							highlights={highlights}
							teacher={this.props.teacher}
							highlighterInfo={highlighterInfo}
						/>
					);
				})
			);

		return (
			<>
				<Container>
					<BookTableContent>
						<TableContent>
							{isSidebar && (
								<WrapContent>
									<CopyContent className="table-content" hide={!isSidebar} isHideScrollBar={isLinkShare || deactivateLinkId}>
										<InnerSection>
											<CopyContentActions
												data={data}
												deactivateLinkId={deactivateLinkId}
												onDoPrint={this.props.onDoPrint}
												getCopiesData={getCopiesData}
												onOpen={this.props.onOpen}
											/>
											<CopyDetails
												isCopyTitleEditable={isCopyTitleEditable}
												isDisplayCopyTitleEditable={isDisplayCopyTitleEditable}
												data={data}
												submitCopyTitleEditable={submitCopyTitleEditable}
												title={data.title}
											/>
											<CopyLabelSection>
												<p>
													Create a new <b>Share Link</b> for your students:
												</p>
											</CopyLabelSection>
										</InnerSection>

										<FullLimeBGSection>
											<Button onClick={(e) => getShareLink(e)} disabled={data.expired} ref={createLinkRef} data-ga-create-copy="createLink">
												Create a new link &nbsp; <i className="fal fa-angle-right"></i>{" "}
											</Button>
											{data.expired && (
												<ExpiredMessage>
													This copy has expired. You will not be able to create new links unless you{" "}
													<StyledLink to="/profile/my-copies/?expiry_status=review_only&amp;q_mine_only=1&amp;review=1">
														reinstate the copy
													</StyledLink>
													.
												</ExpiredMessage>
											)}
										</FullLimeBGSection>

										<InnerSection>
											<SharedLinksTable
												sharePopupOpen={!!isLinkShare}
												shareLinks={shareLinks}
												copyOid={copyOid}
												deactivateShare={deactivateShare}
												lastCreatedSchreLink={lastCreatedShareLink}
												setStateForDeactivateLink={setStateForDeactivateLink}
												latestCreatedShareLinks={latestCreatedShareLinks}
												title={data.title}
												copiesData={copiesData}
												flyOutIndex={flyOutIndex}
												onCloseFlyOut={onCloseFlyOut}
												createShareLinkRef={createShareLinkRef}
												resetAccessCode={resetAccessCode}
											/>
										</InnerSection>
									</CopyContent>
								</WrapContent>
							)}
							<BookView hide={isSidebar}>
								<TabMenu onClick={this.props.toggleSidebar} hide={isSidebar} title="Open">
									{" "}
									<i className="fal fa-compress"></i>
								</TabMenu>
								<BooksScreenshot hide={isSidebar} column={this.props.numColumns} id="SliderBody">
									<Row>{previewPages}</Row>
								</BooksScreenshot>
							</BookView>
						</TableContent>
					</BookTableContent>
				</Container>
				{isLinkShare && Array.isArray(shareLinks) && shareLinks.length && shareLinks.length > 0 && (
					<ShowCreatedShareLinkPopUp
						show={isLinkShare}
						hideModal={setStateForLinkShare}
						shareLink={shareLinks[0]}
						workDetails={data}
						copiesData={copiesData}
					/>
				)}
				{deactivateLinkId && (
					<ConfirmModal
						uniqueId={deactivateLinkId}
						title={CONFIRM_TITLE}
						onClose={this.hideConfirmModel}
						onConfirm={this.onConfirm}
						onCancel={this.hideConfirmModel}
					/>
				)}
			</>
		);
	}
}
