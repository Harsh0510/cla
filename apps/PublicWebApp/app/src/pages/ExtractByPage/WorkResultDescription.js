/** Used by Titlesection component */
import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import { getLongFormContributors } from "../../common/misc";
import { create_copy } from "../../common/bookMetaLength";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import date from "../../common/date";
import staticValues from "../../common/staticValues";
import { Link } from "react-router-dom";

const BookText = styled.div`
	color: ${theme.colours.blueMagenta};
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

const BookInfo = styled.div``;

const TitleHeadding = styled.h2`
	font-weight: bold;
	font-size: 20px;
`;

export default function WorkResultDescription(props) {
	const asset = props.asset;
	const authorsData = getLongFormContributors(asset.authors);

	let translator, editor, author, isAuthorBig, isEditorBig, isTranslatorBig;
	const isTitleBig = asset.title.length > create_copy.MAX_TITLE_LENGTH;
	let title = isTitleBig && !props.isTitleFull ? asset.title.substring(0, create_copy.MAX_TITLE_LENGTH) + "..." : asset.title;
	const contentForm = asset.content_form;
	const publication_date = asset && asset.publication_date ? asset.publication_date : null;
	let publisherString =
		asset.publisher +
		"." +
		(publication_date ? ` Published ${publication_date.slice(0, 4)}.` : "") +
		(asset.edition > 1 ? " Edition " + asset.edition : "");
	if (authorsData && authorsData.editors) {
		isEditorBig = authorsData.editors.length > create_copy.MAX_CONTRIBUTOR_LENGTH;
		editor = isEditorBig && !props.isEditorFull ? authorsData.editors.substring(0, create_copy.MAX_CONTRIBUTOR_LENGTH) + "..." : authorsData.editors;
	}
	if (authorsData && authorsData.translators) {
		isTranslatorBig = authorsData.translators.length > create_copy.MAX_CONTRIBUTOR_LENGTH;
		translator =
			isTranslatorBig && !props.isTranslatorFull
				? authorsData.translators.substring(0, create_copy.MAX_CONTRIBUTOR_LENGTH) + "..."
				: authorsData.translators;
	}
	if (authorsData && authorsData.authors) {
		isAuthorBig = authorsData.authors.length > create_copy.MAX_CONTRIBUTOR_LENGTH;
		author = isAuthorBig && !props.isAuthorFull ? authorsData.authors.substring(0, create_copy.MAX_CONTRIBUTOR_LENGTH) + "..." : authorsData.authors;
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
	}

	const isPublisherBig = publisherString.length > create_copy.MAX_PUBLISHER_LENGTH ? true : false;
	const publisher = isPublisherBig && !props.isPublisherFull ? publisherString.substring(0, create_copy.MAX_TITLE_LENGTH) + "..." : publisherString;

	return (
		<BookText isBig={isTitleBig}>
			<div onClick={isTitleBig ? () => props.toggleWidth("title") : null}>
				<Link to={props.urlEncodeAsset ? props.urlEncodeAsset : ""}>
					<TitleHeadding title={asset.title}>
						{title}
						{isTitleBig ? (
							<ChevronTag>
								<FontAwesomeIcon icon={props.isTitleFull ? faChevronUp : faChevronDown} />
							</ChevronTag>
						) : (
							""
						)}
					</TitleHeadding>
				</Link>
			</div>
			<BookInfo isBookTableContent={props.isBookTableContent}>
				<Ptag title={author ? authorsData.authors : ""} onClick={author && isAuthorBig ? () => props.toggleWidth("author") : null}>
					{asset.sub_title}
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
							{`Edited by `} {editor}
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
				<Ptag
					title={translator ? authorsData.translators : ""}
					onClick={translator && isTranslatorBig ? () => props.toggleWidth("translator") : null}
				>
					{translator ? (
						<>
							{`Translated by `} {translator}
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
			</BookInfo>
		</BookText>
	);
}
