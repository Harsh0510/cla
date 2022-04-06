/** Used by Titlesection component */
import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import { getLongFormContributors } from "../../common/misc";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { HeadTitle } from "../../widgets/HeadTitle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { content_detail } from "../../common/bookMetaLength";
import date from "../../common/date";
import staticValues from "../../common/staticValues";

library.add(faStar);

const BookText = styled.div`
	color: ${theme.colours.blueMagenta};
	position: relative;
	z-index: 15;
	h2 {
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: 18px;
		position: relative;
		top: 0;
		right: 0;
		padding-right: 20px;
		margin-bottom: 0.2em;
		line-height: 1.3;

		${(p) =>
			p.isBig &&
			css`
				cursor: pointer;
			`}
	}
	h2 span {
		position: absolute;
		top: 5px;
		right: 0;
		font-size: 15px;
	}
	${(p) =>
		p.isMobile === true &&
		css`
			font-size: 0.875em;
		`}
`;

const ChevronTag = styled.span`
	position: relative;
	display: flex;
`;

const Ptag = styled.p`
	font-size: 14px;
	position: relative;
	padding-right: 20px;
	margin-bottom: 0;
	${(p) =>
		!!p.onClick &&
		css`
			cursor: pointer;
		`}
	span {
		position: absolute;
		top: 5px;
		right: 0;
		font-size: 15px;
	}
`;

const TilteHeading = styled.h2`
	font-weight: bold;
	font-size: 20px;
`;

export default function WorkResultDescription(props) {
	const asset = props.asset;
	let editor, author, translator, isAuthorBig, isEditorBig, isTranslatorBig;
	const isTitleBig = asset.title.length > content_detail.MAX_TITLE_LENGTH;
	const authorsData = getLongFormContributors(asset.authors);
	const title = isTitleBig && !props.isTitleFull ? asset.title.substring(0, content_detail.MAX_TITLE_LENGTH) + "..." : asset.title;
	const contentForm = asset.content_form;
	const publication_date = asset && asset.publication_date ? asset.publication_date : null;
	let publisherString =
		asset.publisher +
		"." +
		(publication_date ? ` Published ${publication_date.slice(0, 4)}.` : "") +
		(asset.edition > 1 ? " Edition " + asset.edition : "");
	if (authorsData && authorsData.editors) {
		isEditorBig = authorsData.editors.length > content_detail.MAX_CONTRIBUTOR_LENGTH;
		editor =
			isEditorBig && !props.isEditorFull ? authorsData.editors.substring(0, content_detail.MAX_CONTRIBUTOR_LENGTH) + "..." : authorsData.editors;
	}
	if (authorsData && authorsData.translators) {
		isTranslatorBig = authorsData.translators.length > content_detail.MAX_CONTRIBUTOR_LENGTH;
		translator =
			isTranslatorBig && !props.isTranslatorFull
				? authorsData.translators.substring(0, content_detail.MAX_CONTRIBUTOR_LENGTH) + "..."
				: authorsData.translators;
	}
	if (authorsData && authorsData.authors) {
		isAuthorBig = authorsData.authors.length > content_detail.MAX_CONTRIBUTOR_LENGTH;
		author =
			isAuthorBig && !props.isAuthorFull ? authorsData.authors.substring(0, content_detail.MAX_CONTRIBUTOR_LENGTH) + "..." : authorsData.authors;
	}
	//check if the asset contact form is magazine
	if (contentForm === staticValues.assetContentForm.mi) {
		publisherString =
			asset.publisher +
			"." +
			(publication_date ? ` Published ${date.sqlToFullMonthYearFormat(publication_date)}.` : "") +
			(asset.edition > 1 ? " Edition " + asset.edition : "");
		author = "";
		editor = "";
		translator = "";
	}

	const isPublisherBig = publisherString.length > content_detail.MAX_PUBLISHER_LENGTH ? true : false;
	const publisher =
		isPublisherBig && !props.isPublisherFull ? publisherString.substring(0, content_detail.MAX_TITLE_LENGTH) + "..." : publisherString;

	const moreDetail = (
		<>
			<Ptag title={author ? authorsData.authors : ""} onClick={author && isAuthorBig ? () => props.toggleWidth("author") : null}>
				{author ? (
					<>
						{author}
						{isAuthorBig ? (
							<ChevronTag>
								<FontAwesomeIcon icon={props.isAuthorFull ? faChevronUp : faChevronDown} />
							</ChevronTag>
						) : (
							""
						)}
					</>
				) : (
					""
				)}
			</Ptag>
			<Ptag title={editor ? authorsData.editors : ""} onClick={editor && isEditorBig ? () => props.toggleWidth("editor") : null}>
				{editor ? (
					<>
						{`Edited by `}
						{editor}
						{isEditorBig ? (
							<ChevronTag>
								<FontAwesomeIcon icon={props.isEditorFull ? faChevronUp : faChevronDown} />
							</ChevronTag>
						) : (
							""
						)}
					</>
				) : (
					""
				)}
			</Ptag>
			<Ptag title={translator ? authorsData.translators : ""} onClick={translator && isTranslatorBig ? () => props.toggleWidth("translator") : null}>
				{translator ? (
					<>
						{`Translated by `}
						{translator}
						{isTranslatorBig ? (
							<ChevronTag>
								<FontAwesomeIcon icon={props.isTranslatorFull ? faChevronUp : faChevronDown} />
							</ChevronTag>
						) : (
							""
						)}
					</>
				) : (
					""
				)}
			</Ptag>
			<Ptag title={publisherString} onClick={isPublisherBig ? () => props.toggleWidth("publisher") : null}>
				{publisher}
				{isPublisherBig ? (
					<ChevronTag>
						<FontAwesomeIcon icon={props.isPublisherFull ? faChevronUp : faChevronDown} />
					</ChevronTag>
				) : (
					""
				)}
			</Ptag>
		</>
	);
	return (
		<>
			<HeadTitle title={"Education Platform title information: " + asset.title} hideSuffix={true} />
			<BookText isMobile={props.isMobile} isBig={isTitleBig}>
				<div onClick={isTitleBig ? () => props.toggleWidth("title") : null}>
					<TilteHeading title={asset.title}>
						{title}
						{isTitleBig ? (
							<ChevronTag>
								<FontAwesomeIcon icon={props.isTitleFull ? faChevronUp : faChevronDown} />
							</ChevronTag>
						) : (
							""
						)}
					</TilteHeading>
				</div>
				{moreDetail}
			</BookText>
		</>
	);
}
