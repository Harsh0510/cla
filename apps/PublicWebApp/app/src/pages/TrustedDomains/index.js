import React from "react";
import styled from "styled-components";
import withAdminAuthRequiredConsumer from "../../common/withAdminAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import Header from "../../widgets/Header";
import queryString from "query-string";
import TableGrid from "../../widgets/TableGrid";
import Loader from "../../widgets/Loader";
import TrustedDomainAddEdit from "./TrustedDomainAddEdit";
import FilterSearchBar from "../../widgets/FilterSearchBar";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import AdminPageWrap from "../../widgets/AdminPageWrap";
import AdminPageFilterMessage from "../../widgets/AdminPageFilterMessage";
import getSearchFilterText from "../../common/getSearchFilterText";
import TableEditLink from "../../widgets/TableEditLink";
import smoothScrollTo from "../../common/smoothScroll";
import AdminPageMessage from "../../widgets/AdminPageMessage";
import TableGridFooter from "../../widgets/TableGridFooter";
import { SectionHalf, PageDetail, Button, SearchSectionOne, FilterSectionHalf, WrapperDiv } from "../../widgets/AdminStyleComponents";

//set the defualt behaviour of column header
const COLUMN_ALIGN_LEFT = "left";
const COLUMN_ALIGN_CENTER = "center";

const ACTION_LIST = "list";
const ACTION_NEW = "new";
const ACTION_ADDED = "added";
const ACTION_EDIT = "edit";
const JUMP_TO_CONTENT_ID = "main-content";

const ButtonText = styled.span`
	margin-right: 0.5rem;
`;

export default withAdminAuthRequiredConsumer(
	{ "cla-admin": true },
	withApiConsumer(
		class TrustedDomains extends React.PureComponent {
			constructor(props) {
				super(props);
				this.state = {
					limit: 10,
					offset: 0,
					sort_field: "domain",
					sort_dir: "asc",
					query: "",
					loading: true,
					isLoaded: false,
					unfiltered_count: 3,
					resultData: [],
					action: ACTION_LIST,
					message: null,
					fields: {
						oid: "",
						domain: "",
					},
					oid: null,
					currentRowDBData: null,
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
				if ((this.state.action === ACTION_NEW || this.state.action === ACTION_EDIT) && prevState.action !== this.state.action) {
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
				let oid = parsed.oid !== undefined ? parsed.oid : this.state.oid;

				let sortField = parsed.sort_field || "domain";
				let sortDir = parsed.sort_dir || "asc";
				let query = parsed.query || null;

				this.setState(
					{
						limit: limit,
						offset: offset,
						action: action,
						oid: oid,
						sort_field: sortField,
						sort_dir: sortDir,
						query: query,
					},
					this.performQuery
				);
			}

			/**
			 * Get data from api
			 */
			performQuery() {
				this.props
					.api("/admin/trusted-domain-get-all", {
						limit: this.state.limit,
						offset: this.state.offset,
						sort_field: this.state.sort_field,
						sort_direction: this.state.sort_dir,
						query: this.state.query,
					})
					.then((result) => {
						const fields = Object.assign({}, this.state.fields);
						let selectedRowData;

						if (this.state.action == ACTION_NEW || this.state.action == ACTION_ADDED) {
							fields.oid = this.state.action;
							fields.domain = "";
							this.setState({ fields: fields });
						} else if (
							this.state.action == ACTION_EDIT &&
							this.state.oid &&
							(selectedRowData = result.data.find((row) => row.id === parseInt(this.state.oid, 10)))
						) {
							fields.oid = selectedRowData.id;
							fields.domain = selectedRowData.domain;
							this.setState({ fields: fields, currentRowDBData: fields });
						} else if (result.data.length === 0) {
							this.setState({ message: "No data found" });
						}
						this.getData(result.data, result.unfiltered_count);
						let selected_Filter = null;
						let searchFilterText = getSearchFilterText(
							this.state.limit,
							this.state.offset,
							this.state.query,
							selected_Filter,
							result.unfiltered_count
						);
						this.setState({
							isLoaded: true,
							searchFilterText: searchFilterText,
						});
					})
					.catch((result) => {
						this.setState({ message: result.toString() });
					});
			}

			doOpenEditScreen = (e) => {
				e.preventDefault();
				const oid = e.currentTarget.getAttribute("data-oid");
				this.setState({
					message: null,
				});
				this.pushHistory({
					oid: oid,
					action: ACTION_EDIT,
				});
			};

			//** Get data for display in table grid */
			getData = (data, unfiltered_count) => {
				//declare columns
				let columns = [
					{ name: "domain", title: "Domain" },
					{ name: "action", title: "Edit" },
				];

				//arrange the column records
				const rows = data.map((row) => {
					// duplicate the row object. Do not modify the row object directly
					let newRow = Object.assign({}, row);
					newRow.action = (
						<TableEditLink to="" onClick={this.doOpenEditScreen} data-oid={row.id}>
							<i className="fa fa-edit"></i>
						</TableEditLink>
					);
					return newRow;
				});

				//column resizing
				let defaultColumnWidths = [
					{ columnName: "domain", width: 650 },
					{ columnName: "action", width: 80 },
				];

				//default sorting
				const sortDir = this.state.sort_dir && this.state.sort_dir[0].toUpperCase() === "D" ? "desc" : "asc";
				let defaultSorting = [{ columnName: this.state.sort_field, direction: sortDir }];

				//column initilization and alignment
				let tableColumnExtensions = [
					{ columnName: "domain", align: COLUMN_ALIGN_LEFT },
					{ columnName: "action", align: COLUMN_ALIGN_CENTER },
				];

				//default disable column for sorting
				let sortingStateColumnExtensions = [{ columnName: "action", sortingEnabled: false }];

				//for set fixed column
				let leftColumns = [];
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
					oid: this.state.oid,
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
				const url = "/profile/admin/trusted-domains?" + this.getQueryString(extra);
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

			/**
			 * create Trusted Domain
			 */
			createTrustedDomain = () => {
				this.setState({ message: null });
				this.pushHistory({
					action: ACTION_NEW,
					oid: null,
				});
			};

			/**
			 * Close the Add/Edit form
			 */
			cancelAddEdit = () => {
				this.setState({ message: null }, () => smoothScrollTo(document.querySelector("body")));
				this.pushHistory({
					action: ACTION_LIST,
					oid: null,
				});
			};

			/**
			 * Handles the form submission and attempts to add a new user to the database
			 */
			handleSubmit = (data) => {
				if (this.state.action == ACTION_NEW || this.state.action == ACTION_ADDED) {
					const params = {
						domain: data.domain,
					};

					/**Removed below commented code when end-point is ready to use */
					this.props
						.api("/admin/trusted-domain-create", params)
						.then((result) => {
							if (result.success) {
								this.setState({ message: "Trusted Domain added successfully" });
								if (this.state.action === ACTION_NEW) {
									this.pushHistory({ action: ACTION_ADDED });
								} else {
									this.pushHistory({ action: ACTION_NEW });
								}
							}
						})
						.catch((result) => {
							this.setState({ message: result.toString() });
						});
				} else if (this.state.action == ACTION_EDIT && this.state.currentRowDBData) {
					let params = this.getFieldValuesForUpdate(this.state.currentRowDBData, data);
					this.props
						.api("/admin/trusted-domain-update", params)
						.then((result) => {
							if (result) {
								this.setState({ message: "Trusted Domain updated successfully" });
								this.performQuery();
							}
						})
						.catch((result) => {
							this.setState({ message: result.toString() });
						});
				}
			};

			/**
			 * Get fileds which require need to be update
			 * @param {object} currentRowDBData existing db data
			 * @param {object} updatedRowDetail User updated detail values
			 */
			getFieldValuesForUpdate = (currentRowDBData, updatedRowDetail) => {
				let params = Object.create(null);
				if (currentRowDBData.domain != updatedRowDetail.domain) {
					params.domain = updatedRowDetail.domain;
				}
				params.id = parseInt(this.state.oid, 10);
				return params;
			};

			/**
			 * Delete the data after confirmation
			 */
			deleteData = () => {
				this.props
					.api("/admin/trusted-domain-delete", { id: parseInt(this.state.oid, 10) })
					.then((result) => {
						if (result.result) {
							this.setState({ message: "Trusted Domain deleted successfully" });
							if (this.state.offset >= this.state.unfiltered_count - 1) {
								this.setState({ offset: 0 });
							}
							this.pushHistory({ action: ACTION_LIST, oid: null });
						}
					})
					.catch((result) => {
						this.setState({ message: result.toString() });
					});
			};

			doSearch = (query) => {
				this.setState({ message: null });
				this.pushHistory({ query: query, offset: 0, action: ACTION_LIST, oid: null });
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
				const { resultData, fields, message } = this.state;

				let displayTable;
				let addEditForm = "";
				const filtersLength = this.state.filters ? this.state.filters : 0;
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

				if (this.state.action === ACTION_NEW || this.state.action === ACTION_EDIT || this.state.action === ACTION_ADDED) {
					addEditForm = (
						<TrustedDomainAddEdit
							key={fields.oid || "__NEW__"}
							message={message}
							fields={fields}
							action={this.state.action}
							deleteData={this.deleteData}
							handleSubmit={this.handleSubmit}
							cancelAddEdit={this.cancelAddEdit}
							api={this.props.api}
						/>
					);
				}

				return (
					<>
						<HeadTitle title={PageTitle.trustedDomains} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<AdminPageWrap pageTitle={"Trusted Domains"} id={JUMP_TO_CONTENT_ID}>
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
									<SectionHalf>
										<Button
											title="Create Domain"
											name="create-new"
											hide={this.state.action === ACTION_NEW || this.state.action === ACTION_ADDED}
											onClick={this.createTrustedDomain}
											setBottom={filtersLength === 0 ? "20px" : 0}
										>
											<ButtonText>Create Domain</ButtonText>
											<i className="fa fa-plus" size="sm" />
										</Button>
									</SectionHalf>
								</SearchSectionOne>
								<WrapperDiv>
									<AdminPageFilterMessage>{this.state.searchFilterText}</AdminPageFilterMessage>
									{displayTable}
									{addEditForm}
								</WrapperDiv>
							</PageDetail>
						</AdminPageWrap>
					</>
				);
			}
		}
	)
);
