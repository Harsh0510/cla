import React from "react";
import { Redirect } from "react-router-dom";
import withAuthConsumer from "../../common/withAuthConsumer";
import { Link } from "react-router-dom";
import Header from "../../widgets/Header";
import PageWrap from "../../widgets/PageWrap";
import styled from "styled-components";
import theme from "../../common/theme";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";

const JUMP_TO_CONTENT_ID = "main-content";

const StyledPageWrap = styled(PageWrap)`
	padding: 6em 4em 4em;
`;

const TermsSection = styled.div`
	:not(:last-child) {
		margin-bottom: 4em;
	}
`;

const TermsTitle = styled.h1`
	text-align: center;
	font-weight: 300;
	font-size: 2em;
	margin: 0 0 3em;
`;

const StyledTermsHeading = styled.h2`
	color: ${theme.colours.primaryDark};
	font-size: 0.9em;
	margin: 1em 0;
	font-weight: 700;

	span {
		border-bottom: 1px solid ${theme.colours.primaryDark};
	}
`;

const SubList = styled.div`
	padding-left: 1em;
`;

/* const TermsHeading = (props) => <StyledTermsHeading><span>{props.children}</span></StyledTermsHeading>; */

export default withAuthConsumer(
	class TermsPage extends React.PureComponent {
		/**
		 * Handles the submission
		 */
		//Need to calrify it need or not
		// handleSubmit = e => {
		// 	e.preventDefault();
		// 	this.props.withAuthConsumer_attemptAuth(
		// 		e.target.elements.email.value,
		// 		e.target.elements.password.value
		// 	);
		// };

		render() {
			return (
				<>
					<HeadTitle title={PageTitle.terms} />
					<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
					<StyledPageWrap id={JUMP_TO_CONTENT_ID}>
						<div>
							<TermsTitle>Terms of Use</TermsTitle>

							<TermsSection>
								<StyledTermsHeading>
									<span>1. Introduction</span>
								</StyledTermsHeading>

								<p>
									1.1 This Website is owned and operated by The Copyright Licensing Agency Ltd (“CLA”) a company registered in England (registered
									number 1690026) with a registered office at Barnards Inn, 86 Fetter Lane, London, EC4A 1EN. Other than the My CLA portal which is
									only open to you if you register, you may access areas of the Website without registering your details with us.
								</p>
								<p>
									1.2 The contents of this Website are provided as an information guide only and do not constitute legal advice. Visitors to the
									Website who have a legal problem or question should consult a suitably qualified lawyer.
								</p>
								<p>
									1.3 CLA may make changes to the Website from time to time. Any changes take immediate effect. You should regularly review these
									Terms for any changes. Your use of the Website after changes have been made will constitute acceptance of the changed Terms. No
									responsibility is accepted for loss arising from inaccurate or incomplete information, however caused.
								</p>
							</TermsSection>

							<TermsSection>
								<StyledTermsHeading>
									<span>2. Intellectual Property</span>
								</StyledTermsHeading>

								<p>2.1 Unless otherwise indicated, CLA is the owner of all copyright in material on the Website.</p>
								<p>
									2.2 The material on the Website may be copied for private use or use within an organisation provided the source of the material is
									acknowledged and the material is not amended in any way.
								</p>
								<p>2.3 The Copyright Licensing Agency Ltd, and What Can I do With this Content are registered trademarks of CLA.</p>
							</TermsSection>

							<TermsSection>
								<StyledTermsHeading>
									<span>3. Service Access</span>
								</StyledTermsHeading>

								<p>
									3.1 While CLA endeavours to ensure the Website is normally available 24 hours a day, CLA shall not be liable if for any reason the
									Website is unavailable at any time or for any period.
								</p>
								<p>
									3.2 Access to the Website may be suspended temporarily and without notice in the case of system failure, maintenance or repair or
									for reasons outside CLA's control.
								</p>
							</TermsSection>

							<TermsSection>
								<StyledTermsHeading>
									<span>4. Visitor Material and Conduct</span>
								</StyledTermsHeading>

								<p>
									4.1 Other than personally identifiable information, which is covered under our Privacy Policy any material you transmit or post to
									the Website shall be considered non-confidential and non-proprietary. CLA shall have no obligations with respect to such material.
									CLA and its designees shall be free to copy, disclose, distribute, incorporate and otherwise use such material and all data and
									anything embedded therein for any and all commercial or non-commercial purposes.
								</p>
								<p>4.2 You are prohibited from posting or transmitting to or from the Website any material:</p>

								<SubList>
									<p>
										4.2.1 that is inappropriate, defamatory, libellous, obscene, indecent, offensive, abusive, liable to incite racial hatred,
										discriminatory, menacing, scandalous, inflammatory, blasphemous, in breach of confidence, in breach of privacy or which may cause
										annoyance or inconvenience; or
									</p>
									<p>4.2.2 for which you have not obtained all necessary licences and/or approvals; or</p>
									<p>
										4.2.3 which constitutes or encourages conduct that would be considered a criminal offence, give rise to civil liability, or
										otherwise be contrary to the law of or infringe the rights of any third party, in any country in the world; or
									</p>
									<p>
										4.2.4 which is technically harmful (including, without limitation, computer viruses, logic bombs, Trojan horses, worms, harmful
										components, corrupted data or other malicious software or harmful data).
									</p>
								</SubList>

								<p>4.3 You may not misuse the Website (including, without limitation, by hacking).</p>
								<p>
									4.4 CLA shall fully co-operate with any law enforcement authorities or court order requesting or directing CLA to disclose the
									identity or locate anyone posting any material in breach of 4.2 or 4.3.
								</p>
							</TermsSection>
						</div>
					</StyledPageWrap>
				</>
			);
		}
	}
);
