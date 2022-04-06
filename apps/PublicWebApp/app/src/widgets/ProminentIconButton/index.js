import React from "react";
import styled from "styled-components";

import theme from "../../common/theme";

const Wrap = styled.a`
	display: flex;
	border: 1px solid ${theme.colours.primaryLight};
`;

const ImageWrap = styled.div`
	flex-shrink: 0;
	width: 5em;
	background: ${theme.colours.white};
	padding: 0.75em 1em;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const Image = styled.img`
	display: block;
	width: 48px;
	height: 15px;
`;

const Text = styled.div`
	flex: 1;
	display: flex;
	padding: 0.6em 1em;
	color: ${theme.colours.white};
	background: ${theme.colours.primaryLight};
	font-size: 1.2em;
	line-height: 1;
	align-items: center;
`;

const TextInner = styled.div`
	margin-top: ${(p) => p.verticalOffset || "0"};
`;

const Tooltip = styled.div`
	flex-shrink: 0;
	width: 1.8em;
	font-size: 1.2em;
	background: ${theme.colours.primaryLight};
	color: ${theme.colours.white};
	display: flex;
	text-align: center;
	align-items: center;
	justify-content: center;
	line-height: 1;
`;

const ProminentIconButton = (props) => {
	return (
		<Wrap href={props.href}>
			<ImageWrap>
				<Image src={props.image} />
			</ImageWrap>
			<Text>
				<TextInner verticalOffset={props.verticalOffset}>{props.children}</TextInner>
			</Text>
			{props.tooltip && (
				<Tooltip title={props.tooltip}>
					<i className="fas fa-info-circle" />
				</Tooltip>
			)}
		</Wrap>
	);
};

export default ProminentIconButton;
