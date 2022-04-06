import React from "react";
import date from "../../common/date";
import theme from "../../common/theme";

class ExtractPageHighlighterInfo extends React.PureComponent {
	getPosition = () => {
		const { zoomLevel = 0, rotateDegree = 0 } = this.props;
		const parent = {};
		const child = {};
		child.background = theme.colours.white;
		parent.position = "absolute";
		parent.textOrientation = "mixed";
		parent.textAlign = "center";
		parent.color = theme.colours.black;
		parent.textShadow = "0 0 2px rgba(255, 255, 255, 0.5)";
		parent.fontSize = (zoomLevel > 0 ? 0.8 * zoomLevel : 0.5).toString() + "em";
		parent.userSelect = "none";
		if (rotateDegree === 0) {
			parent.writingMode = "tb-rl";
			parent.left = "2%";
			parent.height = "100%";
			parent.transform = `rotate(${180 + rotateDegree}deg)`;
			child.padding = "8px 4px";
		} else if (rotateDegree === 90 || rotateDegree === -270) {
			parent.transform = `rotate(0deg)`;
			parent.writingMode = "lr-tb";
			parent.left = "2%";
			parent.top = "2%";
			parent.right = "2%";
			child.padding = "4px 8px";
		} else if (rotateDegree === 180 || rotateDegree === -180) {
			parent.writingMode = "tb-rl";
			parent.top = "2%";
			parent.right = "2%";
			parent.bottom = "2%";
			parent.transform = `rotate(0deg)`;
			child.padding = "8px 4px";
		} else if (rotateDegree === 270 || rotateDegree === -90) {
			parent.writingMode = "lr-tb";
			parent.left = "2%";
			parent.bottom = "2%";
			parent.right = "2%";
			parent.transform = `rotate(180deg)`;
			child.padding = "4px 8px";
		}

		return { parent: parent, child: child };
	};
	render() {
		const position = this.getPosition();
		let first_highlight_name = "";
		let first_highlight_date = "";
		let highlighterDetails = "";

		if (this.props.highlighterInfo.length && this.props.highlighterInfo[0].first_highlight_name) {
			first_highlight_name = this.props.highlighterInfo[0].first_highlight_name;
			first_highlight_date = this.props.highlighterInfo[0].first_highlight_date;
			highlighterDetails = `Highlighting added on CLA Education Platform by ${first_highlight_name} ${date.sqlToNiceDateTimeFormat(
				first_highlight_date
			)}`;
		}
		return (
			<>
				{first_highlight_name != "" ? (
					<div style={position.parent}>
						<span style={position.child}>{highlighterDetails}</span>
					</div>
				) : (
					""
				)}
			</>
		);
	}
}

export default ExtractPageHighlighterInfo;
