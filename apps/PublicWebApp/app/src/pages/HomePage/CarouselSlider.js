import React from "react";
import styled, { css } from "styled-components";
import Slider from "react-slick";
import theme from "../../common/theme";
import Loader from "../../widgets/Loader";
import { Container } from "../../widgets/Layout/Container";

const CustomSlider = styled(Slider)`
	button.slick-arrow {
		position: absolute;
		border: 0;
		background-color: transparent;
		font-size: 0;
		top: 50%;
		transform: translateY(-50%);
	}
	ul.slick-dots {
		position: absolute;
		list-style: none;
		display: flex !important;
		padding: 0;
		width: 100%;
		margin-bottom: 0;
		justify-content: center;
	}
	ul.slick-dots > li button {
		font-size: 0;
		line-height: 0;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		border: 0;
		background: #006473;
		opacity: 0.25;
		margin: 0 5px;
	}
	ul.slick-dots > li.slick-active button {
		opacity: 1;
	}
	.slick-next:before,
	.slick-prev:before {
		color: #333;
	}
	.slick-slide {
		padding: 0;
	}
	.slick-next,
	.slick-prev {
		width: 40px;
		height: auto;
	}
	.slick-next:before,
	.slick-prev:before {
		color: ${theme.colours.primary};
		font-family: "Font Awesome 5 Pro";
		font-weight: normal;
		font-size: 50px;
		opacity: 1;
	}
	.slick-prev:before {
		content: "\f053";
	}
	.slick-next:before {
		content: "\f054";
	}
	.slick-list {
		margin: 0;
	}
	.slick-prev {
		left: -55px;
	}
	.slick-next {
		right: -55px;
	}
	.slick-dots li button {
		padding: 0;
	}
	.slick-dots li button:focus:before {
		opacity: 0.25;
	}
	.slick-dots li button::before {
		font-size: 14px;
		line-height: 20px;
		color: ${theme.colours.primary};
	}
	.slick-dots li.slick-active button::before {
		opacity: 1;
		color: ${theme.colours.primary};
	}
	.slick-dots li.slick button::before {
		opacity: 0.75;
		color: ${theme.colours.primary};
	}

	.slick-dots li button:hover {
		color: ${theme.colours.primary};
	}
	.slick-slide img {
		height: auto;
	}

	@media screen and (max-width: ${theme.breakpoints.largeDesktop}) {
		button.slick-arrow {
			display: none !important;
		}
	}
`;

const SliderWrapper = styled(Container)`
	margin-bottom: 40px;
	margin-top: 10px;
`;

const SlideImage = styled.img`
	width: 100%;
`;

const slickSliderSettings = {
	dots: true,
	arrows: true,
	infinite: true,
	slidesToShow: 1,
	slidesToScroll: 1,
	autoplay: true,
	autoplaySpeed: 5000, // 5 seconds
	pauseOnHover: true,
	pauseOnDotsHover: true,
};

export default class CarouselSlider extends React.PureComponent {
	render() {
		const { slideData } = this.props;
		return (
			<SliderWrapper>
				<CustomSlider {...slickSliderSettings}>
					{!slideData ? (
						<Loader />
					) : (
						slideData.map((item, index) =>
							item.link_url ? (
								<a href={item.link_url} key={index}>
									<SlideImage src={item.image_url} alt={item.image_alt_text} />
								</a>
							) : (
								<SlideImage src={item.image_url} alt={item.image_alt_text} key={index} />
							)
						)
					)}
				</CustomSlider>
			</SliderWrapper>
		);
	}
}
