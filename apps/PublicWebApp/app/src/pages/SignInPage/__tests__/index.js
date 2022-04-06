// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import SignInPage from "../index";
import Header from "../../../widgets/Header";
import { faArrowAltCircleDown } from "@fortawesome/free-solid-svg-icons";

/**
 * This 'HOC' does nothing but 'pass through' the provided component,
 * so it's not necessary to 'dive()' into rendered results,
 * and so it's possible to mock the 'api' function.
 **/
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

// Mock import
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAuthConsumer", () => mockPassthruHoc);

// Mock asset imports
jest.mock("../../../widgets/PageWrap/images/Sign_in_Shape_1.svg", () => jest.fn());
jest.mock("../../../widgets/PageWrap/images/Sign_in_Shape_2.svg", () => jest.fn());
jest.mock("../../../assets/images/Hero_image_mobile.jpg", () => jest.fn());
jest.mock("../../../assets/images/Hero_image_Desktop.jpg", () => jest.fn());
jest.mock("../../../assets/icons/Play_video.png", () => jest.fn());
jest.mock("../../../assets/images/rhema-kallianpur-471933-unsplash.jpg", () => jest.fn());
jest.mock("../../../assets/images/Unlock_book_instruction.png", () => jest.fn());

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

function auth() {
	return function () {
		return new Promise((resolve, reject) => {
			resolve(mockMessage);
		});
	};
}

let api;
let mockMessage;

let mockUserData = {
	data: {
		first_name: "Test",
		last_name: "Surname",
		role: "teacher",
		school: null,
	},
};

/**
 * Reset function
 */
function resetAll() {
	api = null;
	mockMessage = null;
	// jest.resetModules();
}

beforeEach(resetAll);
afterEach(resetAll);

test("Module renders correctly", async () => {
	const item = shallow(<SignInPage location={{ state: null }} />);

	await wait(50);

	expect(item.find(Header).length).toBe(1);
});

test("User attempts to login", async () => {
	const mockAuth = auth();
	const item = shallow(<SignInPage location={{ state: null }} withAuthConsumer_attemptAuth={mockAuth} />);

	await wait(50);

	const email = item.find('[name="email"]');
	const password = item.find('[name="password"]');
	const form = item.find("SignInForm");

	email.simulate("change", {
		preventDefault: jest.fn(),
		target: {
			value: "admin@email.com",
		},
	});

	password.simulate("change", {
		preventDefault: jest.fn(),
		target: {
			value: "123456",
		},
	});

	form.simulate("submit", {
		preventDefault: jest.fn(),
		target: {
			elements: {
				email: {
					value: "admin@email.com",
				},
				password: {
					value: "123456",
				},
			},
		},
	});

	await wait(50);

	expect(item.state().message).toEqual(null);
});

test("User is redirected if they are logged in successfully", async () => {
	const item = shallow(<SignInPage withAuthConsumer_myUserDetails={mockUserData} location={{ state: {} }} />);

	await wait(50);
	item.instance().forceUpdate();
	expect(item.is("Redirect")).toEqual(true);
});

/** Error message extis appears to MessageBox component */
test("Message is shown when an error occurs", async () => {
	const item = shallow(<SignInPage withAuthConsumer_lastError={"Error"} location={{ state: {} }} />);

	await wait(50);
	item.setState({ message: "Error" });
	expect(item.find("MessageBox").length).toBe(1);
});

/** Get Validation message when user not enter valid email  */
test(`Get Validation message when user not enter valid email `, async () => {
	const mockAuth = auth();
	const item = shallow(<SignInPage location={{ state: null }} withAuthConsumer_attemptAuth={mockAuth} />);

	item.setState({
		valid: {
			email: { isValid: false, message: "" },
			password: { isValid: true, message: "" },
		},
	});

	await wait(50);
	item.update();

	const result = item.instance().isFormValid();
	await wait(10);
	expect(result.status).toBe(false);
	expect(result.message).toBe(`Please ensure all fields are filled correctly.`);
});

/** Get Validation message when user not enter valid password */
test(`Get Validation message when user not enter valid password`, async () => {
	const mockAuth = auth();
	const item = shallow(<SignInPage location={{ state: null }} withAuthConsumer_attemptAuth={mockAuth} />);

	item.setState({
		valid: {
			email: { isValid: true, message: "" },
			password: { isValid: false, message: "" },
		},
	});

	await wait(50);
	item.update();
	item.instance().submitFormRequest();
	const result = item.instance().isFormValid();
	await wait(10);
	expect(result.status).toBe(false);
	expect(result.message).toBe(`Please ensure all fields are filled correctly.`);
});

/** Redirect to previous url when user already login and try to open 'SignInPage' page again */
test(`Redirect to previous url when user already login and try to open 'SignInPage' page again `, async () => {
	const item = shallow(<SignInPage location={{ state: { from: "/" } }} withAuthConsumer_myUserDetails={mockUserData} />);
	await wait(50);
	item.update();
	expect(item.find("Redirect").length).toBe(1);
	expect(item.props("to")).toEqual({ to: "/" });
});

/**  If there is no logged in user */
test(`If there is no logged in user`, async () => {
	const item = shallow(
		<SignInPage location={{ state: { from: "/about" } }} withAuthConsumer_myUserDetails={null} withAuthConsumer_lastError={null} />
	);
	item.setState({ back_url: "/profile" });
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().message).toEqual("You must be logged in to access that page.");
});

/** When component will unmount is call and clear timeout*/
test(`When component will unmount is call and clear timeout`, async () => {
	const mockAuth = auth();
	const item = shallow(<SignInPage location={{ state: null }} withAuthConsumer_attemptAuth={mockAuth} />);

	const form = item.find("SignInForm");

	form.simulate("submit", {
		preventDefault: jest.fn(),
		target: {
			elements: {
				email: {
					value: "admin@email.com",
				},
				password: {
					value: "123456",
				},
			},
		},
	});

	await wait(100);
	const componentWillUnmount = jest.spyOn(item.instance(), "componentWillUnmount");
	await wait(20);
	item.unmount();
	expect(componentWillUnmount).toHaveBeenCalled();
});

test(`User get an error when server is down`, async () => {
	mockMessage = "timeout";
	const mockAuth = auth();
	const item = shallow(<SignInPage location={{ state: null }} withAuthConsumer_attemptAuth={mockAuth} />);

	await wait(50);

	const email = item.find('[name="email"]');
	const password = item.find('[name="password"]');
	const form = item.find("SignInForm");

	email.simulate("change", {
		preventDefault: jest.fn(),
		target: {
			value: "admin@email.com",
		},
	});

	password.simulate("change", {
		preventDefault: jest.fn(),
		target: {
			value: "123456",
		},
	});

	form.simulate("submit", {
		preventDefault: jest.fn(),
		target: {
			elements: {
				email: {
					value: "admin@email.com",
				},
				password: {
					value: "123456",
				},
			},
		},
	});

	await wait(50);

	expect(item.state().message).toEqual("timeout");
	expect(item.find("MessageBox").length).toBe(1);
	expect(
		item
			.find("MessageBox")
			.children()
			.debug()
			.indexOf("We're sorry, we&#39;re having some trouble with our systems at the moment. Please try again later.")
	).not.toBe(-1);
});

test(`Test componentDidUpdate method`, async () => {
	let prevProps = {
		breakpoint: 20,
	};
	const item = shallow(<SignInPage location={{ state: null }} withAuthConsumer_myUserDetails={mockUserData} />);
	item.instance().componentDidUpdate(prevProps);
	await wait(50);
	expect(item.state("redirect_url")).toBe("/");
});

test("Module renders correctly with back url", async () => {
	const item = shallow(<SignInPage location={{ search: "backurl=%2Fworks%2F9781911208624%2Fextract" }} />);
	await wait(50);
	expect(item.find(Header).length).toBe(1);
});

test("Module renders correctly with back url that not matches with '/profile' or '/^/works/[^/]+/extract$/'", async () => {
	const item = shallow(<SignInPage location={{ search: "backurl=/test/url" }} />);
	await wait(50);
	expect(item.find(Header).length).toBe(1);
});

test("Component redirects successfully when user logged in", async () => {
	const item = shallow(<SignInPage withAuthConsumer_myUserDetails={mockUserData} location={{ search: "backurl=/test/url" }} />);
	await wait(50);
	const redirectComponent = item.find("Redirect");
	expect(redirectComponent.length).toBe(1);
	expect(redirectComponent.props().to).toBe("/test/url");
});
