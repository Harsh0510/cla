// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow } from "enzyme";
import ResetPasswordPage from "../index";
import Header from "../../../widgets/Header";
import messageType from "../../../common/messageType";

let mockMatch;
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
jest.mock("../../../common/withAuthConsumer", () => mockPassthruHoc);
jest.mock("react-router-dom", () => ({ withRouter: (a) => a, Link: (b) => b }));
jest.mock("../../../common/customSetTimeout", () => {
	return function (method, time) {
		return setTimeout(method, 100);
	};
});

// Wait for a specified amount of time for async functions
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

// Mock api method
async function defaultApi(endpoint, data = null) {
	// "ResetPassordPage" only queries this endpoint
	if (endpoint === "/auth/user-complete-password-reset") {
		// to reach the else in the resolve part of the api promise on the component
		if (data.password === "something_wrong") {
			return { result: false };
		}
		// successfully set password
		if (data.password === data.password_confirm) {
			return { result: true };
		}
	}
	// This will be caught by the promise in the component
	throw new Error("should never be here");
}

/**
 * To be called before and after each test. Useful for resetting globally scoped variables
 */
function resetAll() {
	// add reset scripts
	mockMatch = {
		path: "auth/set-password/",
		params: {
			token: "7023a00124283b456be1366faa22520bc310",
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders correctly", async () => {
	// Create a shallow wrapper of the tested component. More details: https://airbnb.io/enzyme/docs/api/ShallowWrapper/shallow.html
	const item = shallow(<ResetPasswordPage match={mockMatch} api={defaultApi} />);
	// Expect the "Header" component to exist somewhere in "ResetPasswordPage"
	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

test("User enters two matching passwords", async () => {
	const item = shallow(<ResetPasswordPage match={mockMatch} api={defaultApi} />);
	// "Spy" on a method in the tested component to check if it gets called. More info: https://jestjs.io/docs/en/jest-object#jestspyonobject-methodname
	const spy = jest.spyOn(item.instance(), "handleSubmit");
	// This is required for class property methods to work. Taken from: https://stackoverflow.com/questions/52455806/how-to-spy-on-a-class-property-arrow-function-using-jest
	item.update();
	item.instance().forceUpdate();
	// the "PasswordPage" child component
	const page = item.find("PasswordPage");
	// Call prop method on child object
	page.props().handleSubmit({
		password: "123",
		password_confirm: "123",
	});
	// Checked if our spied on method is actually called
	expect(spy).toHaveBeenCalled();
});

test("User enters two non-matching passwords", async () => {
	const item = shallow(<ResetPasswordPage match={mockMatch} api={defaultApi} />);
	const spy = jest.spyOn(item.instance(), "handleSubmit");
	item.update();
	item.instance().forceUpdate();
	const page = item.find("PasswordPage");
	page.props().handleSubmit({
		password: "123",
		password_confirm: "1234",
	});
	expect(spy).toHaveBeenCalled();
});

test("Something went wrong", async () => {
	const item = shallow(<ResetPasswordPage match={mockMatch} api={defaultApi} />);
	const spy = jest.spyOn(item.instance(), "handleSubmit");
	item.update();
	item.instance().forceUpdate();
	const page = item.find("PasswordPage");
	page.props().handleSubmit({
		password: "something_wrong",
		password_confirm: "1234",
	});
	expect(spy).toHaveBeenCalled();
});

test("When component will unmount is called", async () => {
	const item = shallow(<ResetPasswordPage match={mockMatch} api={defaultApi} />);
	await wait(100);
	const componentWillUnmount = jest.spyOn(item.instance(), "componentWillUnmount");
	await wait(20);
	item.unmount();
	expect(componentWillUnmount).toHaveBeenCalled();
});

test("User click on the resend set password link", async () => {
	// Mock api method
	async function api(endpoint, data = null) {
		// "ResetPassordPage" only queries this endpoint
		if (endpoint === "/auth/user-complete-password-reset") {
			throw new Error("Token Expired");
		}
		if (endpoint === "/auth/user-resend-set-password") {
			return {};
		}
		// This will be caught by the promise in the component
		throw new Error("should never be here");
	}
	const item = shallow(<ResetPasswordPage match={mockMatch} api={api} />);
	const params = {
		token: mockMatch.params.token,
		password: "Test@1234",
		password_confirm: "Test@1234",
	};
	item.instance().handleSubmit(params);
	item.instance().this;
	await wait(20);
	expect(item.state().message).toEqual(new Error("Token Expired"));
	expect(item.state().messageType).toEqual(messageType.error);

	item.instance().doResendSetPassword({ preventDefault: jest.fn() });
	expect(item.state().message).toEqual(`Processing...`);
	await wait(50);
	expect(typeof item.state().message).toEqual("object");
	expect(item.state().messageType).toEqual(messageType.error);
});

test("User click on the resend  set password link and getting the error", async () => {
	// Mock api method
	async function api(endpoint, data = null) {
		// "ResetPassordPage" only queries this endpoint
		if (endpoint === "/auth/user-complete-password-reset") {
			throw "Token Expired";
		}
		if (endpoint === "/auth/user-resend-set-password") {
			throw new Error("Unknown Error");
		}
		// This will be caught by the promise in the component
		throw new Error("should never be here");
	}
	const item = shallow(<ResetPasswordPage match={mockMatch} api={api} />);
	const params = {
		token: mockMatch.params.token,
		password: "Test@1234",
		password_confirm: "Test@1234",
	};
	item.instance().handleSubmit(params);
	await wait(20);
	expect(item.state().message.toString().indexOf("It appears that the Set Password Link you have clicked is expired").length !== -1).toBe(true);
	expect(item.state().messageType).toEqual(messageType.warning);

	item.instance().doResendSetPassword({ preventDefault: jest.fn() });
	expect(item.state().message).toEqual(`Processing...`);
	await wait(50);
	expect(item.state().message).toEqual(new Error("Unknown Error"));
});

test("User enters submit the request and got to different page while response return value", async () => {
	const item = shallow(<ResetPasswordPage match={mockMatch} api={defaultApi} />);
	item.update();
	item.instance().forceUpdate();
	// the "PasswordPage" child component
	const page = item.find("PasswordPage");
	// Call prop method on child object
	page.props().handleSubmit({
		password: "123",
		password_confirm: "123",
	});
	expect(item.state().message).toEqual(null);
	item.unmount();
});

test("User enters submit the request and got to different page while response throw an error", async () => {
	// Mock api method
	async function api(endpoint, data = null) {
		// "ResetPassordPage" only queries this endpoint
		if (endpoint === "/auth/user-complete-password-reset") {
			throw "Unknown Error";
		}
		if (endpoint === "/auth/user-resend-set-password") {
			throw new Error("Unknown Error");
		}
		// This will be caught by the promise in the component
		throw new Error("should never be here");
	}
	const item = shallow(<ResetPasswordPage match={mockMatch} api={api} />);
	item.update();
	item.instance().forceUpdate();
	// the "PasswordPage" child component
	const page = item.find("PasswordPage");
	// Call prop method on child object
	page.props().handleSubmit({
		password: "123",
		password_confirm: "123",
	});
	expect(item.state().message).toEqual(null);
	item.unmount();
});

test("User click on the resend set password link and move to other page while response throw an error", async () => {
	// Mock api method
	async function api(endpoint, data = null) {
		// "ResetPassordPage" only queries this endpoint
		if (endpoint === "/auth/user-complete-password-reset") {
			throw "Token Expired";
		}
		if (endpoint === "/auth/user-resend-set-password") {
			throw new Error("Unknown Error");
		}
		// This will be caught by the promise in the component
		throw new Error("should never be here");
	}
	const item = shallow(<ResetPasswordPage match={mockMatch} api={api} />);
	const params = {
		token: mockMatch.params.token,
		password: "Test@1234",
		password_confirm: "Test@1234",
	};
	item.instance().handleSubmit(params);
	await wait(20);
	expect(item.state().message.toString().indexOf("It appears that the Set Password Link you have clicked is expired").length !== -1).toBe(true);
	expect(item.state().messageType).toEqual(messageType.warning);

	item.instance().doResendSetPassword({ preventDefault: jest.fn() });
	item.unmount();
});

test("User click on the resend set password link and move to other page while response is true", async () => {
	// Mock api method
	async function api(endpoint, data = null) {
		// "ResetPassordPage" only queries this endpoint
		if (endpoint === "/auth/user-complete-password-reset") {
			throw "Token Expired";
		}
		if (endpoint === "/auth/user-resend-set-password") {
			return { result: true };
		}
		// This will be caught by the promise in the component
		throw new Error("should never be here");
	}
	const item = shallow(<ResetPasswordPage match={mockMatch} api={api} />);
	const params = {
		token: mockMatch.params.token,
		password: "Test@1234",
		password_confirm: "Test@1234",
	};
	item.instance().handleSubmit(params);
	await wait(20);
	expect(item.state().message.toString().indexOf("It appears that the Set Password Link you have clicked is expired").length !== -1).toBe(true);
	expect(item.state().messageType).toEqual(messageType.warning);

	item.instance().doResendSetPassword({ preventDefault: jest.fn() });
	item.unmount();
});

test("User click on the resend set password link and move to other page while dont trigger the api request", async () => {
	// Mock api method
	async function api(endpoint, data = null) {
		// "ResetPassordPage" only queries this endpoint
		if (endpoint === "/auth/user-complete-password-reset") {
			throw "Token Expired";
		}
		if (endpoint === "/auth/user-resend-set-password") {
			return { result: true };
		}
		// This will be caught by the promise in the component
		throw new Error("should never be here");
	}
	const item = shallow(<ResetPasswordPage match={mockMatch} api={api} />);
	const params = {
		token: mockMatch.params.token,
		password: "Test@1234",
		password_confirm: "Test@1234",
	};
	item.instance()._isMounted = false;
	item.instance().handleSubmit(params);
	await wait(20);
	expect(item.state().message).toBe(null);
	expect(item.state().messageType).toEqual(undefined);
});
