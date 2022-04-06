/**
 * A simple component that manages a list of notes.
 */

import React from "react";
import Highlight from "./Highlight";

/**
 * @typedef highlight
 * @prop {string} oid
 * @prop {number} width
 * @prop {number} height
 * @prop {number} left Position from left (0.0 to 1.0 representing ratio)
 * @prop {number} top Position from top (0.0 to 1.0 representing ratio)
 * @prop {string} color
 */

/**
 * @typedef Props
 * @prop {highlight[]} highlights

 */

/**
 * @extends {React.PureComponent<Props, {}>}
 */
class Manager extends React.PureComponent {
	render() {
		return (
			<>
				{this.props.highlights &&
					this.props.highlights.map((highlight, idx) => (
						<Highlight
							key={highlight.oid}
							user_data={idx}
							oid={highlight.oid}
							width={highlight.width}
							height={highlight.height}
							left={highlight.position_x}
							top={highlight.position_y}
							colour={highlight.colour}
							handleHiglightDelete={this.props.handleHiglightDelete}
							selectedHighlight={this.props.selectedHighlight}
							rotateDegree={this.props.rotateDegree}
						/>
					))}
			</>
		);
	}
}

export default Manager;
