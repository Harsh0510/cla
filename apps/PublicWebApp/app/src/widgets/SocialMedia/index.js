import React from "react";
import styled from "styled-components";
import theme from "../../common/theme";
import { FacebookShareButton, TwitterShareButton } from "react-share";

const Title = styled.div`
	font-size: 14px;
	font-style: italic;
	padding-top: 0.5rem;
	@media only screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		text-align: right;
	}
`;

const MediaWrap = styled.div`
	display: flex;
	-webkit-box-pack: end;
	-webkit-justify-content: flex-end;
	-ms-flex-pack: end;
	justify-content: flex-end;
	@media only screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		-webkit-box-pack: end;
		-ms-flex-pack: end;
		justify-content: flex-end;
	}
`;

const MediaItem = styled.div`
	margin-left: 5px;
	cursor: pointer;
	padding: 5px;
`;

const SetColor = styled.div`
	color: ${(p) => (p.colorCode ? p.colorCode : "black")};
`;
const HighlightButtonSection = styled.div``;

export default class SocialMedia extends React.PureComponent {
	render() {
		const { url, fbText, twitterText } = this.props;

		return (
			<>
				<Title>Share this book with social media:</Title>
				<MediaWrap>
					<MediaItem>
						<FacebookShareButton className="network__share-button" url={url} quote={fbText}>
							<SetColor colorCode={theme.colours.fbColor}>
								<i className="fab fa-facebook-f"></i>
							</SetColor>
						</FacebookShareButton>
					</MediaItem>
					<MediaItem>
						<TwitterShareButton className="network__share-button" url={url} title={twitterText}>
							<SetColor colorCode={theme.colours.twitterColor}>
								<i className="fab fa-twitter"></i>
							</SetColor>
						</TwitterShareButton>
					</MediaItem>
				</MediaWrap>
			</>
		);
	}
}
