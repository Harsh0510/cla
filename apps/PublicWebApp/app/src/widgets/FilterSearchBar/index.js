import React from "react";
import styled from "styled-components";
import theme from "../../common/theme";
import reactCreateRef from "../../common/reactCreateRef";
import { WrapForm, FormContainer, StyledInput, SubmitButton, SearchButtonSection } from "../AdminStyleComponents";
import { colMd5 } from "../../common/style";
import { Row } from "../Layout/Row";
import { ColSmallHalf } from "../Layout/ColSmallHalf";

const WrapSearcButton = styled(SearchButtonSection)`
	margin-top: 32px;
	padding-left: 0;
	padding-right: 0.25rem;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		margin-top: 0px;
	}
`;

const WrapSearch = styled(ColSmallHalf)`
	${colMd5}
	padding-right: 0;
	padding-left: 0;

	@media screen and (min-width: ${theme.breakpoints.mobileSmall}) {
		padding-right: 0.5rem;
	}
`;

const WrapperForm = styled(WrapForm, Row)``;

export default class FilterSearchBar extends React.PureComponent {
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

	handleSearch = (e) => {
		e.preventDefault();
		this.props.doSearch(this.inputField.current.value);
		this.onFocus();
	};

	handleResetAll = (e) => {
		e.preventDefault();
		this.props.resetAll();
		this.onFocus();
	};

	handleQueryChange = (e) => {
		e.preventDefault();
		this.props.handlefilterSelection(this.inputField.current.value, "Query");
	};

	render() {
		const { filterText, queryPlaceHolderText } = this.props;
		return (
			<WrapperForm onSubmit={this.handleSearch}>
				<WrapSearch>
					<FormContainer>
						<label htmlFor="Search"> Search </label>
						<StyledInput
							type="text"
							name="search"
							className="search-form-input"
							placeholder={queryPlaceHolderText ? queryPlaceHolderText : "Search "}
							value={filterText || ""}
							ref={this.inputField}
							onChange={this.handleQueryChange}
						/>
					</FormContainer>
				</WrapSearch>
				<WrapSearcButton numberOfFilters={0}>
					<SubmitButton marginRight={true} type="submit" title="Search" name="Search" {...this.props.gaAttribute}>
						Search
					</SubmitButton>
					<SubmitButton type="button" title="Reset" onClick={this.handleResetAll} name="Reset">
						Reset
					</SubmitButton>
				</WrapSearcButton>
			</WrapperForm>
		);
	}
}
