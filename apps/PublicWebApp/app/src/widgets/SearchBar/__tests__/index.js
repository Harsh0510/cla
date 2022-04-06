// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import SearchBar from "../index";

let props, mockFunction, location, history, WrappedComponent;
let flyouts_getFirstUnseenIndex;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("react-router-dom", () => ({ withRouter: (a) => a, Link: (b) => b }));
jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return;
	};
});
jest.mock("../../../common/FlyoutManager", () => {
	return { withFlyoutManager: mockPassthruHoc };
});

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/**
 * Reset function
 */
function resetAll() {
	mockFunction = jest.fn();
	WrappedComponent = mockPassthruHoc;
	flyouts_getFirstUnseenIndex = mockFunction;
	location = {};
	history = {
		push: jest.fn(),
	};
	props = {
		flyouts_getFirstUnseenIndex: flyouts_getFirstUnseenIndex,
		flyouts_setNext: mockFunction,
		isMobile: false,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	location = {
		pathname: "/works",
		search: "",
	};
	const item = shallow(<SearchBar {...props} location={location} />);
	expect(item.find("SearchForm").length).toBe(1);
});

// /** search bar change the input value */
test("User enter the search filed value", async () => {
	location = {
		pathname: "/works",
		search: "",
	};
	const item = shallow(<SearchBar {...props} location={location} />);
	const inputSearch = item.find('[name="search"]');
	inputSearch.simulate("change", {
		target: {
			name: "search",
			value: "9780007457939",
		},
	});
	expect(item.state().value).toEqual("9780007457939");
});

/** User search value and enter submit or click event */
test("User search value and enter submit or click event", async () => {
	location = {
		pathname: "/works",
		search: "",
	};
	const item = shallow(<SearchBar {...props} location={location} history={history} />);
	const inputSearch = item.find('[name="search"]');
	inputSearch.simulate("change", {
		target: {
			name: "search",
			value: "9780007457939",
		},
	});

	const push = item.instance().props.history.push;
	item.setProps({ location: { search: "?q=9780007457939" } }); // if search props changed
	item.instance().handleSubmit({ preventDefault: jest.fn() });

	item.update();
	item.instance().forceUpdate();
	await wait(50);

	expect(push.mock.calls[0][0]).toEqual("/works?q=" + item.state().value + "");
});

test("User search value and enter submit or click event", async () => {
	flyouts_getFirstUnseenIndex.mockReturnValue(1);
	location = {
		pathname: "/works",
		search: "",
	};
	const item = shallow(<SearchBar {...props} location={location} history={history} />);
	const inputSearch = item.find('[name="search"]');
	inputSearch.simulate("change", {
		target: {
			name: "search",
			value: "",
		},
	});

	const push = item.instance().props.history.push;
	item.setProps({ location: { search: "?q=" } }); // if search props changed
	item.instance().handleSubmit({ preventDefault: jest.fn() });

	item.update();
	item.instance().forceUpdate();
	await wait(50);

	expect(push.mock.calls[0][0]).toEqual("/works?q=" + item.state().value + "");
});

/** When User directly access '/works?q=search' URL and FlyoutIndex is 1 */
test(`When user directly access '/works?q=search' URL and FlyoutIndex is 1`, async () => {
	flyouts_getFirstUnseenIndex.mockReturnValue(1);
	location = {
		pathname: "/works?q=search",
		search: "",
	};
	const item = shallow(<SearchBar {...props} location={location} history={history} />);
	const inputSearch = item.find('[name="search"]');
	inputSearch.simulate("change", {
		target: {
			name: "search",
			value: "search",
		},
	});

	item.update();
	item.instance().forceUpdate();
	await wait(50);
	expect(item.state().value).toEqual("search");
	expect(item.find("Flyout").length).toBe(0);
});

test("When Flyout index is not 1 and search query is null", async () => {
	flyouts_getFirstUnseenIndex.mockReturnValue(1);
	location = {
		pathname: "/works",
		search: "",
	};
	const item = shallow(<SearchBar {...props} location={location} history={history} />);
	item.setState({ value: "" });
	item.instance().handleSubmit({ preventDefault: jest.fn() });
	expect(item.containsMatchingElement(<span>Enter your search term here and click the magnifying glass.</span>)).toBeTruthy();
	//expect(item.find('Flyout').length).toBe(1);
	expect(mockFunction).toHaveBeenCalled();
});

test("When Flyout index is not 1, Flyout will not bot be displayed", async () => {
	flyouts_getFirstUnseenIndex.mockReturnValue(2);
	location = {
		pathname: "/works",
		search: "",
	};
	const item = shallow(<SearchBar {...props} location={location} history={history} />);
	expect(item.find("Flyout").length).toBe(0);
});

test("When search query is present in URL, Flyout will not be displayed", async () => {
	flyouts_getFirstUnseenIndex.mockReturnValue(1);
	location = {
		pathname: "/works",
		search: "",
	};
	const item = shallow(<SearchBar {...props} location={location} history={history} />);
	item.setState({ value: "books" });
	expect(item.find("Flyout").length).toBe(0);
});

/** User search value and enter submit or click event */
test("Further Education User search value and enter submit or click event", async () => {
	location = {
		pathname: "/",
		search: "",
	};
	props.myUserDetails = { is_fe_user: true };
	const item = shallow(<SearchBar {...props} location={location} history={history} />);
	const inputSearch = item.find('[name="search"]');
	inputSearch.simulate("change", {
		target: {
			name: "search",
			value: "9780007457939",
		},
	});

	const push = item.instance().props.history.push;
	item.setProps({ location: { search: "?q=9780007457939" } }); // if search props changed
	item.instance().handleSubmit({ preventDefault: jest.fn() });

	item.update();
	item.instance().forceUpdate();
	await wait(50);

	expect(push.mock.calls[0][0]).toEqual("/works?filter_level=Further%20Education&q=" + item.state().value + "");
});

test("User can see userUpload icon when user is not a cla-admin", async () => {
	props.myUserDetails = { role: "teacher" };
	const item = shallow(<SearchBar {...props} location={location} history={history} />);
	expect(item.find("UploadIcon").length).toBe(1);
});

test("User can not see userUpload icon when user is a cla-admin", async () => {
	props.myUserDetails = { role: "cla-admin" };
	const item = shallow(<SearchBar {...props} location={location} history={history} />);
	expect(item.find("UploadIcon").length).toBe(0);
});

test("User can see userUpload icon when user is not a cla-admin in mobile screen", async () => {
	props.myUserDetails = { role: "teacher" };
	props.isMobile = true;
	const item = shallow(<SearchBar {...props} location={location} history={history} />);
	expect(item.find("UploadIcon").length).toBe(1);
});
