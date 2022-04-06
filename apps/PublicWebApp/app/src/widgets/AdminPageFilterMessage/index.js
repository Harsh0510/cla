/**Created wrapper for design the filter message section */
import React from "react";
import styled from "styled-components";
import theme from "../../common/theme";

const SearchText = styled.div`
	height: 50px;
	display: table;
	width: 80%;
	margin-bottom: ${(p) => (p.reduced_padding ? "10" : "20")}px;
	span {
		display: table-cell;
		vertical-align: middle;
	}
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		width: calc(100% - 150px);
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		width: 100%;
	}
`;

export default function SearchFilterMessage(props) {
	return props.children ? (
		<SearchText reduced_padding={props.reduced_padding}>
			<span>{props.children}</span>
		</SearchText>
	) : (
		""
	);
}
