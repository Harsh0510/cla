import React from "react";
import theme from "../../common/theme";
import styled from "styled-components";
import withPageSize from "../../common/withPageSize";

const Wrap = styled.div`
	position: relative;
	border: 5px solid ${theme.colours.flyOutModalPrimary};
	background: rgba(255, 255, 255, 0.5);
	padding: 1em 2em 3em 2em;
	margin-bottom: 1.4em;
	text-align: center;
`;

const Content = styled.div`
	max-width: 23em;
	margin: 0 auto;
`;

const PrimaryIcon = styled.img`
	display: block;
	margin: 0 auto 1em auto;
`;

const Title = styled.h2`
	font-size: 2.25em;
	line-height: 1.2;
	font-weight: bold;
	max-width: 18em;
	margin: 0.5em auto;
`;

const Button = styled.a`
	display: block;
	width: 85%;
	max-width: 15em;
	padding: 0.6em 1.7em;
	background: ${theme.colours.flyOutModalPrimary};
	color: ${theme.colours.white};
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translate(-50%, 50%);
	box-shadow: 5px 5px 8px rgba(0, 0, 0, 0.75);
	font-size: 1.4em;
	&:hover {
		color: ${theme.colours.white};
	}
`;

const TopLeftDecoration = styled.div`
	position: absolute;
	pointer-events: none;
	top: 0;
	left: 0;
	transform: translate(-50%, -50%);
	width: 191px;
	height: 191px;
	background-image: url(${require("../../assets/images/EP_Laptop.png")});
	background-repeat: no-repeat;
	background-position: center;
	background-size: contain;
`;

const BottomRightDecoration = styled.div`
	position: absolute;
	pointer-events: none;
	bottom: 0;
	right: 0;
	transform: translate(50%, 50%);
	width: 151px;
	height: 117px;
	background-image: url(${require("../../assets/images/EP_Book.png")});
	background-repeat: no-repeat;
	background-position: center;
	background-size: contain;
`;

export default withPageSize((props) => {
	const showCornerDecorations = props.breakpoint > withPageSize.MOBILE && props.show_decorations;
	return (
		<Wrap>
			{showCornerDecorations && (
				<>
					<TopLeftDecoration />
					<BottomRightDecoration />
				</>
			)}
			{props.primary_icon && <PrimaryIcon src={props.primary_icon} />}
			{props.title && <Title>{props.title}</Title>}
			<Content>
				{props.children}
				<Button href="#" onClick={props.onPress} {...(props.buttonHtmlAtts || {})}>
					{props.button_text}
				</Button>
			</Content>
		</Wrap>
	);
});
