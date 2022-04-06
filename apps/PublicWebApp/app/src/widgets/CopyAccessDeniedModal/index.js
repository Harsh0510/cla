import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import withAuthConsumer from "../../common/withAuthConsumer";
import CopyCreationAccessDeniedPopup from "../../widgets/CopyCreationAccessDeniedPopup";

class CopyAccessDenied extends Component {
	state = {};

	componentDidMount() {
		const currUser = this.props.withAuthConsumer_myUserDetails;
		if (currUser) {
			this.setState({ just_logged_in: true });
		}
	}

	componentDidUpdate(prevProps, prevState) {
		const currUser = this.props.withAuthConsumer_myUserDetails;
		const oldUser = prevProps.withAuthConsumer_myUserDetails;
		const justLoggedIn = (currUser && !oldUser) || (currUser && oldUser && currUser.email !== oldUser.email);
		if (justLoggedIn) {
			this.setState({ just_logged_in: true, modal_was_closed: false });
		}
	}

	onModalClose = () => {
		this.setState({ modal_was_closed: true });
	};

	render() {
		const user = this.props.withAuthConsumer_myUserDetails;
		let shouldDisplay = false;
		if (user && !user.can_copy && user.has_trial_extract_access) {
			if (this.props.location && this.props.location.state && this.props.location.state.redirected_from_extract_page) {
				shouldDisplay = true;
			} else if (this.state.just_logged_in && !this.state.modal_was_closed) {
				shouldDisplay = true;
			}
		}
		if (!shouldDisplay) {
			return null; // don't display anything
		}

		if (!this.state.modal_was_closed) {
			return (
				<div>
					<CopyCreationAccessDeniedPopup handleClose={this.onModalClose} />
				</div>
			);
		}
		return null;
	}
}

export default withRouter(withAuthConsumer(CopyAccessDenied));
