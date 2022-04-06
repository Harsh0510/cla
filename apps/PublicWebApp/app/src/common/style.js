import { css } from "styled-components";
import theme from "../common/theme";

export const container = css`
	max-width: ${theme.breakpoints.desktop3};
	width: 100%;
	padding-right: 15px;
	padding-left: 15px;
	margin-right: auto;
	margin-left: auto;
`;

export const row = css`
	display: flex;
	flex-wrap: wrap;
	margin-right: -15px;
	margin-left: -15px;
`;

export const card = css`
	position: relative;
	display: flex;
	flex-direction: column;
	min-width: 0;
	word-wrap: break-word;
	background-color: ${theme.colours.white};
	background-clip: border-box;
	border: 1px solid rgba(0, 0, 0, 0.125);
	border-radius: 0.25rem;
`;

export const col = css`
	flex-basis: 0;
	flex-grow: 1;
	max-width: 100%;
`;

export const commonColCss = css`
	position: relative;
	width: 100%;
	min-height: 1px;
	padding-right: 15px;
	padding-left: 15px;
`;

export const colAuto = css`
	${commonColCss}

	flex: 0 0 auto;
	width: auto;
	max-width: none;
`;

export const col12 = css`
	${commonColCss}

	flex: 0 0 100%;
	max-width: 100%;
`;

export const col6 = css`
	${commonColCss}

	flex: 0 0 50%;
	max-width: 50%;
`;

export const col5 = css`
	${commonColCss}

	flex: 0 0 41.666667%;
	max-width: 41.666667%;
`;

export const colLg1 = css`
	${commonColCss}

	@media screen and (min-width: ${theme.breakpoints.tabletPro}) {
		flex: 0 0 8.333333%;
		max-width: 8.333333%;
	}
`;

export const colLg3 = css`
	${commonColCss}

	@media screen and (min-width: ${theme.breakpoints.tabletPro}) {
		flex: 0 0 25%;
		max-width: 25%;
	}
`;

export const colLg4 = css`
	${commonColCss}

	@media screen and (min-width: ${theme.breakpoints.tabletPro}) {
		flex: 0 0 33.333333%;
		max-width: 33.333333%;
	}
`;

export const colLg5 = css`
	${commonColCss}

	@media screen and (min-width: ${theme.breakpoints.tabletPro}) {
		flex: 0 0 41.666667%;
		max-width: 41.666667%;
	}
`;

export const colLg6 = css`
	${commonColCss}

	@media screen and (min-width: ${theme.breakpoints.tabletPro}) {
		flex: 0 0 50%;
		max-width: 50%;
	}
`;

export const colLg7 = css`
	${commonColCss}

	@media screen and (min-width: ${theme.breakpoints.tabletPro}) {
		flex: 0 0 58.333333%;
		max-width: 58.333333%;
	}
`;

export const colLg8 = css`
	${commonColCss}

	@media screen and (min-width: ${theme.breakpoints.tabletPro}) {
		flex: 0 0 66.666667%;
		max-width: 66.666667%;
	}
`;

export const colLg9 = css`
	${commonColCss}

	@media screen and (min-width: ${theme.breakpoints.tabletPro}) {
		flex: 0 0 75%;
		max-width: 75%;
	}
`;

export const colLg10 = css`
	${commonColCss}

	@media screen and (min-width: ${theme.breakpoints.tabletPro}) {
		flex: 0 0 83.333333%;
		max-width: 83.333333%;
	}
`;

export const colLg11 = css`
	${commonColCss}

	@media screen and (min-width: ${theme.breakpoints.tabletPro}) {
		flex: 0 0 91.666667%;
		max-width: 91.666667%;
	}
`;

export const colLg12 = css`
	${commonColCss}

	@media screen and (min-width: ${theme.breakpoints.tabletPro}) {
		flex: 0 0 100%;
		max-width: 100%;
	}
`;

export const colXl1 = css`
	${commonColCss}

	@media screen and (min-width: ${theme.breakpoints.desktop2}) {
		flex: 0 0 8.333333%;
		max-width: 8.333333%;
	}
`;

export const colXl3 = css`
	${commonColCss}
	@media screen and (min-width: ${theme.breakpoints.desktop2}) {
		flex: 0 0 25%;
		max-width: 25%;
	}
`;

export const colXl5 = css`
	${commonColCss}

	@media screen and (min-width: ${theme.breakpoints.desktop2}) {
		flex: 0 0 41.666667%;
		max-width: 41.666667%;
	}
`;

export const colXl6 = css`
	${commonColCss}

	@media screen and (min-width: ${theme.breakpoints.desktop2}) {
		flex: 0 0 50%;
		max-width: 50%;
	}
`;

export const colXl7 = css`
	${commonColCss}

	@media screen and (min-width: ${theme.breakpoints.desktop2}) {
		flex: 0 0 58.333333%;
		max-width: 58.333333%;
	}
`;

export const colXl8 = css`
	${commonColCss}

	@media screen and (min-width: ${theme.breakpoints.desktop2}) {
		flex: 0 0 66.666667%;
		max-width: 66.666667%;
	}
`;

export const colXl11 = css`
	${commonColCss}

	@media screen and (min-width: ${theme.breakpoints.desktop2}) {
		flex: 0 0 91.666667%;
		max-width: 91.666667%;
	}
`;

export const colMd = css`
	${commonColCss};

	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		flex-basis: 0;
		flex-grow: 1;
		max-width: 100%;
	}
`;

export const colMdAuto = css`
	${commonColCss};

	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		flex: 0 0 auto;
		width: auto;
		max-width: none;
	}
`;

export const colMd2 = css`
	${commonColCss};

	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		flex: 0 0 16.666667%;
		max-width: 16.666667%;
	}
`;

export const colMd3 = css`
	${commonColCss};
	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		flex: 0 0 25%;
		max-width: 25%;
	}
`;

export const colMd4 = css`
	${commonColCss};

	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		flex: 0 0 33.333333%;
		max-width: 33.333333%;
	}
`;

export const colMd5 = css`
	${commonColCss};

	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		flex: 0 0 41.666667%;
		max-width: 41.666667%;
	}
`;

export const colMd6 = css`
	${commonColCss};

	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		flex: 0 0 50%;
		max-width: 50%;
	}
`;

export const colMd7 = css`
	${commonColCss};

	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		flex: 0 0 58.333333%;
		max-width: 58.333333%;
	}
`;

export const colMd8 = css`
	${commonColCss};

	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		flex: 0 0 66.666667%;
		max-width: 66.666667%;
	}
`;

export const colMd9 = css`
	${commonColCss};

	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		flex: 0 0 75%;
		max-width: 75%;
	}
`;

export const colMd10 = css`
	${commonColCss};

	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		flex: 0 0 83.333333%;
		max-width: 83.333333%;
	}
`;

export const colMd12 = css`
	${commonColCss};

	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		flex: 0 0 100%;
		max-width: 100%;
	}
`;

export const colSm2 = css`
	${commonColCss}

	@media screen and (min-width: ${theme.breakpoints.mobileSmall}) {
		flex: 0 0 16.666667%;
		max-width: 16.666667%;
	}
`;

export const colSm4 = css`
	${commonColCss}

	@media screen and (min-width: ${theme.breakpoints.mobileSmall}) {
		flex: 0 0 33.333333%;
		max-width: 33.333333%;
	}
`;

export const colSm6 = css`
	${commonColCss}

	@media screen and (min-width: ${theme.breakpoints.mobileSmall}) {
		flex: 0 0 50%;
		max-width: 50%;
	}
`;

export const colSm8 = css`
	${commonColCss}

	@media screen and (min-width: ${theme.breakpoints.mobileSmall}) {
		flex: 0 0 66.666667%;
		max-width: 66.666667%;
	}
`;

export const colSm10 = css`
	${commonColCss}

	@media screen and (min-width: ${theme.breakpoints.mobileSmall}) {
		flex: 0 0 83.333333%;
		max-width: 83.333333%;
	}
`;

export const colSm12 = css`
	${commonColCss}

	@media screen and (min-width: ${theme.breakpoints.mobileSmall}) {
		flex: 0 0 100%;
		max-width: 100%;
	}
`;

export const colXs12 = css`
	@media screen and (max-width: ${theme.breakpoints.mobile5}) {
		flex: 0 0 100%;
		max-width: 100%;
	}
`;

export const inputGroup = css`
	position: relative;
	display: flex;
	flex-wrap: wrap;
	align-items: stretch;
	width: 100%;
`;

export const formControl = css`
	display: inline-block;
	width: 100%;
	color: ${theme.colours.headerButtonSearch};
	border: 0;
	border-bottom: 1px solid ${theme.colours.primary};
	border-radius: 0;
	font-size: 14px;
	line-height: 1.5;
	padding: 8px 20px 6px 0;
	height: auto;
	background: transparent;
	transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
	transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

	:focus {
		color: ${theme.colours.focusFomControlColor};
		background-color: ${theme.colours.white};
		border-color: ${theme.colours.focusFomControlBorder};
		outline: 0;
		box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
	}

	::-webkit-input-placeholder {
		color: ${theme.colours.placeholderTextColor};
		opacity: 1;
	}

	::-moz-placeholder {
		color: ${theme.colours.placeholderTextColor};
		opacity: 1;
	}

	:-ms-input-placeholder {
		color: ${theme.colours.placeholderTextColor};
		opacity: 1;
	}

	::-ms-input-placeholder {
		color: ${theme.colours.placeholderTextColor};
		opacity: 1;
	}

	::placeholder {
		color: ${theme.colours.placeholderTextColor};
		opacity: 1;
	}

	:disabled,
	.form-control[readonly] {
		background-color: ${theme.colours.disabledFormControlBg};
		opacity: 1;
	}
`;

export const noGuttersMargin = css`
	margin-right: 0;
	margin-left: 0;
`;

export const noGuttersPadding = css`
	padding-right: 0;
	padding-left: 0;
`;

export const btn = css`
	display: inline-block;
	font-weight: normal;
	color: ${theme.colours.white};
	text-align: center;
	vertical-align: middle;
	user-select: none;
	background-color: ${theme.colours.primary};
	padding: 0.45rem 1.26rem;
	font-size: 14px;
	line-height: 1.5;
	border: 1px solid ${theme.colours.primary};
	transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
	:hover {
		text-decoration: none;
		color: ${theme.colours.primary};
		background-color: ${theme.colours.white};
	}
	${(p) =>
		p.disabled === true &&
		css`
			pointer-events: none;
			opacity: 0.3;
		`}
`;

export const customSelect = css`
	display: inline-block;
	width: 100%;
	color: ${theme.colours.headerButtonSearch};
	border: 0;
	border-bottom: 1px solid ${theme.colours.primary};
	border-radius: 0;
	font-size: 14px;
	line-height: 1.5;
	padding: 8px 20px 6px 0;
	height: auto;
	background: transparent;
	transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
	transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
	background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 490.656 490.656'%3E%3Cpath d='M487.536 120.445c-4.16-4.16-10.923-4.16-15.083 0L245.339 347.581 18.203 120.467c-4.16-4.16-10.923-4.16-15.083 0s-4.16 10.923 0 15.083l234.667 234.667c2.091 2.069 4.821 3.115 7.552 3.115s5.461-1.045 7.531-3.136l234.667-234.667c4.159-4.161 4.159-10.924-.001-15.084z'/%3E%3C/svg%3E");
	background-repeat: no-repeat;
	background-position: right;
`;

export const table = css`
	border-collapse: collapse;
	width: 100%;
	margin-bottom: 1rem;
	background-color: transparent;

	th {
		padding: 0.75rem;
		vertical-align: top;
		border-top: 1px solid ${theme.colours.lightGray};
	}

	td {
		padding: 0.75rem;
		vertical-align: top;
		border-top: 1px solid ${theme.colours.lightGray};
	}
`;

export const tableResponsive = css`
	display: block;
	width: 100%;
	overflow-x: auto;
`;

export const srOnly = css`
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border: 0;

	-focusable:active,
	-focusable:focus {
		position: static;
		width: auto;
		height: auto;
		overflow: visible;
		clip: auto;
		white-space: normal;
	}
`;

export const h1 = css`
	font-size: 100px;
	font-weight: bold;
	line-height: 1;
	letter-spacing: 1.25px;
	margin: 0 0 0.33em 0;
	font-size: 2.375em;

	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		font-size: 2.1875em;
	}
`;

export const embedResponsiveItem = css`
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border: 0;
`;

export const moreLink = css`
	color: ${theme.colours.primary};
	font-weight: normal;
	font-size: 14px;
	display: inline-block;

	:hover {
		color: ${theme.colours.black};
	}

	i {
		cursor: pointer;
		transition: all 0.3s ease;
		font-size: 12px;
		margin-left: 8px;
		font-weight: 400;

		:hover {
			transform: translateX(3px);
		}
	}
	span {
		border-bottom: 1px solid ${theme.colours.primary};

		:hover {
			border-color: ${theme.colours.black};
		}
	}
`;
