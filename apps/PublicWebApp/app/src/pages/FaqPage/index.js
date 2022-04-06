import React from "react";
import Header from "../../widgets/Header";
import styled from "styled-components";
import theme from "../../common/theme";
import FaqList from "./FaqList";
import ExpandablePanel from "../../widgets/ExpandablePanel";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import ListWithCheckBox from "../../widgets/ListWithCheckBox";
import { colLg1, colLg11, colLg12, colMd12, colMd2 } from "../../common/style";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { PageContentLarge } from "../../widgets/Layout/PageContentLarge";

const JUMP_TO_CONTENT_ID = "main-content";
const MainTitleWrap = styled.div`
	padding: 1.25em 0;
	background-color: ${theme.colours.bgDarkPurple};
	color: ${theme.colours.white};
`;

const FormIcon = styled.div`
	height: 63px;
	width: 63px;
	line-height: 60px;
	text-align: center;
	background-color: ${theme.colours.white};
	color: ${theme.colours.bgDarkPurple};
	border-radius: 50%;
	i {
		font-size: 35px;
		vertical-align: middle;
	}

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		margin-bottom: 1em;
	}
`;

const FormTitle = styled(PageContentLarge)`
	${colLg11}

	font-size: 16px;
	h1 {
		font-size: 38px;
		line-height: 1.2;
		margin-bottom: 0;
		margin-top: 9px;
	}

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		h1 {
			font-size: 25px;
		}
		p {
			font-size: 17px;
		}
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		h1 {
			line-height: 1;
		}
		p {
			font-size: 17px;
		}
	}
`;

const StyledLink = styled.a`
	color: ${theme.colours.primary};
`;

const LinksSection = styled.div`
	margin-top: 1em;
	padding-bottom: 5.8125em;

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		padding-bottom: 2.8125em;
	}
`;

const TextAboveFAQ = styled.div`
	margin-top: 3em;
`;

const WrapRow = styled(Row)`
	justify-content: center;
`;

const FAQContent = styled(Row)`
	padding-top: 2.5em;

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		padding-top: 1em;
	}
`;

const WrapExpandablePanel = styled.div`
	${colMd12}
`;

const WrapFormIcon = styled.div`
	${colMd2}
	${colLg1}
`;

const WrapLinks = styled.div`
	${colLg12}
	${colMd12}
`;

const LINKS = [
	{ name: "About", url: "/about" },
	{ name: "Registering as a user", url: "/how-to-register" },
	{ name: "Using the Platform to make copies", url: "/how-to-copy" },
	{ name: "Accessing more support", url: "/support" },
];

export default class FaqPage extends React.PureComponent {
	state = {
		faqArray: FaqList,
	};

	render() {
		const faqSection = this.state.faqArray.map((item, index) => {
			return (
				<WrapExpandablePanel key={index}>
					<ExpandablePanel faq={item} />
				</WrapExpandablePanel>
			);
		});

		return (
			<>
				<HeadTitle title={PageTitle.faq} />
				<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
				<MainTitleWrap id={JUMP_TO_CONTENT_ID}>
					<Container>
						<WrapRow>
							<PageContentLarge>
								<Row>
									<WrapFormIcon>
										<FormIcon>
											<i className="fal fa-question-circle"></i>
										</FormIcon>
									</WrapFormIcon>
									<FormTitle>
										<h1> Frequently Asked Questions </h1>
									</FormTitle>
								</Row>
							</PageContentLarge>
						</WrapRow>
					</Container>
				</MainTitleWrap>

				<Container>
					<WrapRow>
						<PageContentLarge>
							<Row>
								<WrapLinks>
									<TextAboveFAQ>
										For more FAQs and information about the Education Platform please go to our{" "}
										<StyledLink href="https://educationplatform.zendesk.com/hc/en-us" target="_blank">
											Knowledge Base
										</StyledLink>
									</TextAboveFAQ>
									<FAQContent>{faqSection}</FAQContent>
									<LinksSection>
										<h3>Useful links</h3>
										<ListWithCheckBox options={LINKS} isIcon={false} isUrls={true} />
									</LinksSection>
								</WrapLinks>
							</Row>
						</PageContentLarge>
					</WrapRow>
				</Container>
			</>
		);
	}
}
