import styled from "styled-components";
import theme from "../../common/theme";
import { Link } from "react-router-dom";

const UnlockButton = styled(Link)`
	background-color: ${theme.colours.secondary};
	color: ${theme.colours.white};
	display: block;
	text-align: center;
	text-decoration: none;
	padding: 1.25em 0;
	width: 100%;
	border-radius: 2px;
	font-weight: 500;
	letter-spacing: 0.1ch;
`;

export default UnlockButton;
