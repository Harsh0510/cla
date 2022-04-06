import React from "react";
import styled from "styled-components";
import theme from "../../common/theme";

const ErrorMessage = styled.div`
	background-color: ${theme.colours.messageError};
	color: ${theme.colours.white};
	border-radius: 2.5em;
	text-align: center;
	font-size: 17px;
	margin: 1em 0;
	padding: 0.5em;
`;

export default function FormErrorMessage(props) {
	return (
		<ErrorMessage>
			<i className="fal fa-exclamation-triangle"></i> <span>{props.message}</span>
		</ErrorMessage>
	);
}
