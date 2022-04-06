import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";

const Title = styled.div`
	font-size: 14px;
	font-style: italic;
	padding-top: 0.5rem;
	@media only screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		text-align: right;
	}

	${(p) =>
		p.isExpiredCopy &&
		css`
			opacity: 0.3;
		`}
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

	${(p) =>
		p.isExpiredCopy &&
		css`
			pointer-events: none;
			opacity: 0.3;
		`}
`;

const MediaItem = styled.div`
	margin-left: 5px;
	cursor: pointer;
	padding: 5px;
`;

export default class ScreenView extends React.PureComponent {
	render() {
		return (
			<>
				<Title isExpiredCopy={this.props.isExpiredCopy}>View Mobile or Tablet version:</Title>
				<MediaWrap isExpiredCopy={this.props.isExpiredCopy}>
					<MediaItem>
						<i className="fas fa-mobile-alt" onClick={this.props.showViewModal} title="See mobile view" />
					</MediaItem>
					<MediaItem>
						<i className="fas fa-tablet-alt" onClick={this.props.showViewModal} title="See tablet view" />
					</MediaItem>
				</MediaWrap>
			</>
		);
	}
}
