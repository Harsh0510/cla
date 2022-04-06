import React from "react";
import styled from "styled-components";
import theme from "../../common/theme";
import Modal from "../../widgets/Modal";
import { Button } from "../../widgets/Layout/Button";

const Wrap = styled.div`
	font-size: 14px;
	.py-5 {
		padding: 1em;
	}
`;

const ModalHeader = styled.h2`
	font-size: 1.125em;
	margin-bottom: 0.4em;
	font-weight: 400;
	line-height: 20px;
`;

const ModalBody = styled.div`
	margin-bottom: 1em;
`;

const ModalFooter = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
`;

const FooterButtonSection = styled.div`
	width: ${(p) => (p.customWidth ? p.customWidth : "100%")};
`;

const FooterButtonRightSection = styled.div`
	width: ${(p) => (p.customWidth ? p.customWidth : "100%")};
	justify-content: flex-end;
	display: flex;
`;

const ModalContent = styled.div`
	padding: 0.5em 0 2em;
	color: ${theme.colours.black};
`;

const ImageViewer = styled.div``;

const StyledButton = styled(Button)`
	justify-content: space-between;
	align-items: center;
	display: flex;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		margin-top: 15px;
	}
	i {
		font-size: 22px;
		line-height: 15px;
		margin-left: 20px;
	}
	opacity: ${(p) => (p.disabled ? "0.5" : "1")};
	cursor: ${(p) => (p.disabled ? "none" : "pointer")};
`;

export default class CapturedImagePreview extends React.PureComponent {
	render() {
		return (
			<>
				<Wrap>
					<Modal show={true} handleClose={this.props.onDenyPreview} modalWidth={"auto"} isApplyMobileLarge={true}>
						<ModalContent>
							<ModalHeader>This is the image you took. Would you like to send this to us or try again?</ModalHeader>
							<ModalBody>
								<ImageViewer>
									<img src={this.props.previewImageDataUrl} />
								</ImageViewer>
							</ModalBody>
							<ModalFooter>
								<FooterButtonSection customWidth="44%">
									<StyledButton onClick={this.props.onAcceptPreview} disabled={this.props.isSending}>
										Send &nbsp;{" "}
										{this.props.isSending ? (
											<i className="fa fa-spinner fa-spin" aria-hidden="true"></i>
										) : (
											<i className="fa fa-external-link" aria-hidden="true"></i>
										)}
									</StyledButton>
								</FooterButtonSection>
								<FooterButtonRightSection customWidth="50%">
									<StyledButton onClick={this.props.onDenyPreview} disabled={this.props.isSending}>
										Try again &nbsp; <i className="fa fa-repeat" aria-hidden="true"></i>
									</StyledButton>
								</FooterButtonRightSection>
							</ModalFooter>
						</ModalContent>
					</Modal>
				</Wrap>
			</>
		);
	}
}
