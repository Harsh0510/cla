import React from "react";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTimes, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import getThumbnailUrl from "../../common/getThumbnailUrl";
import date from "../../common/date";
import setDefaultCoverImage from "../../common/setDefaultCoverImage";

/** Table data style components*/
const TableData = styled.div`
	border: 1px solid red;
`;

const Table = styled.table`
	width: 100%;
	text-align: center;
`;
const Tr = styled.tr`
	color: ${theme.colours.primary};
	background-color: ${theme.colours.bgTableRow};
	:nth-child(even) {
		background-color: ${theme.colours.bgTableRowEvent};
	}
`;

const Td = styled.td`
	border-left: 1px solid #ccc;
	border-bottom: 1px solid #ccc;
	padding: 8px;
	align-items: center;
`;

const Th = styled.th`
	border: 1px solid #ccc;

	font-weight: normal !important;
	font-size: 14px;
`;

const Wraper = styled.div`
	display: flex;
	align-items: center;
`;
const ItemImage = styled.img`
	display: flex;
	width: 50px;
	height: 60px;
	border: 1px solid gray;
`;

const BookTitle = styled.label`
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: pre;
	margin-left: 8px;
`;

const ExtractListing = (p) => {
	const { extract } = p;
	const lastAuthorIndex = extract.work_authors.length - 1;
	return (
		<Tr>
			<Td>
				<Wraper>
					<ItemImage src={getThumbnailUrl(extract.work_isbn13)} alt={extract.work_title} onError={setDefaultCoverImage} />
					<BookTitle> {extract.work_title}</BookTitle>
				</Wraper>
			</Td>
			<Td>{extract.title} </Td>
			<Td>
				{" "}
				{extract.work_authors.map((item, idx) => (
					<span key={item}> {extract.firstName + " " + extract.lastName} </span>
				))}{" "}
			</Td>
			<Td>{extract.date_created.slice(0, 4)} </Td>
			<Td> {extract.course_name}</Td>
			<Td>{extract.page_count} </Td>
			<Td> {date.sqlToNiceFormat(extract.date_created)}</Td>
			<Td>{extract.status} </Td>
			<Td>
				{" "}
				<Link to={`/profile/management/${extract.oid}`}>
					<FontAwesomeIcon icon={faLink} />{" "}
				</Link>
			</Td>
		</Tr>
	);
};

export default ExtractListing;
