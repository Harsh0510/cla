import React from "react";
import reactCreateRef from "../../common/reactCreateRef";
import MultiSelectDropDown from "../../widgets/MultiSelectDropDown";
import UserRole from "../../common/UserRole";
import AjaxSearchableDropdown from "../../widgets/AjaxSearchableDropdown";
import {
	WrapForm,
	FormContainer,
	StyledInput,
	SubmitButton,
	SearchButtonSection,
	WrapSearchInputField,
	WrapSearchSchoolFilter,
} from "../../widgets/AdminStyleComponents";
import staticValues from "../../common/staticValues";

export default class SchoolSearchFilters extends React.PureComponent {
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

	/** if change the school filter*/
	handleSchoolDrpChange = (name, selectedSchool, valid) => {
		this.props.handlefilterSelection(selectedSchool, "School");
	};

	/** if change the territory filter*/
	handleTerritoryDrpChange = (selectedTerritory) => {
		this.props.handlefilterSelection(selectedTerritory, "territory");
	};

	/** if change the school_level filter*/
	handleSchoolLevelDrpChange = (selectedSchoolLevel) => {
		this.props.handlefilterSelection(selectedSchoolLevel, "school_level");
	};

	/** if change the school_type filter*/
	handleSchoolTypeDrpChange = (selectedSchoolType) => {
		this.props.handlefilterSelection(selectedSchoolType, "school_type");
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
			territoryData,
			levelData,
			typeData,
			selectedSchools,
			selectedTerritory,
			selectedSchoolLevel,
			selectedSchoolType,
			filterText,
			filtersLength,
			queryPlaceHolderText,
			currentUserRole,
		} = this.props;

		const numberOfFilters = filtersLength ? filtersLength : 0;
		let schoolsFilter;

		if (currentUserRole === UserRole.claAdmin && schoolData) {
			schoolsFilter = (
				<AjaxSearchableDropdown
					api={this.props.api}
					requestApi={staticValues.api.schoolRequestApi}
					name="School"
					title="Institution"
					value={selectedSchools}
					placeholder="Select"
					onChange={this.handleSchoolDrpChange}
					minQueryLength={3}
					labelIsOnTop={"column"}
					multiple={true}
				/>
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
					{{ schoolsFilter } ? <WrapSearchSchoolFilter numberOfFilters={numberOfFilters}>{schoolsFilter}</WrapSearchSchoolFilter> : ""}
					{territoryData ? (
						<WrapSearchInputField numberOfFilters={numberOfFilters}>
							<MultiSelectDropDown
								name="Territory"
								labelText="Territory"
								options={territoryData}
								selectedData={selectedTerritory}
								placeholder="Select"
								eventName={this.handleTerritoryDrpChange}
								isWidthFull={true}
								marginBottom={"15px"}
							/>
						</WrapSearchInputField>
					) : null}
					{levelData ? (
						<WrapSearchInputField numberOfFilters={numberOfFilters}>
							<MultiSelectDropDown
								name="SchoolLevel"
								labelText="Institution Level"
								options={levelData}
								selectedData={selectedSchoolLevel}
								placeholder="Select"
								eventName={this.handleSchoolLevelDrpChange}
								isWidthFull={true}
								marginBottom={"15px"}
							/>
						</WrapSearchInputField>
					) : null}
					{typeData ? (
						<WrapSearchInputField numberOfFilters={numberOfFilters}>
							<MultiSelectDropDown
								name="SchoolType"
								labelText="Institution Type"
								options={typeData}
								selectedData={selectedSchoolType}
								placeholder="Select"
								eventName={this.handleSchoolTypeDrpChange}
								isWidthFull={true}
								marginBottom={"15px"}
							/>
						</WrapSearchInputField>
					) : null}
					<SearchButtonSection numberOfFilters={numberOfFilters}>
						<SubmitButton type="submit" title="Search" name="Search" marginRight={true}>
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
