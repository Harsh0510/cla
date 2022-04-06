import React from "react";
import styled from "styled-components";
import getMaybeValidIsbn from "../../common/getMaybeValidIsbn";
import theme from "../../common/theme";
import { FormBodyContainer, FormContainerFull, FormContainerHalf } from "../AdminStyleComponents";
import NameInputField from "../NameInputField";

const FormWrapper = styled.div`
	margin: 1rem 0;
`;

const Label = styled.div`
	margin-bottom: 0;
`;

const Title = styled.div`
	margin: 0px -20px;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		margin: 0px;
	}
`;

const Error = styled.div`
	margin-bottom: 0.2em;
	color: ${theme.colours.errorTextColor};
	font-size: 0.9em;
	font-weight: bold;
`;

class BookRequest extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isbnError: "",
		};
	}
	doInputFieldChange = (value, name) => {
		if (name === "isbn") {
			let isbnError = "";
			if (value) {
				const validIsbn = getMaybeValidIsbn(value);
				if (value.length > 25) {
					isbnError = "Please make sure that ISBN between 9 and 25 digits.";
				} else if (!validIsbn) {
					isbnError = "Please make sure that there are at least 9 digits.";
				}
			}
			this.setState({ isbnError: isbnError });
		}
		this.props.onChange(name, value);
	};

	render() {
		const { data } = this.props;
		return (
			<>
				<Title>The more information you can give us the easier it is for us to obtain the correct book for you.</Title>
				<FormWrapper>
					<FormBodyContainer>
						<FormContainerFull>
							<FormContainerHalf>
								<Label htmlFor="isbn">ISBN</Label>
								<NameInputField
									name="isbn"
									placeholder="ISBN"
									value={data.isbn}
									doNameInputFieldChange={this.doInputFieldChange}
									minLength={1}
									maxLength={100}
									fieldName={"isbn"}
									isRequired={false}
								/>
								<Error>{this.state.isbnError}</Error>
							</FormContainerHalf>
							<FormContainerHalf>
								<Label htmlFor="publisher">Publisher</Label>
								<NameInputField
									name="publisher"
									placeholder="Publisher"
									value={data.publisher}
									doNameInputFieldChange={this.doInputFieldChange}
									minLength={1}
									maxLength={100}
									fieldName={"publisher"}
									isRequired={false}
								/>
							</FormContainerHalf>
						</FormContainerFull>
						<FormContainerFull>
							<FormContainerHalf>
								<Label htmlFor="title">Book title</Label>
								<NameInputField
									name="title"
									placeholder="Book title"
									value={data.title}
									doNameInputFieldChange={this.doInputFieldChange}
									minLength={1}
									maxLength={100}
									fieldName={"book title"}
									isRequired={false}
								/>
							</FormContainerHalf>
							<FormContainerHalf>
								<Label htmlFor="publication year">Publication year</Label>
								<NameInputField
									name="publicationYear"
									placeholder="Publication year"
									value={data.publicationYear}
									doNameInputFieldChange={this.doInputFieldChange}
									minLength={1}
									maxLength={100}
									fieldName={"publication year"}
									isRequired={false}
								/>
							</FormContainerHalf>
						</FormContainerFull>
						<FormContainerFull>
							<FormContainerHalf>
								<Label htmlFor="author">Author(s)</Label>
								<NameInputField
									name="author"
									placeholder="Author(s)"
									value={data.author}
									doNameInputFieldChange={this.doInputFieldChange}
									minLength={1}
									maxLength={100}
									fieldName={"author"}
									isRequired={false}
								/>
							</FormContainerHalf>
							<FormContainerHalf>
								<Label htmlFor="url">URL</Label>
								<NameInputField
									name="url"
									placeholder="URL"
									value={data.url}
									doNameInputFieldChange={this.doInputFieldChange}
									minLength={1}
									maxLength={500}
									fieldName={"url"}
									isRequired={false}
								/>
							</FormContainerHalf>
						</FormContainerFull>
					</FormBodyContainer>
				</FormWrapper>
			</>
		);
	}
}

export default BookRequest;
