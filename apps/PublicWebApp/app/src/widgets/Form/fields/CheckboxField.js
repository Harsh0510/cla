import React from "react";
import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faMinus } from "@fortawesome/free-solid-svg-icons";
import theme from "../../../common/theme";
import idGenerate from "../../../common/idGenerate";

const Label = styled.label`
	display: block;
	${(p) =>
		p.error &&
		css`
			padding: 0.5em;
			border: 2px solid ${theme.colours.invalidBorder};
		`}
`;

const Input = styled.input`
	position: absolute;
	left: -9999px;
`;

const Checkbox = styled.div`
	float: left;
	border: 2px solid ${theme.colours.primaryLight};
	width: 1.25em;
	height: 1.25em;
	background: #ffffff;
	text-align: center;
	line-height: 1.25em;
	color: ${theme.colours.white};
	margin-right: 0.25em;
	margin-top: 0.1em;
	${(p) =>
		p.disable &&
		css`
			opacity: 0.3;
		`}
	${(p) => (p.indeterminate || p.checked ? `background: ${theme.colours.primaryLight};` : null)}
`;

const Content = styled.div`
	overflow: hidden;
`;

export default class CheckboxField extends React.PureComponent {
	ref = React.createRef();
	_id = idGenerate();

	onChange = (e) => {
		e.preventDefault();
		if (this.props.onChange) {
			this.props.onChange(this.props.indeterminate ? null : !!this.ref.current.checked);
		}
	};

	updateIndeterminate() {
		if (this.ref.current) {
			this.ref.current.indeterminate = this.props.indeterminate;
		}
	}

	componentDidMount() {
		this.updateIndeterminate();
	}

	componentDidUpdate(prevProps) {
		if (this.props.indeterminate !== prevProps.indeterminate) {
			this.updateIndeterminate();
		}
	}

	render() {
		const { issue, value, content, name, disable, disabled = null, required = "", onChange, ...rest } = this.props;
		return (
			<Label htmlFor={this._id} error={issue && issue.hasError()}>
				<Input
					{...rest}
					id={this._id}
					name={name}
					type="checkbox"
					checked={value}
					onChange={this.onChange}
					ref={this.ref}
					disabled={disabled}
					required={required}
				/>
				<Checkbox checked={value} disable={disable} disabled={disabled} indeterminate={this.props.indeterminate}>
					{this.props.indeterminate ? <FontAwesomeIcon icon={faMinus} /> : value ? <FontAwesomeIcon icon={faCheck} /> : null}
				</Checkbox>
				<Content>{content}</Content>
			</Label>
		);
	}
}
