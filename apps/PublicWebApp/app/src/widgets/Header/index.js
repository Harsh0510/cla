import React from "react";
import styled, { css } from "styled-components";
import withAuthConsumer from "../../common/withAuthConsumer";
import { withRouter, Link } from "react-router-dom";
import HeaderSearch from "../../widgets/HeaderSearch";
import theme from "../../common/theme";
import UserRole from "../../common/UserRole";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCaretDown, faCaretUp, faUserTie } from "@fortawesome/free-solid-svg-icons";
import { SendRequestHelpRaw } from "../../widgets/SendEmailLink";
import { withResizeDetector } from "react-resize-detector/build/withPolyfill";
import withApiConsumer from "../../common/withApiConsumer";
import Notification from "../Notification";
import notificationLimitCounter from "../../../../../Controller/app/common/notificationLimitCounter";
import staticValues from "../../common/staticValues";
import withEventEmitterConsumer from "../../common/EventEmitter/withEventEmitterConsumer";
import notificationNeedToBeUpdate from "../../common/EventEmitter/events/notificationNeedToBeUpdate/index";
import constants from "../../common/EventEmitter/events/notificationNeedToBeUpdate/constants";
import FlyOutHandler from "../../common/FlyOutHandler";
import IntentToCopyForm from "../../widgets/IntentToCopyForm";
import reactCreateRef from "../../common/reactCreateRef";

library.add(faCaretDown, faCaretUp, faUserTie);
const INTERVAL_TIME = parseInt(staticValues.NotificationIntervalTime, 10);

const Hamburger = styled.div`
	display: inline-block;
	color: ${theme.colours.white};
	cursor: pointer;
	vertical-align: middle;
	background-color: transparent;
	margin-left: 20px;
	width: 22px;
	i {
		font-size: 1.8em;
		font-weight: normal;
		@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
			font-size: 18px;
		}
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		margin-left: 16px;
		width: 15px;
	}
`;

const MobileScreen = styled.div`
	display: flex;
	width: 100%;
`;

//Set z-index as 301, which overlay the menu for all component
const AccountMenu = styled.div`
	position: absolute;
	top: 100%;
	margin-top: 15px;
	right: 0;
	background: ${theme.colours.signInBackGround};
	color: ${theme.colours.bgDarkPurple};
	box-shadow: ${theme.shadow};
	border-radius: 3px;
	min-width: 235px;
	width: 100%;
	padding: 2em 2em 1em;
	display: ${(props) => (props.open ? "block" : "none")};
	z-index: 599;
`;

const AccountInfo = styled.div`
	position: relative;
`;

const AccountMenuList = styled.ul`
	display: flex;
	flex-direction: column;
	list-style: none;
	margin: 0;
	padding: 0;
`;

const AccountMenuItem = styled.li`
	color: ${theme.colours.white};
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	:not(:last-child) {
		margin-bottom: 1em;
	}
	${(p) =>
		p.isBgReq &&
		!p.hasRead &&
		`
		background-color : #fff
	`}
`;

const AccountMenuItemSignOut = styled(AccountMenuItem)`
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		display: flex;
	}
`;

const AccountMenuLink = styled(Link)`
	text-decoration: none;
	font-style: normal;
	color: ${theme.colours.bgDarkPurple};
`;

const AccountMenuOpen = styled.div`
	text-decoration: none;
`;

const AccountMenuOpenLinkIcon = styled.span`
	text-decoration: none;
	padding: 0em 0.5em 0em 0.2em;
	cursor: pointer;
	a {
		color: ${theme.colours.white};
	}
	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		padding: 0em 0.3em 0.1em 0.5em;
	}
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		display: inline-block;
	}
`;

const WrapperContainer = styled.div`
	max-width: 1500px;
	width: 100%;
	margin: 0 auto;
	/*padding: 0 15px;*/
	justify-content: center;
	display: flex;
	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		display: flex;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding: 0 0 0 15px;
	}

	position: relative;
`;

const WrapperHeader = styled.header`
	display: flex;
	flex-wrap: wrap;
	background-color: ${(p) => (p.backgroundColor ? p.backgroundColor : theme.colours.primary)};
	color: ${theme.colours.white};
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		padding-bottom: 0;
	}
`;

const BrandIconLeftSection = styled.div`
	align-self: flex-end;
	font-size: 17px;
	min-width: 325px;
	padding: 15px 25px;
	a:hover {
		color: ${theme.colours.white};
	}

	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		min-width: 0;
	}

	@media screen and (max-width: ${theme.breakpoints.tabletPro}) {
		min-width: 0;
	}
`;

const MobileBrandIconLeftSection = styled.div`
	align-self: flex-end;
	width: 75%;
	font-size: 14px;
	font-weight: bold;
	min-width: 325px;
	padding: 0px 0px 15px 15px;
	a {
		text-decoration: none;
	}
	a:hover {
		color: ${theme.colours.white};
	}

	@media screen and (max-width: ${theme.breakpoints.tabletPro}) {
		min-width: 0;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding: 0px 0px 15px 0px;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		padding: 0px 0px 12px 0px;
		width: 74%;
		font-size: 13px;
	}
`;

const HeaderLoginSection = styled.div`
	margin-left: auto;
	text-align: right;
	background-color: ${theme.colours.primaryLight};
	position: relative;
	padding: 15px 25px;
	font-size: 16px;
	color: ${theme.colours.white};
	flex-grow: 1;
	:before,
	:after {
		content: "";
		display: inline-block;
		position: absolute;
		top: 0;
		left: 0;
		border-top: 55px solid ${theme.colours.primary};
		border-right: 16px solid transparent;
		z-index: 1;
	}

	:after {
		right: -16px;
		left: auto;
		border-top: 55px solid ${theme.colours.primaryLight};
	}
	ul {
		margin-top: 1px;
	}

	ul li {
		padding-right: 1em;
		margin-top: 1px;
	}
`;

const MobileHeaderLoginSection = styled.div`
	margin-left: auto;
	flex-grow: 1;
	text-align: right;
	width: 25%;
	background-color: ${theme.colours.primaryLight};
	position: relative;
	padding: 10px 20px;
	font-size: 14px;
	color: ${theme.colours.white};
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		width: 26%;
		padding: 10px 15px 10px 0;
	}
	:before,
	:after {
		content: "";
		display: inline-block;
		position: absolute;
		top: 0;
		left: 0;
		border-top: 47px solid ${theme.colours.primary};
		border-right: 16px solid transparent;
		z-index: 1;
		@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
			display: none;
		}
	}

	:after {
		right: -16px;
		left: auto;
		border-top: 46px solid ${theme.colours.primaryLight};
		background: ${theme.colours.primaryLight};
	}

	/* --- 2em ---- */
	ul li {
		padding-right: 0;
	}
`;

const Navigation = styled.nav`
	justify-content: flex-end;
	display: none;
	position: absolute;
	z-index: 599;
	min-height: 297px;
	top: 45px;
	left: 0;
	width: 100%;
	padding: 1px 0em 0em;
	letter-spacing: 0.05em;
	background-color: ${theme.colours.primaryLight};
	margin-bottom: 0;
	padding-left: 0;
	list-style: none;

	${(props) =>
		props.open &&
		css`
			display: block;
		`}
`;

const NavList = styled.ul`
	margin: 0;
	padding: 2em;
	width: 100%;

	li {
		display: block;
		line-height: 2;
		font-weight: bold;
	}

	li i {
		width: 16px;
		display: inline-block;
		margin-right: 10px;
	}
	li span {
		font-size: 17px;
		padding-bottom: 3px;
	}

	@media screen and (min-width: ${theme.breakpoints.tabletPro}+1) {
		padding: 0;
		display: flex;
		text-align: left;

		li {
			display: inline-block;
			margin: 0 2em;
		}
	}
`;

const SignInSection = styled.div`
	align-items: center;
	justify-content: center;
	display: flex;
	position: relative;

	:after {
		content: "";
		display: inline-block;
		position: absolute;
		top: 1px;
		right: 0;
		border-top: 55px solid ${theme.colours.primary};
		border-right: 16px solid transparent;
		z-index: 1;
		transform: rotate(180deg);
		@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
			max-width: 280px;
		}
	}
	background: ${theme.colours.signInBackGround};
	color: ${theme.colours.bgDarkPurple};
	padding: 0 25px;
	text-align: center;
	min-width: 249px;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		width: 90px;
		padding-left: 10px;
		:after {
			top: 0px;
		}
	}

	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		max-width: 275px;
		padding: 0 15px;
	}
`;

const MobileSignInSection = styled.div`
	display: flex;
	align-items: center;
	position: relative;

	:after {
		content: "";
		display: inline-block;
		position: absolute;
		top: 1px;
		right: 0;
		border-right: 16px solid transparent;
		z-index: 999;
		transform: rotate(180deg);
	}
	div {
		width: 100%;
	}
	background: ${theme.colours.signInBackGround};
	color: ${theme.colours.bgDarkPurple};
	padding: 1.5em 0em 1.5em 39px;
	i {
		width: 16px;
		display: inline-block;
		margin-right: 10px;
	}
	-webkit-box-shadow: 0 3px 3px 0 rgba(0, 0, 0, 0.3);
	-moz-box-shadow: 0 3px 3px 0 rgba(0, 0, 0, 0.3);
	box-shadow: 0 3px 3px 0 rgba(0, 0, 0, 0.3);
`;

const MobileAccountSection = styled(MobileSignInSection)`
	padding: 0px 0px 0px;
	justify-content: center;
	display: flex;
	align-items: center;
	position: relative;
`;

const AnchorLink = styled(Link)`
	background: transparent;
	text-decoration: none;
	:hover {
		color: ${theme.colours.white};
	}
`;
const BlogLink = styled.a`
	background: transparent;
	text-decoration: none !important;
	:hover {
		color: ${theme.colours.white};
	}
	:visited {
		color: ${theme.colours.white};
	}
`;

const LoginLink = styled(AnchorLink)`
	color: ${theme.colours.bgDarkPurple};
	:hover {
		color: ${theme.colours.primary};
	}

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		font-weight: 600;
	}
`;

const ProfileName = styled.span`
	display: inline-block;
	vertical-align: middle;
	max-width: 400px;
	cursor: pointer;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	max-width: 250px;
	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		max-width: 170px;
		i {
			padding: 0 5px;
		}
	}
	@media screen and (max-width: ${theme.breakpoints.tabletPro}) {
		max-width: 150px;
	}
`;

const MobProfileName = styled.span`
	display: inline-block;
	vertical-align: middle;
	max-width: 99%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	max-width: 250px;
	@media screen and (max-width: ${theme.breakpoints.tabletPro}) {
		max-width: 150px;
	}
`;

const MobAccountMenuLink = styled(Link)`
	text-decoration: none;
`;

const NotificationSection = styled.span``;

const NotificationBellIcon = styled.i`
	margin-left: 10px;
	font-size: 20px;
	cursor: pointer;
	transform: translateY(2px);
	${(p) =>
		p.showJiggle === true &&
		css`
			animation: bell3 1s ease-in-out 1s both infinite;
			backface-visibility: hidden;
			transform-origin: top center;
			@keyframes bell3 {
				0% {
					transform: rotate(0);
				}
				6% {
					transform: rotate(12deg);
				}
				12% {
					transform: rotate(0);
				}
				18% {
					transform: rotate(-12deg);
				}
				24% {
					transform: rotate(0);
				}
				29% {
					transform: rotate(8deg);
				}
				34% {
					transform: rotate(0);
				}
				39% {
					transform: rotate(-8deg);
				}
				44% {
					transform: rotate(0);
				}
				48% {
					transform: rotate(4deg);
				}
				52% {
					transform: rotate(0);
				}
				56% {
					transform: rotate(-4deg);
				}
				60% {
					transform: rotate(0);
				}
				100% {
					transform: rotate(0);
				}
			}
		`}
`;

const NotificationNumber = styled.span`
	position: absolute;
	font-size: 10px;
	background: #acb2b9;

	border-radius: 50%;
	width: 18px;
	height: 18px;
	line-height: 20px;
	left: 13px;
	top: -10px;
	text-align: center;
	cursor: pointer;
	${(p) =>
		p.showJiggle === true &&
		css`
			background: red;
			color: ${theme.colours.white};
		`};
	@media only screen and (max-width: ${theme.breakpoints.tabletPro}) {
		background: ${theme.colours.bgDarkPurple};
		${(p) =>
			p.showJiggle === true &&
			css`
				background: red;
				color: ${theme.colours.white};
			`};
	}
`;

const SkipContentLink = styled.a`
	background: ${theme.colours.white};
	color: ${theme.colours.primary};
	cursor: pointer;
	transform: translateY(-100%);
	transition: transform 0.3s;
	position: absolute;
	z-index: 1;
	padding: 10px 30px;
	border: 1px solid ${theme.colours.primary};
	text-decoration: underline;
	border-radius: 5px;
	:focus {
		transform: translateY(10%);
	}
`;

const EpLogo = styled.img`
	margin-right: 0.5rem;
`;

const BlogUl = styled.ul`
	margin-bottom: 0;
	justify-content: flex-end;
	padding-left: 0;
	list-style: none;
	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		display: flex;
	}
`;

const NotificationCountWrap = styled.span`
	position: relative;
`;

const ALink = styled.a`
	position: relative;
`;

const Icon = styled.i`
	margin-right: 0.25rem;
`;

const WrapHeaderLoginSection = styled.div`
	flex-wrap: wrap;
	display: flex;
	flex-grow: 1;
`;

const AccountMenuOpenLinkIconButton = styled.i`
	margin-left: 0.5rem;
`;

const NavTitle = styled.span`
	:hover {
		text-decoration: underline;
	}
`;

const getSignInUrl = () => {
	if (window.location.pathname === "/sign-in") {
		return "/sign-in";
	}
	return "/sign-in?backurl=" + encodeURIComponent(window.location.pathname + window.location.search);
};

export default withEventEmitterConsumer(
	withApiConsumer(
		withAuthConsumer(
			withResizeDetector(
				withRouter(
					class Header extends React.PureComponent {
						_isMounted = false;
						state = {
							menuOpen: false,
							scrolled: false,
							accountMenuOpen: false,
							notifications: [],
							showNotifications: false,
							notificationCount: 0,
							notificationCountText: "0",
							showNotificationsIcon: false,
							lastCountFetchedTime: 0,
							lastListFetchedTime: 0,
							showAllNotification: false,
							openNotificationOid: null,
							notificationHigPriorityCount: 0,
							showIntentToCopyForm: false,
							currentNotif: null,
							reviewCopyCount: 0,
						};
						notificationNodeRef = reactCreateRef();
						nodeRef = reactCreateRef();

						componentDidMount() {
							this._isMounted = true;
							this._flyOutHandlerNotification = new FlyOutHandler(this, this.props.api, "notification");
							window.addEventListener("scroll", this.onScroll);
							if (this.props.withAuthConsumer_myUserDetails) {
								this.setState(
									{
										showNotificationsIcon: true,
									},
									() => {
										this.getNotificationCount();
										this.notificationCountTimer();
										this.getAllNotificationTimer();
										this.getReviewCopyCount();
									}
								);
							}
							this.props.eventEmitter_on(notificationNeedToBeUpdate, this.onEmit);
						}

						onScroll = () => {
							const scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
							if (scrollPos > 10) {
								if (this.state.scrolled !== true) {
									this.setState({ scrolled: true });
								}
							} else {
								if (this.state.scrolled) {
									this.setState({ scrolled: false });
								}
							}
						};

						notificationCountTimer = () => {
							this.notificationCountInterval = setInterval(() => {
								if (!this.state.showNotifications) {
									this.getNotificationCount();
								}
							}, INTERVAL_TIME);
						};

						getAllNotificationTimer = () => {
							this.allNotificatioInterval = setInterval(() => {
								if (this.state.showNotifications) {
									this.getAllNotifications();
								}
							}, INTERVAL_TIME);
						};

						clearTimer = (id) => {
							clearInterval(id);
						};

						getNotificationCount = () => {
							this.props
								.api("/auth/get-notification", {
									getCount: true,
								})
								.then((res) => {
									if (!this._isMounted) {
										return;
									}
									const notificationCount = parseInt(res.unread_count, 10);
									const notificationHigPriorityCount = parseInt(res.high_priority_count, 10);
									if (typeof this.props.setNotificationCount === "function") {
										this.props.setNotificationCount(notificationCount);
									}
									this.setState({
										notificationCount: notificationCount,
										notificationCountText:
											notificationCount < notificationLimitCounter.limit ? notificationCount : notificationLimitCounter.limit + "+",
										lastListFetchedTime:
											notificationCount !== this.state.notificationCount || notificationHigPriorityCount !== this.state.notificationHigPriorityCount
												? 0
												: this.state.lastListFetchedTime,
										notificationHigPriorityCount: notificationHigPriorityCount,
									});
								})
								.catch((err) => {});
						};

						getAllNotifications = async () => {
							await this.props
								.api("/auth/get-notification", {
									showAll: this.state.showAllNotification,
								})
								.then((result) => {
									if (!this._isMounted) {
										return;
									}
									const res = result.data;
									const unread_count = parseInt(result.unread_count, 10);
									const notificationHigPriorityCount = parseInt(result.high_priority_count, 10);
									if (res) {
										this.setState({
											notifications: res,
											notificationCount: unread_count,
											notificationCountText: unread_count < notificationLimitCounter.limit ? unread_count : notificationLimitCounter.limit + "+",
											showNotifications: res.length ? this.state.showNotifications : false,
											lastListFetchedTime: new Date().getTime(),
											isFirstRequestmade: true,
											notificationHigPriorityCount: notificationHigPriorityCount,
										});
									}
								})
								.catch((err) => {});
						};

						getReviewCopyCount = async () => {
							await this.props
								.api("/public/extract-get-review-count")
								.then((result) => {
									if (!this._isMounted) {
										return;
									}
									this.setState({
										reviewCopyCount: result.count,
									});
								})
								.catch((err) => {});
						};

						componentDidUpdate(prevProps, prevState) {
							if (prevProps.location.key !== this.props.location.key) {
								if (this.state.menuOpen === true) {
									this.toggleMenu();
								}
								/* Close Notification On moving to other page  */
								if (this.state.showNotifications === true) {
									this.setState(
										{
											showNotifications: false,
											openNotificationOid: null,
										},
										() => {
											/* Remove Event Litener on Page Change as the state is set from true to false, other wise it will take 2 clicks as this event is bind on document */
											document.removeEventListener("click", this.handleOutsideNotificationClick, false);
										}
									);
								}
							}

							if (!this.props.withAuthConsumer_myUserDetails) {
								if (this.notificationCountInterval) {
									this.clearTimer(this.notificationCountInterval);
								}
								if (this.allNotificatioInterval) {
									this.clearTimer(this.allNotificatioInterval);
								}
							}

							if (this.state.accountMenuOpen && prevState.accountMenuOpen != this.state.accountMenuOpen) {
								this.getReviewCopyCount();
							}
						}

						toggleMenu = () => {
							this.setState({ menuOpen: !this.state.menuOpen });
						};

						onAccountMenuOpen = (e) => {
							// TODO: fix everything please
							if (this.state.showNotifications) {
								this.toggleNotification(e);
							}
							if (window.innerWidth > parseInt(theme.breakpoints.tablet, 10)) {
								e.stopPropagation();
							}
							if (!this.state.accountMenuOpen) {
								document.addEventListener("click", this.handleOutsideClick, false);
							} else {
								document.removeEventListener("click", this.handleOutsideClick, false);
							}
							this.setState({
								accountMenuOpen: !this.state.accountMenuOpen,
							});
						};

						handleOutsideClick = (e) => {
							// ignore clicks on the component itself
							if (this.nodeRef.current && this.nodeRef.current.contains(e.target)) {
								return;
							}
							this.onAccountMenuOpen(e);
						};

						handleOutsideNotificationClick = (e) => {
							// ignore clicks on the component itself
							if (this.notificationNodeRef.current && this.notificationNodeRef.current.contains(e.target)) {
								return;
							}
							this.toggleNotification(e);
						};

						toggleNotification = async (e) => {
							if (this.state.accountMenuOpen) {
								this.onAccountMenuOpen(e);
							}
							e.stopPropagation();
							if (!this.state.showNotifications) {
								document.addEventListener("click", this.handleOutsideNotificationClick, false);
							} else {
								document.removeEventListener("click", this.handleOutsideNotificationClick, false);
							}
							if (!this.state.lastListFetchedTime) {
								if (!this._isMounted) {
									return;
								}
								await this.getAllNotifications();
							} else if (parseInt((new Date().getTime() - this.state.lastListFetchedTime) / INTERVAL_TIME, 10)) {
								if (!this._isMounted) {
									return;
								}
								await this.getAllNotifications();
							}
							if (this.state.notifications.length) {
								this.setState({
									showNotifications: !this.state.showNotifications,
									openNotificationOid: null,
								});
							} else {
								this.setState({
									showNotifications: false,
									openNotificationOid: null,
								});
							}
							// Close Notification FlyOut...
							if (typeof this.props.onClose === "function") {
								if (this.props.flyOutIndexNotification === -1) {
									this.props.onClose();
								}
							}
						};

						markNotificationReadUnread = async (read = false, notif, isToogle = true) => {
							const notifOid = notif.oid;
							if (notif.link && notif.link.type === "book-unlock" && notif.link.unlock_attempt_oid && notif.link.value === false && !isToogle) {
								this.setState({ showIntentToCopyForm: true, currentNotif: notif });
							} else {
								this.updateNotification(read, notifOid);
							}
						};

						updateNotification = (read, notificationOid) => {
							this.props
								.api("/auth/update-notification", {
									has_read: read,
									oid: notificationOid,
								})
								.then((res) => {
									if (!this._isMounted) {
										return;
									}
									if (res.result) {
										const newNotifications = this.state.notifications.map((notification) => {
											if (notification.oid === notificationOid) {
												notification.has_read = read;
												return notification;
											}
											return notification;
										});
										//let notificationCount = newNotifications.filter(notification => notification.has_read === false).length;
										let notificationCount = parseInt(res.unread_count, 10);
										let high_priority_count = parseInt(res.high_priority_count, 10);
										this.setState({
											notifications: [].concat(newNotifications),
											notificationCount: notificationCount,
											notificationCountText:
												notificationCount < notificationLimitCounter.limit ? notificationCount : notificationLimitCounter.limit + "+",
											notificationHigPriorityCount: high_priority_count,
										});
									}
									this.props.eventEmitter_emit(notificationNeedToBeUpdate, constants.Notification_Update_From_Header_Tab);
								})
								.catch((err) => {});
						};

						onCloseIntentToCopy = () => {
							const currentNotif = this.state.currentNotif;
							if (currentNotif && currentNotif.oid && !currentNotif.has_replied) {
								this.updateNotification(true, currentNotif.oid);
							}
							this.setState({ currentNotif: null, showIntentToCopyForm: false });
						};

						deleteNotification = (notificationOid, categoryId = 0) => {
							this.props
								.api("/auth/delete-notification", {
									oid: notificationOid,
									categoryId: categoryId,
								})
								.then(async (res) => {
									if (!this._isMounted) {
										return;
									}
									if (res.result) {
										await this.getAllNotifications();
									}
									this.props.eventEmitter_emit(notificationNeedToBeUpdate, constants.Notification_Update_From_Header_Tab);
								})
								.catch((err) => {});
						};

						onToggleNotificationItem = (oid) => {
							if (this.state.openNotificationOid === oid) {
								this.setState({
									openNotificationOid: null,
								});
							} else {
								this.setState({
									openNotificationOid: oid,
								});
							}
						};

						/* onShowAllNotification = () => {
		this.setState({
			showAllNotification: !this.state.showAllNotification
		},() => {
			this.getAllNotifications();
		})
	} */

						componentWillUnmount() {
							this._isMounted = false;
							delete this._isMounted;
							if (this.notificationCountInterval) {
								this.clearTimer(this.notificationCountInterval);
							}
							document.removeEventListener("click", this.handleOutsideNotificationClick, false);
							document.removeEventListener("click", this.handleOutsideClick, false);
							this.props.eventEmitter_off(notificationNeedToBeUpdate, this.onEmit);
							window.removeEventListener("scroll", this.onScroll);
						}

						signOut = (e) => {
							e.preventDefault();
							this.props.withAuthConsumer_logout();
						};

						onOutsideDropdownClick = (e) => {
							if (this.state.openNotificationOid && !e.target.classList.contains("fa-ellipsis-v")) {
								this.setState({
									openNotificationOid: null,
								});
							}
						};

						onEmit = (source) => {
							// This method is called whenever the SomeEvent event is emitted because it was registered in `componentDidMount`.
							// Even if another Component emits the SomeEvent event, this method will be called.
							// Be careful not to emit the SomeEvent event from within this function otherwise you'll get an infinite loop.
							if (source !== constants.Notification_Update_From_Header_Tab) {
								this.getNotificationCount();
							}
						};

						doJumpToMainContent = (e) => {
							const id = this.getJumpToContentId();
							const targetElement = document.getElementById(id);
							if (targetElement) {
								const firstFocusableElement = targetElement.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
								if (firstFocusableElement) {
									firstFocusableElement.focus();
								}
							}
						};

						getJumpToContentId() {
							return this.props.jumpToContentId || "main";
						}

						render() {
							const { isShowSkipContentLink = true, hide_search = false } = this.props;
							const userDetails = this.props.withAuthConsumer_myUserDetails;
							const customWidth = this.props.width ? Math.floor(this.props.width) : window.innerWidth;
							const breakPoint = customWidth <= theme.breakpoints.desktop2.substring(0, theme.breakpoints.desktop2.length - 2) ? true : false;
							const currentLocation = this.props.location.pathname + this.props.location.search + "#" + this.getJumpToContentId();
							return (
								<>
									{isShowSkipContentLink && (
										<WrapperHeader backgroundColor={theme.colours.white}>
											<WrapperContainer>
												<SkipContentLink href={currentLocation} onClick={this.doJumpToMainContent}>
													Skip to content
												</SkipContentLink>
											</WrapperContainer>
										</WrapperHeader>
									)}
									<WrapperHeader backgroundColor={theme.colours.primary}>
										<WrapperContainer>
											{!breakPoint ? (
												<>
													<BrandIconLeftSection to="/">
														<AnchorLink to="/" title="Education Platform - Home">
															<EpLogo src={require("./../../assets/images/cla-logo.svg")} alt="CLA" width="34" height="21" />
															Copyright Licensing Agency
														</AnchorLink>
													</BrandIconLeftSection>
													<WrapHeaderLoginSection>
														<HeaderLoginSection>
															<BlogUl>
																<li>
																	<BlogLink
																		href={process.env.EP_BLOG_URL}
																		target="_blank"
																		title="Read the CLA Education blog"
																		data-ga-top-nav="true"
																		data-ga-link="blog"
																	>
																		Blog
																	</BlogLink>
																</li>
																<li>
																	<AnchorLink
																		to={"/works?" + encodeURI("filter_level=Further Education")}
																		title="A list of all the books that are relevant for further education"
																		data-ga-top-nav="true"
																		data-ga-link="=”further-education"
																	>
																		Further Education
																	</AnchorLink>
																</li>
																<li>
																	<AnchorLink
																		to="/works?filter_level=Primary"
																		title="A list of all the books that are relevant for primary institutions"
																		data-ga-top-nav="true"
																		data-ga-link="primary"
																	>
																		Primary
																	</AnchorLink>
																</li>
																<li>
																	<AnchorLink
																		to="/works?filter_level=Secondary"
																		title="A list of all the books that are relevant for secondary institutions"
																		data-ga-top-nav="true"
																		data-ga-link="secondary"
																	>
																		Secondary
																	</AnchorLink>
																</li>
																<li>
																	<AnchorLink
																		to="/works?filter_language=wel"
																		title="Rhestr o gynnwys Cymraeg/A list of Welsh content/"
																		data-ga-top-nav="true"
																		data-ga-link="welsh"
																	>
																		Cynnwys Cymraeg
																	</AnchorLink>
																</li>

																{userDetails && (
																	<li>
																		<AnchorLink
																			to={userDetails.is_fe_user ? "/about-for-fe" : "/about-for-school"}
																			title="What you can do with the Education Platform, and how to use it"
																			data-ga-top-nav="true"
																			data-ga-link={userDetails.is_fe_user ? "about-fe" : "about-school"}
																		>
																			About
																		</AnchorLink>
																	</li>
																)}
																<li>
																	<AnchorLink to="/faq" title="Frequently asked questions" data-ga-top-nav="true" data-ga-link="faq">
																		FAQs{" "}
																	</AnchorLink>
																</li>
																<li>
																	<AnchorLink
																		to="/partners"
																		title="The education publishers who have provided content on the Education Platform"
																		data-ga-top-nav="true"
																		data-ga-link="partners"
																	>
																		Partners{" "}
																	</AnchorLink>
																</li>
															</BlogUl>
														</HeaderLoginSection>
														{this.props.hideSignInActions ? null : userDetails ? (
															<>
																<SignInSection ref={this.props.notificationRef}>
																	<AccountInfo>
																		<AccountMenuOpen title="Go to your profile">
																			{/*<span className="d-inline-block align-middle text-white">Signed in as &nbsp;</span>*/}
																			<ProfileName onClick={this.onAccountMenuOpen}>
																				<Icon className="far fa-user" aria-hidden="true"></Icon> {userDetails.first_name} {userDetails.last_name}
																			</ProfileName>
																			<AccountMenuOpenLinkIcon onClick={this.onAccountMenuOpen}>
																				{this.state.accountMenuOpen ? (
																					<AccountMenuOpenLinkIconButton className="fal fa-chevron-up fa-sm"></AccountMenuOpenLinkIconButton>
																				) : (
																					<AccountMenuOpenLinkIconButton className="fal fa-chevron-down fa-sm"></AccountMenuOpenLinkIconButton>
																				)}
																			</AccountMenuOpenLinkIcon>
																			{this.state.showNotificationsIcon ? (
																				<ALink title="View notifications" onClick={this.toggleNotification}>
																					<NotificationBellIcon
																						className="fas fa-bell"
																						showJiggle={this.state.notificationHigPriorityCount > 0 ? true : false}
																					></NotificationBellIcon>
																					<NotificationNumber showJiggle={this.state.notificationHigPriorityCount > 0 ? true : false}>
																						{this.state.notificationCountText}
																					</NotificationNumber>
																				</ALink>
																			) : null}
																		</AccountMenuOpen>
																		<NotificationSection ref={this.notificationNodeRef}>
																			<Notification
																				open={this.state.showNotifications}
																				notifications={this.state.notifications}
																				onToggleNotification={this.markNotificationReadUnread}
																				onDeleteNotification={this.deleteNotification}
																				onShowAllNotification={this.onShowAllNotification}
																				/* showAllNotification = {this.state.showAllNotification} */
																				onToggleNotificationItem={this.onToggleNotificationItem}
																				openNotificationOid={this.state.openNotificationOid}
																				onOutsideDropdownClick={this.onOutsideDropdownClick}
																			/>
																		</NotificationSection>
																		<AccountMenu open={this.state.accountMenuOpen} ref={this.nodeRef}>
																			<AccountMenuList>
																				<AccountMenuItem>
																					<AccountMenuLink to="/profile/my-details">My Details</AccountMenuLink>
																				</AccountMenuItem>
																				{userDetails.role !== UserRole.claAdmin ? (
																					<>
																						<AccountMenuItem>
																							<AccountMenuLink to="/profile/my-copies?q_mine_only=1">My Copies</AccountMenuLink>
																						</AccountMenuItem>
																					</>
																				) : null}
																				{userDetails.role !== UserRole.claAdmin ? (
																					<>
																						<AccountMenuItem>
																							<AccountMenuLink to="/profile/my-copies?q_mine_only=1&review=1&expiry_status=review_only&mine_only=1">
																								Review Copies {this.state.reviewCopyCount > 0 && `(${this.state.reviewCopyCount})`}
																							</AccountMenuLink>
																						</AccountMenuItem>
																					</>
																				) : null}
																				{userDetails.role !== UserRole.claAdmin ? (
																					<>
																						<AccountMenuItem>
																							<AccountMenuLink to="/profile/admin/favourites?ft=asset">My Favourites</AccountMenuLink>
																						</AccountMenuItem>
																					</>
																				) : null}
																				<AccountMenuItem>
																					<AccountMenuLink to="/works?filter_misc=unlock_books">Unlocked Content</AccountMenuLink>
																				</AccountMenuItem>
																				<AccountMenuItem>
																					<AccountMenuLink to="/profile/admin">Administration</AccountMenuLink>
																				</AccountMenuItem>
																				<AccountMenuItem>
																					<AccountMenuLink as={SendRequestHelpRaw} myUserDetails={userDetails} />
																				</AccountMenuItem>
																				<AccountMenuItemSignOut>
																					<AccountMenuLink to="#" onClick={this.signOut}>
																						Logout
																					</AccountMenuLink>
																				</AccountMenuItemSignOut>
																			</AccountMenuList>
																		</AccountMenu>
																	</AccountInfo>
																</SignInSection>
															</>
														) : (
															<>
																<SignInSection>
																	<LoginLink to={getSignInUrl()} title="sign in">
																		<i className="far fa-user" aria-hidden="true"></i> Sign In{" "}
																	</LoginLink>{" "}
																	&nbsp; or &nbsp;{" "}
																	<LoginLink to="/register" title="register">
																		Register
																	</LoginLink>
																</SignInSection>
															</>
														)}
													</WrapHeaderLoginSection>
												</>
											) : (
												<MobileScreen>
													<MobileBrandIconLeftSection to="/">
														<AnchorLink to="/" title="home">
															<EpLogo src={require("./../../assets/images/cla-logo.svg")} alt="CLA" width="34" height="21" />
															Copyright Licensing Agency
														</AnchorLink>
													</MobileBrandIconLeftSection>
													<MobileHeaderLoginSection ref={this.props.notificationRef}>
														{this.state.showNotificationsIcon ? (
															<>
																<NotificationCountWrap onClick={this.toggleNotification}>
																	<NotificationBellIcon
																		className="fas fa-bell"
																		showJiggle={this.state.notificationHigPriorityCount > 0 ? true : false}
																	>
																		{" "}
																	</NotificationBellIcon>
																	<NotificationNumber showJiggle={this.state.notificationHigPriorityCount > 0 ? true : false}>
																		{this.state.notificationCountText}
																	</NotificationNumber>
																</NotificationCountWrap>
																<NotificationSection ref={this.notificationNodeRef}>
																	<Notification
																		open={this.state.showNotifications}
																		notifications={this.state.notifications}
																		onToggleNotification={this.markNotificationReadUnread}
																		onDeleteNotification={this.deleteNotification}
																		onShowAllNotification={this.onShowAllNotification}
																		/* showAllNotification = {this.state.showAllNotification} */
																		onToggleNotificationItem={this.onToggleNotificationItem}
																		openNotificationOid={this.state.openNotificationOid}
																	/>
																</NotificationSection>
															</>
														) : null}

														<Hamburger onClick={this.toggleMenu}>
															{!this.state.menuOpen ? (
																<>
																	<i className="fa fa-bars"></i>
																</>
															) : (
																<i className="fa fa-times" aria-hidden="true"></i>
															)}
														</Hamburger>
													</MobileHeaderLoginSection>

													<Navigation open={this.state.menuOpen}>
														<NavList>
															<li>
																<BlogLink href={process.env.EP_BLOG_URL} target="_blank" data-ga-top-nav="true" data-ga-link="blog">
																	<i className="" aria-hidden="true"></i> <NavTitle>Blog</NavTitle>
																</BlogLink>
															</li>
															<li>
																<AnchorLink
																	to={"/works?" + encodeURI("filter_level=Further Education")}
																	title="further education"
																	data-ga-top-nav="true"
																	data-ga-link="=”further-education"
																>
																	<i className="" aria-hidden="true"></i> <NavTitle>Further Education</NavTitle>
																</AnchorLink>
															</li>
															<li>
																<AnchorLink to="/works?filter_level=Primary" title="primary" data-ga-top-nav="true" data-ga-link="primary">
																	<i className="" aria-hidden="true"></i> <NavTitle>Primary</NavTitle>
																</AnchorLink>
															</li>

															<li>
																<AnchorLink to="/works?filter_level=Secondary" title="secondary" data-ga-top-nav="true" data-ga-link="secondary">
																	<i className="" aria-hidden="true"></i> <NavTitle>Secondary</NavTitle>
																</AnchorLink>
															</li>
															<li>
																<AnchorLink
																	to="/works?filter_language=wel"
																	title="Rhestr o gynnwys Cymraeg/A list of Welsh content/"
																	data-ga-top-nav="true"
																	data-ga-link="primary"
																>
																	<i className="" aria-hidden="true"></i> <NavTitle>Cynnwys Cymraeg</NavTitle>
																</AnchorLink>
															</li>
															{userDetails && (
																<li>
																	<AnchorLink
																		to={userDetails.is_fe_user ? "/about-for-fe" : "/about-for-school"}
																		title="about"
																		data-ga-top-nav="true"
																		data-ga-link={userDetails.is_fe_user ? "about-fe" : "about-school"}
																	>
																		<i className="" aria-hidden="true"></i> <NavTitle>About</NavTitle>
																	</AnchorLink>
																</li>
															)}
															<li>
																<AnchorLink to="/faq" title="faq" data-ga-top-nav="true" data-ga-link="faq">
																	<i className="" aria-hidden="true"></i> <NavTitle>FAQs</NavTitle>
																</AnchorLink>
															</li>
															<li>
																<AnchorLink to="/partners" title="partners" data-ga-top-nav="true" data-ga-link="partners">
																	<i className="" aria-hidden="true"></i> <NavTitle>Partners</NavTitle>
																</AnchorLink>
															</li>
														</NavList>
														{this.props.hideSignInActions ? null : userDetails ? (
															<>
																<MobileAccountSection>
																	<NavList>
																		<li>
																			<MobAccountMenuLink to="/profile/my-details">
																				<MobProfileName>
																					<i className="far fa-user" aria-hidden="true"></i>
																					{userDetails.first_name} {userDetails.last_name}
																				</MobProfileName>
																			</MobAccountMenuLink>
																		</li>
																		{userDetails.role !== UserRole.claAdmin ? (
																			<>
																				<li>
																					<MobAccountMenuLink to="/profile/my-copies?q_mine_only=1">
																						<i className="" aria-hidden="true"></i>My Copies
																					</MobAccountMenuLink>
																				</li>
																			</>
																		) : null}
																		{userDetails.role !== UserRole.claAdmin ? (
																			<>
																				<li>
																					<MobAccountMenuLink to="/profile/my-copies?q_mine_only=1&review=1&expiry_status=review_only&mine_only=1">
																						<i className="" aria-hidden="true" />
																						Review Copies {this.state.reviewCopyCount > 0 && `(${this.state.reviewCopyCount})`}
																					</MobAccountMenuLink>
																				</li>
																			</>
																		) : null}
																		{userDetails.role !== UserRole.claAdmin ? (
																			<>
																				<li>
																					<MobAccountMenuLink to="/profile/admin/favourites/?ft=asset">
																						<i className="" aria-hidden="true"></i>My Favourites
																					</MobAccountMenuLink>
																				</li>
																			</>
																		) : null}
																		<li>
																			<MobAccountMenuLink to="/works?filter_misc=unlock_books" title="unlocked content">
																				<i className="" aria-hidden="true"></i>Unlocked Content
																			</MobAccountMenuLink>
																		</li>
																		<li>
																			<MobAccountMenuLink to="/profile/admin">
																				<i className="" aria-hidden="true"></i>Administration
																			</MobAccountMenuLink>
																		</li>
																		<li>
																			<MobAccountMenuLink to="#" onClick={this.signOut}>
																				<i className="" aria-hidden="true"></i>Logout
																			</MobAccountMenuLink>
																		</li>
																	</NavList>
																</MobileAccountSection>
															</>
														) : (
															<>
																<MobileSignInSection>
																	<i className="far fa-user" aria-hidden="true"></i>{" "}
																	<LoginLink to={getSignInUrl()} title="sign in">
																		{" "}
																		Sign In
																	</LoginLink>{" "}
																	&nbsp; or &nbsp;
																	<LoginLink to="/register" title="register">
																		Register{" "}
																	</LoginLink>
																</MobileSignInSection>
															</>
														)}
													</Navigation>
												</MobileScreen>
											)}
										</WrapperContainer>
									</WrapperHeader>
									{hide_search ? (
										""
									) : (
										<HeaderSearch
											isShowFlyOut={this.props.isShowFlyOut}
											onCloseFlyOut={this.props.onCloseFlyOut}
											flyOutMessage={this.props.flyOutMessage}
											location={this.props.location}
										/>
									)}
									{this.state.showIntentToCopyForm ? (
										<>
											<IntentToCopyForm
												onCloseIntentToCopy={this.onCloseIntentToCopy}
												unlock_attempt_oid={this.state.currentNotif.link.unlock_attempt_oid}
												isbn={this.state.currentNotif.link.isbn}
												notification_oid={this.state.currentNotif.oid}
												isUnlock={false}
												has_replied={this.state.currentNotif.link.has_replied ? this.state.currentNotif.link.has_replied : false}
												calledAfterSubmit={this.getAllNotifications}
												history={this.props.history}
											/>
										</>
									) : (
										""
									)}
								</>
							);
						}
					}
				)
			)
		)
	)
);
