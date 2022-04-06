// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import CreateCopyForm from "../CreateCopyForm";
import { watchFile } from "fs";
import MockUser from "../../../mocks/MockUser";

let coursesData, userData;

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	coursesData = [
		{
			title: "Maths 04",
			identifier: "Maths 04",
			year_group: "y12",
			oid: "8f47f584d8014eed2e725e770772132d8a02",
		},
		{
			title: "Maths 14",
			identifier: "Maths 14",
			year_group: "Y13",
			oid: "5157ce829a75ec91fa2a190242ead86e41c7",
		},
	];
}

beforeEach(resetAll);
afterEach(resetAll);

/**Mock functions */
const mockOnCreateCopySubmit = jest.fn();

/** Component renders correctly without props */
test("Component renders correctly", async () => {
	userData = MockUser[0];
	coursesData = null;
	const item = shallow(<CreateCopyForm coursesData={coursesData} userData={userData} />);

	expect(item.find("Form").length).toEqual(1);
});

/** Component renders correctly with coursesData */
test("Component renders correctly with coursesData", async () => {
	const item = shallow(<CreateCopyForm coursesData={coursesData} />);

	expect(item.find("Form").length).toBe(1);
});

/** User select Pages for copy */
/** handlePagesChange */
test("User select Pages for copy", async () => {
	const item = shallow(<CreateCopyForm coursesData={coursesData} />);

	const pages = item.state().pages;
	item.instance().handlePagesChange({ target: { value: "1" } });

	expect(item.state().pages).not.toBe(pages);
});

/** User click on create new copy button  */
test("User click on create new copy button", async () => {
	const mockOnCreateCopySubmit = jest.fn();
	const item = shallow(
		<CreateCopyForm coursesData={coursesData} onCloseFlyOut={jest.fn()} flyOutIndex={1} onCreateCopySubmit={mockOnCreateCopySubmit} />
	);

	item.setState({ pages: "1-2-3-5", selectedClass: coursesData[0].oid });

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	item.instance().handleSubmit({ preventDefault: jest.fn() });
	expect(mockOnCreateCopySubmit).toHaveBeenCalled();
});

/** User select cource for copy */
/** handleCourseChange */
test("User select cource for copy", async () => {
	const item = shallow(<CreateCopyForm onCloseFlyOut={jest.fn()} flyOutIndex={0} coursesData={coursesData} />);

	const course = item.state().course;
	item.instance().handleDrpChange();

	expect(item.state().selectedClass).not.toBe(null);
});

/** User click on Create new copy button without adding the form data */
test("User click on Create new copy button without adding the form data", async () => {
	const item = shallow(<CreateCopyForm coursesData={coursesData} onCreateCopySubmit={mockOnCreateCopySubmit} />);

	item.instance().handleSubmit({ preventDefault: jest.fn() });
	expect(mockOnCreateCopySubmit).not.toHaveBeenCalled();
});

/** User click on Create new copy button as Pages:"-"  */
test('User click on Create new copy button as Pages:"-"', async () => {
	const item = shallow(<CreateCopyForm coursesData={coursesData} onCreateCopySubmit={mockOnCreateCopySubmit} />);

	const course = item.state().course;

	item.instance().handleDrpChange();
	expect(item.state().course).not.toBe(null);

	item.instance().handlePagesChange({ target: { value: "-" } });
	expect(item.state().pages).toBe("-");

	item.instance().handleSubmit({ preventDefault: jest.fn() });
	expect(mockOnCreateCopySubmit).not.toHaveBeenCalled();
});

/** User click on Create new copy button as Pages:"-"  */
test('User click on Create new copy button as Pages:"-100, -200, 5001, 5003, 5003, 90000"', async () => {
	const item = shallow(<CreateCopyForm coursesData={coursesData} onCreateCopySubmit={mockOnCreateCopySubmit} />);

	item.instance().handleDrpChange();
	expect(item.state().selectedClass).not.toBe(null);

	item.instance().handlePagesChange({ target: { value: "-100, -200, 5001, 5003, 5003, 90000" } });
	expect(item.state().pages).toBe("-100,-200,5001,5003,5003,90000");

	item.instance().handleSubmit({ preventDefault: jest.fn() });
	expect(mockOnCreateCopySubmit).not.toHaveBeenCalled();
});

/** User click on Create new copy button as Pages:"-"  */
test('User click on Create new copy button as Pages:"1-8,15-25,6,2,3,4"', async () => {
	const item = shallow(<CreateCopyForm coursesData={coursesData} onCreateCopySubmit={mockOnCreateCopySubmit} />);

	item.setState({
		selectedClass: { value: "11152bb4a68bf2ce3a6fa1adb595bdde8643", label: "English/7-1", key: "11152bb4a68bf2ce3a6fa1adb595bdde8643" },
	});
	expect(item.state().selectedClass).not.toBe(null);

	item.instance().handlePagesChange({ target: { value: "1-8,15-25,6,2,3,4" } });
	expect(item.state().pages).toBe("1-8,15-25,6,2,3,4");

	item.instance().handleSubmit({ preventDefault: jest.fn() });
	expect(mockOnCreateCopySubmit).toHaveBeenCalled();
});

/** User click on Create new copy button as Pages:"-"  */
test("Redirect on selection of Create class", async () => {
	const item = shallow(<CreateCopyForm coursesData={coursesData} onCreateCopySubmit={mockOnCreateCopySubmit} />);

	const selectedClass = item.state().selectedClass;

	item.instance().handleDrpChange();
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	expect(item.state().selectedClass).not.toBe(null);
});

test("Redirect on Create new class", async () => {
	const item = shallow(<CreateCopyForm coursesData={coursesData} onCreateCopySubmit={mockOnCreateCopySubmit} />);

	item.setState({ redirectToCreateClass: true });

	item.instance().handleDrpChange();
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	expect(mockOnCreateCopySubmit).toHaveBeenCalled();
});
