import React from "react";
import queryString from "query-string";
import styled from "styled-components";
import Presentation from "./Presentation";
import PropTypes from "prop-types";

const TableGridContainer = styled.div`
	width: 100%;
`;

const Message = styled.div`
	margin: 15px 0;
`;

class SimpleTableViewer extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			[this.props.limitParamName]: this.props.defaultRowsLimit,
			[this.props.offsetParamName]: 0,
			[this.props.sortFieldParamName]: this.props.defaultSortField,
			[this.props.sortDirParamName]: this.props.defaultSortDir,
			loading: false,
			unfilteredCount: 0,
			data: [],
			message: null,
		};
		this.resetAll = this.resetAll.bind(this);
	}

	componentDidMount() {
		this.updateState();
	}

	componentDidUpdate(prevProps) {
		if (this.props.location.search !== prevProps.location.search || this.props.additionalFilterParams !== prevProps.additionalFilterParams) {
			this.updateState();
		}
	}

	updateState() {
		const parsed = queryString.parse(this.props.location.search);

		let limit = parseInt(parsed[this.props.limitParamName] || this.props.defaultRowsLimit, 10);
		if (limit < 1) {
			limit = 1;
		}

		let offset = parseInt(parsed[this.props.offsetParamName] || 0, 10);
		if (offset < 0) {
			offset = 0;
		}

		let sortField = parsed[this.props.sortFieldParamName] || this.props.defaultSortField;
		let sortDir = parsed[this.props.sortDirParamName] || this.props.defaultSortDir;

		this.setState(
			{
				[this.props.limitParamName]: limit,
				[this.props.offsetParamName]: offset,
				[this.props.sortFieldParamName]: sortField,
				[this.props.sortDirParamName]: sortDir,
			},
			this.performQuery
		);
	}

	/**
	 * Get data from api
	 */
	performQuery() {
		this.props
			.api(this.props.apiEndPoint, {
				limit: this.state[this.props.limitParamName] ? this.state[this.props.limitParamName] : this.props.defaultRowsLimit,
				offset: this.state[this.props.offsetParamName] ? this.state[this.props.offsetParamName] : 0,
				sort: {
					field: this.state[this.props.sortFieldParamName] ? this.state[this.props.sortFieldParamName] : this.props.defaultSortField,
					direction: this.state[this.props.sortDirParamName] ? this.state[this.props.sortDirParamName] : this.props.defaultSortDir,
				},
				...this.props.additionalFilterParams,
			})
			.then((result) => {
				if (result.data.length === 0) {
					this.setState({ message: "No results found" });
				}
				this.setState({ data: result.data, unfilteredCount: result.unfiltered_count, loading: false });
			})
			.catch((result) => {
				this.setState({ message: result.toString() });
			});
	}

	/**
	 * get query string
	 */
	getQueryString(extra) {
		const parsed = queryString.parse(this.props.location.search);
		const obj = {
			[this.props.limitParamName]: this.state[this.props.limitParamName],
			[this.props.offsetParamName]: this.state[this.props.offsetParamName],
			[this.props.sortFieldParamName]: this.state[this.props.sortFieldParamName],
			[this.props.sortDirParamName]: this.state[this.props.sortDirParamName],
		};
		Object.assign(obj, parsed || {});
		Object.assign(obj, extra || {});
		return queryString.stringify(obj);
	}

	/**
	 * Push history
	 */
	pushHistory(extra) {
		const url = this.props.pageUrl + "?" + this.getQueryString(extra);
		this.props.history.push(url);
	}

	doPagination = (page, limit) => {
		const currentPage = page == 0 ? 0 : page - 1;
		const setOffset = currentPage * limit;
		const setLimit = limit;

		this.setState({ [this.props.offsetParamName]: setOffset, [this.props.limitParamName]: setLimit });
		this.pushHistory({
			[this.props.offsetParamName]: setOffset,
			[this.props.limitParamName]: setLimit,
		});
	};

	/**
	 * Handles the sorting data
	 */
	doSorting = (sorting) => {
		const columnSorting = sorting[0];
		const sortDirectionString = columnSorting.direction[0].toUpperCase();
		this.setState({ loading: true, message: null });
		this.pushHistory({
			[this.props.sortFieldParamName]: columnSorting.columnName,
			[this.props.sortDirParamName]: sortDirectionString,
			[this.props.offsetParamName]: 0,
		});
	};

	resetAll() {
		this.setState({
			message: null,
		});
		this.pushHistory({
			[this.props.offsetParamName]: 0,
		});
	}

	render() {
		const { data, message, unfilteredCount, loading } = this.state;
		const { fields, limitParamName, offsetParamName, sortFieldParamName, sortDirParamName } = this.props;

		return (
			<TableGridContainer>
				{data && data.length ? (
					<>
						<Presentation
							fields={fields}
							data={data}
							unfilteredCount={unfilteredCount}
							doSorting={this.doSorting}
							doPagination={this.doPagination}
							showColumnSelector={false}
							limit={this.state[limitParamName]}
							offset={this.state[offsetParamName]}
							loading={loading}
							sortField={this.state[sortFieldParamName]}
							sortDir={this.state[sortDirParamName]}
						/>
					</>
				) : (
					<Message>{message}</Message>
				)}
			</TableGridContainer>
		);
	}
}

SimpleTableViewer.propTypes = {
	location: PropTypes.object.isRequired, // location object
	history: PropTypes.object.isRequired, // history objject
	api: PropTypes.func.isRequired, // api
	apiEndPoint: PropTypes.string.isRequired, // api end point for getting data
	fields: PropTypes.array.isRequired, // column fields
	defaultSortField: PropTypes.string, // default sort field
	defaultSortDir: PropTypes.string, // default sort direction
	defaultRowsLimit: PropTypes.number, // default rows limit for table
	limitParamName: PropTypes.string.isRequired, // param name for limit
	offsetParamName: PropTypes.string.isRequired, // param name for offset
	sortFieldParamName: PropTypes.string.isRequired, // param name for sort field
	sortDirParamName: PropTypes.string.isRequired, // param name for sort direction
	pageUrl: PropTypes.string.isRequired, // page url
	additionalFilterParams: PropTypes.object, // additional params for filtering
};

export default SimpleTableViewer;
