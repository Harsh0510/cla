import styled from "styled-components";

import theme from "../../common/theme";

const OrSeparator = styled.div`
	height: 20px;
	position: relative;
	text-align: center;
	line-height: 20px;
	opacity: 0.8;
	margin-top: 1.5em;
	margin-bottom: 1.5em;
	&:before {
		position: absolute;
		top: calc(50% - 1px);
		height: 1px;
		left: 0;
		right: 0;
		background: ${theme.colours.primaryLight};
		content: "";
		display: block;
		opacity: 0.8;
	}
	&:after {
		content: "OR";
		font-weight: bold;
		position: relative;
		display: inline-block;
		padding-left: 1em;
		padding-right: 1em;
		background: ${theme.colours.lime};
	}
`;

export default OrSeparator;
