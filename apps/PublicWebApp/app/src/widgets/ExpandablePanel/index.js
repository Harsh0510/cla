import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";

const Wrap = styled.div`
	-webkit-box-shadow: 0px 3px 8px 2px rgba(50, 0, 0, 0.2);
	-moz-box-shadow: 0px 3px 8px 2px rgba(50, 0, 0, 0.2);
	box-shadow: 0px 3px 8px 2px rgba(50, 0, 0, 0.2);
	margin-bottom: 1em;
	font-size: 16px;
`;

const Header = styled.div`
	padding: 1em;
	font-size: 1em;
	font-weight: bold;
	color: ${theme.colours.primary};
	position: relative;
	display: flex;
	justify-content: space-between;
	font-weight: 400;
	line-height: 1.3125em;
	cursor: pointer;
`;

const ExpandSection = styled.div`
	display: flex;
	justify-content: flex-start;
	flex-direction: row;
	padding: 0 1em 1.25em 1em;
	p {
		margin-bottom: 0;
	}
`;

const ExpandLeft = styled.div`
	width: 0.6875em;
	padding: 0.5em;
	background-color: ${theme.colours.signInBackGround};
`;

const ExpandRight = styled.div`
	font-size: 1em;
	font-weight: 400;
	line-height: 1.8125em;
	padding: 0 0.5em;
	a {
		color: ${theme.colours.primary};
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		font-size: 14px;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		overflow-wrap: anywhere;
	}
`;

const Collapsed = styled.span`
	font-family: "Font Awesome 5 Pro";
	font-size: 1.25em;
	color: ${theme.colours.bgDarkPurple};
	vertical-align: middle;
	margin-left: 0.625em;
	i {
		font-weight: bold;
	}
`;

export default class ExpandablePanel extends React.PureComponent {
	state = {
		open: false,
	};

	onClick = (e) => {
		e.preventDefault();
		this.setState({ open: !this.state.open });
	};

	getCollapesedIcon = () => {
		let isOPen = this.state.open;
		let icon = <i className="fal fa-chevron-down"></i>;
		if (isOPen) {
			icon = <i className="fal fa-chevron-up"></i>;
		}
		return icon;
	};

	render() {
		const { faq } = this.props;
		if (!faq) {
			return <></>;
		}
		const open = this.state.open;
		return (
			<Wrap>
				<Header onClick={this.onClick}>
					{faq.title}
					<Collapsed>{this.getCollapesedIcon()}</Collapsed>
				</Header>
				{open ? (
					<ExpandSection>
						<ExpandLeft></ExpandLeft>
						<ExpandRight>{faq.description}</ExpandRight>
					</ExpandSection>
				) : (
					""
				)}
			</Wrap>
		);
	}
}
