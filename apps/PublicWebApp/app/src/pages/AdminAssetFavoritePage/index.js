import React from "react";
import withApiConsumer from "../../common/withApiConsumer";
import Header from "../../widgets/Header";
import queryString from "query-string";
import TableGrid from "../../widgets/TableGrid";
import Loader from "../../widgets/Loader";
import FilterSearchBar from "../../widgets/FilterSearchBar";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import AdminPageWrap from "../../widgets/AdminPageWrap";
import AdminPageFilterMessage from "../../widgets/AdminPageFilterMessage";
import getSearchFilterText from "../../common/getSearchFilterText";
import AdminPageMessage from "../../widgets/AdminPageMessage";
import TableGridFooter from "../../widgets/TableGridFooter";
import { PageDetail, SearchSectionOne, FilterSectionHalf, WrapperDiv } from "../../widgets/AdminStyleComponents";
import withAuthRequiredConsumer from "../../common/withAuthRequiredConsumer";
import { getShortFormContributors } from "../../common/misc";
import getThumbnailUrl from "../../common/getThumbnailUrl";
import styled from "styled-components";
import FavoriteIcon from "../../widgets/FavoriteIcon";
import TwoOptionSwitch from "../../widgets/ToggleSwitch/TwoOptionSwitch";
import ConfirmModal from "../../widgets/ConfirmModal";
import TableEditLink from "../../widgets/TableEditLink";
import setDefaultCoverImage from "../../common/setDefaultCoverImage";

//set the defualt behaviour of column header
const COLUMN_ALIGN_LEFT = "left";

const ACTION_LIST = "list";
const JUMP_TO_CONTENT_ID = "main-content";
const CONFIRM_TITLE = "Are you sure you want to remove all of your favourited items?";

const Wraper = styled.div`
	display: flex;
	align-items: center;
`;
const ItemImage = styled.img`
	display: block;
	width: 30px;
	height: 40px;
	border: 1px solid #abcad1;
	flex-shrink: 0;
`;

function urlEncodeAsset(isbn13, title) {
	title = title.replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase();
	return isbn13 + "-" + title;
}

export default withAuthRequiredConsumer(
	withApiConsumer(
		class AdminAssetFavoritePage extends React.PureComponent {
			state = {
				limit: 10,
				offset: 0,
				sort_field: "title",
				sort_dir: "asc",
				query: "",
				loading: true,
				isLoaded: false,
				unfiltered_count: 3,
				resultData: [],
				action: ACTION_LIST,
				message: null,
				searchFilterText: null,
				favorite_type: "asset",
				isOpenConfirmationPopUp: false,
			};

			componentDidMount() {
				this._isMounted = true;
				this.updateState();
			}

			componentWillUnmount() {
				delete this._isMounted;
			}

			componentDidUpdate(prevProps) {
				if (this.props.location.search !== prevProps.location.search) {
					this.updateState();
				}
			}

			doAssetCopyToggle = () => {
				this.pushHistory({
					offset: 0,
					query: this.state.query,
					ft: this.state.favorite_type === "asset" ? "copy" : "asset",
				});
			};

			updateState() {
				const parsed = queryString.parse(this.props.location.search);

				let limit = parseInt(parsed.limit || this.state.limit, 10);
				if (limit < 1) {
					limit = 1;
				}

				let offset = parseInt(parsed.offset || this.state.offset, 10);
				if (offset < 0) {
					offset = 0;
				}

				let action = parsed.action || this.state.action;

				let sortField = parsed.sort_field || "title";
				let sortDir = parsed.sort_dir || "asc";
				let query = parsed.query || null;
				let ft = parsed.ft || "asset";
				if (ft !== "asset" && ft !== "copy") {
					ft = "asset";
				}

				this.setState(
					{
						limit: limit,
						offset: offset,
						action: action,
						sort_field: sortField,
						sort_dir: sortDir,
						query: query,
						favorite_type: ft,
					},
					this.performQuery
				);
			}

			/**
			 * Get data from api
			 */
			performQuery = () => {
				const part = this.state.favorite_type === "asset" ? "asset" : "extract";
				this.props
					.api(`/admin/${part}-favorite-get-all`, {
						limit: this.state.limit,
						offset: this.state.offset,
						sort_field: this.state.sort_field,
						sort_direction: this.state.sort_dir,
						query: this.state.query,
					})
					.then((result) => {
						if (result.data.length === 0) {
							this.setState({ message: "No data found" });
						}
						this.getData(result.data, result.unfiltered_count);
						const searchFilterText = getSearchFilterText(this.state.limit, this.state.offset, this.state.query, null, result.unfiltered_count);
						this.setState({
							isLoaded: true,
							searchFilterText: searchFilterText,
						});
					})
					.catch((result) => {
						this.setState({ message: result.toString() });
					});
			};

			//** Get data for display in table grid */
			getData = (data, unfiltered_count) => {
				//declare columns
				const columns = [
					{ name: "title", title: "Title" },
					{ name: "publisher", title: "Publisher" },
					{ name: "authors_log", title: "Author(s)" },
					{ name: "is_unlocked", title: "Unlocked?" },
					{ name: "pdf_isbn13", title: "ISBN" },
					{ name: "publication_year", title: "Publication year" },
					{ name: "edition", title: "Edition" },
					{ name: "date_created", title: "Date added" },
					{ name: "action", title: "Favourite?" },
				];

				//arrange the column records
				const rows = data.map((row, index) => {
					// duplicate the row object. Do not modify the row object directly
					const newRow = Object.assign({}, row);
					if (this.state.favorite_type === "copy") {
						newRow.title = (
							<Wraper>
								<ItemImage width={28} height={38} src={getThumbnailUrl(row.pdf_isbn13)} alt={row.title} onError={setDefaultCoverImage} />
								&nbsp;
								<TableEditLink to={`/profile/management/${row.oid}`}>{row.title}</TableEditLink>
							</Wraper>
						);
					} else if (this.state.favorite_type === "asset") {
						const assetUrl = `/works/${urlEncodeAsset(row.pdf_isbn13, row.title)}`;
						newRow.title = (
							<Wraper>
								<ItemImage width={28} height={38} src={getThumbnailUrl(row.pdf_isbn13)} alt={row.title} onError={setDefaultCoverImage} />
								&nbsp;
								<TableEditLink to={assetUrl}>{row.title}</TableEditLink>
							</Wraper>
						);
					}
					newRow.is_unlocked = row.is_unlocked ? "Y" : "N";
					const authors = getShortFormContributors(row.authors_log);
					newRow.authors_log = authors ? authors.authors : null;
					newRow.action = <FavoriteIcon data={index} onClick={this.doToggleFavorite} is_favorite={row.is_favorite} />;
					return newRow;
				});

				//column resizing
				const defaultColumnWidths = [
					{ columnName: "title", width: 300 },
					{ columnName: "publisher", width: 200 },
					{ columnName: "authors_log", width: 200 },
					{ columnName: "is_unlocked", width: 100 },
					{ columnName: "pdf_isbn13", width: 150 },
					{ columnName: "publication_year", width: 80 },
					{ columnName: "edition", width: 80 },
					{ columnName: "date_created", width: 100 },
					{ columnName: "action", width: 80 },
				];

				//default sorting
				const sortDir = this.state.sort_dir && this.state.sort_dir[0].toUpperCase() === "D" ? "desc" : "asc";
				let defaultSorting = [{ columnName: this.state.sort_field, direction: sortDir }];

				//column initilization and alignment
				const tableColumnExtensions = [
					{ columnName: "title", align: COLUMN_ALIGN_LEFT },
					{ columnName: "publisher", align: COLUMN_ALIGN_LEFT },
					{ columnName: "authors_log", align: COLUMN_ALIGN_LEFT },
					{ columnName: "is_unlocked", align: COLUMN_ALIGN_LEFT },
					{ columnName: "pdf_isbn13", align: COLUMN_ALIGN_LEFT },
					{ columnName: "publication_year", align: COLUMN_ALIGN_LEFT },
					{ columnName: "edition", align: COLUMN_ALIGN_LEFT },
					{ columnName: "date_created", align: COLUMN_ALIGN_LEFT },
					{ columnName: "action", align: COLUMN_ALIGN_LEFT },
				];

				//default disable column for sorting
				const sortingStateColumnExtensions = [
					{ columnName: "authors_log", sortingEnabled: false },
					{ columnName: "action", sortingEnabled: false },
				];

				//for set fixed column
				const leftColumns = ["title"];
				const rightColumns = ["action"];
				//date type column names
				const dateColumnsName = ["date_created"];

				this.setState({
					unfiltered_count: unfiltered_count,
					columns: columns,
					rows: rows,
					defaultColumnWidths: defaultColumnWidths,
					tableColumnExtensions: tableColumnExtensions,
					defaultSorting: defaultSorting,
					sortingStateColumnExtensions: sortingStateColumnExtensions,
					loading: false,
					leftColumns: leftColumns,
					rightColumns: rightColumns,
					isLoaded: true,
					resultData: data,
					dateColumnsName: dateColumnsName,
				});
			};

			/**
			 * get query string
			 */
			getQueryString(extra) {
				const obj = {
					limit: this.state.limit,
					offset: this.state.offset,
					action: this.state.action,
					sort_field: this.state.sort_field,
					sort_dir: this.state.sort_dir,
					query: this.state.query,
					ft: this.state.favorite_type,
				};
				Object.assign(obj, extra || {});
				return queryString.stringify(obj);
			}

			/**
			 * Push history
			 */
			pushHistory(extra) {
				const url = "/profile/admin/favourites?" + this.getQueryString(extra);
				this.props.history.push(url);
			}

			doPagination = (page, limit) => {
				const currentPage = page == 0 ? 0 : page - 1;
				const setOffset = currentPage * limit;
				const setLimit = limit;

				this.setState({ offset: setOffset, limit: setLimit });
				this.pushHistory({
					offset: setOffset,
					action: ACTION_LIST,
					limit: setLimit,
					query: this.state.query,
				});
			};

			/**
			 * Handles the sorting data
			 */
			doSorting = (sorting) => {
				const columnSorting = sorting[0];
				const sortDirectionString = columnSorting.direction[0].toUpperCase();
				this.setState({ loading: true, message: null });
				this.pushHistory({ sort_field: columnSorting.columnName, sort_dir: sortDirectionString, offset: 0 });
			};

			doSearch = (query) => {
				this.setState({ message: null });
				this.pushHistory({ query: query, offset: 0, action: ACTION_LIST });
			};

			/** fill the state new value */
			handlefilterSelection = (selected, filterName) => {
				//bind new search data
				switch (filterName.toLowerCase()) {
					case "query":
						this.setState({ query: selected });
						break;
				}
			};

			doToggleFavorite = (index) => {
				if (!Array.isArray(this.state.resultData)) {
					return;
				}
				const record = this.state.resultData[index];
				if (!record) {
					return;
				}
				const params = {
					is_favorite: false,
				};
				let part;
				if (this.state.favorite_type === "asset") {
					params.pdf_isbn13 = record.pdf_isbn13;
					part = "asset";
				} else {
					params.oid = record.oid;
					part = "extract";
				}
				this.props.api(`/public/${part}-favorite`, params).then((result) => {
					if (this._isMounted && result.success) {
						this.performQuery();
					}
				});
			};

			resetAll = () => {
				this.setState({
					query: "",
					message: null,
				});
				this.pushHistory({
					query: "",
					offset: 0,
					action: ACTION_LIST,
				});
			};

			doRemoveAllFavorites = () => {
				const part = this.state.favorite_type === "asset" ? "asset" : "extract";
				this.props.api(`/public/${part}-favorite-delete-all`).then(() => {
					if (!this._isMounted) {
						return;
					}
					const empty = [];
					this.setState(
						{
							resultData: empty,
							unfiltered_count: 0,
							isLoaded: true,
							message: "No data found",
							searchFilterText: getSearchFilterText(this.state.limit, this.state.offset, this.state.query, null, 0),
							isOpenConfirmationPopUp: false,
						},
						() => {
							if (!this._isMounted) {
								return;
							}
							this.getData(empty, 0);
						}
					);
				});
			};

			onOpenConfirmationPopUp = () => {
				this.setState({
					isOpenConfirmationPopUp: true,
				});
			};

			onCloseConfirmationPopUp = () => {
				this.setState({
					isOpenConfirmationPopUp: false,
				});
			};

			onConfirmRemoveAllFilters = () => {
				this.doRemoveAllFavorites();
			};

			extraActions = [
				{
					name: "Remove all favourites",
					onClick: this.onOpenConfirmationPopUp,
				},
			];

			render() {
				const { resultData } = this.state;

				let displayTable;
				displayTable = <AdminPageMessage> No results found</AdminPageMessage>;
				if (!this.state.isLoaded) {
					displayTable = (
						<AdminPageMessage>
							<Loader />
						</AdminPageMessage>
					);
				}

				if (resultData !== null && resultData.length !== 0) {
					displayTable = (
						<>
							<TableGrid
								column={this.state.columns}
								row={this.state.rows}
								resize={this.state.defaultColumnWidths}
								tableColumnExtensions={this.state.tableColumnExtensions}
								defaultSorting={this.state.defaultSorting}
								sortingStateColumnExtensions={this.state.sortingStateColumnExtensions}
								doSorting={this.doSorting}
								loading={this.state.loading}
								leftColumns={this.state.leftColumns}
								rightColumns={this.state.rightColumns}
								dateColumnsName={this.state.dateColumnsName}
								extraActions={this.extraActions}
							/>
							<TableGridFooter
								unfilteredCount={this.state.unfiltered_count}
								limit={this.state.limit}
								pageNeighbours={3}
								doPagination={this.doPagination}
								currentPage={parseInt(this.state.offset) / Number(this.state.limit) + 1}
								loading={this.state.loading}
							/>
						</>
					);
				}

				return (
					<>
						<HeadTitle title={PageTitle.adminFavoritePage} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<AdminPageWrap pageTitle={PageTitle.adminFavoritePage} id={JUMP_TO_CONTENT_ID}>
							<PageDetail>
								<TwoOptionSwitch
									start_title="Assets"
									end_title="Copies"
									value={this.state.favorite_type === "copy"}
									onChange={this.doAssetCopyToggle}
								/>
								<SearchSectionOne>
									<FilterSectionHalf>
										<FilterSearchBar
											handlefilterSelection={this.handlefilterSelection}
											filterText={this.state.query}
											queryPlaceHolderText={" Search .."}
											doSearch={this.doSearch}
											resetAll={this.resetAll}
											currentUserRole={this.props.withAuthConsumer_myUserDetails.role}
										/>
									</FilterSectionHalf>
								</SearchSectionOne>
								<WrapperDiv>
									<AdminPageFilterMessage reduced_padding={true}>{this.state.searchFilterText}</AdminPageFilterMessage>
									{displayTable}
								</WrapperDiv>
							</PageDetail>
						</AdminPageWrap>
						{this.state.isOpenConfirmationPopUp && (
							<ConfirmModal
								title={CONFIRM_TITLE}
								onClose={this.onCloseConfirmationPopUp}
								onConfirm={this.onConfirmRemoveAllFilters}
								onCancel={this.onCloseConfirmationPopUp}
							/>
						)}
					</>
				);
			}
		}
	)
);
