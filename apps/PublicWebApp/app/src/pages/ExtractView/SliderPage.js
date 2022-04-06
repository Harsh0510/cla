import React from "react";
import styled, { css } from "styled-components";
import PreventRightClick from "../../widgets/PreventRightClick";
import RetryableImage from "../../widgets/RetryableImage";
import CoverPageWrapper from "../../widgets/CoverPage/CoverPageWrapper";
import NoteManager from "../../widgets/ExtractNote/Manager";
import HighlightManager from "../../widgets/ExtractHighlight/Manager";
import ExtractPageHighlighterInfo from "../../widgets/ExtractPageHighlighterInfo";
import AseetPageNotAvailable from "../../widgets/AssetPageNotAvailable";
import theme from "../../common/theme";
import { col12, colMd6 } from "../../common/style";

const CustomControl = styled.div`
	${col12}
	${colMd6}

	margin-bottom: 1.5em;
	padding-bottom: 1rem;
	@media (min-width: ${theme.breakpoints.mobileSmall}) {
		padding-bottom: 0;
	}
`;

const ImageWrapper = styled.div`
	position: relative;
`;

const FooterImge = styled.img`
	position: absolute;
	bottom: 5px;
	right: 0;
	z-index: 1;
	width: 100% !important;
`;
const CoverPageSection = styled.div`
	background-color: ${theme.colours.white};
`;

export default class SliderPage extends React.PureComponent {
	render() {
		const { pageNumber, currentIndex, pageImageUrl, copyRightTextImage, imageRef, isCoverPage = false, data = [], is_watermarked } = this.props;
		return (
			<>
				<CustomControl>
					<ImageWrapper>
						<PreventRightClick isCursorAuto={!pageImageUrl}>
							{isCoverPage ? (
								<CoverPageSection>
									<CoverPageWrapper data={data} />
								</CoverPageSection>
							) : (
								<div style={{ position: "relative", color: "black" }}>
									{this.props.highlights.length ? (
										<>
											<ExtractPageHighlighterInfo highlighterInfo={this.props.highlighterInfo} />
											<HighlightManager highlights={this.props.highlights} teacher={this.props.teacher} did_create={false} />
										</>
									) : (
										""
									)}
									<NoteManager notes={this.props.notes} hideContent={true} teacher={this.props.teacher} did_create={false} />
									{pageImageUrl ? (
										<RetryableImage
											id={`PDFPage${pageNumber}`}
											src={pageImageUrl}
											alt={`PDF Page ${pageNumber}`}
											width="467"
											height="490"
											imageRef={imageRef}
											onOpen={this.props.onOpen}
											currentIndex={currentIndex}
										/>
									) : (
										<AseetPageNotAvailable> </AseetPageNotAvailable>
									)}
								</div>
							)}
							{is_watermarked ? "" : <FooterImge src={copyRightTextImage} />}
						</PreventRightClick>
					</ImageWrapper>
				</CustomControl>
			</>
		);
	}
}
