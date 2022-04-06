import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import documentQuerySelectorAll from "../../common/getDocumentQuerySelectorAll";
import staticValues from "../../common/staticValues";
import { col12, colMd6, colLg4, colLg8, card, noGuttersMargin, noGuttersPadding } from "../../common/style";
import { Row } from "../../widgets/Layout/Row";
import { Container } from "../../widgets/Layout/Container";
import { Button } from "../../widgets/Layout/Button";

const Collapsed = styled.span`
	font-family: "Font Awesome 5 Pro";
	font-size: 20px;
	color: ${theme.colours.white};
	vertical-align: middle;
	margin-left: 10px;
	i {
		font-weight: bold;
	}
`;

const AccordionSection = styled.section`
	margin-bottom: 50px;
	position: relative;
	z-index: 9;
	.accordion .card {
		border: 0;
		border-radius: 0;
	}

	.accordion .card .collapse {
		overflow: hidden;
	}

	[class*="CollapseButton-"] {
		font-size: 18px;
		padding: 10px 10px;

		:hover {
			color: ${theme.colours.white};
			background-color: transparent;
			border-color: transparent;
		}
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		display: none;
	}
`;

const CardHeader = styled.div`
	border-bottom: 1px solid ${theme.colours.white};
	padding: 0.75rem 50px;
	@media screen and (max-width: ${theme.breakpoints.desktop2}) {
		padding: 0.75rem 15px;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		padding: 0.2rem 15px;
	}
`;

const CollapseButton = styled(Button)`
	font-weight: bold;
	color: ${theme.colours.white};
	font-size: 18px;
	font-size: 18px;
	pointer-events: ${(props) => (props.isUnlocked ? "auto" : "none")};

	:hover {
		border: 0;
	}
`;

const CardBody = styled.div`
	max-height: 526px;
	min-height: 526px;
	overflow-y: auto;
	padding: 50px 60px;

	ul {
		list-style-type: none;
		margin-top: 0;
		line-height: 1.2;
		text-indent: -0.5em;
		padding-left: 0.5em;
		overflow-x: hidden;
		list-style: none;
	}

	ul > ul {
		list-style-type: none;
		padding-left: 0.5em;
		margin-top: 0.5em;
		padding-bottom: 1rem;
	}

	ul > li > ul {
		width: 100%;
	}

	ul > li .label:after {
		content: ". . . . . . . . . . . . . . . . . . . . " ". . . . . . . . . . . . . . . . . . . . " ". . . . . . . . . . . . . . . . . . . . "
			". . . . . . . . . . . . . . . . . . . . ";
		display: inline-block;
		position: absolute;
		white-space: nowrap;
		padding-left: 0.7em;
	}

	.toc > ul > li,
	.toc > ul > li > ul > li {
		-ms-flex-wrap: wrap;
		flex-wrap: wrap;
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		-webkit-box-pack: justify;
		-ms-flex-pack: justify;
		justify-content: space-between;
	}

	ul > li {
		padding-bottom: 0.3em;
		line-height: 1.2;
		text-indent: -0.5em;
		padding-left: 0.5em;
		position: relative;
		margin-bottom: 4px;
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		-webkit-box-align: flex-end;
		-ms-flex-align: flex-end;
		align-items: flex-end;
		-webkit-box-pack: justify;
		-ms-flex-pack: justify;
		justify-content: space-between;
	}

	ul > li > ul > li {
		display: flex;
		align-items: flex-end;
	}

	.label {
		width: auto;
		display: inline-block;
		position: relative;
		max-width: -webkit-calc(100% - 51px);
		max-width: expression(50% - 100px);
		max-width: -moz-calc(100% - 51px);
		max-width: -o-calc(100% - 51px);
		max-width: calc(100% - 51px);
	}

	.no-page :after {
		content: "" !important;
	}

	.page {
		flex-shrink: 0;
		display: inline-flex;
		text-indent: 0;
		padding-left: 4px;
		text-align: right;
		vertical-align: bottom;
		position: relative;
		background-color: ${theme.colours.smoky};
	}

	* {
		box-sizing: border-box;
	}
	::-webkit-scrollbar {
		width: 10px;
	}
	::-webkit-scrollbar-track {
		background: transparent;
	}
	::-webkit-scrollbar-thumb {
		background: ${theme.colours.lightGray};
		border-radius: 0;
	}
	::-webkit-scrollbar-thumb:hover {
		background: ${theme.colours.lightGray};
	}

	@media screen and (max-width: ${theme.breakpoints.desktop2}) {
		padding: 50px 30px;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		padding: 25px 30px;
	}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding: 0px 0px;
		max-height: none;
	}
`;

const MobileNav = styled.div`
	flex-wrap: nowrap;
	border-bottom: 1px solid ${theme.colours.white};
	cursor: pointer;
	display: none;
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		display: flex;
	}
`;

const Tabs = styled.div`
	width: 50%;
	text-align: center;
	padding: 0.5em;
	font-size: 18px;
	color: ${theme.colours.white};
	background-color: ${(p) => (p.bgColor ? p.bgColor : theme.colours.smoky)};
`;

const TabContent = styled.div`
	display: none;
	color: ${theme.colours.white};
	min-height: 526px;
	padding: 2em;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		${(p) =>
			p.isToc == true &&
			css`
				background-color: ${theme.colours.smoky};
				display: block;
			`}

		${(p) =>
			p.is_overview == false &&
			css`
				background-color: ${theme.colours.bgDarkPurple};
				display: block;
			`}
	}
`;

const CardHeaderWrap = styled.div`
	color: ${theme.colours.white};
	${card}
	background-color: ${theme.colours.smoky};
	border-radius: 0rem;
	border: none;

	[class*="CollapseButton-"] {
		background-color: ${theme.colours.smoky};
		border: none;
	}
`;

const CardWrap = styled.div`
	color: ${theme.colours.white};
	${card}
	border-radius: 0rem;
	background-color: ${theme.colours.bgDarkPurple};

	[class*="CollapseButton-"] {
		background-color: ${theme.colours.bgDarkPurple};
		border: none;
	}
`;

const WrapRow = styled(Row)`
	${noGuttersMargin}
`;

const CardSection = styled.div`
	padding-right: 0;
	padding-left: 0;
	${col12}
	${colMd6}
	${colLg4}
	${noGuttersPadding}
`;

const PreviewSection = styled.div`
	padding-right: 0;
	padding-left: 0;
	${col12}
	${colMd6}
	${colLg8}
	${noGuttersPadding}
`;

const CardHeaderSection = styled.div`
	height: 100%;
`;

export default class AccordianSection extends React.PureComponent {
	state = {
		isExpand: true,
	};

	componentDidMount() {
		let elements = documentQuerySelectorAll("ul > li .page");
		for (let elem of elements) {
			if (elem.innerText === "") {
				elem.parentElement.querySelector(".label").classList.add("no-page");
			}
		}
	}

	doContentVisibility = (e) => {
		e.preventDefault();
		this.setState({ isExpand: !this.state.isExpand });
	};

	getCollapesedIcon = (isCollapsed) => {
		let isUnlocked = this.props.resultData.is_unlocked;
		if (!isUnlocked) {
			return null;
		}
		let icon = (
			<Collapsed>
				<i className="fal fa-chevron-down"></i>
			</Collapsed>
		);
		if (isCollapsed) {
			icon = (
				<Collapsed>
					<i className="fal fa-chevron-up"></i>
				</Collapsed>
			);
		}
		return icon;
	};

	render() {
		const props = this.props;
		const { resultData } = props;
		let hasTableContents = resultData.table_of_contents != null;
		let hasOverviewContent = resultData.description != "" && resultData.description != null;
		let isUnlocked = resultData.is_unlocked;

		return (
			<>
				<AccordionSection>
					<Container>
						<WrapRow>
							<CardSection>
								<CardHeaderSection className="accordion" id="accordionExample">
									<CardHeaderWrap>
										<CardHeader id="headingOne">
											<CollapseButton
												type="button"
												data-toggle="collapse"
												data-target="#collapseOne"
												aria-expanded="false"
												aria-controls="collapseOne"
												onClick={this.doContentVisibility}
												isUnlocked={isUnlocked}
											>
												Table of Contents
												{this.getCollapesedIcon(this.state.isExpand)}
											</CollapseButton>
										</CardHeader>
										<div id="collapseOne" className="" aria-labelledby="headingOne" data-parent="#accordionExample">
											{this.state.isExpand ? (
												<CardBody>
													{hasTableContents ? (
														<div className="toc" dangerouslySetInnerHTML={{ __html: props.resultData.table_of_contents }} />
													) : (
														<div>{staticValues.messages.assetTableOfContentNull}</div>
													)}
												</CardBody>
											) : (
												""
											)}
										</div>
									</CardHeaderWrap>
								</CardHeaderSection>
							</CardSection>
							<PreviewSection>
								<CardHeaderSection className="accordion" id="accordionExample1">
									<CardWrap>
										<CardHeader id="headingOne">
											<CollapseButton
												type="button"
												data-toggle="collapse"
												data-target="#collapseOne"
												aria-expanded="false"
												aria-controls="collapseOne"
												onClick={this.doContentVisibility}
												isUnlocked={isUnlocked}
											>
												Overview
												{this.getCollapesedIcon(this.state.isExpand)}
											</CollapseButton>
										</CardHeader>
										<div id="collapseOne" aria-labelledby="headingOne" data-parent="#accordionExample1">
											{this.state.isExpand ? (
												<CardBody>
													{hasOverviewContent ? (
														<div dangerouslySetInnerHTML={{ __html: props.resultData.description }}></div>
													) : (
														<div>{staticValues.messages.assetOverviewNull}</div>
													)}
												</CardBody>
											) : (
												""
											)}
										</div>
									</CardWrap>
								</CardHeaderSection>
							</PreviewSection>
						</WrapRow>
					</Container>
				</AccordionSection>
				<MobileNav>
					<Tabs onClick={this.doContentVisibility} bgColor={theme.colours.smoky}>
						Table of Contents
					</Tabs>
					<Tabs onClick={this.doContentVisibility} bgColor={theme.colours.bgDarkPurple}>
						Overview
					</Tabs>
				</MobileNav>
				<TabContent isToc={this.state.isExpand}>
					<CardBody>
						{hasTableContents ? (
							<div className="toc" dangerouslySetInnerHTML={{ __html: props.resultData.table_of_contents }} />
						) : (
							<div>{staticValues.messages.assetTableOfContentNull}</div>
						)}
					</CardBody>
				</TabContent>
				<TabContent is_overview={this.state.isExpand}>
					{hasOverviewContent ? (
						<div dangerouslySetInnerHTML={{ __html: props.resultData.description }}></div>
					) : (
						<div>{staticValues.messages.assetOverviewNull}</div>
					)}
				</TabContent>
			</>
		);
	}
}
