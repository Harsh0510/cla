import React from "react";
import { withResizeDetector } from "react-resize-detector/build/withPolyfill";
import PagePreviewSlider from "../../widgets/PagePreviewSlider";

export default withResizeDetector(
	class SliderWrap extends React.PureComponent {
		render() {
			const maxEitherSide = Math.min(5, Math.max(0, Math.floor((this.props.width - 150) / 200)));
			return (
				<PagePreviewSlider
					items={this.props.items}
					highlighted_count={this.props.highlighted_count}
					highlighted_first_index={this.props.highlighted_first_index - 1}
					max_either_side={maxEitherSide}
					on_press_page={this.props.on_press_page}
					on_press_checkbox={this.props.on_press_checkbox}
					on_highlighted_page_change={this.props.on_highlighted_page_change}
					page_offset_roman={this.props.page_offset_roman}
					page_offset_arabic={this.props.page_offset_arabic}
					doShowFlyout={this.props.doShowFlyout}
					onFlyoutClose={this.props.onFlyoutClose}
					highlighted={this.props.highlighted}
					copyExcludedPagesMap={this.props.copyExcludedPagesMap}
				/>
			);
		}
	},
	{ handleWidth: true, handleHeight: false, refreshMode: "debounce", refreshRate: 100 }
);
