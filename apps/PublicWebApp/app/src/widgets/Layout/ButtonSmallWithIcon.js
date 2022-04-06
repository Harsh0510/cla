import styled from "styled-components";
import { Button } from "./Button";
import theme from "../../common/theme";

export const ButtonSmallWithIcon = styled(Button)`
	margin-right: 1rem;
	width: 100%;
	justify-content: space-between;
	align-items: center;
	display: flex;
	text-decoration: none;
	color: ${theme.colours.white};
	line-height: 1.2;
	background-color: ${theme.colours.primary};
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		margin-top: 15px;
	}
	i {
		font-size: 22px;
		line-height: 15px;
		color: ${(p) => (p.iconColor ? p.iconColor : theme.colours.white)};
	}
	:hover {
		background-color: ${theme.colours.white};
		color: ${theme.colours.primary};
		i {
			color: ${(p) => (p.iconColor ? p.iconColor : theme.colours.primary)};
		}
	}
`;
