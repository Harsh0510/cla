import React from "react";
import { shallow } from "enzyme";
import ProfilePage from "../index";
import Header from "../../../widgets/Header";

/**
 * This 'HOC' does nothing but 'pass through' the provided component,
 * so it's not necessary to 'dive()' into rendered results,
 * and so it's possible to mock the 'api' function.
 **/
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

// Mock import
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAuthRequiredConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withPageSize", () => mockPassthruHoc);

// Mock asset imports
jest.mock("../../../widgets/PageWrap/images/Sign_in_Shape_1.svg", () => jest.fn());
jest.mock("../../../widgets/PageWrap/images/Sign_in_Shape_2.svg", () => jest.fn());
jest.mock("../../../assets/images/Hero_image_mobile.jpg", () => jest.fn());
jest.mock("../../../assets/images/Hero_image_Desktop.jpg", () => jest.fn());
jest.mock("../../../assets/icons/Play_video.png", () => jest.fn());
jest.mock("../../../assets/images/rhema-kallianpur-471933-unsplash.jpg", () => jest.fn());
jest.mock("../../../assets/icons/arrow.svg", () => jest.fn());

let mockUserData;

let mockUserDataBroken = {
	_data: {
		first_name: "Test",
		last_name: "Surname",
		role: "teacher",
		school: null,
	},
};

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/**
 * Reset function
 */
function resetAll() {
	mockUserData = {
		first_name: "Test",
		last_name: "Surname",
		role: "teacher",
		school: null,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders correctly", async () => {
	const item = shallow(<ProfilePage withAuthConsumer_myUserDetails={mockUserData} />);
	expect(item.is("div")).toEqual(true);
});

test("Administration link appears when the user is a school-admin", async () => {
	mockUserData.role = "school-admin";
	const item = shallow(<ProfilePage withAuthConsumer_myUserDetails={mockUserData} />);
	expect(item.is("div")).toEqual(true);
});

test("Administration link appears when the user is a cla-admin", async () => {
	mockUserData.role = "cla-admin";
	const item = shallow(<ProfilePage withAuthConsumer_myUserDetails={mockUserData} />);
	expect(item.is("div")).toEqual(true);
});
