// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import AddEdit from "../AddEdit";

/** Mock data variables*/
let props, mockFunction;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

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

/** Mock function for pass mock form data */
jest.mock("../../../common/CustomFormData", () => {
	return function () {
		const ret = {
			get: (action) => {
				if (action === "active") {
					return true;
				}
				return false;
			},
		};
		return ret;
	};
});

/** wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/** resetAll for reset the values */
function resetAll() {
	mockFunction = jest.fn();
	props = {
		key: "1036",
		handleSubmit: mockFunction,
		cancelAddEdit: mockFunction,
		message: "",
		fields: {
			id: 1036,
			isbn13: "9780415447096",
			pdf_isbn13: "9781134063321",
			title: "1001 Brilliant Writing Ideas: Teaching Inspirational Story-Writing for All Ages",
			publisher_name_log: "Taylor and Francis",
			imprint: "Taylor and Francis",
			active: true,
			buy_book_rules: ["www.google.com", "www.facebook.com"],
		},
		action: "edit",
		message: null,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<AddEdit {...props} />);
	expect(item.find("FormWrapAddEdit").length).toBe(1);
});

/** Test form messages renders correctly */
test("Test form messages renders correctly", async () => {
	props.message = "No fields updated";
	const item = shallow(<AddEdit {...props} />);
	const valid = item.instance().buyBookIsValid();
	expect(item.find("FormMessage").length).toBe(1);
	expect(item.find("FormMessage").text()).toBe(props.message);
});

/** On Update check buy book validation rule*/
test("On Update check buy book validation rule", async () => {
	props.fields.buy_book_rules = ["Book Rule1", "Book Rule 2"];
	const item = shallow(<AddEdit {...props} />);
	const valid = item.instance().buyBookIsValid();
	expect(valid).toBe(true);
});

/** When user change in buy book rules text box*/
test("When user change in buy book rules text box", async () => {
	const item = shallow(<AddEdit {...props} />);
	item.instance().onBuyBooksChange("rule", "Rule1", "true");
	expect(item.state("buy_book_rules_value")).toEqual("Rule1");
});

/** When user click on submit button*/
test("When user click on submit button", async () => {
	props.fields.buy_book_rules = ["Rule1"];
	const item = shallow(<AddEdit {...props} />);
	item.instance().doSubmit({ preventDefault: jest.fn() });
	expect(item.state("buy_book_rules_value")).toEqual(["Rule1"]);
	expect(props.handleSubmit).toHaveBeenCalled();
});

/* Change the props value and called the component did update event */
test("Change the props value and called the component did update event", async () => {
	const item = shallow(<AddEdit {...props} />);
	item.setProps({
		fields: {
			buy_book_rules: ["www.google.com"],
		},
	});
	expect(item.state().buy_book_rules_value).toEqual(["www.google.com"]);
});

/* User see the update button is disable when add buy_book_rules as null */
test("User see the update button is disable when add buy_book_rules as null", async () => {
	const item = shallow(<AddEdit {...props} />);
	item.instance().onBuyBooksChange("", ["www.google.com", "www.test.com", ""], [true, true, false]);
	expect(item.find("FormSaveButton").props().disabled).toBe(true);
});

/** User remove the all rules buy_book_rules*/
test("User remove the all rules buy_book_rules", async () => {
	const item = shallow(<AddEdit {...props} />);
	item.instance().onBuyBooksChange("", [], []);
	expect(item.state().buy_book_rules_value).toEqual([]);
	expect(item.state().buy_book_rules_valid).toEqual([]);
});

/** User dont have any buy_book_rules when edit the publisher details*/
test("User dont have any buy_book_rules when edit the publisher details", async () => {
	delete props.fields.buy_book_rules;
	const item = shallow(<AddEdit {...props} />);
	item.instance().onBuyBooksChange("", [], []);
	expect(item.state().buy_book_rules_value).toEqual([]);
	expect(item.state().buy_book_rules_valid).toEqual([]);
});

/** User get the updates in props which have buy_book_rules as null*/
test("User get the updates in props which have buy_book_rules as null", async () => {
	const item = shallow(<AddEdit {...props} />);
	item.setProps({
		fields: {
			buy_book_rules: null,
		},
	});
	expect(item.state().buy_book_rules_value).toEqual([]);
	expect(item.state().buy_book_rules_valid).toEqual([]);
});

/** When action is other then edit*/
test("When action is other then edit", async () => {
	props.action = "add";
	const item = shallow(<AddEdit {...props} />);
	expect(item.find("SaveButton").length).toEqual(0);
});
