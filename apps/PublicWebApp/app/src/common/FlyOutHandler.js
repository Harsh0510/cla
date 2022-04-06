export default class FlyOutHandler {
	constructor(instance, api, screen) {
		this._instance = instance;
		this._api = api;
		this._screen = screen;
		this._active = true;
	}

	destroy() {
		this._active = false;
	}

	getSeen() {
		this._api("/public/first-time-user-experience-get-mine-seen", { screen: this._screen }).then((result) => {
			if (!this._active) {
				return;
			}
			this._instance.setState({
				flyOutIndex: parseInt(result.result, 10),
			});
		});
	}

	getSeenNotification() {
		this._api("/public/first-time-user-experience-get-mine-seen", { screen: "notification" }).then((result) => {
			if (!this._active) {
				return;
			}
			this._instance.setState({
				flyOutIndexNotification: parseInt(result.result, 10),
			});
		});
	}

	getSeenFlyOutIndex(screen) {
		this._api("/public/first-time-user-experience-get-mine-seen", { screen: screen }).then((result) => {
			if (!this._active) {
				return;
			}
			this._instance.setState({
				screenFlyOutIndex: parseInt(result.result, 10),
			});
		});
	}

	setSeen(index) {
		return new Promise((resolve) => {
			this._api("/public/first-time-user-experience-update", { screen: this._screen, index: index }).then(() => {
				if (!this._active) {
					return;
				}
				this._instance.setState({
					flyOutIndex: index,
				});
				resolve();
			});
		});
	}

	setSeenNotification(index) {
		return new Promise((resolve) => {
			this._api("/public/first-time-user-experience-update", { screen: "notification", index: index }).then(() => {
				if (!this._active) {
					return;
				}
				this._instance.setState({
					flyOutIndexNotification: index,
				});
				resolve();
			});
		});
	}

	onCloseNotification(cb, redirectURL) {
		const nextIndex = this._instance.state.flyOutIndexNotification + 1;
		this.setSeenNotification(nextIndex).then(() => {
			if (typeof cb === "function") {
				cb();
			}
			if (redirectURL && typeof redirectURL === "string") {
				this._instance.props.history.push(redirectURL);
			}
		});
	}

	onClose(cb, redirectURL) {
		const nextIndex = this._instance.state.flyOutIndex + 1;
		this.setSeen(nextIndex).then(() => {
			if (typeof cb === "function") {
				cb();
			}
			if (redirectURL && typeof redirectURL === "string") {
				this._instance.props.history.push(redirectURL);
			}
		});
	}

	//check flyout seen or not
	isBitSet = (value, elementIndex) => {
		return (value & (1 << elementIndex)) > 0;
	};

	//set bit value
	setElementAtIndex = (value, elementIndex) => {
		value = value | (1 << elementIndex);
		return value;
	};

	//get the pages
	getPopupIndexToShow = (value) => {
		if (value <= 0) {
			return value;
		}
		for (let i = 0; i < 30; ++i) {
			if (!this.isBitSet(value, i)) {
				return i;
			}
		}
		return 5000;
	};
}
