import React, { Component } from "react";
import styled, { css } from "styled-components";
import { Link } from "react-router-dom";
import theme from "../../common/theme";
import date from "../../common/date";
import notificationLinks from "../../common/notificationLinks";

const NotificationLinkItem = styled.li`
	display: flex;
	align-items: center;
	padding: 10px;
	:not(:last-child) {
		margin-bottom: 0em;
	}
	background-color: ${(p) => (p.isBgReq && !p.hasRead ? theme.colours.signInBackGround : theme.colours.lime)};
`;

const NotificationItemLink = styled(Link)`
	display: inline-block;
	vertical-align: middle;
	max-width: 155px;
	text-align: left;
`;

const NotificationDuration = styled.label`
	padding-right: 5px;
	margin-bottom: 0;
`;

const NotificationSubMenuDropdown = styled.i`
	padding: 0.5rem;
	font-size: 22px;
`;

const NotificationSubMenu = styled.ul`
	position: absolute;
	right: 85%;
	background: ${theme.colours.primaryLight};
	list-style: none;
	text-align: left;
	padding: 6px;
	color: ${theme.colours.white};
	top: -20%;
	font-size: 14px;
	min-width: 140px;
	z-index: 1;
	${(p) =>
		!p.isDisplay &&
		css`
			display: none;
		`}
	li {
		cursor: pointer;
	}
`;

const NotificationCategory = styled.div`
	font-weight: bold;
	overflow: hidden;
	display: block;
`;

const NotificationTitle = styled.div`
	font-size: 85%;
	line-height: 1.2;
`;

const SubmenuDropDown = styled.span`
	cursor: pointer;
	position: relative;
`;

const NotificationStatusIcon = styled.span`
	cursor: pointer;
	padding-left: 0.25rem;
`;

const NotificationDurationWrap = styled.span`
	position: relative;
	margin-left: auto;
`;

class NotificationItem extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isOpen: false,
		};
	}

	render() {
		const { notif } = this.props;
		const notificationTitle = notif.title ? (notif.title.length > 40 ? notif.title.substr(0, 40) + "..." : notif.title) : "";
		const notificationSubTitle = notif.subtitle ? (notif.subtitle.length > 40 ? notif.subtitle.substr(0, 40) + "..." : notif.subtitle) : "";

		/* --- Create Link --- */
		let notificationLink;
		if (notif.link.static) {
			notificationLink = notif.link.value;
		} else {
			notificationLink = notificationLinks[notif.link.type] ? notificationLinks[notif.link.type].url : "/";
			if (notif.link.value) {
				notificationLink += "?query=" + encodeURIComponent(notif.link.value);
			}
		}

		/*--- On Hover Description ---*/
		const notificationHoverData = notif.title + " - " + (notif.description || notif.subtitle);

		/* --- Time Duration --- */
		let timeDuration = date.timeDifferences(notif.date_created);
		let timeDiff;
		if (timeDuration.weekDiff) {
			timeDiff = timeDuration.weekDiff + "w";
		} else if (timeDuration.dayDiff) {
			timeDiff = timeDuration.dayDiff + "d";
		} else if (timeDuration.hourDiff) {
			timeDiff = timeDuration.hourDiff + "h";
		} else if (timeDuration.minuteDiff) {
			timeDiff = timeDuration.minuteDiff + "m";
		} else {
			timeDiff = "< 1m";
		}

		return (
			<NotificationLinkItem isBgReq={true} hasRead={notif.has_read} title={notificationHoverData}>
				<NotificationItemLink
					to={notificationLink}
					onClick={() => {
						this.props.onToggleNotification(true, notif, false);
					}}
				>
					<NotificationCategory>{notificationTitle}</NotificationCategory>
					<NotificationTitle>{notificationSubTitle}</NotificationTitle>
				</NotificationItemLink>
				<NotificationDurationWrap className="custom-radio">
					<NotificationDuration className="custom-control-label" hasRead={notif.has_read}>
						{timeDiff}
						<NotificationStatusIcon
							onClick={() => {
								this.props.onToggleNotification(!notif.has_read, notif, true);
							}}
						>
							<i className={notif.has_read ? "far fa-dot-circle" : "far fa-circle"} />
						</NotificationStatusIcon>
					</NotificationDuration>
				</NotificationDurationWrap>
				<SubmenuDropDown className="dropdown">
					<NotificationSubMenuDropdown
						className="fal fa-ellipsis-v"
						onClick={() => {
							this.props.onToggleNotificationItem(notif.oid);
						}}
					></NotificationSubMenuDropdown>
					<NotificationSubMenu isDisplay={this.props.openNotificationOid === notif.oid}>
						<li
							onClick={(e) => {
								this.props.onDeleteNotification(notif.oid);
							}}
						>
							Delete
						</li>
						{notif.hideable_log ? (
							<li
								onClick={(e) => {
									this.props.onDeleteNotification(0, notif.category_id);
								}}
							>
								Don't Show Again
							</li>
						) : (
							""
						)}
					</NotificationSubMenu>
				</SubmenuDropDown>
			</NotificationLinkItem>
		);
	}
}

export default NotificationItem;
