import React from "react";
import styled, { css } from "styled-components";
import { Link } from "react-router-dom";
import theme from "../../common/theme";
import { colXl8 } from "../../common/style";
import { Container } from "../Layout/Container";
import { Row } from "../Layout/Row";
import { ColLarge } from "../Layout/ColLarge";

const WizardSection = styled.section`
	padding-top: 15px;
	padding-bottom: 15px;

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		.step.nav-tabs .wizard_text_book {
			width: 20px;
			height: 20px;
			line-height: 1.5;
		}
		.step.nav-tabs .nav-link .text {
			font-size: 11px;
			padding: 0 5px;
		}
		.step.nav-tabs .nav-link.active .wizard_text_book:before {
			font-size: 11px;
			line-height: 1.8;
		}
	}

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
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
		${(p) =>
			p.isTextDisplay === false &&
			css`
				.step.nav-tabs .nav-link .text {
					display: none;
				}
			`}
		${(p) =>
			p.isTextDisplay === true &&
			css`
				.step.nav-tabs .nav-link:after {
					display: none;
				}
			`}
	}

	@media screen and (width: ${theme.breakpoints.mobileLarge}) {
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

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) and (min-width: ${theme.breakpoints.mobile7}) {
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
		padding: 0 10px;
		background: #fff;
		font-size: 14px;
		line-height: 2.5;
	}
	:first-child .nav-link:after {
		width: 75%;
		left: auto;
		right: 5px;
	}

	a {
		pointer-events: none;
	}

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		:first-child .nav-link:after {
			right: 0;
		}
	}

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		:first-child .nav-link:after {
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

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) and (min-width: ${theme.breakpoints.mobile7}) {
		:first-child .nav-link:after {
			width: 90%;
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
				background: #006473;
				border-radius: 100px;
				position: absolute;
				left: 0;
				top: 0;
				right: 0;
			}
			.nav-link:after {
				content: "";
				background: #006473;
			}
		`}
`;

const IconWrap = styled.div`
	visibility: hidden;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		position: absolute;
		top: 1px;
		right: 0;
		padding-right: 0.875em;
		color: ${theme.colours.primary};
		${(p) =>
			p.step === 1 &&
			css`
				visibility: visible;
			`};
	}
`;

const IconLink = styled.div`
	cursor: pointer;
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

const WrapChildren = styled(ColLarge)`
	${colXl8}
`;
export default class WizardExtract extends React.PureComponent {
	constructor(props) {
		super(props);
	}

	handleClick = (e) => {
		e.preventDefault();
		if (this.props.doToggelWizard) {
			this.props.doToggelWizard(!this.props.isTextDisplay);
		}
	};

	render() {
		const step = this.props.step || 0;
		const unlocked = this.props.unlocked || false;

		return (
			<>
				<WizardSection className="wizard_section" isTextDisplay={this.props.isTextDisplay}>
					<Container>
						<WrapRow>
							<WrapChildren>
								<StepUl className="nav nav-tabs step" role="tablist">
									<StepItem selected={step > 0 && unlocked}>
										<a href="#" className={step > 0 ? "nav-link active" : "nav-link"} role="tab" data-toggle="tab">
											<span className="wizard_text_book">1</span>
											<span className="text">Unlock Content</span>
										</a>
									</StepItem>
									<StepItem selected={step > 1 && unlocked}>
										<a href="#" className={step > 1 ? "nav-link active" : "nav-link"} role="tab" data-toggle="tab">
											<span className="wizard_text_book">2</span>
											<span className="text">Select Class</span>
										</a>
									</StepItem>
									<StepItem selected={step > 2 && unlocked}>
										<a href="#" className={step > 2 ? "nav-link active" : "nav-link"} role="tab" data-toggle="tab">
											<span className="wizard_text_book">3</span>
											<span className="text">Select Pages</span>
										</a>
									</StepItem>
									<StepItem selected={step > 3 && unlocked}>
										<a href="#" className={step > 3 ? "nav-link active" : "nav-link"} role="tab" data-toggle="tab">
											<span className="wizard_text_book">4</span>
											<span className="text">Confirm</span>
										</a>
									</StepItem>
								</StepUl>
								<IconWrap step={step}>
									<IconLink title="open" onClick={this.handleClick}>
										{this.props.isTextDisplay ? <i className="fas fa-times"></i> : <i className="far fa-info-circle"></i>}
									</IconLink>
								</IconWrap>
							</WrapChildren>
							{/* <div className="col-2 col-lg-10 col-xl-2">	<i className="fal fa-info font-sm ml-2"></i></div> */}
						</WrapRow>
					</Container>
				</WizardSection>
			</>
		);
	}
}
