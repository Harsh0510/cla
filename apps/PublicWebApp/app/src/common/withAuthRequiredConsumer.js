import React from "react";
import { Redirect } from "react-router-dom";
import AuthContext from "./AuthContext";

export default function (WrappedComponent) {
	return function WithAuthRequiredProvider(props) {
		return (
			<AuthContext.Consumer>
				{(value) => {
					if (!value.myUserDetails) {
						const currentUrl = encodeURIComponent(props.location.pathname + (props.location.search ? props.location.search : ""));
						return (
							<Redirect
								push
								to={{
									pathname: "/sign-in",
									search: "?backurl=" + currentUrl,
								}}
							/>
						);
					}
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
