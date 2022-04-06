import React from "react";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";
import { col6, colLg3, colSm4 } from "../../common/style";
import theme from "../../common/theme";

/** Link Menu */
const RedirectLink = styled.span`
	display: block;
	color: ${theme.colours.headerButtonSearch};
	text-align: center;
	width: ${(p) => (p.width ? p.width : "130px")};
	max-width: 100%;
	margin: 10px auto;
	min-height: 48px;
	font-size: 18px;
	line-height: 24px;
	text-decoration: underline;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		font-size: 16px;
		line-height: 22px;
		min-height: 48px;
	}
`;

const LinkButton = styled.button`
	display: block;
	color: ${theme.colours.headerButtonSearch};
	background-color: transparent;
	border: 0;
	text-align: center;
	width: ${(p) => (p.width ? p.width : "130px")};
	max-width: 100%;
	margin: 10px auto;
	min-height: 48px;
	font-size: 18px;
	line-height: 24px;
	text-decoration: underline;
	:hover {
		text-decoration: none;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		font-size: 16px;
		line-height: 22px;
		min-height: 48px;
	}
`;

const LinkSection = styled(Link)`
	${col6}
	${colSm4}
	${colLg3}
	text-align: center;
	padding: 16px;
	min-height: 220px;
	i {
		font-size: 5.56em;
		width: 110px;
		height: 90px;
	}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		min-height: 200px;
		i {
			font-size: 4.5em;
		}
	}
`;

const ButtonSection = styled.div`
	${col6}
	${colSm4}
	${colLg3}
	padding: 16px;
	text-align: center;
	min-height: 220px;
	i {
		font-size: 5.56em;
		width: 110px;
		height: 90px;
	}
	:hover {
		cursor: pointer;
		i {
			color: ${theme.colours.headerButtonSearch};
		}
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		min-height: 200px;
		i {
			font-size: 4.5em;
		}
	}
`;

export default class LinkIcon extends React.PureComponent {
	render() {
		const {
			linkTitle = "<title>",
			iconClass = "fas fa-user-clock",
			linkTo = "/profile/admin/users",
			isDisplay = true,
			isButtonType = false,
			width = "130px",
		} = this.props;

		if (!isDisplay) {
			return <></>;
		}
		let displayLink = null;
		let displayIcon = <i className={iconClass}></i>;
		if (isButtonType === true) {
			displayLink = (
				<ButtonSection onClick={this.props.onButtonClick}>
					{displayIcon}
					<LinkButton onClick={this.props.onButtonClick} width={width}>
						{linkTitle}
					</LinkButton>
				</ButtonSection>
			);
		} else {
			displayLink = (
				<LinkSection to={linkTo}>
					{displayIcon}
					<RedirectLink width={width}>{linkTitle}</RedirectLink>
				</LinkSection>
			);
		}
		return displayLink;
	}
}
