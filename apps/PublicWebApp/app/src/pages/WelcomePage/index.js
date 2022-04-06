import React, { useEffect, useRef, useState } from "react";
import Header from "../../widgets/Header";
import styled from "styled-components";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import Slider from "./Slider";
import { Link } from "react-router-dom";
import theme from "../../common/theme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";

const JUMP_TO_CONTENT_ID = "main-content";

const posterUrl = require("./poster.png");

const TopSection = styled.div`
	background-color: ${theme.colours.primary};
	color: #ffffff;
	text-align: center;
	padding: 3em 1em;
	position: relative;
`;
const TopSectionInner = styled.div`
	position: relative;
`;
const TriangleLeft = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 0;
	height: 0;
	border-style: solid;
	border-width: 19vw 11vw 0 0;
	border-color: ${theme.colours.cla} transparent transparent transparent;
`;
const TriangleRight = styled.div`
	position: absolute;
	bottom: 0;
	right: 0;
	width: 0;
	height: 0;
	border-style: solid;
	border-width: 0 0 19vw 11vw;
	border-color: transparent transparent ${theme.colours.cla} transparent;
`;
const Title = styled.h1`
	font-size: 3.5em;
	margin-bottom: 0.5em;
	padding-left: 1.5em;
	padding-right: 1.5em;
	line-height: 1.2;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		font-size: 2.5em;
	}
`;
const VideoWrap = styled.div`
	position: relative;
	width: 752px;
	max-width: 100%;
	margin: 0 auto;
	box-shadow: 0px 0px 1em 0 rgba(0, 0, 0, 0.5);
`;
const VideoWrapInner = styled.div`
	position: relative;
	width: 100%;
	padding-top: 56.25%;
`;
const Video = styled.video`
	display: block;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	${(p) => !p.isPlaying && "visibility: hidden;"}
`;
const PlayButton = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	cursor: pointer;
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	background-image: url(${posterUrl});
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;
`;
const PlayIcon = styled.div`
	width: 2.5em;
	height: 2.5em;
	border-radius: 50%;
	background: ${theme.colours.cla};
	color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;
	font-size: 2em;
`;
const Subtitle = styled.h2`
	font-size: 1.65em;
	font-weight: normal;
	margin-top: 1.5em;
	margin-bottom: 1em;
	line-height: 1.2;
`;
const Buttons = styled.div`
	display: flex;
	text-align: center;
	align-items: center;
	justify-content: center;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		font-size: 0.9em;
	}
`;
const Button = styled(Link)`
	display: inline-block;
	background: #ffffff;
	color: ${theme.colours.primary};
	font-size: 1.65em;
	padding: 0.35em 0 0.2em 0;
	border-radius: 1em;
	width: 5.5em;
	margin-left: 0.5em;
	margin-right: 0.5em;
`;

const WideImage = styled.img`
	display: block;
	width: 100%;
	max-width: 1920px;
	height: auto;
	margin: 0 auto;
`;
const SliderWrap = styled.div`
	margin: 3em auto 2em auto;
	max-width: ${theme.breakpoints.desktop3};
`;
const SmallPrint = styled.div`
	text-align: center;
	margin: 0 1.14em 1.14em 1.14em;
	font-size: 0.875em;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		font-size: 0.75em;
	}
`;
const A = styled.a`
	color: ${theme.colours.primary};
	text-decoration: underline;
`;

const slides = [
	{
		quote:
			"Education Platform resources are amazing. I used it for free with my Year 11s the other day and it was so helpful in saving me time on planning.",
		author: "Joshua Preye Garry, Deputy Headteacher",
	},
	{
		quote: "A more efficient way to share content with students.",
		author: "Roshan Hunt, Head of Library",
	},
];

const WelcomePage = () => {
	const [isPlayingVideo, setIsPlayingVideo] = useState(false);
	const videoEl = useRef();

	useEffect(() => {
		if (isPlayingVideo && videoEl.current) {
			videoEl.current.play();
		}
	}, [isPlayingVideo]);

	const doPlay = (e) => {
		e.preventDefault();
		setIsPlayingVideo(true);
	};

	return (
		<>
			<HeadTitle title={PageTitle.welcome} />
			<Header jumpToContentId={JUMP_TO_CONTENT_ID} hideSignInActions={true} />
			<TopSection>
				<TriangleLeft />
				<TriangleRight />
				<TopSectionInner>
					{/* If this title is changed, don't forget to also update the title in the /welcome route in `apps/PublicWebApp/server/index.js` */}
					<Title>Welcome to the Education Platform</Title>
					<VideoWrap>
						<VideoWrapInner>
							<Video ref={videoEl} isPlaying={isPlayingVideo} controls src={process.env.ASSET_ORIGIN + "/public/landing-page-video.mp4"} />
							{!isPlayingVideo ? (
								<PlayButton onClick={doPlay} isPlaying={isPlayingVideo}>
									<PlayIcon>
										<FontAwesomeIcon icon={faPlay} />
									</PlayIcon>
								</PlayButton>
							) : null}
						</VideoWrapInner>
					</VideoWrap>
					{/* If this subtitle is changed, don't forget to also update the title in the /welcome route in `apps/PublicWebApp/server/index.js` */}
					<Subtitle>Access free digital resources to copy and share for learning and teaching.</Subtitle>
					<Buttons>
						<Button to="/sign-in">Sign in</Button>
						<Button to="/register">Register</Button>
					</Buttons>
				</TopSectionInner>
			</TopSection>
			<SliderWrap>
				<Slider slides={slides} />
			</SliderWrap>
			<SmallPrint>
				*Provided for use by institutions covered by the{" "}
				<A href="https://www.cla.co.uk/licencetocopy" target="_blank" rel="nofollow">
					CLA Education Licence
				</A>
			</SmallPrint>
			{/* If this image is changed, don't forget to also update the image referenced in the /welcome route in `apps/PublicWebApp/server/index.js` */}
			<WideImage src={require("./wide-image.jpg")} />
		</>
	);
};

export default WelcomePage;
