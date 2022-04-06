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

const NavigationBar = styled.ul`
	a {
		color: ${theme.colours.primary};
	}
`;

const StyledLink = styled.a`
	color: ${theme.colours.primary};
	text-decoration: underline;

	:hover {
		text-decoration: underline;
	}
`;

const WrapRow = styled(Row)`
	justify-content: center;
`;

const LinksUrl = [
	{ name: "Prerequisites", url: "/how-to-copy#Prerequisites" },
	{ name: "Create your classes", url: "/how-to-copy#Create your classes" },
	{ name: "Finding a book on the Platform", url: "/how-to-copy#Find the book" },
	{ name: "Unlock your book", url: "/how-to-copy#Unlock your book" },
	{ name: "Make copies", url: "/how-to-copy#Make copies" },
	{ name: "Use your new copy", url: "/how-to-copy#Use your new copy" },
];

export default class CopyPage extends React.PureComponent {
	render() {
		return (
			<>
				<HeadTitle title={PageTitle.copy} />
				<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
				<MainTitle title="How to make copies" icon="fa-copy" id={JUMP_TO_CONTENT_ID} />
				<Container>
					<WrapRow>
						<PageContentMedium>
							<Row>
								<PageLeftIconContent />
								<PageContentLarge>
									<PageContainer>
										<section>
											<NavigationBar>
												{LinksUrl.map((item, index) => (
													<li key={index}>
														<a href={item.url}>{item.name}</a>
													</li>
												))}
											</NavigationBar>

											<p>We have tried to make it as simple as possible to create copies for your classes.</p>

											<a name="Prerequisites" />
											<h3>Prerequisites</h3>
											<ul>
												<li>You will need to be a registered user and logged in</li>
												<li>
													To manually unlock books which haven't been unlocked for your institution before, you will need a webcam to scan its
													barcode.
												</li>
												<li>
													You will need to have created classes on the Platform. We use these for royalty purposes and to make sure you can access
													your full entitlement to make copies under the terms of the licence.
												</li>
											</ul>

											<a name="Create your classes" />
											<h3>Create your classes</h3>
											<p>
												To make copying under the licence terms as easy as possible, we suggest creating all the classes you anticipate teaching on
												the Platform before starting to make copies.
											</p>
											<p>Navigate to the administration page. First, open the drop-down menu under your name and select “Administration”.</p>
											<p>Then, click on “Classes”. Here you will be able to verify if you have your list of classes ready.</p>
											<p>If you need to create a class, remain on the “Class Management” page and click on the “Create Class” button.</p>
											<p>Please fill the form with any relevant details about your class.</p>

											<a name="Find the book" />
											<h3>Finding a book on the Platform</h3>
											<p>
												You can determine whether the book you wish to use is on the Platform by either searching for it, or by going to unlock it
												directly.
											</p>
											<p>
												There is a search box on every page of the site that enables you to enter either title, author, keywords or the ISBN to find
												the book. Simply enter your query and hit enter or click on the magnifying glass icon. If your search has results, you will
												see a list of titles on the new page opened when you submitted your query.
											</p>
											<p>
												If you have no results, it is likely that the book has not been added to the Platform. But you can double check by trying to
												unlock your physical copy in the next step.
											</p>
											<p>
												If you, an administrator, or another teacher or member of staff have previously unlocked a book, you can select it and proceed
												directly to click “Make a new copy” to choose pages for copying.
											</p>

											<a name="Unlock your book" />
											<h3>Unlock your book</h3>
											<p>
												There is an "Unlock content" button on every page of the website. To begin unlocking your book, click on it and proceed to the
												“Unlock Content” page.
											</p>
											<p>First, click on the camera logo to activate your webcam for scanning.</p>
											<p>
												To successfully unlock a book you need to hold the book steady and ensure the barcode occupies a sizeable portion of the
												camera frame; the resolution of the camera on some older devices may not be sufficient to recognise the detail of the barcode,
												in which case contact us.
											</p>
											<p>
												If you don't have access to a webcam, or it is disabled for security reasons, you will still be able to have your books
												unlocked on the Platform. Please get in touch and we will determine the best course of action so that you can access your
												institution's books.
											</p>

											<a name="Make copies" />
											<h3>Make copies</h3>
											<p>
												When a book is unlocked, you will be able to review copies created at your institution. This way you can see what you and your
												colleagues have already done with the book.
											</p>
											<p>Select a class to proceed to the next step.</p>
											<p>
												<img src={require("./how to make copies_1.jpg")} />
											</p>
											<p>This is where you can preview the book, select pages, and copy within the terms of your CLA licence.</p>
											<p>
												<img src={require("./how to make copies_2.jpg")} />
											</p>

											<h4>There are some important features on this page to help you make copies:</h4>
											<ul>
												<li>Consult the table of contents on the left to help you navigate the preview</li>
												<li>Page through the book preview using the arrows on either side</li>
												<li>Select and unselect pages for your copy</li>
												<li>Type in or edit the numerical range of pages</li>
											</ul>

											<p>
												Page through the book preview, making sure that the pages you want are ticked. When you have the pages you want, we advise
												double checking them and verifying the page numbers on the preview.
											</p>
											<p>If you want to re-do your selection, click “Reset”.</p>
											<p>
												<img src={require("./how to make copies_3.jpg")} />
											</p>
											<p>
												When you're ready, click the “Next” button to proceed to your high-quality copy and share it with your students. You will then
												be asked to confirm some details about this copy for royalty purposes.
											</p>

											<a name="Use your new copy" />
											<h3>Use your new copy</h3>
											<p>
												Once you have created your copy, the website will inform you that it has been saved for your use. This page lets you review
												your copy, print it to make paper handouts and share links to it with your students via email or your virtual learning
												environment, or you can share directly to Google Classroom or Microsoft Teams. You can also share a link to our public record
												for the book on social media, to recommend it to others in the profession.
											</p>
											<p>
												<img src={require("./how to make copies_4.jpg")} />
											</p>
											<h4>This page has several useful features to help you make the most of your new copy.</h4>
											<ul>
												<li>Add a note — create a post-it like note to annotate pages for your students</li>
												<li>Highlight — easily highlight key points for your students</li>
												<li>Create citation — lets you or your students quickly cite the text</li>
												<li>Print — make high quality printouts for your lessons</li>
												<li>Fullscreen — for a quick uncluttered view of your copy</li>
												<li>Edit copy name — useful if you think of a more memorable name for it</li>
												<li>Create link button — generate a web address you can pass to your students</li>
												<li>Social media buttons — easily recommend this book</li>
											</ul>
											<p>
												Simply click print to produce print copies with your printer or click on the create link button to start sharing with your
												students via email or your VLE, or directly to MS Teams or Google Classroom.
											</p>
											<StyledLink href="https://educationplatform.zendesk.com/hc/en-us" target="_blank">
												To learn more about how to use the Education Platform, visit our online Knowledgebase.
											</StyledLink>
											<br />
											<br />
											<p>
												<img src={require("./how to make copies_5.jpg")} />
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
