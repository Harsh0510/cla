import React from "react";
import AuthContext from "./AuthContext";
import googleEvent from "./googleEvent";

import api from "./api";
import * as cacher from "./cacher";

const getUserIdent = (userDetails) => {
	if (userDetails) {
		return userDetails.email + "//" + userDetails.school;
	}
	return null;
};

const REQUEST_TIMEOUT_LIMIT = 10000; // 10 seconds

export default class AuthProvider extends React.PureComponent {
	constructor(...args) {
		super(...args);
		this.state = {
			prevEmail: null,
			myUserDetails: null,
			lastError: null,
			inited: false,
		};
	}

	componentDidMount() {
		this.attemptReauth();
	}

	_doLocalLogout = (prevEmail) => {
		cacher.clearAll();
		this.setState({
			prevEmail: prevEmail,
			myUserDetails: null,
			lastError: null,
		});
	};

	logout = (_) => {
		const currEmail = this.state.myUserDetails ? this.state.myUserDetails.email : null;
		api("/auth/logout")
			.then((result) => {
				if (result.redirectUrl) {
					window.location.href = result.redirectUrl;
				} else {
					this._doLocalLogout(currEmail);
				}
			})
			.catch(() => {
				this._doLocalLogout(currEmail);
			});
	};

	attemptAuth = (email, password) => {
		return api("/auth/login", { email, password }, { timeout: REQUEST_TIMEOUT_LIMIT })
			.then((result) => {
				cacher.clearAll();
				googleEvent("login", null, null, null, result.oid);
				this.setState({
					myUserDetails: result.my_details,
					lastError: null,
				});
				return null;
			})
			.catch((err) => {
				cacher.clearAll();
				this.setState({
					myUserDetails: null,
					lastError: err,
				});
				return err;
			});
	};

	attemptReauth = () => {
		const oldUserIdent = getUserIdent(this.state.myUserDetails);
		api("/auth/get-my-details")
			.then((result) => {
				// result is an object
				if (oldUserIdent !== getUserIdent(result.data)) {
					cacher.clearAll();
				}
				this.setState({
					myUserDetails: result.data,
					inited: true,
				});
			})
			.catch((err) => {
				// err is a string
				if (oldUserIdent !== getUserIdent(null)) {
					cacher.clearAll();
				}
				this.setState({
					myUserDetails: null,
					inited: true,
				});
			});
	};

	render() {
		if (!this.state.inited) {
			return <div>Loading...</div>;
		}
		return (
			<AuthContext.Provider
				children={this.props.children}
				value={{
					myUserDetails: this.state.myUserDetails,
					prevEmail: this.state.prevEmail,
					lastError: this.state.lastError,
					attemptAuth: this.attemptAuth,
					attemptReauth: this.attemptReauth,
					logout: this.logout,
				}}
			/>
		);
	}
}
