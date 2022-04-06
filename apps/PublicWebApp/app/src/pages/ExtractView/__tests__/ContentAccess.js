// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import ContentAccess from "../ContentAccess";

let props, mockFunction, isCalledSetDefaultCoverImage;

jest.mock("../../../assets/images/key-big-white.png", () => {});

jest.mock("../../../common/setDefaultCoverImage.js", () => {
	return () => {
		isCalledSetDefaultCoverImage = true;
	};
});

/** reset function: call before and after each test case */
function resetAll() {
	mockFunction = jest.fn();
	props = {
		access_validation_message: null,
		data: {
			course_name: "English/7-2",
			date_created: "2020-05-09T12:02:35.488Z",
			enable_extract_share_access_code: true,
			extract_title: "copy new",
			work_isbn13: "9781471897344",
			work_title: "Reading Planet - Be an Astronaut - Turquoise: Galaxy",
		},
		error: "requireaccesscode",
		pageTitle: undefined,
		onChangeAccessCode: mockFunction,
		submitAccessCode: mockFunction,
	};
	isCalledSetDefaultCoverImage = false;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = shallow(<ContentAccess {...props} />);
	expect(item.find("HeadTitle").length).toBe(1);
	expect(item.find("MainTitleWrap").length).toBe(1);
	expect(item.find("PageWrapper").length).toBe(1);
	expect(item.find("AccessContentSection").length).toBe(1);
});

/** Simulate events */
test(`Simulate on-click event when user submits access-code`, async () => {
	const item = shallow(<ContentAccess {...props} />);
	const button = item.find("Button");
	button.simulate("click");
	expect(mockFunction).toHaveBeenCalled();
});

test(`Simulate on-change event when user enters access-code`, async () => {
	const item = shallow(<ContentAccess {...props} />);
	const button = item.find("AccessCodeInput");
	button.simulate("change", {
		target: {
			value: "12456",
		},
	});
	expect(mockFunction).toHaveBeenCalled();
});

/** Test validation and error messages */
test(`Test validation message when user inputs invalid access-code`, async () => {
	props.access_validation_message = "Enter a given five digit access code";
	const item = shallow(<ContentAccess {...props} />);
	const button = item.find("Button");
	expect(button.props().disabled).toBe(true);
	expect(item.find("AccessCodeValidationMessage").text()).toEqual(props.access_validation_message);
});

test(`Test error message when user input wrong access-code`, async () => {
	props.error = "invalidaccesscode";
	const item = shallow(<ContentAccess {...props} />);
	expect(item.find("Error").length).toBe(1);
	expect(item.find("Error").text()).toEqual("Your password is incorrect.");
});

test(`When asset does not have cover image`, async () => {
	const item = shallow(<ContentAccess {...props} />);
	item.find("img").at(1).simulate("error");
	expect(isCalledSetDefaultCoverImage).toBeTruthy();
});
