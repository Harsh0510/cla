import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import withPageSize from "../../common/withPageSize";
import ShareLinksTableRaw from "./ShareLinksTableRaw";
import Flyout from "../../widgets/Flyout";
import flyOutGuide from "./flyOutGuide";

const FLYOUT_INDEX_AVILABLE_LINKS = 1; // flyout option index

const StyledSharedLinksTableRaw = styled.div`
	color: ${theme.colours.white};
	background-color: transparent;
	border-radius: 3px;

	${(props) =>
		props.breakpoint > withPageSize.MOBILE &&
		css`
			padding: 0;
			margin: 0;
			border-radius: 0;
		`}
`;

const StyledSharedLinksTable = withPageSize(StyledSharedLinksTableRaw);

const ShareTableWrapper = styled.div`
	/* overflow-x: auto; */
`;

const ShareTableRaw = styled.div`
	font-size: 12px;
	border-collapse: collapse;
	width: 100%;
	tr:nth-child(even) {
		background: ${theme.colours.bgToggleSwitch};
	}
	tr:nth-child(odd) {
		background: ${theme.colours.white};
	}
	color: ${theme.colours.black};
	border-top: 1px solid ${theme.colours.white};
	@media screen and (max-width: ${theme.breakpoints.mobile1}) {
		font-size: 10px;
	}
`;

const ShareTableHeading = styled.div`
	font-size: 1em;
	margin: 1em 0 0.5em;
	font-weight: bold;
`;

const ShareTableDescription = styled.div`
	line-height: 1.2em;
	margin: 0.2em 0 1.5em;
`;

/**
 * The table of shared links that appears in the sidebar of Copy Management Pages
 */
export default class SharedLinksTable extends React.PureComponent {
	render() {
		const {
			shareLinks,
			copyOid,
			deactivateShare,
			lastCreatedSchreLink,
			latestCreatedShareLinks,
			title,
			data,
			createShareLinkRef,
			flyOutIndex,
			onCloseFlyOut,
			resetAccessCode,
		} = this.props;

		let requireAccessCodeLength = 0;
		let shareLinksCount = 0;
		if (shareLinks && shareLinks.length) {
			shareLinksCount = shareLinks.length;
			const requireAccessCodeData = shareLinks.filter((x) => x.enable_extract_share_access_code === true);
			requireAccessCodeLength = requireAccessCodeData.length;
		}
		const is_All_Require_AccessCode = shareLinksCount === requireAccessCodeLength;
		const is_Some_Require_AccessCode = requireAccessCodeLength !== 0 && shareLinksCount !== requireAccessCodeLength;

		return (
			<StyledSharedLinksTable>
				<ShareTableHeading>Active Share Links</ShareTableHeading>
				{shareLinksCount > 0 && (
					<>
						{is_All_Require_AccessCode ? <ShareTableDescription>You will need an access code to access these links</ShareTableDescription> : ""}
						{is_Some_Require_AccessCode ? (
							<ShareTableDescription>You will need an access code to access some of these links</ShareTableDescription>
						) : (
							""
						)}
					</>
				)}
				<div>{shareLinks ? `Link date` : `(No links created yet)`}</div>
				<ShareTableWrapper>
					<ShareTableRaw ref={shareLinks ? createShareLinkRef : ""}>
						{shareLinks ? (
							shareLinks.map((item, index) => (
								<ShareLinksTableRaw
									key={item.oid}
									lastCreatedSchreLink={lastCreatedSchreLink}
									copyOid={copyOid}
									data={item}
									deactivateShare={deactivateShare}
									shareLinksLength={shareLinks.length}
									setStateForDeactivateLink={this.props.setStateForDeactivateLink}
									latestCreatedShareLinks={latestCreatedShareLinks}
									title={title}
									copiesData={this.props.copiesData}
									flyOutIndex={flyOutIndex}
									onCloseFlyOut={onCloseFlyOut}
									itemIndex={index}
									resetAccessCode={resetAccessCode}
								/>
							))
						) : (
							<></>
						)}
						{!this.props.sharePopupOpen && shareLinks && flyOutIndex === FLYOUT_INDEX_AVILABLE_LINKS ? (
							<Flyout key={FLYOUT_INDEX_AVILABLE_LINKS} width={320} height={150} onClose={onCloseFlyOut} target={createShareLinkRef}>
								{flyOutGuide.flyOut[FLYOUT_INDEX_AVILABLE_LINKS]}
							</Flyout>
						) : (
							<></>
						)}
					</ShareTableRaw>
				</ShareTableWrapper>
			</StyledSharedLinksTable>
		);
	}
}
