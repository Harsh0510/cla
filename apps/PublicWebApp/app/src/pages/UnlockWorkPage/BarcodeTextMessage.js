import React from "react";
import styled from "styled-components";
import messageType from "../../common/messageType";
import MessageBox from "../../widgets/MessageBox";
import HelpLink from "./HelpLink";
import theme from "../../common/theme";
import staticValues from "../../common/staticValues";
import { Row } from "../../widgets/Layout/Row";
import { ButtonSmallWithIcon } from "../../widgets/Layout/ButtonSmallWithIcon";
import { WrapSmallButton } from "../../widgets/Layout/WrapSmallButton";

const MESSAGE = {
	successfullyUnlocked: "Successfully unlocked!",
	alreadyUnlocked: "This book was already unlocked for your institution on the Education Platform",
	didCaputre: "Thank you! We have sent this to our automatic barcode detector and we will notify you if it can be unlocked.",
	waitingForPermission: "Please allow CLA Education Platform to access the camera.",
};

const DisplayMessage = styled.div`
	color: ${theme.colours.white};
	background-color: ${(p) => (p.bgColor ? p.bgColor : theme.colours.lightRed)};
	padding: 1em;
	border-radius: 10px;
	font-size: 18px;
	text-align: center;
	a {
		color: ${theme.colours.white} !important;
		font-weight: bolder;
		cursor: pointer;
	}
`;

const WrapperButtonSection = styled(Row)`
	margin-top: 15px;
	justify-content: center;
`;
const Span = styled.span`
	vertical-align: middle;
	text-decoration: underline;
	color: ${theme.colours.primary};
	:hover {
		cursor: pointer;
	}
`;

export default function BarcodeTextMessage(props) {
	let message = null,
		title = null;

	if (props.isTemp) {
		if (props.unlockStatus === staticValues.unlockAttemptStatus.tempUnlockedMustConfirm) {
			title = "";
			message = (
				<div>
					I confirm that the book,
					<br /> <em>{props.unlockedTitle.title}</em> with ISBN {props.resultCode} is owned by {props.school} and I can temporarily add it to the
					Education Platform.
					<br />I understand I will need to unlock this title with a physical copy of the book within 14 days to retain access to it and any copies
					from it I create using the Platform.
				</div>
			);
			return (
				<>
					<MessageBox type={messageType.confirmed} title={title} message={message} displayIcon={false} />
					<WrapperButtonSection>
						<WrapSmallButton isPaddingRight={true}>
							<ButtonSmallWithIcon onClick={props.onConfirmOwnsAssetForTempUnlock} iconColor={theme.colours.lightGreen}>
								Yes <i className="fa fa-check" aria-hidden="true"></i>
							</ButtonSmallWithIcon>
						</WrapSmallButton>
						<WrapSmallButton isPaddingRight={true}>
							<ButtonSmallWithIcon onClick={props.onDenyOwnsAssetForTempUnlock} iconColor={theme.colours.lightRed}>
								No <i className="fa fa-times" aria-hidden="true"></i>
							</ButtonSmallWithIcon>
						</WrapSmallButton>
					</WrapperButtonSection>
				</>
			);
		} else if (props.unlockStatus === staticValues.unlockAttemptStatus.tempUnlockedExpired) {
			title = "";
			message = (
				<div>
					It looks like that book ({props.resultCode}) had already been temporarily unlocked this year by a user within your institution. Please
					unlock the book using the physical copy to gain access to it.
				</div>
			);
			return <MessageBox type={messageType.confirmed} title={title} message={message} displayIcon={false} />;
		} else if (props.unlockStatus === staticValues.unlockAttemptStatus.alreadyUnlocked) {
			title = "";
			message = <div>{MESSAGE.alreadyUnlocked}</div>;
			return (
				<>
					<DisplayMessage bgColor={theme.colours.primary}>{message}</DisplayMessage>
				</>
			);
		} else if (props.unlockStatus === staticValues.unlockAttemptStatus.successfullyUnlocked) {
			title = "";
			message = <div>{MESSAGE.successfullyUnlocked}</div>;
			return (
				<>
					<DisplayMessage bgColor={theme.colours.primary}>{message}</DisplayMessage>
				</>
			);
		}
	} else {
		if (props.waiting) {
			title = "Waiting for permission";
			message = (
				<div>
					{MESSAGE.waitingForPermission} <HelpLink title="Need help?" link="/faq" isInfoIcon={true} />
				</div>
			);
			return <MessageBox type={messageType.warning} title={title} message={message} displayIcon={false} />;
		} else if (props.unlockStatus === staticValues.unlockAttemptStatus.doesNotExist) {
			title = "";
			message = (
				<div>
					<>
						It looks like that book ({props.resultCode ? props.resultCode : ""}) either isn't on the Education Platform, or isn't available for
						temporary unlocking. But don't worry, we've logged this and will unlock it if it becomes available.
						<br />
						<Span onClick={props.openContentRequestModal}>Tell us about it</Span>
					</>
				</div>
			);
			return (
				<>
					<DisplayMessage bgColor={props.iconColor}>{message}</DisplayMessage>
				</>
			);
		} else if (props.didCaputre) {
			title = "";
			message = MESSAGE.didCaputre;
			return <MessageBox type={messageType.success} title={title} message={message} displayIcon={false} />;
		} else if (props.unlocked) {
			title = "";
			if (props.unlockStatus === staticValues.unlockAttemptStatus.successfullyUnlocked) {
				message = <div>{MESSAGE.successfullyUnlocked}</div>;
				return (
					<>
						<DisplayMessage bgColor={theme.colours.primary}>{message}</DisplayMessage>
					</>
				);
			} else if (props.unlockStatus === staticValues.unlockAttemptStatus.alreadyUnlocked) {
				message = <div>{MESSAGE.alreadyUnlocked}</div>;
				return (
					<>
						<DisplayMessage bgColor={theme.colours.primary}>{message}</DisplayMessage>
					</>
				);
			}
		} else {
			if (props.message !== "") {
				title = "";
				message = <div>{props.message}</div>;
				return (
					<>
						<DisplayMessage bgColor={props.iconColor}>{message}</DisplayMessage>
					</>
				);
			}
		}
	}
	return null;
}
