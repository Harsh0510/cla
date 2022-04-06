import React, { useState } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import theme from "../../common/theme";

const Wrap = styled.div`
	position: relative;
	display: flex;
`;
const Arrow = styled.div`
	font-size: 1.5em;
	width: 2em;
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;
	cursor: pointer;
`;
const Window = styled.div`
	overflow: hidden;
	flex: 1;
`;
const Slides = styled.div`
	transition: transform 500ms;
	display: flex;
`;
const Slide = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	text-align: center;
	flex: 1;
	box-sizing: border-box;
	padding: 0 2em;
	line-height: 1.2;
	overflow: hidden;
`;
const Quote = styled.div`
	color: ${theme.colours.primary};
	font-size: 1.5em;
	max-width: 920px;
	width: 100%;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		font-size: 1.2em;
	}
`;
const Author = styled.div`
	font-size: 1.5em;
	font-weight: bold;
	margin-top: 0.2em;
	max-width: 920px;
	width: 100%;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		font-size: 1.2em;
	}
`;

const Slider = (props) => {
	const [index, setIndex] = useState(0);
	const onPrev = (e) => {
		e.preventDefault();
		setIndex((index + props.slides.length - 1) % props.slides.length);
	};
	const onNext = (e) => {
		e.preventDefault();
		setIndex((index + 1) % props.slides.length);
	};
	return (
		<Wrap>
			<Arrow onClick={onPrev}>
				<FontAwesomeIcon icon={faChevronLeft} />
			</Arrow>
			<Window>
				<Slides style={{ transform: "translateX(" + (index * -100) / props.slides.length + "%)", width: props.slides.length * 100 + "%" }}>
					{props.slides.map((slide) => (
						<Slide>
							<Quote>'{slide.quote}'</Quote>
							{slide.author ? <Author>- {slide.author}</Author> : null}
						</Slide>
					))}
				</Slides>
			</Window>
			<Arrow onClick={onNext}>
				<FontAwesomeIcon icon={faChevronRight} />
			</Arrow>
		</Wrap>
	);
};

export default Slider;
