/**
 * Design the table data footer section for pagination and table rows limit selection
 */
import React from "react";
import styled, { css } from "styled-components";
import { col12, colMd6, colSm4, colSm8, customSelect, inputGroup } from "../../common/style";
import theme from "../../common/theme";
import Pagination from "../../widgets/Pagination";
import { Row } from "../../widgets/Layout/Row";

const WrapRow = styled(Row)`
	align-items: center;
	padding-bottom: 1.5rem;
	padding-top: 1.5rem;
	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		padding-bottom: 3rem;
	}
`;

const DisplayRow = styled.div`
	${col12}
	${colSm4}
	${colMd6}
	margin-top: 1rem;
	.section-text .custom-select {
		position: relative;
		-ms-flex: 1 1 auto;
		flex: 1 1 auto;
		width: auto;
		margin-bottom: 0;
		max-width: 75px;
		margin-left: 8px;
		border-color: ${theme.colours.primary};
		color: ${theme.colours.headerButtonSearch};
	}
	@media screen and (min-width: ${theme.breakpoints.mobileSmall}) {
		margin-top: 0;
	}
`;

const CustomSelect = styled.select`
	${customSelect}
	-webkit-appearance: none;
	border-color: ${theme.colours.darkGray};
	background-size: 10px 16px;
	position: relative;
	-ms-flex: 1 1 auto;
	flex: 1 1 auto;
	width: 1%;
	margin-bottom: 0;
	max-width: 75px;
	margin-left: 8px;
	border-color: ${theme.colours.primary};
	color: ${theme.colours.headerButtonSearch};
	padding-bottom: 0px;
	padding-top: 0px;
	background-image: url(${require("../../assets/images/primary-drop-arrow.svg")});

	::-ms-expand {
		display: none;
	}
`;

const DisplayLabel = styled.label`
	display: flex;
	margin-bottom: 0;
	align-items: center;
	color: ${theme.colours.primary};
`;

const DisplayInputGroup = styled.div`
	${inputGroup}
	@media screen and (min-width: ${theme.breakpoints.mobileSmall}) {
		justify-content: flex-end;
	}
`;

const DisplayInputPrepend = styled.div`
	display: flex;
`;

const PaginationWrap = styled.div`
	${col12}
	${colSm8}
	${colMd6}
`;

export default class TableGridFooter extends React.PureComponent {
	/**handle page rows limit selected page*/
	handleOnChange = (e) => {
		e.preventDefault();
		let limit = parseInt(e.target.value);
		if (this.props.doPagination) {
			this.props.doPagination(1, limit);
		}
	};

	/**handle pagination selected page*/
	handlePagination = (page) => {
		// get total pages
		let totalPages = Math.ceil(this.props.unfilteredCount / this.props.limit);
		if (page > 0 && page - 1 < totalPages) {
			if (this.props.doPagination) {
				this.props.doPagination(page, this.props.limit);
			}
		}
	};

	render() {
		const { unfilteredCount = 0, limit = 10, pageNeighbours = 3, currentPage = 0, loading = false, isTablePagination = true } = this.props;

		return (
			<WrapRow>
				<PaginationWrap>
					<Pagination
						totalRecords={unfilteredCount}
						pageLimit={limit}
						pageNeighbours={pageNeighbours}
						onPageChanged={this.handlePagination}
						currentPage={currentPage}
						loading={loading}
						isTablePagination={isTablePagination}
					/>
				</PaginationWrap>

				<DisplayRow>
					<div className="section-text">
						<DisplayInputGroup>
							<DisplayInputPrepend>
								<DisplayLabel htmlFor="inputGroupSelect01">Display</DisplayLabel>
							</DisplayInputPrepend>
							<CustomSelect id="inputGroupSelect01" value={limit} onChange={this.handleOnChange} htmlFor="pageRows" name="pageLimit">
								<option value="5">5 rows</option>
								<option value="10">10 rows</option>
								<option value="25">25 rows</option>
							</CustomSelect>
						</DisplayInputGroup>
					</div>
				</DisplayRow>
			</WrapRow>
		);
	}
}
