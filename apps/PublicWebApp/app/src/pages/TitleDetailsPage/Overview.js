import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";

const Container = styled.div`
	box-shadow: ${theme.shadow};
	background-color: ${theme.colours.white};
	padding: 2em 2em;
	margin-right: ${(p) => (p.hasContents ? "1.5em" : "0")};

	@media screen and (min-width: ${theme.breakpoints.tablet}) {
		display: flex;
		width: 100%;
		justify-content: space-between;
		padding: 2em 6em;
	}

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		margin-right: 0;
	}
`;

const StyleSectionText = styled.div`
	h3 {
		margin-top: 2em;
		text-decoration: underline;
		font-weight: bold;
		color: ${theme.colours.primary};
	}
`;

export default function Overview(props) {
	return (
		<Container hasContents={props.hasContents}>
			<StyleSectionText>
				<h3>Overview</h3>
				<div dangerouslySetInnerHTML={{ __html: props.resultData.description }}></div>
			</StyleSectionText>
		</Container>
	);
}
