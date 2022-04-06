import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import Header from "../../widgets/Header";
import date from "../../common/date";
import getThumbnailUrl from "../../common/getThumbnailUrl";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { PageContentLarge } from "../../widgets/Layout/PageContentLarge";
import { PageContentCenter } from "../../widgets/Layout/PageContentCenter";
import setDefaultCoverImage from "../../common/setDefaultCoverImage";

const INVALID_ACCESSCODE = "invalidaccesscode";
const ACCESS_CODE_VALIDATION_MESSSAGE = "Enter a given five digit access code";

const PageWrapper = styled.div`
	min-height: 540px;
	background-color: ${theme.colours.lime};
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		min-height: 0px;
	}
`;

const MainTitleWrap = styled.div`
	padding: 2.5em 0;
	background-color: ${theme.colours.bgDarkPurple};
	color: ${theme.colours.white};

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		padding: 1.5em 0;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		padding: 1em;
	}
`;

const PageHeaderSection = styled.div`
	text-align: center;
	display: flex;
	justify-content: center;
	width: 100%;
	align-items: center;
`;

const PageHeaderIcon = styled.div`
	text-align: center;
	display: inline-block;
	margin-right: 1em;

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		img {
			height: 55px;
		}
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		img {
			height: 40px;
		}
	}
`;

const PageHeaderTitle = styled.div`
	display: inline-block;
`;

const FormTitle = styled.div`
	font-size: 2.375em;
	margin-bottom: 0;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		font-size: 2em;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		font-size: 1.5em;
	}
`;

const AccessContentSection = styled.div`
	padding: 2em 0 6em 0;
	font-size: 1em;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		padding-bottom: 3em;
	}
`;

const LabelBold = styled.div`
	font-weight: bolder;
`;

const ExtractTextContent = styled.div`
	margin: 1em 0 0 0;
`;

const ExtractTextContentBold = styled.div`
	margin: 1em 0 0 0;
	font-weight: bold;
`;

const TextContent = styled.div`
	margin-top: 1em;
	margin-top: 0.5em;
`;

const ExtractContentSection = styled.div`
	width: 100%;
	background-color: ${theme.colours.bgGray};
	display: flex;
	margin: 1em 0 3em 0;
	padding: 20px 10px;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		margin: 1em 0 1.5em 0;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		display: block;
	}
`;

const ContentLeft = styled.div`
	width: 30%;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		width: 100%;
	}
`;

const ContentRight = styled.div`
	width: 70%;
	padding-left: 1em;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		width: 100%;
		padding-top: 1em;
		padding-left: 0;
	}
`;

const ThumbnailImage = styled.div``;

const AccessCodeInput = styled.input`
	display: block;
	padding: 1em;
	background-color: ${theme.colours.white};
	border: 0;
	width: 100%;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		padding: 0.5em;
	}
`;

const AccessCodeValidationMessage = styled.div`
	display: block;
	color: ${theme.colours.red};
	margin-top: 5px;
`;
const Error = styled.div`
	display: block;
	color: ${theme.colours.red};
	margin-top: 1em;
	text-align: left;
	width: 100%;
`;

const Button = styled.button`
	margin-top: 2em;
	padding: 1em;
	text-align: center;
	background-color: ${theme.colours.primary};
	color: ${theme.colours.white};
	border: 0;
	width: 60%;
	cursor: pointer;
	${(p) =>
		p.disabled &&
		css`
			opacity: 0.3;
			pointer-events: none;
		`}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		padding: 0.5em;
		margin-top: 1em;
	}
`;

const WrapRow = styled(Row)`
	justify-content: center;
`;

/**
 * Component for the 'Content Access Page'
 * @extends React.PureComponent
 */
export default class ContentAccess extends React.PureComponent {
	handleOnChangeAccessCode = (e) => {
		this.props.onChangeAccessCode(e.target.value);
	};

	handleSubmitAccessCode = () => {
		this.props.submitAccessCode();
	};

	render() {
		const { pageTitle, data, error, access_validation_message } = this.props;

		return (
			<>
				<HeadTitle title={pageTitle} />
				<Header />
				<MainTitleWrap>
					<Container>
						<WrapRow>
							<PageContentLarge>
								<Row>
									<PageHeaderSection>
										<PageHeaderIcon>
											<img src={require("../../assets/images/key-big-white.png")} />
										</PageHeaderIcon>
										<PageHeaderTitle>
											<FormTitle>Content Access</FormTitle>
										</PageHeaderTitle>
									</PageHeaderSection>
								</Row>
							</PageContentLarge>
						</WrapRow>
					</Container>
				</MainTitleWrap>
				<PageWrapper>
					<Container>
						<WrapRow>
							<PageContentCenter>
								<AccessContentSection>
									<LabelBold>You are trying to access:</LabelBold>
									<ExtractContentSection>
										<ContentLeft>
											<img
												src={getThumbnailUrl(data.work_isbn13)}
												alt={data.work_title}
												title={data.work_titlee}
												width="130"
												onError={setDefaultCoverImage}
											/>
										</ContentLeft>
										<ContentRight>
											<LabelBold>{data.work_title}</LabelBold>
											<ExtractTextContent>
												Class: {data.course_name} <br />
												{date.sqlToNiceFormat(data.date_created)}
											</ExtractTextContent>
											<ExtractTextContentBold>{data.school_name}</ExtractTextContentBold>
										</ContentRight>
									</ExtractContentSection>
									<LabelBold>Please enter your Access Code to access this content</LabelBold>
									<TextContent>Access Code:</TextContent>
									<AccessCodeInput type="password" maxLength={5} minLength={5} required={true} onChange={this.handleOnChangeAccessCode} />
									<AccessCodeValidationMessage>{access_validation_message ? access_validation_message : ""}</AccessCodeValidationMessage>

									<Button disabled={access_validation_message ? true : false} onClick={this.handleSubmitAccessCode}>
										Access
									</Button>
									{error === INVALID_ACCESSCODE ? <Error>Your password is incorrect.</Error> : ""}
								</AccessContentSection>
							</PageContentCenter>
						</WrapRow>
					</Container>
				</PageWrapper>
			</>
		);
	}
}
