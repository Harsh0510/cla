/**Edit Link style component that applied in table as edit link */
import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import withAuthConsumer from "../../common/withAuthConsumer";
import { Link, withRouter } from "react-router-dom";
import CopyCreationAccessDeniedPopup from "../../widgets/CopyCreationAccessDeniedPopup";
import userDidChange from "../../common/userDidChange";

const CopyEditLinkButton = styled.button`
	background: none;
	text-decoration: underline;
	border: 0;
	color: ${theme.colours.headerButtonSearch};
	${(p) =>
		p.disable &&
		css`
			opacity: 0.3;
			pointer-events: none;
		`};
`;

export default withAuthConsumer(
	class MaybeLinkToSingleCopy extends React.PureComponent {
		state = {
			showModal: false,
		};

		onEditClick = () => {
			const myUserDetails = this.props.withAuthConsumer_myUserDetails;
			if (myUserDetails.has_trial_extract_access) {
				//check if we have any 'doShowModal' method that handle the show modal than we called that method
				if (typeof this.props.doShowModal == "function") {
					this.props.doShowModal(true);
				} else {
					this.setState({
						showModal: true,
					});
				}
			}
		};

		componentDidMount() {
			this._isMounted = true;
			this.updateState();
		}

		componentDidUpdate(prevProps) {
			if (userDidChange(this.props, prevProps)) {
				this.updateState();
			}
		}

		componentWillUnmount() {
			delete this._isMounted;
		}

		updateState = () => {
			this.setState({
				showModal: false,
			});
		};

		handleClose = () => {
			//check if we have any 'doShowModal' method that handle the show modal than we called that method
			if (typeof this.props.doShowModal == "function") {
				this.props.doShowModal(false);
			} else {
				this.setState({
					showModal: false,
				});
			}
		};

		render() {
			const { linkText, hovertitle = "" } = this.props;
			const myUserDetails = this.props.withAuthConsumer_myUserDetails;
			const { showModal } = this.state;
			return (
				<>
					<CopyEditLinkButton
						onClick={this.onEditClick}
						disable={!myUserDetails.can_copy && !myUserDetails.has_trial_extract_access}
						title={hovertitle}
					>
						{linkText ? linkText : <i className="fal fa fa-edit" />}
					</CopyEditLinkButton>
					{showModal ? <CopyCreationAccessDeniedPopup handleClose={this.handleClose} /> : ""}
				</>
			);
		}
	}
);
