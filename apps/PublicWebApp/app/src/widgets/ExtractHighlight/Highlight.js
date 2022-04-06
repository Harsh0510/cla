import React from "react";

class Highlight extends React.PureComponent {
	handleOnMouseMove = () => {
		if (window._claMainMouseButtonPressed) {
			this.props.handleHiglightDelete(this.props.oid);
		}
	};
	handleOnClick = (e) => {
		e.preventDefault();
		e.stopPropagation();
		this.props.handleHiglightDelete(this.props.oid);
	};

	getHighlightPosition = () => {
		const { rotateDegree = 0, width, height, left, top, colour } = this.props;
		const highlightPosition = {
			position: "absolute",
			opacity: 0.5,
			backgroundColor: colour,
			pointerEvents: this.props.selectedHighlight ? "auto" : "none",
		};
		if (rotateDegree === 0) {
			highlightPosition.top = top + "%";
			highlightPosition.left = left + "%";
			highlightPosition.width = width + "%";
			highlightPosition.height = height + "%";
		} else if (rotateDegree === 90 || rotateDegree === -270) {
			highlightPosition.top = left + "%";
			highlightPosition.right = top + "%";
			highlightPosition.width = height + "%";
			highlightPosition.height = width + "%";
		} else if (rotateDegree === 180 || rotateDegree === -180) {
			highlightPosition.bottom = top + "%";
			highlightPosition.right = left + "%";
			highlightPosition.width = width + "%";
			highlightPosition.height = height + "%";
		} else if (rotateDegree === 270 || rotateDegree === -90) {
			highlightPosition.left = top + "%";
			highlightPosition.bottom = left + "%";
			highlightPosition.width = height + "%";
			highlightPosition.height = width + "%";
		}
		return highlightPosition;
	};
	render() {
		const highlightPosition = this.getHighlightPosition();
		return <div style={highlightPosition} onMouseMove={this.handleOnMouseMove} onClick={this.handleOnClick} />;
	}
}

export default Highlight;
