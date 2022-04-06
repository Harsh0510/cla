import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";

const SectionLeft = styled.div`
	width: 80%;
	float: left;
`;
const SectionRight = styled.div`
	width: 20%;
	float: right;
	text-align: left;
`;
const BgSection = styled.div`
	margin-top: 2px;
	height: 20px;
	width: 20px;
	background-color: ${(p) => (p.bgColour ? p.bgColour : theme.colours.white)};
`;
const IconOption = styled.i`
	margin-top: 2px;
	height: 20px;
	width: 20px;
`;
const List = styled.li`
	padding: 10px 20px;
	display: inline-block;
	background-color: ${(p) => (p.isSelected ? theme.colours.lightGray : "transparent")};
	width: 180px;
	margin-left: -20px;
`;
export default class Option extends React.Component {
	constructor(props) {
		super(props);
		this.onSelect = this.onSelect.bind(this);
	}

	onSelect(e) {
		e.preventDefault();
		this.props.onSelect(this.props.option);
	}

	render() {
		const selectedValue = this.props.selected ? this.props.selected.value : "";
		return (
			<List onClick={this.onSelect} title={this.props.option.toolTip} isSelected={this.props.option.value === selectedValue}>
				<SectionLeft className="section2">
					<a href="#">{this.props.option.text}</a>
				</SectionLeft>
				<SectionRight className="section3">
					{this.props.option.colour ? (
						<BgSection bgColour={this.props.option.colour} />
					) : (
						<IconOption className={this.props.option.icon}></IconOption>
					)}
				</SectionRight>
			</List>
		);
	}
}
