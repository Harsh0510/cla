import React from "react";
import styled from "styled-components";
import theme from "../../common/theme";
import bg1 from "./images/Sign_in_Shape_1.svg";
import bg2 from "./images/Sign_in_Shape_2.svg";

const PageWrapOuter = styled.div`
	max-width: ${theme.siteWidth}px;
	margin: 0 auto;
	padding-left: 0em;
	padding-right: 0em;
`;

const PageWrapInner = styled.div`
	box-sizing: border-box;
	width: 100%;
	box-shadow: ${theme.shadow};
	background-image: url(${bg1});
	background-position: 40% 100%;
	background-repeat: no-repeat;
	background-size: 140%;
	background-color: ${theme.colours.white};
	margin-top: 1.5em;
	margin-bottom: 3em;
`;

const PageWrapInner2 = styled.div`
	padding: ${(props) => (props.padding ? "3em 1em" : 0)};
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	width: 100%;
	background-image: url(${bg2});
	background-position: 50% 100%;
	background-repeat: no-repeat;
	background-size: 140%;
	@media screen and (min-width: ${theme.breakpoints.tablet}) {
		padding-top: ${(props) => (props.padding ? "10em" : 0)};
		padding-bottom: ${(props) => (props.padding ? "10em" : 0)};
	}
`;

export default class PageWrap extends React.PureComponent {
	render() {
		// const { className, ...rest} = this.props;
		return (
			<PageWrapOuter padding={this.props.padding}>
				<PageWrapInner>
					<PageWrapInner2 {...this.props} padding={this.props.padding} />
				</PageWrapInner>
			</PageWrapOuter>
		);
	}
}
