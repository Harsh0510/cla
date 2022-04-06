import React from "react";

/**
 * Draws an SVG polygon.
 * Pass in an array of points into props.points.
 * Points should be a flat array in this format: [ x1, y1, x2, y2, x3, y3, ... ]
 * You can also pass in a CSS color value to props.fill (e.g. 'red' or 'rgba(255, 0, 0, 0.5)').
 */
export default class PolygonHighlight extends React.PureComponent {
	_doUpdate() {
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;
		for (let i = 0, len = this.props.points.length; i < len; i += 2) {
			const x = this.props.points[i];
			const y = this.props.points[i + 1];
			minX = Math.min(minX, x);
			minY = Math.min(minY, y);
			maxX = Math.max(maxX, x);
			maxY = Math.max(maxY, y);
		}
		const newPoints = [];
		for (let i = 0, len = this.props.points.length; i < len; i += 2) {
			const x = this.props.points[i];
			const y = this.props.points[i + 1];
			newPoints.push((x - minX).toString() + "," + (y - minY).toString());
		}
		this._polygonPoints = newPoints.join(" ");
		this._boundingBox = {
			left: minX,
			top: minY,
			right: maxX,
			bottom: maxY,
			width: maxX - minX,
			height: maxY - minY,
		};
		this._svgViewBox = `0 0 ${this._boundingBox.width} ${this._boundingBox.height}`;
	}

	constructor(props) {
		super(props);
		this._doUpdate();
	}

	componentDidUpdate(prevProps) {
		if (this.props.points !== prevProps.points) {
			this._doUpdate();
		}
	}

	render() {
		return (
			<svg
				className={this.props.className}
				style={this.props.style}
				width={this._boundingBox.width + "px"}
				height={this._boundingBox.height + "px"}
				viewBox={this._svgViewBox}
				xmlns="http://www.w3.org/2000/svg"
			>
				<polygon points={this._polygonPoints} fill={this.props.fill} stroke="none" />
			</svg>
		);
	}
}
