import React from "react";
import { shallow, mount } from "enzyme";
import SubjectFilterPresentation from "../SubjectFilterPresentation";
import MockSubjectFilter from "../../../mocks/MockSubjectFilter";

let group, data, selected, selectFilter, openSubject;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withPageSize", () => mockPassthruHoc);

function resetAll() {
	group = "subject";
	data = MockSubjectFilter;
	selected = { YRD: true, ANC: true };
	openSubject = true;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders load with props*/
test("Component renders load with props", async () => {
	selectFilter = jest.fn();
	const item = shallow(<SubjectFilterPresentation group={group} data={data} selected={selected} selectFilter={selectFilter} openSubject={false} />);
	expect(item.find("Heading").length).toBe(1);
});

/** User click on toggle header button*/
test("User click on toggle header button", async () => {
	selectFilter = jest.fn();
	const mockSetOpenSubjectFlag = jest.fn();
	const item = shallow(
		<SubjectFilterPresentation
			group={group}
			data={data}
			selected={selected}
			selectFilter={selectFilter}
			openSubject={openSubject}
			setOpenSubjectFlag={mockSetOpenSubjectFlag}
		/>
	);
	const btnHeader = item.find("Heading");
	btnHeader.simulate("click", { preventDefault: jest.fn() });
	expect(mockSetOpenSubjectFlag).toHaveBeenCalled();
});
