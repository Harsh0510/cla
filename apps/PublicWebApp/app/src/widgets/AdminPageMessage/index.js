/**Created wrapper for design the message section for api result*/
import React from "react";
import styled from "styled-components";
import theme from "../../common/theme";

const MessageString = styled.div`
	width: 100%;
	text-align: left;
	margin: 10px 0;
	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		margin: 8px 0 20px;
	}
`;

export default function AdminPageMessage(props) {
	return props.children ? <MessageString> {props.children} </MessageString> : "";
}
