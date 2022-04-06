import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import Option from "./option";

const SelectWrap = styled.div`
	padding: 10px 20px;
	display: inline-block;
	cursor: pointer;
	position: relative;
	top: 0;
	margin: 0;
	background: ${theme.colours.primary};
	width: 180px;
	color: ${theme.colours.white};
	text-align: left;
`;

const DropDownItems = styled.ul`
	list-style: none;
	padding: 0 20px 0px 20px;
	margin: 0;
	position: absolute;
	left: 0px;
	top: 44px;
	width: 100%;
	z-index: 9;
	background: ${theme.colours.white};
	color: ${theme.colours.black};
	a:hover {
		text-decoration: none;
		color: ${theme.colours.black};
	}
	text-align: left;
`;

const SectionLeft = styled.div`
	width: 80%;
	float: left;
`;

const SectionRight = styled.div`
	width: 20%;
	float: right;
	text-align: right;
`;
export default class SelectNoteDropDown extends React.PureComponent {
	state = {
		isOpen: false,
	};

	onOpen = () => {
		this.setState({
			isOpen: !this.state.isOpen,
		});
	};

	getOptions = () => {
		return this.props.options.map((o) => <Option key={o.key} option={o} onSelect={this.props.onSelect} selected={this.props.selected} />);
	};

	escFunction = (event) => {
		if (event.keyCode === 27) {
			this.props.onSelect(null);
		}
	};

	componentDidMount() {
		document.addEventListener("keydown", this.escFunction, false);
	}

	componentWillUnmount() {
		document.removeEventListener("keydown", this.escFunction, false);
	}

	render() {
		const { selectedTitle, iconClass } = this.props;
		let items = this.getOptions();
		let selectedText = selectedTitle ? selectedTitle : "Add a note";
		let iconClassName = iconClass ? iconClass : "far fa-sticky-note";
		let selectedColour = theme.colours.white;
		if (this.props.selected) {
			selectedText = this.props.selected.text;
			selectedColour = this.props.selected.colour;
		}

		return (
			<SelectWrap className="select" onClick={this.onOpen}>
				<div style={{ width: "100%" }}>
					<SectionLeft>
						{selectedText} &nbsp; <i style={{ color: selectedColour }} className={iconClassName}></i>
					</SectionLeft>
					<SectionRight>
						<i className="fas fa-angle-down"></i>
					</SectionRight>
				</div>
				{this.state.isOpen ? <DropDownItems>{items}</DropDownItems> : ""}
			</SelectWrap>
		);
	}
}
