import React from "react";
import styled from "styled-components";
import theme from "../../common/theme";
import MultiSelectDropDown from "../../widgets/MultiSelectDropDown";
import { WrapForm, SubmitButton, SearchButtonSection } from "../../widgets/AdminStyleComponents";
import { colMd3, colMd4, colSm6 } from "../../common/style";

const WrapSearchButtonSection = styled(SearchButtonSection)`
	${(p) => (p.numberOfFilters >= 3 ? colMd3 : colMd4)}
	padding-left: 0;
	padding-right: 0;
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		padding-top: 1em;
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding-top: 1.5em;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		padding-top: 0;
	}
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

export default class SearchFilters extends React.PureComponent {
	/** if change the class filter*/
	handleClassDrpChange = (selectedClass) => {
		this.props.handlefilterSelection(selectedClass, "Class");
	};

	handleSearch = (e) => {
		e.preventDefault();
		this.props.doSearch();
	};

	handleResetAll = (e) => {
		e.preventDefault();
		this.props.resetAll();
	};

	render() {
		const { classData, selectedClass, numberOfFilters } = this.props;
		return (
			<>
				<WrapForm onSubmit={this.handleSearch}>
					<ClassFilterSection numberOfFilters={numberOfFilters}>
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
					<WrapSearchButtonSection numberOfFilters={numberOfFilters}>
						<SubmitButton type="submit" marginRight={true} title="Search" name="Search">
							Apply
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
