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

	/** if change the school filter*/
	handleSchoolDrpChange = (name, selectedSchool, valid) => {
		this.props.handlefilterSelection(selectedSchool, "School");
	};

	/** if change the examboard filter*/
	handleExamBoardDrpChange = (selectedExamBoard) => {
		this.props.handlefilterSelection(selectedExamBoard, "ExamBoard");
	};

	/** if change the keystage filter*/
	handleKeyStageDrpChange = (selectedKeyStage) => {
		this.props.handlefilterSelection(selectedKeyStage, "KeyStage");
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
			examBoardData,
			keyStagesData,
			selectedSchools,
			selectedExamBoard,
			selectedKeyStage,
			currentUserRole,
			filterText,
			queryPlaceHolderText,
			resetAll,
			filtersLength,
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
								name="SearchQuery"
								className="search-form-input"
								placeholder={queryPlaceHolderText ? queryPlaceHolderText : "Search "}
								value={filterText}
								ref={this.inputField}
								onChange={this.handleQueryChange}
							/>
						</FormContainer>
					</WrapSearchInputField>
					{schoolsFilter ? <WrapSearchSchoolFilter numberOfFilters={numberOfFilters}>{schoolsFilter}</WrapSearchSchoolFilter> : ""}
					{examBoardData ? (
						<WrapSearchInputField numberOfFilters={numberOfFilters}>
							<MultiSelectDropDown
								name="ExamBoard"
								labelText="Exam Board"
								options={examBoardData}
								selectedData={selectedExamBoard}
								placeholder="Select"
								eventName={this.handleExamBoardDrpChange}
								isWidthFull={true}
								marginBottom={"15px"}
							/>
						</WrapSearchInputField>
					) : (
						""
					)}
					{keyStagesData ? (
						<WrapSearchInputField numberOfFilters={numberOfFilters}>
							<MultiSelectDropDown
								name="keyStages"
								labelText="Key Stages"
								options={keyStagesData}
								selectedData={selectedKeyStage}
								placeholder="Select"
								eventName={this.handleKeyStageDrpChange}
								isWidthFull={true}
								marginBottom={"15px"}
							/>
						</WrapSearchInputField>
					) : (
						""
					)}
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
