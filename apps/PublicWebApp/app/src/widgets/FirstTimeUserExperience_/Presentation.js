import React from "react";
import PropTypes from "prop-types";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import * as constants from "./constants";

const DefaultStyle = styled.div``;

const FlyoutStyle = styled(DefaultStyle)`
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	background: ${theme.colours.flyOutModalPrimary};
	color: white;
	height: 100%;
	padding: 0.5em;
	transition: opacity ${constants.ANIMATION_DURATION}ms ${(p) => (p.status === "closing" ? "" : `, transform ${constants.ANIMATION_DURATION}ms`)};
	${(p) => {
		if (p.status === "open") {
			return `opacity: 1; transform: scale(1.0);`;
		}
		if (p.status === "closing") {
			return `opacity: 0;`;
		}
		return `opacity: 0; transform: scale(0.9);`;
	}}
`;

const Arrow = styled.div`
	position: absolute;
	${(p) =>
		p.side == "left" &&
		css`
			left: 100%;
			top: 50%;
			transform: translateY(-50%);
			border-top: 15px solid transparent;
			border-left: 50px solid ${theme.colours.flyOutModalPrimary};
			border-bottom: 15px solid transparent;
		`}
	${(p) =>
		p.side == "right" &&
		css`
			right: 100%;
			top: 50%;
			transform: translateY(-50%);
			border-top: 15px solid transparent;
			border-right: 50px solid ${theme.colours.flyOutModalPrimary};
			border-bottom: 15px solid transparent;
		`}
	${(p) =>
		p.side == "bottom" &&
		css`
			bottom: 100%;
			left: calc(50% + ${(p) => p.center_horizontal_offset}px);
			transform: translateX(-50%);
			border-left: 15px solid transparent;
			border-right: 15px solid transparent;
			border-bottom: 50px solid ${theme.colours.flyOutModalPrimary};
		`}
	${(p) =>
		p.side == "top" &&
		css`
			top: 100%;
			left: calc(50% + ${(p) => p.center_horizontal_offset}px);
			transform: translateX(-50%);
			border-left: 15px solid transparent;
			border-right: 15px solid transparent;
			border-top: 50px solid ${theme.colours.flyOutModalPrimary};
		`}
`;
const TopSection = styled.div`
	position: absolute;
	top: 0.5em;
	${(p) =>
		p.side == "top" &&
		css`
			left: 0.5em;
		`}
	${(p) =>
		p.side == "right" &&
		css`
			right: 0.5em;
		`}
	${(p) =>
		p.side == "bottom" &&
		css`
			right: 0.5em;
		`}
	${(p) =>
		p.side == "left" &&
		css`
			left: 0.5em;
		`}
`;

const CloseButton = styled.button`
	background-color: transparent;
	border: 0;
	color: white;
	font-size: 1em;
	padding: 0;
`;

const ContentBody = styled.div`
	font-size: 1.2em;
	color: white;
	text-align: center;
	line-height: 1.3em;
	padding: 1em 1em 1em 1em;
`;

class Presentation extends React.PureComponent {
	render() {
		const { side, onClose, children, center_horizontal_offset, isLoaded, isClosing } = this.props;

		return (
			<FlyoutStyle isLoaded={isLoaded} isClosing={isClosing}>
				<TopSection side={side}>
					<CloseButton onClick={onClose}>X</CloseButton>
				</TopSection>
				<ContentBody>{children}</ContentBody>
				<Arrow side={side} center_horizontal_offset={center_horizontal_offset} />
			</FlyoutStyle>
		);
	}
}

Presentation.propTypes = {
	width: PropTypes.number.isRequired, // bubble must be this wide including all borders and padding
	height: PropTypes.number.isRequired, // bubble must be this tall including all borders and padding
	onClose: PropTypes.func, // onClose callback
	center_horizontal_offset: PropTypes.number.isRequired, // horizontal offset (px) to the center of the target element - use to position the arrow

	/**
	 * Side of the target element that the bubble sits on.
	 * So if side is 'top', it means the bubble is above the target element and horizontally centered.
	 * So you should e.g. display the arrow underneath the bubble.
	 * If side is 'right' for example, it means the bubble is on the right of the target element.
	 * So you should display the arrow to the left of the bubble.
	 */
	side: PropTypes.oneOf(["top", "right", "bottom", "left"]),
};

export default Presentation;
