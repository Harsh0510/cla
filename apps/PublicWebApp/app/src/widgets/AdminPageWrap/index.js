import React from "react";
import styled from "styled-components";
import theme from "../../common/theme";
import { Link } from "react-router-dom";
import { col12, colMd6, col6, colMd12 } from "../../common/style";
import { Container } from "../Layout/Container";
import { Row } from "../Layout/Row";
import { ColLarge } from "../Layout/ColLarge";

const Wrapper = styled.div`
	margin-top: 1em;
	background-color: ${theme.colours.white};
`;

const PageTitle = styled.div`
	font-size: 1.375em;
	color: ${theme.colours.headerButtonSearch};
	font-weight: 400;
	line-height: 1em;
	margin-bottom: 15px;
`;

const TopCornerLink = styled(Link)`
	font-weight: regular;
	color: ${theme.colours.primary};
	background: none;
	border: none;
	text-decoration: none;
	i {
		margin-left: 10px;
	}
`;

const WrapRow = styled(Row)`
	justify-content: center;
`;

const PageTitleWrap = styled.div`
	${colMd6}
	${(p) => (p.backURL ? col6 : col12)}
	text-align: left;
`;

const WrapTopCornerLink = styled.div`
	${col6}
	${colMd6}
	text-align: right;
`;

const WrapChildren = styled.div`
	${colMd12}
`;

export default class AdminPageWrap extends React.PureComponent {
	render() {
		const props = this.props;
		const { backURL = null, backTitle = "Back" } = props;
		return (
			<Wrapper id={props.id ? props.id : "AdminWrapperId"}>
				<Container>
					<WrapRow>
						<ColLarge>
							<Row>
								{props.pageTitle ? (
									<PageTitleWrap backURL={backURL}>
										<PageTitle>{props.pageTitle}</PageTitle>
									</PageTitleWrap>
								) : (
									<></>
								)}
								{backURL ? (
									<WrapTopCornerLink>
										<TopCornerLink to={backURL} title="Back">
											{backTitle}
											<i className="fa fa-arrow-left" size="sm" />
										</TopCornerLink>
									</WrapTopCornerLink>
								) : (
									<></>
								)}
								<WrapChildren>{props.children}</WrapChildren>
							</Row>
						</ColLarge>
					</WrapRow>
				</Container>
			</Wrapper>
		);
	}
}
