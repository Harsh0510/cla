import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme.js";
import { withResizeDetector } from "react-resize-detector/build/withPolyfill";
import PreventRightClick from "../PreventRightClickOnPagePreview";
import getPageOffset from "../../common/getPageOffset.js";
import AssetPageNotAvailable from "../../widgets/AssetPageNotAvailable";

const Wrap = styled.div`
	flex: 1;
	position: relative;
	width: 100%;
`;

const HighlightBox = styled.div`
	background: ${theme.colours.primary};
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
	border: 1px solid ${theme.colours.white};
	top: 0px;
	height: 140px;
	pointer-events: none;
	box-sizing: border-box;
`;

const CustomControl = styled.div`
	position: relative;
	display: block;
	min-height: 30px;
	text-align: center;
	box-sizing: border-box;
	flex: 1;
	height: 100%;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	flex-direction: column;

	@media screen and (min-width: ${theme.breakpoints.desktop2}) {
		max-height: 140px;
		min-height: 140px;
	}
	@media screen and (max-width: ${theme.breakpoints.desktop2}) {
		max-height: 140px;
		min-height: 140px;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		max-height: 140px;
		min-height: 140px;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		max-height: 120px;
		min-height: 120px;
		margin-top: 10px;
	}
`;

const CustomControlInput = styled.input`
	position: absolute;
	z-index: -1;
	top: 10px;
	left: 10px;
`;

const ImageWrap = styled.label`
	flex: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	box-sizing: border-box;
	position: relative;
	padding: 10px 10px 2px 10px;
	vertical-align: middle;
	margin-top: 0;
	margin-bottom: auto;
	width: 100%;
	${(p) =>
		!p.hideCheckbox &&
		css`
			::before {
				position: absolute;
				display: block;
				pointer-events: none;
				content: "";
				border: #ffffff solid 1px;
				transition: all 0.15s;
				top: 5px;
				left: 5px;
				width: 20px;
				height: 20px;
				background: #424242;
				border-radius: 50%;
			}

			::after {
				position: absolute;
				display: block;
				content: "";
				font-family: "Font Awesome 5 Pro";
				text-align: center;
				line-height: 27px;
				color: ${theme.colours.lime};

				top: 13px;
				left: 8px;
				width: 20px;
				height: 20px;
				font-size: 18px;
				line-height: 0px;
				font-weight: 400;
				${(p) =>
					p.checked &&
					css`
						content: "\f00c";
					`};
				cursor: pointer;
			}
		`}
`;

const Image = styled.img`
	display: block;
	width: 100%;
	height: auto;
	max-height: 100px;
	overflow: hidden;
	margin-top: 0;
	margin-bottom: auto;

	@media screen and (max-width: ${theme.breakpoints.tablet1}) {
		max-height: 80px;
	}
`;

const Dummy = styled.div`
	flex: 1;
	display: block;
	background: transparent;
	box-sizing: border-box;
	font-size: 18px;
`;

const PageNumber = styled.span`
	font-size: 14px;
`;

const SliderImagesDiv = styled.div`
	font-weight: bold;
	font-size: 18px;
	display: block;
	min-height: 30px;
	text-align: center;
	box-sizing: border-box;
	flex: 1;
`;

export default withResizeDetector(
	class Slider extends React.PureComponent {
		render() {
			const { numHighlighted, maxOnScreen, targetTranslate, totalItems, transition, items } = this.props;

			const sliderInnerStyles = {
				display: "flex",
				width: `${(totalItems / maxOnScreen) * 100}%`,
				transform: `translateX(${100 * (targetTranslate / totalItems)}%)`,
				transition: transition,
			};

			let highlightBoxWidth = (this.props.width / maxOnScreen) * numHighlighted;

			const wrapStyles = {
				marginLeft: this.props.width < 370 ? "30px" : 0,
			};

			return (
				<Wrap style={wrapStyles}>
					<HighlightBox
						style={{
							width: `${highlightBoxWidth}px`,
						}}
					/>
					<div style={sliderInnerStyles}>
						{items.map((item) =>
							item.dummy ? (
								<Dummy key={item.key} />
							) : (
								<SliderImagesDiv key={item.key} style={{ width: this.props.width / maxOnScreen + "px" }}>
									<PreventRightClick>
										<CustomControl>
											{!this.props.copyExcludedPagesMap[item.index + 1] && (
												<CustomControlInput
													type="checkbox"
													value={Number(item.index)}
													name={"PagePreviewSlider-select-" + item.index}
													id={"PagePreviewSlider-select-" + item.index}
													checked={!!item.selected}
													onChange={this.props.handleCheckBoxEvent}
												/>
											)}
											<ImageWrap
												htmlFor={"PagePreviewSlider-select-" + item.index}
												checked={!!item.selected}
												hideCheckbox={this.props.copyExcludedPagesMap[item.index + 1]}
											>
												{!item.src ? (
													<AssetPageNotAvailable
														fontSize="0.5em"
														maxHeight="100px"
														handleClick={this.props.doOnImagePress}
														dataIndex={item.index}
														isPointerEventNone={false}
													/>
												) : (
													<Image src={item.src} selected={item.selected} onClick={this.props.doOnImagePress} data-index={item.index} />
												)}
											</ImageWrap>
											<PageNumber>{getPageOffset(item.index + 1, this.props.page_offset_roman, this.props.page_offset_arabic)}</PageNumber>
										</CustomControl>
									</PreventRightClick>
								</SliderImagesDiv>
							)
						)}
					</div>
				</Wrap>
			);
		}
	},
	{ handleWidth: true, handleHeight: false, refreshMode: "debounce", refreshRate: 100 }
);
