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
import { PageContentMedium } from "../../widgets/Layout/PageContentMedium";
import { PageContentLarge } from "../../widgets/Layout/PageContentLarge";
import { PageLeftIconContent } from "../../widgets/Layout/PageLeftIconContent";

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
	{ name: "Registering as a user", url: "/how-to-register" },
	{ name: "Using the Platform to make copies", url: "/how-to-copy" },
	{ name: "Frequently asked questions", url: "/faq", target: true },
];

const supportEmail = sendEmailList.supportEP;
const JUMP_TO_CONTENT_ID = "main-content";

export default class SupportPage extends React.PureComponent {
	render() {
		return (
			<>
				<HeadTitle title={PageTitle.support} />
				<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
				<MainTitle title="Accessing more support" icon="fa-info-circle" id={JUMP_TO_CONTENT_ID} />
				<Container>
					<ContentSection>
						<PageContentMedium>
							<Row>
								<PageLeftIconContent />
								<PageContentLarge>
									<PageContainer>
										<p>
											We hope that you find it easy to use the Education Platform and that your experience is a good one, however if you do need to
											reach out for a little more support you can find it here.
										</p>
										<section>
											<h3>Read our FAQs</h3>
											<p>
												If you have a question or a problem with any aspect of the Platform we would direct you first to our{" "}
												<AnchorLink href="/faq" target="_blank" title="Frequently Asked Questions (FAQs)">
													Frequently Asked Questions (FAQs)
												</AnchorLink>{" "}
												which might just hold the answer.
											</p>
										</section>
										<section>
											<h3>Email Customer Support Helpdesk</h3>
											<p>
												If that doesn't do the trick, you can ask us your question directly by emailing our Customer Support team at 
												<AnchorLink href={"mailto:" + supportEmail} title={supportEmail}>
													{supportEmail}
												</AnchorLink>
											</p>
										</section>
										<section>
											<h3>Telephone Customer Support</h3>
											<p>
												If you need to speak with someone right away, then please contact our Customer Support team by calling us on 020 7400 3157
											</p>
										</section>
										<section>
											<h3>If you need more support – please ask us</h3>
											<p>
												If you are facing challenges setting up your institution and getting your books and your teachers and other users ready to
												start using the Platform, please speak to us. We are always happy to help you.
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
