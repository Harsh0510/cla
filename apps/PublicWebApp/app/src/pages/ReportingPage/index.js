import React from "react";
import withAdminAuthRequiredConsumer from "../../common/withAdminAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import Header from "../../widgets/Header";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import AdminPageWrap from "../../widgets/AdminPageWrap";
import queryString from "query-string";
import Measures from "./Measures";
import SearchFilters from "./SearchFilters";
import styled from "styled-components";
import theme from "../../common/theme";
import SimpleTableViewer from "../../widgets/SimpleTableViewer";

const JUMP_TO_CONTENT_ID = "main-content";
const DEFAULT_ROWS_LIMIT = 5;

//set the defualt behaviour of column header
const COLUMN_ALIGN_LEFT = "left";

const TableTitle = styled.div`
	font-size: 1.2em;
	font-weight: 400;
	line-height: 1em;
	margin: 15px 0;
	text-decoration: underline;
`;

const TableWrapper = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	flex-direction: column;
	margin: 20px 0;
	@media (min-width: ${theme.breakpoints.tabletPro}) {
		flex-direction: row;
	} ;
`;

const TableContainer = styled.div`
	width: 100%;
	@media (min-width: ${theme.breakpoints.tabletPro}) {
		width: 46%;
	} ;
`;

const CONTENT_ITEM_FIELDS = [
	{ id: "title", title: "Title", width: 200, align: COLUMN_ALIGN_LEFT, type: "text", sortingEnabled: true },
	{ id: "isbn", title: "ISBN", width: 180, align: COLUMN_ALIGN_LEFT, type: "text", sortingEnabled: false },
	{ id: "number_of_copies", title: "Number of copies", width: 170, align: COLUMN_ALIGN_LEFT, type: "text", sortingEnabled: true },
	{ id: "number_of_student_views", title: "Number of student views", width: 200, align: COLUMN_ALIGN_LEFT, type: "text", sortingEnabled: true },
];

const COPY_FIELDS = [
	{ id: "copy_title", title: "Copy title", width: 200, align: COLUMN_ALIGN_LEFT, type: "text", sortingEnabled: true },
	{ id: "title", title: "Title", width: 200, align: COLUMN_ALIGN_LEFT, type: "text", sortingEnabled: true },
	{ id: "isbn", title: "ISBN", width: 180, align: COLUMN_ALIGN_LEFT, type: "text", sortingEnabled: false },
	{ id: "number_of_student_views", title: "Number of student views", width: 200, align: COLUMN_ALIGN_LEFT, type: "text", sortingEnabled: true },
	{ id: "date_created", title: "Date created", width: 160, align: COLUMN_ALIGN_LEFT, type: "date", sortingEnabled: true },
];

export default withAdminAuthRequiredConsumer(
	{ "school-admin": true, teacher: true },
	withApiConsumer(
		class ReportingPage extends React.PureComponent {
			constructor(props) {
				super(props);
				this.state = {
					unlockedTitles: 0,
					studentViews: 0,
					copiesTotal: 0,
					copiedTitles: 0,
					selectedClass: [],
					filters: null,
				};
				this.getUserMeasures = this.getUserMeasures.bind(this);
			}

			componentDidMount() {
				// this.getUserMeasures();
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

					const newState = {
						class: [],
					};

					for (const key in parsed) {
						if (key.indexOf("class") === 0 && parsed[key]) {
							const selectedValues = parsed[key].split(",");
							const selectedMap = [];
							for (const value of selectedValues) {
								selectedMap.push(value);
							}
							newState.class = selectedMap;
						}
					}
					if (newState.class && Array.isArray(newState.class) && newState.class.length > 0) {
						let arr = newState.class;
						let bindSelectedClass = this.state.classData.filter((d) => arr.some((s) => s === d.value));
						newState.selectedClass = bindSelectedClass;
					}

					this.setState(newState, () => {
						this.getUserMeasures({ class: this.state.class });
					});
				}
			}

			fetchFilters() {
				this.props
					.api("/admin/user-report/filters")
					.then((result) => {
						let resultFilter = result.result;
						let filters = [];
						let classData;

						/** bind the filter data */
						for (const item in resultFilter) {
							filters.push(resultFilter[item]);
						}

						if (filters) {
							let classArray = filters.find((filter) => filter.id === "class");
							classData = classArray ? this.arrayMapping(classArray.data) : null;
						}

						this.setState(
							{
								filters: filters,
								classData: classData,
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

			/**
			 * get query string
			 */
			getQueryString(extra) {
				const obj = {};
				if (extra.hasOwnProperty("selectedClass") && Array.isArray(extra.selectedClass) && extra.selectedClass.length > 0) {
					let selectedClass = [];
					for (const item of extra.selectedClass) {
						selectedClass.push(item.value);
					}
					obj["class"] = selectedClass.join(",");
					delete extra.selectedClass;
				}
				Object.assign(obj, extra || {});
				return queryString.stringify(obj);
			}

			/**
			 * Push history
			 */
			pushHistory(extra) {
				const url = "/profile/admin/reporting?" + this.getQueryString(extra);
				this.props.history.push(url);
			}

			getUserMeasures(params) {
				this.props
					.api(`/admin/user-report/all`, params)
					.then((result) => {
						this.setState({
							unlockedTitles: result.unlockedTitles,
							studentViews: result.studentViews,
							copiesTotal: result.copiesTotal,
							copiedTitles: result.copiedTitles,
						});
					})
					.catch((err) => {
						this.setState({
							message: err,
						});
					});
			}

			handlefilterSelection = (selected, filterName) => {
				switch (filterName.toLowerCase()) {
					case "class":
						this.setState({ selectedClass: selected ? selected : [] });
						break;
				}
			};

			resetAll = () => {
				this.setState({ selectedClass: [], class: [] });
				this.pushHistory({
					class: [],
				});
			};

			doSearch = () => {
				this.pushHistory({
					selectedClass: this.state.selectedClass,
				});
			};

			arrayMapping(arrayData) {
				return arrayData.map((item) => {
					const data = Object.assign({}, this.state.setOption);
					data.value = item.id;
					data.label = item.title;
					data.key = item.id;
					return data;
				});
			}

			render() {
				const additionalFilterParams = { class: this.state.class };
				return (
					<>
						<HeadTitle title={PageTitle.reporting} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<AdminPageWrap pageTitle={PageTitle.reporting} id={JUMP_TO_CONTENT_ID}>
							<SearchFilters
								classData={this.state.classData}
								selectedClass={this.state.selectedClass}
								handlefilterSelection={this.handlefilterSelection}
								resetAll={this.resetAll}
								numberOfFilters={this.state.filters ? this.state.filters.length : 0}
								doSearch={this.doSearch}
							/>
							<Measures
								unlockedTitles={this.state.unlockedTitles}
								copiedTitles={this.state.copiedTitles}
								copiesTotal={this.state.copiesTotal}
								studentViews={this.state.studentViews}
							/>
							<TableWrapper>
								<TableContainer>
									<TableTitle>Content items</TableTitle>
									<SimpleTableViewer
										location={this.props.location}
										history={this.props.history}
										api={this.props.api}
										apiEndPoint="/admin/user-report/content-items"
										fields={CONTENT_ITEM_FIELDS}
										defaultSortField="number_of_copies"
										defaultSortDir="desc"
										defaultRowsLimit={DEFAULT_ROWS_LIMIT}
										limitParamName="limit-content-item"
										offsetParamName="offset-content-item"
										sortFieldParamName="sort-field-content-item"
										sortDirParamName="sort-dir-content-item"
										pageUrl="/profile/admin/reporting"
										additionalFilterParams={additionalFilterParams}
									/>
								</TableContainer>
								<TableContainer>
									<TableTitle>Copies</TableTitle>
									<SimpleTableViewer
										location={this.props.location}
										history={this.props.history}
										api={this.props.api}
										apiEndPoint="/admin/user-report/copies"
										fields={COPY_FIELDS}
										defaultSortField="date_created"
										defaultSortDir="desc"
										defaultRowsLimit={DEFAULT_ROWS_LIMIT}
										limitParamName="limit-copy"
										offsetParamName="offset-copy"
										sortFieldParamName="sort-field-copy"
										sortDirParamName="sort-dir-copy"
										pageUrl="/profile/admin/reporting"
										additionalFilterParams={additionalFilterParams}
									/>
								</TableContainer>
							</TableWrapper>
						</AdminPageWrap>
					</>
				);
			}
		}
	)
);
