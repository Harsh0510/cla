import styled, { css } from "styled-components";
import { colSm6, colXs12 } from "../../common/style";
import theme from "../../common/theme";

export const WrapSmallButton = styled.div`
	${colSm6}
	${colXs12}
	@media screen and (min-width: ${theme.breakpoints.mobileSmall}) {
		${(p) =>
			p.isPaddingLeft === true &&
			css`
				padding-left: 0.25rem;
			`};
		${(p) =>
			p.isPaddingRight === true &&
			css`
				padding-right: 0.25rem;
			`};
	}
`;
