import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import { col12 } from "../../common/style";
import { Row } from "../../widgets/Layout/Row";
import { Container } from "../../widgets/Layout/Container";

const Wrapper = styled.div`
	width: 90%;
	margin: 0 auto;

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		width: 100%;
	}
`;

const WizardSection = styled.section`
	padding-top: 15px;
	padding-bottom: 15px;

	@media screen and (max-width: ${theme.breakpoints.desktop1}) {
		.step.nav-tabs .wizard_text_book {
			width: 20px;
			height: 20px;
			line-height: 1.5;
		}
		.step.nav-tabs .nav-link .text {
			font-size: 11px;
			padding: 0 3px;
		}
		.step.nav-tabs .nav-link.active .wizard_text_book:before {
			font-size: 11px;
			line-height: 1.8;
		}
	}

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		min-height: 100px;
		.step.nav-tabs .nav-link {
			display: block;
		}
		.step.nav-tabs .nav-link .text {
			position: absolute;
			top: 35px;
			left: 0;
			padding: 0;
			right: 0;
			text-align: center;
			line-height: 1;
		}
		.step.nav-tabs .step-item:first-child .nav-link:after {
			width: 100%;
			right: -36px;
		}
	}

	@media screen and (min-width: ${theme.breakpoints.desktop2}) {
		.step.nav-tabs .wizard_text_book {
			width: 30px;
			height: 30px;
			line-height: 2.2;
		}
		.step.nav-tabs .nav-link .text {
			font-size: 14px;
			padding: 0 5px;
		}
		.step.nav-tabs .nav-link.active .wizard_text_book:before {
			font-size: 14px;
			line-height: 2.2;
		}
	}

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) and (min-width: ${theme.breakpoints.mobile7}) {
		.step.nav-tabs .step-item:first-child .nav-link:after {
			width: 90%;
		}
	}
`;

const StepItem = styled.li`
	flex-basis: 0;
	flex-grow: 1;
	max-width: 100%;

	.nav-link {
		color: ${theme.colours.bgDarkPurple};
		font-size: 14px;
		text-align: center;
		border: 0;
		position: relative;
		z-index: 0;
		padding: 0;
		width: 100%;
		display: flex;
	}
	.nav-link:after {
		content: "";
		display: block;
		height: 5px;
		position: absolute;
		width: 100%;
		background: #d8d8d8;
		bottom: 0;
		left: 0;
		z-index: -1;
		top: 45%;
	}
	.wizard_text_book {
		height: 30px;
		width: 30px;
		background: #d8d8d8;
		display: inline-block;
		border-radius: 100px;
		position: relative;
		margin: auto;
		line-height: 2.2;
		font-weight: bold;
	}
	.nav-link .text {
		text-align: right;
		padding: 0 5px;
		background: #fff;
		font-size: 14px;
		line-height: 2.5;
	}
	:first-child .nav-link:after {
		width: 85%;
		right: 5px;
	}
	:first-child .wizard_text_book {
		margin-left: 0;
	}

	a {
		pointer-events: none;
	}

	@media screen and (max-width: ${theme.breakpoints.laptop}) {
		:first-child .nav-link:after {
			right: 0;
		}
	}

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		:first-child .nav-link:after {
			left: auto;
			width: 100%;
			right: -46px;
		}

		:last-child .nav-link:after {
			width: 50%;
		}
		.nav-link:after {
			top: 35%;
		}
	}

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) and (min-width: ${theme.breakpoints.mobile7}) {
		:first-child .nav-link:after {
			width: 80.5%;
		}
	}

	${(p) =>
		p.selected == true &&
		css`
			.nav-link .wizard_text_book:before {
				content: "\f00c";
				font-family: "Font Awesome 5 Pro";
				color: ${theme.colours.white};
				width: 100%;
				height: 100%;
				background: ${theme.colours.primary};
				border-radius: 100px;
				position: absolute;
				left: 0;
				top: 0;
				right: 0;
			}
			.nav-link:after {
				content: "";
				background: ${theme.colours.primary};
			}
		`}
`;

const WrapRow = styled(Row)`
	justify-content: center;
	align-items: center;
`;

const StepUl = styled.ul`
	display: flex;
	margin-bottom: 0;
	position: relative;
	padding-left: 0;
	list-style: none;
`;

const WrapChildren = styled.div`
	${col12}
`;
export default class StepFlow extends React.PureComponent {
	constructor(props) {
		super(props);
	}

	render() {
		const selectedStep = this.props.selectedStep || 0;

		return (
			<>
				<WizardSection className="wizard_section">
					<Container>
						<Wrapper>
							<WrapRow>
								<WrapChildren>
									<StepUl className="nav nav-tabs step" role="tablist">
										{this.props.steps.map((step, index) => {
											return (
												<StepItem selected={selectedStep > index} key={index}>
													<a href="#" className={step > index ? "nav-link active" : "nav-link"} role="tab" data-toggle="tab">
														<span className="wizard_text_book">{index + 1}</span>
														<span className="text">{step}</span>
													</a>
												</StepItem>
											);
										})}
									</StepUl>
								</WrapChildren>
							</WrapRow>
						</Wrapper>
					</Container>
				</WizardSection>
			</>
		);
	}
}
