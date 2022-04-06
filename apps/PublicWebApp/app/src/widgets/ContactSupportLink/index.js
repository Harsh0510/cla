import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";

const BlueLink = styled.a`
	font-weight: bold;
	color: ${theme.colours.primary};
	background: transparent;
	text-decoration: none;
`;

const SUPPORT_LINK = "https://educationplatform.zendesk.com/hc/en-us/requests/new";

export default function (props) {
	const contactSupportLink = (
		<BlueLink href={SUPPORT_LINK} rel="nofollow" target="_blank">
			{props.linkText ? props.linkText : "contact support"}
		</BlueLink>
	);
	return contactSupportLink;
}
