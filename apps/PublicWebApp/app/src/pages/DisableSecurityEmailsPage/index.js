import React from "react";
import Header from "../../widgets/Header";
import PageWrap from "../../widgets/PageWrap";
import styled from "styled-components";
import withApiConsumer from "../../common/withApiConsumer";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";

const JUMP_TO_CONTENT_ID = "main-content";
const StyledPageWrap = styled(PageWrap)`
	padding: 2em;
	text-align: center;
`;

const Title = styled.h1`
	text-align: center;
	font-weight: 300;
	font-size: 2em;
	margin: 0 0 1em;
`;

export default withApiConsumer(
	class DisableSecurityEmailsPage extends React.PureComponent {
		state = {
			message: null,
		};

		componentDidMount() {
			this.doDisableSecurityEmails();
		}

		componentDidUpdate(prevProps) {
			if (this.props.match.params.hashed !== prevProps.match.params.hashed) {
				this.setState({ message: null });
				this.doDisableSecurityEmails();
			}
		}

		doDisableSecurityEmails() {
			this.props
				.api("/auth/disable-security-emails", {
					hashed: this.props.match.params.hashed,
				})
				.then((result) => {
					if (result.result) {
						this.setState({ message: `Your email settings were changed successfully.` });
					} else {
						this.setState({ message: `Could not update email settings. Are you sure you followed the link correctly?` });
					}
				})
				.catch((result) => {
					this.setState({ message: result });
				});
		}

		render() {
			return (
				<>
					<HeadTitle title={PageTitle.disableSecurityEmails} />
					<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
					<StyledPageWrap id={JUMP_TO_CONTENT_ID}>
						<Title>Email settings</Title>
						{this.state.message || "Loading..."}
					</StyledPageWrap>
				</>
			);
		}
	}
);
