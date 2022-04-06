import React from "react";
import styled, { css } from "styled-components";
import withApiConsumer from "../../common/withApiConsumer";
import theme from "../../common/theme";
import date from "../../common/date";
import getImageUrl from "./getImageUrl";

const BlogPostCard = styled.div`
	width: 100%;
	margin-bottom: 20px;
	box-shadow: 3px 4px 7px rgba(0, 0, 0, 0.4);
	display: flex;
`;

const BlogPostCardImageDiv = styled.a`
	width: 100px;
	height: 100px;
	display: block;
	background-position: center;
	background-repeat: no-repeat;
	background-size: cover;
	${(p) =>
		p.img &&
		css`
			background-image: url(${p.img});
		`}
	background-color: ${theme.colours.black};
`;

const BlogPostCardContentDiv = styled.div`
	padding: 7px 15px;
	max-width: calc(100% - 100px);
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	flex: 1;
`;

const BlogPostCardContentLink = styled.a`
	font-size: 16px;
	font-weight: bold;
	color: ${theme.colours.blogAnchorLink};
	line-height: 1.2;
	display: block;
	margin-top: 3px;
`;

const BlogPostCardContentUl = styled.ul`
	font-size: 14px;
	color: ${theme.colours.black};
	text-align: right;
	display: block;
	margin-bottom: 0;
	padding-left: 0;
	list-style: none;
`;

const BlogPostCardContentLi = styled.li`
	display: inline-block;
	position: relative;
	padding-right: 15px;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	vertical-align: bottom;
	max-width: calc(100% - 135px);
	:not(:last-child):after {
		content: "";
		position: absolute;
		height: 14px;
		width: 1px;
		background: #000;
		top: 3px;
		right: 5px;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		max-width: 100%;
		white-space: normal;
		padding-right: 0;
		display: block;
		:not(:last-child):after {
			visibility: hidden;
		}
	}
`;

const BlogPostCardContentLiDate = styled.li`
	display: inline-block;
	vertical-align: bottom;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		display: block;
	}
`;

const MoreBlogLink = styled.a`
	font-size: 18px;
	font-weight: bold;
	color: ${theme.colours.blogTextColor};
	vertical-align: middle;
`;

const MoreBlogIcon = styled.i`
	font-size: 30px;
	font-weight: bold;
	color: ${theme.colours.blogTextColor};
	vertical-align: middle;
	margin-right: 10px;
`;

const WrapMoreBlogLink = styled.div`
	text-align: right;
`;

export default withApiConsumer(
	class BlogPostInner extends React.PureComponent {
		_isMounted = false;
		constructor(props) {
			super(props);
			this.state = {
				blogPosts: [],
			};
		}

		componentDidMount() {
			this._isMounted = true;
			this.getBlogPosts();
		}

		componentWillUnmount() {
			this._isMounted = false;
			delete this._isMounted;
		}

		getBlogPosts = () => {
			this.props
				.api("/public/blog-post-get")
				.then((result) => {
					if (!this._isMounted) {
						return;
					}
					this.setState({
						blogPosts: result.data,
					});
				})
				.catch((e) => {
					if (!this._isMounted) {
						return;
					}
					this.setState({
						blogPosts: [],
					});
				});
		};

		render() {
			const blogPosts = this.state.blogPosts;
			return (
				<>
					{blogPosts.length ? (
						<>
							<h2>Latest blog posts</h2>
							<div>
								{blogPosts.map((data, index) => {
									const postAbsoluteUrl = process.env.EP_BLOG_URL + data.relative_url;
									return (
										<BlogPostCard key={index}>
											<BlogPostCardImageDiv href={postAbsoluteUrl} target="_blank" img={getImageUrl(data.image_relative_url)} />
											<BlogPostCardContentDiv>
												<BlogPostCardContentLink href={postAbsoluteUrl} target="_blank">
													{data.title}
												</BlogPostCardContentLink>
												<BlogPostCardContentUl>
													{data.author_name ? <BlogPostCardContentLi title={data.author_name}>{data.author_name}</BlogPostCardContentLi> : null}
													<BlogPostCardContentLiDate title={date.rawToNiceDate(data.date_created)}>
														{date.rawToNiceDate(data.date_created)}
													</BlogPostCardContentLiDate>
												</BlogPostCardContentUl>
											</BlogPostCardContentDiv>
										</BlogPostCard>
									);
								})}
							</div>
							<WrapMoreBlogLink>
								<MoreBlogLink href={process.env.EP_BLOG_URL} target="_blank">
									<MoreBlogIcon className="fa fa-arrow-circle-right" aria-hidden="true" />
									More posts
								</MoreBlogLink>
							</WrapMoreBlogLink>
						</>
					) : (
						<>
							<h2>About the Education Platform</h2>
							<p>
								The Platform offers a flexible and convenient way for teachers to work. Teachers can create digital copies of up to 5% of a book that
								the institution owns and then share the copies with students by sending a link in an email, adding it to a VLE or simply by printing a
								hard copy.
							</p>
							<p>
								Once a teacher has unlocked the book by scanning the barcode, they can access the digital version of the book. Copies can be stored on
								the Platform for up to three months for future use. The Platform can help teachers make the most of books that their institution owns
								by saving them time and reducing institution printing. The Platform is available as part of the CLA licence, at no additional cost to
								licensed institutions.
							</p>
						</>
					)}
				</>
			);
		}
	}
);
