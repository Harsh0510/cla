import React from "react";
import styled from "styled-components";
import teams_image from "../assets/images/teams.svg";
import theme from "../common/theme";
//if we need to use same text as per google class room than use below function
//import shareExtractBodyContentString from "./shareExtractBodyContentString";import shareExtractBodyContentString from "./shareExtractBodyContentString";

const TeamsImageDiv = styled.div`
	position: relative;
	display: block;
	width: auto;
	left: 2px;
	height: 100%;
	vertical-align: middle;
	padding-top: 2px;
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

const TeamsImage = styled.img`
	height: ${(p) => (p.size ? p.size : "30px")};
`;

const classRoomButtonOptions = {
	theme: "classic",
	size: "32",
	itemtype: "material",
};

function RenderTeamsButtonComp(props) {
	const data = props.copiesData[0];

	let accessCodeText = null;
	if (props.accessCode) {
		accessCodeText = `For this copy you will also need the access code: ${props.accessCode}\n`;
	} else {
		accessCodeText = "";
	}
	const classRoomBodyContent = `${
		accessCodeText ? accessCodeText : ""
	}For use under the terms of: https://www.cla.co.uk/cla-schools-licence only by members of ${data.school_name}`;

	const openTeamsPopup = (e) => {
		e.preventDefault();
		let urlEncodedString = "";
		const title = data.title;
		const assignTitle = title.length > 50 ? title.substring(0, 47) + "..." : title;
		const assignInstr = classRoomBodyContent.length > 200 ? classRoomBodyContent.substring(0, 197) + "..." : classRoomBodyContent;
		const params = Object.assign({}, classRoomButtonOptions, {
			href: props.url,
			assignTitle: assignTitle,
			assignInstr: assignInstr,
			msgText: accessCodeText,
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
			`https://teams.microsoft.com/share?${urlEncodedString}`,
			"",
			`left=${popupLeft}px,height=400px,toolbar=1,scrollbars=1,menubar=1,location=0,top=100px,resizable=1,width=${popupWidth}px`
		);
	};

	return (
		<TeamsImageDiv onClick={openTeamsPopup} title="Share to Teams" data-ga-create-copy="share" data-ga-use-copy="teams">
			<TeamsImage size={props.iconSize} src={teams_image} className="classRoomIcon" />
		</TeamsImageDiv>
	);
}

module.exports = {
	classRoomButtonOptions,
	RenderTeamsButtonComp,
};
