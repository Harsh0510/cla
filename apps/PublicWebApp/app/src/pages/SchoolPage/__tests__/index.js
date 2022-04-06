// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import SchoolPage from "../index";
import Header from "../../../widgets/Header";

/** Mock Data */
import SCHOOLDATA from "../../../mocks/MockSchool";
import COUNTRYDATA from "../../../mocks/MockCountry";

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
jest.mock("../../../common/withAdminAuthRequiredConsumer", () => {
	return function (acceptedRoles, WrappedComponent) {
		if (!Object.keys(acceptedRoles).length == 1) {
			throw "It should be passed acceptedToles with a single key";
		}
		if (!acceptedRoles.hasOwnProperty("school-admin")) {
			throw "It should be passed acceptedToles with a single key: school-admin";
		}
		return WrappedComponent;
	};
});
jest.mock("../../../common/withAuthRequiredConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAuthConsumer", () => mockPassthruHoc);
jest.mock("react-router-dom/withRouter", () => mockPassthruHoc);
jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return {
			current: {
				isValid: function () {
					if (mockReactRef_isValid) {
						return true;
					}
					return false;
				},
			},
		};
	};
});

let fields, countryData, schoolData, location, mockReactRef_isValid;

//Mock user details
const mockUserDetails = {
	first_name: "teacher",
	last_name: "teacher",
	role: "school-admin",
};

// Wait for a specified amount of time for async functions
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

// Mock api methods
async function defaultApi(endpoint, data) {
	// Getcountries details
	if (endpoint === "/auth/get-countries") {
		return COUNTRYDATA;
	}

	// "Get My School Details" only queries this endpoint
	if (endpoint === "/auth/get-my-school-details") {
		return SCHOOLDATA;
	}

	// This will be caught by the promise in the component
	throw "should never be here";
}

/**
 * To be called before and after each test. Useful for resetting globally scoped variables
 */
function resetAll() {
	// add reset scripts
	location = {
		search: {
			limit: 10,
			offset: 0,
		},
	};
	fields = {
		name: "",
		address1: "",
		address2: "",
		city: "",
		post_code: "",
		country: "",
		local_authority: "",
		school_level: "",
		school_home_page: "",
		number_of_students: "",
	};
	countryData = COUNTRYDATA;
	schoolData = SCHOOLDATA;
	mockReactRef_isValid = true;
}

beforeEach(resetAll);
afterEach(resetAll);

/**
 * Test component renders
 */
test("Component renders correctly", async () => {
	const item = shallow(<SchoolPage withAuthConsumer_myUserDetails={mockUserDetails} api={defaultApi} />);
	await wait(50);
	item.update();

	// Expect the "Header" component to exist somewhere in "School Page"
	expect(item.find(Header).length).toBe(1);
});

/**
 * Fetch countries information
 */
test("Fetch countries", async () => {
	const item = shallow(<SchoolPage withAuthConsumer_myUserDetails={mockUserDetails} api={defaultApi} />);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().countryData).not.toBe(null);
});

/**
 * Fetch countries information unknown error
 */
test("Fetch countries unknown error", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/auth/get-countries") {
			throw "Unknown error";
		}
	}

	// Create a shallow wrapper of the tested component.
	const item = shallow(<SchoolPage withAuthConsumer_myUserDetails={mockUserDetails} api={api} />);

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	// Expect the "Header" component to exist somewhere in "School Page"
	expect(item.state().message).toBe("Unknown error");
});

/**
 * Load School Information
 */
test("Fetch School Information", async () => {
	const item = shallow(<SchoolPage withAuthConsumer_myUserDetails={mockUserDetails} api={defaultApi} />);
	const prev_fields = item.state().fields;
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().fields).not.toBe(prev_fields);
});

/**
 * Load School Information unknown error
 */
test("Fetch School Information unknown error", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/auth/get-my-school-details") {
			throw "Unknown error";
		}
	}

	const item = shallow(<SchoolPage withAuthConsumer_myUserDetails={mockUserDetails} api={api} />);

	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().message).toBe("Unknown error");
});

/** Need to update test case*/
/**
 * User click on submit
 */
test("User click on submit", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/auth/school-edit") {
			return true;
		}
		return defaultApi("/auth/get-my-school-details", true);
	}

	const item = shallow(<SchoolPage withAuthConsumer_myUserDetails={mockUserDetails} withAuthConsumer_attemptReauth={() => {}} api={api} />);

	const name = item.find('[name="name"]');
	const school_level = item.find('[name="school_level"]');
	const address1 = item.find('[name="address1"]');
	const address2 = item.find('[name="address2"]');
	const city = item.find('[name="city"]');
	const post_code = item.find('[name="post_code"]');
	const country = item.find('[name="country"]');
	const local_authority = item.find('[name="local_authority"]');
	const school_home_page = item.find('[name="school_home_page"]');
	const number_of_students = item.find('[name="number_of_students"]');
	const form = item.find("FormWrapAddEdit");

	name.simulate("change", {
		target: {
			name: "name",
			value: "School name1",
		},
	});

	school_level.simulate("change", {
		target: {
			name: "school_level",
			value: "secondary",
		},
	});

	address1.simulate("change", {
		target: {
			name: "address1",
			value: "School address line 1",
		},
	});

	address2.simulate("change", {
		target: {
			name: "address2",
			value: "School address line 2",
		},
	});

	city.simulate("change", {
		target: {
			name: "city",
			value: "USA",
		},
	});

	post_code.simulate("change", {
		target: {
			name: "post_code",
			value: "3854651",
		},
	});

	country.simulate("change", {
		target: {
			name: "country",
			value: "2",
		},
	});

	local_authority.simulate("change", {
		target: {
			name: "local_authority",
			value: "local authority1",
		},
	});

	school_home_page.simulate("change", {
		target: {
			name: "school_home_page",
			value: "Home1",
		},
	});

	number_of_students.simulate("change", {
		target: {
			name: "number_of_students",
			value: "500",
		},
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();
	form.simulate("submit", {
		preventDefault: jest.fn(),
	});

	await wait(50);
	item.update();

	expect(item.state().message).toEqual("Institution information edited successfully");
});

test("User click on submit button and get unknown error", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/auth/school-edit") {
			throw "Unknown error";
		}
		return defaultApi(endpoint, data);
	}

	const item = shallow(<SchoolPage withAuthConsumer_myUserDetails={mockUserDetails} api={api} />);
	await wait(50);
	item.setState({ fields: fields });
	item.instance().handleSubmit({ preventDefault: jest.fn(), params: false });
	await wait(50);
	item.update();

	expect(item.state().message).toEqual("Unknown error");
});

/** User enter invalid number_of_students value **/
test("User enter invalid number_of_students value", async () => {
	const item = shallow(<SchoolPage withAuthConsumer_myUserDetails={mockUserDetails} api={defaultApi} />);

	const number_of_students = item.find('[name="number_of_students"]');

	number_of_students.simulate("change", {
		target: {
			name: "number_of_students",
			value: "ddgg",
		},
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().number_field_error).toEqual("The number of students must be a number between 1 and 9999");
});

/** User enter valid number_of_students value **/
test("User enter valid number_of_students value", async () => {
	const item = shallow(<SchoolPage withAuthConsumer_myUserDetails={mockUserDetails} api={defaultApi} />);

	const number_of_students = item.find('[name="number_of_students"]');

	number_of_students.simulate("change", {
		target: {
			name: "number_of_students",
			value: "50",
		},
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().number_field_error).toEqual(null);
});

/** User enter 10000 in number_of_students input */
test("User enter 10000 in number_of_students input", async () => {
	const item = shallow(<SchoolPage withAuthConsumer_myUserDetails={mockUserDetails} api={defaultApi} />);

	const number_of_students = item.find('[name="number_of_students"]');

	number_of_students.simulate("change", {
		target: {
			name: "number_of_students",
			value: "100000",
		},
	});

	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().number_field_error).toEqual("The number of students must be a number between 1 and 9999");
});

/** User modify School details 'doNameInputFieldChange'*/
test("User modify School details", async () => {
	const item = shallow(<SchoolPage withAuthConsumer_myUserDetails={mockUserDetails} api={defaultApi} />);
	await wait(20);
	const prev_schoolName = item.state().fields.name;
	item.instance().doNameInputFieldChange("Test School2", "name", true);
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().fields.name).not.toEqual(prev_schoolName);
});

/** User modify which field was invalid*/
test("User modify School details", async () => {
	const item = shallow(<SchoolPage withAuthConsumer_myUserDetails={mockUserDetails} api={defaultApi} />);
	await wait(20);
	item.setState({ valid: { name: false } });
	await wait(20);
	item.update();
	item.instance().forceUpdate();

	const prev_schoolNameIsvalid = item.state().valid.name;
	item.instance().doNameInputFieldChange("Test School2", "name", true);
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().valid.name).not.toEqual(prev_schoolNameIsvalid);
});
