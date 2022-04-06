import React from "react";
import PropTypes from "prop-types";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import PreventRightClick from "../PreventRightClick";
import isTouchDevice from "../../common/isTouchDevice";

export default class ImageLightBox extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			photoIndex: props.defaultPhotoIndex,
		};
	}

	componentDidUpdate(prevProps) {
		if (this.props.defaultPhotoIndex !== prevProps.defaultPhotoIndex) {
			this.updateState();
		}
	}

	updateState = () => {
		this.setState({
			photoIndex: this.props.defaultPhotoIndex,
		});
	};

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

	render() {
		const { imageTitle = null, imageCaption = null, images } = this.props;
		const availableImages = images.filter((url) => !!url);
		const photoIndex = this.state.photoIndex;
		const totalImages = availableImages.length;
		const nextIndex = (photoIndex + 1) % totalImages;
		const prevIndex = (photoIndex + totalImages - 1) % totalImages;

		return (
			<PreventRightClick>
				<Lightbox
					mainSrc={availableImages[photoIndex]}
					nextSrc={availableImages[nextIndex]}
					prevSrc={availableImages[prevIndex]}
					onCloseRequest={this.handleClose.bind(this, photoIndex)}
					onMovePrevRequest={() =>
						this.setState({
							photoIndex: prevIndex,
						})
					}
					onMoveNextRequest={() =>
						this.setState({
							photoIndex: nextIndex,
						})
					}
					imageCaption={imageCaption}
					imageTitle={this.handleImageTile(photoIndex)}
				/>
			</PreventRightClick>
		);
	}
}

ImageLightBox.propTypes = {
	defaultPhotoIndex: PropTypes.number.isRequired, //required: Preferred photoIndex value of the target photo display in full screen
	images: PropTypes.array, // required: Array of display images
	onClose: PropTypes.func, // Close window event. Should change the parent state such that the lightbox is not rendered
	//imageTitle: PropTypes.string || PropTypes.func, // Image title (Descriptive element above image)
	imageCaption: PropTypes.string, // Image caption (Descriptive element below image)
};
