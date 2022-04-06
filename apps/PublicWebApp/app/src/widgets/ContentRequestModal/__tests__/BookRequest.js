import React from "react";
import { shallow } from "enzyme";
import BookRequest from "../BookRequest";

let props;

function resetAll() {
	props = {
		data: {
			isbn: "",
			publisher: "",
			title: "",
			publicationYear: "",
			author: "",
			url: "",
		},
		onChange: jest.fn(),
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders correctly", async () => {
	const item = shallow(<BookRequest {...props} />);
	expect(item.find("FormWrapper").length).toBe(1);
	expect(item.find("Title").length).toBe(1);
	expect(item.find("Title").text()).toBe("The more information you can give us the easier it is for us to obtain the correct book for you.");
});

test("User modify isbn value", async () => {
	const item = shallow(<BookRequest {...props} />);
	item.instance().doInputFieldChange("1234567890", "isbn");
	expect(props.onChange).toHaveBeenCalled();
});

test("User modify publiction year value", async () => {
	const item = shallow(<BookRequest {...props} />);
	item.instance().doInputFieldChange("2000", "publicationYear");
	expect(props.onChange).toHaveBeenCalled();
});

test("User remove publiction year value", async () => {
	props.publicationYear = 2020;
	const item = shallow(<BookRequest {...props} />);
	item.instance().doInputFieldChange("", "publicationYear");
	expect(props.onChange).toHaveBeenCalled();
});

test("User modify isbn value and show error", async () => {
	const item = shallow(<BookRequest {...props} />);
	item.instance().doInputFieldChange("12345678", "isbn");
	expect(item.state().isbnError).toEqual("Please make sure that there are at least 9 digits.");
	expect(props.onChange).toHaveBeenCalled();
});

test("User modify publisher value", async () => {
	const item = shallow(<BookRequest {...props} />);
	item.instance().doInputFieldChange("publisher test", "publisher");
	expect(props.onChange).toHaveBeenCalled();
});

test("User modify author value", async () => {
	const item = shallow(<BookRequest {...props} />);
	item.instance().doInputFieldChange("test", "author");
	expect(props.onChange).toHaveBeenCalled();
});

test("User modify title value", async () => {
	const item = shallow(<BookRequest {...props} />);
	item.instance().doInputFieldChange("test title", "title");
	expect(props.onChange).toHaveBeenCalled();
});

test("User modify url value", async () => {
	const item = shallow(<BookRequest {...props} />);
	item.instance().doInputFieldChange("url test", "url");
	expect(props.onChange).toHaveBeenCalled();
});

test("User remove isbn value", async () => {
	props.isbn = "123456789";
	const item = shallow(<BookRequest {...props} />);
	item.instance().doInputFieldChange("", "isbn");
	expect(props.onChange).toHaveBeenCalled();
});
