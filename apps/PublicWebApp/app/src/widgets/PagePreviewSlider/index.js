import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme.js";
import Flyout from "../Flyout";
import flyoutGuide from "../../pages/ExtractByPage/flyoutGuide";
import reactCreateRef from "../../common/reactCreateRef";
import Slider from "./Slider";

/**
 * Item {
 *  src: string
 *  selected: bool
 * }
 * items = Item[]
 * highlighted_first_index = number // index of first item in the items array that is highlighted
 * highlighted_count = number // number of items highlighted (1 or 2)
 * on_press_page(Item) // callback that's invoked when an item is clicked
 * max_either_side = number // max number of pages to display either side of the highlighted page(s) - so '2' means '2 pages before and 2 pages after'.
 */

const NAV_BUTTON_WIDTH_IN_EMS = 1.5;

const Wrap = styled.div`
	position: relative;
	padding: 0 1em;
	background-color: ${theme.colours.darkGray};
`;

const SliderWrap = styled.div`
	display: flex;
	position: relative;
	z-index: 2;
	min-height: 160px;
`;

const Prev = styled.div`
	width: ${NAV_BUTTON_WIDTH_IN_EMS}em;
	background: transparent;
	position: relative;
	cursor: pointer;

	:before {
		font-family: "Font Awesome 5 Pro";
		font-size: 28px;
		color: ${theme.colours.white};
		vertical-align: middle;
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		transform: translateY(-50%);
		font-weight: bold;
		content: "\f053";
	}
`;

const PrevMore = styled.div`
	width: ${NAV_BUTTON_WIDTH_IN_EMS}em;
	background: transparent;
	position: relative;
	margin-right: 12px;
	cursor: pointer;

	:before {
		font-family: "Font Awesome 5 Pro";
		font-size: 28px;
		color: ${theme.colours.white};
		vertical-align: middle;
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		transform: translateY(-50%);
		font-weight: bold;
		content: "\f323";
	}
`;

const Next = styled.div`
	width: ${NAV_BUTTON_WIDTH_IN_EMS}em;
	background: transparent;
	position: relative;
	margin-left: 6px;
	cursor: pointer;

	:before {
		font-family: "Font Awesome 5 Pro";
		font-size: 28px;
		color: ${theme.colours.white};
		vertical-align: middle;
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		transform: translateY(-50%);
		font-weight: bold;
		content: "\f054";
	}
`;

const NextMore = styled.div`
	width: ${NAV_BUTTON_WIDTH_IN_EMS}em;
	background: transparent;
	position: relative;
	margin-left: 3px;
	cursor: pointer;

	:before {
		font-family: "Font Awesome 5 Pro";
		font-size: 28px;
		color: ${theme.colours.white};
		vertical-align: middle;
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		transform: translateY(-50%);
		font-weight: bold;
		content: "\f324";
	}
`;

const SliderWrap2 = styled.div`
	flex: 1;
	position: relative;
	display: flex;
	overflow-x: auto;
	overflow-y: hidden;
	margin-top: 5px;
	::-webkit-scrollbar {
		width: 10px;
		height: 10px;
	}
	::-webkit-scrollbar-track {
		background: transparent;
	}
	::-webkit-scrollbar-thumb {
		background: ${theme.colours.lightGray};
		border-radius: 0;
	}
	::-webkit-scrollbar-thumb:hover {
		background: ${theme.colours.lightGray};
	}
`;

const TRANSITION_DURATION = 200;
const FAST_FORWARD_SINGLE = 9;
const FAST_FORWARD_DOUBLE = 8;
const FAST_BACKWARD_SINGLE = 9;
const FAST_BACKWARD_DOUBLE = 8;

export default class PagePreviewSlider extends React.PureComponent {
	state = {
		animating: null,
		lastLeftScroll: 0,
	};
	prevButtonRef = reactCreateRef();
	prevMoreButtonRef = reactCreateRef();
	sliderRef = reactCreateRef();

	doOnPrev = (e) => {
		e.preventDefault();
		if (this.state.highlighted_first_index > 0) {
			this.setState({
				animating: "prev",
			});
			if (this.animateTimeout) {
				clearTimeout(this.animateTimeout);
			}
			this.animateTimeout = setTimeout(() => {
				const newHighlightedIndex = Math.max(0, this.state.highlighted_first_index - this.props.highlighted_count);
				if (this.props.on_highlighted_page_change) {
					this.props.on_highlighted_page_change(newHighlightedIndex);
				}
				this.setState({
					animating: null,
					highlighted_first_index: newHighlightedIndex,
				});
			}, TRANSITION_DURATION);
		}
		if (this.props.doShowFlyout) {
			this.props.onFlyoutClose();
		}
	};

	doFastPrev = (e) => {
		e.preventDefault();
		if (this.state.highlighted_first_index > 0) {
			this.setState({
				animating: "prev",
			});
			if (this.animateTimeout) {
				clearTimeout(this.animateTimeout);
			}
			this.animateTimeout = setTimeout(() => {
				let newHighlightedIndex;
				if (this.props.highlighted_count === 1) {
					newHighlightedIndex = Math.max(0, this.state.highlighted_first_index - this.props.highlighted_count - FAST_BACKWARD_SINGLE);
				} else {
					newHighlightedIndex = Math.max(0, this.state.highlighted_first_index - this.props.highlighted_count - FAST_BACKWARD_DOUBLE);
				}

				if (this.props.on_highlighted_page_change) {
					this.props.on_highlighted_page_change(newHighlightedIndex);
				}
				this.setState({
					animating: null,
					highlighted_first_index: newHighlightedIndex,
				});
			}, TRANSITION_DURATION);
		}
	};

	doOnNext = (e) => {
		this.sliderRef.current.removeEventListener("scroll", this.getScrollPosition, false);
		e.preventDefault();
		if (this.state.highlighted_first_index + this.props.highlighted_count < this.props.items.length) {
			this.setState({
				animating: "next",
			});
			if (this.animateTimeout) {
				clearTimeout(this.animateTimeout);
			}
			this.animateTimeout = setTimeout(() => {
				const newHighlightedIndex = Math.min(
					this.props.items.length - this.props.highlighted_count,
					this.state.highlighted_first_index + this.props.highlighted_count
				);
				if (this.props.on_highlighted_page_change) {
					this.props.on_highlighted_page_change(newHighlightedIndex);
				}
				this.setState({
					animating: null,
					highlighted_first_index: newHighlightedIndex,
				});
			}, TRANSITION_DURATION);
		}
	};

	doForwardNext = (e) => {
		e.preventDefault();
		if (this.state.highlighted_first_index + this.props.highlighted_count < this.props.items.length) {
			this.setState({
				animating: "next",
			});
			if (this.animateTimeout) {
				clearTimeout(this.animateTimeout);
			}
			this.animateTimeout = setTimeout(() => {
				let newHighlightedIndex;
				if (this.props.highlighted_count === 1) {
					newHighlightedIndex = Math.min(
						this.props.items.length - this.props.highlighted_count,
						this.state.highlighted_first_index + this.props.highlighted_count + FAST_FORWARD_SINGLE
					);
				} else {
					newHighlightedIndex = Math.min(
						this.props.items.length - this.props.highlighted_count,
						this.state.highlighted_first_index + this.props.highlighted_count + FAST_FORWARD_DOUBLE
					);
				}
				if (this.props.on_highlighted_page_change) {
					this.props.on_highlighted_page_change(newHighlightedIndex);
				}
				this.setState({
					animating: null,
					highlighted_first_index: newHighlightedIndex,
				});
			}, TRANSITION_DURATION);
		}
	};

	doOnImagePress = (e) => {
		e.preventDefault();
		this.sliderRef.current.removeEventListener("scroll", this.getScrollPosition, false);
		if (this.props.on_press_page) {
			let pageValue = parseInt(e.currentTarget.getAttribute("data-index"), 10);
			this.doTransitionOnPage(pageValue, "doOnImagePress");
		}
		if (this.scrollTimeOut) {
			clearTimeout(this.scrollTimeOut);
		}
		this.scrollTimeOut = setTimeout(() => {
			this.sliderRef.current.addEventListener("scroll", this.getScrollPosition, false);
		}, TRANSITION_DURATION);
	};

	handleChange = (e) => {
		e.preventDefault();
		if (!this.props.copyExcludedPagesMap[e.target.value + 1]) {
			this.sliderRef.current.removeEventListener("scroll", this.getScrollPosition, false);
			if (this.props.on_press_checkbox) {
				let pageValue = parseInt(e.target.value, 10);
				this.doTransitionOnPage(pageValue, "handleChange");
			}
			this.scrollTimeOut = setTimeout(() => {
				this.sliderRef.current.addEventListener("scroll", this.getScrollPosition, false);
			}, TRANSITION_DURATION);
		}
	};

	doTransitionOnPage = (pageValue, eventType) => {
		let currentSelectedSide = this.state.highlighted_first_index > pageValue ? "left" : "right";

		if (this.state.highlighted_first_index === pageValue || this.props.highlighted_count - 1 + this.state.highlighted_first_index === pageValue) {
			currentSelectedSide = "center";
		}

		this.setState({
			animating: currentSelectedSide,
			inProp: true,
		});
		if (this.animateTimeout) {
			clearTimeout(this.animateTimeout);
		}

		this.animateTimeout = setTimeout(() => {
			let newHighlightedIndex = this.state.highlighted_first_index;
			if (currentSelectedSide === "left") {
				newHighlightedIndex = Math.max(0, pageValue);
			} else if (currentSelectedSide === "right") {
				newHighlightedIndex = Math.min(this.props.items.length - this.props.highlighted_count, pageValue);
			}

			if (eventType === "handleChange") {
				this.props.on_press_checkbox(pageValue);
			} else if (eventType === "doOnImagePress") {
				this.props.on_press_page(pageValue);
			}

			this.setState({
				animating: null,
				highlighted_first_index: newHighlightedIndex,
			});
		}, TRANSITION_DURATION);
	};

	fastForwardOnScrollRight = () => {
		if (this.state.highlighted_first_index + this.props.highlighted_count < this.props.items.length) {
			this.setState({
				animating: "next",
			});
			if (this.animateTimeout) {
				clearTimeout(this.animateTimeout);
			}
			this.animateTimeout = setTimeout(() => {
				let newHighlightedIndex;
				if (this.props.highlighted_count === 1) {
					newHighlightedIndex = Math.min(
						this.props.items.length - this.props.highlighted_count,
						this.state.highlighted_first_index + this.props.highlighted_count + FAST_FORWARD_SINGLE
					);
				} else {
					newHighlightedIndex = Math.min(
						this.props.items.length - this.props.highlighted_count,
						this.state.highlighted_first_index + this.props.highlighted_count + FAST_FORWARD_DOUBLE
					);
				}
				if (this.props.on_highlighted_page_change) {
					this.props.on_highlighted_page_change(newHighlightedIndex);
				}
				this.setState({
					animating: null,
					highlighted_first_index: newHighlightedIndex,
				});
			}, TRANSITION_DURATION);
			this.sliderRef.current.scrollLeft += 8;
		}
	};

	fastBackwardOnScrollLeft = () => {
		if (this.state.highlighted_first_index > 0) {
			this.setState({
				animating: "prev",
			});
			if (this.animateTimeout) {
				clearTimeout(this.animateTimeout);
			}
			this.animateTimeout = setTimeout(() => {
				let newHighlightedIndex;
				if (this.props.highlighted_count === 1) {
					newHighlightedIndex = Math.max(0, this.state.highlighted_first_index - this.props.highlighted_count - FAST_BACKWARD_SINGLE);
				} else {
					newHighlightedIndex = Math.max(0, this.state.highlighted_first_index - this.props.highlighted_count - FAST_BACKWARD_DOUBLE);
				}

				if (this.props.on_highlighted_page_change) {
					this.props.on_highlighted_page_change(newHighlightedIndex);
				}
				this.setState({
					animating: null,
					highlighted_first_index: newHighlightedIndex,
				});
			}, TRANSITION_DURATION);
		}
	};

	getScrollPosition = () => {
		let left,
			right = false;
		const debounce = (func, delay) => {
			let debounceTimer;
			return function () {
				const context = this;
				const args = arguments;
				clearTimeout(debounceTimer);
				debounceTimer = setTimeout(() => func.apply(context, args), delay);
			};
		};
		let scrollWidth = this.sliderRef.current.scrollWidth;
		let clientWidth = this.sliderRef.current.clientWidth;
		let scrollLeft = this.sliderRef.current.scrollLeft;

		if (this.state.lastLeftScroll > scrollLeft) {
			left = true;
			right = false;
		} else {
			right = true;
			left = false;
		}
		this.state.lastLeftScroll = scrollLeft;
		if (scrollWidth - scrollLeft - clientWidth < 5) {
			debounce(this.fastForwardOnScrollRight(), 300);
			this.setState({ lastLeftScroll: 0 });
		} else if (left && !right && this.props.highlighted > 1 && scrollLeft < 5) {
			debounce(this.fastBackwardOnScrollLeft(), 300);
		}
	};

	componentDidMount() {
		if (this.sliderRef.current) {
			this.sliderRef.current.addEventListener("scroll", this.getScrollPosition, false);
		}
		this.setState({
			orig_highlighted_first_index: this.props.highlighted_first_index,
			highlighted_first_index: this.props.highlighted_first_index,
		});
	}

	componentDidUpdate() {
		if (this.props.highlighted_first_index !== this.state.orig_highlighted_first_index) {
			this.setState({
				orig_highlighted_first_index: this.props.highlighted_first_index,
				highlighted_first_index: this.props.highlighted_first_index,
			});
		}
		if (this.scrollTimeOut) {
			clearTimeout(this.scrollTimeOut);
		}
		this.scrollTimeOut = setTimeout(() => {
			this.sliderRef.current.addEventListener("scroll", this.getScrollPosition, false);
		}, TRANSITION_DURATION);
		// Slider Scroll Left Slightly by 30px
		this.sliderRef.current.scrollLeft = 30;
	}

	componentWillUnmount() {
		if (this.sliderRef.current) {
			this.sliderRef.current.removeEventListener("click", this.getScrollPosition, false);
		}
		if (this.animateTimeout) {
			clearTimeout(this.animateTimeout);
		}
		delete this.animateTimeout;
	}

	render() {
		const numHighlighted = this.props.highlighted_count;
		const numItems = this.props.items.length;

		let items = [];
		let firstHighlightedOffset = this.state.highlighted_first_index;
		const sum = numHighlighted + this.props.max_either_side;
		const chopOffStart = Math.max(0, firstHighlightedOffset - sum);
		const itemsEnd = Math.min(numItems, firstHighlightedOffset + numHighlighted + sum);
		const slicedItemsLength = itemsEnd - chopOffStart;

		firstHighlightedOffset -= chopOffStart;
		const lastHighlightedOffset = firstHighlightedOffset + numHighlighted;

		const extraNeededAtStart = Math.max(0, sum - firstHighlightedOffset);
		for (let i = 0; i < extraNeededAtStart; ++i) {
			items.push({
				dummy: true,
				key: 1000000 + i,
			});
		}

		for (let i = chopOffStart; i < itemsEnd; ++i) {
			items.push({
				src: this.props.items[i].src,
				selected: this.props.items[i].selected,
				index: i,
				key: 3000000 + i,
			});
		}
		const extraNeededAtEnd = Math.max(0, sum - (slicedItemsLength - lastHighlightedOffset));

		for (let i = 0; i < extraNeededAtEnd; ++i) {
			items.push({
				dummy: true,
				key: 5000000 + i,
			});
		}

		const maxOnScreen = this.props.max_either_side * 2 + numHighlighted;
		const totalItems = maxOnScreen + numHighlighted * 2;

		let targetTranslate = -numHighlighted;
		let transition = null;
		if (this.state.animating === "prev") {
			targetTranslate += this.props.highlighted_count;
			transition = `transform ${TRANSITION_DURATION}ms`;
		} else if (this.state.animating === "next") {
			targetTranslate -= this.props.highlighted_count;
			transition = `transform ${TRANSITION_DURATION}ms`;
		} else if (this.state.animating === "right") {
			targetTranslate -= this.props.highlighted_count;
			transition = `transform ${TRANSITION_DURATION}ms`;
		} else if (this.state.animating === "left") {
			targetTranslate += this.props.highlighted_count;
			transition = `transform ${TRANSITION_DURATION}ms`;
		}

		return (
			<Wrap>
				<SliderWrap>
					<PrevMore title="Go back 10 pages" onClick={this.doFastPrev} ref={this.prevMoreButtonRef} />
					<Prev onClick={this.doOnPrev} ref={this.prevButtonRef} />
					<SliderWrap2 ref={this.sliderRef}>
						<Slider
							numHighlighted={numHighlighted}
							maxOnScreen={maxOnScreen}
							totalItems={totalItems}
							targetTranslate={targetTranslate}
							transition={transition}
							items={items}
							copyExcludedPagesMap={this.props.copyExcludedPagesMap}
							page_offset_roman={this.props.page_offset_roman}
							page_offset_arabic={this.props.page_offset_arabic}
							handleCheckBoxEvent={this.handleChange}
							doOnImagePress={this.doOnImagePress}
						/>
					</SliderWrap2>
					<Next onClick={this.doOnNext} />
					<NextMore title="Go forward 10 pages" onClick={this.doForwardNext} />
				</SliderWrap>
				{this.props.doShowFlyout && (
					<Flyout height={140} width={320} target={this.prevButtonRef} onClose={this.props.onFlyoutClose}>
						{flyoutGuide.flyout[0]}
					</Flyout>
				)}
			</Wrap>
		);
	}
}
