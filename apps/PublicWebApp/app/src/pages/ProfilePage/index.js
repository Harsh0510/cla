import React from "react";
import withAuthRequiredConsumer from "../../common/withAuthRequiredConsumer";
// import withAuthRequiredConsumer from '../../mocks/withAuthRequiredConsumer';
import withApiConsumer from "../../common/withApiConsumer";
// import withApiConsumer from '../../mocks/withApiConsumer';
import { Link } from "react-router-dom";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";

export default withAuthRequiredConsumer(
	withApiConsumer(
		class ProfilePage extends React.PureComponent {
			render() {
				const userDetails = this.props.withAuthConsumer_myUserDetails;
				let adminLink = "";

				if (userDetails.role === "school-admin" || userDetails.role === "cla-admin") {
					adminLink = (
						<li>
							<Link to="/profile/admin">Administration</Link>
						</li>
					);
				}

				return (
					<div>
						<HeadTitle title={PageTitle.profile} />
						<h1>Profile Page</h1>
						<p>Welcome, {userDetails.first_name}.</p>
						<p>Institution: {userDetails.school}</p>
						<ul>
							{adminLink}
							<li>
								<Link to="/profile/my-copies">My Copies</Link>
							</li>
							<li>
								<span>My Titles</span>
							</li>
							<li>
								<span>My Preferences</span>
							</li>
							<li>
								<span>My Details</span>
							</li>
							<li>
								<span>Sign Out</span>
							</li>
						</ul>
					</div>
				);
			}
		}
	)
);
