import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";

const Wrap = styled.div`
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	overflow: hidden;
	width: 100%;
	height: 100%;
	background-color: ${theme.colours.black};
	cursor: pointer;
	${(p) =>
		p.poster &&
		!p.begun_play &&
		css`
			background-image: url(${p.poster});
			background-size: cover;
			background-position: center;
			background-repeat: no-repeat;
		`}
	${(p) =>
		p.icon &&
		!p.begun_play &&
		css`
			&:before {
				position: absolute;
				display: block;
				content: "";
				top: 50%;
				left: 50%;
				margin-left: -2em;
				margin-top: -2em;
				width: 4em;
				height: 4em;
				background-image: url(${p.icon});
				background-size: contain;
				background-position: center;
				background-repeat: no-repeat;
			}
		`}
`;

const ActualVideo = styled.video`
	display: block;
	width: 100%;
	height: 100%;
`;

export default class Video extends React.PureComponent {
	state = {
		begun_play: false,
	};

	doPressPlay = (e) => {
		if (!this.state.begun_play) {
			e.preventDefault();
			this.setState({ begun_play: true });
		}
	};

	render() {
		const p = this.props;
		const s = this.state;
		return (
			<Wrap poster={p.poster} icon={p.icon} begun_play={s.begun_play} onClick={this.doPressPlay}>
				{s.begun_play ? <ActualVideo src={p.src} autoPlay={true} controls={true} /> : null}
			</Wrap>
		);
	}
}
