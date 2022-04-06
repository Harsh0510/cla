// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import VerifyPage from "../index";
import Header from "../../../widgets/Header";
import messageType from "../../../common/messageType";

// Mock import
jest.mock("../../../common/withApiConsumer", () => {
	const withApiConsumer = require("../../../mocks/withApiConsumer");
	return withApiConsumer;
});

jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return {
			current: {
				focus: jest.fn(),
				value: "",
				isValid: function () {
					return true;
				},
			},
		};
	};
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
	const item = shallow(<VerifyPage match={match} />).dive();

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
		if (endpoint === "/auth/verify") {
			return {
				result: true,
			};
		}
	}
	const item = shallow(<VerifyPage match={match} api={api} />).dive();
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
	expect(item.state().message).toEqual(
		<div>
			<h4>Your email address was verified successfully.</h4> You will not be able to log in until your institution administrator has approved your
			registration request.
		</div>
	);
});

/** Auth token verfiy and return false */
test("Auth token verfiy and return false", async () => {
	const match = {
		params: {
			token: "13213213",
		},
	};

	async function api(endpoint, data = null) {
		if (endpoint === "/auth/verify") {
			return {
				result: false,
			};
		}
	}
	const item = shallow(<VerifyPage match={match} api={api} />).dive();
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

	expect(item.state().message).toEqual(`Something went wrong. Please try again later.`);
});

/** Auth token verfiy and get error */
test("Auth token verfiy and get error", async () => {
	const match = {
		params: {
			token: "12132132",
		},
	};

	async function api(endpoint, data = null) {
		if (endpoint === "/auth/verify") {
			throw "Something went wrong. Please try again later.";
		}
	}
	const item = shallow(<VerifyPage match={match} api={api} />).dive();
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

	expect(item.state().message).toEqual(`Something went wrong. Please try again later.`);
});

/** User click on terms and condition checkbox value */
test(`User click on terms and condition checkbox value`, async () => {
	const match = {
		params: {
			token: "12132132",
		},
	};

	const item = shallow(<VerifyPage match={match} />).dive();
	const prev_terms_accepted = item.state().terms_accepted;
	const prev_valid = item.state().valid;
	//when user clicks on checkbox then handleCheckBoxChange function callled
	item.instance().handleCheckBoxChange("terms_accepted", true, true);
	await wait(30);
	item.update();
	item.instance().forceUpdate();
	const new_terms_accepted = item.state().terms_accepted;
	const new_valid = item.state().valid;

	expect(prev_terms_accepted).not.toBe(new_terms_accepted);
	expect(prev_valid).not.toBe(new_valid);
	expect(item.state().message.props.children).toBe("Sorry, something has gone wrong. Are you sure you've followed the link correctly?");
});

/** User clicks on submit button without checks terms and condition checkbox */
test(`User clicks on submit button without checks terms and condition checkbox`, async () => {
	const match = {
		params: {
			token: "12132132",
		},
	};

	const item = shallow(<VerifyPage match={match} />).dive();
	const form = item.find("FormWrap");
	await wait(20);
	form.simulate("submit", {
		preventDefault: jest.fn(),
	});

	await wait(10);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().valid.terms_accepted.isValid).toBe(false);
	expect(item.state().messageType).toBe(messageType.error);
});

/** When component will unmount and clear timeout*/
test(`When component will unmount and clear timeout`, async () => {
	const match = {
		params: {
			token: "12132132",
		},
	};

	async function api(endpoint, data = null) {
		if (endpoint === "/auth/verify") {
			return {
				result: true,
			};
		}
	}

	const item = shallow(<VerifyPage match={match} api={api} />).dive();
	const form = item.find("FormWrap");

	item.setState({ terms_accepted: true });
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
		if (endpoint === "/auth/verify") {
			return {
				result: true,
			};
		}
	}

	const item = shallow(<VerifyPage match={match} api={api} />).dive();

	await wait(100);
	const componentWillUnmount = jest.spyOn(item.instance(), "componentWillUnmount");

	await wait(20);
	item.instance().checkVerifyStatus();
	item.instance().doVerify();
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
		if (endpoint === "/auth/verify") {
			return {
				result: true,
			};
		}
	}

	const item = shallow(<VerifyPage match={match} api={api} />).dive();
	item.setProps({ match: { params: { token: "22132132" } } });
	await wait(20);

	expect(item.state("message")).toEqual(null);
});

/** User get message for generate resend veification link */
test("User get message for generate resend veification link", async () => {
	const match = {
		params: {
			token: "12132132",
		},
	};

	async function api(endpoint, data = null) {
		if (endpoint === "/auth/verify") {
			throw "Token Expired";
		} else if (endpoint === "/auth/user-resend-registration") {
			return { result: true };
		}
	}

	const item = shallow(<VerifyPage match={match} api={api} />).dive();
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

/** User get message for generate resend veification link */
test("User get message for generate resend veification link", async () => {
	const match = {
		params: {
			token: "12132132",
		},
	};

	async function api(endpoint, data = null) {
		if (endpoint === "/auth/verify") {
			throw "Token NonExistent";
		} else if (endpoint === "/auth/user-resend-registration") {
			return { result: true };
		}
	}

	const item = shallow(<VerifyPage match={match} api={api} />).dive();
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
	const item = shallow(<VerifyPage match={match} api={api} />).dive();
	item.instance()._isMounted = false;
	item.instance().doVerify();
	item.instance().doResendVerify();
});

test("Clicked on doVerify and get error", async () => {
	const match = {
		params: {
			token: "12132132",
		},
	};
	async function api(endpoint, data = null) {
		if (endpoint === "/auth/user-resend-registration") {
			return false;
		}
	}
	const item = shallow(<VerifyPage match={match} api={api} />).dive();
	item.instance().doVerify();
	item.instance().doResendVerify();
	expect(item.state("message")).not.toEqual(null);
	expect(item.state("messageType")).toEqual(messageType.error);
});
