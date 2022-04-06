import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import reactCreateRef from "../../common/reactCreateRef";
import MultiSelectDropDown from "../../widgets/MultiSelectDropDown";
import { WrapForm, FormContainer, StyledInput, SubmitButton, SearchButtonSection } from "../../widgets/AdminStyleComponents";
import { colMd3, colMd4, colSm6 } from "../../common/style";

const WrapSearchButtonSection = styled(SearchButtonSection)`
	${(p) => (p.numberOfFilters >= 3 ? colMd3 : colMd4)}
	padding-left: 0;
	padding-right: 0;
`;

const ClassFilterSection = styled.div`
	${colSm6}
	${colMd4}

	padding-left: 0;
	padding-right: 0;

	@media screen and (min-width: ${theme.breakpoints.mobileSmall}) {
		padding-right: 0.5rem;
	}
`;

const SearchSection = styled.div`
	${colSm6}
	${(p) => (p.numberOfFilters ? colMd3 : colMd4)}

	padding-left: 0;
	padding-right: 0;

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

	/** if change the class filter*/
	handleClassDrpChange = (selectedClass) => {
		this.props.handlefilterSelection(selectedClass, "Class");
	};

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
		const { classData, selectedClass, filterText, queryPlaceHolderText, filtersLength } = this.props;
		const numberOfFilters = filtersLength ? filtersLength : 0;
		let classFilter;

		if (classData) {
			classFilter = (
				<ClassFilterSection>
					<MultiSelectDropDown
						name="class"
						labelText="Class"
						options={classData}
						selectedData={selectedClass}
						placeholder="Select"
						eventName={this.handleClassDrpChange}
						isWidthFull={true}
						marginBottom={"15px"}
					/>
				</ClassFilterSection>
			);
		}

		return (
			<>
				<WrapForm onSubmit={this.handleSearch}>
					<SearchSection numberOfFilters={numberOfFilters >= 3}>
						<FormContainer>
							<label htmlFor="Search"> Search </label>
							<StyledInput
								type="text"
								name="search"
								className="search-form-input"
								placeholder={queryPlaceHolderText ? queryPlaceHolderText : "Search "}
								value={filterText}
								ref={this.inputField}
								onChange={this.handleQueryChange}
							/>
						</FormContainer>
					</SearchSection>

					{classFilter}

					<WrapSearchButtonSection numberOfFilters={numberOfFilters}>
						<SubmitButton type="submit" marginRight={true} title="Search" name="Search">
							Search
						</SubmitButton>
						<SubmitButton type="button" title="Reset" onClick={this.handleResetAll} name="Reset">
							Reset
						</SubmitButton>
					</WrapSearchButtonSection>
				</WrapForm>
			</>
		);
	}
}
