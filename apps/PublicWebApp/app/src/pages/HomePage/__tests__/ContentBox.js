// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow, mount } from "enzyme";
import ContentBox from "../ContentBox";
import withPageSize from "../../../common/withPageSize";

let mockFunction, props;
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

/**
 * Mock HOC imports
 */
jest.mock("../../../common/withPageSize", () => mockPassthruHoc);

/**
 * Mock asset imports
 */
jest.mock("../../../assets/images/EP_Laptop.png", () => jest.fn());
jest.mock("../../../assets/images/EP_Book.png", () => jest.fn());

/**
 * Reset function
 */
function resetAll() {
	mockFunction = jest.fn();
	props = {
		breakpoint: 30,
		primary_icon: "ac180e28f355ca6940b04a353a7498c6.png",
		onPress: mockFunction,
		button_text: "Search for a book",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly*/
test("Component renders correctly", async () => {
	const item = shallow(<ContentBox {...props} />);
	expect(item.find("Wrap").length).toBe(1);
	expect(item.find("Title").length).toBe(0);
});

test("Test When title is passed to the Component", async () => {
	props.title = "Title";
	const item = shallow(<ContentBox {...props} />);
	expect(item.find("Title").length).toBe(1);
});

test("Test With withPageSize HOC", async () => {
	withPageSize.MOBILE = 10;
	const item = shallow(<ContentBox {...props} />);
	expect(item.find("TopLeftDecoration").length).toBe(0);
	expect(item.find("BottomRightDecoration").length).toBe(0);

	item.setProps({ show_decorations: true });
	expect(item.find("TopLeftDecoration").length).toBe(1);
	expect(item.find("BottomRightDecoration").length).toBe(1);
});
