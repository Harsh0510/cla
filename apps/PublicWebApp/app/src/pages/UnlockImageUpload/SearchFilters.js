import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import reactCreateRef from "../../common/reactCreateRef";
import { WrapForm, FormContainer, StyledInput, SubmitButton, SearchButtonSection } from "../../widgets/AdminStyleComponents";
import { colMd6, colSm6 } from "../../common/style";

const WrapSearcButtonSection = styled(SearchButtonSection)`
	margin-top: 32px;
	padding-left: 0;
	padding-right: 0.25rem;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		margin-top: 0px;
	}
`;

const SearchQuerySection = styled.div`
	${colSm6}
	${colMd6}
	padding-right: 0;
	padding-left: 0;

	@media screen and (min-width: ${theme.breakpoints.mobileSmall}) {
		padding-right: 0.5rem;
	}
`;

export default class SearchFilters extends React.PureComponent {
	constructor(props) {
		super(props);
		this.inputField = reactCreateRef();
		this.onFocus = this.onFocus.bind(this);
	}

	componentDidMount() {
		this.onFocus();
	}

	onFocus() {
		this.inputField.current.focus();
		this.inputField.current.selectionEnd = this.inputField.current.value !== "" ? this.inputField.current.value.length : 0;
	}

	handleQueryChange = (e) => {
		e.preventDefault();
		this.props.handlefilterSelection(this.inputField.current.value, "Query");
	};

	/** submit the query text box*/
	handleSearch = (e) => {
		e.preventDefault();
		this.props.doSearch();
		this.onFocus();
	};

	handleResetAll = (e) => {
		e.preventDefault();
		this.props.resetAll();
		this.onFocus();
	};

	render() {
		const { filterText, queryPlaceHolderText } = this.props;

		return (
			<WrapForm onSubmit={this.handleSearch}>
				<SearchQuerySection>
					<FormContainer>
						<label htmlFor="Search"> Search </label>
						<StyledInput
							type="text"
							name="SearchQuery"
							className="search-form-input"
							placeholder={queryPlaceHolderText ? queryPlaceHolderText : "Search "}
							value={filterText}
							ref={this.inputField}
							onChange={this.handleQueryChange}
						/>
					</FormContainer>
				</SearchQuerySection>

				<WrapSearcButtonSection numberOfFilters={0}>
					<SubmitButton marginRight={true} type="submit" title="Search" name="Search">
						Search
					</SubmitButton>
					<SubmitButton type="button" title="Reset" onClick={this.handleResetAll} name="Reset">
						Reset
					</SubmitButton>
				</WrapSearcButtonSection>
			</WrapForm>
		);
	}
}
