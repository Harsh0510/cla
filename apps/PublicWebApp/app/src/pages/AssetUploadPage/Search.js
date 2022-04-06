import React from "react";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import StepFlow from "./StepFlow";
import { STEPS } from "./constants";
import { Container } from "../../widgets/Layout/Container";
import styled, { css } from "styled-components";
import { FormWrapAddEdit, FormBodyContainer, FormContainerFull, FormContainerButton, FormInput } from "../../widgets/AdminStyleComponents";
import { Button } from "../../widgets/Layout/Button";
import theme from "../../common/theme";
import { ISBN } from "../../common/isbn";
import queryString from "query-string";

const ConatinerWrapper = styled.div`
	margin: 2rem 0;
`;

const Title = styled.div`
	font-size: 1.5em;
	text-align: center;
	line-height: 1.2em;
	margin-bottom: 1rem;
`;

const SubTitle = styled.div`
	text-align: center;
`;

const WrapFormContainerFull = styled(FormContainerFull)`
	justify-content: center;
	margin-bottom: 1rem;
`;

const StyledFormInput = styled(FormInput)`
	min-width: 300px;
	background-color: ${theme.colours.lightGray};
	${(p) =>
		p.value &&
		css`
			background-color: ${theme.colours.white};
		`};
`;

class Search extends React.PureComponent {
	state = {
		isbn: "",
		title: "",
	};

	componentDidMount() {
		this.updateState();
	}

	updateState() {
		const { title, isbn } = queryString.parse(this.props.location.search);
		const decodedTitle = decodeURIComponent(title || "");
		this.setState({ title: decodedTitle, isbn: isbn });
	}

	handleInputChange = (e) => {
		const val = e.target.value;
		let isbn = "";
		let title = "";

		const validIsbn = ISBN.parse(val.trim());
		if (validIsbn) {
			isbn = val;
		} else {
			title = val;
		}

		this.setState({
			isbn: isbn,
			title: title,
		});
	};

	doSubmit = (e) => {
		e.preventDefault();
		const { title, isbn } = this.state;
		this.props.history.push(`/asset-upload/search?${title ? `title=${encodeURIComponent(title)}` : `isbn=${isbn}`}`);
	};

	render() {
		const { title, isbn } = this.state;
		const pageHeaderText = `Tell us what you're copying from`;
		const pageSubTitle = `Please search for an ISBN or title so we can try and find the information we need about your content item (e.g. book)`;
		return (
			<>
				<HeadTitle title={PageTitle.AssetSearch} />
				<StepFlow steps={STEPS} selectedStep={1} />
				<ConatinerWrapper>
					<Container>
						<Title>{pageHeaderText}</Title>
						<SubTitle>{pageSubTitle}</SubTitle>
						<FormWrapAddEdit onSubmit={this.doSubmit}>
							<FormBodyContainer>
								<WrapFormContainerFull>
									<StyledFormInput
										type="text"
										name="input"
										placeholder="Enter title or ISBN"
										value={title || isbn}
										minLength={1}
										maxLength={255}
										fieldName={"input"}
										isRequired={true}
										onChange={this.handleInputChange}
									/>
								</WrapFormContainerFull>
								<FormContainerButton>
									<Button type="submit" name="Search" value="Search" disabled={!title && !isbn} data-ga-user-extract="metadata-search">
										Search
									</Button>
								</FormContainerButton>
							</FormBodyContainer>
						</FormWrapAddEdit>
					</Container>
				</ConatinerWrapper>
			</>
		);
	}
}

export default Search;
