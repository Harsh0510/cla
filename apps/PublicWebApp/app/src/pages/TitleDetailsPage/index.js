import React from "react";
// import withAuthRequiredConsumer from '../../mocks/withAuthRequiredConsumer';
import withAuthConsumer from "../../common/withAuthConsumer";
// import withApiConsumer from '../../mocks/withApiConsumer';
import withApiConsumer from "../../common/withApiConsumer";
import Presentation from "./Presentation";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import mappingExtractStatus from "../../common/mappingExtractStatus";
import flyOutGuide from "./flyOutGuide";
import FlyOutHandler from "../../common/FlyOutHandler";
import extractIsbn from "../../common/extractIsbn";

const SCREEN = flyOutGuide.screen;

/**
 * Component for the 'Work Details Page'
 * @extends React.PureComponent
 */
export default withAuthConsumer(
	withApiConsumer(
		class TitleDetailsPage extends React.PureComponent {
			state = {
				resultData: null,
				highlighted: "",
				copiesData: null,
				coursesData: null,
				sortField: "date_created",
				sortDir: "A",
				loading: true,
				limit: 10,
				offset: 0,
				unfilteredCountForCopies: 0,
				isTitleFull: false,
				isAuthorFull: false,
				isPublisherFull: false,
				isEditorFull: false,
				isTranslatorFull: false,
				columns: null,
				notificationCount: 0,
				tempUnlockAssetTitles: [],
			};

			constructor(props) {
				super(props);
				this._flyOutHandler = new FlyOutHandler(this, this.props.api, SCREEN);
				this._flyOutHandlerNotification = new FlyOutHandler(this, this.props.api, "notification");
				this._flyOutHandlerOnCloseBound = this._flyOutHandler.onClose.bind(this._flyOutHandler);
				this._flyOutNotificationOnCloseBound = this._flyOutHandlerNotification.onCloseNotification.bind(this._flyOutHandlerNotification);
			}

			setNotificationCount = (count) => {
				this.setState({
					notificationCount: count,
				});
			};

			/**
			 * Get the data for an individual Work based on ISBN13
			 * @param {string} isbn ISBN13 from url
			 */
			fetchWork = (isbn) => {
				const isbn13 = extractIsbn(isbn);
				this.props.api("/public/asset-get-one", { isbn13 }).then((result) => {
					this.setState({ resultData: result.result, loading: false });
				});
			};

			fetchCopies = (isbn) => {
				if (this.props.withAuthConsumer_myUserDetails) {
					const isbn13 = extractIsbn(isbn);
					this.props
						.api("/public/extract-search", {
							work_isbn13: isbn13,
							order_by: [this.state.sortField, this.state.sortDir],
							limit: this.state.limit,
							offset: this.state.offset,
						})
						.then((result) => {
							const withStausData = mappingExtractStatus(result.extracts);
							this.setState({ copiesData: withStausData, unfilteredCountForCopies: result.unfiltered_count, loading: false });
						});
				}
			};

			getAllCourses = () => {
				if (this.props.withAuthConsumer_myUserDetails) {
					this.props.api("/public/course-get-all-for-school").then((result) => {
						this.setState({ coursesData: result.result });
					});
				}
			};

			getTempUnlockedAssetTitles = () => {
				if (this.props.withAuthConsumer_myUserDetails) {
					const pdfIsbn13 = extractIsbn(this.props.match.params.isbn);
					this.props.api("/public/get-temp-unlocked-assets", { pdf_isbn13: pdfIsbn13 }).then((result) => {
						if (this._isMounted && result) {
							this.setState({
								tempUnlockAssetTitles: result.result,
							});
						}
					});
				}
			};
			/**
			 * Go to the extract page for highlighting a given page
			 * @param {number} pageNumber The target page number
			 */
			onGoToPageSubmit = (pageNumber) => {
				if (pageNumber > 0 && pageNumber <= this.state.resultData.page_count) {
					const isbn13 = extractIsbn(this.props.match.params.isbn);
					this.props.history.push("/works/" + isbn13 + `/extract?highlighted=${pageNumber}`);
				}
			};

			/**
			 * Go to the extract page for highlighting a given page
			 * @param {array} pages The target page number
			 */
			onCreateCopySubmit = (course) => {
				const isbn13 = extractIsbn(this.props.match.params.isbn);
				this.props.history.push("/works/" + isbn13 + `/extract?selected=&course=${course}`);
			};

			// Fetch works details from database on component mount
			componentDidMount() {
				this._isMounted = true;
				const isbn = this.props.match.params.isbn;
				this.fetchWork(isbn);
				/* -- Check if User has selected for Flyout --- */
				const userDetail = this.props.withAuthConsumer_myUserDetails;
				if (userDetail && userDetail.flyout_enabled) {
					this._flyOutHandler.getSeen();
					this._flyOutHandlerNotification.getSeenNotification();
				}
				this.getTempUnlockedAssetTitles();
			}

			componentDidUpdate(prevProps, prevState) {
				const isbn = this.props.match.params.isbn;
				if (isbn !== prevProps.match.params.isbn) {
					this.fetchWork(isbn);
				}
				if (prevState.resultData !== this.state.resultData) {
					this.fetchCopies(isbn);
					this.getAllCourses();
				}
				if (this.props.withAuthConsumer_myUserDetails !== prevProps.withAuthConsumer_myUserDetails) {
					this.fetchWork(isbn);
				}
			}

			componentWillUnmount() {
				this._flyOutHandler.destroy();
				this._flyOutHandlerNotification.destroy();
				delete this._flyOutHandler;
				delete this._flyOutHandlerNotification;
				delete this._isMounted;
			}

			/** sorting data based on fields*/
			doSorting = (sorting) => {
				const columnSorting = sorting[0];
				if (columnSorting) {
					const sortDirectionString = columnSorting.direction === "desc" ? "D" : "A";
					this.setState(
						{
							sortField: columnSorting.columnName,
							sortDir: sortDirectionString,
							offset: 0,
						},
						() => {
							this.fetchCopies(this.props.match.params.isbn);
						}
					);
				}
			};

			/**Pagination page select and row limit handle change event for fetch data */
			doPagination = (page, limit) => {
				const currentPage = page == 0 ? 0 : page - 1;
				const setOffset = currentPage * limit;
				this.setState(
					{
						offset: setOffset,
						limit: limit,
					},
					() => {
						this.fetchCopies(this.props.match.params.isbn);
					}
				);
			};

			toggleWidth = (clickedElement) => {
				let updateStateKey;
				switch (clickedElement) {
					case "author":
						updateStateKey = "isAuthorFull";
						break;
					case "editor":
						updateStateKey = "isEditorFull";
						break;
					case "translator":
						updateStateKey = "isTranslatorFull";
						break;
					case "publisher":
						updateStateKey = "isPublisherFull";
						break;
					default:
						updateStateKey = "isTitleFull";
						break;
				}
				this.setState({
					[updateStateKey]: !this.state[updateStateKey],
				});
			};

			doToggleFavorite = () => {
				const pdfIsbn13 = extractIsbn(this.props.match.params.isbn);
				const newFavorite = !this.state.resultData.is_favorite;
				this.props
					.api(`/public/asset-favorite`, {
						pdf_isbn13: pdfIsbn13,
						is_favorite: newFavorite,
					})
					.then((result) => {
						if (this._isMounted && result.success && this.state.resultData) {
							const newAsset = { ...this.state.resultData, is_favorite: newFavorite };
							this.setState({
								resultData: newAsset,
							});
						}
					});
			};

			render() {
				return (
					<div>
						<HeadTitle title={PageTitle.titleDetails} />
						<Presentation
							match={this.props.match}
							resultData={this.state.resultData}
							copiesData={this.state.copiesData}
							coursesData={this.state.coursesData}
							onGoToPageSubmit={this.onGoToPageSubmit}
							onCreateCopySubmit={this.onCreateCopySubmit}
							userData={this.props.withAuthConsumer_myUserDetails}
							loading={this.state.loading}
							toggleWidth={this.toggleWidth}
							isTitleFull={this.state.isTitleFull}
							isAuthorFull={this.state.isAuthorFull}
							isEditorFull={this.state.isEditorFull}
							isTranslatorFull={this.state.isTranslatorFull}
							isPublisherFull={this.state.isPublisherFull}
							doSorting={this.doSorting}
							unfilteredCountForCopies={this.state.unfilteredCountForCopies}
							limit={this.state.limit}
							doPagination={this.doPagination}
							offset={this.state.offset}
							sortField={this.state.sortField}
							sortDir={this.state.sortDir}
							onCloseFlyOut={this._flyOutHandlerOnCloseBound}
							flyOutIndex={this.state.flyOutIndex}
							onClose={this._flyOutNotificationOnCloseBound}
							notificationCount={this.state.notificationCount}
							setNotificationCount={this.setNotificationCount}
							flyOutIndexNotification={this.state.flyOutIndexNotification}
							onToggleFavorite={this.doToggleFavorite}
							api={this.props.api}
							tempUnlockAssetTitles={this.state.tempUnlockAssetTitles}
						/>
					</div>
				);
			}
		}
	)
);
