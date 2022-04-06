/**Edit Link style component that applied in table as edit link */
import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import { Link } from "react-router-dom";

/** Table data style components*/
const TableEditLink = styled(Link)`
	color: ${theme.colours.headerButtonSearch};
	${(p) =>
		p.disable &&
		css`
			opacity: 0.3;
			pointer-events: none;
		`};
`;

export default TableEditLink;
