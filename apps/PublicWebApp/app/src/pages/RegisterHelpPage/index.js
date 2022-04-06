import React from "react";
import Header from "../../widgets/Header";
import styled from "styled-components";
import theme from "../../common/theme";
import MainTitle from "../../widgets/MainTitle";
import ListWithCheckBox from "../../widgets/ListWithCheckBox";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import sendEmailList from "../../common/sendEmailList";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { PageContentLarge } from "../../widgets/Layout/PageContentLarge";
import { PageContentMedium } from "../../widgets/Layout/PageContentMedium";
import { PageLeftIconContent } from "../../widgets/Layout/PageLeftIconContent";

const JUMP_TO_CONTENT_ID = "main-content";

const PageContainer = styled.div`
	max-width: 100%;
	padding: 1em 0;
	text-align: justify;
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		padding: 3em 0;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding: 1em 0;
	}
	ul.square {
		list-style-type: square;
	}
`;

const AnchorLink = styled.a`
	color: ${theme.colours.primary};
	background: transparent;
	text-decoration: none;
`;

const ContentSection = styled(Row)`
	justify-content: center;
`;

const LINKS = [
	{ name: "About the Platform", url: "/about" },
	{ name: "Using the Platform to make copies", url: "/how-to-copy" },
	{ name: "Frequently asked questions", url: "/faq", target: true },
	{ name: "Accessing more support", url: "/support" },
];

const supportEmail = sendEmailList.supportEP;

export default class RegisterHelp extends React.PureComponent {
	render() {
		return (
			<>
				<HeadTitle title={PageTitle.registerHelp} />
				<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
				<MainTitle title="Registering as a user" icon="fa-info-circle" id={JUMP_TO_CONTENT_ID} />
				<Container>
					<ContentSection>
						<PageContentMedium>
							<Row>
								<PageLeftIconContent />
								<PageContentLarge>
									<PageContainer>
										<p>
											If you are a school or FE college that is covered by the CLA Education Licence you can sign up for an account to use the
											Platform.
										</p>
										<section>
											<h3>Most schools are eligible</h3>
											<p>
												CLA licenses UK schools via agreements with representative bodies at national and local authority level and licence fees are
												paid centrally. Even if you are not aware of it, you are still likely to be covered.
											</p>
											<p>
												In practice, all state-funded schools and most independent schools are covered by the Licence and are therefore eligible to
												sign up to use the Education Platform.
											</p>
											<p>
												If you are an independent school and are not sure if you hold a licence, please contact our agents the{" "}
												<AnchorLink href="https://iaps.uk" title="Independent Association of Prep Schools" target="_blank">
													Independent Association of Prep Schools{" "}
												</AnchorLink>{" "}
												or{" "}
												<AnchorLink href="http://www.scis.org.uk/" title="SCIS" target="_blank">
													SCIS
												</AnchorLink>{" "}
												to check.
											</p>
											<p>Most UK further education institutions are licensed by us directly. If you are unsure, please contact us.</p>
										</section>
										<section>
											<h3>Setting up an account is easy</h3>
											<p>
												If your institution is already active on the Platform, you can ask your Platform administrator to add you as a user. You can
												also register as an individual teacher or member of staff using your official school or college email address via the Register
												page.
											</p>
											<p>
												If you have difficulty with this or would like to set up a whole institution, please{" "}
												<AnchorLink href={"mailto:" + supportEmail} title={supportEmail}>
													contact us
												</AnchorLink>{" "}
												for help.
											</p>
										</section>
										<section>
											<h3>Useful links</h3>
											<ListWithCheckBox options={LINKS} isIcon={false} isUrls={true} />
										</section>
									</PageContainer>
								</PageContentLarge>
							</Row>
						</PageContentMedium>
					</ContentSection>
				</Container>
			</>
		);
	}
}
