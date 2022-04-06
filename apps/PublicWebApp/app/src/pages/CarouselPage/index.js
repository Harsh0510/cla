import React from "react";
import styled from "styled-components";
import withAdminAuthRequiredConsumer from "../../common/withAdminAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import Header from "../../widgets/Header";
import queryString from "query-string";
import TableGrid from "../../widgets/TableGrid";
import TableGridFooter from "../../widgets/TableGridFooter";
import Loader from "../../widgets/Loader";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import AdminPageWrap from "../../widgets/AdminPageWrap";
import CarouselAddEdit from "./CarouselAddEdit";
import getSearchFilterText from "../../common/getSearchFilterText";
import AdminPageFilterMessage from "../../widgets/AdminPageFilterMessage";
import smoothScrollTo from "../../common/smoothScroll";
import TableEditLink from "../../widgets/TableEditLink";
import { SectionHalf, PageDetail, Button, SearchSectionOne, WrapperDiv } from "../../widgets/AdminStyleComponents";
import AdminPageMessage from "../../widgets/AdminPageMessage";
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
		class CarouselPage extends React.PureComponent {
			constructor(props) {
				super(props);
				this.state = {
					limit: 10,
					offset: 0,
					sort_field: "sort_order",
					sort_dir: "asc",
					loading: true,
					carouselLoaded: false,
					unfilteredCount: 3,
					carouselData: null,
					action: ACTION_LIST,
					message: null,
					fields: {
						id: null,
						name: "",
						date_created: "",
						date_edited: "",
						enabled: "",
						sort_order: "",
						image_url: "",
						image_alt_text: "",
						link_url: "",
					},
					currentcarouseldbdata: null,
					searchFilterText: null,
				};
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
				let id = parsed.id !== undefined ? parsed.id : this.state.id;

				let sortField = parsed.sort_field || "sort_order";
				let sortDir = parsed.sort_dir || "asc";
				const newState = {
					limit: limit,
					offset: offset,
					action: action,
					id: id,
					sort_field: sortField,
					sort_dir: sortDir,
				};
				this.setState(newState, this.performQuery);
			}

			/**
			 * Get Carousel information
			 */
			performQuery() {
				this.props
					.api("/admin/carousel-slide-get-all", {
						limit: this.state.limit,
						offset: this.state.offset,
						sort_field: this.state.sort_field,
						sort_direction: this.state.sort_dir,
					})
					.then((result) => {
						const fields = Object.assign({}, this.state.fields);
						let carouselDetails;
						if (this.state.action == ACTION_NEW || this.state.action == ACTION_ADDED) {
							fields.id = this.state.action;
							fields.name = "";
							fields.enabled = "";
							fields.sort_order = "";
							fields.date_created = "";
							fields.date_edited = "";
							fields.image_url = "";
							fields.image_alt_text = "";
							fields.link_url = "";
						} else if (
							this.state.action == ACTION_EDIT &&
							this.state.id &&
							(carouselDetails = result.data.find((row) => row.id === parseInt(this.state.id)))
						) {
							fields.id = parseInt(carouselDetails.id);
							fields.name = carouselDetails.name;
							fields.enabled = carouselDetails.enabled;
							fields.sort_order = carouselDetails.sort_order;
							fields.date_created = carouselDetails.date_created;
							fields.date_edited = carouselDetails.date_edited;
							fields.image_url = carouselDetails.image_url;
							fields.image_alt_text = carouselDetails.image_alt_text;
							fields.link_url = carouselDetails.link_url;
						}
						this.getCarousel(result.data, result.unfilteredCount);
						let searchFilterText = getSearchFilterText(this.state.limit, this.state.offset, "", "", result.unfilteredCount);
						this.setState({
							CarouselLoaded: true,
							searchFilterText: searchFilterText,
							fields: fields,
							currentcarouseldbdata: fields,
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
				});
			};

			//** Get Carousel binding for display in table grid */
			getCarousel = (carouselData, unfilteredCount) => {
				//declare columns
				let columns = [
					{ name: "sort_order", title: "Sort Order" },
					{ name: "name", title: "Panel Name" },
					{ name: "status", title: "Status" },
					{ name: "action", title: "Edit" },
				];

				//arrange the column records
				const rows = carouselData.map((row) => {
					// duplicate the row object. Do not modify the row object directly
					let newRow = Object.assign({}, row);
					newRow.status = row.enabled ? "Enabled" : "Disabled";
					newRow.action = (
						<TableEditLink to="" onClick={this.doOpenEditScreen} data-id={row.id}>
							<i className="fa fa-edit"></i>
						</TableEditLink>
					);
					return newRow;
				});

				//column resizing
				let defaultColumnWidths = [
					{ columnName: "sort_order", width: 150 },
					{ columnName: "name", width: 250 },
					{ columnName: "status", width: 200 },
					{ columnName: "action", width: 80 },
				];

				const sortDir = this.state.sort_dir && this.state.sort_dir[0].toUpperCase() === "D" ? "desc" : "asc";
				let defaultSorting = [{ columnName: this.state.sort_field, direction: sortDir }];

				//column initilization and alignment
				let tableColumnExtensions = [
					{ columnName: "sort_order", align: COLUMN_ALIGN_LEFT },
					{ columnName: "name", align: COLUMN_ALIGN_LEFT },
					{ columnName: "status", align: COLUMN_ALIGN_LEFT },
					{ columnName: "action", align: COLUMN_ALIGN_CENTER },
				];

				//for set fixed column
				let leftColumns = ["sort_order"];
				let rightColumns = ["action"];
				let dateColumnsName = ["date_created"];

				this.setState({
					unfilteredCount: unfilteredCount,
					columns: columns,
					rows: rows,
					defaultColumnWidths: defaultColumnWidths,
					tableColumnExtensions: tableColumnExtensions,
					defaultSorting: defaultSorting,
					loading: false,
					leftColumns: leftColumns,
					rightColumns: rightColumns,
					carouselLoaded: true,
					carouselData: carouselData,
					dateColumnsName: dateColumnsName,
					// message: null
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
				};
				Object.assign(obj, extra || {});
				return queryString.stringify(obj);
			}

			/**
			 * Push history
			 */
			pushHistory(extra) {
				const url = "/profile/admin/carousel-admin?" + this.getQueryString(extra);
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
				});
			};

			doSorting = (sorting) => {
				const columnSorting = sorting[0];
				const sortDirectionString = columnSorting.direction[0].toUpperCase();
				this.setState({ loading: true });
				this.pushHistory({
					sort_field: columnSorting.columnName === "status" ? "enabled" : columnSorting.columnName,
					sort_dir: sortDirectionString,
					offset: 0,
				});
			};

			/**
			 * Create panel
			 */
			createCarousel = () => {
				this.setState(
					{
						message: null,
					},
					() => {
						this.pushHistory({
							action: ACTION_NEW,
							id: null,
						});
					}
				);
			};

			/**
			 * Close the carousel Add/Edit
			 */
			cancelAddEdit = () => {
				this.setState({ message: null }, () => smoothScrollTo(document.querySelector("body")));
				this.pushHistory({
					action: ACTION_LIST,
					id: null,
				});
			};

			/**
			 * Handles the form submission and attempts to add a new user to the database
			 */
			handleSubmit = (data) => {
				if (this.state.action == ACTION_NEW || this.state.action == ACTION_ADDED) {
					const params = {
						name: data.name.toString().trim().replace(/\s\s+/g, " "),
						enabled: data.enabled ? data.enabled : false,
						image_url: data.image_url,
						image_alt_text: data.image_alt_text,
						link_url: data.link_url,
						sort_order: parseFloat(data.sort_order, 10),
					};

					//TODO: When API done just remove comment
					this.props
						.api("/admin/carousel-slide-create", params)
						.then((result) => {
							if (result.created) {
								this.setState({
									message: "Successfully added",
								});
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
				} else if (this.state.action == ACTION_EDIT && this.state.currentcarouseldbdata) {
					const params = this.getFieldValuesForUpdate(this.state.currentcarouseldbdata, data);
					this.props
						.api("/admin/carousel-slide-update", params)
						.then((result) => {
							if (result.result.edited) {
								this.setState({
									message: "Successfully updated",
								});
								this.performQuery();
							} else {
								this.setState({
									message: "Record not updated",
								});
							}
						})
						.catch((result) => {
							this.setState({ message: result.toString() });
						});
				}
			};

			/**
			 * Get fileds which require need to be update
			 * @param {object} currentCarouselDBData existing carousel value
			 * @param {object} updatedCarouselDetail User Updated carousel Detail values
			 */
			getFieldValuesForUpdate = (currentCarouselDBData, updatedCarouselDetail) => {
				let params = Object.create(null);

				if (currentCarouselDBData.name != (updatedCarouselDetail.name || "").toString().trim().replace(/\s\s+/g, " ")) {
					params.name = updatedCarouselDetail.name || "";
				}

				if (currentCarouselDBData.enabled != updatedCarouselDetail.enabled) {
					params.enabled = updatedCarouselDetail.enabled;
				}

				if (currentCarouselDBData.image_alt_text != updatedCarouselDetail.image_alt_text) {
					params.image_alt_text = updatedCarouselDetail.image_alt_text;
				}

				if (currentCarouselDBData.image_url != updatedCarouselDetail.image_url) {
					params.image_url = updatedCarouselDetail.image_url;
				}

				if (currentCarouselDBData.sort_order != updatedCarouselDetail.sort_order) {
					params.sort_order = parseFloat(updatedCarouselDetail.sort_order, 10);
				}

				if (currentCarouselDBData.link_url != updatedCarouselDetail.link_url) {
					params.link_url = updatedCarouselDetail.link_url;
				}

				params.id = parseInt(this.state.id);

				return params;
			};

			/**
			 * Delete the panel after confirmation from carousel
			 */
			deleteCarousel = () => {
				this.props
					.api("/admin/carousel-slide-delete", { id: parseInt(this.state.id) })
					.then((result) => {
						if (result.result) {
							this.setState({
								message: "Panel deleted successfully",
							});
							if (this.state.offset >= this.state.unfiltered_count - 1) {
								this.setState({ offset: 0 });
							}
							if (this.state.action === ACTION_EDIT) {
								this.pushHistory({
									offset: this.state.offset,
									action: ACTION_LIST,
									id: null,
								});
							} else {
								this.pushHistory({
									action: ACTION_NEW,
									id: null,
								});
							}
						} else {
							this.setState({ message: `Error deleting panel` });
						}
					})
					.catch((result) => {
						this.setState({ message: result.toString() });
					});
			};

			handleNameInputField = (inputFieldValue, inputFieldName) => {
				let fields = Object.assign({}, this.state.fields);
				fields[inputFieldName] = inputFieldValue;
				this.setState({ fields: fields });
			};

			render() {
				const { carouselData, fields, message } = this.state;
				let carouselTable = <AdminPageMessage> No results found</AdminPageMessage>;
				let carouselForm = "";
				if (!this.state.CarouselLoaded) {
					carouselTable = (
						<AdminPageMessage>
							<Loader />
						</AdminPageMessage>
					);
				}

				if (carouselData !== null && carouselData.length !== 0) {
					carouselTable = (
						<>
							<TableGrid
								column={this.state.columns}
								row={this.state.rows}
								resize={this.state.defaultColumnWidths}
								tableColumnExtensions={this.state.tableColumnExtensions}
								defaultSorting={this.state.defaultSorting}
								doSorting={this.doSorting}
								loading={this.state.loading}
								leftColumns={this.state.leftColumns}
								rightColumns={this.state.rightColumns}
								dateColumnsName={this.state.dateColumnsName}
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

				if (this.state.action === ACTION_NEW || this.state.action === ACTION_EDIT || this.state.action === ACTION_ADDED) {
					carouselForm = (
						<CarouselAddEdit
							key={fields.id || "__NEW__"}
							handleSubmit={this.handleSubmit}
							cancelAddEdit={this.cancelAddEdit}
							message={message}
							fields={fields}
							action={this.state.action}
							deleteCarousel={this.deleteCarousel}
							handleNameInputField={this.handleNameInputField}
						/>
					);
				}

				return (
					<>
						<HeadTitle title={PageTitle.carouselAdmin} />
						<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
						<AdminPageWrap pageTitle={"Carousel Admin"} id={JUMP_TO_CONTENT_ID}>
							<PageDetail>
								<SearchSectionOne>
									<SectionHalf>
										<Button
											title="Add Panel"
											name="Add Panel"
											hide={this.state.action === ACTION_NEW || this.state.action === ACTION_ADDED}
											onClick={this.createCarousel}
										>
											<ButtonText>Add Panel</ButtonText>
											{/* <FontAwesomeIcon icon={faPlus} size="sm"/> */}
											<i className="fa fa-plus" size="sm" />
										</Button>
									</SectionHalf>
								</SearchSectionOne>
								<WrapperDiv>
									<AdminPageFilterMessage>{this.state.searchFilterText}</AdminPageFilterMessage>
									{carouselTable}
									{carouselForm}
								</WrapperDiv>
							</PageDetail>
						</AdminPageWrap>
					</>
				);
			}
		}
	)
);
