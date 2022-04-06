import React from "react";
import withAdminAuthRequiredConsumer from "../../common/withAdminAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import AdminPageMessage from "../../widgets/AdminPageMessage";
import AdminPageWrap from "../../widgets/AdminPageWrap";
import { FilterSectionHalf, PageDetail, SearchSectionOne, WrapperDiv } from "../../widgets/AdminStyleComponents";
import Header from "../../widgets/Header";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import Loader from "../../widgets/Loader";
import TableEditLink from "../../widgets/TableEditLink";
import TableGrid from "../../widgets/TableGrid";
import TableGridFooter from "../../widgets/TableGridFooter";
import AdminPageFilterMessage from "../../widgets/AdminPageFilterMessage";
import getSearchFilterText from "../../common/getSearchFilterText";
import queryString from "query-string";
import ConfirmModal from "../../widgets/ConfirmModal";
import styled from "styled-components";
import getPageOffsetString from "../../common/getPageOffsetString";
import MyXMLHttpRequest from "../../common/MyXMLHttpRequest";
import SerachFilter from "./SerachFilter";

const ACTION_LIST = "list";
const JUMP_TO_CONTENT_ID = "main-content";
const COLUMN_ALIGN_LEFT = "left";
const ACTION_DELETE = "delete";

const ActionIcon = styled(TableEditLink)`
	padding: 6px;
`;

const AVAILABLE_FILTERS = [
	{ name: "Flags", stateKey: "selectedFlags" },
	{ name: "Institutions", stateKey: "selectedInstitutions" },
];

export default withAdminAuthRequiredConsumer(
	{ "cla-admin": true },
	withApiConsumer(
		class UserUploadedExtractPage extends React.PureComponent {
			constructor(props) {
				super(props);
				this.state = {
					limit: 10,
					offset: 0,
					loading: true,
					uploadedExtractLoaded: false,
					unfilteredCount: 0,
					uploadedExtractData: null,
					sort_field: "id",
					sort_dir: "desc",
					message: null,
					searchFilterText: null,
					url: null,
					isShowDeletePopUp: false,
					selectedInstitutions: [],
					selectedFlags: [],
					flagsData: null,
					query: "",
				};
				this.handlefilterSelection = this.handlefilterSelection.bind(this);
			}
			componentDidMount() {
				this._isMounted = true;
				this.fetchFilters();
				this.updateState();
			}

			componentDidUpdate(prevProps, prevState) {
				if (this.props.location.search !== prevProps.location.search) {
					this.updateState();
				}
			}

			componentWillUnmount() {
				delete this._isMounted;
			}

			updateState() {
				if (!this._isMounted) {
					return;
				}
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
					let sortDir = parsed.sort_dir || "asc";
					const newState = {
						limit: limit,
						offset: offset,
						action: action,
						id: id,
						sort_field: sortField,
						sort_dir: sortDir,
						selected: {},
					};

					for (const filter of this.state.filters) {
						newState.selected[filter.id] = [];
					}

					for (const key in parsed) {
						if (key.indexOf("filter_") === 0 && parsed[key]) {
							const filterGroupId = key.slice("filter_".length);
							const selectedValues = parsed[key].split(",");
							const selectedMap = [];
							for (const value of selectedValues) {
								if (filterGroupId === "institutions") {
									selectedMap.push(parseInt(value));
								} else {
									selectedMap.push(value);
								}
							}
							newState.selected[filterGroupId] = selectedMap;
						}
					}
					//check the selected flag value and if extis then store in state value
					if (newState.selected.hasOwnProperty("flags") && Array.isArray(newState.selected.flags) && newState.selected.flags.length > 0) {
						let arr = newState.selected.flags;
						let bindSelectedFlags = this.state.flagsData.filter((d) => arr.some((s) => s === d.value));
						newState.selectedFlags = bindSelectedFlags;
					}

					this.setState(newState, this.performQuery);
				}
			}

			fetchFilters() {
				const parsed = queryString.parse(this.props.location.search);
				let filter_institutions = parsed.filter_institutions;
				this.props
					.api("/admin/asset-user-upload-get-filters", { filter_institutions: filter_institutions ? filter_institutions : null })
					.then((result) => {
						let resultFilter = result.result;
						let filters = [];
						let flagsData;
						let schoolData;
						let selectedInstitutions;
						/** bind the filter data */
						for (const item in resultFilter) {
							filters.push(resultFilter[item]);
						}
						//bind filters group data according to user role
						if (filters) {
							let flagsArray = filters.find((filter) => filter.id === "flags");
							flagsData = flagsArray ? this.arrayMapping(flagsArray.data) : null;
							let schoolArray = filters.find((filter) => filter.id === "institutions");
							schoolData = schoolArray ? this.arrayMapping(schoolArray.data) : null;
							selectedInstitutions = schoolData;
						}
						this.setState(
							{
								filters: filters,
								flagsData: flagsData,
								selectedInstitutions: selectedInstitutions,
							},
							this.updateState
						);
					});
			}

			/**
			 * Get User Uploaded extracts information
			 */
			performQuery() {
				this.props
					.api("/admin/asset-user-upload-get-all", {
						limit: this.state.limit,
						offset: this.state.offset,
						sort_field: this.state.sort_field,
						sort_direction: this.state.sort_dir,
						query: this.state.query,
						filter: this.state.selected,
					})
					.then((result) => {
						if (!this._isMounted) {
							return;
						}
						if (result.data) {
							this.getUploadedExtract(result.data, result.unfiltered_count);
							let selected_Filter = this.getSelectedFilters();

							let searchFilterText = getSearchFilterText(
								this.state.limit,
								this.state.offset,
								this.state.query,
								selected_Filter,
								result.unfiltered_count
							);
							this.setState({
								uploadedExtractLoaded: true,
								searchFilterText: searchFilterText,
							});
						}
					})
					.catch((err) => {
						this.setState({ message: err.toString(), unfilteredCount: 0 });
					});
			}

			getUploadedExtract = (uploadedExtractData, unfiltered_count) => {
				let columns = [
					{ name: "institution", title: "Institution" },
					{ name: "institution_id", title: "Institution ID" },
					{ name: "user_name", title: "User name" },
					{ name: "email", title: "Email" },
					{ name: "date_of_upload", title: "Date of upload" },
					{ name: "isbn", title: "ISBN" },
					{ name: "title", title: "Title" },
					{ name: "publisher", title: "Publisher" },
					{ name: "page_range", title: "Page range" },
					{ name: "page_count", title: "PDF page count" },
					{ name: "change_in_pdf_count", title: "Change in PDF count" },
					{ name: "pdf_size", title: "PDF size (MB)" },
					{ name: "copy_limit", title: "Copy limit (%)" },
					{ name: "copy_count", title: "Copy count" },
					{ name: "actions", title: "Actions" },
				];

				//arrange the column records
				const rows = uploadedExtractData.map((row) => {
					// duplicate the row object. Do not modify the row object directly.
					const newRow = Object.assign({}, row);
					newRow.institution = row.school_name;
					newRow.user_name = (
						<>
							{row.first_name} {row.last_name}
						</>
					);
					newRow.actions = (
						<>
							<ActionIcon to="" onClick={this.doOpenDeleteConfirmationModal} data-id={row.id}>
								<i className="fa fa-trash-alt"></i>
							</ActionIcon>
							<ActionIcon to="" onClick={(e) => this.doDownloadPdf(row.filename, row.pdf_url, e)}>
								<i className="fas fa-eye"></i>
							</ActionIcon>
						</>
					);
					newRow.isbn = row.isbn13;
					newRow.page_range = getPageOffsetString(row.page_range);
					newRow.institution_id = row.school_id;
					newRow.copy_limit = row.is_copying_full_chapter ? "Chapter" : (row.copy_ratio * 100).toFixed(2) + "%";
					newRow.pdf_size = Math.round((parseInt(row.file_size) / 1048576) * 100) / 100; //to convert bytes into MB
					newRow.change_in_pdf_count = row.page_count_difference_log;
					return newRow;
				});

				//column resizing
				let defaultColumnWidths = [
					{ columnName: "institution", width: 220 },
					{ columnName: "institution_id", width: 150 },
					{ columnName: "user_name", width: 200 },
					{ columnName: "email", width: 200 },
					{ columnName: "date_of_upload", width: 200 },
					{ columnName: "isbn", width: 200 },
					{ columnName: "title", width: 200 },
					{ columnName: "publisher", width: 200 },
					{ columnName: "page_range", width: 150 },
					{ columnName: "page_count", width: 150 },
					{ columnName: "change_in_pdf_count", width: 180 },
					{ columnName: "pdf_size", width: 200 },
					{ columnName: "copy_limit", width: 150 },
					{ columnName: "copy_count", width: 100 },
					{ columnName: "actions", width: 100 },
				];

				const sortDir = this.state.sort_dir && this.state.sort_dir[0].toUpperCase() === "D" ? "desc" : "asc";
				let defaultSorting = [{ columnName: this.state.sort_field, direction: sortDir }];

				//column initilization and alignment
				let tableColumnExtensions = [
					{ columnName: "institution", align: COLUMN_ALIGN_LEFT },
					{ columnName: "institution_id", align: COLUMN_ALIGN_LEFT },
					{ columnName: "user_name", align: COLUMN_ALIGN_LEFT },
					{ columnName: "email", align: COLUMN_ALIGN_LEFT },
					{ columnName: "date_of_upload", align: COLUMN_ALIGN_LEFT },
					{ columnName: "isbn", align: COLUMN_ALIGN_LEFT },
					{ columnName: "title", align: COLUMN_ALIGN_LEFT },
					{ columnName: "publisher", align: COLUMN_ALIGN_LEFT },
					{ columnName: "page_range", align: COLUMN_ALIGN_LEFT },
					{ columnName: "page_count", align: COLUMN_ALIGN_LEFT },
					{ columnName: "change_in_pdf_count", align: COLUMN_ALIGN_LEFT },
					{ columnName: "pdf_size", align: COLUMN_ALIGN_LEFT },
					{ columnName: "copy_limit", align: COLUMN_ALIGN_LEFT },
					{ columnName: "copy_count", align: COLUMN_ALIGN_LEFT },
					{ columnName: "actions", align: COLUMN_ALIGN_LEFT },
				];

				const sortingStateColumnExtensions = [
					{ columnName: "page_range", sortingEnabled: false },
					{ columnName: "actions", sortingEnabled: false },
				];

				//for set fixed column
				let leftColumns = ["id"];
				let rightColumns = ["action"];
				let dateColumnsName = ["date_of_upload"];

				this.setState({
					unfilteredCount: unfiltered_count,
					columns: columns,
					rows: rows,
					defaultColumnWidths: defaultColumnWidths,
					tableColumnExtensions: tableColumnExtensions,
					loading: false,
					leftColumns: leftColumns,
					rightColumns: rightColumns,
					uploadedExtractLoaded: true,
					uploadedExtractData: uploadedExtractData,
					defaultSorting: defaultSorting,
					sortingStateColumnExtensions: sortingStateColumnExtensions,
					dateColumnsName: dateColumnsName,
				});
			};

			doOpenDeleteConfirmationModal = (e) => {
				e.preventDefault();
				const id = e.currentTarget.getAttribute("data-id");
				this.setState({
					isShowDeletePopUp: true,
					id: id,
				});
				this.pushHistory({
					id: id,
					action: ACTION_DELETE,
					query: this.state.query,
					selectedInstitutions: this.state.selectedInstitutions,
					selectedFlags: this.state.selectedFlags,
				});
			};

			deleteUploadedExtract = () => {
				this.props.api("/admin/asset-user-upload-delete", { id: parseInt(this.state.id, 10) }).then((result) => {
					if (!this._isMounted) {
						return;
					}
					if (result.result) {
						this.setState({
							message: "Extract Deleted successfully.",
							isShowDeletePopUp: false,
						});
						if (this.state.offset >= this.state.unfiltered_count - 1) {
							this.setState({ offset: 0 });
						}
						this.pushHistory({
							offset: this.state.offset,
							action: ACTION_LIST,
							id: null,
							query: this.state.query,
							selectedInstitutions: this.state.selectedInstitutions,
							selectedFlags: this.state.selectedFlags,
						});
					} else {
						this.setState({ message: `Error deleting extract.` });
					}
				});
			};

			doDownloadPdf(fileName, pdfURL, e) {
				e.preventDefault();
				const req = new MyXMLHttpRequest();
				req.open("GET", pdfURL, true);
				req.setRequestHeader("Access-Control-Allow-Origin", "*");
				req.setRequestHeader("Content-type", "application/pdf");
				req.responseType = "blob";
				req.onload = function () {
					const blob = new Blob([req.response], { type: "application/pdf" });
					const isIE = false || !!document.documentMode;
					if (isIE) {
						window.navigator.msSaveBlob(blob, fileName);
					} else {
						const url = window.URL || window.webkitURL;
						const link = url.createObjectURL(blob);
						const anchorTag = document.createElement("a");
						anchorTag.setAttribute("download", fileName);
						anchorTag.setAttribute("href", link);
						document.body.appendChild(anchorTag);
						anchorTag.click();
						document.body.removeChild(anchorTag);
					}
				};
				req.send();
			}

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

				// if selectedInstitutions extis in the query
				if (extra.hasOwnProperty("selectedInstitutions") && Array.isArray(extra.selectedInstitutions) && extra.selectedInstitutions.length > 0) {
					let schools = [];
					for (const item of extra.selectedInstitutions) {
						schools.push(item.value);
					}
					obj["filter_institutions"] = schools.join(",");
					delete extra.selectedInstitutions;
				}

				// if selectedFlags extis in the query
				if (extra.hasOwnProperty("selectedFlags") && Array.isArray(extra.selectedFlags) && extra.selectedFlags.length > 0) {
					let flags = [];
					for (const item of extra.selectedFlags) {
						flags.push(item.value);
					}
					obj["filter_flags"] = flags.join(",");
					delete extra.selectedFlags;
				}

				Object.assign(obj, extra || {});
				return queryString.stringify(obj);
			}

			pushHistory(extra) {
				const url = "/profile/admin/user-uploaded-extracts?" + this.getQueryString(extra);
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
					selectedInstitutions: this.state.selectedInstitutions,
					selectedFlags: this.state.selectedFlags,
				});
			};

			doSorting = (sorting) => {
				const columnSorting = sorting[0];
				const sortDirectionString = columnSorting.direction[0].toUpperCase();
				this.setState({ sort_field: columnSorting.columnName, sort_dir: sortDirectionString, offset: 0, loading: true });
				this.pushHistory({
					sort_field: columnSorting.columnName,
					sort_dir: sortDirectionString,
					offset: 0,
					loading: true,
					query: this.state.query,
					selectedInstitutions: this.state.selectedInstitutions,
					selectedFlags: this.state.selectedFlags,
				});
			};

			hideDeletePopUP = () => {
				this.setState({ isShowDeletePopUp: false });
			};

			handlefilterSelection = (selected, filterName) => {
				switch (filterName.toLowerCase()) {
					case "institution":
						this.setState({ selectedInstitutions: selected });
						break;
					case "flags":
						this.setState({ selectedFlags: selected });
						break;
					case "query":
						this.setState({ query: selected });
						break;
				}
			};

			doSearch = () => {
				this.setState({ message: null });
				this.pushHistory({
					query: this.state.query,
					offset: 0,
					action: ACTION_LIST,
					selectedInstitutions: this.state.selectedInstitutions,
					selectedFlags: this.state.selectedFlags,
				});
			};

			resetAll = () => {
				this.setState({ query: "", selectedInstitutions: [], selectedFlags: [] });
				this.pushHistory({ query: "", offset: 0, action: ACTION_LIST, selectedInstitutions: [], selectedFlags: [] });
			};

			/**Get selected filter in array
			 * like [{filter : "school", values: ["test 1", "test 2"]}]
			 */
			getSelectedFilters = () => {
				let selected_filters = [];
				AVAILABLE_FILTERS.map((filter) => {
					if (this.state[filter.stateKey] && this.state[filter.stateKey].length) {
						let obj = Object.create(null);
						obj.filter = filter.name;
						obj.values = this.state[filter.stateKey].map((filterState) => {
							return filterState.label;
						});
						selected_filters.push(obj);
					}
				});
				return selected_filters;
			};

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

			render() {
				const { uploadedExtractData, filters } = this.state;
				const filtersLength = filters ? filters.length : 0;
				let uploadedExtractTable = <AdminPageMessage> No results found</AdminPageMessage>;
				if (!this.state.uploadedExtractLoaded) {
					uploadedExtractTable = (
						<AdminPageMessage>
							<Loader />
						</AdminPageMessage>
					);
				}

				if (uploadedExtractData !== null && uploadedExtractData.length !== 0) {
					uploadedExtractTable = (
						<>
							<TableGrid
								column={this.state.columns}
								row={this.state.rows}
								resize={this.state.defaultColumnWidths}
								tableColumnExtensions={this.state.tableColumnExtensions}
								loading={this.state.loading}
								leftColumns={this.state.leftColumns}
								rightColumns={this.state.rightColumns}
								dateColumnsName={this.state.dateColumnsName}
								defaultSorting={this.state.defaultSorting}
								sortingStateColumnExtensions={this.state.sortingStateColumnExtensions}
								doSorting={this.doSorting}
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
				return (
					<>
						<HeadTitle title={PageTitle.userUploadedExtract} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<AdminPageWrap pageTitle={PageTitle.userUploadedExtract} id={JUMP_TO_CONTENT_ID}>
							<PageDetail>
								<SearchSectionOne>
									<FilterSectionHalf>
										<SerachFilter
											api={this.props.api}
											handlefilterSelection={this.handlefilterSelection}
											filterText={this.state.query}
											queryPlaceHolderText={" Search .."}
											doSearch={this.doSearch}
											resetAll={this.resetAll}
											flagsData={this.state.flagsData}
											selectedFlags={this.state.selectedFlags}
											selectedInstitutions={this.state.selectedInstitutions}
											filtersLength={filtersLength}
										/>
									</FilterSectionHalf>
								</SearchSectionOne>
								<WrapperDiv>
									<AdminPageFilterMessage>{this.state.searchFilterText}</AdminPageFilterMessage>
									{uploadedExtractTable}
								</WrapperDiv>
							</PageDetail>
						</AdminPageWrap>
						{this.state.isShowDeletePopUp && (
							<ConfirmModal
								title="Are you sure you want to delete this PDF? This action is irreversible"
								onClose={this.hideDeletePopUP}
								onConfirm={this.deleteUploadedExtract}
								onCancel={this.hideDeletePopUP}
								confirmButtonText={"Yes - Delete this PDF"}
								cancelButtonText={"No - Keep this PDF"}
							></ConfirmModal>
						)}
					</>
				);
			}
		}
	)
);
