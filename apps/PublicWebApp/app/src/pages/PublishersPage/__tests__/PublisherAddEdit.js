// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import PublisherAddEdit from "../PublisherAddEdit";

let ACTION_NEW, ACTION_EDIT, mockFunction;
let props, mockFormData;
/**
 * This 'HOC' does nothing but 'pass through' the provided component,
 * so it's not necessary to 'dive()' into rendered results,
 * and so it's possible to mock the 'api' function.
 **/
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

// Mock HOC imports
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
/** Mock function for pass mock form data */
jest.mock("../../../common/CustomFormData", () => {
	return function () {
		const ret = [];
		for (const key in mockFormData) {
			if (mockFormData.hasOwnProperty(key)) {
				ret.push(key, mockFormData[key]);
			}
		}
		return ret;
	};
});

// Wait for a specified ashallow of time for async functions
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/**
 * To be called before and after each test. Useful for resetting globally scoped variables
 */
function resetAll() {
	mockFunction = jest.fn();
	ACTION_NEW = "new";
	ACTION_EDIT = "edit";
	location = {
		search: "",
	};
	props = {
		key: "1",
		handleSubmit: mockFunction,
		cancelAddEdit: mockFunction,
		message: "",
		fields: {
			id: 1,
			name: "Coordination Group Publications Ltd (CGP)",
			external_identifier: "Group Publications ",
			contact_name: "Group Publications ",
			printing_opt_out: true,
			buy_book_rules: ["www.google.com", "www.facebook.com"],
			temp_unlock_opt_in: true,
		},
		action: ACTION_EDIT,
	};
	mockFormData = [];
}

beforeEach(resetAll);
afterEach(resetAll);

/** Default Mock api method */
async function defaultApi(endpoint, data = null) {
	// This will be caught by the promise in the component
	throw new Error("should never be here");
}

/** Component renders */
test("Component renders correctly with edit publisher", async () => {
	props.action = null;
	const item = shallow(<PublisherAddEdit {...props} />);
	item.instance().forceUpdate();
	expect(item.find("FormWrapAddEdit").length).toBe(1);
});

test("Component renders correctly with edit publisher", async () => {
	const item = shallow(<PublisherAddEdit {...props} />);
	item.instance().forceUpdate();
	expect(item.find("FormWrapAddEdit").length).toBe(1);
	expect(item.find('[name="update-publisher"]').length).toBe(1);
});

test("Add/Edit Form messages renders correctly", async () => {
	props.message = "No fields updated";
	const item = shallow(<PublisherAddEdit {...props} />);
	expect(item.find("FormMessage").length).toBe(1);
	expect(item.find("FormMessage").text()).toEqual(props.message);
});

/** User see the update button is disable when add buy_book_rules as null */
test("User see the update button is disable when add buy_book_rules as null", async () => {
	const item = shallow(<PublisherAddEdit {...props} />);
	item.instance().onBuyBooksChange("", ["www.google.com", "www.test.com", ""], [true, true, false]);
	expect(item.find("FormSaveButton").props().disabled).toBe(true);
});

/** Change the props value and called the component did update event */
test("Change the props value and called the component did update event", async () => {
	const item = shallow(<PublisherAddEdit {...props} />);
	item.setProps({
		fields: {
			buy_book_rules: ["www.google.com"],
		},
	});
	expect(item.state().buy_book_rules_value).toEqual(["www.google.com"]);
});

/** User click on Update button */
test("User click on Update button", async () => {
	const item = shallow(<PublisherAddEdit {...props} />);
	const form = item.find("FormWrapAddEdit");
	form.simulate("submit", { preventDefault: jest.fn() });
	expect(props.handleSubmit).toHaveBeenCalled();
});

/** User remove the all rules buy_book_rules*/
test("User remove the all rules buy_book_rules", async () => {
	const item = shallow(<PublisherAddEdit {...props} />);
	item.instance().onBuyBooksChange("", [], []);
	expect(item.state().buy_book_rules_value).toEqual([]);
	expect(item.state().buy_book_rules_valid).toEqual([]);
});

/** User dont have any buy_book_rules when edit the publisher details*/
test("User dont have any buy_book_rules when edit the publisher details", async () => {
	delete props.fields.buy_book_rules;
	const item = shallow(<PublisherAddEdit {...props} />);
	item.instance().onBuyBooksChange("", [], []);
	expect(item.state().buy_book_rules_value).toEqual([]);
	expect(item.state().buy_book_rules_valid).toEqual([]);
});

/** User get the updates in props which have buy_book_rules as null*/
test("User get the updates in props which have buy_book_rules as null", async () => {
	const item = shallow(<PublisherAddEdit {...props} />);
	item.setProps({
		fields: {
			buy_book_rules: null,
		},
	});
	expect(item.state().buy_book_rules_value).toEqual([]);
	expect(item.state().buy_book_rules_valid).toEqual([]);
});

test("User check the temp_unlock_opt_in checkbox", async () => {
	const item = shallow(<PublisherAddEdit {...props} />);
	item.instance().doCheckInputFieldChange("temp_unlock_opt_in", true);
	expect(item.state().temp_unlock_opt_in).toEqual(true);
});
