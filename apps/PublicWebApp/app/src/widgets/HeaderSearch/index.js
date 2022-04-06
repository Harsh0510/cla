import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import SearchBar from "../SearchBar";
import withPageSize from "../../common/withPageSize";
import withAuthConsumer from "../../common/withAuthConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import { col12, colLg3, colMd, colMdAuto, colLg6 } from "../../common/style";
import { Container } from "../Layout/Container";
import { Row } from "../Layout/Row";
import { ButtonLink } from "../Layout/ButtonLink";
import { Button } from "../Layout/Button";
import ContentRequestModal from "../../widgets/ContentRequestModal";

const TopBar = styled.div`
	padding: 30px 0;
	@media (max-width: ${theme.breakpoints.mobileSmall}) {
		padding: 10px 0 30px;
	}
`;

const EduTitleSection = styled.div`
	font-size: 20px;
	color: ${theme.colours.primary};
`;

const StyledUnlock = styled(ButtonLink)`
	margin-right: 1rem;

	@media screen and (min-width: ${theme.breakpoints.tabletPro}) {
		margin-right: 3rem;
	}

	@media screen and (max-width: ${theme.breakpoints.maobilLarge}) {
		margin-right: 0;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		margin-top: 15px;
	}
`;

const StyledContentRequestButton = styled(Button)`
	margin-right: 0.5rem;
	background-color: ${theme.colours.bgBtnContentRequest};
	border: 1px solid ${theme.colours.bgBtnContentRequest};
	:hover {
		color: ${theme.colours.bgBtnContentRequest};
	}

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		margin-top: 15px;
	}
`;

const SchoolName = styled.div`
	font-size: 14px;
	padding-left: 78px;
	margin-top: -24px;
`;

const SearchWrap = styled.div`
	${colLg3}
	${col12}
	${colMd}
	align-items: flex-end;
	flex-wrap: wrap;

	@media screen and (min-width: ${theme.breakpoints.mobileSmall}) {
		display: flex;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		padding: 0 1em;
	}
`;

const UnlockIcon = styled.i`
	margin-right: 0.5rem;
`;

const EpLogo = styled.img`
	margin-right: 0.5rem;
`;

const WrapChildren = styled.div`
	${(p) =>
		p.isShowContentRequestButton
			? css`
					@media screen and (min-width: ${theme.breakpoints.desktopSmall}) {
						margin-right: 5rem;
					}

					@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
						flex: 0 0 100%;
						max-width: 100%;
						margin-bottom: 15px;
					}

					@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
						margin-bottom: 0;
					}
			  `
			: css`
					${col12}
					${colMdAuto}
					${colLg6}
			  `}
`;

export default withPageSize(
	withAuthConsumer(
		withApiConsumer(
			class HeaderSearch extends React.PureComponent {
				state = {
					isShowContentRequestModal: false,
				};

				openContentRequestModal = () => {
					this.setState({ isShowContentRequestModal: true });
				};

				hideContentRequestModal = () => {
					this.setState({ isShowContentRequestModal: false });
				};

				render() {
					const { isShowFlyOut = false, flyOutMessage = null, location, withAuthConsumer_myUserDetails: userDetails } = this.props;
					const { isShowContentRequestModal } = this.state;
					const isShowContentRequestButton = userDetails && userDetails.role !== "cla-admin" && location.pathname !== "/";
					const isMobile = this.props.breakpoint < withPageSize.MOBILE;
					return (
						<>
							<Container>
								<TopBar>
									<Row>
										<WrapChildren isShowContentRequestButton={isShowContentRequestButton}>
											<EduTitleSection className="edu">
												<EpLogo src={require("./../../assets/images/edu-platform-logo.svg")} alt="education-plateform" width="70px" />
												<strong>Education Platform</strong>
												{userDetails && userDetails.school ? <SchoolName>for {userDetails.school}</SchoolName> : ""}
											</EduTitleSection>
										</WrapChildren>
										<SearchWrap>
											{isShowContentRequestButton && (
												<StyledContentRequestButton title="Can't find what you're looking for?" onClick={this.openContentRequestModal}>
													<UnlockIcon className="fal fa-lightbulb"></UnlockIcon>Can't find what you're looking for?
												</StyledContentRequestButton>
											)}
											<StyledUnlock to="/unlock" title="Unlock content">
												<UnlockIcon className="fal fa-unlock-alt"></UnlockIcon>Unlock content
											</StyledUnlock>
											<SearchBar value="" isShowFlyOut={isShowFlyOut} flyOutMessage={flyOutMessage} myUserDetails={userDetails} isMobile={isMobile} />
										</SearchWrap>
									</Row>
								</TopBar>
							</Container>
							{isShowContentRequestModal && (
								<ContentRequestModal api={this.props.api} handleClose={this.hideContentRequestModal}></ContentRequestModal>
							)}
						</>
					);
				}
			}
		)
	)
);
