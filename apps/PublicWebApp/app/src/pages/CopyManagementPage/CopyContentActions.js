import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme.js";
import withApiConsumer from "../../common/withApiConsumer";
import withAuthRequiredConsumer from "../../common/withAuthRequiredConsumer";
import staticValues from "../../common/staticValues";
import ConfirmModal from "../../widgets/ConfirmModal";
import UserRole from "../../common/UserRole";
import { Link, Redirect } from "react-router-dom";
import Modal from "../../widgets/Modal/index.js";

const EXTRACT_STATUS = staticValues.extractStatus;
const EXTRACT_STATUS_EDITABLE = EXTRACT_STATUS.editable;

const WrapExtractAction = styled.div`
	text-align: right;
	display: flex;
	justify-content: space-between;
`;

const WrapExtractActionGroup = styled.div`
	display: flex;
`;

const ExtractActionButton = styled.button`
	text-align: center;
	background: transparent;
	border: 0;
	color: ${theme.colours.white};
	font-weight: bold;
	font-size: 20px;
	padding: 2px;
	line-height: 1em;
	transition: opacity 200ms;
	&:hover {
		opacity: 0.8;
	}
	${(props) =>
		props.marginLeft &&
		css`
			margin-left: 0.5rem;
		`};
	${(props) =>
		props.marginRight &&
		css`
			margin-right: 0.5rem;
		`};
	span {
		font-size: 12px;
		font-weight: normal;
		text-decoration: underline;
	}
	${(props) =>
		props.blockClicksInside &&
		css`
			& > * {
				pointer-events: none;
			}
		`}
	${(p) =>
		p.disabled &&
		css`
			opacity: 0.3;
			pointer-events: none;
		`}
`;

const CopyEditLink = styled(Link)`
	color: ${theme.colours.white};
	:hover {
		color: ${theme.colours.white};
		cursor: pointer;
	}
`;

const CopyEditLinkIcon = styled(Link)`
	color: ${theme.colours.white};
	:hover {
		color: ${theme.colours.white};
		cursor: pointer;
	}
`;

const CopyEditInfoLink = styled.a`
	color: ${theme.colours.white};
	font-size: small;
	:hover {
		color: ${theme.colours.white};
		cursor: pointer;
	}
`;

const DeleteIcon = styled.i`
	pointer-events: none;
`;

const DeleteText = styled.span`
	pointer-events: none;
`;

const ConfirmText = styled.div`
	margin-top: 6px;
`;

const ModalBody = styled.div`
	margin-bottom: 1em;
`;

export default withAuthRequiredConsumer(
	withApiConsumer(
		class CopyContentActions extends React.PureComponent {
			state = {
				isShowActivateCopyPopUp: false,
				isShowDeleteCopyPopUp: false,
				isRedirect: false,
				isShowDeletedMessage: false,
			};
			_handleOnOpenBound = this.handleOnOpen.bind(this);

			componentDidMount() {
				this._isMounted = true;
			}

			componentWillUnmount() {
				delete this._isMounted;
			}

			//full screen view
			handleOnOpen() {
				this.props.onOpen(0);
			}

			handleOnPrint = () => {
				const myUserDetails = this.props.withAuthConsumer_myUserDetails;
				if (this.props.data.status === EXTRACT_STATUS_EDITABLE && myUserDetails.role !== UserRole.claAdmin) {
					this.setState({
						isShowActivateCopyPopUp: true,
					});
				} else {
					this.props.onDoPrint();
				}
			};

			onConfrimActivateCopy = (extractOid) => {
				this.props.api("/public/extract-status-update", { oid: extractOid }).then((result) => {
					if (!this._isMounted) {
						return;
					}
					if (result) {
						this.setState(
							{
								isShowActivateCopyPopUp: false,
							},
							() => {
								this.props.getCopiesData();
								this.props.onDoPrint();
							}
						);
					}
				});
			};

			onCancelActivateCopy = () => {
				this.setState({
					isShowActivateCopyPopUp: false,
				});
			};

			handleOnDelete = () => {
				if (this.props.data.status === EXTRACT_STATUS_EDITABLE) {
					this.setState({
						isShowDeleteCopyPopUp: true,
					});
				}
			};

			onConfrimDeleteCopy = (extractOid) => {
				this.props.api("/public/extract-cancel", { oid: extractOid }).then((result) => {
					if (!this._isMounted) {
						return;
					}
					this.setState({
						isShowDeleteCopyPopUp: false,
						isShowDeletedMessage: true,
					});
				});
			};

			onCancelDeleteCopy = () => {
				this.setState({
					isShowDeleteCopyPopUp: false,
				});
			};

			hideModal = () => {
				this.setState({ isRedirect: true, isShowDeletedMessage: false });
			};

			getUrlAfterCancelled = () => {
				return `/profile/my-copies?query=${this.props.data.title}&q_mine_only=${this.props.data.did_create ? "1" : "0"}`;
			};

			render() {
				if (this.state.isRedirect) {
					return <Redirect to={this.getUrlAfterCancelled()} />;
				}
				const { isShowActivateCopyPopUp, isShowDeleteCopyPopUp, isShowDeletedMessage } = this.state;
				const { data } = this.props;
				const customStyle = {};
				if (data.status !== EXTRACT_STATUS_EDITABLE) {
					customStyle.justifyContent = "flex-end";
				}
				const editLinkUrl = `/works/${data.work_isbn13}/extract?extract_oid=${data.oid}&course=${data.course_oid}&selected=${data.pages.join("-")}`;
				// If Copy Expired then remove Print and FullScreen options
				return (
					!data.expired && (
						<>
							<WrapExtractAction style={customStyle}>
								{data.status === EXTRACT_STATUS_EDITABLE && (
									<WrapExtractActionGroup>
										<ExtractActionButton marginRight>
											<CopyEditLinkIcon data-ga-use-copy="edit" to={editLinkUrl} className="fal fa-edit" />
											<br />
											<span>
												<CopyEditLink data-ga-use-copy="edit" to={editLinkUrl}>
													Edit copy
												</CopyEditLink>
											</span>{" "}
											<CopyEditInfoLink href="https://educationplatform.zendesk.com/hc/en-us/articles/4404469418257" target="_blank">
												<i className="fas fa-info-circle" />
											</CopyEditInfoLink>
										</ExtractActionButton>
										<ExtractActionButton data-ga-use-copy="delete" onClick={this.handleOnDelete} blockClicksInside>
											<DeleteIcon className="fal fa-trash-alt" />
											<br />
											<DeleteText>Delete copy</DeleteText>
										</ExtractActionButton>
									</WrapExtractActionGroup>
								)}
								<WrapExtractActionGroup>
									<ExtractActionButton
										disabled={!!data.asset_url}
										onClick={this.handleOnPrint}
										data-ga-use-copy="print"
										marginRight
										blockClicksInside
									>
										<i className="fal fa-print" />
										<br />
										<span>Print</span>
									</ExtractActionButton>
									<ExtractActionButton onClick={this._handleOnOpenBound} title={"Fullscreen"} data-ga-use-copy="fullscreen" blockClicksInside>
										<i className="fal fa-expand" />
										<br />
										<span>Fullscreen</span>
									</ExtractActionButton>
								</WrapExtractActionGroup>
							</WrapExtractAction>
							{isShowActivateCopyPopUp && (
								<ConfirmModal
									uniqueId={data.oid}
									title={"This will activate your copy."}
									onClose={this.onCancelActivateCopy}
									onConfirm={this.onConfrimActivateCopy}
									onCancel={this.onCancelActivateCopy}
									confirmButtonText={"Yes, print my copy"}
									cancelButtonText={"No, go back"}
								>
									<div>Printing an editable copy makes it active. This means that it cannot be edited further after it is printed.</div>
									<ConfirmText>Are you sure you wish to continue?</ConfirmText>
								</ConfirmModal>
							)}

							{isShowDeleteCopyPopUp && (
								<ConfirmModal
									uniqueId={data.oid}
									title={"This will permanently delete your copy."}
									subTitle={""}
									description={""}
									onClose={this.onCancelDeleteCopy}
									onConfirm={this.onConfrimDeleteCopy}
									onCancel={this.onCancelDeleteCopy}
									confirmButtonText={"Yes, delete this copy"}
									cancelButtonText={"No, go back"}
								>
									<div>Once a copy has been deleted, it cannot be reinstated.</div>
									<ConfirmText>Are you sure you wish to continue?</ConfirmText>
								</ConfirmModal>
							)}

							{isShowDeletedMessage && (
								<Modal title={"Copy Deleted"} show={true} modalWidth={"450px"} handleClose={this.hideModal}>
									<ModalBody>This copy has been deleted.</ModalBody>
								</Modal>
							)}
						</>
					)
				);
			}
		}
	)
);
