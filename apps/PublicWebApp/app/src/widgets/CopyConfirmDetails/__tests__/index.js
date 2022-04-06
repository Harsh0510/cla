import React from "react";
import { shallow } from "enzyme";
import CopyConfirmDetails from "../index";
import mockrequest from "../../../mocks/MockAssetRequest";

let props;
jest.mock("../../../assets/images/cover_img.png", () => true);
function resetAll() {
	props = {
		isbn13: "9784476180107",
		workData: mockrequest.result[0],
		fields: {
			extract_title: "",
			school: "Euler Academy",
			course_oid: "a55fefae309d2b3bb3c52e7486c5999cbde1",
			course_name: "Class 1",
			work_title: "9784476180107",
			number_of_students: 100,
			exam_board: "AQA",
			upload_name: "",
		},
		selected: [12],
		userUploadedAsset: true,
		pageOffsetString: 12,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders correctly", async () => {
	const item = shallow(<CopyConfirmDetails {...props} />);
	expect(item.find("DetailsSection").length).toBe(1);
});

test("When selected pages is more than one", async () => {
	props.selected = [12, 13, 14];
	props.pageOffsetString = "12-14";
	const item = shallow(<CopyConfirmDetails {...props} />);
	expect(item.find("DetailsSection").length).toBe(1);
	expect(item.find("tr").at(2).childAt(0).childAt(0).text()).toEqual("Pages");
});

test("When asset is publisher uploaded and content form of asset is MI", async () => {
	props.workData.content_form = "MI";
	props.userUploadedAsset = false;
	const item = shallow(<CopyConfirmDetails {...props} />);
	expect(item.find("DetailsSection").length).toBe(1);
	expect(item.find("tr").at(0).childAt(0).childAt(0).text()).toEqual("Magazine/issue:");
});
