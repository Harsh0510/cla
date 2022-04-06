import React from "react";
import withAdminAuthRequiredConsumer from "../../common/withAdminAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import Header from "../../widgets/Header";
import queryString from "query-string";
import Loader from "../../widgets/Loader";
import FilterSearchBar from "../../widgets/FilterSearchBar";
import TableGrid from "../../widgets/TableGrid";
import PublisherAddEdit from "./PublisherAddEdit";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import AdminPageWrap from "../../widgets/AdminPageWrap";
import AdminPageFilterMessage from "../../widgets/AdminPageFilterMessage";
import getSearchFilterText from "../../common/getSearchFilterText";
import TableEditLink from "../../widgets/TableEditLink";
import smoothScrollTo from "../../common/smoothScroll";
import AdminPageMessage from "../../widgets/AdminPageMessage";
import TableGridFooter from "../../widgets/TableGridFooter";
import { PageDetail, SearchSectionOne, FilterSectionHalf, WrapperDiv } from "../../widgets/AdminStyleComponents";

const deepEqual = require("deep-equal");

//set the defualt behaviour of column header
const COLUMN_ALIGN_LEFT = "left";
const COLUMN_ALIGN_CENTER = "center";

const ACTION_LIST = "list";
const ACTION_EDIT = "edit";
const JUMP_TO_CONTENT_ID = "main-content";

export default withAdminAuthRequiredConsumer(
	{ "cla-admin": true },
	withApiConsumer(
		class PublishersPage extends React.PureComponent {
			constructor(props) {
				super(props);
				this.state = {
					limit: 10,
					offset: 0,
					sort_field: "name",
					sort_dir: "A",
					query: "",
					action: ACTION_LIST,
					loading: true,
					message: null,
					p_id: null,
					itemData: null,

					fields: {
						id: "",
						name: "",
						external_identifier: "",
						contact_name: "",
						printing_opt_out: "",
						buy_book_rules: [],
						temp_unlock_opt_in: false,
					},
					searchFilterText: null,
				};
				this.resetAll = this.resetAll.bind(this);
				this.handlefilterSelection = this.handlefilterSelection.bind(this);
			}

			componentDidMount() {
				this.updateState();
			}

			componentDidUpdate(prevProps, prevState) {
				if (this.props.location.search !== prevProps.location.search) {
					this.updateState();
				}
				if (this.state.action === ACTION_EDIT && prevState.action !== this.state.action) {
					setTimeout(() => {
						smoothScrollTo(document.querySelector(".close_btn"));
					}, 500);
				}
			}

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
				let id = parsed.id !== undefined ? parsed.id : this.state.p_id;

				let sortField = parsed.sort_field || this.state.sort_field;
				let sortDir = parsed.sort_dir || "A";
				let query = parsed.query || null;

				const newState = {
					limit: limit,
					offset: offset,
					action: action,
					p_id: id,
					sort_field: sortField,
					sort_dir: sortDir,
					query: query,
				};
				this.setState(newState, this.performQuery);
			}

			/**
			 * Get publisher information
			 */
			performQuery() {
				this.props
					.api("/admin/publisher-get-all", {
						limit: this.state.limit,
						offset: this.state.offset,
						sort_field: this.state.sort_field,
						sort_direction: this.state.sort_dir,
						query: this.state.query,
					})
					.then((result) => {
						const fields = Object.assign({}, this.state.fields);
						let itemDetails;
						if (
							this.state.action == ACTION_EDIT &&
							this.state.p_id &&
							(itemDetails = result.data.find((row) => row.id === parseInt(this.state.p_id, 10)))
						) {
							fields.id = this.state.p_id;
							fields.name = itemDetails.name;
							fields.external_identifier = itemDetails.external_identifier;
							fields.contact_name = itemDetails.contact_name;
							fields.printing_opt_out = itemDetails.printing_opt_out;
							fields.buy_book_rules = itemDetails.buy_book_rules;
							fields.temp_unlock_opt_in = itemDetails.temp_unlock_opt_in;
							this.setState({ fields: fields, currentItem: fields });
						} else if (result.data.length === 0) {
							this.setState({ message: "No data found" });
						}
						this.getItem(result.data, result.unfiltered_count);
						let selected_Filter = null;
						let searchFilterText = getSearchFilterText(
							this.state.limit,
							this.state.offset,
							this.state.query,
							selected_Filter,
							result.unfiltered_count
						);
						this.setState({
							loading: false,
							searchFilterText: searchFilterText,
						});
					})
					.catch((result) => {
						this.setState({ message: result.toString() });
					});
			}

			//** Get Publishers binding for display in table grid */
			getItem = (itemData, unfiltered_count) => {
				//declare columns
				let columns = [
					{ name: "name", title: "Name" },
					{ name: "contact_name", title: "Contact Name" },
					{ name: "action", title: "Edit" },
				];

				//arrange the column records
				const rows = itemData.map((row) => {
					const newRow = {};
					newRow.name = row.name;
					newRow.contact_name = row.contact_name;
					newRow.action = (
						<TableEditLink to="" onClick={this.doOpenEditScreen} data-pid={row.id}>
							<i className="fa fa-edit"></i>
						</TableEditLink>
					);
					return newRow;
				});

				//column resizing
				let defaultColumnWidths = [
					{ columnName: "name", width: 300 },
					{ columnName: "contact_name", width: 300 },
					{ columnName: "action", width: 100 },
				];

				//default sorting
				let defaultSorting = [
					{
						columnName: this.state.sort_field,
						direction: this.state.sort_dir && this.state.sort_dir.toUpperCase()[0] === "D" ? "desc" : "asc",
					},
				];

				//column initilization and alignment
				let tableColumnExtensions = [
					{ columnName: "name", align: COLUMN_ALIGN_LEFT },
					{ columnName: "contact_name", align: COLUMN_ALIGN_LEFT },
					{ columnName: "action", align: COLUMN_ALIGN_CENTER },
				];

				//default disable column for sorting
				let sortingStateColumnExtensions = [{ columnName: "action", sortingEnabled: false }];

				//for set fixed column
				let leftColumns = ["name"];
				let rightColumns = ["action"];
				//date type column names
				let dateColumnsName = [];

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
					itemData: itemData,
					dateColumnsName: dateColumnsName,
				});
			};

			/**
			 * Close the Publisher Add/Edit
			 */
			cancelAddEdit = () => {
				this.setState({ message: null }, () => smoothScrollTo(document.querySelector("body")));
				this.pushHistory({
					action: ACTION_LIST,
					id: null,
				});
			};

			getFieldValuesForUpdate = (currentItem, updatedItem) => {
				let params = Object.create(null);
				if (!deepEqual(currentItem.buy_book_rules, updatedItem.buy_book_rules)) {
					params.buy_book_rules = updatedItem.buy_book_rules;
				}
				if (currentItem.temp_unlock_opt_in != updatedItem.temp_unlock_opt_in) {
					params.temp_unlock_opt_in = updatedItem.temp_unlock_opt_in;
				}
				params.id = parseInt(this.state.p_id, 10);
				return params;
			};

			handleSubmit = (data) => {
				if (this.state.action == ACTION_EDIT && this.state.currentItem) {
					let params = this.getFieldValuesForUpdate(this.state.currentItem, data);
					this.props
						.api("/admin/publisher-update", params)
						.then((result) => {
							if (result.result) {
								this.setState({ message: "Successfully updated" });
								this.performQuery();
							} else {
								this.setState({ message: "Record not updated" });
							}
						})
						.catch((result) => {
							this.setState({ message: result.toString() });
						});
				}
			};

			doOpenEditScreen = (e) => {
				e.preventDefault();
				const pid = e.currentTarget.getAttribute("data-pid");
				this.setState({
					message: null,
				});
				this.pushHistory({
					id: pid,
					action: ACTION_EDIT,
				});
			};

			doPagination = (page, limit) => {
				const currentPage = page == 0 ? 0 : page - 1;
				const setOffset = currentPage * limit;
				const setLimit = limit;

				this.setState({ offset: setOffset, limit: setLimit });
				this.pushHistory({
					offset: setOffset,
					limit: setLimit,
					query: this.state.query,
				});
			};

			/**
			 * Handles the sorting data
			 */
			doSorting = (sorting) => {
				const columnSorting = sorting[0];
				const sortDirectionString = columnSorting.direction === "desc" ? "D" : "A";
				this.pushHistory({
					sort_field: columnSorting.columnName,
					sort_dir: sortDirectionString,
					offset: 0,
					loading: true,
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
					id: this.state.p_id,
					sort_field: this.state.sort_field,
					sort_dir: this.state.sort_dir,
					query: this.state.query,
				};
				Object.assign(obj, extra || {});
				return queryString.stringify(obj);
			}

			/**
			 * Push history
			 */
			pushHistory(extra) {
				const url = "/profile/admin/publishers?" + this.getQueryString(extra);
				this.props.history.push(url);
			}

			doSearch = (query) => {
				this.setState({ message: null });
				this.pushHistory({ query: query, offset: 0 });
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

			resetAll() {
				this.setState({
					query: "",
					message: null,
				});
				this.pushHistory({
					query: "",
					offset: 0,
					action: ACTION_LIST,
					userOid: null,
				});
			}

			render() {
				let itemTable, itemForm;
				itemTable = <AdminPageMessage> No results found</AdminPageMessage>;
				if (this.state.loading) {
					itemTable = (
						<AdminPageMessage>
							<Loader />
						</AdminPageMessage>
					);
				}

				if (this.state.itemData !== null && this.state.itemData.length !== 0) {
					itemTable = (
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

				if (this.state.action == ACTION_EDIT) {
					itemForm = (
						<PublisherAddEdit
							key={this.state.fields.id}
							handleSubmit={this.handleSubmit}
							cancelAddEdit={this.cancelAddEdit}
							message={this.state.message}
							fields={this.state.fields}
							action={this.state.action}
						/>
					);
				}

				return (
					<>
						<HeadTitle title={PageTitle.publishers} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<AdminPageWrap pageTitle={"Publishers"} id={JUMP_TO_CONTENT_ID}>
							<PageDetail>
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
									<AdminPageFilterMessage>{this.state.searchFilterText}</AdminPageFilterMessage>
									{itemTable}
									{itemForm}
								</WrapperDiv>
							</PageDetail>
						</AdminPageWrap>
					</>
				);
			}
		}
	)
);
