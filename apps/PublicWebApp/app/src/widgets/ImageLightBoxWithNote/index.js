import React from "react";
import PropTypes from "prop-types";
import "react-image-lightbox/style.css";
import LightBox from "../../vendor/lightbox";
import ImageWrapComponent from "./ImageWrapComponent";
import styled, { css } from "styled-components";

const RotateIcon = styled.i`
	cursor: pointer;
	vertical-align: middle;
	opacity: 0.7;
	padding: 1px 6px;
	&:hover {
		opacity: 1;
	}
	${(p) =>
		p.disable &&
		css`
			cursor: default;
			opacity: 0.5;
			pointer-events: none;
		`}
`;
export default class ImageLightBox extends React.PureComponent {
	_currentImageRef = (element) => {
		this.setState({
			imageElement: element,
			rotateDegree: 0,
		});
	};

	constructor(props) {
		super(props);
		this.state = {
			imageElement: null,
			rotateDegree: 0,
		};
		this._onRotateRight = this.onRotateRight.bind(this);
		this._onRotateLeft = this.onRotateLeft.bind(this);
	}

	handleImageTile = (photoIndex) => {
		if (typeof this.props.imageTitle === "function") {
			return this.props.imageTitle(photoIndex);
		} else if (typeof this.props.imageTitle === "string") {
			return this.props.imageTitle;
		}
		return null;
	};

	handleClose = (photoIndex) => {
		if (typeof this.props.onClose === "function") {
			this.props.onClose(photoIndex);
		}
	};

	onMovePrevRequest = (prevIndex) => {
		this.props.onMovePrevRequest(prevIndex);
	};

	onMoveNextRequest = (nextIndex) => {
		this.props.onMoveNextRequest(nextIndex);
	};

	onRotateRight = () => {
		let degree;
		if (this.state.rotateDegree === 270) {
			degree = 0;
		} else {
			degree = this.state.rotateDegree + 90;
		}

		this.setState(
			{
				rotateDegree: degree,
			},
			() => {}
		);
	};

	onRotateLeft = () => {
		let degree;
		if (this.state.rotateDegree === -270) {
			degree = 0;
		} else {
			degree = this.state.rotateDegree - 90;
		}

		this.setState({
			rotateDegree: degree,
		});
	};

	render() {
		const { imageTitle = null, imageCaption = null, images } = this.props;
		const availableImages = images.filter((url) => !!url);
		const photoIndex = this.props.photoIndex;
		const totalImages = availableImages.length;
		const nextIndex = (photoIndex + 1) % totalImages;
		const prevIndex = (photoIndex + totalImages - 1) % totalImages;
		const toolbarButtons = [];
		const data = Object.create(null);
		const isRotateEnable = !this.props.selectedNote && !this.props.selectedHighlight;
		data["notes"] = this.props.notes;
		data["page_index"] = photoIndex;
		data["handleNoteClick"] = this.props.handleNoteClick;
		data["handleNoteContentChange"] = this.props.handleNoteContentChange;
		data["handleNoteOnMoveOrResize"] = this.props.handleNoteOnMoveOrResize;
		data["handleNoteClose"] = this.props.handleNoteClose;
		data["teacher"] = this.props.teacher;
		data["did_create"] = this.props.did_create;
		data["recentlyCreatedNoteId"] = this.props.recentlyCreatedNoteId;
		data["isNoteDisplay"] = this.props.isNoteDisplay;
		data["selectedNote"] = this.props.selectedNote;
		data["onHighlightDraw"] = this.props.onHighlightDraw;
		data["highlights"] = this.props.highlights ? this.props.highlights : [];
		data["selectedHighlight"] = this.props.selectedHighlight;
		data["selectedNoteOid"] = this.props.selectedNoteOid;
		data["handleNoteSelection"] = this.props.handleNoteSelection;
		data["handleHiglightDelete"] = this.props.handleHiglightDelete;
		data["highlightPageInfo"] = this.props.highlightPageInfo;
		data["rotateDegree"] = this.state.rotateDegree;
		toolbarButtons.push(
			<RotateIcon className="fas fa-undo" onClick={this._onRotateLeft} disable={!isRotateEnable}></RotateIcon>,
			<RotateIcon className="fas fa-redo" onClick={this._onRotateRight} disable={!isRotateEnable}></RotateIcon>
		);

		return (
			<LightBox
				key={"lightbox"}
				mainSrc={availableImages[photoIndex]}
				nextSrc={availableImages[nextIndex]}
				prevSrc={availableImages[prevIndex]}
				onCloseRequest={this.handleClose.bind(this, photoIndex)}
				onMovePrevRequest={this.onMovePrevRequest.bind(this, prevIndex)}
				onMoveNextRequest={this.onMoveNextRequest.bind(this, nextIndex)}
				imageCaption={imageCaption}
				imageTitle={this.handleImageTile(photoIndex)}
				extraComponent={<ImageWrapComponent extraData={data} pageEl={this.state.imageElement} />}
				currentImageRef={this._currentImageRef}
				toolbarButtons={toolbarButtons}
				rotateDegree={this.state.rotateDegree}
			/>
		);
	}
}
ImageLightBox.propTypes = {
	photoIndex: PropTypes.number.isRequired, //required: Preferred photoIndex value of the target photo display in full screen
	images: PropTypes.array, // required: Array of display images
	onClose: PropTypes.func, // Close window event. Should change the parent state such that the lightbox is not rendered
	//imageTitle: PropTypes.string || PropTypes.func, // Image title (Descriptive element above image)
	imageCaption: PropTypes.string, // Image caption (Descriptive element below image)
	onMovePrevRequest: PropTypes.func, // Move on Prev page
	onMoveNextRequest: PropTypes.func, //Move on Next page
};
