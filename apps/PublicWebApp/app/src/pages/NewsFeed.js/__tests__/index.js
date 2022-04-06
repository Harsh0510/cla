// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import NewsFeed from "../index";

let mockResultGetCategories, mockResultUpdateCategories;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

/**
 * Mock HOC
 */
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAdminAuthRequiredConsumer", () => {
	return function (acceptedRoles, WrappedComponent) {
		if (!Object.keys(acceptedRoles).length == 1) {
			throw "It should be passed acceptedToles with a single key";
		}
		if (!acceptedRoles.hasOwnProperty("cla-admin")) {
			throw "It should be passed acceptedToles with a key: cla-admin || school-admin || teacher";
		}
		return WrappedComponent;
	};
});

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/**
 * Reset function
 */
function resetAll() {
	mockResultGetCategories = {
		data: [{ id: 1, blog_category_names: ["www.google.com"], _count_: 0 }],
	};
	mockResultUpdateCategories = {
		result: true,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

async function defaultApi(endpoint, data) {
	if (endpoint === "/admin/home-screen-blog-get-categories") {
		return mockResultGetCategories;
	} else if (endpoint === "/admin/home-screen-blog-category-update") {
		return mockResultUpdateCategories;
	}
	throw new Error("should never be here");
}

test("Component renders correctly", async () => {
	const item = shallow(<NewsFeed api={defaultApi} />);
	expect(item.find("AdminPageWrap").length).toBe(1);
});

test("Test when news feeds categories are successfully updated", async () => {
	const e = {
		preventDefault: jest.fn(),
	};
	const item = shallow(<NewsFeed api={defaultApi} />);
	item.setState({ blog_category_names_value: ["www.google.com"] });
	item.find("FormWrapAddEdit").props().onSubmit(e);

	await wait(50);
	expect(item.state("message")).toEqual("Successfully updated");
	expect(item.state("blog_category_names_value")).toEqual(["www.google.com"]);
	expect(item.state("blog_category_names_valid")).toEqual([true]);
	expect(item.state("currentItem")).toEqual({ blog_category_names: ["www.google.com"] });
});

test("Test when news feeds categories are not updated", async () => {
	mockResultUpdateCategories.result = false;
	const e = {
		preventDefault: jest.fn(),
	};
	const item = shallow(<NewsFeed api={defaultApi} />);
	item.setState({ blog_category_names_value: ["www.google.com"] });
	item.find("FormWrapAddEdit").props().onSubmit(e);

	await wait(50);
	expect(item.state("message")).toEqual("Record not updated");
});

test("Test when category name is not valid", async () => {
	mockResultUpdateCategories.result = false;
	const item = shallow(<NewsFeed api={defaultApi} />);
	item.setState({ blog_category_names_valid: [true, false] });

	item.update();
	await wait(50);
	expect(item.find("FormSaveButton").props().disabled).toBe(false);
});

test("Test onCategoryNameChange method while updating category", async () => {
	const item = shallow(<NewsFeed api={defaultApi} />);
	item.instance().onCategoryNameChange("name", ["w"], [false]);

	expect(item.state("blog_category_names_value")).toEqual(["w"]);
	expect(item.state("blog_category_names_valid")).toEqual([false]);
});

test("Test performQuery method while updating category", async () => {
	mockResultGetCategories.data = [];
	const item = shallow(<NewsFeed api={defaultApi} />);
	item.instance().performQuery();

	expect(item.state("blog_category_names_value")).toEqual([]);
	expect(item.state("blog_category_names_valid")).toEqual([]);
});

test("Test getFieldValuesForUpdate method while updating category", async () => {
	mockResultGetCategories.data = [];
	const currentItem = {
		blog_category_names: "",
	};
	const item = shallow(<NewsFeed api={defaultApi} />);
	const param = item.instance().getFieldValuesForUpdate(currentItem, currentItem);
	expect(param).toEqual({});
});

test('User getting the "Unknown Error" when updating the news feeds categories', async () => {
	async function customApi(endpoint, data) {
		if (endpoint === "/admin/home-screen-blog-category-update") {
			throw "Unknown Error";
		}
		defaultApi(endpoint, data);
	}
	const e = {
		preventDefault: jest.fn(),
	};
	const item = shallow(<NewsFeed api={customApi} />);
	item.setState({ blog_category_names_value: ["www.google.com"] });
	item.find("FormWrapAddEdit").props().onSubmit(e);

	await wait(50);
	expect(item.state("message")).toEqual("Unknown Error");
});
