import React from "react";
import Header from "../../widgets/Header";
import styled from "styled-components";
import theme from "../../common/theme";
import MainTitle from "../../widgets/MainTitle";
import ListWithCheckBox from "../../widgets/ListWithCheckBox";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { PageContentMedium } from "../../widgets/Layout/PageContentMedium";
import { PageContentLarge } from "../../widgets/Layout/PageContentLarge";
import { PageLeftIconContent } from "../../widgets/Layout/PageLeftIconContent";
import sendEmailList from "../../common/sendEmailList";

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

const AboutSection = styled.div`
	h3 {
		line-height: 1.2em;
	}
`;

const LinksSection = styled.div`
	margin-top: 1em;
`;

const StyledLink = styled.a`
	color: ${theme.colours.primary};
`;

const WrapRow = styled(Row)`
	justify-content: center;
`;

const ImageWrap = styled.div`
	font-size: 0;
	img {
		display: inline-block;
		font-size: 16px;
		margin-right: 1em;
		margin-bottom: 1em;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		img {
			display: block;
		}
	}
`;

const YoutubeEmbed = styled.iframe`
	width: 560px;
	height: 315px;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		width: 272px;
		height: 153px;
	}
`;

const BENEFITS_LIST = [
	{
		name: (
			<>
				Completely <strong>free</strong> access to digital resources paid for by your Government so you can use the resources to support your teaching
			</>
		),
		checked: true,
	},
	{ name: "Digital versions of books your school or college owns to make and share copies with students", checked: true },
	{ name: "High quality copies for sharing on a school VLE, or via Teams, Google Classroom or by emailing a link", checked: true },
	{ name: "Flexibility to work remotely to prepare and deliver lesson resources", checked: true },
	{ name: "Delivers a greener way of working and saves money by reducing photocopying and printing", checked: true },
];

const LINKS = [
	{ name: "Terms of use", url: "/terms-of-use" },
	{ name: "Registering as a user", url: "/how-to-register" },
	{ name: "Using the Platform to make copies", url: "/how-to-copy" },
	{ name: "Frequently asked questions", url: "/faq" },
	{ name: "Education Platform Knowledge Base", url: "https://educationplatform.zendesk.com/hc/en-us" },
	{ name: "Accessing more support", url: "/support" },
];

export default class AboutSchoolPage extends React.PureComponent {
	render() {
		return (
			<>
				<HeadTitle title={PageTitle.about} hideSuffix={true} />
				<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
				<MainTitle id={JUMP_TO_CONTENT_ID} title="About the Education Platform" icon="fa-info-circle" />
				<Container>
					<WrapRow>
						<PageContentMedium>
							<Row>
								<PageLeftIconContent />
								<PageContentLarge>
									<PageContainer>
										<AboutSection>
											<h3>
												The Copyright Licensing Agency Education Platform is an online service that gives schools covered by the CLA Education Licence
												access to digital resources to use for teaching.
											</h3>
											<ul>
												<li>
													<StyledLink href="/about-for-school#AboutVideoTour">Video tour</StyledLink>
												</li>
												<li>
													<StyledLink href="/about-for-school#AboutBenefits">Benefits</StyledLink>
												</li>
												<li>
													<StyledLink href="/about-for-school#AboutWonde">Using the Education Platform via Wonde</StyledLink>
												</li>
											</ul>
											<p>
												The Education Platform has been developed by the Copyright Licensing Agency (CLA) to enable teachers and other staff to access
												digital versions of books and magazines owned by the school. It facilitates the making and sharing of copies with students for
												learning and teaching, within the terms of the{" "}
												<StyledLink href="https://www.cla.co.uk/licencetocopy" target="_blank">
													CLA Education Licence
												</StyledLink>
												.
											</p>
											<p>
												The Licence is funded centrally by the Department of Education and other national governments in the UK, so that all state
												schools in England, Scotland, Wales and Northern Ireland can make copies (including photocopies) of up to 5% of a published
												work, and use the resources at no extra cost.
											</p>
											<p>
												Most independent schools plus sixth form and further education colleges can also use the service under the terms of their{" "}
												<StyledLink href="https://www.cla.co.uk/licencetocopy" target="_blank">
													CLA Education Licence
												</StyledLink>
												.
											</p>
										</AboutSection>
										<h3 id="AboutVideoTour">Take a quick video tour of the Education Platform (1'30" duration)</h3>
										<YoutubeEmbed
											width="560"
											height="315"
											src="https://www.youtube.com/embed/F7Bg-N8yZN8"
											title="YouTube video player"
											frameBorder="0"
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
											allowFullScreen={true}
										></YoutubeEmbed>
										<br />
										<br />
										<h3 id="AboutBenefits">Give your teachers and school staff these benefits</h3>
										<ListWithCheckBox options={BENEFITS_LIST} isIcon={true} />
										<ImageWrap>
											<img src={require("../../assets/images/wonde.png")} width={200} />
											<img src={require("../../assets/images/cla.png")} width={200} />
										</ImageWrap>
										<h3 id="AboutWonde">The Copyright Licensing Agency Education Platform has partnered with Wonde</h3>
										<p>
											To make using the Education Platform even easier for schools, we have now teamed up with{" "}
											<StyledLink href="https://wonde.com/" target="_blank">
												Wonde
											</StyledLink>{" "}
											so you can synchronise the Platform with your school MIS.
										</p>
										<p>
											This means teachers and staff at your school will not only have their own logins automated, but it will also save you time at
											the start of every academic year when new teachers/staff leave or join your school.
										</p>
										<h4>Wonde users – how to approve use of the Copyright Licensing Agency – Education Platform</h4>
										<p>Wonde administrators can connect to the Education Platform via the Wonde dashboard by following these simple steps:</p>
										<ol>
											<li>
												To approve access please login to Wonde here - {" "}
												<StyledLink href="http://edu.wonde.com/" target="_blank">
													edu.wonde.com
												</StyledLink>
											</li>
											<li>
												Within your Wonde dashboard, click on the <em>"Pending"</em> Copyright Licensing Agency - Education Platform tile
											</li>
											<li>Click on the blue banner</li>
											<li>Expand and view the permissions</li>
											<li>Approve</li>
											<li>
												Complete user registration - following approval, an automated email will be sent directly to all of the teachers at your
												school, inviting them to set up their password to complete their user registration.
											</li>
										</ol>
										<p>
											Once registration is confirmed, teachers and staff can start using the Education Platform straight away by following the
											onscreen prompts to help them make their first copy.
										</p>
										<h4>Help getting connected with Wonde</h4>
										<p>
											If you have any questions about approving the Copyright Licensing Agency - Education Platform in Wonde, please contact Wonde
											directly: <StyledLink href="mailto:support@wonde.com">support@wonde.com</StyledLink>
										</p>
										<h4>Support using the Education Platform</h4>
										<p>
											Once teachers have registered there is lots of help on the Education Platform to help you find books and guide you through the
											Platform. For Education Platform support you might like to try our{" "}
											<StyledLink href="https://educationplatform.zendesk.com/hc/en-us">Knowledge Base</StyledLink> developed specifically to support
											users or you can contact: <StyledLink href={"mailto:" + sendEmailList.supportEP}>{sendEmailList.supportEP}</StyledLink>
										</p>
										<LinksSection>
											<h3>Other useful links</h3>
											<ListWithCheckBox options={LINKS} isIcon={false} isUrls={true} />
										</LinksSection>
									</PageContainer>
								</PageContentLarge>
							</Row>
						</PageContentMedium>
					</WrapRow>
				</Container>
			</>
		);
	}
}
