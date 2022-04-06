import React from "react";
import PropTypes from "prop-types";
import styled, { css } from "styled-components";
import Presentation from "./Presentation";
import ResizeObserver from "resize-observer-polyfill";
import getDomElement from "../../common/getDomElement";
import OnTop from "../OnTop";
import customSetTimeout from "../../common/customSetTimeout";
import getBoundingBox from "./getBoundingBox";
import withWhiteOutConsumer from "../../common/withWhiteOutConsumer";

const WrapDiv = styled.div`
	z-index: 101;
	position: fixed;
	${(p) =>
		p.side == "left" &&
		css`
			padding-right: 60px;
		`}
	${(p) =>
		p.side == "right" &&
		css`
			padding-left: 60px;
		`}
	${(p) =>
		p.side == "bottom" &&
		css`
			padding-top: 60px;
			height: ${(h) => h.resHeight + 60 + "px !important"};
		`}
	${(p) =>
		p.side == "top" &&
		css`
			padding-bottom: 60px;
			height: ${(h) => h.resHeight + 60 + "px !important"};
		`}
`;
/**
 * Manages displaying a little bubble beside a DOM element (e.g. for tutorial purposes).
 *
 * Basic usage:
 *
 * <div ref={this._myRef}>The element the bubble should display next to</div>
 *
 * <Flyout target={this._myRef}>This is the flyout content</Flyout>
 *
 * The only required prop to Flyout is 'target'.
 *
 * You should also pass the 'width' and 'height' props too though.
 * These control the size of the bubble.
 * Make sure width is less than 300 so it displays on mobile devices.
 */
class FlyOut extends React.PureComponent {
	render() {
		if (!this.props.flyout_details || !this.props._isActive) {
			return null;
		}
		const deets = this.props.flyout_details;
		const styleObject = {
			width: deets.mySize.width + "px",
			height: deets.mySize.height + "px",
			left: deets.flyoutPosition.left + "px",
			top: deets.flyoutPosition.top + "px",
		};

		return (
			<OnTop>
				{
					// this.state.target_element_ready && (
					<WrapDiv style={styleObject} side={deets.side} resHeight={deets.mySize.height}>
						<Presentation
							side={deets.side}
							width={deets.mySize.width}
							height={deets.mySize.height}
							onClose={this.props.onClose}
							center_horizontal_offset={deets.centerHorizontalOffset}
							status={this.props.status}
						>
							{this.props.content}
						</Presentation>
					</WrapDiv>
					// )
				}
			</OnTop>
		);
	}
}

export default FlyOut;
