import React from "react";
import Header from "../../widgets/Header";
import styled from "styled-components";
import theme from "../../common/theme";
import MainTitle from "../../widgets/MainTitle";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import sendEmailList from "../../common/sendEmailList";
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
		padding: 1em 0.5em;

		ol > li > ol {
			margin: 0 0 0 -50px;
		}

		ol > li > h3 {
			display: inline;
		}

		ol > li:before {
			display: inline-block;
			width: 50px;
		}

		ol > li > ol > li:before {
			display: table-cell;
			padding: 0 10px 0 0;
		}
	}

	ul.alpha {
		list-style-type: upper-alpha;
	}

	ol {
		list-style-type: none;
		counter-reset: item;
		margin: 0;
		padding: 0;
	}

	ol > li {
		display: table;
		counter-increment: item;
		margin-bottom: 0.6em;
	}

	ol > li:before {
		content: counters(item, ".") ". ";
		display: table-cell;
		padding-right: 0.5em;
		font-size: 1.625em;
		font-weight: bolder;
	}

	li ol > li {
		margin: 0;
	}

	li ol > li:before {
		content: counters(item, ".") " ";
		font-size: inherit;
	}
`;

const AnchorLink = styled.a`
	color: ${theme.colours.primary};
	background: transparent;
	text-decoration: none;
	word-break: break-word;
`;

const ContentSection = styled(Row)`
	justify-content: center;
`;

const SubSection = styled.div`
	padding-left: 2em;
`;

const supportEmail = sendEmailList.supportEP;

export default class TermsUsePage extends React.PureComponent {
	render() {
		return (
			<>
				<HeadTitle title={PageTitle.termsofuse} />
				<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
				<MainTitle title="Terms of Use" icon="fa-info-circle" id={JUMP_TO_CONTENT_ID} />
				<Container>
					<ContentSection>
						<PageContentMedium>
							<Row>
								<PageLeftIconContent />
								<PageContentLarge>
									<PageContainer>
										<p>
											All definitions used in the CLA Education Licence, including without limitation the definitions of 'Educational Establishments',
											'Digital' Copies' and 'Digital Material' in that Licence, shall also apply in these Terms of Use and these Terms of Use should
											be read together with{" "}
											<AnchorLink
												href="https://cla.co.uk/sites/default/files/CLA-Education-Licence.pdf"
												title="CLA Education Licence"
												target="_blank"
											>
												the CLA Education Licence
											</AnchorLink>
											.
										</p>
										<section>
											<h3>WHEREAS:</h3>
											<ul className="alpha">
												<li>
													<p>
														By arrangement with representative governmental bodies in the United Kingdom, Educational Establishments ("the Licensee")
														are licensed by CLA throughout the United Kingdom via several representative governmental bodies for the purpose of
														reproducing from print and digital books, journals and magazines extracts from Licensed Material and the copying, storage,
														communication and use of Digital Copies and Digital Material ("
														<AnchorLink
															href="https://cla.co.uk/sites/default/files/CLA-Education-Licence.pdf"
															title="CLA Education Licence"
															target="_blank"
														>
															the CLA Education Licence
														</AnchorLink>
														"). The full list of representative bodies administering the licence, along with the User Guidelines, can be found{" "}
														<AnchorLink href="https://cla.co.uk/cla-schools-licence" title="CLA School Licence" target="_blank">
															here
														</AnchorLink>
														.
													</p>
												</li>
												<li>
													<p>
														CLA has developed an online repository for content and a workflow tool application called the Education Platform (as
														defined below) that is intended to facilitate the digital use of Licensed Material under the CLA Education Licence, and
														streamline access and re-use of content based on the terms of the CLA Education Licence, including by: (i) providing an
														easy way to access Digital Material and enabling the making of Digital Copies and (ii) providing secure online access to
														these Digital Copies by users in accordance with the terms of the CLA Education Licence and the other provisions set out
														below.{" "}
													</p>
												</li>
												<li>
													<p>
														CLA has agreed to make available to the Licensee the Education Platform at no additional charge subject to and in
														accordance with these Terms of Use.
													</p>
												</li>
											</ul>
										</section>
										<section>
											<ol>
												<li>
													<h3> DEFINITIONS</h3>
													<p>
														The definitions below shall apply in addition to those set out in the CLA Education Licence. Where there is any conflict
														between these Terms of Use and the CLA Education Licence in relation to rights in Licensed Material, compliance with the
														CLA Education Licence and any actual or alleged infringement of such rights, the terms of the CLA Education Licence shall
														take priority.
													</p>
													<SubSection>
														<p>
															<strong>"the Education Platform":</strong> the online repository for content and workflow tool application made
															available to the Licensee as part of their CLA Education Licence which can be accessed via the following URL:{" "}
															<AnchorLink href="https://www.educationplatform.co.uk" target="_blank" title="Education Platform">
																https://www.educationplatform.co.uk
															</AnchorLink>
														</p>
														<p>
															<strong>"End User":</strong> any individual user of a Licensee who is accessing Licensed Material as an Authorised
															Person under the terms of the CLA Education Licence including School Administrators.
														</p>
														<p>
															<strong>"School Administrator":</strong> any End User who is authorised by the Licensee and the CLA to administer the
															Licensee accounts including but not limited to creation of teacher accounts, creation of classes and editing school
															information.
														</p>
														<p>
															<strong>"Licensee Personal Data": </strong> personally identifiable information of the End User including name, job
															title, work email address, IP address, name of the Educational Establishment the End User is associated with.{" "}
														</p>
														<p>
															<strong>"Personal Data", "Data Controller" and "Data Processor" </strong> shall have the meanings set out in the General
															Data Protection Regulation or other applicable Data Protection Legislation.
														</p>
														<p>
															<strong>"Data Protection Legislation": </strong> the General Data Protection Regulation, the Data Protection Act 2018
															and any laws amending or replacing them.
														</p>
														<p>
															<strong>"Software": </strong> the code, databases and other elements of the Education Platform excluding Licensed
															Material, the Licensee Personal data and the Usage Data.
														</p>
														<p>
															<strong>"Supplier": </strong> CLA's technology partner(s).
														</p>
														<p>
															<strong>"Usage Data": </strong> data generated by or on behalf of CLA in relation to usage of the Education Platform
															including its records of the number of times access is made to each item of content.
														</p>
														<p>
															All references to the singular may include the plural and vice versa as the context so requires and references to any
															gender shall include both genders. References to <strong>"include"</strong> and <strong>"including"</strong> shall be
															for illustrative purposes and not be construed to limit the sense of the preceding words.
														</p>
													</SubSection>
												</li>
												<li>
													<h3>ACCESS TO EDUCATION PLATFORM</h3>
													<ol>
														<li>
															<p>
																CLA shall make available the Education Platform to the Licensee subject to and in accordance with these Terms of Use
																and the CLA Education Licence.
															</p>
														</li>
														<li>
															<p>
																CLA grants the Licensee a revocable, non­-exclusive, non-­transferable, limited licence to use the Software solely in
																accordance with these Terms of Use.
															</p>
														</li>
														<li>
															<p>
																In order to facilitate End User access to the Education Platform, each End User will be issued with login details
																which must not be disclosed to or used by anyone else at any time (whether on a temporary or permanent basis). The
																Licensee shall ensure that each End User maintains their login details securely and shall notify CLA immediately if
																such details have or may have been disclosed to anyone else or subject to misuse. The Licensee may register multiple
																School Administrator and Teacher accounts, each with different logins, as reasonably necessary for its usage of the
																Education Platform.
															</p>
														</li>
														<li>
															<p>
																In order to access the Education Platform in full the Licensee agrees that the End User is required to register an
																individual account. The email address used for the registration shall be the individual's work email address that is
																associated with their Educational Establishment's domain. CLA may object to the registration of some End Users based
																on Clause 8 below (Security).{" "}
															</p>
														</li>
														<li>
															<p>
																A limited view of some parts of the Platform may be available to the public without registering an account however
																access to Digital Copies will be explicitly excluded from such view.
															</p>
														</li>
														<li>
															<p>CLA will provide the Licensee with reasonable support services for the Education Platform at its discretion.</p>
														</li>
													</ol>
												</li>
												<li>
													<h3>CLA AIMS, RIGHTS AND OBLIGATIONS </h3>
													<ol>
														<li>
															<p>
																CLA aims to ensure that the Education Platform is available and operates correctly at all times and that content and
																data within the Education Platform are securely backed up, however, it is agreed and acknowledged by CLA and the
																Licensee/End User that:
															</p>
															<ol>
																<li>
																	<p>
																		CLA makes no guarantee, representation or warranty that the Education Platform is or will be up to date, free from
																		errors or omissions, always available or uninterrupted, secure or free from bugs or viruses or that the content
																		and data within the Education Platform are or will be recoverable from backups;
																	</p>
																</li>
																<li>
																	<p>
																		CLA reserves the right to limit or suspend the Education Platform and/or any service to which it connects (in
																		whole or in part) at any time with or without notice and without liability. Although CLA makes no commitment about
																		any notice period, it aims to notify the Licensee in advance of such non-availability;
																	</p>
																</li>
																<li>
																	<p>
																		The Education Platform is offered on an "as is" basis and CLA does not guarantee, represent or warrant that the
																		Platform will be fit for any particular purpose or that the Education Platform and/or the use of any content or
																		data accessible through the Education Platform will meet the Licensee's requirements or that the Education
																		Platform or such content and data will be compatible and/or interoperable with the Licensee's own hardware and
																		software systems, internet connection and network functionality; and
																	</p>
																</li>
																<li>
																	<p>
																		CLA is not responsible for any delays, delivery failures, or any other loss or damage resulting from the transfer
																		of data over communications networks and facilities, including the internet, and the Licensee acknowledges that
																		the Education Platform may be subject to limitations, delays and other problems inherent in the use of such
																		communications facilities.
																	</p>
																</li>
															</ol>
														</li>
														<li>
															<p>
																CLA reserves the right to suspend access for some or all School Administrators and End Users to the Education Platform
																immediately if CLA becomes aware of any activity which will or is likely to compromise the security or performance of
																the Education Platform. In such event, a School Administrator/End User will be notified by CLA within two hours of the
																suspension occurring and the Licensee shall co-operate in good faith with CLA in order to seek to resolve said event
																as soon as possible.
															</p>
														</li>
														<li>
															<p>
																CLA reserves the right, at its sole discretion, to modify, add to or replace any element of the Education Platform at
																any time with or without notice and without liability. Although CLA makes no commitment about any notice period, it
																aims to notify the Licensee in advance of such change in specifications but CLA does not guarantee, represent or
																warrant that Education Platform compatibility and/or interoperability with the Licensee's own hardware and software
																systems, internet connection and network functionality will not be adversely affected.
															</p>
														</li>
													</ol>
												</li>
												<li>
													<h3>LICENSEE OBLIGATIONS</h3>
													<ol>
														<li>
															<p>The Licensee shall at all times:</p>
															<ol>
																<li>
																	<p>
																		only use the Platform for the making of Digital Copies in accordance with the CLA Education Licence and these
																		Terms of Use and not for any other purpose;
																	</p>
																</li>
																<li>
																	<p>
																		seek to protect the security and integrity of the Education Platform including by procuring that passwords and
																		other login details for the Education Platform are maintained securely in accordance with Clause 2.3 above;
																	</p>
																</li>
																<li>
																	<p>
																		provide CLA with all reasonable co-operation as CLA may request and all reasonable access to such information as
																		may be required by CLA including security access information and configuration services in order to enable CLA to
																		make the Education Platform available;
																	</p>
																</li>
																<li>
																	<p>
																		comply with all applicable laws and regulations with respect to its activities in relation to the Education
																		Platform;
																	</p>
																</li>
																<li>
																	<p>Carry out all Licensee responsibilities set out in these Terms of Use in a timely and efficient manner;</p>
																</li>
																<li>
																	<p>
																		without prejudice and in addition to its obligations to ensure compliance under and in accordance with the CLA
																		Education Licence, procure that its School Administrators and End Users are notified of these Terms of Use and
																		require all School Administrators and End Users to only use the Education Platform in compliance with them;
																	</p>
																</li>
																<li>
																	<p>
																		obtain and maintain all necessary licences, consents, and permissions necessary for the Licensee, its contractors
																		and agents to perform their obligations under these Terms of Use; and
																	</p>
																</li>
																<li>
																	<p>
																		be solely responsible for procuring and maintaining its own hardware and software systems, internet connection and
																		network functionality necessary to connect with and use the Education Platform, and without limitations to enable
																		it to comply with Clause 5.6, subject always to Clauses 3.1.3 and 3.4 above.
																	</p>
																</li>
																<li>
																	<p>
																		The Licensee indemnifies and holds harmless CLA and its directors, officers and employees (on its own behalf and
																		on behalf of its School Administrators and End Users) from any cost, claim or demand (including legal fees and
																		costs) due to or arising out of the Licensee's mis-use of the Licensed Material including infringement of any
																		intellectual property or other right of any person or entity, or any use not in accordance with the CLA Education
																		Licence or these Terms of Use.
																	</p>
																</li>
															</ol>
														</li>
													</ol>
												</li>
												<li>
													<h3>DIGITAL COPIES </h3>
													<ol>
														<li>
															<p>
																Copyright and intellectual property rights in all Licensed Material on the Platform remains with the respective
																rightsholders.{" "}
															</p>
														</li>
														<li>
															<p>
																The Licensee agrees that making of Digital Copies shall be associated with a specific class in the Educational
																Establishment and that overall limitations may apply as set out in, and to comply with, the terms of the CLA Education
																Licence.
															</p>
														</li>
														<li>
															<p>The Licensee acknowledges that copies made within the Education Platform:</p>
															<ol>
																<li>
																	<p>
																		have expiry dates set in conjunction with the CLA Education Licence and that the Digital Copies made may only be
																		used in conjunction with the CLA Education Licence terms.
																	</p>
																</li>
															</ol>
														</li>
														<li>
															<p>The Licensee agrees and shall ensure that End Users are aware and agree that:</p>
															<ol>
																<li>
																	<p>
																		Digital Copies made by an End User will be available to other End Users working within the same Educational
																		Establishment including students;
																	</p>
																</li>
																<li>
																	<p>
																		the Digital Copies made by the End Users may not be distributed to other End users working in other Educational
																		Establishments;
																	</p>
																</li>
																<li>
																	<p>
																		any information relating to the Education Platform and the Licenced Material shared on social media shall be
																		restricted to publicly accessible information such as the content overview which would not require logging onto
																		the Education Platform;
																	</p>
																</li>
																<li>
																	<p>access to Digital Copies shall only be available for Authorised Persons as per Clause 2 above;</p>
																</li>
																<li>
																	<p>
																		in order to be able to make Digital Copies from Licensed Materials in accordance with the CLA Education Licence
																		terms the End User is required to demonstrate ownership of the physical book from which they wish to make Digital
																		Copies by scanning the barcode of the book. Such scanning is only possible when the End User is logged onto the
																		Education Platform. A bulk unlocking may be possible in the event that the Licensee has appointed and registered a
																		School Administrator. Should there be no School Administrator in place a CLA administrator may be able to provide
																		further assistance. CLA shall not be responsible for any hardware related issues leading to unsuccessful scanning
																		of the barcode(s).
																	</p>
																</li>
															</ol>
														</li>
													</ol>
												</li>
												<li>
													<h3>INTELLECTUAL PROPERTY</h3>
													<ol>
														<li>
															<p>
																The Licensee acknowledges and agrees that CLA and/or its licensors and development partners own all intellectual
																property rights in the Education Platform including all Software, features, developments, adaptations, amendments,
																additions, derivative works and customisations designed, created, implemented or applied by CLA in respect of the
																Education Platform whether or not at the request of the Licensee or jointly with the Licensee. Except as expressly
																stated herein, these Terms of Use do not grant the Licensee and/ or the End User any rights, including intellectual
																property rights, or any other rights or licences in respect of the Education Platform.
															</p>
														</li>
														<li>
															<p>
																CLA confirms that it has all the rights in relation to the Software that are necessary to grant all the rights it
																purports to grant under, and in accordance with, these Terms of Use. CLA indemnifies and holds harmless the Licensee
																and its directors, officers and employees from and against any cost, claim or demand (including legal fees and costs)
																in respect of any infringement of intellectual property rights arising out of the Licensee's use of the Software in
																accordance with these Terms of Use.
															</p>
														</li>
														<li>
															<p>
																Subject to the provisions of Clause 7 below, CLA may use the Usage Data for the purposes of distribution of royalties
																to Rightsholders in accordance with the terms of the CLA Education Licence and to inform the development of new
																products and services for the Education sector.
															</p>
														</li>
														<li>
															<p>Except as may otherwise be permitted by these Terms of Use or applicable law, the Licensee shall not:</p>
															<ol>
																<li>
																	<p>
																		sell, resell, sublicense, lease, rent, hire, loan or transfer the Software or redistribute it to any third party;{" "}
																	</p>
																</li>
																<li>
																	<p>
																		remove, obscure or modify copyright notices, disclaimers, means of identification or other text appearing in and
																		pertaining to the Software or the Licensed Material;
																	</p>
																</li>
																<li>
																	<p>make copies of the Software;</p>
																</li>
																<li>
																	<p>use the Software except in accordance with the documentation or instructions provided or published by CLA; or</p>
																</li>
																<li>
																	<p>attempt to use the Software in excess of the rights permitted hereunder and under the CLA Education Licence. </p>
																</li>
															</ol>
														</li>
													</ol>
												</li>
												<li>
													<h3>USE OF PERSONAL DATA </h3>
													<ol>
														<li>
															<p>
																The Licensee shall be the Data Controller of the Licensee Personal Data provided by End Users or School Administrators
																via the Education Platform or otherwise for this purpose, subject to a grant of such rights to CLA as is reasonably
																necessary for CLA to provide use of the Education Platform in accordance with these Terms of Use. The Licensee shall
																have sole responsibility for the legality, reliability, integrity, accuracy and quality of the Licensee Personal Data.
															</p>
														</li>
														<li>
															<p>CLA will use and process the Licensee Personal Data in accordance with its Privacy Notice:</p>
															<ul>
																<li>
																	<p>to enable our services to the End User and to administer the Platform;</p>
																</li>
																<li>
																	<p>to register the End User and the Licensee on the Platform;</p>
																</li>
																<li>
																	<p>to provide support to the End User and to improve our services to the End User and the Licensee;</p>
																</li>
																<li>
																	<p>
																		to manage our relationship with the End User and the Licensee, fulfil requests and notify you of any changes to
																		our services;
																	</p>
																</li>
																<li>
																	<p>to register the End User for webinars about the Education Platform; and</p>
																</li>
																<li>
																	<p>
																		to verify the End User is an Authorised Person of the Licensee allowing CLA to protect the interests of the rights
																		owners which CLA and its members represent.
																	</p>
																</li>
															</ul>
														</li>
														<li>
															<p>
																CLA and the Licensee shall each comply with applicable Data Protection Legislation in relation to the provision and
																use of the Education Platform. Where possible Personal Data and Usage Data shall be processed by CLA in an anonymised
																and aggregated form. Where CLA processes any Personal Data on the Licensee's behalf in connection with the Education
																Platform under these Terms of Use, the parties record their intention that the Licensee shall be the Data Controller
																and CLA shall be a Data Processor and in any such case:
															</p>
															<ol>
																<li>
																	<p>
																		the Licensee shall ensure that it is entitled to transfer any relevant Personal Data to CLA so that CLA may
																		lawfully use, process and transfer the Personal Data in accordance with these Terms of Use on the Licensee's
																		behalf;
																	</p>
																</li>
																<li>
																	<p>
																		the Licensee shall ensure that relevant third parties (i.e. School Administrators and End Users) have been
																		informed of, and where necessary have given their consent to, such use, processing, and transfer as required by
																		all applicable Data Protection Legislation;
																	</p>
																</li>
																<li>
																	<p>
																		CLA shall process the Licensee Personal Data only in accordance with these Terms of Use and any lawful
																		instructions reasonably given by the Licensee from time to time; and
																	</p>
																</li>
																<li>
																	<p>
																		each party shall take appropriate technical and organisational measures against unauthorised or unlawful
																		processing of Personal Data or its accidental loss, destruction or damage.
																	</p>
																</li>
															</ol>
														</li>
														<li>
															<p>
																The Education Platform uses cookies as further described in our{" "}
																<AnchorLink href="/cookie-policy" title="cookie policy" target="_blank">
																	cookie policy
																</AnchorLink>
																. If you have any questions about use of your Personal Data or how we are processing it, please contact:{" "}
																<AnchorLink href={"mailto:" + supportEmail} title="Education Platform">
																	{supportEmail}
																</AnchorLink>
																.
															</p>
														</li>
													</ol>
												</li>
												<li>
													<h3>SECURITY</h3>
													<p>CLA maintains the right to:</p>
													<ol>
														<li>
															<p>
																Log all events related to proving ownership of Licensed Material on the Education Platform in order to ensure the
																Licensee is copyright compliant and the Licensee agrees that CLA may visit an Educational Establishment to ensure such
																ownership of Licensed Material exists.{" "}
															</p>
														</li>
														<li>
															<p>
																Log all events related to Licensed Material and Digital Copies in order to keep a record of the Usage Data of the
																Licensee and the End Users.
															</p>
														</li>
														<li>
															<p>
																Keep a record of the username of the End User, the name of the Licensee and the expiry date of the Digital Copy for
																the purposes of monitoring copyright compliance.
															</p>
														</li>
														<li>
															<p>
																Keep a record of IP addresses through which there has been access to the link to the Digital Copy of the Licensed
																Material and in the event of suspicious behaviour CLA may refer the Licensee to the relevant rightsholder(s) or take
																other appropriate action in its absolute discretion.
															</p>
														</li>
														<li>
															<p>
																Object to the registration of persons unauthorised by the Licensee such as email addresses that are not associated
																with the given Educational Establishment's domain.
															</p>
														</li>
													</ol>
												</li>
												<li>
													<h3>FORCE MAJEURE</h3>
													<p>
														Neither party shall be responsible for any delay or failure to perform any obligation under these Terms of Use due to any
														cause that is outside the control of the party and could not be avoided by the exercise of due care, provided it shall
														notify the other party as soon as possible of such occurrence. Notwithstanding any such occurrence, each party shall at
														all times use reasonable efforts to perform its obligations in a timely manner, taking account of the existing
														circumstances.
													</p>
												</li>
												<li>
													<h3>Limitation of liability</h3>
													<ol>
														<li>
															<p>
																CLA and the Licensee acknowledge and agree that CLA is making the Education Platform available to the Licensee without
																charge, that the Platform may not meet the Licensee's particular requirements and that the Licensee is free to
																consider alternative solutions.
															</p>
														</li>
														<li>
															<p>
																Except as expressly and specifically provided in these Terms of Use, all warranties, conditions and other terms
																implied by statute or common law are, to the fullest extent permitted by law, excluded from these Terms of Use.
															</p>
														</li>
														<li>
															<p>Nothing in these Terms of Use excludes the liability of any party:</p>
															<ol>
																<li>
																	<p>for death or personal injury caused by that party's negligence; or</p>
																</li>
																<li>
																	<p>for fraud or fraudulent misrepresentation;</p>
																</li>
																<li>
																	<p>for any matter for which it would be unlawful to limit liability. </p>
																</li>
															</ol>
														</li>
														<li>
															<p>
																Subject to Clause 10.3 above neither party shall in any circumstances be liable, whether in tort (including for
																negligence or breach of statutory duty howsoever arising), contract, misrepresentation (whether innocent or negligent)
																or otherwise for:{" "}
															</p>
															<ol>
																<li>
																	<p>loss of profits; or</p>
																</li>
																<li>
																	<p>loss of business; or</p>
																</li>
																<li>
																	<p>depletion of goodwill or similar losses; or</p>
																</li>
																<li>
																	<p>loss of anticipated savings; or</p>
																</li>
																<li>
																	<p>loss of goods; or</p>
																</li>
																<li>
																	<p>loss of use; or</p>
																</li>
																<li>
																	<p>loss or corruption of data or information; or</p>
																</li>
																<li>
																	<p>any special, indirect, consequential, or pure economic loss, costs, damages, charges or expenses.</p>
																</li>
															</ol>
														</li>
													</ol>
												</li>
												<li>
													<h3>TERMINATION</h3>
													<ol>
														<li>
															<p>
																These Terms of Use shall commence on the date the Licensee confirms its binding acceptance of these Terms of Use and
																shall continue for the duration of the CLA Education Licence subject to the following provisions of this Clause 11.
															</p>
														</li>
														<li>
															<p>
																Upon the suspension, expiry or termination of the CLA Education Licence in accordance with its terms, these Terms of
																Use shall automatically be deemed suspended, expired or terminated accordingly until renewal of the CLA Education
																Licence and in no event shall these Terms of Use continue in effect after such suspension, expiry or termination of
																the CLA Education Licence. For the avoidance of doubt, suspension or termination of these Terms of Use under Clauses
																11.3 or 11.4 below shall not affect the continuation of the CLA Education Licence in accordance with its terms.
															</p>
														</li>
														<li>
															<p>
																Should either party commit any material breach of any of its obligations under these Terms of Use and remain in breach
																fourteen (14) days after receiving written notice from the other party to remedy the same, the latter may by written
																notice to that effect delivered to the former forthwith:
															</p>
															<ol>
																<li>
																	<p>terminate these Terms of Use and access to or use of the Education Platform; or</p>
																</li>
																<li>
																	<p>
																		suspend the operation of these Terms of Use and access to or use of the Education Platform until the party not in
																		breach shall be reasonably satisfied the breaches will not recur.
																	</p>
																</li>
															</ol>
														</li>
														<li>
															<p>
																CLA may decide to cease providing the Education Platform to its Licensees generally at any time without liability but
																CLA will give at least one (1) academic year's notice before discontinuing the Education Platform or transferring its
																operation to a third party.
															</p>
														</li>
														<li>
															<p>
																Termination or suspension of these Terms of Use pursuant to this Clause 11 shall be without prejudice to any rights or
																remedies of the parties.
															</p>
														</li>
														<li>
															<p>Upon suspension, expiry or termination of these Terms of Service, for whatever reason:</p>
															<ol>
																<li>
																	<p>
																		access to and use of the Education Platform by the Licensee and its School Administrators and End Users shall
																		immediately cease; provided that for so long as the CLA Education Licence continues CLA shall procure access to
																		any Digital Copies within the online repository element of the Education Platform or reasonable equivalent for the
																		End Users of the Licensee until the end of the academic year in which suspension, expiry or termination has
																		occurred.{" "}
																	</p>
																</li>
															</ol>
														</li>
													</ol>
												</li>
												<li>
													<h3>SEVERABILITY </h3>
													<p>
														If any provision of these Terms of Use is held to be unenforceable or invalid, such provision will be changed and
														interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the
														remaining provisions will continue in full force and effect.
													</p>
												</li>
												<li>
													<h3>NOTICES</h3>
													<p>
														All notices given under these Terms of Use shall be in writing by electronic mail. In the case of there being no valid
														contact email, notices shall be sent by first class post, in the case of the Licensee to the address shown on the CLA
														Education Licence, and in the case of CLA to 4 Battlebridge lane, 5th Floor Shackleton House, SE1 2HX and shall be deemed
														to have been served on the second working day (which shall exclude weekends and English public holidays) following the
														date of posting.
													</p>
												</li>
												<li>
													<h3>VARIATION OF TERMS</h3>
													<p>
														These Terms of Use embody all the terms agreed between the parties and no oral representations, warranties or promises
														shall be implied as terms hereof. These Terms of Use may be varied by CLA by written notice to the Licensee.
													</p>
												</li>
												<li>
													<h3>DISPUTES AND GOVERNING LAW</h3>
													<p>
														These Terms of Use shall be governed by and construed in accordance with English Law and subject to the exclusive
														jurisdiction of the English Courts. If any dispute arises out of these Terms of Use the parties will attempt to settle it
														by mediation in accordance with Centre for Dispute Resolutions ("CEDR") Model Mediation Procedures. To initiate a
														mediation a party must give notice in writing ("ADR Notice") to the other party to the dispute requesting mediation. If
														there is any point on the conduct of the mediation upon which the parties cannot agree within fourteen (14) days from the
														date of the ADR Notice, CEDR will, at the request of any party, decide that point for the parties having consulted with
														them. The mediation will start not later that twenty eight (28) days after the date of the ADR Notice. The commencement of
														a mediation will not prevent the parties commencing or continuing Court or where appropriate Copyright Tribunal
														proceedings nor will it prevent CLA exercising its rights under these Terms of Use generally.
													</p>
												</li>
											</ol>
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
