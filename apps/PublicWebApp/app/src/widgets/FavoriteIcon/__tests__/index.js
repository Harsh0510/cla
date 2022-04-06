import React from "react";
import { shallow } from "enzyme";
import Favorite from "../index";

let props, mockFunction;
/**
 * Reset function
 */
function resetAll() {
	mockFunction = jest.fn();
	props = {
		onClick: mockFunction,
		data: "data",
		is_favorite: true,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders correctly", async () => {
	const item = shallow(<Favorite {...props} />);
	expect(item.find("Wrap").length).toEqual(1);
	expect(item.find("FontAwesomeIcon").length).toEqual(1);
});

test("When user hover on Favourites icon get message 'Add this book to your favourites'", async () => {
	props.is_favorite = false;
	const item = shallow(<Favorite {...props} />);
	expect(item.find("Wrap").length).toEqual(1);
	expect(item.find("Wrap").prop("title")).toEqual("Add this book to your favourites");
	expect(item.find("FontAwesomeIcon").length).toEqual(1);
});

test("When user hover on Favourites icon get message 'Remove this book from your favourites'", async () => {
	const item = shallow(<Favorite {...props} />);
	expect(item.find("Wrap").length).toEqual(1);
	expect(item.find("Wrap").prop("title")).toEqual("Remove this book from your favourites");
	expect(item.find("FontAwesomeIcon").length).toEqual(1);
});

test("user click on favorite icon", async () => {
	const item = shallow(<Favorite {...props} />);
	item.instance().onClick({ preventDefault: jest.fn() });
	expect(item.find("Wrap").length).toEqual(1);
	expect(item.find("FontAwesomeIcon").length).toEqual(1);
});
