import React from "react";
import UserRole from "../../common/UserRole";
import reactCreateRef from "../../common/reactCreateRef";
import MultiSelectDropDown from "../../widgets/MultiSelectDropDown";
import {
	WrapForm,
	FormContainer,
	StyledInput,
	SubmitButton,
	SearchButtonSection,
	WrapSearchInputField,
	WrapSearchSchoolFilter,
} from "../../widgets/AdminStyleComponents";
import AjaxSearchableDropdown from "../../widgets/AjaxSearchableDropdown";
import staticValues from "../../common/staticValues";
import theme from "../../common/theme";
import styled, { css } from "styled-components";
import { colMd2 } from "../../common/style";

const WrapSearchButtonSection = styled(SearchButtonSection)`
	${(p) =>
		p.numberOfFilters === 1 &&
		css`
			${colMd2}
			padding-right: 0px;
			padding-left: 0px;
		`}
`;

export default class UserSearchFilters extends React.PureComponent {
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

	/** if change the school filter*/
	handleSchoolDrpChange = (name, selectedSchool, valid) => {
		this.props.handlefilterSelection(selectedSchool, "School");
	};

	/** if change the roles filter*/
	handleRoleDrpChange = (selectedRoles) => {
		this.props.handlefilterSelection(selectedRoles, "Roles");
	};

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
		const {
			schoolData,
			rolesData,
			statusData,
			selectedSchools,
			selectedRoles,
			selectedStatus,
			currentUserRole,
			filterText,
			queryPlaceHolderText,
			filtersLength,
		} = this.props;
		const numberOfFilters = filtersLength ? filtersLength : 0;

		let schoolsFilter;

		if (currentUserRole === UserRole.claAdmin && schoolData) {
			schoolsFilter = (
				<WrapSearchSchoolFilter numberOfFilters={numberOfFilters}>
					<AjaxSearchableDropdown
						api={this.props.api}
						requestApi={staticValues.api.schoolRequestApi}
						name="School"
						title="Institution"
						value={selectedSchools}
						placeholder="Select"
						onChange={this.handleSchoolDrpChange}
						minQueryLength={3}
						labelIsOnTop={true}
						multiple={true}
					/>
				</WrapSearchSchoolFilter>
			);
		}
		return (
			<>
				<WrapForm onSubmit={this.handleSearch}>
					<WrapSearchInputField numberOfFilters={numberOfFilters}>
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
					{schoolsFilter}
					{rolesData ? (
						<WrapSearchInputField numberOfFilters={numberOfFilters}>
							<MultiSelectDropDown
								name="Role"
								labelText="Role"
								options={rolesData}
								selectedData={selectedRoles}
								placeholder="Select"
								eventName={this.handleRoleDrpChange}
								isWidthFull={true}
								marginBottom={"15px"}
							/>
						</WrapSearchInputField>
					) : null}
					{statusData ? (
						<WrapSearchInputField numberOfFilters={numberOfFilters}>
							<MultiSelectDropDown
								name="Status"
								labelText="Status"
								options={statusData}
								selectedData={selectedStatus}
								placeholder="Select"
								eventName={this.handleStatusDrpChange}
								isWidthFull={true}
								marginBottom={"15px"}
							/>
						</WrapSearchInputField>
					) : null}

					<WrapSearchButtonSection numberOfFilters={numberOfFilters}>
						<SubmitButton marginRight={true} type="submit" title="Search" name="Search">
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
