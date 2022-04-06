// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import ActivatePasswordPage from "../index";
import Header from "../../../widgets/Header";
import messageType from "../../../common/messageType";

let match;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

jest.mock("../../../common/customSetTimeout", () => {
	return function (method, time) {
		return setTimeout(method, 100);
	};
});

// submit end point
async function defaultApi(endpoint, data = null) {
	// "ActivatePasswordPage" only queries this endpoint
	if (endpoint === "/auth/activate") {
		// to reach the else in the resolve part of the api promise on the component
		if (data.password === "something_wrong") {
			return { result: false };
		}
		// successfully set password
		if (data.password === data.password_confirm) {
			return { result: true };
		}
	}
	throw new Error("should never be here");
}

function resetAll() {
	match = {
		params: {
			token: "132",
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<ActivatePasswordPage match={match} />);
	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

/** now justing the submit event */
test("User enters two matching passwords", async () => {
	const item = shallow(<ActivatePasswordPage match={match} api={defaultApi} />);
	//handle submit we used the spyOn
	//other nomal event like click and blure event we used simulate
	const spy = jest.spyOn(item.instance(), "handleSubmit");
	//when the create the instance we update the component
	item.update();
	item.instance().forceUpdate();
	//find the page component
	const page = item.find("PasswordPage");
	page.props().handleSubmit({
		password: "abc",
		password_confirm: "abc",
	});
	//check the its called or not
	expect(spy).toHaveBeenCalled();
});

/* When _isMounted is set to false the submit event */
test(" When _isMounted is set to false", async () => {
	const item = shallow(<ActivatePasswordPage match={match} api={defaultApi} />);
	item.instance()._isMounted = false;
	//handle submit we used the spyOn
	//other nomal event like click and blure event we used simulate
	const spy = jest.spyOn(item.instance(), "handleSubmit");
	//when the create the instance we update the component
	item.update();
	item.instance().forceUpdate();
	//find the page component
	const page = item.find("PasswordPage");
	page.props().handleSubmit({
		password: "abc",
		password_confirm: "abc",
	});
	//check the its called or not
	expect(spy).toHaveBeenCalled();
});

/** if we don't write the same password and */
test("User enters two non-matching passwords", async () => {
	const item = shallow(<ActivatePasswordPage match={match} api={defaultApi} />);
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

/** Something went wrong */
test("Something went wrong", async () => {
	const item = shallow(<ActivatePasswordPage match={match} api={defaultApi} />);
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

/** When component will unmount and clear timeout*/
test("When component will unmount and clear timeout", async () => {
	const item = shallow(<ActivatePasswordPage match={match} api={defaultApi} />);
	item.instance().handleSubmit({
		password: "something_wrong",
		password_confirm: "1234",
		terms_accepted: true,
	});
	item.instance()._isMounted = false;
	await wait(100);
	const componentWillUnmount = jest.spyOn(item.instance(), "componentWillUnmount");
	await wait(20);
	item.unmount();
	expect(componentWillUnmount).toHaveBeenCalled();
});

/** When component will unmount and clear timeout*/
test("When component will unmount and clear timeout", async () => {
	const item = shallow(<ActivatePasswordPage match={match} api={defaultApi} />);
	item.instance().handleSubmit({
		password: "something_wrong",
		password_confirm: "1234",
		terms_accepted: true,
	});
	await wait(100);
	const componentWillUnmount = jest.spyOn(item.instance(), "componentWillUnmount");
	await wait(20);
	item.unmount();
	expect(componentWillUnmount).toHaveBeenCalled();
});

/** When component will unmount with timeout false*/
test("When component will unmount with timeout false", async () => {
	const item = shallow(<ActivatePasswordPage match={match} api={defaultApi} />);
	const componentWillUnmount = jest.spyOn(item.instance(), "componentWillUnmount");
	await wait(20);
	item.unmount();
	expect(componentWillUnmount).toHaveBeenCalled();
});

/** User get message for generate resend  set-Password link */
test("User get message for generate resend  set-Password link", async () => {
	async function api(endpoint, data = null) {
		if (endpoint === "/auth/activate") {
			throw "Token Expired";
		}
	}
	const item = shallow(<ActivatePasswordPage match={match} api={api} />);
	const form_params = {
		activation_token: match.params.token,
		password: "Radixweb@8",
		password_confirm: "Radixweb@8",
		terms_accepted: true,
	};
	item.instance().handleSubmit(form_params);
	await wait(20);
	expect(item.state("message")).not.toEqual(null);
	expect(item.state("messageType")).toEqual(messageType.warning);
});

test("User click on the resend  set password link", async () => {
	// Mock api method
	async function api(endpoint, data = null) {
		// "ResetPassordPage" only queries this endpoint
		if (endpoint === "/auth/activate") {
			throw new Error("Token Expired");
		}
		if (endpoint === "/auth/user-resend-registration") {
			return {};
		}
		// This will be caught by the promise in the component
		throw new Error("should never be here");
	}
	const item = shallow(<ActivatePasswordPage match={match} api={api} />);
	const params = {
		token: match.params.token,
		password: "Test@1234",
		password_confirm: "Test@1234",
	};
	item.instance().handleSubmit(params);
	await wait(20);
	expect(item.state().message).toEqual(new Error("Token Expired"));
	expect(item.state().messageType).toEqual(messageType.error);

	item.instance().doResendVerify({ preventDefault: jest.fn() });
	expect(item.state().message).toEqual(`Processing...`);
	await wait(50);
	expect(typeof item.state().message).toEqual("object");
	expect(item.state().messageType).toEqual(messageType.error);
});

test("User click on the resend  set password link and getting the error", async () => {
	// Mock api method
	async function api(endpoint, data = null) {
		// "ResetPassordPage" only queries this endpoint
		if (endpoint === "/auth/activate") {
			throw new Error("Token Expired");
		}
		if (endpoint === "/auth/user-resend-registration") {
			throw new Error("Unknown Error");
		}
		// This will be caught by the promise in the component
		throw new Error("should never be here");
	}
	const item = shallow(<ActivatePasswordPage match={match} api={api} />);
	const params = {
		token: match.params.token,
		password: "Test@1234",
		password_confirm: "Test@1234",
	};
	item.instance().handleSubmit(params);
	await wait(20);
	expect(item.state().message).toEqual(new Error("Token Expired"));
	expect(item.state().messageType).toEqual(messageType.error);

	item.instance().doResendVerify({ preventDefault: jest.fn() });
	expect(item.state().message).toEqual(`Processing...`);
	await wait(50);
	expect(item.state().message).toEqual(new Error("Unknown Error"));
});

test("User click on the resend set password link and getting the error", async () => {
	// Mock api method
	async function api(endpoint, data = null) {
		// "ResetPassordPage" only queries this endpoint
		if (endpoint === "/auth/activate") {
			throw new Error("Token Expired");
		}
		if (endpoint === "/auth/user-resend-registration") {
			throw new Error("Unknown Error");
		}
		// This will be caught by the promise in the component
		throw new Error("should never be here");
	}
	const item = shallow(<ActivatePasswordPage match={match} api={api} />);
	const params = {
		token: match.params.token,
		password: "Test@1234",
		password_confirm: "Test@1234",
	};
	item.instance().handleSubmit(params);
	await 10;
	item.instance()._isMounted = false;
	expect(item.state().message).toEqual(null);

	item.instance().doResendVerify({ preventDefault: jest.fn() });
	await 10;
	expect(item.state().message).toEqual(`Processing...`);
});

test(`User click on the resend set password link and get success`, async () => {
	// Mock api method
	async function api(endpoint, data = null) {
		if (endpoint === "/auth/activate") {
			throw new Error("Token Expired");
		}
		if (endpoint === "/auth/user-resend-registration") {
			return { result: true };
		}
		throw new Error("should never be here");
	}
	const item = shallow(<ActivatePasswordPage match={match} api={api} />);
	const params = {
		token: match.params.token,
		password: "Test@1234",
		password_confirm: "Test@1234",
	};
	item.instance().handleSubmit(params);
	await 10;

	item.instance().doResendVerify({ preventDefault: jest.fn() });
	await 10;
	expect(item.state().message).toEqual(`'Set password' email sent`);
});
