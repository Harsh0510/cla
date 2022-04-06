import React from "react";
import styled, { css } from "styled-components";
import withPageSize from "../../common/withPageSize";
import getThumbnailUrl from "../../common/getThumbnailUrl";
import setDefaultCoverImage from "../../common/setDefaultCoverImage";

const ThumbnailContainer = styled.figure`
	position: relative;
	margin: 0;
	display: block;
`;

const Thumbnail = styled.img`
	border: 1px solid #eee;
	position: relative;
	max-width: 100%;
	box-sizing: border-box;
	display: block;
`;

const ThumbnailOverlay = styled.div`
	display: block;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.22);
	opacity: 0.5;
`;

const LockIcon = styled.span`
	position: absolute;
	top: 50%;
	left: 50%;
	-webkit-transform: translate(-50%, -50%);
	-ms-transform: translate(-50%, -50%);
	transform: translate(-50%, -50%);
	border-radius: 50%;
	display: block;
	background: #fff;
	width: 43px;
	height: 41px;
`;

const ThumbnailLocked = withPageSize(styled.img`
	margin: 8px 11px;
`);

export default function ThumbnailWrapper(props) {
	const asset = props.asset;
	const asset_title = asset && asset.title ? asset.title : "";

	if (!asset || !asset.pdf_isbn13) {
		return;
	}

	return (
		<ThumbnailContainer>
			<Thumbnail src={getThumbnailUrl(asset.pdf_isbn13)} alt={asset_title} width="100" height="133" onError={setDefaultCoverImage} />
			{!asset.is_unlocked ? (
				<>
					<ThumbnailOverlay />
					<LockIcon>
						<ThumbnailLocked src={require("../../assets/icons/inside_lock.svg")} alt={asset_title} width="20" />
					</LockIcon>
				</>
			) : (
				""
			)}
		</ThumbnailContainer>
	);
}
