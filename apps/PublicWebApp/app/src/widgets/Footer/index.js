import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faInstagram, faFacebookSquare, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import theme from "../../common/theme";
import { SendRequestHelp, SendGeneralEnquiry } from "../../widgets/SendEmailLink";
import withAuthConsumer from "../../common/withAuthConsumer";
import sendEmailList from "../../common/sendEmailList";
import { Container } from "../Layout/Container";
import { Row } from "../Layout/Row";
import { FooterColumn } from "../Layout/FooterColumn";

const StyledFooter = styled.footer`
	font-size: 12px;
	background-color: ${theme.colours.footerBackGrounColor};
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	color: ${theme.colours.white};
	a:hover {
		color: ${theme.colours.lime};
	}
	background-image: url(${require("../../assets/images/footer-bg-new.png")});
	background-repeat: no-repeat;

	@media screen and (max-width: ${theme.breakpoints.tabletPro}) {
		position: relative;
	}

	a {
		color: ${theme.colours.white};
		text-decoration: none;
		font-weight: 500;
	}

	ul {
		padding: 0;
		list-style: none;
	}

	@media print {
		display: none;
	}
`;

const FooterListTop = styled.ul``;

const AddressBox = styled.div`
	margin-bottom: 1rem;
	font-style: normal;
	line-height: inherit;
`;

const FooterLogo = styled.div`
	padding-left: 55px;
	padding-top: 3rem;
	@media screen and (max-width: ${theme.breakpoints.desktop3}) and (min-width: ${theme.breakpoints.mobile1}) {
		padding-left: 70px;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		padding-top: 75px;
		padding-bottom: 20px;
	}
`;

const ContactInfo = styled(FooterColumn)`
	padding-bottom: 1rem;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		border-top: 1px solid rgba(255, 255, 255, 0.32);
		padding-top: 1rem;
	}
`;

const WrapInfo = styled.p`
	margin-bottom: 0;
`;

const FooterWrapper = styled(Row)`
	align-items: center;
	justify-content: space-between;
`;

const FooterListTopWrap = styled(FooterColumn)`
	padding-top: 0;
	@media screen and (min-width: 576px) {
		padding-top: 1rem;
	}
`;

const FooterLogoWrap = styled(FooterColumn)`
	text-align: left;
`;

const WrapAddressBox = styled(FooterColumn)`
	padding-top: 1rem;
`;

const SocialMediaLinks = styled.div`
	font-size: 1.2rem;
	margin-left: -0.1em;
`;

const SocialMediaLink = styled.a`
	display: inline-block;
	padding: 0.1em;
`;

export default withAuthConsumer(
	class Footer extends React.PureComponent {
		state = {
			links: [
				[
					{
						label: "Copyright Notice",
						url: "https://www.cla.co.uk/copyright-notice",
						dataLink: "copyright-notice",
					},
					{
						label: "Privacy Policy",
						url: "https://www.cla.co.uk/privacy-policy",
						dataLink: "privacy-policy",
					},
					{
						label: "Terms of use",
						url: "/terms-of-use",
						dataLink: "terms-of-use",
					},
					{
						label: "Accessibility Policy",
						url: "https://www.cla.co.uk/accessibility-policy",
						dataLink: "accessibility-policy",
					},
					{
						label: "Anti-slavery Policy",
						url: "https://www.cla.co.uk/anti-slavery-policy",
						dataLink: "anti-slavery-policy",
					},
				],
				[
					{
						label: "Contact us",
						url: "mailto:" + sendEmailList.supportCLA,
						dataLink: "contact-us",
					},
				],
			],
		};

		render() {
			return (
				<StyledFooter>
					<Container>
						<FooterWrapper>
							<FooterLogoWrap>
								<FooterLogo>
									<a href="/">
										<img src={require("./../../assets/images/footer-logo.png")} alt="CLA logo" width="152" height="44" />
									</a>
								</FooterLogo>
							</FooterLogoWrap>
							<WrapAddressBox>
								<AddressBox>
									The Copyright Licensing Agency
									<br />
									5th Floor
									<br />
									Shackleton House
									<br />
									Hays Galleria
									<br />
									4 Battle Bridge Lane
									<br />
									London SE1 2HX
								</AddressBox>
							</WrapAddressBox>
							<FooterListTopWrap>
								<FooterListTop>
									{this.state.links[0].map((item, index) => (
										<li key={index}>
											<a href={item.url} target="_blank" data-ga-footer-nav="true" data-ga-link={item.dataLink}>
												{item.label}
											</a>
										</li>
									))}
								</FooterListTop>
							</FooterListTopWrap>
							<ContactInfo>
								<WrapInfo>Registered in England No. 1690026</WrapInfo>
								<div>
									<SendRequestHelp isBold={true} myUserDetails={this.props.withAuthConsumer_myUserDetails} />
								</div>
								<div>
									<SendGeneralEnquiry myUserDetails={this.props.withAuthConsumer_myUserDetails} />
								</div>
								<div>
									<a href="https://educationplatform.zendesk.com/hc/en-us" target="_blank">
										<strong>Knowledge base</strong>
									</a>
								</div>
								<SocialMediaLinks>
									<SocialMediaLink href="https://twitter.com/EduPlatformUK" target="_blank" rel="nofollow">
										<FontAwesomeIcon icon={faTwitter} />
									</SocialMediaLink>
									<SocialMediaLink href="https://www.instagram.com/EduPlatformUK" target="_blank" rel="nofollow">
										<FontAwesomeIcon icon={faInstagram} />
									</SocialMediaLink>
									<SocialMediaLink href="https://www.facebook.com/EduPlatformUK" target="_blank" rel="nofollow">
										<FontAwesomeIcon icon={faFacebookSquare} />
									</SocialMediaLink>
									<SocialMediaLink href="https://www.linkedin.com/company/education-platform-uk" target="_blank" rel="nofollow">
										<FontAwesomeIcon icon={faLinkedin} />
									</SocialMediaLink>
								</SocialMediaLinks>
							</ContactInfo>
						</FooterWrapper>
					</Container>
				</StyledFooter>
			);
		}
	}
);
