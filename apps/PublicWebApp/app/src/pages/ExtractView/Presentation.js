import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import PageWrap from "../../widgets/PageWrap";
import Header from "../../widgets/Header";
import withPageSize from "../../common/withPageSize";
import GenerateCopyRightImage from "../../widgets/GenerateCopyRightImage";
import Loader from "../../widgets/Loader";
import CopyContentPage from "./CopyContentPage";
import TitleSection from "./TitleSection";

const JUMP_TO_CONTENT_ID = "shared-copy-info";

const StyledPageWrap = styled(PageWrap)`
	text-align: center;

	@media screen and (min-width: ${theme.breakpoints.desktop}) {
		min-height: 400px;
	}
`;

const Error = styled.div`
	margin: 0 auto;
	font-size: 0.9em;
	font-weight: bold;
`;

/** Presentation component for Copy Management Page */
export default withPageSize(
	class Presentation extends React.PureComponent {
		render() {
			const props = this.props;
			const data = props.copy;
			if (props.error) {
				return (
					<>
						<Header />
						<StyledPageWrap padding={true}>
							<Error>{props.error}</Error>
						</StyledPageWrap>
					</>
				);
			}

			let copyRightTextImage = GenerateCopyRightImage(props.pageFooterText);

			if (data && !props.loading) {
				return (
					<>
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<TitleSection
							resultData={data}
							isbn13={data.work_isbn13}
							toggleWidth={this.props.toggleWidth}
							isTitleFull={this.props.isTitleFull}
							isAuthorFull={this.props.isAuthorFull}
							isPublisherFull={this.props.isPublisherFull}
							isEditorFull={this.props.isEditorFull}
							isTranslatorFull={this.props.isTranslatorFull}
							jumpToContentId={JUMP_TO_CONTENT_ID}
						/>
						<CopyContentPage
							isSidebar={props.sidebar}
							extractPages={props.extractPages}
							loading={props.loading}
							toggleSidebar={props.toggleSidebar}
							data={data}
							copyRightTextImage={copyRightTextImage}
							onOpen={this.props.onOpen}
							is_watermarked={this.props.is_watermarked}
							pageNumberToNoteMap={this.props.pageNumberToNoteMap}
							teacher={this.props.teacher}
							pageNumberToHighlightPageJoinMap={this.props.pageNumberToHighlightPageJoinMap}
							pageNumberToHighlightMap={this.props.pageNumberToHighlightMap}
							uploadedPdfUrl={this.props.uploadedPdfUrl}
							isViewingFullScreen={props.isViewingFullScreen}
							annotationsData={this.props.annotationsData}
						/>
					</>
				);
			} else {
				return (
					<>
						<Header />
						<StyledPageWrap padding={true}>
							<Loader />
						</StyledPageWrap>
					</>
				);
			}
		}
	}
);
