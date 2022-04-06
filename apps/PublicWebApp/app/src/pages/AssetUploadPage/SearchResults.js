import React from "react";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import StepFlow from "./StepFlow";
import { STEPS } from "./constants";
import { Container } from "../../widgets/Layout/Container";
import styled from "styled-components";
import queryString from "query-string";
import theme from "../../common/theme";
import fetchAssets from "./fetchAssets";
import { Button } from "../../widgets/Layout/Button";
import Loader from "../../widgets/Loader";
import ManualEntry from "./ManualEntry";
import OverflowText from "../../widgets/OverflowText";
import { ButtonLink } from "../../widgets/Layout/ButtonLink";

const DEFAULT_COVER_IMAGE = require("../../assets/images/cover_img.png");
const MANUAL_TYPE = "manual";
const SEARCH_TYPE = "search";

const ResultsContainer = styled.div`
	width: 70%;
	margin: 2rem auto;

	@media screen and (max-width: ${theme.breakpoints.laptop}) {
		width: 100%;
	}
`;

const Title = styled.h4`
	text-align: center;
`;

const InfoTextWrapper = styled.div`
	display: flex;
`;

const InfoIcon = styled.i`
	font-size: 18px;
	color: ${theme.colours.primary};
	margin-right: 5px;
`;

const InfoText = styled.div`
	font-style: italic;
`;

const AssetsWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
	flex-wrap: wrap;
`;

const Asset = styled.div`
	overflow: hidden;
	display: flex;
	padding: 1em 0;
	margin: 1em 0;
	width: 49%;
	max-width: 49%;
	flex-wrap: nowrap;

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		width: 100%;
		justify-content: space-between;
		max-width: 100%;
		margin: 1em auto;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		flex-direction: column;
		align-items: center;
		margin: 1em 0;
	}
`;

const WrapAssetImage = styled.div`
	position: relative;
	min-height: 1px;
	overflow: hidden;
	height: 190px;
	width: 90px;
	background-size: contain;
	background-repeat: no-repeat;
	background-position: center top;
	${(p) => (p.img ? "background-image:url(" + p.img + ");" : "")}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		text-align: center;
	}
`;

const AssetInfoWrapper = styled.div`
	min-height: calc(100% - 290px);
	display: block;
	padding-left: 10px;
	width: calc(100% - 150px);
	max-width: 335px;
	@media screen and (max-width: ${theme.breakpoints.laptop}) {
		width: 70%;
		max-width: 100%;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		padding: 0.5em 0 0 0;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
`;

const AssetInfoRaw = styled.div`
	width: 100%;
	margin-bottom: 1em;
`;

const SingleAssetInfo = styled.div`
	width: 100%;
	margin-bottom: 1em;
	padding-left: 30px;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		padding-left: 10px;
	}
`;

const AssetInfoData = styled.div`
	margin: 0.2em 0;
	font-size: 0.9375em;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		text-align: center;
	}
`;

const StyledButton = styled(Button)`
	width: 100%;
	max-width: 330px;
`;

const ButtonWrapper = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
`;

const ButtonInnerWrap = styled.div`
	position: relative;
	min-height: 1px;
	width: 135px;
`;

const SingleAsset = styled.div`
	display: flex;
	padding: 1em 0;
`;

const ConfirmationButton = styled(Button)`
	margin: 0 20px;
`;

const ConfirmButtonWrap = styled.div`
	padding-top: 10px;
`;

const ConfirmWrap = styled.div`
	padding: 1em 0;
	display: flex;
	flex-direction: row;
	align-items: center;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		flex-direction: column;
	}
`;

const ConfirmButtonIcon = styled.i`
	padding-right: 5px;
	pointer-events: none;
`;

const ButtonWrap = styled.div`
	display: flex;
	justify-content: flex-start;
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		justify-content: space-between;
	}
`;

const BackButton = styled(ButtonLink)`
	background-color: ${theme.colours.primary};
	color: ${theme.colours.white};
	font-size: 0.875em;
	margin-right: 1em;
	display: flex;
`;

const BackIcon = styled.i`
	margin-right: 0.5rem;
	margin-top: 0.2em;
	pointer-events: none;
`;

class SearchResults extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			results: [],
			loading: true,
			isShowEnterDataManually: false,
			title: "",
			isbn: "",
			author: "",
			publisher: "",
			publicationYear: "",
			pageCount: 0,
			isShowNotFoundTitle: true,
			isShowFullTitleMapping: {},
			isShowFullAuthorMapping: {},
		};
	}

	componentDidMount() {
		this._isMounted = true;
		this.updateState();
	}

	componentWillUnmount() {
		delete this._isMounted;
	}

	updateState() {
		const { title, isbn, type, author, publisher, publicationYear } = queryString.parse(this.props.location.search);
		const decodedTitle = decodeURIComponent(title || "");
		this.setState({ title: decodedTitle, isbn: isbn });
		const decodedAuthor = (() => {
			if (!author) {
				return [];
			}
			const v = decodeURIComponent(author);
			if (!v) {
				return [];
			}
			let arr;
			try {
				arr = JSON.parse(v);
			} catch (e) {
				arr = [];
			}
			if (!Array.isArray(arr)) {
				return [];
			}
			return arr;
		})();
		if (type === MANUAL_TYPE) {
			this.setState({
				title: title,
				isbn: isbn,
				author: decodedAuthor.join(", "),
				publisher: publisher,
				publicationYear: publicationYear,
			});
		}
		fetchAssets(decodedTitle || isbn)
			.then((results) => {
				if (!this._isMounted) {
					return;
				}
				this.setState({
					results,
					loading: false,
					isShowNotFoundTitle: type ? type !== MANUAL_TYPE : true,
					isShowEnterDataManually: results.length === 0 || type === MANUAL_TYPE,
				});
			})
			.catch(() => {
				if (!this._isMounted) {
					return;
				}
				this.setState({ loading: false });
			});
	}

	onAssetSelection = (index) => {
		const search = queryString.parse(this.props.location.search);
		const query = search.title ? `&search=` + search.title : `&search=` + search.isbn;
		const assetData = this.state.results[index];
		const { title, isbn, authors, publisher, image } = assetData;
		if (!title || !isbn || !authors || !publisher) {
			this.setState({
				isShowEnterDataManually: true,
				selectedResultIndex: index,
				title: title,
				isbn: isbn,
				author: authors,
				publisher: publisher,
				publicationYear: assetData["publication_year"],
				pageCount: assetData["page_count"],
				image: image,
				isShowNotFoundTitle: false,
			});
			return;
		}
		const publicationYearString = assetData["publication_year"] ? `&publicationYear=${assetData["publication_year"]}` : "";
		const pageCountString = assetData["page_count"] ? `&pageCount=${assetData["page_count"]}` : "";
		const imageString = image ? `&image=${encodeURIComponent(image)}` : "";
		this.props.history.push(
			`/asset-upload/upload-content?title=${encodeURIComponent(title)}&isbn=${isbn}&author=${encodeURIComponent(
				JSON.stringify(authors)
			)}&publisher=${encodeURIComponent(publisher)}${publicationYearString}${pageCountString}${imageString}&type=${SEARCH_TYPE}${query}`
		);
	};

	doEnterDataManually = () => {
		this.setState({
			isShowEnterDataManually: true,
			isShowNotFoundTitle: false,
		});
	};

	toggleTitle = (index) => {
		const isShowFullTitleMapping = { ...this.state.isShowFullTitleMapping };
		isShowFullTitleMapping[index] = !isShowFullTitleMapping[index];
		this.setState({ isShowFullTitleMapping: { ...isShowFullTitleMapping } });
	};

	toggleAuthor = (index) => {
		const isShowFullAuthorMapping = { ...this.state.isShowFullAuthorMapping };
		isShowFullAuthorMapping[index] = !isShowFullAuthorMapping[index];
		this.setState({ isShowFullAuthorMapping: { ...isShowFullAuthorMapping } });
	};

	getBackRedirectUrl = () => {
		const { title, isbn } = queryString.parse(this.props.location.search);
		const search = title ? `title=${encodeURIComponent(title)}` : `isbn=${isbn}`;
		const url = "/asset-upload/before-we-start?" + search;
		return url;
	};

	render() {
		const {
			loading,
			results,
			isShowEnterDataManually,
			title,
			isbn,
			author,
			publisher,
			publicationYear,
			pageCount,
			isShowNotFoundTitle,
			image,
			isShowFullTitleMapping,
			isShowFullAuthorMapping,
		} = this.state;

		if (loading) {
			return <Loader />;
		}
		const manualEntryForm = (
			<ManualEntry
				history={this.props.history}
				title={title}
				isbn={isbn}
				author={author}
				publisher={publisher}
				publicationYear={publicationYear}
				pageCount={pageCount}
				isShowNotFoundTitle={isShowNotFoundTitle}
				image={image}
				location={this.props.location}
			/>
		);
		let resultElements = null;
		if (!isShowEnterDataManually) {
			if (results.length === 1) {
				const result = results[0];

				resultElements = (
					<ResultsContainer>
						<Title>Search results</Title>
						<SingleAsset>
							<WrapAssetImage img={result.image || DEFAULT_COVER_IMAGE} title={result.title} />
							<AssetInfoWrapper>
								<SingleAssetInfo>
									<div>
										<OverflowText limit={33} isShowFullText={isShowFullTitleMapping[0] === true} onClick={() => this.toggleTitle(0)}>
											{`Title: ${result.title}`}
										</OverflowText>
									</div>
									<div>ISBN: {result.isbn}</div>
									<div>
										<OverflowText limit={33} isShowFullText={isShowFullAuthorMapping[0] === true} onClick={() => this.toggleAuthor(0)}>
											{`Author: ${result.authors ? result.authors.join(", ") : ""}`}
										</OverflowText>
									</div>
									<div>Publisher: {result.publisher} </div>
									<div>Publication year: {result.publication_year}</div>
								</SingleAssetInfo>
							</AssetInfoWrapper>
						</SingleAsset>
						<ConfirmWrap>
							Is this is what you copied from?
							<ConfirmButtonWrap>
								<ConfirmationButton
									type="button"
									onClick={() => {
										this.onAssetSelection(0);
									}}
									data-ga-user-extract="metadata-search-results-single-yes"
								>
									<ConfirmButtonIcon className="fal fa-check"></ConfirmButtonIcon>
									Yes
								</ConfirmationButton>
								<ConfirmationButton type="button" onClick={this.doEnterDataManually} data-ga-user-extract="metadata-search-results-single-no">
									<ConfirmButtonIcon className="fal fa-times"></ConfirmButtonIcon>
									No
								</ConfirmationButton>
							</ConfirmButtonWrap>
						</ConfirmWrap>
					</ResultsContainer>
				);
			} else {
				resultElements = (
					<ResultsContainer>
						<Title>We found these results</Title>
						<InfoTextWrapper>
							<InfoIcon
								className="fas fa-question-circle"
								title="Please select which title you are copying from so we can identify the correct content item to link your copy to. We will check that this is covered by your CLA Education Licence so there's no need for you to check."
							/>
							<InfoText>
								Please make sure you select the exact edition of the work you are copying - if in doubt, check the ISBN number on the copyright page
								matches the one on screen.
							</InfoText>
						</InfoTextWrapper>
						<AssetsWrapper>
							{results.map((result, index) => {
								return (
									<Asset key={index}>
										<WrapAssetImage img={result.image || DEFAULT_COVER_IMAGE} title={result.title} />
										<AssetInfoWrapper>
											<AssetInfoRaw>
												<AssetInfoData>
													<OverflowText limit={33} isShowFullText={isShowFullTitleMapping[index] === true} onClick={() => this.toggleTitle(index)}>
														{`Title: ${result.title}`}
													</OverflowText>
												</AssetInfoData>
												<AssetInfoData>ISBN: {result.isbn} </AssetInfoData>
												<AssetInfoData>
													<OverflowText limit={33} isShowFullText={isShowFullAuthorMapping[index] === true} onClick={() => this.toggleAuthor(index)}>
														{`Author: ${result.authors ? result.authors.join(", ") : ""}`}
													</OverflowText>
												</AssetInfoData>
												<AssetInfoData>Publisher: {result.publisher} </AssetInfoData>
												<AssetInfoData>Publication year: {result.publication_year}</AssetInfoData>
											</AssetInfoRaw>
											<StyledButton
												type="button"
												onClick={() => {
													this.onAssetSelection(index);
												}}
												data-ga-user-extract="metadata-search-results-multiple-confirm"
											>
												This is what I copied from
											</StyledButton>
										</AssetInfoWrapper>
									</Asset>
								);
							})}
						</AssetsWrapper>
						<ButtonWrapper>
							<Asset>
								<ButtonInnerWrap></ButtonInnerWrap>
								<ButtonWrap>
									<div>
										<BackButton title="Back" to={this.getBackRedirectUrl()} data-ga-user-extract="metadata-search-results-back">
											<BackIcon className="fal fa-chevron-left"></BackIcon>Back
										</BackButton>
									</div>
									<div>
										<StyledButton type="button" onClick={this.doEnterDataManually} data-ga-user-extract="metadata-search-results-multiple-no">
											None of these are right
										</StyledButton>
									</div>
								</ButtonWrap>
							</Asset>
						</ButtonWrapper>
					</ResultsContainer>
				);
			}
		}

		return (
			<>
				<HeadTitle title={PageTitle.extractSearch} />
				<StepFlow steps={STEPS} selectedStep={2} />
				<Container>{isShowEnterDataManually ? manualEntryForm : resultElements}</Container>
			</>
		);
	}
}

export default SearchResults;
