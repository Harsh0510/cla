import React from "react";
import styled from "styled-components";
import theme from "../../common/theme";
import { FormBodyContainer, FormContainerFull } from "../AdminStyleComponents";

const TextArea = styled.textarea`
	border-color: ${theme.colours.inputBorder};
	width: 100%;

	::placeholder {
		color: ${theme.colours.inputText};
		font-style: italic;
	}
`;

const Label = styled.label`
	margin-top: 20px;
	margin-bottom: 0px;
`;

class OtherRequest extends React.PureComponent {
	onChange = (e) => {
		this.props.onChange(e.target.name, e.target.value);
	};

	render() {
		return (
			<FormBodyContainer>
				<Label>Other request or feedback</Label>
				<FormContainerFull>
					<TextArea
						placeholder="Please include as much information as possible about your request here"
						id="otherRequest"
						name="otherRequest"
						rows="4"
						cols="140"
						onChange={this.onChange}
						value={this.props.data}
					/>
				</FormContainerFull>
			</FormBodyContainer>
		);
	}
}

export default OtherRequest;
