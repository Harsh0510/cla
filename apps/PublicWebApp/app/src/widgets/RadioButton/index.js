import styled from "styled-components";
import theme from "../../common/theme";

/** Radio button style component
 * this component used in My coppies page radio button input
 */
const RadioButton = styled.input`
	position: relative;
	display: none;
	cursor: pointer;

	+ label {
		position: relative;
		cursor: pointer;
		padding-right: 20px;
		padding-top: 2px;
		margin-right: 10px;

		@media screen and (max-width: ${theme.breakpoints.mobile}) {
			justify-content: end;
			padding-right: 10px;
			padding-top: 2px;
			margin-right: 5px;
		}

		&:before,
		&:after {
			position: absolute;
			top: 0.25rem;
			left: -1.5rem;
			display: block;
			width: ${(props) => (props.checked ? "0.5em" : "0.7em")};
			height: ${(props) => (props.checked ? "0.5em" : "0.7em")};
			content: "";
			background-repeat: no-repeat;
			background-position: center center;
			background-size: 50% 50%;
			border-radius: 50%;
		}

		&:before {
			user-select: none;
			border: 1px solid #4a4a4a;
			border-radius: 50%;
		}
	}
	&:checked + label {
		color: ${theme.colours.radioBtnChecked};
		text-decoration: underline;
		font-weight: bold;
		&:before {
			background: #226174;
			border: 3px solid ${theme.colours.radioBtnChecked};
		}
	}
`;

export default RadioButton;
