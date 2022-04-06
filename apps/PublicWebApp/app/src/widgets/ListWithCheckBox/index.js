import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import { Link } from "react-router-dom";

const ListWrap = styled.div`
	list-style-position: outside;
	${(p) =>
		p.isIcon === false &&
		css`
			margin-left: 0.5em;
		`}

	${(p) =>
		p.isIcon === true &&
		css`
			list-style-type: none;
		`}
`;

const CheckIcon = styled.span`
	color: ${theme.colours.primary};
	padding-right: 0.5em;
`;

const Content = styled.div`
	display: flex;
	flex-direction: inherit;
`;

const AnchorLink = styled.a`
	color: ${theme.colours.primary};
	background: transparent;
	text-decoration: none;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		text-decoration: underline;
	}
`;

export default class ListWithCheckBox extends React.PureComponent {
	getList = (item, isIcon, isUrls) => {
		if (isIcon) {
			return (
				<Content>
					<CheckIcon>
						<i className="far fa-check"></i>
					</CheckIcon>
					{/* <CheckIcon><i className="far fa-check-square"></i></CheckIcon>  */}
					<span>{item.name}</span>
				</Content>
			);
		} else if (!isIcon && isUrls) {
			return (
				<AnchorLink href={item.url} title={item.name} target={item.target ? "_blank" : "_self"}>
					{item.name}
				</AnchorLink>
			);
		}
	};

	render() {
		const { options, isIcon, isUrls } = this.props;
		return (
			<ListWrap className="checkbox" isIcon={isIcon}>
				{options.map((item, index) => (
					<li key={index}>{this.getList(item, isIcon, isUrls)}</li>
				))}
			</ListWrap>
		);
	}
}
