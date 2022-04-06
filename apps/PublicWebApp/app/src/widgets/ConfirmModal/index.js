import React from "react";
import PropTypes from "prop-types";
import styled, { css } from "styled-components";
import theme from "../../common/theme";

const Wrapper = styled.div`
	font-size: 14px;
	.py-5 {
		padding: 1em;
	}
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(255, 255, 255, 0.8);
	z-index: 9999;
	display: block;
`;

const Main = styled.div`
	position: fixed;
	background: white;
	width: ${(p) => p.modalWidth};
	height: auto;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	max-width: 1300px;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		width: 80%;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		width: 90%;
	}
	box-shadow: 2px 4px 10px 0px ${theme.colours.flyOutShadow};
`;

const Top = styled.div`
	display: block;
	text-align: right;
	margin-bottom: 0.25em;
`;

const CloseButton = styled.button`
	border: 0;
	outline: 0;
	background-color: transparent;
	padding: 0.5em;
	line-height: 1;
	font-size: 0.9em;
	color: ${theme.colours.primaryLight};
`;

const Content = styled.div`
	padding: 1em;
	color: ${theme.colours.black};
	text-align: left;
`;

const Title = styled.h2`
	font-size: 1.5em;
	margin-bottom: 0.4em;
	font-weight: 400;
	line-height: 1.5em;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		font-size: 1.2em;
		line-height: 1.2em;
	}
`;

const SubTitle = styled.div`
	font-size: 1em;
	line-height: 1.3em;
	margin-bottom: 0.4em;
`;

const Description = styled.div`
	font-size: 0.825em;
	line-height: 1.3em;
	margin-bottom: 0.4em;
`;

const Footer = styled.div`
	display: flex;
	justify-content: flex-start;
	width: 100%;
	margin-top: 1.5em;
`;

const Button = styled.button`
	font-size: 1.125em;
	line-height: 1.5em;
	font-weight: 400;
	background-color: ${theme.colours.primaryLight};
	color: ${theme.colours.white};
	border: none;
	text-align: center;
	padding: 0.5rem 1.46rem;
	display: block;
	width: 100%;

	/* ${(props) =>
		props.isNeedBiggerIcon &&
		css`
			i {
				font-size: 1.5em;
				line-height: 1em;
				vertical-align: middle;
			}
		`} */

	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		font-size: 14px;
		line-height: 20px;
		padding: 10px 15px;
		width: auto;
		height: auto;
		display: inline-block;
		vertical-align: middle;
		margin-right: 0;
	}

	@media screen and (max-width: ${theme.breakpoints.mobile7}) {
		font-size: 11px;
		line-height: 14px;
		padding: 8px 16px;
	}
`;

const ButtonIcon = styled.div`
	margin-left: 0.25rem;
`;

const WrapButtonYes = styled.div`
	margin-right: 1rem;
`;

const Children = styled.div`
	font-size: 1em;
	line-height: 1.3em;
	margin-bottom: 0.4em;
`;

class ConfirmModal extends React.PureComponent {
	handleConfirm = () => {
		if (this.props.uniqueId) {
			this.props.onConfirm(this.props.uniqueId);
		} else {
			this.props.onConfirm();
		}
	};

	render() {
		const {
			title = "Are you sure?",
			subTitle = null,
			description = null,
			onClose,
			onConfirm,
			onCancel,
			width = "600px",
			uniqueId = null,
			confirmButtonText = "Yes",
			cancelButtonText = "No",
			children,
		} = this.props;

		return (
			<>
				<Wrapper>
					<Main modalWidth={width}>
						<Content>
							<Top>
								<CloseButton onClick={onClose}>
									<i className="fas fa-times"></i>
								</CloseButton>
							</Top>
							{title ? <Title> {title} </Title> : ""}
							{subTitle ? <SubTitle>{subTitle}</SubTitle> : ""}
							{description ? <Description>{description}</Description> : ""}
							<Children>{children}</Children>
							<Footer>
								<WrapButtonYes>
									<Button onClick={this.handleConfirm}>
										{confirmButtonText} <ButtonIcon className="fal fa-check"></ButtonIcon>
									</Button>
								</WrapButtonYes>
								<div>
									<Button onClick={onCancel}>
										{cancelButtonText} <ButtonIcon className="fal fa-ban"></ButtonIcon>
									</Button>
								</div>
							</Footer>
						</Content>
					</Main>
				</Wrapper>
			</>
		);
	}
}

ConfirmModal.propTypes = {
	title: PropTypes.string, // title
	subTitle: PropTypes.string, // height of bubble
	onClose: PropTypes.func, // onClose callback
	onConfirm: PropTypes.func, // onConfirm callback
	onCancel: PropTypes.func, // onCancel callback
	width: PropTypes.string, // popup width
	uniqueId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default ConfirmModal;
