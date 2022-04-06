import React, { Component } from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import NotificationItem from "./NotificationItem";
import { Link } from "react-router-dom";

const NotificatoinTitleArea = styled.div`
	min-height: 40px;
	text-align: left;
	color: ${theme.colours.white};
	background: #257281;
	position: relative;
	display: flex;
	align-items: center;
	padding-left: 10px;
	font-weight: bold;
	height: 40px;
`;

const Notificationmenu = styled.div`
	position: absolute;
	top: 100%;
	margin-top: 15px;
	right: -10px;
	background: ${theme.colours.signInBackGround};
	color: ${theme.colours.bgDarkPurple};
	box-shadow: ${theme.shadow};
	border-radius: 3px;
	min-width: 269px;
	width: 100%;
	padding: 0;
	display: ${(props) => (props.open ? "block" : "none")};
	z-index: 600;
	@media screen and (max-width: ${theme.breakpoints.tabletPro}) {
		margin-top: 0;
		right: 10px;
	}
`;

const NavigationMenuList = styled.ul`
	padding: 0;
	margin-bottom: 0;
	overflow-y: auto;
	max-height: calc(100vh - 250px);
`;

const ShowAllNotification = styled.li`
	text-align: left;
	text-decoration: underline;
	color: ${theme.colours.primary};
	cursor: pointer;
	padding: 10px;
`;

class Notification extends Component {
	notificationItems = () => {
		let NotifItems = null;
		if (this.props.notifications.length) {
			NotifItems = this.props.notifications.map((notif) => {
				return (
					<NotificationItem
						onToggleNotification={this.props.onToggleNotification}
						notif={notif}
						key={notif.oid}
						onDeleteNotification={this.props.onDeleteNotification}
						openNotificationOid={this.props.openNotificationOid}
						onToggleNotificationItem={this.props.onToggleNotificationItem}
					/>
				);
			});
		}
		return NotifItems;
	};

	render() {
		return (
			<>
				<Notificationmenu open={this.props.open} onClick={this.props.onOutsideDropdownClick}>
					<NotificatoinTitleArea>Notifications</NotificatoinTitleArea>
					<NavigationMenuList>
						{this.notificationItems()}
						<ShowAllNotification>
							<Link to="/see-all-notifications">Show all Notifications</Link>
						</ShowAllNotification>
					</NavigationMenuList>
				</Notificationmenu>
			</>
		);
	}
}

export default Notification;
