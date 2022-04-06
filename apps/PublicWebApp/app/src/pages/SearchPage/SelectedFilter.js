import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";

const FilterItem = styled.div`
	font-size: 1em;
	position: relative;
	display: block;
	margin-right: 1em;
	margin-top: 1em;
	padding: 0 1em;
	border: 1px solid ${theme.colours.bgDarkPurple};
	min-height: 30px;
	color: ${theme.colours.bgDarkPurple};
	vertical-align: middle;
	padding: 0.5em;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		line-height: 1.2em;
		padding: 0.5em 1em;
	}
`;

const DisSelectFilterButton = styled.button`
	font-size: 0.7em;
	right: -10px;
	top: -8px;
	background-color: ${theme.colours.bgDarkPurple};
	color: ${theme.colours.white};
	border-radius: 50%;
	position: absolute;
	border-color: ${theme.colours.bgDarkPurple};
	border: 2px solid ${theme.colours.bgDarkPurple};
	vertical-align: middle;
	text-align: center;
	line-height: 0.2em;
	height: 19px;
	width: 19px;
	padding: 0;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		font-size: 12px;
	}
`;

export default class SelectedFilter extends React.PureComponent {
	onClick = (e) => {
		e.preventDefault();
		let items = [];
		let selecteFilterItem = this.props.filter;
		selecteFilterItem.isChecked = false;
		items.push(selecteFilterItem);
		this.props.onClose(items);
	};

	render() {
		const { filter, filterGroup } = this.props;
		const title = filter && filter.title ? filter.title : "";
		return (
			<FilterItem>
				{title}
				<DisSelectFilterButton onClick={this.onClick}>
					<i className="fal fa-times"></i>
				</DisSelectFilterButton>
			</FilterItem>
		);
	}
}
