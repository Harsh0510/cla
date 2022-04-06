import React from "react";
import ApiContext from "./ApiContext";

import api from "./api";
import withAuthConsumer from "./withAuthConsumer";

const AUTH_RETRY_INTERVAL_MS = 60000;

export default withAuthConsumer(
	class ApiProvider extends React.PureComponent {
		constructor(...args) {
			super(...args);
			this._authTimeout = null;
			this._isMounted = false;
		}

		componentDidMount() {
			this._isMounted = true;
			this.doReauthTimeout();
		}

		componentWillUnmount() {
			if (this._authTimeout) {
				clearTimeout(this._authTimeout);
			}
			delete this._authTimeout;
			delete this._isMounted;
		}

		componentDidUpdate(prevProps) {
			const currUser = this.props.withAuthConsumer_myUserDetails;
			const oldUser = prevProps.withAuthConsumer_myUserDetails;
			if (currUser && !oldUser) {
				this.doReauthTimeout();
			}
		}

		doReauthTimeout = () => {
			if (this._authTimeout) {
				clearTimeout(this._authTimeout);
			}
			if (this.props.withAuthConsumer_myUserDetails) {
				this._authTimeout = setTimeout(() => {
					this.props.withAuthConsumer_attemptReauth();
					this.doReauthTimeout();
				}, AUTH_RETRY_INTERVAL_MS);
			}
		};

		api = (...args) => {
			return new Promise((resolve, reject) => {
				api(...args)
					.then(resolve)
					.catch((err) => {
						if (err === "_ERROR_ :: cannot copy" && this._isMounted) {
							this.doReauthTimeout();
							this.props.withAuthConsumer_attemptReauth();
						}
						reject(err);
					});
			});
		};
		render() {
			return <ApiContext.Provider children={this.props.children} value={this.api} />;
		}
	}
);
