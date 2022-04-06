import React from "react";
import styled from "styled-components";
import theme from "../../common/theme";
import { FormContainerFull } from "../AdminStyleComponents";
import MultiSelectScrollableList from "./MultiSelectScrollableList";
import reactCreateRef from "../../common/reactCreateRef";

const TextArea = styled.textarea`
	border-color: ${theme.colours.inputBorder};
	margin-bottom: 30px;
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

class ContentTypeRequest extends React.PureComponent {
	constructor(props) {
		super(props);
		this.ref_content_type = reactCreateRef();
	}

	handleDropdownChange = (values) => {
		this.props.onChange("contentTypes", values);
	};

	onChange = (e) => {
		this.props.onChange(e.target.name, e.target.value);
	};

	render() {
		return (
			<>
				<Label>Select the content types you'd like to see on the Platform</Label>
				<MultiSelectScrollableList
					refGroup={this.ref_content_type}
					options={this.props.dropDownData}
					value={this.props.data.contentTypes}
					onChange={this.handleDropdownChange}
				/>
				<Label htmlFor="additionalComments">Additional comments</Label>
				<FormContainerFull>
					<TextArea
						placeholder="Use this box to include additional information about your selected content types, or to request additional content types not listed above (optional)"
						id="additionalComments"
						name="additionalComments"
						rows="5"
						cols="140"
						onChange={this.onChange}
						value={this.props.data.additionalComments}
					/>
				</FormContainerFull>
			</>
		);
	}
}

export default ContentTypeRequest;
