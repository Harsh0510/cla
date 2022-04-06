import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow } from "enzyme";
import ManualEntry from "../ManualEntry";

let props;

jest.mock("../../../common/withAdminAuthRequiredConsumer", () => {
	return function (acceptedRoles, WrappedComponent) {
		if (!Object.keys(acceptedRoles).length == 1) {
			throw "It should be passed acceptedToles with a single key";
		}
		if (!acceptedRoles.hasOwnProperty("school-admin" || "teacher")) {
			throw "It should be passed acceptedToles with a key: school-admin || teacher";
		}
		return WrappedComponent;
	};
});

function resetAll() {
	props = {
		history: { push: jest.fn() },
		title: "test title",
		isShowNotFoundTitle: false,
		location: { push: jest.fn() },
	};
}

beforeEach(resetAll);
afterEach(resetAll);

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

test("Component renders correctly", async () => {
	const item = shallow(<ManualEntry {...props} />);
	expect(item.find("FormWrapAddEdit").length).toBe(1);
});

test("Component renders correctly when isbn is passed", async () => {
	delete props.title;
	props.isbn = "0926777386";
	const item = shallow(<ManualEntry {...props} />);
	expect(item.find("FormWrapAddEdit").length).toBe(1);
});

test("Component renders correctly when isShowNotFoundTitle is true", async () => {
	props.isShowNotFoundTitle = true;
	const item = shallow(<ManualEntry {...props} />);
	expect(item.find("FormWrapAddEdit").length).toBe(1);
	expect(item.find("SubTitle").length).toBe(1);
});

test("When user enters invalid title", async () => {
	const item = shallow(<ManualEntry {...props} />);
	item.instance().doInputFieldChange("", "title");
	await wait(50);
	expect(item.instance().state.fields.title).toEqual("");
	expect(item.instance().state.valid.title.isValid).toEqual(false);
	expect(item.instance().state.valid.title.message).toEqual("Please add a title in this field.");
});

test("When user enters valid title", async () => {
	const item = shallow(<ManualEntry {...props} />);
	item.instance().doInputFieldChange("test", "title");
	expect(item.instance().state.fields.title).toEqual("test");
	expect(item.instance().state.valid.title.isValid).toEqual(true);
	expect(item.instance().state.valid.title.message).toEqual("");
});

test("When user enters invalid isbn", async () => {
	const item = shallow(<ManualEntry {...props} />);
	item.instance().doInputFieldChange("12345678", "isbn");
	expect(item.instance().state.fields.isbn).toEqual("12345678");
	expect(item.instance().state.valid.isbn.isValid).toEqual(false);
	expect(item.instance().state.valid.isbn.message).toEqual("Please provide a valid ISBN.");
});

test("When user enters valid isbn", async () => {
	const item = shallow(<ManualEntry {...props} />);
	item.instance().doInputFieldChange("0926777386", "isbn");
	expect(item.instance().state.fields.isbn).toEqual("0926777386");
	expect(item.instance().state.valid.isbn.isValid).toEqual(true);
	expect(item.instance().state.valid.isbn.message).toEqual("");
});

test("When user enters invalid author", async () => {
	const item = shallow(<ManualEntry {...props} />);
	item.instance().doInputFieldChange("", "author");
	expect(item.instance().state.fields.author).toEqual("");
	expect(item.instance().state.valid.author.isValid).toEqual(false);
	expect(item.instance().state.valid.author.message).toEqual("Please add an author in this field.");
});

test("When user enters valid author", async () => {
	const item = shallow(<ManualEntry {...props} />);
	item.instance().doInputFieldChange("test author", "author");
	expect(item.instance().state.fields.author).toEqual("test author");
	expect(item.instance().state.valid.author.isValid).toEqual(true);
	expect(item.instance().state.valid.author.message).toEqual("");
});

test("When user enters invalid publisher", async () => {
	const item = shallow(<ManualEntry {...props} />);
	item.instance().doInputFieldChange("", "publisher");
	expect(item.instance().state.fields.publisher).toEqual("");
	expect(item.instance().state.valid.publisher.isValid).toEqual(false);
	expect(item.instance().state.valid.publisher.message).toEqual("Please add a publisher in this field.");
});

test("When user enters valid publisher", async () => {
	const item = shallow(<ManualEntry {...props} />);
	item.instance().doInputFieldChange("test publisher", "publisher");
	expect(item.instance().state.fields.publisher).toEqual("test publisher");
	expect(item.instance().state.valid.publisher.isValid).toEqual(true);
	expect(item.instance().state.valid.publisher.message).toEqual("");
});

test("When user enters publicationYear", async () => {
	const item = shallow(<ManualEntry {...props} />);
	item.instance().doNumberFieldChange({ target: { name: "publicationYear", value: "2012" } });
	expect(item.instance().state.fields.publicationYear).toEqual("2012");
	expect(item.instance().state.valid.publicationYear.isValid).toEqual(true);
	expect(item.instance().state.valid.publicationYear.message).toEqual("");
});

test("When user enters valid data and clicks submit button", async () => {
	props.location.search = `?isbn=9781784617974`;
	const item = shallow(<ManualEntry {...props} />);
	item.instance().setState({
		fields: {
			title: "title",
			isbn: "isbn",
			author: "author",
			publisher: "publisher",
			publicationYear: "2012",
			pageCount: "100",
		},
	});

	item.find("FormWrapAddEdit").simulate("submit", {
		preventDefault: jest.fn(),
	});
	const push = item.instance().props.history.push;
	expect(push.mock.calls[0][0]).toEqual(
		"/asset-upload/upload-content?title=title&isbn=isbn&author=%5B%22author%22%5D&publisher=publisher&publicationYear=2012&pageCount=100&type=manual&search=9781784617974"
	);
});

test("When user enters valid data without publication year and clicks submit button", async () => {
	props.location.search = `?title=title`;
	const item = shallow(<ManualEntry {...props} />);
	item.instance().setState({
		fields: {
			title: "title",
			isbn: "isbn",
			author: "author",
			publisher: "publisher",
			publicationYear: "",
		},
	});

	item.find("FormWrapAddEdit").simulate("submit", {
		preventDefault: jest.fn(),
	});
	const push = item.instance().props.history.push;
	expect(push.mock.calls[0][0]).toEqual(
		"/asset-upload/upload-content?title=title&isbn=isbn&author=%5B%22author%22%5D&publisher=publisher&type=manual&search=title"
	);
});

test("When user enters blank string as isbn", async () => {
	const item = shallow(<ManualEntry {...props} />);
	item.instance().doInputFieldChange("", "isbn");
	expect(item.instance().state.fields.isbn).toEqual("");
	expect(item.instance().state.valid.isbn.isValid).toEqual(false);
	expect(item.instance().state.valid.isbn.message).toEqual("Please add an ISBN in this field.");
});

test("When user comes from upload your own extract page ", async () => {
	props.location.search = `?type=manual&search=9781784617974&isbn=9781784617974&title=yy&author=%5B"test"%5D&publisher=Publisher&publicationYear=2012`;
	const item = shallow(<ManualEntry {...props} />);
	expect(item.find("BackButton").length).toBe(1);
	expect(item.find("BackButton").text()).toBe("Back");
	expect(item.find("BackButton").props().to).toBe("/asset-upload/before-we-start?isbn=9781784617974");
});

test("When user comes from upload your own extract page ", async () => {
	props.location.search = `?type=manual&search=test&isbn=9781784617974&title=yy&author=%5B"test"%5D&publisher=Publisher&publicationYear=2012`;
	const item = shallow(<ManualEntry {...props} />);
	expect(item.find("BackButton").length).toBe(1);
	expect(item.find("BackButton").text()).toBe("Back");
	expect(item.find("BackButton").props().to).toBe("/asset-upload/before-we-start?title=test");
});
