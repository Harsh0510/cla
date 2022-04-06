import React from "react";
import moment from "moment";
import withAdminAuthRequiredConsumer from "../../common/withAdminAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import Header from "../../widgets/Header";
import queryString from "query-string";
import TableGrid from "../../widgets/TableGrid";
import TableGridFooter from "../../widgets/TableGridFooter";
import Loader from "../../widgets/Loader";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import AdminPageWrap from "../../widgets/AdminPageWrap";
import ProcessingLogSearchFilters from "./SearchFilters";
import getSearchFilterText from "../../common/getSearchFilterText";
import AdminPageFilterMessage from "../../widgets/AdminPageFilterMessage";
import { SectionHalf, PageDetail, Button, SearchSectionOne, WrapperDiv } from "../../widgets/AdminStyleComponents";
import AdminPageMessage from "../../widgets/AdminPageMessage";
import TableEditLink from "../../widgets/TableEditLink";
import ProcessingLogDataShow from "./ProcessingLogDataShow";
import smoothScrollTo from "../../common/smoothScroll";
import date from "../../common/date";
import XLSX from "xlsx";
import styled from "styled-components";

//set the defualt behaviour of column header
const COLUMN_ALIGN_LEFT = "left";
const COLUMN_ALIGN_CENTER = "center";

const ACTION_LIST = "list";
const ACTION_EDIT = "edit";

const JUMP_TO_CONTENT_ID = "main-content";

const getEncodedDate = (dt) => {
	if (!dt) {
		return null;
	}
	if (typeof dt === "number") {
		return dt;
	}
	return Math.floor(dt.getTime() * 0.001);
};

const getDecodedDate = (dt) => {
	if (!dt) {
		return null;
	}
	if (typeof dt === "number") {
		return new Date(dt * 1000);
	}
	return dt;
};

const getDateFormat = (dt) => {
	return moment(dt).format("YYYY-MM-DD HH:mm");
};

/* This constant is used for showing filter text */
const AVAILABLE_FILTERS = [
	{ name: "Stage", stateKey: "selectedStage" },
	{ name: "Success", stateKey: "selectedSuccess" },
	{ name: "Date created (begin)", stateKey: "selectedDateCreatedBegin", format: getDateFormat },
	{ name: "Date created (end)", stateKey: "selectedDateCreatedEnd", format: getDateFormat },
];

const DownloadLinkButton = styled(Button)`
	:hover {
		text-decoration: underline;
	}
`;

export default withAdminAuthRequiredConsumer(
	{ "cla-admin": true },
	withApiConsumer(
		class ProcessingLogPage extends React.PureComponent {
			constructor(props) {
				super(props);
				this.state = {
					limit: 10,
					offset: 0,
					sort_field: "id",
					sort_dir: "desc",
					query: "",
					loading: true,
					ProcessingLogLoaded: false,
					unfilteredCount: 0,
					processingLogData: null,
					action: ACTION_LIST,
					message: null,
					filters: null,
					fields: {
						id: null,
						date_created: "",
						stage: "",
						sub_stage: "",
						asset_identifier: "",
						success: "",
						content: "",
					},
					successData: null,
					stageData: null,
					selectedStage: [],
					selectedSuccess: [],
					selectedDateCreatedBegin: null,
					selectedDateCreatedEnd: null,
					setOption: {
						value: "",
						label: "",
						key: "",
					},
					searchFilterText: null,
				};
				this.resetAll = this.resetAll.bind(this);
				this.handlefilterSelection = this.handlefilterSelection.bind(this);
				this.downloadProcessingLog = this.downloadProcessingLog.bind(this);
			}

			componentDidMount() {
				this.fetchFilters();
				this.updateState();
			}

			componentDidUpdate(prevProps, prevState) {
				if (this.props.location.search !== prevProps.location.search) {
					this.updateState();
				}
			}

			updateState() {
				if (this.state.filters) {
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
					let id = parsed.id !== undefined ? parsed.id : this.state.id;
					let sortField = parsed.sort_field || this.state.sort_field;
					let sortDir = parsed.sort_dir || this.state.sort_dir;
					let query = parsed.query || "";

					const newState = {
						limit: limit,
						offset: offset,
						action: action,
						id: id,
						sort_field: sortField,
						sort_dir: sortDir,
						query: query,
						selected: {},
					};

					for (const filter of this.state.filters) {
						newState.selected[filter.id] = [];
					}

					// get filters from query params
					if (parsed.filter_stage) {
						newState.selected.stage = parsed.filter_stage.split(",");
						delete parsed.filter_stage;
					}
					if (parsed.filter_success) {
						newState.selected.success = parsed.filter_success.split(",").map((v) => v === "true");
						delete parsed.filter_success;
					}
					if (parsed.filter_date_created_begin) {
						newState.selected.date_created_begin = parseInt(parsed.filter_date_created_begin, 10);
						newState.selectedDateCreatedBegin = getDecodedDate(newState.selected.date_created_begin);
						delete parsed.filter_date_created_begin;
					}
					if (parsed.filter_date_created_end) {
						newState.selected.date_created_end = parseInt(parsed.filter_date_created_end, 10);
						newState.selectedDateCreatedEnd = getDecodedDate(newState.selected.date_created_end);
						delete parsed.filter_date_created_end;
					}

					//check the selected stage value and if extis then store in state value
					if (newState.selected.hasOwnProperty("stage") && Array.isArray(newState.selected.stage) && newState.selected.stage.length > 0) {
						let arr = newState.selected.stage;
						let bindSelectedstage = this.state.stageData.filter((d) => arr.some((s) => s === d.value));
						newState.selectedStage = bindSelectedstage;
					}

					//check the selected success value and if extis then store in state value
					if (newState.selected.hasOwnProperty("success") && Array.isArray(newState.selected.success) && newState.selected.success.length > 0) {
						let arr = newState.selected.success;
						let bindSelectedSuccess = this.state.successData.filter((d) => arr.some((s) => s === d.value));
						newState.selectedSuccess = bindSelectedSuccess;
					}

					this.setState(newState, this.performQuery);
				}
			}

			getSelectedFilters = () => {
				const selected_filters = [];
				AVAILABLE_FILTERS.forEach((filter) => {
					if (this.state[filter.stateKey]) {
						const obj = Object.create(null);
						obj.filter = filter.name;
						obj.format = filter.format;
						if (Array.isArray(this.state[filter.stateKey])) {
							if (this.state[filter.stateKey].length) {
								obj.values = this.state[filter.stateKey].map((filterState) => filterState.label);
							}
						} else {
							obj.value = this.state[filter.stateKey];
						}
						selected_filters.push(obj);
					}
				});
				return selected_filters;
			};

			/**
			 * Get processing log information
			 */
			performQuery() {
				this.props
					.api("/admin/asset-processing-log-get-all", {
						limit: this.state.limit,
						offset: this.state.offset,
						sort_field: this.state.sort_field,
						sort_direction: this.state.sort_dir,
						query: this.state.query,
						filter: this.state.selected,
					})
					.then((result) => {
						const fields = Object.assign({}, this.state.fields);
						let processingDetails;
						if (
							this.state.action == ACTION_EDIT &&
							this.state.id &&
							(processingDetails = result.data.find((row) => row.id === parseInt(this.state.id)))
						) {
							fields.id = parseInt(processingDetails.id);
							fields.date_created = date.sqlToNiceDateWithTimeFormat(processingDetails.date_created);
							fields.stage = processingDetails.stage;
							fields.sub_stage = processingDetails.sub_stage;
							fields.asset_identifier = processingDetails.asset_identifier;
							fields.success = processingDetails.success;
							fields.content = processingDetails.content;
							this.setState({
								fields: fields,
								Processinglogdbdata: fields,
							});
						}
						this.getProcessingLog(result.data, result.unfiltered_count);
						let selected_Filter = this.getSelectedFilters();
						let searchFilterText = getSearchFilterText(
							this.state.limit,
							this.state.offset,
							this.state.query,
							selected_Filter,
							result.unfiltered_count
						);
						this.setState({
							ProcessingLogLoaded: true,
							searchFilterText: searchFilterText,
						});
					})
					.catch((result) => {
						this.setState({ message: result.toString() });
					});
			}

			doOpenEditScreen = (e) => {
				e.preventDefault();
				const id = e.currentTarget.getAttribute("data-id");
				this.setState({
					message: null,
				});
				this.pushHistory({
					id: id,
					action: ACTION_EDIT,
					selectedStage: this.state.selectedStage,
					selectedSuccess: this.state.selectedSuccess,
					selectedDateCreatedBegin: getEncodedDate(this.state.selectedDateCreatedBegin),
					selectedDateCreatedEnd: getEncodedDate(this.state.selectedDateCreatedEnd),
				});
			};

			//** Get processingLog binding for display in table grid */
			getProcessingLog = (processingLogData, unfiltered_count) => {
				//declare columns
				let columns = [
					{ name: "id", title: "ID" },
					{ name: "date_created", title: "Date Created" },
					{ name: "stage", title: "Stage" },
					{ name: "sub_stage", title: "Sub Stage" },
					{ name: "asset_identifier", title: "Asset identifier" },
					{ name: "success", title: "Success" },
					{ name: "action", title: "Action" },
				];

				//arrange the column records
				const rows = processingLogData.map((row) => {
					// duplicate the row object. Do not modify the row object directly
					const newRow = Object.assign({}, row);
					newRow.success = row.success ? "True" : "False";
					newRow.action = (
						<TableEditLink to="" onClick={this.doOpenEditScreen} data-id={row.id}>
							<i className="fa fa-edit"></i>
						</TableEditLink>
					);

					return newRow;
				});

				//column resizing
				let defaultColumnWidths = [
					{ columnName: "id", width: 80 },
					{ columnName: "date_created", width: 180 },
					{ columnName: "stage", width: 180 },
					{ columnName: "sub_stage", width: 220 },
					{ columnName: "asset_identifier", width: 180 },
					{ columnName: "success", width: 100 },
					{ columnName: "action", width: 80 },
				];

				const sortDir = this.state.sort_dir && this.state.sort_dir[0].toUpperCase() === "D" ? "desc" : "asc";
				let defaultSorting = [{ columnName: this.state.sort_field, direction: sortDir }];

				//column initilization and alignment
				let tableColumnExtensions = [
					{ columnName: "id", align: COLUMN_ALIGN_LEFT },
					{ columnName: "date_created", align: COLUMN_ALIGN_LEFT },
					{ columnName: "stage", align: COLUMN_ALIGN_LEFT },
					{ columnName: "sub_stage", align: COLUMN_ALIGN_LEFT },
					{ columnName: "asset_identifier", align: COLUMN_ALIGN_LEFT },
					{ columnName: "success", align: COLUMN_ALIGN_LEFT },
					{ columnName: "action", align: COLUMN_ALIGN_CENTER },
				];

				let sortingStateColumnExtensions = [{ columnName: "action", sortingEnabled: false }];

				//for set fixed column
				let leftColumns = ["id"];
				let rightColumns = ["action"];
				let dateColumnsName = ["date_created"];

				this.setState({
					unfilteredCount: unfiltered_count,
					columns: columns,
					rows: rows,
					defaultColumnWidths: defaultColumnWidths,
					tableColumnExtensions: tableColumnExtensions,
					defaultSorting: defaultSorting,
					sortingStateColumnExtensions: sortingStateColumnExtensions,
					loading: false,
					leftColumns: leftColumns,
					rightColumns: rightColumns,
					ProcessingLogLoaded: true,
					processingLogData: processingLogData,
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

				// if selectedStage extis in the query
				if (extra.hasOwnProperty("selectedStage") && Array.isArray(extra.selectedStage) && extra.selectedStage.length > 0) {
					let stage = [];
					for (const item of extra.selectedStage) {
						stage.push(item.value);
					}
					obj["filter_stage"] = stage.join(",");
					delete extra.selectedStage;
				}

				// if selectedSuccess extis in the query
				if (extra.hasOwnProperty("selectedSuccess") && Array.isArray(extra.selectedSuccess) && extra.selectedSuccess.length > 0) {
					let success = [];
					for (const item of extra.selectedSuccess) {
						success.push(item.value);
					}
					obj["filter_success"] = success.join(",");
					delete extra.selectedSuccess;
				}
				if (extra.hasOwnProperty("selectedDateCreatedBegin")) {
					obj.filter_date_created_begin = getEncodedDate(extra.selectedDateCreatedBegin);
					delete extra.selectedDateCreatedBegin;
				}
				if (extra.hasOwnProperty("selectedDateCreatedEnd")) {
					obj.filter_date_created_end = getEncodedDate(extra.selectedDateCreatedEnd);
					delete extra.selectedDateCreatedEnd;
				}

				Object.assign(obj, extra || {});
				return queryString.stringify(obj);
			}

			/**
			 * Push history
			 */
			pushHistory(extra) {
				const url = "/profile/admin/processing-log-admin?" + this.getQueryString(extra);
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
					selectedStage: this.state.selectedStage,
					selectedSuccess: this.state.selectedSuccess,
					selectedDateCreatedBegin: getEncodedDate(this.state.selectedDateCreatedBegin),
					selectedDateCreatedEnd: getEncodedDate(this.state.selectedDateCreatedEnd),
				});
			};

			doSorting = (sorting) => {
				const columnSorting = sorting[0];

				const sortDirectionString = columnSorting.direction[0].toUpperCase();
				this.setState({ loading: true });
				this.pushHistory({
					sort_field: columnSorting.columnName,
					sort_dir: sortDirectionString,
					offset: 0,
					query: this.state.query,
					selectedStage: this.state.selectedStage,
					selectedSuccess: this.state.selectedSuccess,
					selectedDateCreatedBegin: getEncodedDate(this.state.selectedDateCreatedBegin),
					selectedDateCreatedEnd: getEncodedDate(this.state.selectedDateCreatedEnd),
				});
			};

			doSearch = () => {
				this.setState({ message: null });
				this.pushHistory({
					query: this.state.query,
					offset: 0,
					action: ACTION_LIST,
					id: null,
					selectedStage: this.state.selectedStage,
					selectedSuccess: this.state.selectedSuccess,
					selectedDateCreatedBegin: getEncodedDate(this.state.selectedDateCreatedBegin),
					selectedDateCreatedEnd: getEncodedDate(this.state.selectedDateCreatedEnd),
				});
			};

			fetchFilters() {
				this.props
					.api("/admin/asset-processing-log-get-filters")
					.then((result) => {
						let resultFilter = result.result;
						let filters = [];
						let stageData, successData;
						/** bind the filter data */
						for (const item in resultFilter) {
							filters.push(resultFilter[item]);
						}
						//bind filters group data according to user role
						if (filters) {
							let stageArray = filters.find((filter) => filter.id === "stage");
							stageData = stageArray ? this.arrayMapping(stageArray.data) : null;
							let successArray = filters.find((filter) => filter.id === "success");
							successData = successArray ? this.arrayMapping(successArray.data) : null;
						}
						this.setState(
							{
								filters: filters,
								stageData: stageData,
								successData: successData,
							},
							this.updateState
						);
					})
					.catch((err) => {
						this.setState({
							message: err,
						});
					});
			}

			/** fill the state new value */
			handlefilterSelection = (selected, filterName) => {
				//bind new filter data of school and examboard
				switch (filterName.toLowerCase()) {
					case "stage":
						this.setState({ selectedStage: selected });
						break;
					case "success":
						this.setState({ selectedSuccess: selected });
						break;
					case "date_created_begin":
						this.setState({ selectedDateCreatedBegin: selected });
						break;
					case "date_created_end":
						this.setState({ selectedDateCreatedEnd: selected });
						break;
					case "query":
						this.setState({ query: selected });
						break;
				}
			};

			/** Mapping array for filter dropdown  */
			arrayMapping(arrayData) {
				let arr = [];
				arrayData.map((item) => {
					const data = Object.assign({}, this.state.setOption);
					data.value = item.id;
					data.label = item.title;
					data.key = item.id;
					arr.push(data);
				});
				return arr;
			}

			resetAll() {
				this.setState({
					query: "",
					selectedStage: [],
					selectedSuccess: [],
					selectedDateCreatedBegin: null,
					selectedDateCreatedEnd: null,
					message: null,
				});
				this.pushHistory({
					query: "",
					offset: 0,
					action: ACTION_LIST,
					id: null,
					selectedStage: [],
					selectedSuccess: [],
					selectedDateCreatedBegin: null,
					selectedDateCreatedEnd: null,
				});
			}

			cancelAddEdit = () => {
				this.setState({ message: null, action: ACTION_LIST }, () => smoothScrollTo(document.querySelector("body")));
				this.pushHistory({
					action: ACTION_LIST,
					id: null,
				});
			};

			downloadProcessingLog() {
				this.props
					.api("/admin/asset-processing-log-get-export", {
						query: this.state.query,
						filter: this.state.selected,
					})
					.then((result) => {
						this.exportProcessingLogData(result);
					})
					.catch((result) => {
						this.setState({ message: result.toString() });
					});
			}

			exportProcessingLogData = (resultData) => {
				const wb = XLSX.utils.book_new();
				{
					const exportData = resultData.data.map((item) => ({
						ID: item.id,
						"Date created": new Date(item.date_created),
						"Session identifier": item.session_identifier,
						"Session index": item.session_index,
						Stage: item.stage,
						"Sub stage": item.sub_stage,
						"Asset identifier": item.asset_identifier,
						"High priority": item.high_priority,
						Success: item.success,
						Category: item.category,
						Content: item.content,
					}));

					const ws = XLSX.utils.json_to_sheet(exportData);
					/* add to workbook */
					XLSX.utils.book_append_sheet(wb, ws, "Processing Log");
				}
				/* generate an XLSX file */
				XLSX.writeFile(wb, "processing_log.csv");
			};

			render() {
				const { fields, message, processingLogData } = this.state;
				const filtersLength = this.state.filters ? this.state.filters.length : 0;
				let processingLogTable = <AdminPageMessage> No results found</AdminPageMessage>;
				let dataForm = "";
				if (!this.state.ProcessingLogLoaded) {
					processingLogTable = (
						<AdminPageMessage>
							<Loader />
						</AdminPageMessage>
					);
				}

				if (processingLogData !== null && processingLogData.length !== 0) {
					processingLogTable = (
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
								datetimeColumnsName={this.state.dateColumnsName}
							/>

							<TableGridFooter
								unfilteredCount={this.state.unfilteredCount}
								limit={this.state.limit}
								pageNeighbours={3}
								doPagination={this.doPagination}
								currentPage={parseInt(this.state.offset) / Number(this.state.limit) + 1}
								loading={this.state.loading}
							/>
						</>
					);
				}

				if (this.state.action === ACTION_EDIT) {
					dataForm = (
						<ProcessingLogDataShow key={fields.id || "__NEW__"} message={message} cancelAddEdit={this.cancelAddEdit} fields={this.state.fields} />
					);
				}

				return (
					<>
						<HeadTitle title={PageTitle.processingLogAdmin} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<AdminPageWrap pageTitle={"Processing Log Admin"} id={JUMP_TO_CONTENT_ID}>
							<PageDetail>
								<SearchSectionOne>
									<SectionHalf>
										{this.state.filters ? (
											<ProcessingLogSearchFilters
												stageData={this.state.stageData}
												successData={this.state.successData}
												selectedStage={this.state.selectedStage}
												selectedSuccess={this.state.selectedSuccess}
												selectedDateCreatedBegin={this.state.selectedDateCreatedBegin}
												selectedDateCreatedEnd={this.state.selectedDateCreatedEnd}
												handlefilterSelection={this.handlefilterSelection}
												filterText={this.state.query}
												queryPlaceHolderText={" Search .."}
												doSearch={this.doSearch}
												resetAll={this.resetAll}
												filtersLength={filtersLength}
												api={this.props.api}
											/>
										) : null}
									</SectionHalf>
									{this.state.unfilteredCount ? (
										<SectionHalf>
											<DownloadLinkButton
												title="Download Processing Log Data"
												name="download"
												onClick={this.downloadProcessingLog}
												setBottom={filtersLength === 1 ? "20px" : 0}
											>
												Download Processing Log
												<i className="fas fa-arrow-down" size="sm"></i>
											</DownloadLinkButton>
										</SectionHalf>
									) : (
										""
									)}
								</SearchSectionOne>
								<WrapperDiv>
									<AdminPageFilterMessage>{this.state.searchFilterText}</AdminPageFilterMessage>
									{processingLogTable}
									{dataForm}
								</WrapperDiv>
							</PageDetail>
						</AdminPageWrap>
					</>
				);
			}
		}
	)
);
