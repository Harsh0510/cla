import React from "react";
import styled, { css } from "styled-components";
import date from "../../common/date";
import getPageOffsetObject from "../../common/getPageOffsetObject";
import getPageOffsetString from "../../common/getPageOffsetString";
import { Link } from "react-router-dom";
import theme from "../../common/theme";
import getThumbnailUrl from "../../common/getThumbnailUrl.js";
import AssetDescriptionString from "./AssetDescriptionString.js";
import setDefaultCoverImage from "../../common/setDefaultCoverImage";

const PrintCoverPage = styled.div`
	cursor: default;
	page-break-inside: avoid;
	page-break-after: always;
	text-align: center;
	color: #333333;
	font-size: ${(p) => (p.fontSize ? p.fontSize.toString() : "16px")};
	p {
		text-align: center;
	}
	background-color: #ffffff;
`;

const HeaderLeft = styled.div`
	align-self: flex-end;
	width: 65%;
	text-align: left;
	font-size: 1em;
	font-weight: bold;
	padding: 0.6em 0px 0.9em 1.25em;
	display: flex;
	justify-content: flex-start;
	align-items: center;
`;

const HeaderLeftImage = styled.img`
	width: 3em !important;
	display: inline-block !important;
`;

const HeaderRight = styled.div`
	background: ${theme.colours.primaryLight};
	display: flex !important;
	flex-grow: 1;
`;

const HeaderLeftTitle = styled.div`
	background: transparent;
	margin-top: 0.3em;
	margin-left: 0.5em;
`;

const WrapperHeader = styled.header`
	display: flex;
	flex-wrap: wrap;
	background-color: ${theme.colours.primary};
	color: ${theme.colours.white};
`;

const WrapperContainer = styled.div`
	width: 100%;
	margin: 0 auto;
	display: flex;
	overflow: hidden;
	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		display: flex;
	}
`;

const HeaderLoginSection = styled.div`
	background-color: ${theme.colours.primaryLight};
	position: relative;
	padding: 0.7em 3.25em;
	font-size: 0.9em;
	color: ${theme.colours.white};
	:before,
	:after {
		content: "";
		display: inline-block;
		position: absolute;
		top: 0;
		left: 0;
		border-top: 4.2em solid ${theme.colours.primary};
		border-right: 2em solid transparent;
		z-index: 9;
		@media print and (orientation: landscape) {
			border-top-width: 5.2em;
		}
	}

	:after {
		right: 1em;
		left: auto;
		border-top: 3.2em solid ${theme.colours.primaryLight};
	}
`;

const EduTitleSection = styled.div`
	color: ${theme.colours.primary};
	font-size: 1.2em;
	img {
		width: 15% !important;
		display: inline !important;

		@media print and (orientation: landscape) {
			height: 50px;
			width: auto !important;
			display: inline-block !important;
		}
	}
`;

const CourseTitle = styled.div`
	padding: 1.25em 0.5em 0.5em 0.5em;
	position: relative;
	justify-content: center;
	display: flex;
	background: #3e3a4a;
	color: ${theme.colours.white};

	@media print and (orientation: landscape) {
		padding: 0.6em 0.375em 0em 0.375em;
	}
`;

const BookImage = styled.img``;

const BookImageContainer = styled.div`
	img {
		width: 28% !important;
		display: inline !important;

		@media print and (orientation: landscape) {
			width: 135px !important;
		}
	}
	padding: 1.25em 0;

	@media print and (orientation: landscape) {
		padding: 0.55em 0;
	}
`;

const CoverDetails = styled.div`
	padding: 0em 1em;
	text-align: left;
`;

const BookDescription = styled.div`
	border-top: 0.125em solid;
	padding: 1em 0;
`;

const LicenseText = styled.div`
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		text-align: left;
	}
	a {
		transition: none;
	}
`;

const Th = styled.th`
	font-weight: normal;
`;

const SchoolName = styled.div`
	padding-top: 1em;
`;

const WrapHeading = styled.tr`
	display: none;
`;

export default function CoverPage(props) {
	const data = props.data;
	const dateCreated = date.rawToNiceDate(data.date_created);
	let dateExpired;
	if (data.date_expired) {
		dateExpired = date.rawToNiceDate(data.date_expired);
	}
	const pageOffsetObject = getPageOffsetObject(data);
	const pageOffsetString = getPageOffsetString(data.pages, pageOffsetObject.roman, pageOffsetObject.arabic);
	const pagePrefix = data.pages.length === 1 ? "Page" : "Pages";
	const fontSize = Math.floor(15 * (props.customWidth / 500)).toString() + "px";

	return (
		<PrintCoverPage fontSize={fontSize} className="print-cover-page">
			<WrapperHeader>
				<WrapperContainer>
					<HeaderLeft to="/">
						<div>
							<HeaderLeftImage src={require("./../../assets/images/cla-logo.svg")} alt="CLA" width="34" height="21" />
						</div>
						<HeaderLeftTitle>Copyright Licensing Agency</HeaderLeftTitle>
					</HeaderLeft>
					<HeaderRight>
						<HeaderLoginSection></HeaderLoginSection>
					</HeaderRight>
				</WrapperContainer>
			</WrapperHeader>
			<EduTitleSection className="edu">
				<img src={require("./../../assets/images/edu-platform-logo.svg")} alt="education-plateform" width="70px" />
				<strong>Education Platform</strong>
			</EduTitleSection>
			<CourseTitle>
				<h4>{data.title}</h4>
			</CourseTitle>
			<BookImageContainer>
				<BookImage src={getThumbnailUrl(data.work_isbn13)} alt={data.work_title} width="113" height="143" onError={setDefaultCoverImage} />
			</BookImageContainer>
			<CoverDetails>
				<BookDescription>
					<AssetDescriptionString {...data} />
				</BookDescription>
				<table style={{ width: `100%` }}>
					<tbody>
						<tr>
							<Th>{pagePrefix}:</Th>
							<td>{pageOffsetString}</td>
						</tr>
						<tr>
							<Th>Class:</Th>
							<td>{data.course_name}</td>
						</tr>
						<tr>
							<Th>Institution:</Th>
							<td>{data.school_name}</td>
						</tr>
						<tr>
							<Th>Created by:</Th>
							<td>{data.teacher}</td>
						</tr>
						<tr>
							<Th>Creation date:</Th>
							<td>{dateCreated}</td>
						</tr>
						{dateExpired ? (
							<tr>
								<Th>Licensed until:</Th>
								<td>{dateExpired}</td>
							</tr>
						) : (
							<WrapHeading>
								<Th>Licensed until:</Th>
								<td></td>
							</WrapHeading>
						)}
					</tbody>
				</table>
				<LicenseText>
					Licensed for use under the terms of the CLA Education Licence:{" "}
					<a href="https://www.cla.co.uk/cla-schools-licence" target="_blank">
						https://www.cla.co.uk/cla-schools-licence
					</a>
				</LicenseText>
				<SchoolName>For use only by members of {data.school_name}</SchoolName>
			</CoverDetails>
		</PrintCoverPage>
	);
}
