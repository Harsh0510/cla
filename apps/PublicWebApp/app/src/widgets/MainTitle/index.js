import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import { Container } from "../Layout/Container";
import { Row } from "../Layout/Row";
import { PageContentMedium } from "../Layout/PageContentMedium";
import { PageContentLarge } from "../Layout/PageContentLarge";
import { PageLeftIconContent } from "../Layout/PageLeftIconContent";

const MainTitleWrap = styled.div`
	padding: 20px 0 20px;
	background-color: ${theme.colours.bgDarkPurple};
	color: ${theme.colours.white};
`;

const IconWrap = styled.div`
	height: 63px;
	width: 63px;
	line-height: 63px;
	text-align: center;
	background-color: white;
	color: ${theme.colours.bgDarkPurple};
	border-radius: 50%;

	i {
		font-size: 38px;
		vertical-align: middle;
	}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		height: 40px;
		width: 40px;
		line-height: 40px;
		i {
			font-size: 25px;
		}
	}
`;

const MainTitleText = styled(PageContentLarge)`
	font-size: 16px;

	h1 {
		font-size: 38px;
		line-height: 1.2;
		margin-top: 9px;
		margin-bottom: 0;
		@media screen and (max-width: ${theme.breakpoints.mobile}) {
			font-size: 25px;
			margin-top: 0.5em;
			line-height: 1.2em;
		}
	}
`;

const WrapRow = styled(Row)`
	justify-content: center;
`;

export default function MainTitle(props) {
	return (
		<MainTitleWrap id={props.id ? props.id : "titleWrapperId"}>
			<Container>
				<WrapRow>
					<PageContentMedium>
						<Row>
							<PageLeftIconContent>
								<IconWrap>
									<i className={`far ${props.icon}`}></i>
								</IconWrap>
							</PageLeftIconContent>
							<MainTitleText>
								<h1>{props.title}</h1>
							</MainTitleText>
						</Row>
					</PageContentMedium>
				</WrapRow>
			</Container>
		</MainTitleWrap>
	);
}
