// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import NotFoundPage from "../index";
import Header from "../../../widgets/Header";

// Mock asset imports
jest.mock("../../../widgets/PageWrap/images/Sign_in_Shape_1.svg", () => jest.fn());
jest.mock("../../../widgets/PageWrap/images/Sign_in_Shape_2.svg", () => jest.fn());
jest.mock("../../../assets/images/Hero_image_mobile.jpg", () => jest.fn());
jest.mock("../../../assets/images/Hero_image_Desktop.jpg", () => jest.fn());
jest.mock("../../../assets/icons/Play_video.png", () => jest.fn());
jest.mock("../../../assets/images/rhema-kallianpur-471933-unsplash.jpg", () => jest.fn());
jest.mock("../../../assets/icons/arrow.svg", () => jest.fn());

let mockUserData = {
	data: {
		first_name: "Test",
		last_name: "Surname",
		role: "teacher",
		school: null,
	},
};

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
	// api = null;
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders correctly", async () => {
	const item = shallow(<NotFoundPage />);
	expect(item.find(Header).length).toBe(1);
});
