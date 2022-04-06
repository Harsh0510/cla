import React from "react";
import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import theme from "../../common/theme";

function getPageList(currentPage, pageCount, neighbours) {
	const ret = [];
	const start = Math.max(0, currentPage - neighbours);
	const end = Math.min(pageCount - 1, currentPage + neighbours);
	if (currentPage > neighbours) {
		ret.push({
			type: "NUMBER",
			index: 0,
			active: 0 === currentPage,
		});
	}
	if (currentPage > neighbours + 1) {
		ret.push({
			type: "DOTS",
		});
	}
	for (let i = start; i <= end; ++i) {
		ret.push({
			type: "NUMBER",
			index: i,
			active: i === currentPage,
		});
	}
	if (currentPage + neighbours + 2 < pageCount) {
		ret.push({
			type: "DOTS",
		});
	}
	if (currentPage + neighbours + 1 < pageCount) {
		ret.push({
			type: "NUMBER",
			index: pageCount - 1,
			active: currentPage === pageCount - 1,
		});
	}
	return ret;
}

const Wrap = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const FirstLastWrap = styled.div`
	width: 1em;
	height: 1em;
	display: flex;
	align-items: center;
	justify-content: center;

	${(p) =>
		p.active
			? css`
					opacity: 0.5;
					pointer-events: none;
			  `
			: css`
					cursor: pointer;
					pointer-events: auto;
			  `}
`;

const PageList = styled.div`
	cursor: pointer;
`;

const Page = styled.span`
	display: inline-block;
	padding-left: 0.25em;
	padding-right: 0.25em;
	font-size: 0.8em;
	${(p) =>
		p.active
			? css`
					text-decoration: underline;
					font-weight: bolder;
			  `
			: css`
					opacity: 0.8;
					cursor: pointer;
			  `}
`;

const Dots = styled.span`
	display: inline-block;
	padding-left: 0.1em;
	padding-right: 0.1em;
	font-size: 0.8em;
`;

const TablePagination = styled.div`
	position: relative;

	.pagination .page-item .page-link {
		position: relative;
		display: inline-block;
		padding: 5px;
		font-size: 17px;
		font-weight: normal;
		color: ${theme.colours.headerButtonSearch};
	}
	.pagination .page-item.active span.page-link {
		font-weight: bold;
	}
	.pagination .page-item .page-link:hover {
		color: ${theme.colours.black};
	}
	.pagination li.page-item:first-child .page-link {
		padding-left: 0;
	}
`;

const DotLi = styled.li`
	line-height: 2.2em;
`;

const PageUl = styled.ul`
	display: flex;
	margin-bottom: 0;
	padding-left: 0;
	list-style: none;
	cursor: pointer;
`;

export default class Pagination extends React.PureComponent {
	onClick = (e) => {
		e.preventDefault();
		const page = parseInt(e.currentTarget.getAttribute("data-page"), 10);
		if (page !== this.props.currentPage - 1) {
			this.props.onPageChanged(page + 1);
		}
	};

	render() {
		const props = this.props;
		const pageCount = Math.ceil(props.totalRecords / props.pageLimit);
		const pageIndex = props.currentPage - 1;
		const pages = getPageList(pageIndex, pageCount, props.pageNeighbours);
		const isTablePagination = props.isTablePagination || false;
		return !isTablePagination ? (
			<Wrap>
				<FirstLastWrap data-page={pageIndex - 1} onClick={this.onClick} active={pageIndex === 0 ? true : false}>
					<FontAwesomeIcon icon={faArrowLeft} />
				</FirstLastWrap>
				<PageList>
					{pages.map((page, idx) =>
						page.type === "NUMBER" ? (
							<Page key={idx} data-page={page.index} onClick={this.onClick} active={page.active ? "true" : "false"}>
								{page.index + 1}
							</Page>
						) : (
							<Dots key={idx}>...</Dots>
						)
					)}
				</PageList>
				<FirstLastWrap data-page={pageIndex + 1} onClick={this.onClick} active={pageIndex === pageCount - 1 ? true : false}>
					<FontAwesomeIcon icon={faArrowRight} />
				</FirstLastWrap>
			</Wrap>
		) : (
			<TablePagination>
				<nav aria-label="pagination">
					<PageUl className="pagination pagination-sm">
						{pages.map((page, idx) =>
							page.type === "NUMBER" ? (
								<li
									key={idx}
									data-page={page.index}
									onClick={this.onClick}
									active={page.active ? "true" : "false"}
									className={page.active ? "page-item active" : "page-item"}
								>
									<span className="page-link">{page.index + 1}</span>
								</li>
							) : (
								<DotLi key={idx}>...</DotLi>
							)
						)}
					</PageUl>
				</nav>
			</TablePagination>
		);
	}
}
