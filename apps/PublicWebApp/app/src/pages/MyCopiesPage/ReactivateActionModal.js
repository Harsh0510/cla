import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import theme from "../../common/theme";
import ConfirmModal from "../../widgets/ConfirmModal";
import MessageBox from "../../widgets/MessageBox";
import Modal from "../../widgets/Modal";
import sendEmailList from "../../common/sendEmailList";

const ADDITIONAL_TEXT = `This might be because you or a colleague have already exceeded the copy limit from the listed books for these classes this year. For more details please check the My Copies page or contact`;
const EXCEEDED_FOR_SCHOOL = "school";
const EXCEEDED_FOR_COURSE = "course";

const Title = styled.h2`
	font-size: 1.5em;
	margin-bottom: 0.4em;
	font-weight: 400;
	line-height: 1.5em;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		font-size: 1.2em;
		line-height: 1.2em;
	}
`;

const SubTitle = styled.div`
	font-size: 1em;
	line-height: 1.3em;
	margin-bottom: 0.4em;
`;

const Description = styled.div`
	font-size: 0.825em;
	line-height: 1.3em;
	margin-bottom: 0.4em;
`;

const WrapModal = styled.div`
	margin-bottom: 2em;
`;

const StyledLink = styled.a`
	color: ${theme.colours.primary};
`;

export default class ReactivateActionModal extends React.PureComponent {
	render() {
		const {
			isShowReactivateConfirmModal,
			hideReactivateConfirmModel,
			onConfirmReactivateExtract,
			extractRreactivatedResponse,
			selectedReactivateCount,
			resetExtractRreactivatedResponse,
			showReactivateSuccessMessage,
		} = this.props;

		let reactivateCopyText = selectedReactivateCount === 1 ? "copy" : "copies";
		let leftToReviewCopyText = "copies";
		let reactivatedExtractCount = 0;
		let leftToReactivatedExtractCount = 0;
		let reactivateExtractErrors = [];
		let reactivateExtractErrorMessage = `The selected ${reactivateCopyText} could not be reactivated because the following would exceed your class or institution copy limit:`;
		const messageCourseLimitExceed = `The selected ${reactivateCopyText} could not be reactivated because the following would exceed the class copy limit:`;
		const messageSchoolLimitExceed = `The selected ${reactivateCopyText} could not be reactivated because the following would exceed your institution copy limit:`;
		if (extractRreactivatedResponse) {
			reactivatedExtractCount = extractRreactivatedResponse ? extractRreactivatedResponse.reactivateCount : 0;
			reactivateCopyText = reactivatedExtractCount === 1 ? "copy" : "copies";
			leftToReactivatedExtractCount = extractRreactivatedResponse ? extractRreactivatedResponse.leftToReview : 0;
			leftToReviewCopyText = leftToReactivatedExtractCount === 1 ? "copy" : "copies";
			if (extractRreactivatedResponse.erroredExtract && extractRreactivatedResponse.erroredExtract.length) {
				reactivateExtractErrors = extractRreactivatedResponse.erroredExtract;
				const courseExceedLimitError = reactivateExtractErrors.find((row) => row.exceededFor === EXCEEDED_FOR_COURSE);
				const schoolExceedLimitError = reactivateExtractErrors.find((row) => row.exceededFor === EXCEEDED_FOR_SCHOOL);
				if (courseExceedLimitError && !schoolExceedLimitError) {
					reactivateExtractErrorMessage = messageCourseLimitExceed;
				} else if (schoolExceedLimitError && !courseExceedLimitError) {
					reactivateExtractErrorMessage = messageSchoolLimitExceed;
				}
			}
		}

		return (
			<>
				{isShowReactivateConfirmModal && (
					<ConfirmModal
						title={`This will reactivate ${selectedReactivateCount} ${reactivateCopyText}.`}
						onClose={hideReactivateConfirmModel}
						onConfirm={onConfirmReactivateExtract}
						onCancel={hideReactivateConfirmModel}
						confirmButtonText={"Yes, reactivate selected " + reactivateCopyText}
						cancelButtonText={"No, go back"}
					>
						{
							<SubTitle>
								{`${
									selectedReactivateCount === 1 ? "This" : "These"
								} ${reactivateCopyText} cannot be edited at a later date, and will retain the same Copy Name, Page Range and Class as last year.`}
								<br />
								Are you sure you wish to continue?
							</SubTitle>
						}
					</ConfirmModal>
				)}

				{reactivateExtractErrors.length > 0 && (
					<Modal modalWidth="600px" show={reactivateExtractErrors.length > 0} handleClose={resetExtractRreactivatedResponse}>
						<WrapModal>
							<SubTitle>{reactivateExtractErrorMessage}</SubTitle>
							<ul>
								{reactivateExtractErrors.map((item, index) => {
									const pages = item.pages.join("-");
									return (
										<li key={index}>
											<StyledLink
												href={`/works/${item.pdf_isbn13}/extract?rollover_review_oid=${item.oid}&course=${item.course_oid}&selected=${pages}`}
												target="_blank"
											>
												{item.copyTitle} ({item.pdf_isbn13})
											</StyledLink>
										</li>
									);
								})}
							</ul>

							<SubTitle>
								{ADDITIONAL_TEXT} <StyledLink href={"mailto:" + sendEmailList.supportEP}>{sendEmailList.supportEP}</StyledLink>.
							</SubTitle>
						</WrapModal>
					</Modal>
				)}

				{showReactivateSuccessMessage && reactivatedExtractCount > 0 && !reactivateExtractErrors.length && (
					<MessageBox type="success">
						<Title>Congratulations!</Title>
						<SubTitle>
							You have successfully reactivated {reactivatedExtractCount} {reactivateCopyText}, you can view{" "}
							{reactivatedExtractCount > 1 ? "them" : "it"} in the table below.
						</SubTitle>
						{leftToReactivatedExtractCount > 0 && (
							<Description>
								There are now {leftToReactivatedExtractCount} remaining expired {leftToReviewCopyText}. To view these, go back to the Review Copies
								page via the menu or the link on this page
							</Description>
						)}
					</MessageBox>
				)}
			</>
		);
	}
}
