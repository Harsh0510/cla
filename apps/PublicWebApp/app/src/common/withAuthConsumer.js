import React from "react";
import AuthContext from "./AuthContext";

export default function (WrappedComponent) {
	return function WithAuthConsumer(props) {
		return (
			<AuthContext.Consumer>
				{(value) => {
					return (
						<WrappedComponent
							withAuthConsumer_prevEmail={value.prevEmail}
							withAuthConsumer_myUserDetails={value.myUserDetails}
							withAuthConsumer_lastError={value.lastError}
							withAuthConsumer_attemptAuth={value.attemptAuth}
							withAuthConsumer_attemptReauth={value.attemptReauth}
							withAuthConsumer_logout={value.logout}
							{...props}
						/>
					);
				}}
			</AuthContext.Consumer>
		);
	};
}
