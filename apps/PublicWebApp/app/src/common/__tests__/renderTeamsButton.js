import React from "react";
import { shallow } from "enzyme";
import { RenderTeamsButtonComp } from "../renderTeamsButton";
let teams_image = false;
let mockAuthors, mockCompProps;
jest.mock("../../assets/images/teams.svg", () => {
	teams_image = true;
	return true;
});

jest.mock("../misc", () => {
	return {
		getLongFormContributors: () => {
			return mockAuthors;
		},
	};
});

const resetAll = () => {
	window = window;
	teams_image = false;
	mockAuthors = {
		authors: [
			{
				firstName: "Peter",
				lastName: "Clarke",
			},
		],
	};
	mockCompProps = {
		copiesData: [
			{
				title: "Test Extract Title",
				work_title: "Test Book",
				work_publisher: "Test work Publisher",
				school_name: "Test School Name",
				teacher: "School teacher name",
				date_created: "2020-04-08T10:28:48.091Z",
				date_expired: "2020-07-08T10:28:48.090Z",
				imprint: "Test School Imprint",
				work_authors: [
					{
						firstName: "Peter",
						lastName: "Clarke",
						role: "A",
					},
				],
			},
		],
		url: "http://host.domain.name/pagename",
		accessCode: null,
	};
};

beforeEach(resetAll);
afterEach(resetAll);

test(`Renders correctly`, () => {
	const item = shallow(<RenderTeamsButtonComp copiesData={mockCompProps.copiesData} url={mockCompProps.url} />);
	expect(item.find("TeamsImage").length).toBe(1);
});

test(`clicking on teams button`, () => {
	const item = shallow(<RenderTeamsButtonComp copiesData={mockCompProps.copiesData} url={mockCompProps.url} />);
	let isPopupOpen = false;
	window.open = (arg1, arg2, arg3) => {
		isPopupOpen = true;
	};
	item.find("TeamsImageDiv").simulate("click", {
		preventDefault: () => {},
	});
	expect(isPopupOpen).toBe(true);
});

test(`clicking on teams button when  small screen`, () => {
	window.innerWidth = 600;
	let data = mockCompProps.copiesData;
	delete data.work_authors;
	const item = shallow(<RenderTeamsButtonComp copiesData={data} url={mockCompProps.url} />);
	let isPopupOpen = false;
	window.open = (arg1, arg2, arg3) => {
		isPopupOpen = true;
	};
	item.find("TeamsImageDiv").simulate("click", {
		preventDefault: () => {},
	});
	expect(isPopupOpen).toBe(true);
});

test(`User not get the authors data in assignedInstr details`, () => {
	mockAuthors = null;
	window.innerWidth = 600;
	let data = mockCompProps.copiesData;
	const item = shallow(<RenderTeamsButtonComp copiesData={data} url={mockCompProps.url} />);
	let isPopupOpen = false;
	window.open = (arg1, arg2, arg3) => {
		isPopupOpen = true;
	};
	item.find("TeamsImageDiv").simulate("click", {
		preventDefault: () => {},
	});
	expect(isPopupOpen).toBe(true);
});

test(`User get the access code details in assignedInstr details`, () => {
	mockAuthors = null;
	window.innerWidth = 600;
	mockCompProps.accessCode = "123456";
	const item = shallow(<RenderTeamsButtonComp {...mockCompProps} />);
	let isPopupOpen = false;
	window.open = (arg1, arg2, arg3) => {
		isPopupOpen = true;
	};
	item.find("TeamsImageDiv").simulate("click", {
		preventDefault: () => {},
	});
	expect(isPopupOpen).toBe(true);
});

test(`User get the shorter text when assignTitle length > 50 and assignInstr length > 200`, () => {
	mockAuthors = null;
	window.innerWidth = 600;
	mockCompProps.copiesData[0].title = "Test Extract " + "T".repeat(50);
	mockCompProps.copiesData[0].school_name = "Test School name " + "T".repeat(200);
	const item = shallow(<RenderTeamsButtonComp {...mockCompProps} />);
	let isPopupOpen = false;
	window.open = (arg1, arg2, arg3) => {
		isPopupOpen = true;
	};
	item.find("TeamsImageDiv").simulate("click", {
		preventDefault: () => {},
	});
	expect(isPopupOpen).toBe(true);
});

test(`User get the shorter text when assignTitle length > 50 and assignInstr length > 200`, () => {
	mockAuthors = null;
	window.innerWidth = 600;
	mockCompProps.copiesData[0].title = "Test Extract " + "T".repeat(50);
	mockCompProps.copiesData[0].school_name = "Test School name " + "T".repeat(200);
	const item = shallow(<RenderTeamsButtonComp {...mockCompProps} />);
	let isPopupOpen = false;
	window.open = (arg1, arg2, arg3) => {
		isPopupOpen = true;
	};
	item.find("TeamsImageDiv").simulate("click", {
		preventDefault: () => {},
	});
	expect(isPopupOpen).toBe(true);
});

test(`User get the shorter text when assignTitle length > 50 and assignInstr length > 200`, () => {
	mockAuthors = null;
	window.innerWidth = 600;
	mockCompProps.copiesData[0].title = "Test Extract " + "T".repeat(50);
	mockCompProps.copiesData[0].school_name = "T";
	mockCompProps.copiesData[0].work_title = "W";
	mockCompProps.copiesData[0].teacher = "W";
	mockCompProps.copiesData[0].work_title = "W";
	mockCompProps.copiesData[0].work_title = "W";
	mockCompProps.copiesData[0].work_title = "W";
	mockCompProps.accessCode = null;

	mockAuthors = { authors: [] };

	const item = shallow(<RenderTeamsButtonComp {...mockCompProps} />);
	let isPopupOpen = false;
	window.open = (arg1, arg2, arg3) => {
		isPopupOpen = true;
	};
	item.find("TeamsImageDiv").simulate("click", {
		preventDefault: () => {},
	});
	expect(isPopupOpen).toBe(true);
});
