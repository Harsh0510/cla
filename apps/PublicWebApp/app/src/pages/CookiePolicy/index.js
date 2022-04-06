import React from "react";
import Header from "../../widgets/Header";
import styled from "styled-components";
import theme from "../../common/theme";
import MainTitle from "../../widgets/MainTitle";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
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

const WrapRow = styled(Row)`
	justify-content: center;
`;

export default class CookiePolicy extends React.PureComponent {
	render() {
		return (
			<>
				<HeadTitle title={PageTitle.cookiepolicy} />
				<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
				<MainTitle title="Cookie Policy" icon="fa-info-circle" id={JUMP_TO_CONTENT_ID} />
				<Container>
					<WrapRow>
						<PageContentMedium>
							<Row>
								<PageLeftIconContent />
								<PageContentLarge>
									<PageContainer>
										<section>
											<h3>What is a cookie?</h3>
											<p>
												A cookie is a small file which is placed on your computer's hard drive. This helps to analyse web traffic or lets you know
												when you visit a particular site. Cookies allow web applications to respond to you as an individual.
											</p>
										</section>
										<section>
											<h3>What cookies do we use on the Education Platform?</h3>
											<p>
												Tracking and Analytics – the Education Platform stores depersonalised information about our users that enables us to
												understand what our most popular features are, how users are using site functions. These last for two years.
											</p>
										</section>
										<section>
											<h3>Controlling cookies</h3>
											<p>
												Most browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites
												to set cookies, you may worsen your overall user experience, since it will no longer be personalised to you. It may also stop
												you from saving customised settings like login information. Please note that the Education Platform website will not work
												properly without cookies.{" "}
											</p>
										</section>
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
