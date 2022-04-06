import React, { Children } from "react";
import { SortingState, IntegratedSorting, DataTypeProvider } from "@devexpress/dx-react-grid";
import {
	Grid,
	VirtualTable,
	Table,
	TableHeaderRow,
	TableColumnResizing,
	TableFixedColumns,
	TableColumnVisibility,
	ColumnChooser,
	Toolbar,
	DragDropProvider,
	TableColumnReordering,
} from "@devexpress/dx-react-grid-bootstrap4";
import styled, { css } from "styled-components";
//import './grid-table-bootstrap.css';
//import 'bootstrap/dist/css/bootstrap.min.css';
//import '@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css';
import GridTable from "./GridTable";
import date from "../../common/date";
import theme from "../../common/theme";

//Table wrapper style component
const TableWrap = styled(VirtualTable)`
	display: none;
	${(p) =>
		p.loading === false &&
		css`
			display: block;
		`}
`;

// Table component
const TableComponent = ({ ...restProps }) => <Table.Table {...restProps} className="table-striped" />;

// DateTypeProvider: Displays only date - not time
const DateFormatter = ({ value }) => date.sqlToNiceFormat(value);
const DateTypeProvider = (props) => <DataTypeProvider formatterComponent={DateFormatter} {...props} />;

// DatetimeTypeProvider: Displays date and time
const DatetimeFormatter = ({ value }) => date.sqlToNiceDateWithTimeFormat(value);
const DatetimeTypeProvider = (props) => <DataTypeProvider formatterComponent={DatetimeFormatter} {...props} />;

const WrapSortingIcon = styled.span`
	i {
		color: ${theme.colours.darkGray};
		vertical-align: middle;
		margin-left: 10px;
		font-weight: normal;
		display: inline;
	}
`;

const ExtraActions = styled.div`
	text-align: right;
	margin-bottom: 1em;
`;

const ExtraAction = styled.a`
	display: inline-block;
	margin-left: 1em;
	color: ${theme.colours.primary};
	text-decoration: underline;
`;

const SortingIcon = ({ direction }) => (direction === "asc" ? <i className="fal fa-chevron-up"></i> : <i className="fal fa-chevron-down"></i>);
/**Display header label with sorting icon */
const SortLabel = ({ onSort, children, direction, disabled }) => (
	<WrapSortingIcon size="small" variant="contained" onClick={!disabled ? onSort : () => {}}>
		{children}
		{direction && !disabled && <SortingIcon direction={direction} />}
	</WrapSortingIcon>
);

export default class TableGrid extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			columns: props.column,
			defaultHiddenColumns: "",
			bindColumns: props.column,
		};
		this._bindTableGridTimeout = null;
	}

	componentDidMount() {
		this._bindTableGridTimeout = setTimeout(() => {
			var getAllThElements = document.querySelectorAll("thead > tr > th");
			for (var i = 0; i < getAllThElements.length; i++) {
				var ele = getAllThElements[i];
				ele.addEventListener(
					"mouseenter",
					(e) => {
						e.target.classList.add("border_right");
						this.addRemoveClassonHover(e, "add");
					},
					false
				);
			}
			var getHeaderCell = document.querySelectorAll("thead > tr > .dx-g-bs4-header-cell");
			for (var i = 0; i < getHeaderCell.length; i++) {
				var ele = getHeaderCell[i];
				ele.addEventListener(
					"mouseleave",
					(e) => {
						e.target.classList.remove("border_right");
						this.addRemoveClassonHover(e, "remove");
					},
					false
				);
			}
		}, 1000);
	}

	/* --- This is to change column visibility from parent --- */
	componentDidUpdate(prevProps, prevState) {
		if (prevProps.column.length !== this.props.column.length) {
			this.setState({
				columns: this.props.column,
			});
		}
	}

	componentWillUnmount() {
		if (this._bindTableGridTimeout) {
			clearTimeout(this._bindTableGridTimeout);
		}
		delete this._bindTableGridTimeout;
		var getAllThElements = document.querySelectorAll("thead > tr > th");
		for (var i = 0; i < getAllThElements.length; i++) {
			var ele = getAllThElements[i];
			ele.removeEventListener(
				"mouseenter",
				(e) => {
					this.addRemoveClassonHover(e, "remove");
				},
				false
			);
		}
		var getHeaderCell = document.querySelectorAll("thead > tr > .dx-g-bs4-header-cell");
		for (var i = 0; i < getHeaderCell.length; i++) {
			var ele = getHeaderCell[i];
			ele.removeEventListener(
				"mouseleave",
				(e) => {
					this.addRemoveClassonHover(e, "remove");
				},
				false
			);
		}
	}

	addRemoveClassonHover = (element, action) => {
		var child = element.target;
		var parent = child.parentNode;
		var index = Array.prototype.indexOf.call(parent.children, child);

		var getAllTrElements = document.querySelectorAll("table.dx-g-bs4-table > tbody > tr");
		for (var i = 0; i < getAllTrElements.length; i++) {
			var trChild = getAllTrElements[i];
			if (action === "add") {
				trChild.children[index].classList.add("border_right");
			} else {
				trChild.children[index].classList.remove("border_right");
			}
		}
	};

	handleClick = (sorting) => {
		this.props.doSorting(sorting);
	};

	handleColumnVisibilityChange = (e) => {
		let columnsToShift = [];
		e.forEach((hiddenColumn) => {
			this.state.columns.forEach((column) => {
				if (hiddenColumn === column.name) {
					columnsToShift.push(column);
				}
			});
		});
		let newArray = [];
		this.state.columns.forEach((column) => {
			if (!e.includes(column.name)) {
				newArray.push(column);
			}
		});
		let newColumnsOrder = newArray.concat(columnsToShift);
		this.setState({
			columns: newColumnsOrder,
			defaultHiddenColumns: e,
		});
	};

	doAction = (e) => {
		e.preventDefault();
		const idx = parseInt(e.currentTarget.getAttribute("data-idx"), 10);
		const act = this.props.extraActions[idx];
		if (act && act.onClick) {
			act.onClick(act, e.currentTarget, idx);
		}
	};

	render() {
		const {
			row,
			column,
			resize,
			tableColumnExtensions,
			defaultSorting,
			sortingStateColumnExtensions,
			loading = false,
			leftColumns,
			rightColumns,
			dateColumnsName = [],
			datetimeColumnsName = [],
			isContainImage = false,
			showColumnSelector = true,
		} = this.props;
		const countDateColumnsName = dateColumnsName.length;
		const countDatetimeColumnsName = datetimeColumnsName.length;
		let columnVisibilityDisableColumnTrigger = [
			{ columnName: "action", togglingEnabled: false },
			{ columnName: "select", togglingEnabled: false },
			{ columnName: "review", togglingEnabled: false },
		];
		const TableRow = ({ row, ...restProps }) => <Table.Row {...restProps} style={row.has_read ? { backgroundColor: theme.colours.lime } : {}} />;
		return (
			<>
				<GridTable isContainImage={isContainImage}>
					<Grid rows={row} columns={this.state.columns}>
						<SortingState defaultSorting={defaultSorting} onSortingChange={this.handleClick} columnExtensions={sortingStateColumnExtensions} />
						{countDateColumnsName > 0 ? <DateTypeProvider for={dateColumnsName} /> : ""}
						{countDatetimeColumnsName > 0 ? <DatetimeTypeProvider for={datetimeColumnsName} /> : ""}
						<TableWrap tableComponent={TableComponent} columnExtensions={tableColumnExtensions} loading={loading} />
						<Table rowComponent={TableRow} columnExtensions={tableColumnExtensions} />
						<TableColumnResizing defaultColumnWidths={resize} />
						<TableHeaderRow sortLabelComponent={SortLabel} showSortingControls />
						{showColumnSelector ? (
							<TableColumnVisibility
								columnExtensions={columnVisibilityDisableColumnTrigger}
								onHiddenColumnNamesChange={this.handleColumnVisibilityChange}
							/>
						) : null}
						{Array.isArray(this.props.extraActions) && (
							<ExtraActions>
								{this.props.extraActions.map((action, idx) => (
									<ExtraAction href="#" key={idx + "//" + action.name} data-idx={idx} title={action.tooltip} onClick={this.doAction}>
										{action.name}
									</ExtraAction>
								))}
							</ExtraActions>
						)}
						{showColumnSelector ? <Toolbar /> : null}
						{showColumnSelector ? <ColumnChooser /> : null}
					</Grid>
				</GridTable>
			</>
		);
	}
}
