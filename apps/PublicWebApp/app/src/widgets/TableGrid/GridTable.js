import styled, { css } from "styled-components";
import theme from "../../common/theme";
import "@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css";

const GridTable = styled.div`
	.position-relative {
		position: relative !important;
	}

	.flex-column {
		flex-direction: column !important;
	}

	.d-flex {
		display: flex !important;
	}

	.table-responsive {
		display: block;
		width: 100%;
		overflow-x: auto;
		height: auto !important;
	}

	.table {
		width: 100%;
		margin-bottom: 1rem;
		background-color: transparent;
		min-width: calc(90% - 100px);
	}

	table {
		border-collapse: collapse;
		min-height: auto !important;
		margin: 0 !important;
	}

	colgroup {
		display: table-column-group;
	}

	thead {
		display: table-header-group;
		vertical-align: middle;
		border-color: inherit;
	}

	tr {
		display: table-row;
		vertical-align: inherit;
		border-color: inherit;
	}

	th {
		text-align: inherit;
	}

	thead > tr > th {
		padding: 0.75rem;
		vertical-align: top;
		border: 0;
		font-weight: normal;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	thead > tr > th:hover {
		font-weight: bold;
		cursor: pointer;
	}

	.table thead th {
		vertical-align: bottom;
		border-bottom: 0;
	}

	.table td,
	.table-grid .table th {
		padding: 0.75rem;
		vertical-align: top;
		border-top: 1px solid #dee2e6;
	}

	.table td,
	.table-grid .table th {
		padding: 0.75rem;
		vertical-align: top;
		border-top: 1px solid #dee2e6;
	}

	.text-nowrap {
		white-space: nowrap !important;
	}

	.dx-rg-bs4-table-header-title {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.dx-g-bs4-resizing-control-wrapper {
		position: absolute;
		user-select: none;
		width: 16px;
		top: 0;
		right: 0px;
		height: 100%;
		cursor: col-resize;
		z-index: 100;
		opacity: 0;
	}

	.dx-g-bs4-table-container {
		overflow: auto;
		margin-bottom: 15px !important;
	}

	.dx-g-bs4-table {
		table-layout: fixed;
		border-collapse: separate;
		border-spacing: 0;
		margin: 0;
	}

	.dx-g-bs4-resize-control-line-first {
		left: 7px;
	}

	.dx-g-bs4-resize-control-line {
		opacity: 1;
		position: absolute;
		height: 50%;
		width: 1px;
		top: 25%;
		transition: all linear 100ms;
	}

	.dx-g-bs4-resize-control-line-second {
		left: 9px;
	}

	.dx-g-bs4-table-cell {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.bg-primary {
		background-color: white !important;
	}

	.w-100 {
		width: 100% !important;
	}

	.align-items-end {
		align-items: flex-end !important;
	}

	.flex-row {
		flex-direction: row !important;
	}

	.position-relative {
		position: relative !important;
	}

	tbody {
		background-color: ${theme.colours.white};
	}

	tbody > tr > td {
		border: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		vertical-align: middle !important;
		text-align: left !important;
	}

	.dx-g-bs4-table-invisible-row {
		display: none !important;
	}

	.table.table-striped {
		padding-bottom: 30px !important;
	}

	.table-responsive::-webkit-scrollbar {
		height: 9px;
		width: 10px;
	}

	.table-responsive::-webkit-scrollbar-track {
		background: transparent;
	}

	.table-responsive::-webkit-scrollbar-thumb {
		background: ${theme.colours.primaryDark};
		border-radius: 10px;
	}

	.table-responsive::-webkit-scrollbar-thumb:hover {
		background: ${theme.colours.primaryDark};
	}

	.dx-g-bs4-header-cell {
		.dx-rg-bs4-table-header-title {
			width: 90%;
		}
	}

	.align-items-center {
		width: 100%;
	}

	.dx-g-bs4-sorting-indicator {
		top: 0;
		font-size: 11px;
	}

	.text-center {
		text-align: center !important;
	}

	thead > tr > th:last-child {
		visibility: hidden;
	}

	tbody > tr > td:last-child {
		visibility: hidden;
	}
	th span.text-primary {
		color: ${theme.colours.darkGray};
	}
	tr td:first-child,
	tr th:first-child {
		padding-left: 0;
	}
	font-size: 14px;
	color: ${theme.colours.darkGray};
	a.links_data {
		font-size: 14px;
		color: ${theme.colours.darkGray};
	}

	.table-responsive .table .table_header:after {
		content: "\f078";
		font-family: "Font Awesome 5 Pro";
		font-size: 12px;
		color: ${theme.colours.darkGray};
		vertical-align: middle;
		margin-left: 10px;
		font-weight: normal;
	}
	.table-responsive .table .table_header.show:after {
		content: "\f077";
	}
	.table-responsive a.links_data {
		text-decoration: underline;
	}
	.table th,
	.table_data .table td {
		border: 0;
	}
	.table th,
	td {
		word-break: keep-all;
		white-space: nowrap;
	}
	.table tr {
		border-top: 1px solid ${theme.colours.lightGray};
	}
	.table tr:first-child {
		border: 0;
	}
	${(p) =>
		p.isContainImage &&
		css`
			.table td {
				height: 65px;
			}
		`}

	/* ---- Column Selector Start ---- */

	.card-header.dx-g-bs4-toolbar {
		top: 0;
		right: 0;
		position: absolute !important;
	}

	.card-header button.btn-outline-secondary {
		background-color: ${theme.colours.bgGridTableHeader};
		color: ${theme.colours.white};
		border: 0;
		padding: 0.45rem 1.26rem;
	}

	.card-header button.btn-outline-secondary:hover {
		border: none;
	}

	.card-header span {
		font-family: "Font Awesome 5 Pro" !important;
	}

	span.oi.oi-eye:before {
		content: "Columns";
		font-weight: normal;
		font-family: "FS Elliot", sans-serif;
		padding-right: 10px;
		letter-spacing: 1px;
		font-size: 16px;
	}

	span.oi.oi-eye:after {
		content: "\\F078";
	}

	.dropdown-item {
		display: block;
		min-width: 119px;
		width: 100%;
		text-align: left;
		background-color: ${theme.colours.white};
		border: 0;
		white-space: nowrap;
	}

	.popover {
		transform: none !important;
		z-index: 999;
		right: 0 !important;
		left: auto !important;
		top: 52px !important;
	}

	.popover-inner .py-2 {
		background-color: ${theme.colours.white};
		-webkit-box-shadow: 0 7px 15px rgba(0, 0, 0, 0.3), 0 0px 4px rgba(0, 0, 0, 0.22);
		box-shadow: 0 7px 15px rgba(0, 0, 0, 0.3), 0 0px 4px rgba(0, 0, 0, 0.22);
	}

	/* ---- Column Selector End ---- */

	.border_right {
		border-right: 1px solid ${theme.colours.lightGray} !important;
	}

	.dropdown-item:disabled {
		pointer-events: none;
	}

	.dropdown-item div {
		display: inline-flex;
	}

	.dropdown-item div input {
		opacity: 0.3;
	}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		.card-header.dx-g-bs4-toolbar {
			position: relative !important;
		}
	}
`;

export default GridTable;
