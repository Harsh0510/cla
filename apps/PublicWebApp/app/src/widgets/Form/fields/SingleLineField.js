import React from "react";
import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import theme from "../../../common/theme";
import idGenerate from "../../../common/idGenerate";

const Label = styled.label`
	display: block;
`;

const Title = styled.div`
	margin-bottom: 0.25em;
`;

const Input = styled.input`
	display: block;
	box-sizing: border-box;
	width: 100%;
	border: 0;
	background: #ffffff;
	${(p) =>
		p.error &&
		css`
			border: 2px solid ${theme.colours.invalidBorder};
		`}
`;

export default class SingleLineField extends React.PureComponent {
	ref = React.createRef();
	_id = idGenerate();

	onChange = (e) => {
		e.preventDefault();
		this.props.onChange(this.ref.current.value);
	};

	render() {
		return (
			<Label htmlFor={this._id}>
				{!!this.props.title && <Title>{this.props.title}</Title>}
				<Input
					error={this.props.issue.hasError()}
					id={this._id}
					type="text"
					value={this.props.value}
					onChange={this.onChange}
					ref={this.ref}
					placeholder={this.props.placeholder}
					minLength={this.props.minLength}
					maxLength={this.props.maxLength}
				/>
			</Label>
		);
	}
}
