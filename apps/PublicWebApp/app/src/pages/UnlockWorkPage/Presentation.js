import React from "react";
import Header from "../../widgets/Header";
import { Redirect } from "react-router-dom";
import Overview from "./Overview";
import flyOutGuide from "./flyOutGuide";
import FlyOutModal from "../../widgets/FlyOutModal";
import Flyout from "../../widgets/Flyout";

const FLYOUT_DEFAULT_INDEX = -1; //Default Index -1
const FLYOUT_SECOND_INDEX = 0; // Index after first modal close
const FLYOUT_DEFAULT_NOTIFICATION = -1; // default notification index
const NOTIFICATION_COUNT_DEFAULT = 0; // default notification count
const JUMP_TO_CONTENT_ID = "main-content";
/**
 * Presentation component for UnlockWorkPage
 * @param {object} props Passed props
 */
export default function Presentation(props) {
	const { unlocked, response, redirect, unlockedTitle } = props;
	let isbnTitle;
	if (unlockedTitle && unlockedTitle.isbn && unlockedTitle.title) {
		isbnTitle = unlockedTitle.isbn + "-" + unlockedTitle.title.replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase();
	}

	if (redirect) {
		return <Redirect to={`/works/${isbnTitle}`} />;
	}

	if (!unlocked && !response) {
		let flyOutSection = null;

		if (props.myUserDetails && props.myUserDetails.flyout_enabled) {
			let closing =
				props.flyOutIndexNotification === FLYOUT_DEFAULT_NOTIFICATION && props.notificationCount > NOTIFICATION_COUNT_DEFAULT ? false : true;
			if (props.flyOutIndex === FLYOUT_DEFAULT_INDEX) {
				flyOutSection = (
					<FlyOutModal
						key={-1}
						buttonText={flyOutGuide.buttonText}
						handleShowMe={props.onCloseModal}
						title={flyOutGuide.popupTitle}
						subTitle={flyOutGuide.popupSubTitle}
						closeBackgroundImmediately={closing}
					/>
				);
			}
			if (
				props.flyOutIndex === FLYOUT_SECOND_INDEX &&
				props.flyOutIndexNotification === FLYOUT_DEFAULT_NOTIFICATION &&
				props.notificationCount > NOTIFICATION_COUNT_DEFAULT
			) {
				flyOutSection = (
					<Flyout width={350} height={110} onClose={props.onClose} target={props.notificationRef} side_preference={"bottom"}>
						{flyOutGuide.flyOutNotification}
					</Flyout>
				);
			}
		}

		return (
			<>
				<Header
					flyOutIndexNotification={props.flyOutIndexNotification}
					setNotificationCount={props.setNotificationCount}
					onClose={props.onClose}
					notificationRef={props.notificationRef}
					hide_search={false}
					jumpToContentId={JUMP_TO_CONTENT_ID}
				/>
				<Overview isbnTitle={isbnTitle} {...props} id={JUMP_TO_CONTENT_ID} />
				{flyOutSection}
			</>
		);
	}

	/** Not redirect to work page */
	// if (response === 'Asset already unlocked') {
	// 	return (
	// 		<Redirect
	// 			to={`/works/${isbnTitle}`} />
	// 	);
	// }

	if (unlocked) {
		return (
			<>
				<Header hide_search={false} jumpToContentId={JUMP_TO_CONTENT_ID} />
				<Overview isbnTitle={isbnTitle} {...props} id={JUMP_TO_CONTENT_ID} />
			</>
		);
	}

	/** Note: I belive that it would be in else condition of the unlocked condition */
	return (
		<>
			<Header hide_search={false} jumpToContentId={JUMP_TO_CONTENT_ID} />
			<Overview isbnTitle={isbnTitle} {...props} id={JUMP_TO_CONTENT_ID} />
		</>
	);
}
