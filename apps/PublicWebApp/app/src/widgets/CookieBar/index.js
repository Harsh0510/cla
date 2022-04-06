import React from "react";
import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import theme from "../../common/theme";

const Wrap = styled.div`
	position: fixed;
	bottom: 0;
	left: 0;
	width: 100%;
	padding: 0.75em 0.5em 0.75em 1.5em;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	background-color: ${theme.colours.darkGray};
	color: ${theme.colours.cookiesTextColor};
	z-index: 100;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		padding: 0.5em 0 0.5em 1em;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile4}) {
		display: block;
		padding: 0.5em 0.5em 0 0.5em;
		text-align: center;
	}
	@media print {
		display: none;
	}
`;

const Text = styled.div`
	flex: 1;
`;

const Link = styled.a`
	text-decoration: underline;
`;

const Close = styled.a`
	display: block;
	margin: 0 auto;
	padding: 1em;
`;

export default class CookieBar extends React.PureComponent {
	state = {
		accepted: !!window.localStorage.getItem("cookies_accepted"),
	};

	onClose = (e) => {
		e.preventDefault();
		window.localStorage.setItem("cookies_accepted", "1");
		this.setState({
			accepted: true,
		});
	};

	render() {
		if (this.state.accepted) {
			return "";
		}
		return (
			<Wrap>
				<Text>
					We use cookies on this site to help us provide a better service. By navigating the site you are accepting the cookies.
					<br />
					See our{" "}
					<Link href="/cookie-policy" target="_blank">
						cookie policy
					</Link>{" "}
					for more details.
				</Text>
				<Close href="#" onClick={this.onClose}>
					<FontAwesomeIcon icon={faTimes} size="lg" />
				</Close>
			</Wrap>
		);
	}
}
