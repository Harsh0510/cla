import React from "react";
import styled from "styled-components";
import MultiRowTextField from "../MultiRowTextField";

const Title = styled.div`
	margin-top: 20px;
`;

class AuthorRequest extends React.PureComponent {
	handleAuthorChange = (name, value, valid) => {
		this.props.onChange("authorRequest", value);
	};
	render() {
		return (
			<>
				<Title>Author</Title>
				<MultiRowTextField
					value={this.props.data.length > 0 ? this.props.data : [""]}
					type="template"
					name="authorRequest"
					onChange={this.handleAuthorChange}
					movable={false}
					maxItems={5}
				/>
			</>
		);
	}
}

export default AuthorRequest;
