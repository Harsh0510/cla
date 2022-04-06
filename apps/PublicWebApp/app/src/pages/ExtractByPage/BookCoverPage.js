import React from "react";
import styled from "styled-components";
import getThumbnailUrl from "../../common/getThumbnailUrl.js";
import { Link } from "react-router-dom";
import theme from "../../common/theme.js";
import WorkResultDescription from "./WorkResultDescription";
import FavoriteIcon from "../../widgets/FavoriteIcon";
import reactCreateRef from "../../common/reactCreateRef";
import AjaxSearchableDropdown from "../../widgets/AjaxSearchableDropdown";
import staticValues from "../../common/staticValues";
import Flyout from "../../widgets/Flyout";
import flyoutGuide from "./flyoutGuide";
import { col12, colAuto, colLg12, colLg9, colSm8, colXl3, colXl6, formControl } from "../../common/style.js";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { ColMedium } from "../../widgets/Layout/ColMedium.js";
import setDefaultCoverImage from "../../common/setDefaultCoverImage.js";

const FLYOUT_INDEX_ON_ICON = 5; // flyout index for display flyout on epub icon
const FLYOUT_INDEX_ON_GOTOTEXT = 6; // flyout index for display flyout on go to page

const FILE_FORMAT_EPUB = staticValues.assetFileFormat.epub;
const CONTENT_FORM_MI = staticValues.assetContentForm.mi;

const BookInfo = styled.section`
	margin-top: 40px;
	padding: 20px 0 12px;
	background-color: ${theme.colours.lime};
`;

const CustomInput = styled.div`
	background-color: ${theme.colours.white};
	display: inline;
	margin-bottom: 1rem;
	margin-left: 15px;
	margin-bottom: 0;
	form {
		display: inline;
	}
`;

const BookImageContainer = styled.div`
	width: 140px;
	margin-right: 15px;
	text-align: right;
	font-size: 0;

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		width: 130px;
		text-align: left;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		text-align: left;
	}
`;

const BookImage = styled.img`
	width: 113px;
	height: 143px;
	position: relative;
	top: -40px;
	box-shadow: 0px 4px 7px 0px rgba(0, 0, 0, 0.5);
	display: inline-block;
	margin-bottom: -60px;

	@media screen and (max-width: ${theme.breakpoints.tablet2}) {
		position: static;
		margin-bottom: 15px;
	}
`;

const DescriptionAndIconWrap = styled.div`
	${col12}
	${colSm8}
	${colLg9}
	${colXl6}
	padding-top: 1rem;
	display: flex;
	@media screen and (min-width: ${theme.breakpoints.mobileSmall}) {
		padding-top: 0;
	}
`;

const FavoriteIconWrap = styled.div`
	flex-shrink: 0;
	margin-right: 15px;
	margin-top: 3px;
`;

const DescriptionWrap = styled.div`
	flex: 1;
`;

const WrapDropDownSelection = styled.div`
	width: 100%;
	display: flex;
	justify-content: flex-end;
`;

const DropDownSelection = styled.div`
	width: 100%;
	@media screen and (max-width: ${theme.breakpoints.desktop}) {
		max-width: 350px;
	}
`;

const IconSection = styled.div`
	width: 50px;
	margin-left: auto;
`;

const Display = styled.div`
	display: flex;

	@media screen and (max-width: ${theme.breakpoints.tablet3}) {
		width: 100%;
	}
`;

const FormSection = styled(ColMedium)`
	${colLg12}
	${colXl3}
	padding-top: 1rem;
	@media screen and (min-width: ${theme.breakpoints.tabletPro}) {
		padding-top: 0;
	}
`;

const CustomInputWrap = styled.div`
	padding-top: 0.5rem;
	padding-bottom: 0.5rem;
	font-size: 14px;
	text-align: right;
`;

const WrapRow = styled(Row)`
	justify-content: space-between;
`;

const IconWrapper = styled.div`
	margin-top: 5px;
`;

const GoToPageSection = styled.div`
	max-width: 190px;
	margin-left: auto;
`;

const GoToInput = styled.input`
	${formControl}

	border: 1px solid ${theme.colours.primary};
	padding: 0 8px;
	font-size: 16px;
	width: 90px;
	background-color: ${theme.colours.white};

	:focus {
		box-shadow: none;
	}

	::placeholder {
		color: ${theme.colours.darkBrownColor};
	}
`;

const WrapcolAuto = styled.div`
	${colAuto}
`;
export default class BookCoverPage extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			fields: {
				class: null,
			},
			valid: {
				class: { isValid: true, message: "" },
			},
		};
		this.gotoTextBox = reactCreateRef();
		this.epubIconRef = reactCreateRef();
		this.goToPageRef = reactCreateRef();
	}

	handleGotoPageSubmit = (e) => {
		e.preventDefault();
		this.props.handleGotoPageSubmit(this.gotoTextBox.current.value);
	};

	render() {
		const classesDropdown = (
			<AjaxSearchableDropdown
				api={this.props.api}
				name="class"
				title="Class:"
				value={this.props.selectedClass}
				placeholder="Select..."
				onChange={this.props.handleDrpChange}
				minQueryLength={2}
				requestApi={staticValues.api.classSearch}
				toolTipText={this.props.isShowTooltip ? "Please select a class" : null}
				performApiCallWhenEmpty={true}
				highlightOnError={true}
				disabled={!this.props.canCopy}
				extractOid={this.props.extractOid}
			/>
		);

		const { isBookTableContent, resultData, urlEncodeAsset, isbn, classesName } = this.props;
		return (
			<>
				<BookInfo id={this.props.jumpToContentId}>
					<Container>
						<WrapRow>
							<WrapcolAuto>
								<div style={{ display: "flex", alignItems: "center" }}>
									<BookImageContainer>
										<Link to={urlEncodeAsset}>
											<BookImage
												title={"Click on the cover to return to the title details"}
												src={getThumbnailUrl(isbn)}
												alt={resultData.title}
												width="113"
												height="143"
												onError={setDefaultCoverImage}
											/>
										</Link>
									</BookImageContainer>
									{resultData.can_copy_in_full && (
										<IconSection>
											<img
												width="50"
												height="50"
												src={require("../../assets/icons/full-circle.svg")}
												alt={"You can copy all of this title"}
												title={"You can copy all of this title"}
											/>
										</IconSection>
									)}
								</div>
							</WrapcolAuto>

							<DescriptionAndIconWrap>
								<FavoriteIconWrap>
									<FavoriteIcon onClick={this.props.onToggleFavorite} is_favorite={resultData.is_favorite} />
								</FavoriteIconWrap>
								<DescriptionWrap>
									<WorkResultDescription
										asset={resultData}
										isBookTableContent={isBookTableContent}
										toggleWidth={this.props.toggleWidth}
										isTitleFull={this.props.isTitleFull}
										isAuthorFull={this.props.isAuthorFull}
										isPublisherFull={this.props.isPublisherFull}
										isEditorFull={this.props.isEditorFull}
										isTranslatorFull={this.props.isTranslatorFull}
										urlEncodeAsset={urlEncodeAsset}
									/>
									{resultData.file_format === FILE_FORMAT_EPUB ? (
										<>
											<IconWrapper>
												<i
													className={staticValues.icons.assetFileFormatEpub}
													title={staticValues.hoverTitle.assetFileFormatEpub}
													ref={this.epubIconRef}
												></i>
											</IconWrapper>

											{this.props.flyOutIndex === FLYOUT_INDEX_ON_ICON && (
												<Flyout height={140} width={320} target={this.epubIconRef} onClose={this.props.onFlyoutClose}>
													{flyoutGuide.flyout[FLYOUT_INDEX_ON_ICON]}
												</Flyout>
											)}
										</>
									) : resultData.content_form === CONTENT_FORM_MI ? (
										<IconWrapper>
											<i className={staticValues.icons.assetContentFormMagazine} title={staticValues.hoverTitle.assetContentFormMagazine}></i>
										</IconWrapper>
									) : (
										<IconWrapper>
											<i className={staticValues.icons.assetContentFormBook} title={staticValues.hoverTitle.assetContentFormBook}></i>
										</IconWrapper>
									)}
								</DescriptionWrap>
							</DescriptionAndIconWrap>
							<FormSection style={{ paddingTop: "25px" }}>
								<WrapDropDownSelection>
									<DropDownSelection>{classesDropdown}</DropDownSelection>
								</WrapDropDownSelection>
								<CustomInputWrap>
									<GoToPageSection ref={this.goToPageRef}>
										Go to page:
										<CustomInput>
											<form onSubmit={this.handleGotoPageSubmit}>
												<GoToInput
													ref={this.gotoTextBox}
													type="text"
													onChange={this.props.setGoToPageValue}
													name="goto"
													id={"goto" + this.props.gotoPageValue}
													value={this.props.gotoPageValue}
												/>
											</form>
										</CustomInput>
									</GoToPageSection>
								</CustomInputWrap>
							</FormSection>
							{this.props.flyOutIndex === FLYOUT_INDEX_ON_GOTOTEXT && resultData.file_format === FILE_FORMAT_EPUB && (
								<Flyout
									key={this.props.flyOutIndex}
									width={380}
									height={200}
									side_preference={"left"}
									onClose={this.props.onFlyoutClose}
									target={this.goToPageRef}
								>
									{flyoutGuide.flyout[FLYOUT_INDEX_ON_GOTOTEXT]}
								</Flyout>
							)}
						</WrapRow>
					</Container>
				</BookInfo>
			</>
		);
	}
}
