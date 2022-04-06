import React from "react";
import styled from "styled-components";
import shareExtractBodyContentString from "./shareExtractBodyContentString";
import theme from "../common/theme";

const ClassRoomImageDiv = styled.div`
	position: relative;
	display: block;
	width: auto;
	:after {
		position: absolute;
		opacity: 0;
		transition: all 0.5s;
		-webkit-transition: all 0.5s;
		content: "";
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		background: rgba(0, 0, 0, 0.2);
	}
	:hover:after {
		opacity: 1;
	}
	cursor: pointer;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		width: 40px;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile7}) {
		width: 32px;
		height: 32px;
	}
`;

const ClassRoomImage = styled.img`
	vertical-align: top;
	height: 100%;
`;

const classRoomButtonOptions = {
	theme: "classic",
	size: "32",
	itemtype: "material",
};

function RenderGoogleClassRoomButtonComp(props) {
	const data = props.copiesData[0];
	const classRoomBodyContent = shareExtractBodyContentString(data, props.accessCode);

	let iconSrc;
	const openClassRoomPopup = (e) => {
		e.preventDefault();
		let urlEncodedString = "";
		const params = Object.assign({}, classRoomButtonOptions, {
			url: props.url,
			title: data.title,
			body: classRoomBodyContent,
		});
		for (const key in params) {
			if (params.hasOwnProperty(key)) {
				urlEncodedString += `${key}=${encodeURIComponent(params[key])}&`;
			}
		}
		let popupWidth;
		let popupLeft;
		if (window.innerWidth >= 841) {
			popupWidth = 641; // The width Google's Classroom share javascript API uses.
			popupLeft = 100;
		} else {
			popupLeft = 20;
			popupWidth = window.innerWidth - 40;
		}

		window.open(
			`https://classroom.google.com/share?${urlEncodedString}`,
			"",
			`left=${popupLeft}px,height=400px,toolbar=1,scrollbars=1,menubar=1,location=0,top=100px,resizable=1,width=${popupWidth}px`
		);
	};

	switch (props.iconSize) {
		case 48:
			iconSrc = require("../assets/images/classRoomIcon48Px.png");
			break;
		case 36:
			iconSrc = require("../assets/images/classRoomIcon36Px.png");
			break;
		default:
			iconSrc = require("../assets/images/classRoomIcon32Px.png");
			break;
	}

	return (
		<ClassRoomImageDiv onClick={openClassRoomPopup} title="Share to Google Classroom" data-ga-create-copy="share" data-ga-use-copy="google-classroom">
			<ClassRoomImage src={iconSrc} className="classRoomIcon" />
		</ClassRoomImageDiv>
	);
}

module.exports = {
	classRoomButtonOptions,
	RenderGoogleClassRoomButtonComp,
};
