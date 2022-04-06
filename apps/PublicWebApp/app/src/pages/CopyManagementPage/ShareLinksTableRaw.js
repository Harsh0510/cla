import React from "react";
import date from "../../common/date";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import getUrl from "../../common/getUrl";
import { CopyToClipboard } from "react-copy-to-clipboard";
import customSetTimeout from "../../common/customSetTimeout";
import { RenderGoogleClassRoomButtonComp } from "../../common/renderGoogleClassRoomButton";
import { RenderTeamsButtonComp } from "../../common/renderTeamsButton";

const FLYOUT_INDEX_AVILABLE_LINKS = 1; // flyout option index

const ShareRow = styled.div`
	background-color: ${(p) => (p.backGroundColor ? p.backGroundColor : "white")};
`;

const ShareCell = styled.div`
	padding: 5px;
`;

const DeactivateButton = styled.button`
	background-color: ${theme.colours.bgDeactivate};
	border: none;
	color: ${theme.colours.white};
	font-size: 1em;
	padding: 5px;
	width: 100%;
	height: 100%;
	@media screen and (max-width: ${theme.breakpoints.mobile7}) {
		min-height: 32px;
	}
`;

const PopUpTitle = styled.div`
	position: absolute;
	left: -7px;
	text-align: center;
	display: block;
	width: calc(100% + 15px);
	top: -54px;
	background-color: ${theme.colours.primary};
	padding: 1em 1em;
	color: ${theme.colours.white};
	border: 1px solid #fff;
	@media screen and (max-width: ${theme.breakpoints.mobile1}) {
		top: -75px;
	}
`;

const CopyLinkButton = styled.button`
	background-color: ${theme.colours.headerButtonSearch};
	border: none;
	color: ${theme.colours.white};
	font-size: 1em;
	padding: 5px;
	width: 100%;
	height: 100%;
	@media screen and (max-width: ${theme.breakpoints.mobile7}) {
		min-height: 32px;
	}
`;

const TitleDescription = styled.span`
	vertical-align: middle;
	font-size: 1.3em;
	font-weight: 700;
	line-height: 1.6em;
`;

const WrapColumn = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
	position: relative;
	${(p) =>
		p.marginTop &&
		css`
			margin-top: ${p.marginTop};
		`}
`;

const ColumnSection = styled.div`
	-webkit-box-flex: 0;
	-ms-flex: 0 auto;
	flex: 0 auto;
`;

const DateTitle = styled.div`
	padding: 5px 5px 5px 0px;
`;

const NewLinkDiv = styled.div`
	width: 64px;
	@media screen and (device-width: ${theme.breakpoints.mobile1}) {
		width: 53px;
	}
`;

const AccessCode = styled.div`
	width: 35%;
	padding: 6px 0;
`;

const RevealSection = styled.div`
	background-color: ${theme.colours.lime};
	margin-left: 5px;
	width: 65%;
	padding: 6px;
	cursor: pointer;
	text-align: left;
`;

const AccessCodeSection = styled.div`
	background-color: ${theme.colours.white};
	border: 3px solid ${theme.colours.lime};
	margin-left: 5px;
	width: 65%;
	padding: 6px;
	position: relative;
	text-align: center;
`;

const ResetSection = styled.div`
	cursor: pointer;
	position: absolute;
	padding: 5px;
	right: 0;
	top: 0;
`;

const KeyImage = styled.img`
	margin-right: 5px;
`;

const Icon = styled.i`
	margin-right: 0.25rem;
`;
/**
 * The table of shared links that appears in the sidebar of Copy Management Pages
 */
export default class ShareLinksTableRaw extends React.PureComponent {
	state = {
		isShowPopUpInfo: false,
		isShowReveal: true,
	};
	classRoomRef = React.createRef();

	showPopUpInfo = () => {
		this.setState({ isShowPopUpInfo: true });
		customSetTimeout(this.updateStatus, 2000);
		if (this.props.flyOutIndex === FLYOUT_INDEX_AVILABLE_LINKS) {
			this.props.onCloseFlyOut();
		}
	};

	updateStatus = () => {
		this.setState({ isShowPopUpInfo: false });
	};

	hidePopUpInfo = () => {
		this.setState({ isShowPopUpInfo: false });
	};

	handleDeactivate = () => {
		this.props.setStateForDeactivateLink(this.props.data.oid);
		if (this.props.flyOutIndex === FLYOUT_INDEX_AVILABLE_LINKS) {
			this.props.onCloseFlyOut();
		}
	};

	handleReveal = () => {
		this.setState({
			isShowReveal: false,
		});
	};

	handleResetAccessCode = () => {
		this.setState(
			{
				isShowReveal: false,
			},
			this.props.resetAccessCode(this.props.data.oid)
		);
	};

	/* --- Enable this function to render instead of static link --- */
	/* componentDidMount() {
		renderClassRoomButton(
			this.classRoomRef.current,
			getUrl("/extract/" + this.props.copyOid + "/" + this.props.data.oid)
		);
	} */

	render() {
		const {
			copyOid,
			data,
			shareLinksLength = 0,
			latestCreatedShareLinks = Object.create(null),
			title,
			copiesData,
			flyOutIndex,
			itemIndex,
		} = this.props;

		return (
			<>
				<ShareRow key={data.oid} deactivated={false} backGroundColor={itemIndex % 2 === 0 ? "white" : "#ccc"}>
					<ShareCell>
						<WrapColumn>
							<ColumnSection>
								{/* <div ref={this.classRoomRef}></div> */}
								<DateTitle>
									{shareLinksLength > 1 && latestCreatedShareLinks[data.oid] ? (
										<NewLinkDiv>
											<Icon className="far fa-star"></Icon> <span>NEW</span>
										</NewLinkDiv>
									) : (
										date.sqlToNiceFormat(data.created)
									)}
								</DateTitle>
							</ColumnSection>
							<ColumnSection>
								<CopyToClipboard onCopy={this.showPopUpInfo} text={getUrl("/extract/" + copyOid + "/" + data.oid)}>
									<CopyLinkButton>
										<Icon className="far fa-copy"></Icon> Copy URL
									</CopyLinkButton>
								</CopyToClipboard>
							</ColumnSection>
							<ColumnSection>
								<DeactivateButton deactivated={false} onClick={this.handleDeactivate} data-ga-create-copy="deactivate">
									<Icon className="fa fa-times-circle" aria-hidden="true"></Icon> Deactivate
								</DeactivateButton>
							</ColumnSection>
							<ColumnSection>
								<RenderGoogleClassRoomButtonComp
									url={getUrl("/extract/" + copyOid + "/" + data.oid)}
									title={title}
									copiesData={copiesData}
									accessCode={data.enable_extract_share_access_code ? data.access_code : null}
									onClick={this.props.onCloseFlyOut}
								/>
							</ColumnSection>
							<ColumnSection>
								<RenderTeamsButtonComp
									url={getUrl("/extract/" + copyOid + "/" + data.oid)}
									title={title}
									copiesData={copiesData}
									accessCode={data.enable_extract_share_access_code ? data.access_code : null}
									onClick={this.props.onCloseFlyOut}
								/>
							</ColumnSection>
							{this.state.isShowPopUpInfo ? (
								<>
									<PopUpTitle>
										<TitleDescription>
											<Icon className="fas fa-clipboard-list"></Icon> URL copied to your clipboard!
										</TitleDescription>
									</PopUpTitle>
								</>
							) : (
								<></>
							)}
						</WrapColumn>
						{data.enable_extract_share_access_code && this.state.isShowReveal ? (
							<WrapColumn marginTop={"5px"}>
								<AccessCode>Access Code</AccessCode>
								<RevealSection onClick={this.handleReveal}>
									<KeyImage src={require("../../assets/images/key.png")} />
									Click to reveal
								</RevealSection>
							</WrapColumn>
						) : (
							""
						)}
						{data.enable_extract_share_access_code && !this.state.isShowReveal ? (
							<WrapColumn marginTop={"5px"}>
								<AccessCode>Access Code</AccessCode>
								<AccessCodeSection>
									{data.access_code}
									<ResetSection title="Change the access code">
										<i className={"fa fa-refresh"}></i>
										<img src={require("../../assets/images/reset.png")} onClick={this.handleResetAccessCode} />
									</ResetSection>
								</AccessCodeSection>
							</WrapColumn>
						) : (
							""
						)}
					</ShareCell>
				</ShareRow>
			</>
		);
	}
}
