import React from "react";
import { Redirect } from "react-router-dom";
import withAuthConsumer from "../../common/withAuthConsumer";

export default withAuthConsumer(
	class AboutRoute extends React.PureComponent {
		render() {
			return this.props.withAuthConsumer_myUserDetails && this.props.withAuthConsumer_myUserDetails.is_fe_user ? (
				<Redirect to="/about-for-fe" />
			) : (
				<Redirect to="/about-for-school" />
			);
		}
	}
);
