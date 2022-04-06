import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faBan, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import theme from "../../common/theme";
import styled, { css } from "styled-components";

/** Table data link style components */
const ActionLink = styled.a`
	color: ${theme.colours.headerButtonSearch};
	background: transparent;
	font-size: 1em;
	display: inline-block;
	padding: 0 0.5em;
	text-decoration: underline;
	&:hover {
		opacity: 0.8;
	}
	& > :first-child {
		padding-right: 0.25em;
	}
	& > * {
		vertical-align: middle;
	}
`;

const FormWrap = styled.form`
	select::-ms-expand {
		display: none;
	}
`;

export default function UserActions(props) {
	return props.approvingOid === props.email ? (
		<FormWrap onSubmit={props.doCompleteApprove}>
			<select name="role" required>
				<option value="">(Select role...)</option>
				<option value="teacher">User</option>
				<option value="school-admin">Institution Admin</option>
			</select>
			<button type="submit">Submit</button>
			<button type="button" onClick={props.doDismissApprove}>
				Cancel
			</button>
		</FormWrap>
	) : (
		<>
			{props.status === "Pending" && (
				<ActionLink href="#" data-email={props.email} onClick={props.doInitApprove}>
					Approve
				</ActionLink>
			)}
			{props.status !== "Approved" && (
				<ActionLink href="#" data-email={props.email} onClick={props.doReject}>
					Block
				</ActionLink>
			)}
			{props.status === "Unverified" && (
				<ActionLink href="#" data-email={props.email} onClick={props.doResendVerify}>
					Resend Verification Email
				</ActionLink>
			)}
			{props.status === "Approved" &&
				(props.isPasswordSet ? (
					<ActionLink href="#" data-email={props.email} onClick={props.doResendVerify}>
						Resend Verification Email
					</ActionLink>
				) : (
					<ActionLink href="#" data-email={props.email} onClick={props.doResendSetPassword}>
						Resend Password Set Email
					</ActionLink>
				))}
		</>
	);
}
