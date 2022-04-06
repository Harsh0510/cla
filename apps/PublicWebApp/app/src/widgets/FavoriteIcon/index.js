import React from "react";
import styled from "styled-components";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartEmpty } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import theme from "../../common/theme";

library.add(faHeart);
library.add(faHeartEmpty);

const Wrap = styled.div`
	color: ${theme.colours.favIconTextColor};
	cursor: pointer;
	& > svg {
		display: block;
	}
`;

export default class FavoriteIcon extends React.PureComponent {
	onClick = (e) => {
		e.preventDefault();
		this.props.onClick(this.props.data);
	};
	render() {
		const props = this.props;
		return (
			<Wrap onClick={this.onClick} title={props.is_favorite ? "Remove this book from your favourites" : "Add this book to your favourites"}>
				<FontAwesomeIcon icon={props.is_favorite ? faHeart : faHeartEmpty} />
			</Wrap>
		);
	}
}
