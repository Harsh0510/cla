import React from "react";
import styled, { css } from "styled-components";
import { Link } from "react-router-dom";
import withPageSize from "../../common/withPageSize";
import theme from "../../common/theme";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import Loader from "../../widgets/Loader";
import WorkResultBottom from "./WorkResultBottom";
import WorkResultDescription from "./WorkResultDescription";
import ThumbnailWrapper from "./ThumbnailWrapper";
import getURLEncodeAsset from "../../common/getURLEncodeAsset";
import Flyout from "../../widgets/Flyout";
import flyOutGuide from "./flyOutGuide";
import { withFlyoutManager } from "../../common/FlyoutManager";
import FavoriteIcon from "../../widgets/FavoriteIcon";
import WorkTitle from "./WorkTitle";
import { colSm12, colXs12, noGuttersMargin, noGuttersPadding } from "../../common/style";
import { Row } from "../../widgets/Layout/Row";
import { ColExtraSmallWithNoGutters } from "../../widgets/Layout/ColExtraSmallWithNoGutters";

library.add(faStar);

// list of returned search results
const WorkList = styled.ul`
	list-style-type: none;
	padding: 0;
	margin-top: 1em;
`;

// individual search result
const WorkItem = withPageSize(styled.li`
	margin: 0;
	padding: 0;
	max-width: 100%;
	margin: auto;
	background-color: ${theme.colours.white};
	display: flex;
	flex-direction: row;
	box-sizing: border-box;
	border-bottom: 0.0625em solid #c6c6c6;
	padding-bottom: 1em;
	margin-bottom: 1em;

	${(p) =>
		p.isMobile === true &&
		css`
			display: block;
			padding: 1em 2em;
			margin-top: 0em;
			margin-bottom: 0em;
		`};
`);

const WorkResultEnd = withPageSize(styled.div`
	padding: 0.5em;
	flex: 1;
	${(props) =>
		props.breakpoint < withPageSize.MOBILE &&
		css`
			padding: 0;
		`}
`);

/*** never used in current page
 * I believe it will used in future
const Tags = withPageSize(styled.div`
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	justify-content: flex-end;
	margin: 0 0 2em 0;
	flex: 1;
	${props => (props.breakpoint < withPageSize.TABLET) && css`
		flex-direction: column;
		align-items: flex-end;
		justify-content: flex-start;
		margin: 0 0 1em 1em;
	`}
`);

const TagList = withPageSize(styled.ul`
	padding: 0;
	list-style-type: none;
	display: flex;
	order: 1;
	${props => (props.breakpoint < withPageSize.TABLET) && css`
		order: 2;
	`}
`);

const TagItem = withPageSize(styled.li`
	padding: 0.3em 0.5em 0.15em 0.5em;
	border: 1px solid ${theme.colours.primary};
	color: ${theme.colours.primary};
	line-height: 1;
	border-radius: 2px;
	margin-left: .5em;

	${props => (props.breakpoint < withPageSize.TABLET) && css`
		margin-left: 0;
		font-size: .9em;
	`}
`);
***/

const WorkResultStart = styled.div`
	display: flex;
`;

const ThumbnailLink = withPageSize(styled(Link)`
	display: block;
	margin-right: 0.5em;
`);

const NoResultsHeading = styled.h2`
	text-align: center;
	font-size: 1.2em;
	font-weight: bold;
`;

const MobRow = styled(Row)`
	${noGuttersMargin}
	flex-wrap: nowrap;
`;

const MobRowBookInfo = styled(MobRow)`
	padding: 0.5em 0 1em 0;
`;

const MobBookTitle = styled.div`
	font-weight: bold;
	line-height: 1.25em;
	font-weight: normal;
	color: ${theme.colours.primaryLight};
	margin-bottom: 0;
	overflow: hidden;
`;

const MobBook = styled.div`
	width: 79px;
	img {
		position: relative;
	}
`;

const FavoriteIconWrap = styled.div`
	padding-top: 0.75em;
	flex-shrink: 0;
`;

const MobFavoriteIconWrap = styled.div`
	display: block;
	width: 24px;
	float: left;
`;

const MobBookTitleText = styled.div`
	display: block;
	width: calc(100% - 24px);
	float: left;
`;

const WorkResultDescriptionWrap = styled.div`
	padding-right: 0;
	padding-left: 0;
	${colSm12}
	${colXs12}
	${noGuttersPadding}
`;

export default withFlyoutManager(
	class WorkResults extends React.PureComponent {
		thumbnaiLinkref = React.createRef(null);
		onCloseFlyout = () => {
			this.props.flyouts_setNext("search");
		};
		onFavoriteClick = (index) => {
			const asset = this.props.items[index];
			this.props.onToggleFavorite(asset.pdf_isbn13, asset.is_favorite);
		};
		render() {
			const props = this.props;

			if (!props.ajaxLoaded) {
				return <Loader />;
			}
			if (!props.items.length) {
				if (props.searchWasMaybeIsbn && !props.searchWasIsbn) {
					// Search query looked like an ISBN, but it was syntactically malformed.
					return <NoResultsHeading>No results found: invalid ISBN</NoResultsHeading>;
				} else {
					return <NoResultsHeading>No results found</NoResultsHeading>;
				}
			}

			let firstLockedIndex = -1;
			let firstUnlockedIndex = -1;
			for (let i = 0, len = props.items.length; i < len; ++i) {
				if (props.items[i].is_unlocked) {
					if (firstUnlockedIndex === -1) {
						firstUnlockedIndex = i;
					}
				} else {
					if (firstLockedIndex === -1) {
						firstLockedIndex = i;
					}
				}
			}
			const showFlyout = props.flyouts_getFirstUnseenIndex("search") === 4;
			return (
				<WorkList className="work-list">
					{props.items.map((asset, index) => {
						let thumbnailLink;

						if (showFlyout && index === firstUnlockedIndex) {
							thumbnailLink = (
								<>
									<ThumbnailLink to={`works/${getURLEncodeAsset(asset)}`} onClick={this.onCloseFlyout} ref={this.thumbnaiLinkref}>
										{ThumbnailWrapper({ asset: asset })}
									</ThumbnailLink>
									<Flyout onClose={this.onCloseFlyout} target={this.thumbnaiLinkref} width={theme.flyOutWidth} height={130}>
										{flyOutGuide.flyOut[3]}
									</Flyout>
								</>
							);
						} else {
							thumbnailLink = <ThumbnailLink to={`works/${getURLEncodeAsset(asset)}`}>{ThumbnailWrapper({ asset: asset })}</ThumbnailLink>;
						}
						return (
							<WorkItem className="work-item" key={asset.pdf_isbn13} isMobile={props.isMobile}>
								{props.isMobile ? (
									<>
										<MobRow>
											<div>
												<MobBook className="book">{thumbnailLink}</MobBook>
											</div>
											<div>
												<MobBookTitle title={asset.title}>
													{this.props.isLoggedIn ? (
														<>
															<MobFavoriteIconWrap>
																<FavoriteIcon data={index} onClick={this.onFavoriteClick} is_favorite={asset.is_favorite} />
															</MobFavoriteIconWrap>
															<MobBookTitleText>
																<WorkTitle asset={asset} isLoggedIn={this.props.isLoggedIn} />
															</MobBookTitleText>
														</>
													) : (
														<WorkTitle asset={asset} isLoggedIn={this.props.isLoggedIn} />
													)}
												</MobBookTitle>
											</div>
										</MobRow>
										<MobRowBookInfo>
											<WorkResultDescriptionWrap>
												{WorkResultDescription({ asset: asset, isMobile: props.isMobile, isLoggedIn: props.isLoggedIn })}
											</WorkResultDescriptionWrap>
										</MobRowBookInfo>
										<MobRow>
											<ColExtraSmallWithNoGutters>
												<WorkResultBottom
													isLoggedIn={props.isLoggedIn}
													asset={asset}
													isMobile={props.isMobile}
													isFirstLockedAsset={index === firstLockedIndex}
													isFirstUnlockedAsset={index === firstUnlockedIndex}
													courseOid={this.props.courseOid}
												/>
											</ColExtraSmallWithNoGutters>
										</MobRow>
									</>
								) : (
									<>
										<WorkResultStart>{thumbnailLink}</WorkResultStart>
										{this.props.isLoggedIn && (
											<FavoriteIconWrap>
												<FavoriteIcon data={index} onClick={this.onFavoriteClick} is_favorite={asset.is_favorite} />
											</FavoriteIconWrap>
										)}
										<WorkResultEnd>
											<WorkResultDescription asset={asset} isLoggedIn={props.isLoggedIn} isMobile={props.isMobile} />
											<WorkResultBottom
												asset={asset}
												isMobile={props.isMobile}
												isFirstLockedAsset={index === firstLockedIndex}
												isFirstUnlockedAsset={index === firstUnlockedIndex}
												isLoggedIn={props.isLoggedIn}
												courseOid={this.props.courseOid}
											/>
										</WorkResultEnd>
									</>
								)}
							</WorkItem>
						);
					})}
				</WorkList>
			);
		}
	}
);
