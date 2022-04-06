import React from "react";
import styled, { css } from "styled-components";
import withPageSize from "../../common/withPageSize";
import { Link } from "react-router-dom";
import theme from "../../common/theme";
import getURLEncodeAsset from "../../common/getURLEncodeAsset";

const Wrap = styled.span`
	font-size: 1.125em;
	line-height: 1.1;
`;

const TitleLink = withPageSize(styled(Link)`
	text-decoration: none;
	color: ${theme.colours.primaryLight};
	${(props) =>
		props.breakpoint < withPageSize.TABLET &&
		css`
			font-size: 1em;
		`};
`);

//For redirecting to extract by page when user click on fragment title or make a new copy
function urlEncodeFragment(asset, isRedirectToExtractPage) {
	if (isRedirectToExtractPage && asset.is_unlocked) {
		return asset.pdf_isbn13 + "/extract?startPage=" + asset.fragments[0].start_page;
	} else {
		return getURLEncodeAsset(asset);
	}
}

export default class WorkTitle extends React.PureComponent {
	render() {
		const asset = this.props.asset;
		const titlePart = (
			<TitleLink name="DesktopBookTitle" to={`works/${urlEncodeFragment(asset, false)}`}>
				{asset.title}
			</TitleLink>
		);
		const prefixPart = (() => {
			if (Array.isArray(asset.fragments)) {
				if (asset.fragments.length === 1) {
					return (
						<TitleLink name="DesktopBookTitle" to={`works/${urlEncodeFragment(asset, this.props.isLoggedIn)}`}>
							<i>{this.props.asset.fragments[0].title}</i>
							<span style={{ color: theme.colours.black }}> in </span>
						</TitleLink>
					);
				} else if (asset.fragments.length > 1) {
					return <span>Articles matching your search in&nbsp;</span>;
				}
			}
			return null;
		})();
		return (
			<Wrap>
				{prefixPart}
				{titlePart}
			</Wrap>
		);
	}
}
