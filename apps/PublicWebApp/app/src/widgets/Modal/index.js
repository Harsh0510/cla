import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import OnTop from "../OnTop";

const WrapModel = styled.div`
	font-size: 14px;
	color: ${theme.colours.black};
	.modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		z-index: 9999;
		.modal-main {
			background: white;
			width: ${(p) => p.modalWidth};
			height: auto;
			max-height: 95%;
			max-width: 95%;
			max-width: 1300px;
			overflow-y: auto;
			${(p) =>
				p.isApplyMobileLarge &&
				css`
					@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
						width: 100%;
						max-width: 440px;
					}
				`}
			@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
				width: 95%;
				max-width: 410px;
			}
			@media screen and (max-width: ${theme.breakpoints.mobile}) {
				overflow-y: auto;
				max-height: 95%;
			}
		}
	}

	.display-block {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.display-none {
		display: none;
	}
`;

const CloseButton = styled.button`
	border: 0;
	outline: 0;
	background-color: transparent;
	padding: 0.5em;
	margin: 0.5em;
	line-height: 1;
	font-size: 0.9em;
	color: ${theme.colours.primaryLight};
`;

const Title = styled.h2`
	font-size: 21px;
	margin-bottom: 0.4em;
	font-weight: 400;
	line-height: 1.5em;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		font-size: 1.2em;
		line-height: 1.2em;
	}
`;

const SubTitle = styled.div`
	font-size: 1em;
	line-height: 1.3em;
	margin-bottom: 0.4em;
`;

const Description = styled.div`
	font-size: 0.825em;
	line-height: 1.3em;
	margin-bottom: 0.4em;
`;

const Children = styled.div`
	font-size: 1em;
	line-height: 1.3em;
	margin-bottom: 0.4em;
`;

const ModalBody = styled.div`
	${(p) =>
		p.defaultPadding &&
		`
		padding: 0 2em 0 2em;
	`}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		${(p) =>
			p.defaultPadding &&
			`
			padding: 0 1em;
		`}
	}
`;

const WrapButtonClose = styled.div`
	text-align: right;
`;

export default class Modal extends React.PureComponent {
	render() {
		const {
			handleClose,
			show,
			children,
			modalWidth = "80%",
			isApplyMobileLarge = false,
			showCloseLink = true,
			defaultPadding = true,
			title,
			subTitle,
			description,
		} = this.props;
		const showHideClassName = show ? "modal display-block" : "modal display-none";

		return (
			<OnTop>
				<WrapModel modalWidth={modalWidth} isApplyMobileLarge={isApplyMobileLarge}>
					<div className={showHideClassName}>
						<section className="modal-main">
							{showCloseLink && (
								<WrapButtonClose>
									<CloseButton onClick={handleClose}>
										<i className="fas fa-times" title="Close"></i>
									</CloseButton>
								</WrapButtonClose>
							)}
							<ModalBody defaultPadding={defaultPadding}>
								{title ? <Title> {title} </Title> : ""}
								{subTitle ? <SubTitle>{subTitle}</SubTitle> : ""}
								{description ? <Description>{description}</Description> : ""}
								<Children>{children}</Children>
							</ModalBody>
						</section>
					</div>
				</WrapModel>
			</OnTop>
		);
	}
}
