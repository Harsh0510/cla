import React from "react";
import styled from "styled-components";
import MultiRowTextField from "../MultiRowTextField";

const Title = styled.div`
	margin-top: 20px;
`;

class PublisherRequest extends React.PureComponent {
	handlePublisherChange = (name, value, valid) => {
		this.props.onChange("publisherRequest", value);
	};
	render() {
		return (
			<>
				<Title>Publisher</Title>
				<MultiRowTextField
					value={this.props.data.length > 0 ? this.props.data : [""]}
					type="template"
					name="publisherRequest"
					onChange={this.handlePublisherChange}
					movable={false}
					maxItems={5}
				/>
			</>
		);
	}
}

export default PublisherRequest;
