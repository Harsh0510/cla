import React from "react";
import styled, { css } from "styled-components";
import { Link } from "react-router-dom";
import withPageSize from "../../common/withPageSize";
import theme from "../../common/theme";
import getURLEncodeAsset from "../../common/getURLEncodeAsset";
import { getOrdinalSuffix, getLongFormContributors } from "../../common/misc";
import WorkTitle from "./WorkTitle";
import staticValues from "../../common/staticValues";

const SubTitleLink = styled(Link)`
	text-decoration: none;
	color: ${theme.colours.bgDarkPurple};
	font-size: 0.875em;
	display: block;
	line-height: 1.3em;
	padding-top: 5px;
`;

const WorkAdditionalData = styled.span`
	color: ${theme.colours.grayTextColor};
	font-size: 0.8em;
	display: block;
	padding-top: 5px;
	line-height: 1.3em;
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		font-size: 0.875em;
	}
`;

const AuthorsWrap = withPageSize(styled.div`
	margin-top: 0.1em;
	font-size: 1em;
	line-height: 1.2em;
	padding-top: 5px;
	${(props) =>
		props.breakpoint < withPageSize.TABLET &&
		css`
			font-size: 1em;
		`}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		font-size: 0.875em;
		color: ${theme.colours.bgDarkPurple};
	}
`);

const WrapSection = styled.div`
	display: flex;
	flex-direction: raw;
	width: 100%;
`;

const ContentSection = styled.div`
	width: ${(p) => (p.width ? p.width : "100%")};
`;

const IconSection = styled.div`
	text-align: right;
	display: inline-block;
	width: 50px;
	margin-left: 10px;
`;

export default function WorkResultDescription(props) {
	const asset = props.asset;
	if (!asset) {
		return;
	}
	const assetAuthorsData = asset && asset.authors ? asset.authors : [];
	const authorsData = getLongFormContributors(assetAuthorsData);
	const isShowUnlockWithPadIcon = asset.auto_unlocked && asset.is_unlocked;
	const isShowFullAccessIcon = asset.can_copy_in_full;
	let contentSectionWidth = "100%";
	if (isShowUnlockWithPadIcon && !isShowFullAccessIcon) {
		contentSectionWidth = "calc(100% - 60px)";
	} else if (!isShowUnlockWithPadIcon && isShowFullAccessIcon) {
		contentSectionWidth = "calc(100% - 60px)";
	} else if (isShowUnlockWithPadIcon && isShowFullAccessIcon) {
		contentSectionWidth = "calc(100% - 110px)";
	}
	return (
		<>
			<WrapSection>
				<ContentSection width={contentSectionWidth}>
					{!props.isMobile ? <WorkTitle asset={props.asset} isLoggedIn={props.isLoggedIn} /> : ""}
					{asset.sub_title && <SubTitleLink to={`works/${getURLEncodeAsset(asset)}`}>{asset.sub_title}</SubTitleLink>}

					{asset.content_form === staticValues.assetContentForm.bo ? (
						<>
							{authorsData && authorsData.authors ? <AuthorsWrap name="BookAuthors">{authorsData.authors}</AuthorsWrap> : null}
							{authorsData && authorsData.editors ? (
								<AuthorsWrap name="BookEditors">
									{`Edited by `} {authorsData.editors}
								</AuthorsWrap>
							) : null}
							{authorsData && authorsData.translators ? (
								<AuthorsWrap name="BookTranslators">
									{`Translated by `} {authorsData.translators}
								</AuthorsWrap>
							) : null}
						</>
					) : null}
					<WorkAdditionalData>
						{asset.publisher}. {asset.publication_date ? `Published ${asset.publication_date.slice(0, 4)}.` : ""}{" "}
						{asset.edition > 1 ? `${getOrdinalSuffix(asset.edition)} Edition.` : ""}
					</WorkAdditionalData>
				</ContentSection>
				{isShowUnlockWithPadIcon && (
					<IconSection>
						<img
							src={require("../../assets/icons/unlocked-with-tick.svg")}
							alt={"This title is unlocked for everyone"}
							title={"This title is unlocked for everyone"}
						/>
					</IconSection>
				)}
				{isShowFullAccessIcon && props.isLoggedIn && (
					<IconSection>
						<img
							src={require("../../assets/icons/full-circle.svg")}
							alt={"You can copy all of this title"}
							title={"You can copy all of this title"}
						/>
					</IconSection>
				)}
			</WrapSection>
		</>
	);
}
