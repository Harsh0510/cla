import React from "react";
import reactCreateRef from "../../common/reactCreateRef";
import styled, { css } from "styled-components";
const PageImage = styled.img`
	cursor: pointer;
`;

export default class RetryableImage extends React.PureComponent {
	state = {
		orig_src: this.props.src,
		src: this.props.src,
		attempt_count: 0,
	};

	constructor(props) {
		super(props);
		this.img = reactCreateRef();
		this._handleOnOpenBound = this.handleOnOpen.bind(this);
	}

	/** wait for async function */
	wait(millis) {
		return new Promise((resolve, reject) => setTimeout(resolve, millis));
	}

	componentDidMount() {
		this.img.current.addEventListener("error", () => {
			this.retriveimage();
		});
	}

	componentDidUpdate(prevProps) {
		if (this.props.src != prevProps.src) {
			this.img.current.addEventListener("error", () => {
				this.retriveimage();
			});
		}
	}

	handleOnOpen() {
		if (this.props.onOpen && typeof this.props.onOpen === "function") {
			this.props.onOpen(this.props.currentIndex);
		}
	}

	async retriveimage() {
		let attemptCount = parseInt(this.state.attempt_count);
		if (attemptCount < 3) {
			attemptCount = attemptCount + 1;
			let delay = 1000 * attemptCount;
			await this.wait(delay);
			this.setState({
				src: this.state.orig_src + "?_cla_cache_buster_=" + Date.now(),
				attempt_count: attemptCount,
			});
		}
	}

	render() {
		const src = this.props.src;
		return (
			<PageImage
				src={this.state.src}
				ref={this.img}
				title={this.props.title}
				alt={this.props.title}
				name="image1"
				onClick={this._handleOnOpenBound}
			/>
		);
	}
}
