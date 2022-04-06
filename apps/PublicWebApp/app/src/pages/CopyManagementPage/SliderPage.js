import React from "react";
import styled from "styled-components";
import PreventRightClick from "../../widgets/PreventRightClick";
import RetryableImage from "../../widgets/RetryableImage";
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
	${(p) => p.disabled && `pointer-events:none;`}
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

export default class SliderPage extends React.PureComponent {
	render() {
		const { pageNumber, currentIndex, pageImageUrl, copyRightTextImage, is_watermarked, disabled } = this.props;
		return (
			<CustomControl disabled={!!disabled}>
				<ImageWrapper>
					<PreventRightClick isCursorAuto={!pageImageUrl}>
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
									onOpen={this.props.onOpen}
									currentIndex={currentIndex}
								/>
							) : (
								<AseetPageNotAvailable> </AseetPageNotAvailable>
							)}
							{is_watermarked ? "" : <FooterImge src={copyRightTextImage} />}
						</div>
					</PreventRightClick>
				</ImageWrapper>
			</CustomControl>
		);
	}
}
