import styled, { css } from "styled-components";
import theme from "../../common/theme";
import React from "react";
import staticValues from "../../common/staticValues";

const BarcodeArea = styled.div`
	width: 375px;
	height: 300px;

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		min-height: 230px;
	}
`;

const BarcodeAreaOne = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	background-image: url(${require("../../assets/images/unlock_bg.svg")});
	background-size: 99%;
	background-repeat: no-repeat;
	background-position: center;
	@keyframes popCorner {
		100% {
		}
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		order: 1;
	}
	padding: 0.4em;
	text-align: center;
`;

const Interactive = styled.div`
	max-width: 100%;
	max-height: 100%;
	overflow: hidden;
	video {
		width: 90%;
		height: 90%;
		align-items: center;
		justify-content: center;
		margin: 0.6em 0.2em 0 0.2em;
		${(p) =>
			p.notFound &&
			css`
				display: none;
			`};
	}
	.drawingBuffer {
		display: flex;
		position: absolute;
		max-width: 100%;
		z-index: -1;
	}
`;

const StartButton = styled.div`
	color: ${(p) => (p.color ? p.color : theme.colours.white)};
	justify-content: center;
	padding-top: 0.5em;
	font-weight: 700;
	cursor: pointer;
`;

const ButtonWrap = styled.div`
	width: 90%;
	height: 90%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	line-height: 1.2;
	background: ${(p) => (p.bgColor ? p.bgColor : "#000")};
	z-index: 1;
	img {
		cursor: pointer;
	}
	@media screen and (max-width: ${theme.breakpoints.desktop2}) {
		height: 80% !important;
	}
	@media screen and (max-width: ${theme.breakpoints.laptop}) {
		height: 74% !important;
	}
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		height: 85% !important;
	}
	@media screen and (max-width: ${theme.breakpoints.tabletPro}) {
		height: 85% !important;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		height: 80% !important;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) and (min-width: ${theme.breakpoints.laptop}) {
		height: 79% !important;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile4}) {
		height: 80% !important;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile3}) {
		height: 69% !important;
		font-size: 14px;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile1}) {
		height: 64% !important;
	}
	@media screen and (width: ${theme.breakpoints.tabletPro}) {
		height: 70% !important;
	}
`;

const StyledSpinnerContainer = styled.div`
	display: flex;
	width: 90%;
	height: 90%;
	@media screen and (max-width: ${theme.breakpoints.desktop2}) {
		height: 80% !important;
	}
	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		height: 74% !important;
	}
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		height: 85% !important;
	}
	@media screen and (max-width: ${theme.breakpoints.tabletPro}) {
		height: 85% !important;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		height: 80% !important;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) and (min-width: ${theme.breakpoints.laptop}) {
		height: 79% !important;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile4}) {
		height: 80% !important;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile3}) {
		height: 69% !important;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile1}) {
		height: 64% !important;
	}
	@media screen and (width: ${theme.breakpoints.tabletPro}) {
		height: 74% !important;
	}
`;

const StyledSpinner = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	background-color: ${theme.colours.black};
`;

const Spinner = styled.div`
	@-webkit-keyframes sk-circleBounceDelay {
		0%,
		80%,
		100% {
			-webkit-transform: scale(0);
			transform: scale(0);
		}
		40% {
			-webkit-transform: scale(1);
			transform: scale(1);
		}
	}

	@keyframes sk-circleBounceDelay {
		0%,
		80%,
		100% {
			-webkit-transform: scale(0);
			transform: scale(0);
		}
		40% {
			-webkit-transform: scale(1);
			transform: scale(1);
		}
	}
`;

const SkCircle = styled.div`
	margin: 100px auto;
	width: 40px;
	height: 40px;
	position: relative;
	background-color: ${theme.colours.black};
`;

const SkChild = styled.div`
	width: 100%;
	height: 100%;
	position: absolute;
	left: 0;
	top: 0;
	:before {
		content: "";
		display: block;
		margin: 0 auto;
		width: 15%;
		height: 15%;
		background-color: ${theme.colours.white};
		border-radius: 100%;
		animation: sk-circleBounceDelay 1.2s infinite ease-in-out both;
	}
`;

const SkCircle2 = styled(SkChild)`
	transform: rotate(30deg);
	:before {
		animation-delay: -1.1s;
	}
`;
const SkCircle3 = styled(SkChild)`
	transform: rotate(60deg);
	:before {
		animation-delay: -1s;
	}
`;
const SkCircle4 = styled(SkChild)`
	transform: rotate(90deg);
	:before {
		animation-delay: -0.9s;
	}
`;
const SkCircle5 = styled(SkChild)`
	transform: rotate(120deg);
	:before {
		animation-delay: -0.8s;
	}
`;
const SkCircle6 = styled(SkChild)`
	transform: rotate(150deg);
	:before {
		animation-delay: -0.7s;
	}
`;
const SkCircle7 = styled(SkChild)`
	transform: rotate(180deg);
	:before {
		animation-delay: -0.6s;
	}
`;
const SkCircle8 = styled(SkChild)`
	transform: rotate(210deg);
	:before {
		animation-delay: -0.5s;
	}
`;
const SkCircle9 = styled(SkChild)`
	transform: rotate(240deg);
	:before {
		animation-delay: -0.4s;
	}
`;
const SkCircle10 = styled(SkChild)`
	transform: rotate(270deg);
	:before {
		animation-delay: -0.3s;
	}
`;
const SkCircle11 = styled(SkChild)`
	transform: rotate(300deg);
	:before {
		animation-delay: -0.2s;
	}
`;
const SkCircle12 = styled(SkChild)`
	transform: rotate(330deg);
	:before {
		animation-delay: -0.1s;
	}
`;

const StyledUnlockedContainer = styled.div``;

const Sa = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: ${theme.colours.white};
`;

const SaPlaceholder = styled.div`
	border-radius: 50%;
	border: 4px solid rgba(165, 220, 134, 0.25);
	box-sizing: content-box;
	height: 80px;
	left: -4px;
	position: absolute;
	top: -4px;
	width: 80px;
	z-index: 2;
`;

const SaSuccess = styled.div`
	border-radius: 50%;
	border: 4px solid #a5dc86;
	box-sizing: content-box;
	height: 80px;
	padding: 0;
	position: relative;
	background-color: ${theme.colours.white};
	width: 80px;
	&:after,
	&:before {
		background: ${theme.colours.white};
		content: "";
		height: 120px;
		position: absolute;
		transform: rotate(45deg);
		width: 60px;
	}
	&:before {
		border-radius: 40px 0 0 40px;
		width: 26px;
		height: 80px;
		top: -17px;
		left: 5px;
		transform-origin: 60px 60px;
		transform: rotate(-45deg);
	}
	&:after {
		border-radius: 0 120px 120px 0;
		left: 30px;
		top: -11px;
		transform-origin: 0 60px;
		transform: rotate(-45deg);
		animation: rotatePlaceholder 4.25s ease-in;
	}
`;

const SaFix = styled.div`
	background-color: ${theme.colours.white};
	height: 90px;
	left: 28px;
	position: absolute;
	top: 8px;
	transform: rotate(-45deg);
	width: 5px;
	z-index: 1;
`;

const SaTip = styled.div`
	background-color: ${theme.colours.bgSaSuccess};
	border-radius: 2px;
	height: 5px;
	position: absolute;
	z-index: 2;
	left: 14px;
	top: 46px;
	transform: rotate(45deg);
	width: 25px;
	animation: animateSuccessTip 0.75s;
`;

const SaLong = styled.div`
	background-color: ${theme.colours.bgSaSuccess};
	border-radius: 2px;
	height: 5px;
	position: absolute;
	z-index: 2;
	right: 8px;
	top: 38px;
	transform: rotate(-45deg);
	width: 47px;
	animation: animateSuccessLong 0.75s;
`;

const StyledSuccess = styled.div`
	@keyframes animateSuccessTip {
		0%,
		54% {
			width: 0;
			left: 1px;
			top: 19px;
		}
		70% {
			width: 50px;
			left: -8px;
			top: 37px;
		}
		84% {
			width: 17px;
			left: 21px;
			top: 48px;
		}
		100% {
			width: 25px;
			left: 14px;
			top: 45px;
		}
	}
	@keyframes animateSuccessLong {
		0%,
		65% {
			width: 0;
			right: 46px;
			top: 54px;
		}
		84% {
			width: 55px;
			right: 0;
			top: 35px;
		}
		100% {
			width: 47px;
			right: 8px;
			top: 38px;
		}
	}
	@keyframes rotatePlaceholder {
		0%,
		5% {
			transform: rotate(-45deg);
		}
		100%,
		12% {
			transform: rotate(-405deg);
		}
	}
`;

const IconWrapper = styled.div`
	color: ${(p) => (p.color ? p.color : theme.colours.black)};
	i {
		font-size: ${(p) => (p.iconSize ? p.iconSize : "6em")};
		@media screen and (max-width: ${theme.breakpoints.mobile}) {
			font-size: ${(p) => (p.iconSize !== "6em" ? "10em" : "6em")};
		}
	}
`;

const IconWithEvent = styled.i`
	cursor: pointer;
`;

const Icon = styled.i`
	pointer-events: none;
`;

const ConfirmMessageUl = styled.ul`
	margin-top: 0.5rem;
	margin-bottom: 0.5rem;
`;

const WrapTempUnlockMessage = styled.div`
	width: 100%;
`;

export default function BarcodeSection(props) {
	let showMessageForTempUnlock = null;
	if (props.isTemp) {
		if (
			props.unlockStatus == null ||
			props.unlockStatus === staticValues.unlockAttemptStatus.tempUnlockedMustConfirm ||
			props.unlockStatus === staticValues.unlockAttemptStatus.alreadyUnlocked
		) {
			showMessageForTempUnlock = (
				<>
					<span>If you don't have the book with you, you can still unlock it if:</span>
					<ConfirmMessageUl>
						<li>You confirm that a copy is owned by your institution</li>
					</ConfirmMessageUl>
					<span>
						CLA reserves the right to require your institution to provide additional evidence of ownership, which may include a visit to ensure
						compliance with the terms of the Education Licence.
					</span>
				</>
			);
		} else if (props.unlockStatus === staticValues.unlockAttemptStatus.tempUnlockedExpired) {
			showMessageForTempUnlock = (
				<IconWrapper color={props.iconColor} iconSize={"15em"}>
					<Icon className="fa fa-exclamation-circle"></Icon>
				</IconWrapper>
			);
		} else if (props.unlockStatus === staticValues.unlockAttemptStatus.notOwnedBySchool) {
			showMessageForTempUnlock = (
				<>
					<span>
						<b>Thank you</b> for letting us know.
					</span>
					<br />
					<br />
					<span>Unfortunately, you can only make a copy from a book that is owned by your institution.</span>
				</>
			);
		} else if (props.unlockStatus === staticValues.unlockAttemptStatus.tempUnlocked) {
			showMessageForTempUnlock = (
				<>
					<span>
						<b>Thank you</b> for letting us know.
					</span>
					<br />
					<br />
					<span>
						You can now make copies from this title. It will be unlocked for 14 days but must be unlocked using the physical book if you want to
						retain access to it and any copies from it you create using the Platform.
					</span>
				</>
			);
		} else {
			showMessageForTempUnlock = null;
		}
	}

	return (
		<BarcodeArea ref={props.barCodeCameraRef}>
			<BarcodeAreaOne>
				{props.show && !props.waiting ? (
					showMessageForTempUnlock ? (
						<ButtonWrap bgColor={theme.colours.white}>
							<WrapTempUnlockMessage>{showMessageForTempUnlock}</WrapTempUnlockMessage>
						</ButtonWrap>
					) : (
						<ButtonWrap bgColor={props.iconClass == "fa fa-camera" ? theme.colours.black : theme.colours.white}>
							<IconWrapper color={props.iconColor} iconSize={props.iconClass === "fa fa-camera" ? "6em" : "15em"}>
								{props.iconClass == "fa fa-camera" ? (
									<>
										<IconWithEvent className={props.iconClass} onClick={props.showStartButton}></IconWithEvent>
										<StartButton onClick={props.showStartButton} color={props.iconColor}>
											Activate Camera
										</StartButton>
									</>
								) : props.iconClass ? (
									<Icon className={props.iconClass}></Icon>
								) : (
									<Icon className="fa fa-exclamation-circle"></Icon>
								)}
							</IconWrapper>
						</ButtonWrap>
					)
				) : (
					""
				)}
				{props.waiting ? (
					<StyledSpinnerContainer>
						<StyledSpinner>
							<Spinner>
								<SkCircle>
									<SkCircle2 />
									<SkCircle3 />
									<SkCircle4 />
									<SkCircle5 />
									<SkCircle6 />
									<SkCircle7 />
									<SkCircle8 />
									<SkCircle9 />
									<SkCircle10 />
									<SkCircle11 />
									<SkCircle12 />
								</SkCircle>
							</Spinner>
						</StyledSpinner>
					</StyledSpinnerContainer>
				) : (
					""
				)}

				<Interactive className="quagga-target" notFound={props.notFound || props.waiting || props.unlocked || props.show}></Interactive>

				{/* {(props.unlocked || props.didCaputre) ?
					<StyledUnlockedContainer>
						<StyledSuccess>
							<Sa>
								<SaSuccess>
									<SaTip />
									<SaLong />
									<SaPlaceholder />
									<SaFix />
								</SaSuccess>
							</Sa>
						</StyledSuccess>
					</StyledUnlockedContainer> : ''} */}
			</BarcodeAreaOne>
		</BarcodeArea>
	);
}
