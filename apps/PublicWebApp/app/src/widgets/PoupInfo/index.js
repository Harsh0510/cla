import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import { Link } from "react-router-dom";

const WrapModel = styled.div`
	.modal {
		position: initial;
		top: 0;
		left: 0;
		max-width: 100%;
		max-height: 100%;
		background: transparent;
		z-index: 9999;
		.modal-main {
			position: absolute;
			background: white;
			width: 60%;
			height: auto;
			transform: translate(-50%, -50%);
			border: 1px solid #c0c0c0;
			z-index: 9999;
			padding: 1em;
			@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
				width: 90%;
				padding: 0.8em;
				left: 50%;
			}
		}
	}

	.display-block {
		display: block;
	}

	.display-none {
		display: none;
	}
`;

const CloseButton = styled.button`
	font-size: 7px;
	right: -10px;
	top: -8px;
	background-color: ${theme.colours.bgDarkPurple};
	color: ${theme.colours.white};
	border-radius: 50%;
	position: absolute;
	border-color: ${theme.colours.bgDarkPurple};
	border: 2px solid ${theme.colours.bgDarkPurple};
	vertical-align: middle;
	text-align: center;
	line-height: 0.2em;
	height: 19px;
	width: 19px;
	padding: 0;
`;

const ModalBody = styled.div`
	padding: 0 0.5em;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding: 0 0.5em;
	}
`;

const ModalSection = styled.section`
	position: relative;
`;

export default class PoupInfo extends React.PureComponent {
	render() {
		const { handleClose, show, children } = this.props;
		const showHideClassName = show ? "modal display-block" : "modal display-none";

		return (
			<WrapModel>
				<div className={showHideClassName}>
					<ModalSection className="modal-main">
						<CloseButton onClick={handleClose}>
							<i className="fas fa-times"></i>
						</CloseButton>
						<ModalBody>{children}</ModalBody>
					</ModalSection>
				</div>
			</WrapModel>
		);
	}
}
