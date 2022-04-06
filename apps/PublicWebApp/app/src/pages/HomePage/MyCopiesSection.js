import React from "react";
import styled, { css } from "styled-components";
import { Link } from "react-router-dom";
import Loader from "../../widgets/Loader";
import date from "../../common/date";
import getThumbnailUrl from "../../common/getThumbnailUrl";
import theme from "../../common/theme";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import withAuthConsumer from "../../common/withAuthConsumer";
import CopyCreationAccessDeniedPopup from "../../widgets/CopyCreationAccessDeniedPopup";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { HomePageContainer } from "../../widgets/Layout/HomePageContainer";
import setDefaultCoverImage from "../../common/setDefaultCoverImage";

const CustomSlider = styled(Slider)`
	button.slick-arrow {
		position: absolute;
		transform: translateY(-50%);
		top: 50%;
		border: 0;
		background-color: transparent;
		font-size: 0;
		line-height: 0;
		width: 40px;
		height: 40px;
	}
	button.slick-arrow::before {
		font-size: 40px;
		opacity: 0.75;
		line-height: 1;
		color: #333;
	}
	button.slick-arrow.slick-disabled::before,
	button.slick-arrow.slick-disabled:hover::before {
		opacity: 0.25;
	}
	button.slick-arrow:hover::before {
		opacity: 1;
	}
	.slick-next:before,
	.slick-prev:before {
		color: #333;
	}
	.slick-slide {
		padding: 0 10px;
	}
	.slick-next,
	.slick-prev {
		width: 40px;
		height: 40px;
	}
	.slick-prev {
		left: -50px;
	}
	.slick-next {
		right: -65px;
	}
	.slick-next:before,
	.slick-prev:before {
		color: #333;
		font-family: "Font Awesome 5 Pro";
		font-weight: 900;
		font-size: 40px;
	}
	.slick-prev:before {
		content: "\f053";
	}
	.slick-next:before {
		content: "\f054";
	}
	.slick-list {
		margin: 0 -17px;
	}
`;

const BookInfo = styled.div`
	font-size: 14px;
	overflow: hidden;
`;

const AnchorLink = styled(Link)`
	text-decoration: none;
	color: inherit;
`;

const BookSlide = styled(AnchorLink)`
	padding: 0.5rem;
	background-color: ${theme.colours.bgGray};
	min-height: 135px;
	max-height: 135px;
	display: flex !important;
	align-items: center;
`;

const BookSlideSpan = styled.span`
	padding: 0.5rem;
	background-color: ${theme.colours.bgGray};
	min-height: 135px;
	max-height: 135px;
	text-decoration: none;
	color: inherit;
	cursor: pointer;
	display: flex;
	align-items: center;
	${(p) =>
		p.disable &&
		css`
			opacity: 0.3;
			pointer-events: none;
		`};
`;

const BookImage = styled.img`
	min-width: 87px;
	margin-right: 1rem;
`;

const WrapRow = styled(Row)`
	justify-content: center;
`;

const CustomSliderWrap = styled.div`
	margin-bottom: 0.5rem;
`;

const RecentCopiesWrap = styled.div`
	margin-top: 1rem;
`;

const WorkTitle = styled.span`
	display: block;
	font-weight: bold;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const Span = styled.span`
	display: block;
`;

export default withAuthConsumer(
	class MyCopiesSection extends React.PureComponent {
		state = {
			showModal: false,
			isRedirect: false,
		};

		handleShareCopyLink = () => {
			const myUserDetails = this.props.withAuthConsumer_myUserDetails;
			if (myUserDetails.has_trial_extract_access) {
				this.setState({
					showModal: true,
				});
			}
		};

		handleClose = () => {
			this.setState({
				showModal: false,
			});
		};

		render() {
			const settings = {
				dots: false,
				infinite: false,
				slidesToShow: 3,
				slidesToScroll: 3,
				responsive: [
					{
						breakpoint: 1024,
						settings: {
							slidesToShow: 3,
							slidesToScroll: 3,
							initialSlide: 3,
						},
					},
					{
						dots: true,
						breakpoint: 991,
						settings: {
							slidesToShow: 2,
							slidesToScroll: 2,
							initialSlide: 2,
						},
					},
					{
						dots: true,
						breakpoint: 767,
						settings: {
							slidesToShow: 1,
							slidesToScroll: 1,
							initialSlide: 1,
						},
					},
					{
						dots: true,
						breakpoint: 400,
						settings: {
							slidesToShow: 1,
							slidesToScroll: 1,
							initialSlide: 1,
						},
					},
				],
			};
			const myUserDetails = this.props.withAuthConsumer_myUserDetails;
			return (
				<Container>
					<WrapRow>
						<HomePageContainer>
							<RecentCopiesWrap className="book-slider-section">
								<h2>
									Recent Copies <AnchorLink to="/profile/my-copies">{this.props.data ? `(${this.props.data.length})` : ""}</AnchorLink>
								</h2>

								{this.props.data === null ? (
									<Loader />
								) : this.props.error ? (
									<div>{this.props.error}</div>
								) : this.props.data.length === 0 ? (
									<>
										<p>
											<strong>No copies found.</strong>
										</p>
										<p>
											<Link to="/works">Click here</Link> to start making some copies.
										</p>
									</>
								) : (
									<CustomSliderWrap className="book-slider">
										<CustomSlider {...settings}>
											{myUserDetails.can_copy
												? this.props.data.map((item, index) => (
														<BookSlide key={index} to={`/profile/management/${item.oid}`}>
															<BookImage
																src={getThumbnailUrl(item.work_isbn13)}
																alt={item.work_title}
																width="87"
																height="105"
																onError={setDefaultCoverImage}
															/>
															<BookInfo>
																<WorkTitle>{item.work_title}</WorkTitle>
																<Span>Copy: {item.title}</Span>
																<Span>Class: {item.course_name}</Span>
																{item.work_publication_date ? <Span>{date.sqlToNiceFormat(item.work_publication_date)}</Span> : ""}
															</BookInfo>
														</BookSlide>
												  ))
												: this.props.data.map((item, index) => (
														<BookSlideSpan key={index} onClick={this.handleShareCopyLink} disable={!myUserDetails.has_trial_extract_access}>
															<BookImage
																src={getThumbnailUrl(item.work_isbn13)}
																alt={item.work_title}
																width="87"
																height="105"
																onError={setDefaultCoverImage}
															/>
															<BookInfo>
																<WorkTitle>{item.work_title}</WorkTitle>
																<Span>Copy: {item.title}</Span>
																<Span>Class: {item.course_name}</Span>
																{item.work_publication_date ? <Span>{date.sqlToNiceFormat(item.work_publication_date)}</Span> : ""}
															</BookInfo>
														</BookSlideSpan>
												  ))}
										</CustomSlider>
										{this.state.showModal && <CopyCreationAccessDeniedPopup handleClose={this.handleClose} />}
									</CustomSliderWrap>
								)}
							</RecentCopiesWrap>
						</HomePageContainer>
					</WrapRow>
				</Container>
			);
		}
	}
);
