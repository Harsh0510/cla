import React from "react";
import withApiConsumer from "./withApiConsumer";

import * as bit from "./bit";
import withAuthConsumer from "./withAuthConsumer";
import userDidChange from "./userDidChange";

const Context = React.createContext();

let counter = 0;

export const FlyoutManagerProvider = withApiConsumer(
	withAuthConsumer(
		class FlyoutManagerProviderInner extends React.PureComponent {
			state = {
				counter: counter,
				flyoutSeenData: null,
				flyouts_disabled: true,
				notificationCount: 0,
			};

			doUpdate = () => {
				if (this.props.withAuthConsumer_myUserDetails) {
					if (this.props.withAuthConsumer_myUserDetails.flyout_enabled) {
						this.props
							.api("/public/first-time-user-experience-get-all-mine-seen")
							.then((result) => {
								if (!this._isActive) {
									return;
								}
								this.setState({
									flyoutSeenData: result.data,
									flyouts_disabled: false,
								});
								this.props
									.api("/auth/get-notification", {
										getCount: true,
									})
									.then((res) => {
										const notificationCount = parseInt(res, 10);
										this.setState({
											notificationCount: notificationCount,
										});
									})
									.catch((err) => {});
							})
							.catch(() => {
								this.setState({
									flyoutSeenData: {},
									flyouts_disabled: true,
								});
							});
					} else {
						this.setState({
							flyoutSeenData: {},
							flyouts_disabled: true,
						});
					}
				} else {
					this.setState({
						flyoutSeenData: {},
						flyouts_disabled: true,
					});
				}
			};

			componentDidMount() {
				this._isActive = true;
				this.doUpdate();
			}

			componentDidUpdate(prevProps) {
				if (userDidChange(this.props, prevProps)) {
					this.doUpdate();
				}
			}

			componentWillUnmount() {
				this._isActive = false;
			}

			doSet = (screen, index) => {
				return new Promise((resolve) => {
					if (this.state.flyouts_disabled) {
						resolve();
						return;
					}
					this.props.api("/public/first-time-user-experience-update", { screen, index }).finally(() => {
						if (!this._isActive) {
							return;
						}
						const newData = { ...this.state.flyoutSeenData };
						newData[screen] = index;
						this.setState(
							{
								flyoutSeenData: newData,
								counter: ++counter,
							},
							resolve
						);
					});
				});
			};

			doSetNext = (screen) => {
				let idx = this.getSeenIndex(screen);
				if (idx <= 0) {
					return this.doSet(screen, 1);
				}
				const next = bit.getFirstNotSet(idx);
				const newIdx = bit.set(idx, next);
				return this.doSet(screen, newIdx);
			};

			getSeenIndex = (screen) => {
				if (this.state.flyouts_disabled) {
					return 2 ** 31 - 1; // 31 bits set, so the 'first unseen index' will be 32, which is higher than any index, so no flyouts should be shown
				}
				if (this.state.flyoutSeenData.hasOwnProperty(screen)) {
					return this.state.flyoutSeenData[screen];
				}
				return -1;
			};

			getFirstUnseenIndex = (screen) => {
				if (this.state.flyouts_disabled) {
					return 10000;
				}
				return bit.getFirstNotSet(this.getSeenIndex(screen));
			};

			render() {
				if (!this.state.flyoutSeenData) {
					return <div>Loading...</div>;
				}
				return (
					<Context.Provider
						value={{
							counter: this.state.counter,
							setIndex: this.doSet,
							setNext: this.doSetNext,
							getFirstUnseenIndex: this.getFirstUnseenIndex,
							getSeenIndex: this.getSeenIndex,
							getNotificationCount: this.state.notificationCount,
							getNotificationIndex: this.state.flyoutSeenData.notification,
							getLatestFlyoutIndex: this.doUpdate,
						}}
						children={this.props.children}
					/>
				);
			}
		}
	)
);

export const withFlyoutManager = (WrappedComponent) => {
	return (props) => {
		return (
			<Context.Consumer>
				{(value) => {
					return (
						<WrappedComponent
							flyouts_counter={value.counter}
							flyouts_setIndex={value.setIndex}
							flyouts_setNext={value.setNext}
							flyouts_getFirstUnseenIndex={value.getFirstUnseenIndex}
							flyouts_getSeenIndex={value.getSeenIndex}
							flyout_getNotificationCount={value.getNotificationCount}
							flyout_getNotificationIndex={value.getNotificationIndex}
							flyout_getLatestFlyoutIndex={value.getLatestFlyoutIndex}
							{...props}
						/>
					);
				}}
			</Context.Consumer>
		);
	};
};
