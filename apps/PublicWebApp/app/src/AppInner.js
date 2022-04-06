import React from "react";
import { Redirect, withRouter } from "react-router-dom";
import withAuthConsumer from "./common/withAuthConsumer";

export default withRouter(
	withAuthConsumer(
		class AppInner extends React.PureComponent {
			componentDidMount() {
				this.maybeRedirectToMergeConfirmation();
			}
			componentDidUpdate(prevProps) {
				if (this.props.location.pathname !== prevProps.location.pathname) {
					document.documentElement.scrollTop = 0;
				}
				if (
					this.props.location.pathname !== prevProps.location.pathname ||
					this.props.withAuthConsumer_myUserDetails !== prevProps.withAuthConsumer_myUserDetails
				) {
					this.maybeRedirectToMergeConfirmation();
				}
			}

			maybeRedirectToMergeConfirmation() {
				const userDetails = this.props.withAuthConsumer_myUserDetails;
				if (
					userDetails &&
					userDetails.requires_merge_confirmation &&
					this.props.location.pathname !== "/auth/merge-confirmation" &&
					!this.props.location.pathname.match(/^\/terms-of-use($|\/)/) &&
					this.props.location.pathname.indexOf("/auth/merge-verify/") !== 0
				) {
					this.props.history.push("/auth/merge-confirmation");
				}
			}

			render() {
				return <div>{this.props.children}</div>;
			}
		}
	)
);
