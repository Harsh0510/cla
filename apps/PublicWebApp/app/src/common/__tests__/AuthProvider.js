import React from "react";
import AuthProvider from "../AuthProvider";
import { shallow, mount } from "enzyme";
import MockUser from "../../mocks/MockUser";

// function mockPassthruHoc(WrappedComponent) {
// 	return WrappedComponent;
// }
//jest.mock('../api', () => mockPassthruHoc);
/**local object */
let mockUserData,
	children,
	session_token,
	mockApiResponseError = false,
	mockFunction,
	mockClearAllCaled = false,
	mockApiRedirectUrl;

jest.mock("../cacher", () => {
	return {
		clearAll: () => {
			mockClearAllCaled = true;
		},
	};
});
jest.mock("../googleEvent", () => {
	return jest.fn();
});

jest.mock("../api", () => {
	return function (endpoint, data) {
		//return myApi;
		return new Promise((resolve, reject) => {
			if (endpoint === "/auth/login") {
				if (mockApiResponseError) {
					reject("Unknown Error");
				}
				resolve({ my_details: mockUserData });
			}
			if (endpoint === "/auth/get-my-details") {
				if (mockApiResponseError) {
					reject("Unknown Error");
				}
				resolve({ data: mockUserData });
			}
			if (endpoint === "/auth/logout") {
				if (mockApiResponseError) {
					reject("Unknown Error");
				}
				resolve(mockApiRedirectUrl);
			}
		});
	};
});

/** Reset function */
function resetAll() {
	mockClearAllCaled = false;
	mockFunction = jest.fn();
	mockUserData = MockUser[0];
	children = "";
	session_token = "12321354654654654";
	mockApiResponseError = false;
	mockApiRedirectUrl = {
		redirectUrl: null,
	};
	//myApi= defaultApi;
}

beforeEach(resetAll);
afterEach(resetAll);

/** wait function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/**LocalStorage mock */
class LocalStorageMock {
	constructor() {
		this.store = {};
	}

	clear() {
		this.store = {};
	}

	getItem(key) {
		return this.store[key] || null;
	}

	setItem(key, value) {
		this.store[key] = value.toString();
	}

	removeItem(key) {
		delete this.store[key];
	}
}

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<AuthProvider children={children} />);

	await wait(50);
	item.update();

	expect(item.find("ContextProvider").length).toBe(1);
});

/** User logout */
test("User logout ", async () => {
	global.localStorage = new LocalStorageMock();
	global.localStorage.setItem("sessId", session_token);

	const item = shallow(<AuthProvider children={children} />);

	await wait(50);
	item.update();

	item.instance().logout();
	await wait(50);
	let myUserDetails = item.state().myUserDetails;
	let inited = item.state().inited;

	expect(myUserDetails).toEqual(null);
	expect(inited).toEqual(true);
});

/** User attempt for authorization */
test("User attempt for authorization", async () => {
	const item = shallow(<AuthProvider children={children} />);

	await wait(50);
	item.update();

	item.instance().attemptAuth("test@email.com", "12356");

	await wait(50);
	item.update();

	let myUserDetails = item.state().myUserDetails;
	expect(Object.keys(myUserDetails).length).toEqual(18);
});

test("User attempt for authorization and getting an unknow error", async () => {
	mockApiResponseError = true;
	const item = shallow(<AuthProvider children={children} />);

	await wait(50);
	item.update();

	item.instance().attemptAuth("test@email.com", "12356");

	await wait(50);
	item.update();

	let myUserDetails = item.state().myUserDetails;
	expect(myUserDetails).toEqual(null);
	expect(mockClearAllCaled).toEqual(true);
});

test("User change during reauth error", async () => {
	mockApiResponseError = true;

	const item = shallow(<AuthProvider children={children} />);

	await wait(50);
	item.update();
	item.setState({
		myUserDetails: {
			email: "foo@bar.com",
			school: "xxx",
		},
	});
	await wait(50);

	item.instance().attemptReauth();

	await wait(50);
	item.update();

	expect(mockClearAllCaled).toBe(true);
});

test("User logout and redirect to location based on result", async () => {
	mockApiRedirectUrl = { redirectUrl: "/dummy/url" };
	global.localStorage = new LocalStorageMock();
	global.localStorage.setItem("sessId", session_token);
	global.window = Object.create(window);

	Object.defineProperty(window, "location", {
		value: {
			href: "",
		},
	});
	const item = shallow(<AuthProvider children={children} />);

	await wait(50);
	item.update();

	item.instance().logout();
	await wait(50);
	expect(window.location.href).toEqual(mockApiRedirectUrl.redirectUrl);
});
