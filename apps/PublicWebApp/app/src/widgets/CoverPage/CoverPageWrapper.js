import React from "react";
import { withResizeDetector } from "react-resize-detector/build/withPolyfill";
import CoverPage from "../../widgets/CoverPage";

export default withResizeDetector(
	class CoverPageWrapper extends React.PureComponent {
		render() {
			const customWidth = this.props.width ? Math.floor(this.props.width) : window.innerWidth;
			const customHeight = this.props.height ? Math.floor(this.props.height) : window.innerHeight;
			return <CoverPage data={this.props.data} customWidth={customWidth} customHeight={customHeight} />;
		}
	},
	{ handleWidth: true, handleHeight: false }
);
