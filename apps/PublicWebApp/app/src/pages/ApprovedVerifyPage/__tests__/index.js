// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import ApprovedVerifyPage from "../index";
import Header from "../../../widgets/Header";
import messageType from "../../../common/messageType";

// Mock import
jest.mock("../../../common/withApiConsumer", () => {
	const withApiConsumer = require("../../../mocks/withApiConsumer");
	return withApiConsumer;
});

jest.mock("../../../common/customSetTimeout", () => {
	return function (method, time) {
		return setTimeout(method, 100);
	};
});

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/**
 * Reset function
 */
function resetAll() {}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const match = {
		params: {
			token: "",
		},
	};
	const item = shallow(<ApprovedVerifyPage match={match} />).dive();

	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

/** Auth token verfiy and return true */
test("Auth token verfiy and return true", async () => {
	const match = {
		params: {
			token: "132132",
		},
	};

	async function api(endpoint, data = null) {
		if (endpoint === "/auth/approved-verify") {
			return {
				result: true,
			};
		}
	}
	const item = shallow(<ApprovedVerifyPage match={match} api={api} />).dive();
	const form = item.find("FormWrap");
	item.setState({ terms_accepted: true });
	await wait(20);
	item.update();
	form.simulate("submit", {
		preventDefault: jest.fn(),
	});
	await wait(10);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().isVerified).toEqual(true);
	expect(item.find("GetStartedButton").length).toBe(1);
});

/** Auth token verfiy and return false */
test("Auth token verfiy and return false", async () => {
	const match = {
		params: {
			token: "13213213",
		},
	};

	async function api(endpoint, data = null) {
		if (endpoint === "/auth/approved-verify") {
			return {
				result: false,
			};
		}
	}
	const item = shallow(<ApprovedVerifyPage match={match} api={api} />).dive();
	const form = item.find("FormWrap");
	await wait(20);
	item.update();
	form.simulate("submit", {
		preventDefault: jest.fn(),
	});
	await wait(10);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().message).toEqual(<div>Sorry, something has gone wrong. Are you sure you've followed the link correctly?</div>);
});

/** When component will unmount and clear timeout*/
test(`When component will unmount and clear timeout`, async () => {
	const match = {
		params: {
			token: "12132132",
		},
	};

	async function api(endpoint, data = null) {
		if (endpoint === "/auth/approved-verify") {
			return {
				result: true,
			};
		}
	}

	const item = shallow(<ApprovedVerifyPage match={match} api={api} />).dive();
	const form = item.find("FormWrap");

	await wait(20);
	form.simulate("submit", {
		preventDefault: jest.fn(),
	});

	await wait(100);
	const componentWillUnmount = jest.spyOn(item.instance(), "componentWillUnmount");
	await wait(20);
	item.unmount();
	expect(componentWillUnmount).toHaveBeenCalled();
});

/** When component will unmount with timeout false*/
test("When component will unmount with timeout false", async () => {
	const match = {
		params: {
			token: "12132132",
		},
	};

	async function api(endpoint, data = null) {
		if (endpoint === "/auth/approved-verify") {
			return {
				result: true,
			};
		}
	}

	const item = shallow(<ApprovedVerifyPage match={match} api={api} />).dive();

	await wait(100);
	const componentWillUnmount = jest.spyOn(item.instance(), "componentWillUnmount");

	await wait(20);
	item.unmount();
	expect(componentWillUnmount).toHaveBeenCalled();
});

/** When token are not matches in componentDidUpdate*/
test("When token are not matches in componentDidUpdate", async () => {
	const match = {
		params: {
			token: "12132132",
		},
	};

	async function api(endpoint, data = null) {
		if (endpoint === "/auth/approved-verify") {
			return {
				result: true,
			};
		}
	}

	const item = shallow(<ApprovedVerifyPage match={match} api={api} />).dive();
	item.setProps({ match: { params: { token: "22132132" } } });
	await wait(20);

	expect(item.state("message")).toEqual(null);
});

test("When token are not matches in componentDidUpdate", async () => {
	const match = {
		params: {
			token: "12132132",
		},
	};

	async function api(endpoint, data = null) {
		if (endpoint === "/auth/approved-verify") {
			throw "Could not activate account - are you sure you followed the link correctly?";
		}
	}

	const item = shallow(<ApprovedVerifyPage match={match} api={api} />).dive();
	item.setProps({ match: { params: { token: "22132132" } } });
	await wait(20);

	expect(item.state("message")).toEqual(<div>Sorry, something has gone wrong. Are you sure you've followed the link correctly?</div>);
});

/** User get message for generate resend veification link */
test("User get message for generate resend veification link", async () => {
	const match = {
		params: {
			token: "12132132",
		},
	};

	async function api(endpoint, data = null) {
		if (endpoint === "/auth/approved-verify") {
			throw "Token Expired";
		} else if (endpoint === "/auth/user-resend-registration") {
			return { result: true };
		}
	}

	const item = shallow(<ApprovedVerifyPage match={match} api={api} />).dive();
	const form = item.find("FormWrap");
	item.setState({ terms_accepted: true });
	await wait(20);
	form.simulate("submit", {
		preventDefault: jest.fn(),
	});
	await wait(20);
	expect(item.state("message")).not.toEqual(null);
	expect(item.state("messageType")).toEqual(messageType.warning);

	item.instance().doResendVerify();
	await wait(20);
	expect(item.state("message")).toEqual("Verification email sent");
	expect(item.state("messageType")).toEqual(messageType.success);
});

test("User get message for generate resend verification link and getting error", async () => {
	const match = {
		params: {
			token: "12132132",
		},
	};

	async function api(endpoint, data = null) {
		if (endpoint === "/auth/approved-verify") {
			throw "Token Expired";
		} else if (endpoint === "/auth/user-resend-registration") {
			throw "Could not resend email [1]";
		}
	}

	const item = shallow(<ApprovedVerifyPage match={match} api={api} />).dive();
	const form = item.find("FormWrap");
	item.setState({ terms_accepted: true });
	await wait(20);
	form.simulate("submit", {
		preventDefault: jest.fn(),
	});
	await wait(20);
	expect(item.state("message")).not.toEqual(null);
	expect(item.state("messageType")).toEqual(messageType.warning);

	item.instance().doResendVerify();
	await wait(20);
	expect(item.state("message")).toEqual("Could not resend email [1]");
	expect(item.state("messageType")).toEqual(messageType.error);
});

test("User get message for generate resend verification link and getting error", async () => {
	const match = {
		params: {
			token: "12132132",
		},
	};

	async function api(endpoint, data = null) {
		if (endpoint === "/auth/approved-verify") {
			throw "Token Expired";
		} else if (endpoint === "/auth/user-resend-registration") {
			return { result: false };
		}
	}

	const item = shallow(<ApprovedVerifyPage match={match} api={api} />).dive();
	const form = item.find("FormWrap");
	item.setState({ terms_accepted: true });
	await wait(20);
	form.simulate("submit", {
		preventDefault: jest.fn(),
	});
	await wait(20);
	expect(item.state("message")).not.toEqual(null);
	expect(item.state("messageType")).toEqual(messageType.warning);

	item.instance().doResendVerify();
	await wait(20);
	expect(item.state("messageType")).toEqual(messageType.error);
});

test("Clicked on doVerify Before Loading", async () => {
	const match = {
		params: {
			token: "12132132",
		},
	};
	async function api(endpoint, data = null) {
		if (endpoint === "/auth/verify") {
			item.instance()._isMounted = false;
			throw "Token";
		} else if (endpoint === "/auth/user-resend-registration") {
			return true;
		}
	}
	const item = shallow(<ApprovedVerifyPage match={match} api={api} />).dive();
	item.instance()._isMounted = false;
	item.instance().doResendVerify();
});
