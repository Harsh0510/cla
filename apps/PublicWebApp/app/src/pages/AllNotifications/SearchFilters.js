import React from "react";
import styled, { css } from "styled-components";
import reactCreateRef from "../../common/reactCreateRef";
import MultiSelectDropDown from "../../widgets/MultiSelectDropDown";
import { WrapForm, FormContainer, StyledInput, SubmitButton, SearchButtonSection, WrapSearchInputField } from "../../widgets/AdminStyleComponents";
import { Row } from "../../widgets/Layout/Row";

const WrapFormSection = styled(WrapForm, Row)`
	margin-left: 0;
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

	/** if change the status filter*/
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
		const { statusData, selectedStatus, filterText, queryPlaceHolderText } = this.props;

		return (
			<>
				<WrapFormSection onSubmit={this.handleSearch}>
					<WrapSearchInputField>
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
					</WrapSearchInputField>
					{statusData ? (
						<WrapSearchInputField>
							<MultiSelectDropDown
								name="Status"
								labelText="Read/Unread"
								options={statusData}
								selectedData={selectedStatus}
								placeholder="Select"
								eventName={this.handleStatusDrpChange}
								isWidthFull={true}
								marginBottom={"15px"}
							/>
						</WrapSearchInputField>
					) : null}
					<SearchButtonSection numberOfFilters={this.props.filterLength}>
						<SubmitButton marginRight={true} type="submit" title="Search" name="Search">
							Search
						</SubmitButton>
						<SubmitButton type="button" title="Reset" onClick={this.handleResetAll} name="Reset">
							Reset
						</SubmitButton>
					</SearchButtonSection>
				</WrapFormSection>
			</>
		);
	}
}
