import React from "react";
import styled from "styled-components";
import theme from "../../common/theme";
import messageType from "../../common/messageType";

const ErrorMessage = styled.div`
	background-color: ${(p) => (p.bgColor ? p.bgColor : theme.colours.messageWarning)};
	color: ${(p) => (p.fgColor ? p.fgColor : theme.colours.fgColorWarning)};
	border-radius: 0.5em;
	font-size: 17px;
	padding: 1em 1em;
	display: flex;
	line-height: 1.2em;
	align-items: center;
	text-align: center;
	min-height: 5em;
	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		margin: 0;
		padding: 1em 0 0 0.6em;
		span {
			margin: -18px 0px 0px 0px;
		}
	}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding: 1em 1em 0 0.6em;
		span {
			margin: -18px 0px 0px 0px;
		}
	}
	a {
		color: ${(p) => (p.fgColor ? p.fgColor : theme.colours.fgColorWarning)};
		font-weight: 600;
	}
`;

const Icon = styled.span`
	flex-shrink: 0;
`;

const StyledText = styled.div`
	padding: 0 0.3em;
	justify-content: center;
	word-break: break-word;
	flex: 1;
	text-align: center;
	h3 {
		justify-content: center;
		flex-direction: column;
		width: 100%;
		color: ${theme.colours.primaryDark};
		@media screen and (max-width: ${theme.breakpoints.tablet}) {
			text-align: center;
		}
	}
	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		align-items: center;
		margin-bottom: 1em;
		width: 100%;
	}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		margin-bottom: 0.5em;
	}
`;

const MessageText = styled.div`
	font-weight: normal;
	font-size: 16px;
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		margin-top: -0.5em;
	}
`;

export default function MessageBox(props) {
	const { type, message, title, displayIcon = true, children } = props;
	let bgColor, fgColor, messageIcon;

	switch (type) {
		case messageType.warning:
			bgColor = theme.colours.messageWarning;
			fgColor = theme.colours.fgColorWarning;
			break;
		case messageType.error:
			bgColor = theme.colours.messageError;
			fgColor = theme.colours.white;
			break;
		case messageType.success:
			bgColor = theme.colours.primary;
			fgColor = theme.colours.white;
			break;
		case messageType.confirmed:
			bgColor = theme.colours.bgDarkPurple;
			fgColor = theme.colours.white;
			break;
		default:
			bgColor = theme.colours.messageWarning;
			fgColor = theme.colours.fgColorWarning;
	}

	switch (type) {
		case messageType.warning:
			messageIcon = <i className="fal fa-exclamation-triangle"></i>;
			break;
		case messageType.error:
			messageIcon = <i className="fal fa-exclamation-triangle"></i>;
			break;
		case messageType.success:
			messageIcon = <i className="fa fa-check" aria-hidden="true"></i>;
			break;
		default:
			messageIcon = <i className="fal fa-exclamation-triangle"></i>;
	}

	return (
		<ErrorMessage bgColor={bgColor} fgColor={fgColor}>
			{displayIcon ? <Icon>{messageIcon}</Icon> : ""}
			<StyledText>
				{title && <h4>{title}</h4>}
				{message && <MessageText>{message}</MessageText>}
				{children}
			</StyledText>
		</ErrorMessage>
	);
}
