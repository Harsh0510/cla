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

const GUTTER = 5;
let currentSidePreference = "left";
const nextSidePreference = Object.create(null);
nextSidePreference.left = "right";
nextSidePreference.right = "left";

const getMidwayHorizontal = (bb, mySize) => {
	return bb.left + (bb.width - mySize.width) * 0.5;
};

const getMidwayVertical = (bb, mySize) => {
	return bb.top + (bb.height - mySize.height) * 0.5;
};

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
const Flyout = withWhiteOutConsumer(
	class FlyoutInner extends React.PureComponent {
		state = {
			flyout_details: null,
			// target_element_ready: false,
			isLoaded: false,
			isClosing: false,
		};

		constructor(...args) {
			super(...args);
			// @todo: Polyfill ResizeObserver for IE11!
			this._resizeObserver = new ResizeObserver(this._updateTargetPosition);
			this._hasInstalledResizeObserver = false;
			this._sidePreference = currentSidePreference = nextSidePreference[currentSidePreference];
		}

		closeFlyout = () => {
			this.setState({
				isClosing: true,
				isLoading: false,
			});
			this._closeTimeout = customSetTimeout(() => {
				if (this._isActive) {
					this.props.whiteOut_updateBoundingBox(this.state.flyout_details, false, this.props.highlight_gutter);
					this.props.onClose();
				}
			}, 200);
		};
		_getSidePreference() {
			return this.props.side_preference || this._sidePreference;
		}

		_getMySize() {
			const width = document.documentElement.clientWidth <= this.props.width ? 280 : this.props.width;
			return {
				width: width || 80,
				height: this.props.height || 80,
			};
		}

		_maybeInstallResizeObserver = () => {
			if (!this._isActive) {
				return;
			}
			if (this._hasInstalledResizeObserver) {
				return;
			}
			const el = getDomElement(this.props.target);
			if (!el) {
				return;
			}
			this._hasInstalledResizeObserver = true;
			this._resizeObserver.observe(el);
		};

		_updateTargetPosition = () => {
			const el = getDomElement(this.props.target);
			if (el && this._isActive) {
				const bb = getBoundingBox(el);
				const deets = this._getFlyoutDetails(bb);
				deets.bb = bb;
				if (!this._initiallyScrolled) {
					this._initiallyScrolled = true;
					const flyoutIsFullyVisible = deets.flyoutPosition.top >= 0 && deets.flyoutPosition.top + deets.mySize.height <= window.innerHeight;
					if (!flyoutIsFullyVisible) {
						// Place flyout in center of screen
						this._targetScroll = Math.max(0, window.pageYOffset + deets.flyoutPosition.top - 0.5 * window.innerHeight + 0.5 * deets.mySize.height);
						this._lastScrollTime = Date.now();
						this._cancelAutoScroll();
						this.doSlowScroll();
					}
				}

				this.setState(
					{
						flyout_details: deets,
						isLoading: true,
					},
					() => {
						if (!this._isActive) {
							return;
						}
						this.props.whiteOut_updateBoundingBox(deets, true, this.props.highlight_gutter);
					}
				);
			}
		};

		doSlowScroll = () => {
			if (!this._isActive) {
				return;
			}
			if (Math.abs(window.pageYOffset - this._targetScroll) <= 2) {
				return;
			}
			this._slowScrollAnim = window.requestAnimationFrame(this.doSlowScroll);
			const now = Date.now();
			const diff = now - this._lastScrollTime;
			this._lastScrollTime = now;
			let nextScroll;
			const scrollSpeed = 1;
			if (window.pageYOffset < this._targetScroll) {
				nextScroll = Math.min(this._targetScroll, window.pageYOffset + scrollSpeed * diff);
				if (nextScroll + window.innerHeight + 2 >= document.body.clientHeight) {
					// reached bottom of page
					this._cancelAutoScroll();
				}
			} else {
				nextScroll = Math.max(this._targetScroll, window.pageYOffset - scrollSpeed * diff);
			}
			window.scrollTo(window.pageXOffset, nextScroll);
		};

		_cancelAutoScroll = () => {
			window.cancelAnimationFrame(this._slowScrollAnim);
			delete this._slowScrollAnim;
		};

		componentDidUpdate(prevProps) {
			if (
				this.props.width !== prevProps.width ||
				this.props.height !== prevProps.height ||
				this.props.side_preference !== prevProps.side_preference
			) {
				this._updateTargetPosition();
			}
		}

		componentDidMount() {
			//this.props.whiteOut_updateBoundingBox(null, false, this.props.highlight_gutter);
			this._isActive = true;
			window.addEventListener("resize", this._updateTargetPosition, false);
			window.addEventListener("scroll", this._updateTargetPosition, false);
			this._updatePositionTimeout = customSetTimeout(() => {
				this._updateTargetPosition();
				// this.setState({target_element_ready: true});
			}, 200);
			this._maybeInstallResizeObserver();
			this._updateTargetPosition();
			this._timeout = customSetTimeout(() => {
				if (!this._isActive) {
					return;
				}
				this.setState({
					isLoaded: true,
				});
			}, 200);
		}

		componentWillUnmount() {
			this.props.whiteOut_updateBoundingBox(this.state.flyout_details, false, this.props.highlight_gutter);
			this.destroyAll();
		}

		destroyAll() {
			delete this._isActive;
			if (this._updatePositionTimeout) {
				clearTimeout(this._updatePositionTimeout);
			}
			delete this._updatePositionTimeout;
			window.removeEventListener("resize", this._updateTargetPosition, false);
			window.removeEventListener("scroll", this._updateTargetPosition, false);
			this._resizeObserver.disconnect();
			delete this._resizeObserver;
			delete this._initiallyScrolled;
			this._cancelAutoScroll();
			if (this._timeout) {
				clearTimeout(this._timeout);
			}
			delete this._timeout;
			if (this._closeTimeout) {
				clearTimeout(this._closeTimeout);
			}
			delete this._closeTimeout;
		}

		_getFlyoutDetails(bb) {
			const mySize = this._getMySize();
			const totalGutter = {
				width: mySize.width + GUTTER,
				height: mySize.height + GUTTER,
			};
			const isNear = {
				top: bb.top < totalGutter.height,
				bottom: bb.bottom > window.innerHeight - totalGutter.height,
				left: bb.left < totalGutter.width,
				right: bb.right > document.documentElement.clientWidth - totalGutter.width,
			};
			const sidePref = this._getSidePreference();
			const flyoutPosition = {};
			let side;
			const setLeft = () => {
				flyoutPosition.left = bb.left - mySize.width;
				flyoutPosition.top = getMidwayVertical(bb, mySize);
				side = "left";
			};
			const setRight = () => {
				flyoutPosition.left = bb.right;
				flyoutPosition.top = getMidwayVertical(bb, mySize);
				side = "right";
			};
			const setTop = () => {
				flyoutPosition.left = getMidwayHorizontal(bb, mySize);
				flyoutPosition.top = bb.top - mySize.height - 60;
				side = "top";
			};
			const setBottom = () => {
				flyoutPosition.left = getMidwayHorizontal(bb, mySize);
				flyoutPosition.top = bb.bottom;
				side = "bottom";
			};
			if (sidePref === "right") {
				if (isNear.right) {
					if (isNear.left) {
						if (isNear.bottom) {
							setTop();
						} else {
							setBottom();
						}
					} else {
						setLeft();
					}
				} else {
					setRight();
				}
			} else if (sidePref === "left") {
				if (isNear.left) {
					if (isNear.right) {
						if (isNear.bottom) {
							setTop();
						} else {
							setBottom();
						}
					} else {
						setRight();
					}
				} else {
					setLeft();
				}
			} else if (sidePref === "top") {
				if (isNear.top) {
					if (isNear.bottom) {
						if (isNear.right) {
							setLeft();
						} else {
							setRight();
						}
					} else {
						setBottom();
					}
				} else {
					setTop();
				}
			} else if (sidePref === "bottom") {
				if (isNear.bottom) {
					if (isNear.top) {
						if (isNear.right) {
							setLeft();
						} else {
							setRight();
						}
					} else {
						setTop();
					}
				} else {
					setBottom();
				}
			}

			let centerHorizontalOffset = 0;
			if (flyoutPosition.left < GUTTER) {
				// Flyout would start before the left edge of the screen!
				// Add an offset to bring it to the left edge of the screen (plus gutter).
				centerHorizontalOffset = flyoutPosition.left - GUTTER;
				flyoutPosition.left = GUTTER;
			} else if (flyoutPosition.left + mySize.width > document.documentElement.clientWidth - GUTTER) {
				// Flyout would go off the right edge of the screen!
				// Subtract an offset so it doesn't go off the edge.
				centerHorizontalOffset = flyoutPosition.left + mySize.width - (document.documentElement.clientWidth - GUTTER);
				flyoutPosition.left -= centerHorizontalOffset;
			}
			return {
				flyoutPosition: flyoutPosition,
				mySize: mySize,
				centerHorizontalOffset: centerHorizontalOffset,
				side: side,
			};
		}

		render() {
			if (!this.state.flyout_details || !this._isActive) {
				return null;
			}
			const deets = this.state.flyout_details;
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
								onClose={this.closeFlyout}
								center_horizontal_offset={deets.centerHorizontalOffset}
								isLoaded={this.state.isLoaded}
								isClosing={this.state.isClosing}
							>
								{this.props.children}
							</Presentation>
						</WrapDiv>
						// )
					}
				</OnTop>
			);
		}
	}
);

Flyout.propTypes = {
	side_preference: PropTypes.oneOf(["left", "right", "bottom", "top"]), // optional: preferred side of the target element where the flyout will appear
	width: PropTypes.number, // width of bubble
	height: PropTypes.number, // height of bubble
	onClose: PropTypes.func, // onClose callback
	target: PropTypes.any, // ref of a React element or a DOM element (must not be wrapped in a HOC!)
	highlight_gutter: PropTypes.number, // expand highlighter section
};

export default Flyout;
