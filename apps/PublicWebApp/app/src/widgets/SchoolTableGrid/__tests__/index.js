import React from "react";
import { shallow, mount } from "enzyme";
import SchoolTableGrid from "../index";
import MockSchoolsData from "../../../mocks/MockSchool";
import AdminPageMessage from "../../../widgets/AdminPageMessage";

let props, mockSchools;
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}
beforeEach(resetAll);
afterEach(resetAll);

function resetAll() {
	mockSchools = MockSchoolsData;
	props = {
		schoolsData: mockSchools.result,
		unfilteredCount: 3,
		schoolLimit: 10,
		schoolOffset: 0,
		loading: false,
		schoolsLoaded: true,
		sortField: "name",
		sortDir: "A",
		hasSelectedAllSchools: false,
		selectedSchoolIdMap: [],
		doSorting: jest.fn(),
		doPagination: jest.fn(),
		withRollover: false,
		onChangeSelectedAllCheckbox: jest.fn(),
		onChangeSchoolCheckBox: jest.fn(),
		//selectAllRef={this._selectAllRef}
		isHideSelect: false,
	};
}

/** Component renders correctly*/
test("Component renders correctly", async () => {
	const item = shallow(<SchoolTableGrid {...props} />);
	expect(item.find("TableGrid").length).toBe(1);
	expect(item.find("TableGridFooter").length).toBe(1);
});

test("Comonent renders correctly with rollover_job", async () => {
	props.withRollover = true;
	const item = shallow(<SchoolTableGrid {...props} />);
	expect(item.find("TableGrid").length).toBe(1);
	expect(item.find("TableGridFooter").length).toBe(1);
});

test("Comonent renders correctly with rollover_job and select checkbox is hiden", async () => {
	props.withRollover = true;
	props.isHideSelect = true;
	const item = shallow(<SchoolTableGrid {...props} />);
	expect(item.find("TableGrid").length).toBe(1);
	expect(item.find("TableGridFooter").length).toBe(1);
});

test("User see loader while school data is loading", async () => {
	props.schoolsLoaded = false;
	const item = shallow(<SchoolTableGrid {...props} />);
	expect(item.find("TableGrid").length).toBe(1);
	expect(item.find("TableGridFooter").length).toBe(1);
});

test("When school data is null", async () => {
	props.schoolsData = [];
	const item = shallow(<SchoolTableGrid {...props} />);
	expect(item.find("AdminPageMessage").length).toBe(1);
});
