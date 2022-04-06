import React from "react";
import styled from "styled-components";
import Header from "../../widgets/Header";
import TitleSection from "./TitleSection.js";
import Loader from "../../widgets/Loader";
import AccordianSection from "./AccordianSection";
import WizardExtract from "../../widgets/WizardExtract";
import withPageSize from "../../common/withPageSize";
import { Redirect } from "react-router-dom";
import CopiesTable from "../../widgets/CopiesTable";
import FlyoutModal from "../../widgets/FlyOutModal";
import Flyout from "../../widgets/Flyout";
import flyOutGuide from "./flyOutGuide";
import theme from "../../common/theme";
import CopyCreationAccessDeniedPopup from "../../widgets/CopyCreationAccessDeniedPopup";
import extractIsbn from "../../common/extractIsbn";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import TempUnlockAsset from "../../widgets/TempUnlockAsset";
import { ColSmallHalf } from "../../widgets/Layout/ColSmallHalf";
import { ColSmall } from "../../widgets/Layout/ColSmall";

const FLYOUT_INDEX_DEFAULT_INDEX = -1; // flyout option index
const FLYOUT_INDEX_SELECT_CLASS = 0; // flyout option index
const FLYOUT_INDEX_NEXT_BUTTON = 1; // flyout option index
const FLYOUT_LAST_INDEX = 2; // flyout option index
const FLYOUT_DEFAULT_NOTIFICATION = -1; // default notification index
const NOTIFICATION_COUNT_DEFAULT = 0; // default notification count
const JUMP_TO_CONTENT_ID = "asset-info";
const NoWorksFound = styled.div``;

const ItemWrapper = styled(Row)`
	align-items: center;
`;

const CopiesHeading = styled.h2`
	font-weight: bold;
	color: ${theme.colours.primary};
	font-size: 22px;
`;

const TempUnlockWrap = styled.div`
	background-color: ${theme.colours.bgDarkPurple};
	color: ${theme.colours.white};
	padding: 20px;
	position: relative;
	max-width: 1150px;
	margin: 30px auto;
	width: 96%;
	box-shadow: ${theme.shadow};
	text-align: center;
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		width: 90%;
	}
`;

/**
 * Presentation component for TitleDetailsPage
 * @param {object} props Passed props
 */
export default withPageSize(
	class Presentation extends React.PureComponent {
		constructor(props) {
			super(props);
			this.state = {
				tableIsVisible: true,
				isTextDisplay: props.breakpoint > withPageSize.MOBILE,
				formRedirect: null,
				showModal: false,
			};
			this.classDropRef = React.createRef(null);
			this.createCopyRef = React.createRef(null);
			this.notificationRef = React.createRef(null);
		}

		doToggleTableVisibility = (e) => {
			e.preventDefault();
			this.setState({ tableIsVisible: !this.state.tableIsVisible });
		};

		doToggelWizard = (value) => {
			this.setState({ isTextDisplay: value });
		};

		goToUnlockPage = (e) => {
			e.preventDefault();
			this.setState({ formRedirect: true });
		};

		//show the modal for unverfied or un approve user
		doShowModal = (value) => {
			this.setState({ showModal: value });
		};

		//hide the modal for unverfied or un approve user
		hideModal = () => {
			this.setState({ showModal: false });
		};

		render() {
			const props = this.props;
			const {
				resultData,
				match,
				userData,
				copiesData,
				unfilteredCountForCopies,
				sortField,
				sortDir,
				limit,
				onCloseFlyOut,
				flyOutIndex,
				offset,
				loading,
				doSorting,
				doPagination,
			} = props;
			const isbn13 = extractIsbn(match.params.isbn);

			if (this.state.formRedirect) {
				return <Redirect to={`/unlock`} />;
			}

			if (loading) {
				return (
					<>
						<Header />
						<Loader />
					</>
				);
			}
			// const subject = resultData.params.subject_name;
			// If no results match the supplied isbn
			if (!resultData) {
				return (
					<>
						<Header />
						<Container>
							<ItemWrapper>
								<ColSmallHalf>
									<NoWorksFound>No works found with ISBN "{isbn13}".</NoWorksFound>
								</ColSmallHalf>
							</ItemWrapper>
						</Container>
					</>
				);
			}

			let copiesSection;

			if (userData && userData.school) {
				copiesSection =
					resultData.is_unlocked && copiesData && copiesData.length > 0 ? (
						<Container>
							<ItemWrapper>
								<ColSmall>
									<CopiesHeading>Copies created at {userData.school}</CopiesHeading>
								</ColSmall>
							</ItemWrapper>
							{this.state.tableIsVisible && userData ? (
								<CopiesTable
									copiesData={copiesData}
									unfilteredCount={unfilteredCountForCopies}
									sortField={sortField}
									sortDir={sortDir}
									doSorting={doSorting}
									doPagination={doPagination}
									limit={limit}
									offset={offset}
									loading={loading}
									doShowModal={this.doShowModal}
								/>
							) : (
								""
							)}
						</Container>
					) : (
						""
					);
			} else {
				copiesSection = null;
			}

			let tableContent = resultData.is_unlocked ? copiesSection : "";
			const showCopyFlyouts = resultData.is_unlocked && userData && userData.can_copy;
			const isShowAccordianSection = resultData.table_of_contents != null && (resultData.description != "" || resultData.description != null);

			return (
				<>
					<Header
						flyOutIndexNotification={this.props.flyOutIndexNotification}
						setNotificationCount={this.props.setNotificationCount}
						onClose={this.props.onClose}
						notificationRef={this.notificationRef}
						jumpToContentId={JUMP_TO_CONTENT_ID}
					/>
					<WizardExtract step={1} unlocked={resultData.is_unlocked} doToggelWizard={this.doToggelWizard} isTextDisplay={this.state.isTextDisplay} />
					<TitleSection
						{...props}
						flyOutIndex={flyOutIndex}
						classDropRef={this.classDropRef}
						createCopyRef={this.createCopyRef}
						isbn13={isbn13}
						step={1}
						isTextDisplay={this.state.isTextDisplay}
						goToUnlockPage={this.goToUnlockPage}
						jumpToContentId={JUMP_TO_CONTENT_ID}
						is_favorite={resultData.is_favorite}
						onToggleFavorite={this.props.onToggleFavorite}
						userData={this.props.userData}
						isAvailableAccordianSection={isShowAccordianSection}
					/>
					{props.userData && props.tempUnlockAssetTitles && props.tempUnlockAssetTitles.length > 0 && (
						<TempUnlockWrap>
							<TempUnlockAsset mutiple={false} data={props.tempUnlockAssetTitles} />
						</TempUnlockWrap>
					)}
					{isShowAccordianSection && <AccordianSection resultData={resultData} />}
					{tableContent}
					{showCopyFlyouts && flyOutIndex === FLYOUT_INDEX_DEFAULT_INDEX && (
						<FlyoutModal
							show={true}
							width={theme.flyOutWidth}
							handleShowMe={onCloseFlyOut}
							showButton={false}
							title={flyOutGuide.popupTitle}
							subTitle={flyOutGuide.popupSubTitle}
						/>
					)}
					{showCopyFlyouts && flyOutIndex === FLYOUT_INDEX_SELECT_CLASS && (
						<Flyout width={300} height={110} onClose={onCloseFlyOut} target={this.classDropRef}>
							{flyOutGuide.flyOut[FLYOUT_INDEX_SELECT_CLASS]}
						</Flyout>
					)}
					{showCopyFlyouts && flyOutIndex === FLYOUT_INDEX_NEXT_BUTTON && (
						<Flyout width={300} height={110} onClose={onCloseFlyOut} target={this.createCopyRef}>
							{flyOutGuide.flyOut[FLYOUT_INDEX_NEXT_BUTTON]}
						</Flyout>
					)}
					{(!showCopyFlyouts || flyOutIndex === FLYOUT_LAST_INDEX) &&
					this.props.flyOutIndexNotification === FLYOUT_DEFAULT_NOTIFICATION &&
					this.props.notificationCount > NOTIFICATION_COUNT_DEFAULT ? (
						<Flyout width={350} height={110} onClose={props.onClose} target={this.notificationRef} side_preference={"bottom"}>
							{flyOutGuide.flyOutNotification}
						</Flyout>
					) : null}
					{this.state.showModal && <CopyCreationAccessDeniedPopup handleClose={this.hideModal} />}
				</>
			);
		}
	}
);
