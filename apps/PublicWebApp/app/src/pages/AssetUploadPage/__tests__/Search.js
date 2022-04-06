import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow } from "enzyme";
import Search from "../Search";

let props;

function resetAll() {
	props = { history: { push: jest.fn() }, location: { push: jest.fn() } };
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders correctly", async () => {
	const item = shallow(<Search {...props} />);
	expect(item.find("HeadTitle").length).toBe(1);
});

test("Submit button is disabled when user does not enter anything in the search box", async () => {
	const item = shallow(<Search {...props} />);
	item.instance().handleInputChange({ target: { value: "" } });
	expect(item.find("HeadTitle").length).toBe(1);
	expect(item.find("Button").props().disabled).toBe(true);
});

test("Submit button is enabled when user enters anything in the search box", async () => {
	const item = shallow(<Search {...props} />);
	item.instance().handleInputChange({ target: { value: "a" } });
	expect(item.find("HeadTitle").length).toBe(1);
	expect(item.find("Button").props().disabled).toBe(false);
});

test("When user enter valid isbn", async () => {
	const item = shallow(<Search {...props} />);
	item.instance().handleInputChange({ target: { value: "9780198426707" } });
	expect(item.find("HeadTitle").length).toBe(1);
	expect(item.find("Button").props().disabled).toBe(false);
	expect(item.instance().state.isbn).toEqual("9780198426707");
	expect(item.instance().state.title).toEqual("");
});

test("When user does not enter valid isbn", async () => {
	const item = shallow(<Search {...props} />);
	item.instance().handleInputChange({ target: { value: "23242" } });
	expect(item.find("HeadTitle").length).toBe(1);
	expect(item.find("Button").props().disabled).toBe(false);
	expect(item.instance().state.isbn).toEqual("");
	expect(item.instance().state.title).toEqual("23242");
});

test("When user clicks on submit button and enters title", async () => {
	const item = shallow(<Search {...props} />);
	item.instance().handleInputChange({ target: { value: "23242" } });
	item.instance().doSubmit({ preventDefault: jest.fn() });
	expect(item.find("HeadTitle").length).toBe(1);
	expect(item.find("Button").props().disabled).toBe(false);
	expect(item.instance().state.isbn).toEqual("");
	expect(item.instance().state.title).toEqual("23242");
	const push = item.instance().props.history.push;
	expect(push.mock.calls[0][0]).toEqual("/asset-upload/search?title=23242");
});

test("When user clicks on submit button and enters isbn", async () => {
	const item = shallow(<Search {...props} />);
	item.instance().handleInputChange({ target: { value: "9780198426707" } });
	item.instance().doSubmit({ preventDefault: jest.fn() });
	expect(item.find("HeadTitle").length).toBe(1);
	expect(item.find("Button").props().disabled).toBe(false);
	expect(item.instance().state.isbn).toEqual("9780198426707");
	expect(item.instance().state.title).toEqual("");
	const push = item.instance().props.history.push;
	expect(push.mock.calls[0][0]).toEqual("/asset-upload/search?isbn=9780198426707");
});
