import React from "react";
import { Redirect, Link } from "react-router-dom";
import withAdminAuthRequiredConsumer from "../../common/withAdminAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import styled, { css } from "styled-components";
import Header from "../../widgets/Header";
import queryString from "query-string";
import TableGrid from "../../widgets/TableGrid";
import Loader from "../../widgets/Loader";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import AdminPageWrap from "../../widgets/AdminPageWrap";
import AdminPageMessage from "../../widgets/AdminPageMessage";
import getSearchFilterText from "../../common/getSearchFilterText";
import TableGridFooter from "../../widgets/TableGridFooter";
import { WrapperDiv, FilterSectionHalf, SearchSectionOne, SectionHalf } from "../../widgets/AdminStyleComponents";
import TwoOptionSwitch from "../../widgets/ToggleSwitch/TwoOptionSwitch";
import theme from "../../common/theme";
import FilterSearchBar from "../../widgets/FilterSearchBar";
import AdminPageFilterMessage from "../../widgets/AdminPageFilterMessage";
import getPageOffsetString from "../../common/getPageOffsetString";
import MyXMLHttpRequest from "../../common/MyXMLHttpRequest";

//set the defualt behaviour of column header
const JUMP_TO_CONTENT_ID = "main-content";
const COLUMN_ALIGN_LEFT = "left";
const COLUMN_ALIGN_CENTER = "center";

const CopySwitch = styled.div`
	min-width: 250px;
`;

const InfoIcon = styled.i`
	color: ${theme.colours.primary} !important;
	font-weight: bold !important;
	margin-left: 10px;
`;

const Icon = styled(InfoIcon)`
	margin-left: 0px;
	margin-right: 10px;
	pointer-events: none;
`;

const ButtonText = styled.span`
	margin-left: 0.5rem;
	pointer-events: none;
`;

const ButtonLink = styled(Link)`
	background-color: transparent;
	color: ${theme.colours.primary};
	border: none;
	border-radius: 3px;
	padding: 0.937em 0px;
	margin-top: 23px;
	white-space: nowrap;
	position: absolute;
	top: auto;
	bottom: 20px;
	right: 0;
	z-index: 9;
	span {
		text-decoration: underline;
	}
	i {
		margin-left: 10px;
	}

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		margin-top: 0px;
	}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		margin: 0px 5px 0 5px;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		margin: 0px 0px 0 0px;
		position: relative;
		top: 15px;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) and (min-width: ${theme.breakpoints.mobileSmall}) {
		position: relative;
		top: 15px;
	}

	@media screen and (width: ${theme.breakpoints.mobileLarge}) {
		position: absolute;
		top: auto;
	}
`;

const TableLink = styled(Link)`
	color: ${theme.colours.headerButtonSearch};
	${(p) =>
		p.disable &&
		css`
			color: ${theme.colours.black};
			pointer-events: none;
		`};
`;

const PlusIcon = styled.i`
	pointer-events: none;
`;
/**
 * Component for the 'My Uploads Page'
 * @extends React.PureComponent
 */
export default withAdminAuthRequiredConsumer(
	{ teacher: true, "school-admin": true },
	withApiConsumer(
		class MyUploadsPage extends React.PureComponent {
			state = {
				limit: 10,
				offset: 0,
				sort_field: "date_created",
				sort_dir: "D",
				loading: true,
				uploadsLoaded: false,
				filters: null,
				query: "",
				q_mine_only: 0,
				searchFilterText: null,
				myUploadsData: [],
				f_mine_only: true,
				courseOid: null,
			};

			componentDidMount() {
				this._isMounted = true;
				this.resetAll = this.resetAll.bind(this);
				this.handlefilterSelection = this.handlefilterSelection.bind(this);
				this.updateState();
				this.getCourseForSchool();
			}

			componentDidUpdate(prevProps) {
				if (this.props.location.search !== prevProps.location.search) {
					this.updateState();
				}
			}

			componentWillUnmount() {
				delete this._isMounted;
			}

			getCourseForSchool() {
				this.props.api("/public/course-get-one-for-school").then((result) => {
					if (!this._isMounted) {
						return;
					}
					this.setState({ courseOid: result.courseOid });
				});
			}

			getQueryString(extra) {
				const obj = {
					q_mine_only: Number(this.state.q_mine_only),
					limit: this.state.limit,
					offset: this.state.offset,
					query: this.state.query,
				};

				Object.assign(obj, extra || {});
				return queryString.stringify(obj);
			}

			pushHistory(extra) {
				const url = "/profile/admin/my-uploads?" + this.getQueryString(extra);
				this.props.history.push(url);
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

				const mineOnly = parsed.q_mine_only === "1";
				let sortField = parsed.sort_field || this.state.sort_field;
				let sortDir = parsed.sort_dir || this.state.sort_dir;
				let query = parsed.query || "";

				const newState = {
					limit: limit,
					offset: offset,
					sort_field: sortField,
					sort_dir: sortDir,
					query: query,
					q_mine_only: mineOnly,
					f_mine_only: mineOnly,
				};
				this.setState(newState, this.performQuery);
			}

			/**
			 * Get copies information
			 */
			performQuery() {
				let searchFilterText = "";
				this.props
					.api("/public/asset-user-upload-get-all", {
						limit: this.state.limit,
						offset: this.state.offset,
						sort_field: this.state.sort_field,
						sort_direction: this.state.sort_dir,
						query: this.state.query,
						filter: this.state.selected,
						mine_only: this.state.q_mine_only,
					})
					.then((result) => {
						if (!this._isMounted) {
							return;
						}
						let selected_Filter = null;
						searchFilterText = getSearchFilterText(this.state.limit, this.state.offset, this.state.query, selected_Filter, result.unfiltered_count);
						this.setState({
							uploadsLoaded: true,
							searchFilterText: searchFilterText,
							myUploadsData: result.data,
							unfiltered_count: result.unfiltered_count,
							loading: false,
						});
					})
					.catch((e) => {
						searchFilterText = getSearchFilterText(this.state.limit, this.state.offset, this.state.query, null, 0);
						this.setState({
							extracts: [],
							unfiltered_count: 0,
							searchFilterText: searchFilterText,
						});
					});
			}

			/**resetAll
			 * Toggle showing "My uploads"
			 */
			doMineOnlyToggle = () => {
				this.setState({
					offset: 0,
					loading: true,
				});
				const newHistory = {
					q_mine_only: Number(!this.state.f_mine_only),
					offset: 0,
					query: this.state.query,
				};

				this.pushHistory(newHistory);
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

			doSorting = (sorting) => {
				const columnSorting = sorting[0];
				if (columnSorting) {
					const sortDirectionString = columnSorting.direction === "desc" ? "D" : "A";
					this.setState({
						sort_field: columnSorting.columnName,
						sort_dir: sortDirectionString,
						offset: 0,
						loading: true,
					});
					this.pushHistory({
						offset: 0,
						query: this.state.query,
						sort_field: columnSorting.columnName,
						sort_dir: sortDirectionString,
					});
				}
			};

			doSearch = () => {
				this.setState({ message: null, offset: 0 });
				this.pushHistory({
					query: this.state.query,
					offset: 0,
				});
			};

			resetAll() {
				this.setState({ query: "", message: null });
				this.pushHistory({
					query: "",
					offset: 0,
				});
			}

			/** fill the state new value */
			handlefilterSelection = (selected, filterName) => {
				//bind new search data
				switch (filterName.toLowerCase()) {
					case "query":
						this.setState({ query: selected });
						break;
				}
			};

			getAuthors(authors) {
				return authors ? authors.map((author) => author.firstName + " " + author.lastName).join(", ") : "";
			}

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

			myUploadsTableData = (myUploadsData, unfiltered_count, courseOid) => {
				//declare columns
				const columns = [
					{ name: "upload_name", title: "Upload name" },
					{ name: "content_title", title: "Content title" },
					{ name: "authors", title: "Author" },
					{ name: "user", title: "User" },
					{ name: "date_created", title: "Date of upload" },
					{ name: "page_range", title: "Page range" },
					{
						name: "copy_count",
						title: [
							<>
								Copy count
								<InfoIcon className="fas fa-question-circle" title="Number of copies created using this PDF extract"></InfoIcon>
							</>,
						],
					},
					{ name: "amount_used", title: "Amount used" },
					{ name: "download", title: "Download" },
					{ name: "create_a_copy", title: "Create a copy" },
				];
				let finalColumns;

				if (this.state.q_mine_only === true) {
					const columnsWithoutTeacher = [];
					for (const col of columns) {
						if (col.name !== "user") {
							columnsWithoutTeacher.push(col);
						}
					}
					finalColumns = columnsWithoutTeacher;
				} else {
					finalColumns = columns;
				}

				//arrange the column records
				const backUrlEncoded = encodeURIComponent(window.location.pathname + window.location.search);
				const rows = myUploadsData.map((row) => {
					// duplicate the row object. Do not modify the row object directly
					const newRow = Object.assign({}, row);
					newRow.download = (
						<TableLink to="" onClick={(e) => this.doDownloadPdf(row.filename, row.pdf_url, e)} data-ga-user-extract="my-uploads-download">
							<>
								<Icon className="fas fa-arrow-circle-down"></Icon>
								Download PDF
							</>
						</TableLink>
					);
					newRow.create_a_copy = (
						<TableLink
							to={`/asset-upload/copy-confirm?isbn13=${row.isbn13}&asset_user_upload_oid=${row.oid}&course=${courseOid}&selected=${row.pages.join(
								"-"
							)}&upload_name=${encodeURIComponent(row.upload_name)}&back_url=${backUrlEncoded}`}
							data-id={row.id}
							data-ga-user-extract="my-uploads-create-copy"
						>
							<>
								<Icon className="fa fa-plus"></Icon>
								Create a copy
							</>
						</TableLink>
					);
					newRow.copy_count = (
						<TableLink
							disable={row.copy_count === 0}
							to={`/profile/my-copies?q_mine_only=${this.state.q_mine_only}&asset_user_upload_oid=${row.oid}`}
							data-id={row.id}
							data-ga-user-extract="my-uploads-copy-count"
						>
							{row.copy_count}
						</TableLink>
					);

					newRow.page_range = getPageOffsetString(row.pages);
					newRow.authors = this.getAuthors(row.authors);
					newRow.amount_used = row.copy_ratio === -1 ? "Chapter" : (row.copy_ratio * 100).toFixed(2) + "%";
					newRow.user = row.first_name + " " + row.last_name;
					return newRow;
				});

				//column resizing
				const defaultColumnWidths = [
					{ columnName: "upload_name", width: 200 },
					{ columnName: "content_title", width: 200 },
					{ columnName: "authors", width: 300 },
					{ columnName: "user", width: 200 },
					{ columnName: "date_created", width: 150 },
					{ columnName: "page_range", width: 150 },
					{ columnName: "copy_count", width: 150 },
					{ columnName: "amount_used", width: 150 },
					{ columnName: "download", width: 200 },
					{ columnName: "create_a_copy", width: 150 },
				];

				//default sorting
				const defaultSorting = [
					{
						columnName: this.state.sort_field,
						direction: this.state.sort_dir && this.state.sort_dir.toUpperCase()[0] === "D" ? "desc" : "asc",
					},
				];

				//column initilization and alignment
				const tableColumnExtensions = [
					{ columnName: "upload_name", align: COLUMN_ALIGN_LEFT },
					{ columnName: "content_title", align: COLUMN_ALIGN_LEFT },
					{ columnName: "authors", align: COLUMN_ALIGN_LEFT },
					{ columnName: "user", align: COLUMN_ALIGN_LEFT },
					{ columnName: "date_created", align: COLUMN_ALIGN_LEFT },
					{ columnName: "page_range", align: COLUMN_ALIGN_LEFT },
					{ columnName: "copy_count", align: COLUMN_ALIGN_LEFT },
					{ columnName: "amount_used", align: COLUMN_ALIGN_LEFT },
					{ columnName: "download", align: COLUMN_ALIGN_LEFT },
					{ columnName: "create_a_copy", align: COLUMN_ALIGN_CENTER },
				];
				const rightColumns = ["create_a_copy"];
				//date type column names
				const dateColumnsName = ["date_created"];

				const sortingStateColumnExtensions = [
					{ columnName: "authors", sortingEnabled: false },
					{ columnName: "page_range", sortingEnabled: false },
					{ columnName: "download", sortingEnabled: false },
					{ columnName: "create_a_copy", sortingEnabled: false },
				];

				return {
					unfiltered_count: unfiltered_count,
					column: finalColumns,
					row: rows,
					resize: defaultColumnWidths,
					tableColumnExtensions: tableColumnExtensions,
					sortingStateColumnExtensions: sortingStateColumnExtensions,
					defaultSorting: defaultSorting,
					rightColumns: rightColumns,
					dateColumnsName: dateColumnsName,
					loading: this.state.loading,
				};
			};

			render() {
				let myUploadsTable = <AdminPageMessage> No results found</AdminPageMessage>;
				if (!this.state.uploadsLoaded) {
					myUploadsTable = (
						<AdminPageMessage>
							<Loader />
						</AdminPageMessage>
					);
				}

				if (this.state.myUploadsData !== null && this.state.myUploadsData.length !== 0) {
					let myUploadsProps = this.myUploadsTableData(this.state.myUploadsData, this.state.unfiltered_count, this.state.courseOid);

					myUploadsTable = (
						<>
							<TableGrid {...myUploadsProps} doSorting={this.doSorting} showColumnSelector={true} />

							<TableGridFooter
								unfilteredCount={this.state.unfiltered_count}
								limit={this.state.limit}
								pageNeighbours={3}
								doPagination={this.doPagination}
								currentPage={parseInt(this.state.offset) / Number(this.state.limit) + 1}
							/>
						</>
					);
				}

				return (
					<>
						<HeadTitle title={PageTitle.myUploads} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<AdminPageWrap pageTitle="My uploads" id={JUMP_TO_CONTENT_ID}>
							<CopySwitch>
								<TwoOptionSwitch start_title="My uploads" end_title="All uploads" onChange={this.doMineOnlyToggle} value={!this.state.f_mine_only} />
							</CopySwitch>
							<SearchSectionOne>
								<FilterSectionHalf>
									<FilterSearchBar
										handlefilterSelection={this.handlefilterSelection}
										filterText={this.state.query}
										queryPlaceHolderText={" Search .."}
										doSearch={this.doSearch}
										resetAll={this.resetAll}
										currentUserRole={this.props.withAuthConsumer_myUserDetails.role}
										gaAttribute={{ "data-ga-user-extract": "my-uploads-search" }}
									/>
								</FilterSectionHalf>
								<SectionHalf>
									<ButtonLink title="Upload new extract" name="create-new" to="/asset-upload" data-ga-user-extract="my-uploads-upload-new">
										<PlusIcon className="fa fa-plus" size="sm" />
										<ButtonText>Upload new extract</ButtonText>
									</ButtonLink>
								</SectionHalf>
							</SearchSectionOne>
							<WrapperDiv>
								<AdminPageFilterMessage>{this.state.searchFilterText}</AdminPageFilterMessage>
								{myUploadsTable}
							</WrapperDiv>
						</AdminPageWrap>
					</>
				);
			}
		}
	)
);
