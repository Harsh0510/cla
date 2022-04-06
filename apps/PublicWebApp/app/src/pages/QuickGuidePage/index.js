import React from "react";
import Header from "../../widgets/Header";
import styled from "styled-components";
import theme from "../../common/theme";
import MainTitle from "../../widgets/MainTitle";
import ListWithCheckBox from "../../widgets/ListWithCheckBox";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import { Link } from "react-router-dom";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { PageContentMedium } from "../../widgets/Layout/PageContentMedium";
import { PageContentLarge } from "../../widgets/Layout/PageContentLarge";
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

const AnchorLink = styled(Link)`
	font-weight: bold;
	color: ${theme.colours.primary};
	background: transparent;
	text-decoration: none;
`;

const Paragraph = styled.p`
	margin: 2em 0;
`;

const ContentSection = styled(Row)`
	justify-content: center;
`;

const GUIDE_LIST = [
	{
		name: "Before making any copies, an institution must demonstrate ownership of a book by scanning the barcode to unlock it. CLA reserve the right to verify that an institution owns a book.",
		checked: true,
	},
	{ name: "Each teacher or member of staff using the Education Platform must have a user account.", checked: true },
	{ name: "A teacher or member of staff can copy up to 5% of a book per class.", checked: true },
	{
		name: "Copies can only be distributed to students and staff of the educational establishment under the licence. For the avoidance of doubt, an educational establishment is an individual institution and not a group of institutions such as a Multi Academy Trust.",
		checked: true,
	},
	{
		name: "Copies can be stored on the Education Platform for up to three months or until the end of the academic year, whichever is sooner.",
		checked: true,
	},
	{
		name: "Each institution and its teachers and other members of staff are responsible for ensuring that all copying is done within the terms of the CLA Education Licence.",
		checked: true,
	},
	{ name: `The Education Platform can only be accessed by a member of staff at a UK institution and is not available to students.`, checked: true },
];

export default class AboutPage extends React.PureComponent {
	render() {
		return (
			<>
				<HeadTitle title={PageTitle.quickGuide} />
				<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
				<MainTitle title={PageTitle.quickGuide} icon="fa-info-circle" id={JUMP_TO_CONTENT_ID} />
				<Container>
					<ContentSection>
						<PageContentMedium>
							<Row>
								<PageLeftIconContent />
								<PageContentLarge>
									<PageContainer>
										<Paragraph>
											Please also read our full{" "}
											<AnchorLink to="/terms-of-use" title="Terms of Use">
												Terms of Use
											</AnchorLink>
										</Paragraph>
										<ListWithCheckBox options={GUIDE_LIST} isIcon={true} />
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
