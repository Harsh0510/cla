import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import getURLEncodeAsset from "../../common/getURLEncodeAsset";
import theme from "../../common/theme";
import date from "../../common/date";

const PromptIcon = styled.i`
	width: 45px;
	height: 45px;
	color: ${theme.colours.messageError};
	border: 4px solid ${theme.colours.messageError};
	background: ${theme.colours.white};
	border-radius: 100%;
	text-align: center;
	line-height: 40px;
	font-size: 20px;
	position: absolute;
	left: -16px;
	top: -22px;
`;

const AssetTitle = styled(Link)`
	font-style: italic;
`;

const UnlockLink = styled(Link)`
	font-weight: bold;
	text-decoration: underline;
`;

const ExpirationDate = styled.span`
	font-weight: bold;
`;

export default class TempUnlockAsset extends React.PureComponent {
	render() {
		const dataLength = this.props.data.length;
		return (
			<>
				{this.props.data &&
					this.props.data.length &&
					(this.props.multiple ? (
						<>
							<PromptIcon className="fa fa-exclamation" />
							The following titles need to be fully unlocked to retain access to them; please unlock them if you have the physical book to hand:{" "}
							{this.props.data.map((item, index) => (
								<AssetTitle key={index} to={`works/${getURLEncodeAsset(item)}`}>
									{item.title}
									{index !== dataLength - 1 ? "; " : ""}
								</AssetTitle>
							))}
						</>
					) : (
						<>
							<PromptIcon className="fa fa-exclamation" />
							This title is only temporarily unlocked; please fully <UnlockLink to="/unlock">unlock it</UnlockLink> by{" "}
							<ExpirationDate>{date.rawToNiceDate(this.props.data[0].expiration_date)}</ExpirationDate> to retain access to it at your institution.{" "}
						</>
					))}
			</>
		);
	}
}
