import React from "react";
import reactCreateRef from "../../common/reactCreateRef";
import MultiSelectDropDown from "../../widgets/MultiSelectDropDown";
import { WrapForm, FormContainer, StyledInput, SubmitButton, SearchButtonSection, WrapSearchInputField } from "../../widgets/AdminStyleComponents";
import "react-datepicker/dist/react-datepicker.css";
import styled from "styled-components";
import theme from "../../common/theme";
import DateInputField from "../../widgets/DateInputField";

const Wrap = styled(WrapSearchInputField)`
	display: flex;

	@media screen and (min-width: ${theme.breakpoints.mobileLarge}) {
		flex: 0 0 50%;
		max-width: 50%;
	}

	@media screen and (max-width: ${theme.breakpoints.mobile8}) {
		display: inline-block;
	}
`;

const WrapDate = styled.div`
	display: flex;
	flex-direction: column;
`;

const WrapDateTo = styled.div`
	margin-right: 0.5em;
`;

const WrapFormContainer = styled(FormContainer)`
	width: auto;
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

	handleStatusDrpChange = (selectedStatus) => {
		this.props.handlefilterSelection(selectedStatus, "Status");
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
		const { statusData, selectedStatus, filterText, queryPlaceHolderText, filtersLength } = this.props;
		const numberOfFilters = filtersLength ? filtersLength - 1 : 0;
		return (
			<>
				<WrapForm onSubmit={this.handleSearch}>
					<Wrap numberOfFilters={numberOfFilters}>
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
					</Wrap>
					{statusData ? (
						<Wrap numberOfFilters={numberOfFilters}>
							<MultiSelectDropDown
								name="status"
								labelText="Rollover Status"
								options={statusData}
								selectedData={selectedStatus}
								placeholder="Select"
								eventName={this.handleStatusDrpChange}
								isWidthFull={true}
								marginBottom={"15px"}
							/>
						</Wrap>
					) : (
						""
					)}
					<Wrap numberOfFilters={numberOfFilters}>
						<WrapDateTo>
							<FormContainer>
								<WrapDate>
									<label>Date (from)</label>
									<DateInputField
										placeholderText="Date (from)"
										value={this.props.selectedDateCreatedBegin}
										onChange={this.props.handlefilterSelection}
										showTimeSelect={true}
										isClearable={true}
										required={false}
										showPreviousDates={true}
										name={"date_created_begin"}
									/>
								</WrapDate>
							</FormContainer>
						</WrapDateTo>
						<WrapFormContainer>
							<WrapDate>
								<label>Date (to)</label>
								<DateInputField
									placeholderText="Date (to)"
									value={this.props.selectedDateCreatedEnd}
									onChange={this.props.handlefilterSelection}
									showTimeSelect={true}
									isClearable={true}
									required={false}
									showPreviousDates={true}
									name={"date_created_end"}
								/>
							</WrapDate>
						</WrapFormContainer>
					</Wrap>
					<Wrap numberOfFilters={numberOfFilters}></Wrap>
					<SearchButtonSection numberOfFilters={numberOfFilters}>
						<SubmitButton type="submit" marginRight={true} title="Search" name="Search">
							Search
						</SubmitButton>
						<SubmitButton type="button" title="Reset" onClick={this.handleResetAll} name="Reset">
							Reset
						</SubmitButton>
					</SearchButtonSection>
				</WrapForm>
			</>
		);
	}
}
