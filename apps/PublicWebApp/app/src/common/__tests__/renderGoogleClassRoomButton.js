import React from "react";
import { shallow } from "enzyme";
import { RenderGoogleClassRoomButtonComp } from "../../common/renderGoogleClassRoomButton";
let isIcon32,
	isIcon36,
	isIcon48 = false;
jest.mock("../../assets/images/classRoomIcon32Px.png", () => {
	isIcon32 = true;
	return true;
});
jest.mock("../../assets/images/classRoomIcon36Px.png", () => {
	isIcon36 = true;
	return true;
});
jest.mock("../../assets/images/classRoomIcon48Px.png", () => {
	isIcon48 = true;
	return true;
});

const compProps = {
	copiesData: [
		{
			work_title: "Test Work Title",
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
};

const resetAll = () => {
	window = window;
	isIcon32 = false;
	isIcon36 = false;
	isIcon48 = false;
};

beforeEach(resetAll);
afterEach(resetAll);

test(`Renders correctly`, () => {
	const item = shallow(<RenderGoogleClassRoomButtonComp copiesData={compProps.copiesData} url={compProps.url} iconSize={48} />);
	expect(item.find("ClassRoomImage").length).toBe(1);
});

test(`clicking on classroom button`, () => {
	const item = shallow(<RenderGoogleClassRoomButtonComp copiesData={compProps.copiesData} url={compProps.url} iconSize={36} />);
	let isPopupOpen = false;
	window.open = (arg1, arg2, arg3) => {
		isPopupOpen = true;
	};
	item.find("ClassRoomImageDiv").simulate("click", {
		preventDefault: () => {},
	});
	expect(isPopupOpen).toBe(true);
});

test(`if Icon size is not passed it renders 32 px icon`, () => {
	const item = shallow(<RenderGoogleClassRoomButtonComp copiesData={compProps.copiesData} url={compProps.url} />);
	expect(isIcon32).toBe(true);
});

test(`clicking on classroom button when  small screen`, () => {
	window.innerWidth = 600;
	let data = compProps.copiesData;
	delete data.work_authors;
	const item = shallow(<RenderGoogleClassRoomButtonComp copiesData={data} url={compProps.url} />);
	let isPopupOpen = false;
	window.open = (arg1, arg2, arg3) => {
		isPopupOpen = true;
	};
	item.find("ClassRoomImageDiv").simulate("click", {
		preventDefault: () => {},
	});
	expect(isPopupOpen).toBe(true);
});
