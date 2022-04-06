import React from "react";
import styled from "styled-components";
import theme from "../../common/theme";

import * as constants from "./constants";

const WrapModalOuter = styled.div`
	position: fixed;
	top: 50%;
	left: 50%;
	width: ${(p) => p.modalWidth};
	height: auto;
	max-width: 760px;
	min-width: auto;
	z-index: 999;
	backface-visibility: visible;
	transform: translateX(-50%) translateY(-50%);
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		width: 80%;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		width: 70%;
	}
	@media screen and (max-width: ${theme.breakpoints.tabletPro}) {
		width: 69%;
	}
`;
const WrapModal = styled.div`
	position: relative;
	background: #ffffff;
	border: 5px solid ${theme.colours.flyOutModalPrimary};
	padding: 0.2em;
	box-shadow: 5px 4px 5px 0px ${theme.colours.flyOutShadow};
	padding: 0.2em;
	transition: opacity ${constants.ANIMATION_DURATION}ms ${(p) => (p.status === "closing" ? "" : `, transform ${constants.ANIMATION_DURATION}ms`)};
	${(p) => {
		if (p.status === "open") {
			return `opacity: 1; transform: scale(1.0);`;
		}
		if (p.status === "closing") {
			return `opacity: 0;`;
		}
		return `opacity: 0; transform: scale(0.9);`;
	}}
`;

const WrapModalTopButton = styled.div`
	width: 100%;
	text-align: right;
	position: absolute;
	right: 3px;
`;
const WrapCloseButton = styled.button`
	border: 0;
	outline: 0;
	background-color: transparent;
	font-size: 1.5em;
	color: ${theme.colours.flyOutModalPrimary};
	cursor: pointer;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		font-size: 1em;
	}
`;
const WrapModalBody = styled.div`
	width: 100%;
	display: block;
	overflow: auto;
	margin: 2.5em 0;
`;
const WrapModalTitle = styled.div`
	font-style: normal;
	font-weight: bold;
	font-size: 2.25em;
	text-align: center;
	color: ${theme.colours.bgDarkPurple};
	padding: 0 70px;
	line-height: 1.2em;
	@media screen and (max-width: ${theme.breakpoints.tabletPro}) {
		font-size: 2em;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		padding: 0 1em;
		font-size: 1.7em;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		padding: 0;
		font-size: 1.1em;
	}
`;
const WrapModalSubTitle = styled.div`
	font-style: normal;
	font-weight: bold;
	font-size: 1em;
	text-align: center;
	color: ${theme.colours.bgDarkPurple};
	width: 100%;
	display: block;
	padding: 0 70px;
	line-height: 1.2em;
	margin: 1.5em 0;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		padding: 0 1em;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		padding: 0 1em;
		margin: 1.5em 0 0;
		font-size: 0.8em;
	}
`;
const WrapModalTopImage = styled.img`
	position: absolute;
	top: -45px;
	left: -70px;
	height: 100px;
	width: 200px;
	transform: rotate(-7deg);
	@media screen and (max-width: ${theme.breakpoints.tabletPro}) {
		height: 85px;
		width: 150px;
		left: -53px;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		height: 85px;
		width: 111px;
		left: -38px;
		display: none;
	}
`;
const WrapModalBottomImage = styled.img`
	position: absolute;
	bottom: -40px;
	right: -65px;
	height: 130px;
	width: 130px;
	transform: rotate(-2deg);
	@media screen and (max-width: ${theme.breakpoints.tabletPro}) {
		height: 78px;
		width: 96px;
		right: -48px;
		bottom: -24px;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		height: 111px;
		width: 119px;
		display: none;
	}
`;
const ModalFooterButton = styled.div`
	width: 100%;
	text-align: center;
	position: absolute;
	bottom: -38px;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		bottom: -25px;
	}
`;
const ShowMeButton = styled.button`
	font-size: 1.5em;
	font-style: normal;
	font-weight: normal;
	line-height: 1.75em;
	text-align: center;
	background: ${theme.colours.flyOutModalPrimary};
	color: ${theme.colours.white};
	border: 0;
	padding: 14px 92px;
	box-shadow: 5px 4px 5px 0px ${theme.colours.flyOutShadow};
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		padding: 7px 60px;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		padding: 5px 15px;
		font-size: 1.2em;
	}
`;
//WhiteOutProvider
class FlyOutModal extends React.PureComponent {
	render() {
		const {
			width = theme.flyOutModal.width ? theme.flyOutModal.width : "670px",
			handleShowMe,
			buttonText = "Show me",
			showButton = true,
			title,
			subTitle = "",
		} = this.props;
		return (
			<>
				<WrapModalOuter modalWidth={width}>
					<WrapModal status={this.props.status}>
						<WrapModalTopImage src={require("../../assets/images/OnFlyoutModalTop.png")} />
						<WrapModalTopButton>
							<WrapCloseButton onClick={handleShowMe}>X</WrapCloseButton>
						</WrapModalTopButton>
						<div>
							<WrapModalBody>
								<WrapModalTitle>{title}</WrapModalTitle>
								<WrapModalSubTitle>{subTitle}</WrapModalSubTitle>
							</WrapModalBody>
						</div>
						<ModalFooterButton>{showButton && <ShowMeButton onClick={handleShowMe}>{buttonText}</ShowMeButton>}</ModalFooterButton>
						<WrapModalBottomImage src={require("../../assets/images/OnFlyoutModalBottom.png")} />
					</WrapModal>
				</WrapModalOuter>
			</>
		);
	}
}
export default FlyOutModal;
