import React from "react";
import withAdminAuthRequiredConsumer from "../../common/withAdminAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import Header from "../../widgets/Header";
import queryString from "query-string";
import TableGrid from "../../widgets/TableGrid";
import TableGridFooter from "../../widgets/TableGridFooter";
import Loader from "../../widgets/Loader";
import getSearchFilterText from "../../common/getSearchFilterText";
import AdminPageFilterMessage from "../../widgets/AdminPageFilterMessage";
import SearchFilters from "./SearchFilters";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import Modal from "../../widgets/Modal";
import ShowEditScreen from "./ShowEditScreen";
import AdminPageWrap from "../../widgets/AdminPageWrap";
import AdminPageMessage from "../../widgets/AdminPageMessage";
import { SectionHalf, PageDetail, MessageString, Button, SearchSectionOne, FilterSectionHalf, WrapperDiv } from "../../widgets/AdminStyleComponents";
import TableEditLink from "../../widgets/TableEditLink";

const byId = require("../../common/byId");

//get data from controller/app/common
const unlockImageUploadStatus = require("../../../../../Controller/app/common/unlockImageUploadStatus");
const IMAGEUPLOADSTATUS = unlockImageUploadStatus.imageUploadStatus;

const IMAGEUPLOADSTATUS_BY_ID = byId(IMAGEUPLOADSTATUS);

//set the defualt behaviour of column header
const COLUMN_ALIGN_LEFT = "left";
const COLUMN_ALIGN_RIGHT = "right";
const COLUMN_ALIGN_CENTER = "center";

const ACTION_LIST = "list";
const ACTION_NEW = "new";
const ACTION_ADDED = "added";
const ACTION_EDIT = "edit";
const JUMP_TO_CONTENT_ID = "main-content";

export default withAdminAuthRequiredConsumer(
	{ "cla-admin": true },
	withApiConsumer(
		class UnlockImageUpload extends React.PureComponent {
			constructor(props) {
				super(props);
				this.state = {
					limit: 10,
					offset: 0,
					sort_field: "date_created",
					sort_dir: "D",
					query: "",
					loading: true,
					listingDataLoaded: false,
					unfiltered_count: 3,
					ListingData: [],
					action: ACTION_LIST,
					message: null,
					fields: {
						oid: "",
						date_created: "",
						user_id: null,
						status: "",
						date_closed: null,
						rejection_reason: null,
						pdf_isbn13: null,
						user_email_log: "",
						school_name_log: "",
						url: "",
					},
					oid: "",
					currentRawData: null,
					isInProcess: false,
					searchFilterText: null,
				};
				this.resetAll = this.resetAll.bind(this);
				this.handlefilterSelection = this.handlefilterSelection.bind(this);
			}

			componentDidMount() {
				this.updateState();
			}

			componentDidUpdate(prevProps) {
				//check if userDetails update
				if (this.props.location.search !== prevProps.location.search) {
					this.updateState();
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

				let sortField = parsed.sort_field || "date_created";
				let sortDir = parsed.sort_dir || "D";
				let query = parsed.query || "";

				const newState = {
					limit: limit,
					offset: offset,
					action: action,
					oid: oid,
					sort_field: sortField,
					sort_dir: sortDir,
					query: query,
				};

				this.setState(newState, this.performQuery);
			}

			/**
			 * Get Schools information
			 */
			performQuery() {
				this.props
					.api("/admin/unlock-image-upload-get-all", {
						limit: this.state.limit,
						offset: this.state.offset,
						sort_field: this.state.sort_field,
						sort_direction: this.state.sort_dir,
						query: this.state.query,
					})
					.then((result) => {
						const fields = Object.assign({}, this.state.fields);
						let rawDetails = [];
						rawDetails = result.data.find((row) => row.oid == this.state.oid);

						if (this.state.action == ACTION_EDIT && this.state.oid && rawDetails) {
							fields.oid = rawDetails.oid;
							fields.date_created = rawDetails.date_created;
							fields.rejection_reason = rawDetails.rejection_reason;
							fields.oid = rawDetails.oid;
							fields.date_created = rawDetails.date_created;
							fields.user_id = rawDetails.user_id;
							fields.status = rawDetails.status;
							fields.date_closed = rawDetails.date_created;
							fields.rejection_reason = rawDetails.rejection_reason;
							fields.pdf_isbn13 = rawDetails.pdf_isbn13;
							fields.user_email_log = rawDetails.user_email_log;
							fields.school_name_log = rawDetails.school_name_log;
							fields.url = rawDetails.url;

							this.setState({
								fields: fields,
								currentRawData: rawDetails,
							});
						}
						this.getBindingData(result.data, result.unfiltered_count);
						this.setState({
							listingDataLoaded: true,
							isInProcess: false,
						});
						let selected_Filter = 10;
						let searchFilterText = getSearchFilterText(
							this.state.limit,
							this.state.offset,
							this.state.query,
							selected_Filter,
							result.unfiltered_count
						);
						this.setState({
							searchFilterText: searchFilterText,
						});
					})
					.catch((result) => {
						this.setState({
							message: result.toString(),
							isInProcess: false,
						});
					});
			}

			doOpenEditScreen = (e) => {
				e.preventDefault();
				const oid = e.currentTarget.getAttribute("data-id");
				this.setState({
					message: null,
				});
				this.pushHistory({
					oid: oid,
					action: ACTION_EDIT,
					query: this.state.query,
				});
			};

			//** Get Schools binding for display in table grid */
			getBindingData = (ListingData, unfiltered_count) => {
				//declare columns
				let columns = [
					{ name: "date_created", title: "Date of unlock" },
					{ name: "user_email_log", title: "User Email" },
					{ name: "school_name_log", title: "Institution" },
					{ name: "status", title: "Status" },
					{ name: "action", title: "Action" },
				];

				//arrange the column records
				const rows = ListingData.map((row) => {
					// duplicate the row object. Do not modify the row object directly
					let newRow = Object.assign({}, row);
					if (newRow.status && IMAGEUPLOADSTATUS_BY_ID[newRow.status]) {
						newRow.status = IMAGEUPLOADSTATUS_BY_ID[newRow.status];
					}

					newRow.action = (
						<TableEditLink to="" onClick={this.doOpenEditScreen} data-id={row.oid}>
							<i className="fa fa-edit"></i>
						</TableEditLink>
					);
					return newRow;
				});

				//column resizing
				let defaultColumnWidths = [
					{ columnName: "date_created", width: 200 },
					{ columnName: "user_email_log", width: 400 },
					{ columnName: "school_name_log", width: 400 },
					{ columnName: "status", width: 200 },
					{ columnName: "action", width: 100 },
				];

				//default sorting
				const sortDir = this.state.sort_dir && this.state.sort_dir[0].toUpperCase() === "D" ? "desc" : "asc";
				let defaultSorting = [{ columnName: this.state.sort_field, direction: sortDir }];

				//column initilization and alignment
				let tableColumnExtensions = [
					{ columnName: "date_created", align: COLUMN_ALIGN_LEFT },
					{ columnName: "user_email_log", align: COLUMN_ALIGN_LEFT },
					{ columnName: "school_name_log", align: COLUMN_ALIGN_LEFT },
					{ columnName: "status", align: COLUMN_ALIGN_LEFT },
					{ columnName: "action", align: COLUMN_ALIGN_CENTER },
				];

				//default disable column for sorting
				let sortingStateColumnExtensions = [{ columnName: "action", sortingEnabled: false }];

				//for set fixed column
				let leftColumns = ["date_created"];
				let rightColumns = ["action"];
				//date type column names
				let dateColumnsName = ["date_created"];

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
					listingDataLoaded: true,
					ListingData: ListingData,
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
					id: this.state.id,
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
				const url = "/profile/admin/unlock-via-image-upload?" + this.getQueryString(extra);
				this.props.history.push(url);
			}

			/**
			 * Handles the pagination page
			 */

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
				this.setState({ loading: true });
				this.pushHistory({
					sort_field: columnSorting.columnName,
					sort_dir: sortDirectionString,
					offset: 0,
					query: this.state.query,
				});
			};

			/**
			 * Close the User Add/Edit
			 */
			cancelAddEdit = () => {
				this.setState({ message: null });
				this.pushHistory({
					action: ACTION_LIST,
					id: null,
				});
			};

			doSearch = () => {
				this.setState({ message: null });
				this.pushHistory({
					query: this.state.query,
					offset: 0,
					action: ACTION_LIST,
					id: null,
				});
			};

			/** fill the state new value */
			handlefilterSelection = (selected, filterName) => {
				//bind new filter data of school and imageupload_status
				let newSelectedData = [];
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

			handleNameInputField = (inputFieldValue, inputFieldName) => {
				let fields = Object.assign({}, this.state.fields);
				fields[inputFieldName] = inputFieldValue;
				this.setState({ fields: fields });
			};

			handleSubmit = (data) => {
				this.setState({ isInProcess: true });
				var message = "";
				if (data) {
					this.props
						.api("/admin/unlock-image-upload-update", data)
						.then((result) => {
							this.setState({ updateState: false });
							if (result) {
								const response = result.result;
								if (response && response.isNotificationCreated && response.isUnlockAttemptCreated && response.isUnlockImageUpdated) {
									message = "Successfully updated.";
								} else if (response && response.isNotificationCreated && response.isUnlockImageUpdated) {
									message = "Successfully updated.";
								} else {
									message = "Error updating request.";
								}
							}
							var newState = {
								message: message,
							};
							this.setState(newState, this.performQuery);
						})
						.catch((result) => {
							this.setState({
								message: result.toString(),
								isInProcess: false,
							});
						});
				} else {
					this.setState({
						isInProcess: false,
						message: "Params not found.",
					});
				}
			};

			render() {
				const { ListingData, fields, action, listingDataLoaded, message } = this.state;
				let unlockAssetForm = "";
				let listingTable = <AdminPageMessage> No results found</AdminPageMessage>;

				if (!listingDataLoaded) {
					listingTable = (
						<AdminPageMessage>
							<Loader />
						</AdminPageMessage>
					);
				}

				if (action === ACTION_EDIT) {
					unlockAssetForm = (
						<Modal show={action === ACTION_EDIT} handleClose={this.cancelAddEdit}>
							<ShowEditScreen
								handleSubmit={this.handleSubmit}
								message={message}
								fields={fields}
								action={this.state.action}
								handleNameInputField={this.handleNameInputField}
								isInProcess={this.state.isInProcess}
							/>
						</Modal>
					);
				}

				if (ListingData !== null && ListingData.length !== 0) {
					listingTable = (
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

				return (
					<>
						<HeadTitle title={PageTitle.unlockFromImage} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<AdminPageWrap pageTitle={"Awaiting Unlocks"} id={JUMP_TO_CONTENT_ID}>
							<PageDetail>
								<SearchSectionOne>
									<FilterSectionHalf>
										<SearchFilters
											handlefilterSelection={this.handlefilterSelection}
											filterText={this.state.query}
											queryPlaceHolderText={" Search .."}
											doSearch={this.doSearch}
											resetAll={this.resetAll}
											currentUserRole={this.props.withAuthConsumer_myUserDetails.role}
										/>
									</FilterSectionHalf>
									<SectionHalf></SectionHalf>
								</SearchSectionOne>
								<WrapperDiv>
									<AdminPageFilterMessage>{this.state.searchFilterText}</AdminPageFilterMessage>
									{listingTable}
									{unlockAssetForm}
								</WrapperDiv>
							</PageDetail>
						</AdminPageWrap>
					</>
				);
			}
		}
	)
);
