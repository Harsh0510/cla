/**
 * A simple component that manages a list of notes.
 */

import React from "react";
import Note from "./Note";

/**
 * @typedef Note
 * @prop {string} oid
 * @prop {any} user_data
 * @prop {number} width
 * @prop {number} height
 * @prop {number} left Position from left (0.0 to 1.0 representing ratio)
 * @prop {number} top Position from top (0.0 to 1.0 representing ratio)
 * @prop {string} content
 * @prop {string} subtitle
 * @prop {string} color
 */

/**
 * @typedef Props
 * @prop {Note[]} notes
 * @prop {any} user_data Custom user data passed from above (e.g. an index into an array of Managers, one for each page).
 * @prop {(userData: any, index: number) => void} onClick
 * @prop {(userData: any, index: number, content: string) => void} onContentChange
 * @prop {(userData: any, index: number, width: number, height: number) => void} onResize
 * @prop {(userData: any, index: number) => void} onClose
 * @prop {(userData: any, index: number, x: number, y: number) => void} onMove
 */

/**
 * @extends {React.PureComponent<Props, {}>}
 */
class Manager extends React.PureComponent {
	render() {
		return (
			<>
				{this.props.notes &&
					this.props.notes.map((note, idx) => (
						<Note
							key={"Note" + note.oid + "+" + idx}
							user_data={idx}
							oid={note.oid}
							width={note.width}
							height={note.height}
							left={note.position_x}
							top={note.position_y}
							content={note.content}
							zindex={note.zindex}
							colour={note.colour}
							onContentChange={this.props.onContentChange}
							onMoveOrResize={this.props.onMoveOrResize}
							handleNoteClose={this.props.handleNoteClose}
							teacher={this.props.teacher}
							did_create={this.props.did_create}
							date_created={note.date_created}
							isSelected={this.props.selectedNoteOid === note.oid}
							wrapHeight={this.props.wrapHeight}
							wrapWidth={this.props.wrapWidth}
							handleNoteSelection={this.props.handleNoteSelection}
							hideContent={this.props.hideContent}
							disabled={this.props.disabled}
							rotateDegree={this.props.rotateDegree}
							zoomLevel={this.props.zoomLevel}
						/>
					))}
			</>
		);
	}
}

export default Manager;
