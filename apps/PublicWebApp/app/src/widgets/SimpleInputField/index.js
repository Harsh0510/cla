import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import reactCreateRef from "../../common/reactCreateRef";

/** Form controls */
const Input = styled.input`
	margin-top: 1em;
	margin-right: 0;
	margin-left: 0;
	background-color: transparent;
	border-radius: 3px;

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		margin-top: 0.5em;
	}
	::placeholder {
		color: ${theme.colours.darkGrey};
	}
`;

const Error = styled.div`
	margin-bottom: 0.2em;
	color: ${theme.colours.errorTextColor};
	font-size: 0.9em;
	font-weight: bold;
`;

export default class SimpleInputField extends React.PureComponent {
	el = reactCreateRef();

	/* isValid() {
		if (this.props.required && !this.el.current.value) {
			return false;
		}
		return true;
	} */

	render() {
		const props = this.props;
		return (
			<>
				<Input
					ref={this.el}
					type={props.type || "text"}
					maxLength={this.props.maxLength}
					name={props.name}
					placeholder={props.placeholder}
					value={props.value}
					defaultValue={props.defaultValue}
					onChange={props.onChange}
					onBlur={props.onBlur}
					required={props.required}
					disabled={props.disabled}
				/>
				{props.error ? <Error>{props.error}</Error> : null}
			</>
		);
	}
}
