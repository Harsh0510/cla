import React from "react";
import withAuthRequiredConsumer from "../../common/withAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import userDidChange from "../../common/userDidChange";
import styled from "styled-components";
import Header from "../../widgets/Header";
import PageWrap from "../../widgets/PageWrap";
import { Link } from "react-router-dom";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";

const JUMP_TO_CONTENT_ID = "main-content";
const ConfirmEmailPageInner = styled.div`
	display: flex;
	flex-direction: column;
	max-width: 100%;
	margin: 0 auto;
`;

const ConfirmPageHeader = styled.h2`
	text-align: center;
	font-weight: 300;
	margin-bottom: 1em;
`;

const Message = styled.div`
	text-align: center;
`;

const SmallText = styled.span`
	text-align: center;
	font-weight: normal;
	display: inline-block;
	margin-top: 1em;
`;

/**
 * Component for the 'ConfirmEmail'
 * @extends React.PureComponent
 */
export default withAuthRequiredConsumer(
	withApiConsumer(
		class ConfirmEmailPage extends React.PureComponent {
			state = {
				message: "Confirming email address change...",
			};

			componentDidMount() {
				this.confirmEmail();
			}

			componentDidUpdate(prevProps) {
				if (this.props.location.pathname !== prevProps.location.pathname || userDidChange(this.props, prevProps)) {
					this.confirmEmail();
				}
			}

			confirmEmail() {
				this.props
					.api("/auth/user-confirm-email-change", { token: this.props.match.params.token })
					.then((result) => {
						if (result.result) {
							this.setState({ message: "Your email address has been changed.", hide: true });
						} else {
							this.setState({
								message: "We couldn't confirm your email change. Your link may have expired. Please contact your institution administrator.",
								hide: false,
							});
						}
					})
					.catch((result) => {
						this.setState({
							message: "There was an error confirming your email change. Please contact your institution administrator.",
							hide: false,
						});
					});
			}

			render() {
				const { message } = this.state;

				return (
					<>
						<HeadTitle title={PageTitle.confirmEmail} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<PageWrap padding={true} id={JUMP_TO_CONTENT_ID}>
							<ConfirmEmailPageInner>
								<ConfirmPageHeader> {this.state.hide === false ? "Oops!" : "Thank you"} </ConfirmPageHeader>
								<Message className="message">{message}</Message>
								{this.state.hide ? (
									<SmallText>
										Please <Link to="/"> click here </Link> to return home.
									</SmallText>
								) : (
									""
								)}
							</ConfirmEmailPageInner>
						</PageWrap>
					</>
				);
			}
		}
	)
);
