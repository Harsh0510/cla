import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import Modal from "../../widgets/Modal";
import withApiConsumer from "../../common/withApiConsumer";
import withAuthConsumer from "../../common/withAuthConsumer";
import mappingExtractStatus from "../../common/mappingExtractStatus";
import CopiesTable from "../../widgets/CopiesTable";
import CopyCreationAccessDeniedPopup from "../../widgets/CopyCreationAccessDeniedPopup";

const Wrap = styled.div`
	font-size: 14px;
	padding: 1em;

	.table-responsive {
		padding-top: 1em;
		max-height: 600px;
		overflow-x: auto;
		overflow-y: auto;
	}

	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		.table-responsive {
			padding-top: 0px;
			max-height: 235px;
			overflow-x: auto;
			overflow-y: auto;
		}
	}

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		.table-responsive {
			padding-top: 0px;
			max-height: 200px;
			overflow-x: auto;
			overflow-y: auto;
		}
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		.table-responsive {
			padding-top: 0px;
			max-height: 150px;
			overflow-x: auto;
			overflow-y: auto;
		}
	}
`;

const ModalTitle = styled.h2`
	font-size: 1.375;
	font-weight: normal;
`;

const DataSection = styled.div`
	min-height: 300px;
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		min-height: 150px;
	}
`;

export default withAuthConsumer(
	withApiConsumer(
		class ShowAllCopies extends React.PureComponent {
			state = {
				copiesData: [],
				show: this.props.show,
				sortField: "date_created",
				sortDir: "A",
				limit: 10,
				offset: 0,
				unfilteredCount: 0,
				loading: true,
				columns: [],
				tableRows: [],
				defaultColumnWidths: [],
				tableColumnExtensions: [],
				defaultSorting: [],
				sortingStateColumnExtensions: [],
				leftColumns: [],
				rightColumns: [],
				dateColumnsName: [],
				showModal: false,
			};

			componentDidMount() {
				this.fetchCopies();
			}

			componentDidUpdate(prevProps) {
				if (this.props.pdf_isbn13 !== prevProps.pdf_isbn13) {
					this.fetchCopies();
				}
			}

			/**Fetch copies
			 * params : isbn13
			 */
			fetchCopies = (_) => {
				if (this.props.withAuthConsumer_myUserDetails && this.props.pdf_isbn13) {
					const isbn = this.props.pdf_isbn13;
					this.setState({ loading: true });
					this.props
						.api("/public/extract-search", {
							work_isbn13: isbn,
							order_by: [this.state.sortField, this.state.sortDir],
							limit: parseInt(this.state.limit, 10),
							offset: parseInt(this.state.offset, 10),
						})
						.then((result) => {
							const withStausData = mappingExtractStatus(result.extracts);
							this.setState({ copiesData: withStausData, unfilteredCount: result.unfiltered_count, loading: false });
						});
				}
			};

			doSorting = (sorting) => {
				const columnSorting = sorting[0];
				if (columnSorting) {
					const sortDirectionString = columnSorting.direction === "desc" ? "D" : "A";
					this.setState(
						{
							sortField: columnSorting.columnName,
							sortDir: sortDirectionString,
							offset: 0,
							loading: true,
						},
						() => {
							this.fetchCopies();
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
						this.fetchCopies();
					}
				);
			};

			//show the modal for unverfied or un approve user
			doShowModal = (value) => {
				this.setState({ showModal: value });
			};
			//hide the modal for unverfied or un approve user
			hideModal = () => {
				this.setState({ showModal: false });
			};

			render() {
				let dataTable = "No results found";
				const show = this.props.show;
				const userData = this.props.withAuthConsumer_myUserDetails;
				const schoolName = userData.school;

				if (this.state.copiesData !== null && this.state.copiesData.length !== 0) {
					dataTable = (
						<>
							<CopiesTable
								copiesData={this.state.copiesData}
								unfilteredCount={this.state.unfilteredCount}
								sortField={this.state.sortField}
								sortDir={this.state.sortDir}
								doSorting={this.doSorting}
								doPagination={this.doPagination}
								limit={this.state.limit}
								offset={this.state.offset}
								loading={this.state.loading}
								doShowModal={this.doShowModal}
							/>
						</>
					);
				}

				return (
					<>
						<Wrap>
							<Modal show={show} handleClose={this.props.hideModal}>
								<DataSection>
									<ModalTitle>Copies created at {schoolName}</ModalTitle>
									{dataTable}
								</DataSection>
								{this.state.showModal && <CopyCreationAccessDeniedPopup handleClose={this.hideModal} />}
							</Modal>
						</Wrap>
					</>
				);
			}
		}
	)
);
