import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import Modal from "../../widgets/Modal";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { ShareExtractLink } from "../../widgets/SendEmailLink";
import customSetTimeout from "../../common/customSetTimeout";
import { RenderGoogleClassRoomButtonComp } from "../../common/renderGoogleClassRoomButton";
import { RenderTeamsButtonComp } from "../../common/renderTeamsButton";
import getUrl from "../../common/getUrl";

const Wrap = styled.div`
	font-size: 14px;
`;

const ModalHeader = styled.h2`
	font-size: 1.125em;
	margin-bottom: 0.4em;
	font-weight: 400;
	line-height: 20px;
`;

const ModalHeaderDescription = styled.div`
	font-size: 0.875em;
	font-weight: 400;
	line-height: 28px;
	margin-bottom: 0.4em;

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		line-height: 17px;
	}
`;

const ModalBody = styled.div`
	margin-bottom: 1em;
`;

const ModalFooter = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
	@media screen and (max-width: ${theme.breakpoints.mobile8}) {
		flex-wrap: wrap;
	}
`;

const FooterButtonSection = styled.div`
	width: ${(p) => (p.customWidth ? p.customWidth : "100%")};
	@media screen and (max-width: ${theme.breakpoints.mobile8}) {
		flex: 0 50%;
		max-width: 50%;
		margin-bottom: 10px;
		width: auto;
	}
`;

const Input = styled.input`
	width: 100%;
	background-color: ${theme.colours.bgLightGray};
	border: 0;
	color: ${theme.colours.darkGray};
	overflow: hidden;
	text-overflow: ellipsis;
	margin-right: 1em;
	padding: 0.5em;
	font-size: 0.75em;
`;

const Button = styled.button`
	font-size: 1.125em;
	font-weight: bold;
	background-color: ${theme.colours.primaryLight};
	color: ${theme.colours.white};
	height: 48px;
	min-width: 51px;
	border: none;
	vertical-align: middle;
	text-align: center;
	margin-right: 1em;
	padding: 0.8rem;
	display: block;
	width: 98%;
	${(props) =>
		props.isNeedBiggerIcon &&
		css`
			i {
				font-size: 1.5em;
				line-height: 1em;
				vertical-align: middle;
			}
		`}

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		font-size: 14px;
		line-height: 20px;
		padding: 10px 15px;
		height: auto;
		vertical-align: middle;
		margin-right: 0;
	}

	@media screen and (max-width: ${theme.breakpoints.mobile7}) {
		font-size: 10px;
		line-height: 14px;
		padding: 9px 4px;
	}
`;

const ModalContent = styled.div`
	padding: 0.5em 0 2em;
	color: ${theme.colours.black};
`;

const AccessCodeSection = styled.div`
	margin-top: 1.5em;
	margin-bottom: 1.5em;
`;

const AccessCodeInput = styled.input`
	color: ${theme.colours.black};
	border-color: ${theme.colours.primary};
	border-color: ${theme.colours.primary};
	padding: 5px;
	text-align: center;
	width: 60%;
`;

const Icon = styled.i`
	margin-right: 0.25rem;
`;

export default class ShowCreatedShareLinkPopUp extends React.PureComponent {
	_isMounted = false;
	state = {
		isCopied: false,
	};

	componentDidMount() {
		this._isMounted = true;
	}

	showCopiedText = () => {
		this.setState({ isCopied: true });
		customSetTimeout(this.updateStatus, 2000);
	};

	updateStatus = () => {
		if (!this._isMounted) {
			return;
		}
		this.setState({ isCopied: false });
	};

	componentWillUnmount() {
		this._isMounted = false;
		delete this._isMounted;
	}

	render() {
		const { shareLink, show, hideModal, workDetails, copiesData } = this.props;
		const copyOId = copiesData[0].oid;
		const shareLinkURL = getUrl("/extract/" + copyOId + "/" + shareLink.oid);
		const extractTitle = workDetails.title;
		const enable_extract_share_access_code = shareLink.enable_extract_share_access_code;

		return (
			<>
				<Wrap>
					<Modal show={show} handleClose={hideModal} modalWidth={"698px"} isApplyMobileLarge={true}>
						<ModalContent>
							<ModalHeader>Share Link Created!</ModalHeader>
							<ModalHeaderDescription>Your new link has been added to the Active Share Links list.</ModalHeaderDescription>
							<ModalBody>
								<Input type="text" value={shareLinkURL} readOnly />
								{enable_extract_share_access_code ? (
									<AccessCodeSection>
										<ModalHeader>For this copy you will also need the following access code:</ModalHeader>
										<div>
											<AccessCodeInput type="text" value={shareLink.access_code} readOnly />
										</div>
									</AccessCodeSection>
								) : (
									""
								)}
							</ModalBody>
							<ModalFooter>
								<FooterButtonSection customWidth="44%">
									<CopyToClipboard onCopy={this.showCopiedText} text={shareLinkURL}>
										{!this.state.isCopied ? (
											<Button isNeedBiggerIcon={true} data-ga-create-copy="share" data-ga-use-copy="copy-to-clipboard">
												Copy URL to Clipboard &nbsp; <i className="fal fa-angle-right "></i>
											</Button>
										) : (
											<Button isNeedBiggerIcon={false}>
												<Icon className="fas fa-clipboard-list"></Icon> URL copied
											</Button>
										)}
									</CopyToClipboard>
								</FooterButtonSection>
								<FooterButtonSection customWidth="32%">
									<a href={shareLinkURL} target="_blank" data-ga-create-copy="share" data-ga-use-copy="open-in-tab">
										<Button>
											Open in Tab &nbsp; <i className="fal fa-external-link "></i>{" "}
										</Button>
									</a>
								</FooterButtonSection>
								<FooterButtonSection customWidth="22%">
									<ShareExtractLink workDetails={this.props.workDetails} shareLink={shareLink} copyOId={copyOId} />
								</FooterButtonSection>
								<FooterButtonSection customWidth="auto">
									<RenderGoogleClassRoomButtonComp
										url={shareLinkURL}
										title={extractTitle}
										iconSize={48}
										copiesData={this.props.copiesData}
										accessCode={enable_extract_share_access_code ? shareLink.access_code : null}
									/>
								</FooterButtonSection>
								<FooterButtonSection customWidth="auto">
									<RenderTeamsButtonComp
										iconSize={"48px"}
										url={shareLinkURL}
										title={extractTitle}
										copiesData={this.props.copiesData}
										accessCode={enable_extract_share_access_code ? shareLink.access_code : null}
									/>
								</FooterButtonSection>
							</ModalFooter>
						</ModalContent>
					</Modal>
				</Wrap>
			</>
		);
	}
}
