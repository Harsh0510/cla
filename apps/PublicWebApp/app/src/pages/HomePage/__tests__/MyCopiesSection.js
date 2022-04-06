// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import MyCopiesSection from "../MyCopiesSection";
import Loader from "../../../widgets/Loader";
import MockMyCopies from "../../../mocks/MockMyCopies";
import MockMyDetails from "../../../mocks/MockMyDetails";

let mockData, mockError, props, mockMyUserDetails, isCalledSetDefaultCoverImage;

jest.mock("../../../common/setDefaultCoverImage.js", () => {
	return () => {
		isCalledSetDefaultCoverImage = true;
	};
});

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/**
 * This 'HOC' does nothing but 'pass through' the provided component,
 * so it's not necessary to 'dive()' into rendered results,
 * and so it's possible to mock the 'api' function.
 **/
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

/** mock declaration */
jest.mock("../../../assets/images/publishers.png", () => jest.fn());
jest.mock("../../../assets/icons/arrow_white.png", () => jest.fn());

// Mock import
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAuthConsumer", () => mockPassthruHoc);
/**
 * Reset function
 */
function resetAll() {
	mockData = null;
	mockError = null;
	mockMyUserDetails = MockMyDetails;
	props = {
		data: mockData,
		error: mockError,
		withAuthConsumer_myUserDetails: mockMyUserDetails,
	};
	isCalledSetDefaultCoverImage = false;
}

beforeEach(resetAll);
afterEach(resetAll);

/**  Component renders without data*/
test("Component renders without data", async () => {
	const item = shallow(<MyCopiesSection {...props} />);
	expect(item.containsMatchingElement(<Loader />)).toBe(true);
});

/**  Component renders with data*/
test("Component renders with data", async () => {
	props = {
		data: MockMyCopies.result,
		error: null,
		withAuthConsumer_myUserDetails: mockMyUserDetails,
	};
	const item = shallow(<MyCopiesSection {...props} />);

	await wait(1000);
	item.update();

	expect(item.find("h2").text()).toEqual("Recent Copies (3)");
});

/**  Component renders with data and getting error*/
test("Component load with data and getting error", async () => {
	props = {
		data: MockMyCopies.result,
		error: "something went to wrong",
		withAuthConsumer_myUserDetails: mockMyUserDetails,
	};
	const item = shallow(<MyCopiesSection {...props} />);

	await wait(1000);
	item.update();

	expect(item.find(".book-slider-section div").text()).toEqual("something went to wrong");
});

/**  Component renders with empty data*/
test("Component load with empty data", async () => {
	props = {
		data: [],
		error: "",
		withAuthConsumer_myUserDetails: mockMyUserDetails,
	};
	const item = shallow(<MyCopiesSection {...props} />);

	await wait(1000);
	item.update();

	expect(item.find("strong").text()).toEqual("No copies found.");
});

test("User can able to click on recent copy and able to resdirect to copy page", async () => {
	mockMyUserDetails.can_copy = true;
	props = {
		data: MockMyCopies.result,
		error: null,
		withAuthConsumer_myUserDetails: mockMyUserDetails,
	};
	const item = shallow(<MyCopiesSection {...props} />);
	await wait(1000);
	item.update();
	expect(item.find("BookSlide").length).toEqual(3);
});

test("Use seen the popup modal When click on recent copy", async () => {
	mockMyUserDetails.can_copy = false;
	mockMyUserDetails.has_trial_extract_access = true;
	props = {
		data: MockMyCopies.result,
		error: "",
		withAuthConsumer_myUserDetails: mockMyUserDetails,
	};
	const item = shallow(<MyCopiesSection {...props} />);
	await wait(1000);
	item.update();
	expect(item.find("BookSlideSpan").length).toEqual(3);
	const copy11 = item.find("BookSlideSpan").first();
	copy11.simulate("click", {});
	await wait(20);
	item.update();
	expect(item.state("showModal")).toEqual(true);

	item.instance().handleClose();
	await wait(20);
	item.update();
	expect(item.state("showModal")).toEqual(false);
});

test(`When asset does not have cover image`, async () => {
	props = {
		data: MockMyCopies.result,
		error: null,
		withAuthConsumer_myUserDetails: mockMyUserDetails,
	};
	const item = shallow(<MyCopiesSection {...props} />);
	item.find("BookImage").at(0).simulate("error");
	expect(isCalledSetDefaultCoverImage).toBeTruthy();
});
