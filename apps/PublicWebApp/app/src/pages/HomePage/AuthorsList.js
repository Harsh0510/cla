import React from "react";
import styled from "styled-components";
import { getShortFormContributors } from "../../common/misc";

const ItemAuthors = styled.h4`
	margin: 0;
	font-weight: normal;
	font-size: 0.8em;
	font-style: italic;
	line-height: 1.2;
`;

export default function AuthorsList(props) {
	const data = getShortFormContributors(props.authors);
	return (
		<>
			{data && data.authors ? (
				<ItemAuthors>
					{`Authors: `} {data.authors}
				</ItemAuthors>
			) : null}
			{data && data.editors ? (
				<ItemAuthors>
					{`Edited By: `} {data.editors}
				</ItemAuthors>
			) : null}
			{data && data.translators ? (
				<ItemAuthors>
					{`Translated By: `} {data.translators}
				</ItemAuthors>
			) : null}
		</>
	);
}
